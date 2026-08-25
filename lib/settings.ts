import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";
import { db, ensureSchema } from "@/db";
import { settings } from "@/db/schema";

export type StoreSettings = {
  bakeryName: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  minNoticeMinutes: number;
};

const DEFAULT_SETTINGS: StoreSettings = {
  bakeryName: process.env.BAKERY_NAME || "La Mia Micro Bakery",
  pickupEnabled: true,
  deliveryEnabled: true,
  minNoticeMinutes: 60,
};

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  await ensureSchema();
  const rows = await db.select().from(settings).where(eq(settings.id, 1));
  const row = rows[0];
  if (!row) return DEFAULT_SETTINGS;
  return {
    bakeryName: row.bakeryName,
    pickupEnabled: row.pickupEnabled,
    deliveryEnabled: row.deliveryEnabled,
    minNoticeMinutes: row.minNoticeMinutes,
  };
});
