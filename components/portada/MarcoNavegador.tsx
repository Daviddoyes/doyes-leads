import { existsSync } from 'node:fs';
import path from 'node:path';

import Image from 'next/image';

/*
 * Una captura del portal IA360Empresas (con un cliente de ejemplo, sin datos
 * reales) en un marco de navegador sencillo. Basta con dejar la imagen en
 * public/portal/captura.png y desplegar; hasta entonces se ve un hueco neutro.
 */
const RUTA_CAPTURA = '/portal/captura.png';

function hayCaptura(): boolean {
  return existsSync(path.join(process.cwd(), 'public', 'portal', 'captura.png'));
}

export function MarcoNavegador({ oscuro = false }: { oscuro?: boolean }) {
  const conCaptura = hayCaptura();
  return (
    <figure className="mt-4 lg:mt-10">
      <div className="overflow-hidden rounded-xl border border-linea bg-superficie shadow-[0_24px_60px_-30px_rgba(0,12,52,0.35)]">
        {/* La barra solo dice dónde está: el portal de cada cliente. */}
        <div className="flex h-10 items-center border-b border-linea bg-fondo px-4">
          <span className="mx-auto rounded-md bg-superficie px-3 py-0.5 text-detalle text-tinta-tenue">
            portal.doyesdigital.com
          </span>
        </div>
        {conCaptura ? (
          <Image
            src={RUTA_CAPTURA}
            alt="El espacio privado IA360Empresas de un cliente de ejemplo, con las fases del diagnóstico y sus formularios."
            width={1440}
            height={900}
            sizes="(min-width: 1024px) 1200px, 100vw"
            className="h-auto w-full"
          />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center p-8">
            <p className="max-w-[32ch] text-center text-detalle text-tinta-tenue">
              Aquí irá una captura del portal IA360Empresas con un cliente de ejemplo.
            </p>
          </div>
        )}
      </div>
      <figcaption className={`mt-4 max-w-lectura text-detalle ${oscuro ? 'text-white/70' : 'text-tinta-tenue'}`}>
        Todo el diagnóstico sucede en un espacio privado: formularios, documentos y avances en un mismo sitio.
      </figcaption>
    </figure>
  );
}
