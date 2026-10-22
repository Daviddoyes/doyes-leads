import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';

import { CapturaOrigen } from '@/components/CapturaOrigen';
import { URL_SITIO } from '@/lib/marca';

import './globals.css';

// next/font descarga las fuentes al compilar y las sirve desde la propia web:
// no hay peticiones a Google desde el navegador del visitante.
const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });
const poppins = Poppins({ variable: '--font-poppins', subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' });

const TITULO = 'IA360Empresas · Tecnología que te quita trabajo, no que te da más';
const DESCRIPCION =
  'Analizamos cómo funciona tu empresa y te decimos qué ordenar, qué automatizar y dónde la IA te ahorra tiempo y dinero. Haz el Test IA360 en 3 minutos.';

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: { default: TITULO, template: '%s · IA360Empresas' },
  description: DESCRIPCION,
  applicationName: 'IA360Empresas',
  authors: [{ name: 'Doyes Digital' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'IA360Empresas · Doyes Digital',
    title: TITULO,
    description: DESCRIPCION,
    url: '/',
  },
  twitter: { card: 'summary_large_image', title: TITULO, description: DESCRIPCION },
};

export const viewport: Viewport = {
  themeColor: '#f7f6f3',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <CapturaOrigen />
        {children}
      </body>
    </html>
  );
}
