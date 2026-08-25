import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, ensureSchema } from "@/db";
import { products } from "@/db/schema";
import { updateProduct } from "@/lib/actions/products";
import ProductForm from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  await ensureSchema();
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId));

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
        Modifica prodotto
      </h1>

      <section className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <ProductForm
          action={updateProduct.bind(null, productId)}
          product={product}
          submitLabel="Salva modifiche"
        />
      </section>
    </div>
  );
}
