import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Uso: node scripts/hash-password.mjs \"tuaPassword\"");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
