import { asc, eq } from "drizzle-orm";
import { db, ensureSchema } from "@/db";
import { products } from "@/db/schema";
import { getStoreSettings } from "@/lib/settings";
import { minAllowedDateTime } from "@/lib/format";
import MenuAndCart from "@/components/MenuAndCart";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSchema();
  const [activeProducts, settings] = await Promise.all([
    db
      .select()
      .from(products)
      .where(eq(products.active, true))
      .orderBy(asc(products.category), asc(products.sortOrder), asc(products.name)),
    getStoreSettings(),
  ]);

  const productsByCategory = new Map<string, typeof activeProducts>();
  for (const product of activeProducts) {
    const list = productsByCategory.get(product.category) ?? [];
    list.push(product);
    productsByCategory.set(product.category, list);
  }

  return (
    <main>
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-10 text-center">
        <h1 className="text-3xl font-bold text-[var(--color-primary-dark)]">
          {settings.bakeryName}
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Scegli i tuoi prodotti preferiti e ordina per ritiro o consegna.
        </p>
      </header>
      <MenuAndCart
        productsByCategory={Array.from(productsByCategory.entries())}
        pickupEnabled={settings.pickupEnabled}
        deliveryEnabled={settings.deliveryEnabled}
        minDateTime={minAllowedDateTime(settings.minNoticeMinutes)}
      />
    </main>
  );
}
