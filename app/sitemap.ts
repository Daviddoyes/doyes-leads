import type { MetadataRoute } from 'next';

import { URL_SITIO } from '@/lib/marca';

export default function sitemap(): MetadataRoute.Sitemap {
  const paginas: { ruta: string; prioridad: number }[] = [
    { ruta: '', prioridad: 1 },
    { ruta: '/test', prioridad: 0.9 },
    { ruta: '/aviso-legal', prioridad: 0.2 },
    { ruta: '/privacidad', prioridad: 0.2 },
    { ruta: '/cookies', prioridad: 0.2 },
  ];
  return paginas.map((p) => ({ url: `${URL_SITIO}${p.ruta}`, lastModified: new Date(), priority: p.prioridad }));
}
