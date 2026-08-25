import { getStoreSettings } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">Impostazioni</h1>
      <section className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <SettingsForm settings={settings} />
      </section>
    </div>
  );
}
