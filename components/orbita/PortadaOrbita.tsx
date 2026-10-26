import { EnlaceBoton } from '@/components/Boton';
import { BOTON_TEST, LINEA, TITULAR } from '@/components/portada/contenido';
import { PieConContacto, RestoPortada } from '@/components/portada/RestoPortada';

import { EscenaOrbita } from './EscenaOrbita';

/**
 * La portada: la primera pantalla entera es la escena, oscura, y encima solo el
 * titular, la línea y el botón. En móvil, el texto va centrado en la pantalla y
 * la escena queda de fondo a pantalla completa, algo atenuada, con el símbolo
 * detrás del titular. En escritorio, el texto abajo a la izquierda y la escena
 * por encima. Sin
 * cabecera. Al bajar, el resto de la web sigue en el mismo mundo nocturno.
 */
export function PortadaOrbita() {
  return (
    <>
      <main id="contenido" className="flex-1">
        <section
          aria-labelledby="portada-titulo"
          className="relative isolate flex h-[100svh] min-h-[35rem] flex-col justify-center overflow-hidden bg-[#01030d] text-white lg:justify-end"
        >
          {/* En móvil, de fondo: más tenue, para que el titular se lea por encima. */}
          <EscenaOrbita className="opacity-80 lg:opacity-100" />
          {/* Para que el texto se lea siempre: en móvil, una sombra suave detrás del bloque; en escritorio, la parte de abajo. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_75%_34%_at_50%_50%,rgba(1,3,13,0.72)_0%,rgba(1,3,13,0.4)_60%,rgba(1,3,13,0)_100%)] lg:hidden"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden h-[62%] bg-gradient-to-t from-[#01030d] via-[#01030d]/70 to-transparent lg:block" />
          {/*
            data-zona-texto: los nombres de la escena nunca se pintan encima de estas piezas.
            data-centro-escena: en vertical, el centro de la escena (el símbolo) va detrás de este bloque.
          */}
          <div data-centro-escena className="flex flex-col items-center px-5 py-16 text-center sm:px-8 lg:items-start lg:px-16 lg:pt-0 lg:pb-16 lg:text-left">
            <h1
              id="portada-titulo"
              data-zona-texto
              className={`w-fit font-titulos text-[clamp(3.25rem,15.5vw,4.75rem)] font-extrabold tracking-[-0.01em] uppercase leading-[0.86] text-white sm:text-[clamp(4.75rem,9vw,8.25rem)]`}
            >
              {TITULAR.map((frase) => (
                <span key={frase} className="block">
                  {frase}
                </span>
              ))}
            </h1>
            <p data-zona-texto className="mt-4 w-fit text-detalle text-tinta-suave sm:text-texto lg:mt-6">
              {LINEA.join(' ')}
            </p>
            <EnlaceBoton data-zona-texto href="/test" className="mt-6 w-full sm:w-auto sm:px-10 lg:mt-8">
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
