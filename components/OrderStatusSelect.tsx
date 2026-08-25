"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";
import { orderStatuses, type OrderStatus } from "@/db/schema";

const STATUS_LABELS: Record<OrderStatus, string> = {
  nuovo: "Nuovo",
  confermato: "Confermato",
  pronto: "Pronto",
  completato: "Completato",
  annullato: "Annullato",
};

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: number;
  status: OrderStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(event) => {
        const next = event.target.value as OrderStatus;
        startTransition(() => {
          updateOrderStatus(orderId, next);
        });
      }}
      className="rounded-md border border-[var(--color-border)] px-2 py-1 text-sm disabled:opacity-60"
    >
      {orderStatuses.map((value) => (
        <option key={value} value={value}>
          {STATUS_LABELS[value]}
        </option>
      ))}
    </select>
  );
}
