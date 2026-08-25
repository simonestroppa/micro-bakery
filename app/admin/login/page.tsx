"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/actions/auth";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    undefined
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-4 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-[var(--color-primary-dark)]">
          Accesso pannello admin
        </h1>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            required
            autoFocus
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
          {pending ? "Accesso in corso..." : "Accedi"}
        </button>
      </form>
    </main>
  );
}
