"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, ensureSchema } from "@/db";
import { products } from "@/db/schema";
import { getAdminSession } from "@/lib/session";
import { productFormSchema } from "@/lib/validation";

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

function parseProductForm(formData: FormData) {
  return productFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    category: formData.get("category"),
    priceCents: Math.round(Number(formData.get("price")) * 100),
    active: formData.get("active") === "on",
  });
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  if (!(await getAdminSession())) redirect("/admin/login");

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  await ensureSchema();
  await db.insert(products).values(parsed.data);
  revalidatePath("/admin/prodotti");
  revalidatePath("/");
  redirect("/admin/prodotti");
}

export async function updateProduct(
  id: number,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  if (!(await getAdminSession())) redirect("/admin/login");

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  await ensureSchema();
  await db.update(products).set(parsed.data).where(eq(products.id, id));
  revalidatePath("/admin/prodotti");
  revalidatePath("/");
  redirect("/admin/prodotti");
}

export async function deleteProduct(id: number) {
  if (!(await getAdminSession())) redirect("/admin/login");

  await ensureSchema();
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/prodotti");
  revalidatePath("/");
}

export async function toggleProductActive(id: number, active: boolean) {
  if (!(await getAdminSession())) redirect("/admin/login");

  await ensureSchema();
  await db.update(products).set({ active }).where(eq(products.id, id));
  revalidatePath("/admin/prodotti");
  revalidatePath("/");
}
