import { EnlaceBoton } from '@/components/Boton';
import { BOTON_TEST, LINEA, TITULAR } from '@/components/portada/contenido';
import { PieConContacto, RestoPortada } from '@/components/portada/RestoPortada';

import { EscenaOrbita } from './EscenaOrbita';

/**
 * La portada: la primera pantalla entera es la escena, oscura, y encima solo el
 * titular, la línea y el botón, abajo a la izquierda (centrados en móvil). Sin
 * cabecera. Al bajar, el resto de la web sigue en el mismo mundo nocturno.
 */
export function PortadaOrbita() {
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
          {/* data-zona-texto: los nombres de la escena nunca se pintan encima de estas piezas. */}
          {/*
            En vertical, el margen de abajo crece con la altura de la pantalla y la escena se centra
            en el hueco de encima: arriba, entre escena y texto y abajo queda más o menos lo mismo.
          */}
          <div className="flex flex-col items-center px-5 pb-[max(2.5rem,calc(30svh-9.5rem))] text-center sm:px-8 lg:items-start lg:px-16 lg:pb-16 lg:text-left">
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
