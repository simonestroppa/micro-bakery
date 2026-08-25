import { asc } from "drizzle-orm";
import Link from "next/link";
import { db, ensureSchema } from "@/db";
import { products } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { createProduct, deleteProduct } from "@/lib/actions/products";
import ProductForm from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await ensureSchema();
  const allProducts = await db
    .select()
    .from(products)
    .orderBy(asc(products.category), asc(products.name));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">Prodotti</h1>

      <section className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-3 text-lg font-medium">Nuovo prodotto</h2>
        <ProductForm action={createProduct} submitLabel="Aggiungi prodotto" />
      </section>

      <section className="space-y-2">
        {allProducts.length === 0 ? (
          <p className="text-[var(--color-muted)]">Nessun prodotto ancora, aggiungine uno qui sopra.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            {allProducts.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="h-10 w-10 rounded-md border border-[var(--color-border)] object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md border border-dashed border-[var(--color-border)]" />
                  )}
                  <div>
                    <p className="font-medium">
                      {product.name}{" "}
                      {!product.active && (
                        <span className="ml-2 rounded-full bg-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-muted)]">
                          nascosto
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      {product.category} - {formatPrice(product.priceCents)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Link
                    href={`/admin/prodotti/${product.id}`}
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    Modifica
                  </Link>
                  <form action={deleteProduct.bind(null, product.id)}>
                    <button type="submit" className="text-red-600 hover:underline">
                      Elimina
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
