import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL non impostata. Copia .env.example in .env e configurala.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SAMPLE_PRODUCTS = [
  { name: "Pane casereccio", description: "Lievitazione naturale, 500g", category: "Pane", priceCents: 350 },
  { name: "Baguette", description: "", category: "Pane", priceCents: 200 },
  { name: "Cornetto vuoto", description: "", category: "Dolci", priceCents: 150 },
  { name: "Cornetto alla crema", description: "", category: "Dolci", priceCents: 180 },
  { name: "Torta della casa", description: "Fetta singola", category: "Dolci", priceCents: 300 },
  { name: "Acqua naturale 0.5L", description: "", category: "Bevande", priceCents: 100 },
];

async function main() {
  await pool.query(`
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
  `);

  const { rows } = await pool.query("SELECT count(*)::int AS count FROM products");
  if (rows[0].count > 0) {
    console.log("La tabella prodotti contiene gia' dei dati, seed saltato.");
    await pool.end();
    return;
  }

  for (const product of SAMPLE_PRODUCTS) {
    await pool.query(
      "INSERT INTO products (name, description, category, price_cents) VALUES ($1, $2, $3, $4)",
      [product.name, product.description, product.category, product.priceCents]
    );
  }

  console.log(`Aggiunti ${SAMPLE_PRODUCTS.length} prodotti di esempio.`);
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
