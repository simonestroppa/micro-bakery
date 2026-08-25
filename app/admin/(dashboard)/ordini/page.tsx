import { desc } from "drizzle-orm";
import { db, ensureSchema } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { formatDateTime, formatPrice } from "@/lib/format";
import OrderStatusSelect from "@/components/OrderStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await ensureSchema();
  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  const items = allOrders.length
    ? await db.select().from(orderItems)
    : [];
  const itemsByOrder = new Map<number, typeof items>();
  for (const item of items) {
    const list = itemsByOrder.get(item.orderId) ?? [];
    list.push(item);
    itemsByOrder.set(item.orderId, list);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">Ordini</h1>

      {allOrders.length === 0 ? (
        <p className="text-[var(--color-muted)]">Nessun ordine ricevuto finora.</p>
      ) : (
        <ul className="space-y-4">
          {allOrders.map((order) => (
            <li
              key={order.id}
              className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    #{order.id} - {order.customerName}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {order.phone}
                    {order.email ? ` - ${order.email}` : ""}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {order.fulfillment === "ritiro" ? "Ritiro" : "Consegna"} per{" "}
                    {formatDateTime(order.requestedFor)}
                    {order.address ? ` - ${order.address}` : ""}
                  </p>
                  {order.notes && (
                    <p className="mt-1 text-sm italic text-[var(--color-muted)]">
                      Note: {order.notes}
                    </p>
                  )}
                </div>
                <OrderStatusSelect orderId={order.id} status={order.status} />
              </div>

              <ul className="mt-3 space-y-1 border-t border-[var(--color-border)] pt-3 text-sm">
                {(itemsByOrder.get(order.id) ?? []).map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span>{formatPrice(item.unitPriceCents * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex justify-end border-t border-[var(--color-border)] pt-2 font-semibold">
                Totale: {formatPrice(order.totalCents)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
