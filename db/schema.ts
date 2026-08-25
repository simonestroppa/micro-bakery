import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull(),
  priceCents: integer("price_cents").notNull(),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  bakeryName: text("bakery_name").notNull().default("La Mia Micro Bakery"),
  pickupEnabled: boolean("pickup_enabled").notNull().default(true),
  deliveryEnabled: boolean("delivery_enabled").notNull().default(true),
  minNoticeMinutes: integer("min_notice_minutes").notNull().default(60),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderStatuses = [
  "nuovo",
  "confermato",
  "pronto",
  "completato",
  "annullato",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const fulfillmentTypes = ["ritiro", "consegna"] as const;

export type FulfillmentType = (typeof fulfillmentTypes)[number];

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  fulfillment: text("fulfillment").notNull().$type<FulfillmentType>(),
  address: text("address"),
  requestedFor: timestamp("requested_for").notNull(),
  notes: text("notes"),
  status: text("status").notNull().$type<OrderStatus>().default("nuovo"),
  totalCents: integer("total_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  productName: text("product_name").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
});
