import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { db, ensureSchema } from "@/db";
import { orders, products } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await ensureSchema();
  const [newOrdersCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, "nuovo"));

  const [activeProductsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.active, true));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">Panoramica</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/ordini"
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 hover:border-[var(--color-primary)]"
        >
          <p className="text-sm text-[var(--color-muted)]">Nuovi ordini</p>
          <p className="mt-1 text-3xl font-bold">{Number(newOrdersCount?.count ?? 0)}</p>
        </Link>
        <Link
          href="/admin/prodotti"
          className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 hover:border-[var(--color-primary)]"
        >
          <p className="text-sm text-[var(--color-muted)]">Prodotti attivi</p>
          <p className="mt-1 text-3xl font-bold">{Number(activeProductsCount?.count ?? 0)}</p>
        </Link>
      </div>
    </div>
  );
}
