import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReceiptsAI — Control de Gastos para Flotillas",
  description:
    "Tus choferes envian fotos de recibos por WhatsApp, ReceiptsAI los procesa automaticamente y el administrador ve todo en un tablero.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
