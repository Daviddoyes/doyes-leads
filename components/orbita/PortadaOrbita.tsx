import { EnlaceBoton } from '@/components/Boton';
import { BOTON_TEST, LINEA } from '@/components/portada/contenido';
import { PieConContacto, RestoPortada } from '@/components/portada/RestoPortada';

import { EscenaOrbita } from './EscenaOrbita';

/** El titular de /v3, en mayúsculas y en dos frases. */
const TITULAR = ['Ordena tu empresa.', 'Poténciala con IA.'];

/**
 * Portada /v3: la primera pantalla entera es la escena, oscura, y encima solo el
 * titular, la línea y el botón, abajo a la izquierda (centrados en móvil). Sin
 * cabecera. Al bajar, la web sigue como la portada, en claro.
 */
export function PortadaOrbita({ claseFuente }: { claseFuente: string }) {
  return (
    <>
      <main id="contenido" className="flex-1">
        <section
          aria-labelledby="portada-titulo"
          className="relative isolate flex h-[100svh] min-h-[35rem] flex-col justify-end overflow-hidden bg-[#01030d] text-white"
        >
          <EscenaOrbita />
          {/* Oscurece la parte de abajo para que el texto se lea siempre sobre la escena. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[62%] bg-gradient-to-t from-[#01030d] via-[#01030d]/70 to-transparent" />
          <div className="px-5 pb-10 text-center sm:px-8 sm:pb-12 lg:px-16 lg:pb-16 lg:text-left">
            <h1
              id="portada-titulo"
              className={`${claseFuente} text-[clamp(3.25rem,15.5vw,4.75rem)] uppercase leading-[0.86] text-white sm:text-[clamp(4.75rem,9vw,8.25rem)]`}
            >
              {TITULAR.map((frase) => (
                <span key={frase} className="block">
                  {frase}
                </span>
              ))}
            </h1>
            <p className="mt-4 text-detalle text-[#b9c2d6] sm:text-texto lg:mt-6">
              {LINEA.join(' ')}
            </p>
            <EnlaceBoton
              href="/test"
              className="mt-6 w-full !bg-celeste !text-marino hover:!bg-[#4dbcf7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto sm:px-10 lg:mt-8"
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
