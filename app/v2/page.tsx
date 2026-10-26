import type { Metadata } from 'next';

import { EnlaceBoton } from '@/components/Boton';
import { EscenaEngranajes } from '@/components/engranajes/EscenaEngranajes';
import { BOTON_TEST, LINEA, TITULAR } from '@/components/portada/contenido';
import { PieConContacto, RestoPortada } from '@/components/portada/RestoPortada';

// Propuesta de primera pantalla "Escena inmersiva": la pantalla entera en marino,
// las esferas de fondo y el texto encima. Al bajar, la web sigue en claro.
export const metadata: Metadata = {
  title: 'Portada v2 · Escena inmersiva',
  robots: { index: false, follow: false },
};

export default function PortadaV2() {
  return (
    <>
      <main id="contenido" className="flex-1">
        <section aria-labelledby="portada-titulo" className="relative isolate flex h-[100svh] min-h-[34rem] flex-col overflow-hidden bg-marino px-5 text-center sm:px-8 lg:px-16">
          {/* Las esferas, de fondo y a pantalla completa. */}
          <div className="absolute inset-0 -z-10">
            <EscenaEngranajes variante="inmersiva" />
          </div>
          {/* El texto, encima, con un velo suave para que se lea siempre. Deja pasar el puntero a las esferas. */}
          <div className="pointer-events-none relative mx-auto mt-[9svh] max-w-[60rem] lg:mt-[11svh]">
            <div
              aria-hidden="true"
              className="absolute -inset-x-16 -inset-y-12 -z-10 bg-[radial-gradient(closest-side,rgba(0,12,52,0.88),rgba(0,12,52,0.6)_55%,rgba(0,12,52,0))]"
            />
            <h1 id="portada-titulo" className="text-portada font-semibold text-white">
              {TITULAR.map((linea, i) => (
                <span key={linea} className="sm:block">
                  {i > 0 && ' '}
                  {linea}
                </span>
              ))}
            </h1>
            <p className="mt-3 text-subtitulo text-[#c9d0de] lg:mt-6">
              {LINEA.map((frase, i) => (
                <span key={frase} className="block sm:inline">
                  {i > 0 && <span className="hidden sm:inline"> </span>}
                  {frase}
                </span>
              ))}
            </p>
            <EnlaceBoton
              href="/test"
              className="pointer-events-auto mt-6 w-full !bg-celeste !text-marino hover:!bg-[#4dbcf7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto sm:px-10 lg:mt-8"
            >
              {BOTON_TEST}
            </EnlaceBoton>
          </div>
        </section>
        <RestoPortada />
      </main>
      <PieConContacto />
    </>
  );
}
