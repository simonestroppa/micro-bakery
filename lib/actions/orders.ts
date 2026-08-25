"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/db";
import { orderItems, orderStatuses, orders, products, type OrderStatus } from "@/db/schema";
import { getAdminSession } from "@/lib/session";
import { notifyNewOrder } from "@/lib/notify";
import { orderFormSchema } from "@/lib/validation";

export type OrderFormState = { error?: string; success?: boolean } | undefined;

export async function createOrder(
  _prevState: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const rawItems = formData.get("items");
  let items: unknown = [];
  try {
    items = JSON.parse(typeof rawItems === "string" ? rawItems : "[]");
  } catch {
    return { error: "Carrello non valido." };
  }

  const parsed = orderFormSchema.safeParse({
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    fulfillment: formData.get("fulfillment"),
    address: formData.get("address") ?? "",
    requestedFor: formData.get("requestedFor"),
    notes: formData.get("notes") ?? "",
    items,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const data = parsed.data;

  await ensureSchema();

  const productIds = data.items.map((item) => item.productId);
  const availableProducts = await db
    .select()
    .from(products)
    .where(eq(products.active, true));
  const productMap = new Map(availableProducts.map((p) => [p.id, p]));

  const lineItems = data.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Prodotto non disponibile (id ${item.productId})`);
    }
    return {
      productId: product.id,
      productName: product.name,
      unitPriceCents: product.priceCents,
      quantity: item.quantity,
    };
  });

  if (lineItems.length === 0 || productIds.length !== lineItems.length) {
    return { error: "Uno o più prodotti nel carrello non sono più disponibili." };
  }

  const totalCents = lineItems.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0
  );

  const [order] = await db
    .insert(orders)
    .values({
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || null,
      fulfillment: data.fulfillment,
      address: data.fulfillment === "consegna" ? data.address ?? null : null,
      requestedFor: new Date(data.requestedFor),
      notes: data.notes || null,
      totalCents,
    })
    .returning();

  await db.insert(orderItems).values(
    lineItems.map((item) => ({ ...item, orderId: order.id }))
  );

  revalidatePath("/admin/ordini");

  await notifyNewOrder({
    id: order.id,
    customerName: order.customerName,
    phone: order.phone,
    fulfillment: order.fulfillment,
    requestedFor: order.requestedFor,
    totalCents: order.totalCents,
    items: lineItems,
  });

  return { success: true };
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  if (!(await getAdminSession())) {
    throw new Error("Non autenticato.");
  }
  if (!orderStatuses.includes(status)) {
    throw new Error("Stato non valido.");
  }

  await ensureSchema();
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  revalidatePath("/admin/ordini");
}
