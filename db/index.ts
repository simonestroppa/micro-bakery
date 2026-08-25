import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS products (
    id serial PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL DEFAULT '',
    category text NOT NULL,
    price_cents integer NOT NULL,
    active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS settings (
    id integer PRIMARY KEY DEFAULT 1,
    bakery_name text NOT NULL DEFAULT 'La Mia Micro Bakery',
    pickup_enabled boolean NOT NULL DEFAULT true,
    delivery_enabled boolean NOT NULL DEFAULT true,
    min_notice_minutes integer NOT NULL DEFAULT 60,
    updated_at timestamp NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS orders (
    id serial PRIMARY KEY,
    customer_name text NOT NULL,
    phone text NOT NULL,
    email text,
    fulfillment text NOT NULL,
    address text,
    requested_for timestamp NOT NULL,
    notes text,
    status text NOT NULL DEFAULT 'nuovo',
    total_cents integer NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id serial PRIMARY KEY,
    order_id integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id integer REFERENCES products(id) ON DELETE SET NULL,
    product_name text NOT NULL,
    unit_price_cents integer NOT NULL,
    quantity integer NOT NULL
  );

  INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
`;

let schemaReady: Promise<void> | null = null;

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = pool.query(SCHEMA_SQL).then(() => undefined);
  }
  return schemaReady;
}
