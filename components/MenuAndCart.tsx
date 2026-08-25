"use client";

import { useActionState, useMemo, useState } from "react";
import { createOrder, type OrderFormState } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/format";

type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  imageUrl: string | null;
};

type Props = {
  productsByCategory: [string, Product[]][];
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  minDateTime: string;
};

type CartLine = { product: Product; quantity: number };

export default function MenuAndCart({
  productsByCategory,
  pickupEnabled,
  deliveryEnabled,
  minDateTime,
}: Props) {
  const [cart, setCart] = useState<Map<number, CartLine>>(new Map());
  const [state, formAction, pending] = useActionState<OrderFormState, FormData>(
    createOrder,
    undefined
  );

  const defaultFulfillment = pickupEnabled ? "ritiro" : "consegna";

  const cartLines = useMemo(() => Array.from(cart.values()), [cart]);
  const total = cartLines.reduce(
    (sum, line) => sum + line.product.priceCents * line.quantity,
    0
  );

  function addToCart(product: Product) {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(product.id);
      next.set(product.id, {
        product,
        quantity: (existing?.quantity ?? 0) + 1,
      });
      return next;
    });
  }

  function changeQuantity(productId: number, delta: number) {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(productId);
      if (!existing) return prev;
      const quantity = existing.quantity + delta;
      if (quantity <= 0) {
        next.delete(productId);
      } else {
        next.set(productId, { ...existing, quantity });
      }
      return next;
    });
  }

  const itemsJson = JSON.stringify(
    cartLines.map((line) => ({
      productId: line.product.id,
      quantity: line.quantity,
    }))
  );

  if (state?.success) {
    return (
      <div className="mx-auto max-w-md rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--color-primary-dark)]">
          Ordine ricevuto!
        </h2>
        <p className="mt-2 text-[var(--color-muted)]">
          Grazie, ti contatteremo a breve per confermare i dettagli.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-10">
        {productsByCategory.length === 0 && (
          <p className="text-[var(--color-muted)]">
            Il menu non è ancora disponibile. Torna a trovarci presto.
          </p>
        )}
        {productsByCategory.map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-primary-dark)]">
              {category}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((product) => (
                <article
                  key={product.id}
                  className="flex flex-col justify-between rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                >
                  <div>
                    {product.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="mb-3 h-32 w-full rounded-md object-cover"
                      />
                    )}
                    <h3 className="font-medium">{product.name}</h3>
                    {product.description && (
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold text-[var(--color-primary)]">
                      {formatPrice(product.priceCents)}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
                    >
                      Aggiungi
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <aside className="h-fit space-y-4 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:sticky lg:top-6">
        <h2 className="text-lg font-semibold">Il tuo ordine</h2>

        {cartLines.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Il carrello è vuoto.</p>
        ) : (
          <ul className="space-y-2">
            {cartLines.map((line) => (
              <li key={line.product.id} className="flex items-center justify-between text-sm">
                <span>{line.product.name}</span>
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeQuantity(line.product.id, -1)}
                    className="rounded-full border border-[var(--color-border)] px-2"
                    aria-label={`Rimuovi ${line.product.name}`}
                  >
                    -
                  </button>
                  {line.quantity}
                  <button
                    type="button"
                    onClick={() => changeQuantity(line.product.id, 1)}
                    className="rounded-full border border-[var(--color-border)] px-2"
                    aria-label={`Aggiungi ${line.product.name}`}
                  >
                    +
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3 font-semibold">
          <span>Totale</span>
          <span>{formatPrice(total)}</span>
        </div>

        {cartLines.length > 0 && (
          <form action={formAction} className="space-y-3 border-t border-[var(--color-border)] pt-4">
            <input type="hidden" name="items" value={itemsJson} />

            <div>
              <label className="block text-sm font-medium">Nome e cognome</label>
              <input
                name="customerName"
                required
                className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Telefono</label>
              <input
                name="phone"
                required
                className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Email (facoltativa)</label>
              <input
                name="email"
                type="email"
                className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>

            {pickupEnabled && deliveryEnabled ? (
              <div>
                <label className="block text-sm font-medium">Modalità</label>
                <select
                  name="fulfillment"
                  defaultValue={defaultFulfillment}
                  className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
                >
                  <option value="ritiro">Ritiro in negozio</option>
                  <option value="consegna">Consegna a domicilio</option>
                </select>
              </div>
            ) : (
              <input type="hidden" name="fulfillment" value={defaultFulfillment} />
            )}

            <div>
              <label className="block text-sm font-medium">Indirizzo di consegna</label>
              <input
                name="address"
                className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
                placeholder="Necessario solo per la consegna"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Data e ora</label>
              <input
                name="requestedFor"
                type="datetime-local"
                required
                min={minDateTime}
                defaultValue={minDateTime}
                className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Note (facoltative)</label>
              <textarea
                name="notes"
                rows={2}
                className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-600" role="alert">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-[var(--color-primary)] py-2 font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
            >
              {pending ? "Invio in corso..." : "Invia ordine"}
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}
