import * as z from "zod";
import { fulfillmentTypes } from "@/db/schema";

export const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99),
});

export const orderFormSchema = z
  .object({
    customerName: z.string().trim().min(2, { error: "Inserisci il tuo nome." }),
    phone: z.string().trim().min(6, { error: "Inserisci un numero di telefono valido." }),
    email: z.union([z.email({ error: "Email non valida." }), z.literal("")]).optional(),
    fulfillment: z.enum(fulfillmentTypes, {
      error: "Scegli ritiro o consegna.",
    }),
    address: z.string().trim().optional(),
    requestedFor: z.string().min(1, { error: "Scegli data e ora." }),
    notes: z.string().trim().optional(),
    items: z.array(orderItemSchema).min(1, { error: "Il carrello è vuoto." }),
  })
  .refine(
    (data) => data.fulfillment !== "consegna" || (data.address && data.address.length > 3),
    { error: "Inserisci un indirizzo di consegna.", path: ["address"] }
  );

export type OrderFormInput = z.infer<typeof orderFormSchema>;

export const productFormSchema = z.object({
  name: z.string().trim().min(2, { error: "Il nome è obbligatorio." }),
  description: z.string().trim().optional(),
  category: z.string().trim().min(2, { error: "La categoria è obbligatoria." }),
  priceCents: z.number().int().positive({ error: "Il prezzo deve essere maggiore di zero." }),
  active: z.boolean(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

export const settingsFormSchema = z.object({
  bakeryName: z.string().trim().min(1, { error: "Il nome è obbligatorio." }),
  pickupEnabled: z.boolean(),
  deliveryEnabled: z.boolean(),
  minNoticeMinutes: z.number().int().min(0),
});

export type SettingsFormInput = z.infer<typeof settingsFormSchema>;
