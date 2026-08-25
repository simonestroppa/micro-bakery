"use server";

import { revalidatePath } from "next/cache";
import { db, ensureSchema } from "@/db";
import { settings } from "@/db/schema";
import { getAdminSession } from "@/lib/session";
import { settingsFormSchema } from "@/lib/validation";

export type SettingsFormState = { error?: string; success?: boolean } | undefined;

export async function updateSettings(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  if (!(await getAdminSession())) {
    return { error: "Sessione scaduta, effettua di nuovo il login." };
  }

  const parsed = settingsFormSchema.safeParse({
    bakeryName: formData.get("bakeryName"),
    pickupEnabled: formData.get("pickupEnabled") === "on",
    deliveryEnabled: formData.get("deliveryEnabled") === "on",
    minNoticeMinutes: Number(formData.get("minNoticeMinutes")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  await ensureSchema();
  await db
    .insert(settings)
    .values({ id: 1, ...parsed.data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settings.id,
      set: { ...parsed.data, updatedAt: new Date() },
    });

  revalidatePath("/admin/impostazioni");
  revalidatePath("/");
  return { success: true };
}
