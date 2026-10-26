import type { Metadata } from 'next';

import { PortadaOrbita } from '@/components/orbita/PortadaOrbita';

// La fuente del titular es la display de toda la web (Sofia Sans Extra Condensed, app/layout.tsx).
export const metadata: Metadata = {
  title: 'Portada v3 · Órbitas',
  robots: { index: false, follow: false },
};

export default function PortadaV3() {
  return <PortadaOrbita claseFuente="font-titulos font-extrabold tracking-[-0.01em]" />;
}
