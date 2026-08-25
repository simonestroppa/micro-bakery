"use client";

import { useActionState } from "react";
import { updateSettings, type SettingsFormState } from "@/lib/actions/settings";
import type { StoreSettings } from "@/lib/settings";

export default function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(
    updateSettings,
    undefined
  );

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium">Nome del negozio</label>
        <input
          name="bakeryName"
          required
          defaultValue={settings.bakeryName}
          className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="pickupEnabled"
          name="pickupEnabled"
          type="checkbox"
          defaultChecked={settings.pickupEnabled}
          className="h-4 w-4"
        />
        <label htmlFor="pickupEnabled" className="text-sm font-medium">
          Ritiro in negozio attivo
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="deliveryEnabled"
          name="deliveryEnabled"
          type="checkbox"
          defaultChecked={settings.deliveryEnabled}
          className="h-4 w-4"
        />
        <label htmlFor="deliveryEnabled" className="text-sm font-medium">
          Consegna a domicilio attiva
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium">Preavviso minimo (minuti)</label>
        <input
          name="minNoticeMinutes"
          type="number"
          min="0"
          step="5"
          required
          defaultValue={settings.minNoticeMinutes}
          className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700" role="status">
          Impostazioni salvate.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
      >
        {pending ? "Salvataggio..." : "Salva impostazioni"}
      </button>
    </form>
  );
}
