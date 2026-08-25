import "server-only";

type NewOrderNotification = {
  id: number;
  customerName: string;
  phone: string;
  fulfillment: string;
  requestedFor: Date;
  totalCents: number;
  items: { productName: string; quantity: number }[];
};

function formatOrderSummary(order: NewOrderNotification) {
  const itemsText = order.items
    .map((item) => `- ${item.quantity}x ${item.productName}`)
    .join("\n");
  const total = (order.totalCents / 100).toFixed(2);
  const when = order.requestedFor.toLocaleString("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return `Nuovo ordine #${order.id}
Cliente: ${order.customerName} (${order.phone})
Modalita': ${order.fulfillment}
Per: ${when}
Totale: EUR ${total}

${itemsText}`;
}

async function sendEmailNotification(order: NewOrderNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !to || !from) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Nuovo ordine #${order.id}`,
        text: formatOrderSummary(order),
      }),
    });
  } catch (error) {
    console.error("Invio email notifica ordine fallito", error);
  }
}

async function sendWhatsAppNotification(order: NewOrderNotification) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.NOTIFY_WHATSAPP_TO;
  if (!accountSid || !authToken || !from || !to) return;

  try {
    const body = new URLSearchParams({
      From: from,
      To: to,
      Body: formatOrderSummary(order),
    });

    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );
  } catch (error) {
    console.error("Invio notifica WhatsApp ordine fallito", error);
  }
}

export async function notifyNewOrder(order: NewOrderNotification) {
  await Promise.all([
    sendEmailNotification(order),
    sendWhatsAppNotification(order),
  ]);
}
