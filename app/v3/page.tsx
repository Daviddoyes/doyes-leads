import type { Metadata } from 'next';
import { Big_Shoulders_Display } from 'next/font/google';

import { PortadaOrbita } from '@/components/orbita/PortadaOrbita';

// Fuente A del titular: Big Shoulders Display, de rótulo industrial, estrecha y con carácter.
// next/font la descarga al compilar y la sirve desde la propia web (solo los caracteres latinos).
const fuente = Big_Shoulders_Display({ weight: '800', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Portada v3 · Órbitas',
  robots: { index: false, follow: false },
};

export default function PortadaV3() {
  return <PortadaOrbita claseFuente={`${fuente.className} tracking-[-0.005em]`} />;
}
