import Link from "next/link";
import { logout } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Panoramica" },
  { href: "/admin/ordini", label: "Ordini" },
  { href: "/admin/prodotti", label: "Prodotti" },
  { href: "/admin/impostazioni", label: "Impostazioni" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <nav className="flex gap-4 text-sm font-medium">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[var(--color-text)] hover:text-[var(--color-primary)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)]"
            >
              Esci
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
