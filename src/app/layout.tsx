import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClinicYield — Gestione Finanziaria Poliambulatorio",
  description: "Sistema di gestione finanziaria e fatturazione per poliambulatori medici",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
