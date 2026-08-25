import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: process.env.BAKERY_NAME || "La Mia Micro Bakery",
  description: "Ordina online: ritiro o consegna a domicilio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
