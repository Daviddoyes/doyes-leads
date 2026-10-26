import type { Metadata, Viewport } from 'next';
import { Inter, Sofia_Sans_Extra_Condensed } from 'next/font/google';

import { CapturaOrigen } from '@/components/CapturaOrigen';
import { URL_SITIO } from '@/lib/marca';

import './globals.css';

// next/font descarga las fuentes al compilar y las sirve desde la propia web:
// no hay peticiones a Google desde el navegador del visitante.
const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });
// Display de los títulos: estrecha, con carácter, en mayúsculas en titulares y secciones.
const display = Sofia_Sans_Extra_Condensed({ variable: '--font-display', subsets: ['latin'], weight: ['700', '800'], display: 'swap' });

const TITULO = 'IA360Empresas · Ordena tu empresa. Poténciala con IA.';
const DESCRIPCION =
  'Haz el Test IA360 gratis: en 3 minutos sabrás cómo está tu empresa, qué ordenar y dónde la IA te ahorra tiempo y dinero.';

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
  themeColor: '#01030d',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${display.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <CapturaOrigen />
        {children}
      </body>
    </html>
  );
}
