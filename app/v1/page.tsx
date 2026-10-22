import type { Metadata } from 'next';

import { EnlaceBoton } from '@/components/Boton';
import { Cabecera } from '@/components/Cabecera';
import { EscenaEsferas } from '@/components/esferas/EscenaEsferas';
import { Pie } from '@/components/Pie';
import { SUBTITULO, TITULAR } from '@/components/portada/contenido';
import { MarcoNavegador } from '@/components/portada/MarcoNavegador';
import {
  CONTENEDOR,
  MARGENES,
  SeccionComoTrabajamos,
  SeccionFinal,
  SeccionGanas,
  SeccionMetodo,
  SeccionPreguntas,
  SeccionQueRecibes,
  SeccionTeSuena,
} from '@/components/portada/Secciones';
import { hayFotoDavid } from '@/lib/foto-david';
import { URL_CONTACTO } from '@/lib/marca';

// Versión de prueba de la portada: "Esferas". No se indexa.
export const metadata: Metadata = {
  title: 'Portada v1 (prueba)',
  robots: { index: false, follow: false },
};

export default function PortadaV1() {
  return (
    <>
      <Cabecera />
      <main id="contenido" className="flex-1">
        <section aria-labelledby="portada-titulo" className={MARGENES}>
          <div className={`${CONTENEDOR} grid items-center gap-6 pb-12 pt-6 lg:grid-cols-12 lg:gap-8 lg:pb-20 lg:pt-10`}>
            <div className="lg:col-span-5">
              <h1 id="portada-titulo" className="max-w-[12ch] text-display font-semibold text-marino">
                {TITULAR}
              </h1>
              <p className="mt-5 max-w-[46ch] text-texto text-tinta-suave lg:mt-8">{SUBTITULO}</p>
              <div className="mt-7 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-8 lg:mt-10">
                <EnlaceBoton href="/test">Empezar el test (3 minutos)</EnlaceBoton>
                <EnlaceBoton href={URL_CONTACTO} variante="texto" className="self-start sm:self-auto">
                  Hablar con David
                </EnlaceBoton>
              </div>
            </div>
            <div className="-mx-5 sm:mx-0 lg:col-span-7">
              <EscenaEsferas />
            </div>
          </div>
        </section>

        <SeccionTeSuena />
        <SeccionGanas />
        <SeccionMetodo oscura />
        <SeccionComoTrabajamos captura={<MarcoNavegador />} />
        <SeccionQueRecibes />
        <SeccionPreguntas />
        <SeccionFinal conFoto={hayFotoDavid()} />
      </main>
      <Pie />
    </>
  );
}
