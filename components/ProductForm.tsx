"use client";

import { useActionState } from "react";
import type { ProductFormState } from "@/lib/actions/products";

type Product = {
  name: string;
  description: string;
  category: string;
  priceCents: number;
  active: boolean;
  imageUrl: string | null;
};

export default function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  product?: Product;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium">Nome</label>
        <input
          name="name"
          required
          defaultValue={product?.name}
          className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Categoria</label>
        <input
          name="category"
          required
          defaultValue={product?.category}
          placeholder="es. Pane, Dolci, Bevande"
          className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Prezzo (EUR)</label>
        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={product ? (product.priceCents / 100).toFixed(2) : undefined}
          className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-end gap-2 pb-1">
        <input
          id="active"
          name="active"
          type="checkbox"
          defaultChecked={product?.active ?? true}
          className="h-4 w-4"
        />
        <label htmlFor="active" className="text-sm font-medium">
          Visibile nel menu
        </label>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium">Descrizione</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={product?.description}
          className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium">Immagine</label>
        {product?.imageUrl && (
          <div className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt=""
              className="h-16 w-16 rounded-md border border-[var(--color-border)] object-cover"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="removeImage" className="h-4 w-4" />
              Rimuovi immagine attuale
            </label>
          </div>
        )}
        <input
          name="image"
          type="file"
          accept="image/*"
          className="mt-2 w-full text-sm"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 sm:col-span-2" role="alert">
          {state.error}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
        >
          {pending ? "Salvataggio..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
