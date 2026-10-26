import type { Metadata } from 'next';

import { EnlaceBoton } from '@/components/Boton';
import { EscenaEngranajes } from '@/components/engranajes/EscenaEngranajes';
import { BOTON_TEST, LINEA, TITULAR } from '@/components/portada/contenido';
import { PieConContacto, RestoPortada } from '@/components/portada/RestoPortada';

// Propuesta de primera pantalla "La marca en el corazón": sin cabecera, fondo claro,
// los engranajes protagonistas y el símbolo dD en la esfera central.
export const metadata: Metadata = {
  title: 'Portada v1 · La marca en el corazón',
  robots: { index: false, follow: false },
};

export default function PortadaV1() {
  return (
    <>
      <main id="contenido" className="flex-1">
        {/* La primera pantalla entera: en móvil (375×667) caben el texto y los engranajes completos. */}
        <section aria-labelledby="portada-titulo" className="flex min-h-[100svh] flex-col px-5 pt-6 text-center sm:px-8 sm:pt-10 lg:px-16 lg:pt-14">
          <h1 id="portada-titulo" className="mx-auto text-portada font-semibold text-marino">
            {TITULAR.map((linea, i) => (
              <span key={linea} className="sm:block">
                {i > 0 && ' '}
                {linea}
              </span>
            ))}
          </h1>
          <p className="mx-auto mt-3 text-subtitulo text-tinta-suave lg:mt-6">
            {LINEA.map((frase, i) => (
              <span key={frase} className="block sm:inline">
                {i > 0 && <span className="hidden sm:inline"> </span>}
                {frase}
              </span>
            ))}
          </p>
          <EnlaceBoton href="/test" className="mx-auto mt-5 w-full sm:w-auto sm:px-10 lg:mt-8">
            {BOTON_TEST}
          </EnlaceBoton>
          {/* En móvil, de borde a borde. */}
          <div className="relative -mx-5 mt-1 min-h-[19rem] flex-1 sm:-mx-8 lg:mx-auto lg:w-full lg:max-w-[90rem]">
            <EscenaEngranajes variante="corazon" />
          </div>
        </section>
        <RestoPortada />
      </main>
      <PieConContacto />
    </>
  );
}
