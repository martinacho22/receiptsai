import type { Metadata } from 'next';
import './globals.css';
import AuthGuard from '@/components/AuthGuard';

export const metadata: Metadata = {
  title: 'ReceiptsAI — Gestión de Comprobantes',
  description: 'Plataforma de gestión de comprobantes fiscales para flotillas',
  icons: { icon: '/logo.svg' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
