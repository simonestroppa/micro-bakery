"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get("password");
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!passwordHash) {
    return {
      error:
        "ADMIN_PASSWORD_HASH non configurato. Genera una password con: node scripts/hash-password.mjs",
    };
  }

  if (typeof password !== "string" || password.length === 0) {
    return { error: "Inserisci la password." };
  }

  const valid = await bcrypt.compare(password, passwordHash);
  if (!valid) {
    return { error: "Password non corretta." };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logout() {
  await destroyAdminSession();
  redirect("/admin/login");
}
