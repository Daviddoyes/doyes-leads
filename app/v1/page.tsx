import type { Metadata } from 'next';

import { EnlaceBoton } from '@/components/Boton';
import { Cabecera } from '@/components/Cabecera';
import { EscenaEsferas } from '@/components/esferas/EscenaEsferas';
import { Pie } from '@/components/Pie';
import { SUBTITULO_AFILAR, TITULAR, TITULAR_AFILAR, TITULO_GANAS } from '@/components/portada/contenido';
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
          <div className={`${CONTENEDOR} pb-12 pt-6 lg:pb-20 lg:pt-12`}>
            {/* El titular es el protagonista: a todo el ancho y en dos líneas en escritorio. */}
            <h1 id="portada-titulo" className="text-portada font-semibold text-marino">
              {TITULAR_AFILAR.map((linea, i) => (
                <span key={linea} className="lg:block">
                  {i > 0 && ' '}
                  {linea}
                </span>
              ))}
            </h1>
            <div className="grid items-start gap-6 lg:mt-14 lg:grid-cols-12 lg:gap-8">
              <div className="mt-6 lg:col-span-4 lg:mt-2">
                <p className="max-w-[36ch] text-subtitulo text-tinta-suave">{SUBTITULO_AFILAR}</p>
                <div className="mt-7 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-8 lg:mt-10 lg:flex-col lg:items-start lg:gap-3">
                  <EnlaceBoton href="/test">Empezar el test (3 minutos)</EnlaceBoton>
                  <EnlaceBoton href={URL_CONTACTO} variante="texto" className="self-start">
                    Contacto
                  </EnlaceBoton>
                </div>
              </div>
              <div className="-mx-5 sm:mx-0 lg:col-span-8 lg:-mt-6">
                <EscenaEsferas />
              </div>
            </div>
          </div>
        </section>

        <SeccionTeSuena />
        <SeccionGanas titulo={TITULAR} entradilla={TITULO_GANAS} />
        <SeccionMetodo oscura />
        <SeccionComoTrabajamos captura={<MarcoNavegador />} />
        <SeccionQueRecibes />
        <SeccionPreguntas />
        <SeccionFinal />
      </main>
      <Pie />
    </>
  );
}
