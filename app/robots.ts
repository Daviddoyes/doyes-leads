import type { MetadataRoute } from 'next';

import { URL_SITIO } from '@/lib/marca';

// Las versiones de prueba de Vercel (*.vercel.app) no deben aparecer en Google:
// solo se permite indexar en producción.
const esProduccion = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : true;

export default function robots(): MetadataRoute.Robots {
  if (!esProduccion) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${URL_SITIO}/sitemap.xml`,
  };
}
