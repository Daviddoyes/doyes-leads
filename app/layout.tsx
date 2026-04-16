import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Doyes — Diagnóstico gratuito',
  description:
    'Cuéntanos tu situación y te decimos cómo podemos ayudarte a crecer.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
