"use server";

import { randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, ensureSchema } from "@/db";
import { products } from "@/db/schema";
import { getAdminSession } from "@/lib/session";
import { productFormSchema } from "@/lib/validation";

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function parseProductForm(formData: FormData) {
  return productFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    category: formData.get("category"),
    priceCents: Math.round(Number(formData.get("price")) * 100),
    active: formData.get("active") === "on",
  });
}

class ImageUploadError extends Error {}

/** Returns the uploaded image URL, or undefined if no new file was submitted. */
async function uploadProductImage(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return undefined;

  if (!value.type.startsWith("image/")) {
    throw new ImageUploadError("Il file caricato non è un'immagine valida.");
  }
  if (value.size > MAX_IMAGE_BYTES) {
    throw new ImageUploadError("L'immagine è troppo grande (massimo 5MB).");
  }

  const extension = value.name.split(".").pop() || "jpg";
  try {
    const blob = await put(`products/${randomUUID()}.${extension}`, value, {
      access: "public",
    });
    return blob.url;
  } catch (error) {
    console.error("Upload immagine prodotto fallito", error);
    throw new ImageUploadError(
      "Impossibile caricare l'immagine. Controlla che lo storage Vercel Blob sia collegato al progetto (Storage -> il tuo Blob store -> Connect)."
    );
  }
}

async function deleteBlobIfAny(url: string | null | undefined) {
  if (!url) return;
  await del(url).catch(() => {});
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

  let imageUrl: string | undefined;
  try {
    imageUrl = await uploadProductImage(formData.get("image"));
  } catch (error) {
    if (error instanceof ImageUploadError) return { error: error.message };
    throw error;
  }

  await ensureSchema();
  await db.insert(products).values({ ...parsed.data, imageUrl: imageUrl ?? null });
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

  const removeImage = formData.get("removeImage") === "on";
  let imageUrl: string | undefined;
  try {
    imageUrl = await uploadProductImage(formData.get("image"));
  } catch (error) {
    if (error instanceof ImageUploadError) return { error: error.message };
    throw error;
  }

  await ensureSchema();

  if (imageUrl !== undefined || removeImage) {
    const [existing] = await db
      .select({ imageUrl: products.imageUrl })
      .from(products)
      .where(eq(products.id, id));
    await deleteBlobIfAny(existing?.imageUrl);
  }

  await db
    .update(products)
    .set({
      ...parsed.data,
      ...(imageUrl !== undefined
        ? { imageUrl }
        : removeImage
          ? { imageUrl: null }
          : {}),
    })
    .where(eq(products.id, id));

  revalidatePath("/admin/prodotti");
  revalidatePath("/");
  redirect("/admin/prodotti");
}

export async function deleteProduct(id: number) {
  if (!(await getAdminSession())) redirect("/admin/login");

  await ensureSchema();
  const [existing] = await db
    .select({ imageUrl: products.imageUrl })
    .from(products)
    .where(eq(products.id, id));

  await db.delete(products).where(eq(products.id, id));
  await deleteBlobIfAny(existing?.imageUrl);

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
