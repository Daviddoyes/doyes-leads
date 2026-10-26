import type { Metadata } from 'next';
import { Sofia_Sans_Extra_Condensed } from 'next/font/google';

import { PortadaOrbita } from '@/components/orbita/PortadaOrbita';

// Fuente B del titular: Sofia Sans Extra Condensed, moderna y afilada.
// next/font la descarga al compilar y la sirve desde la propia web (solo los caracteres latinos).
const fuente = Sofia_Sans_Extra_Condensed({ weight: '800', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Portada v3 (fuente B) · Órbitas',
  robots: { index: false, follow: false },
};

export default function PortadaV3B() {
  return <PortadaOrbita claseFuente={`${fuente.className} tracking-[-0.01em]`} />;
}
