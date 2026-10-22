import type { CSSProperties } from 'react';

import type { Metadata } from 'next';
import Image from 'next/image';

import { EnlaceBoton } from '@/components/Boton';
import { Cabecera } from '@/components/Cabecera';
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
// Foto provisional de Unsplash (licencia de Unsplash, uso comercial libre):
// https://unsplash.com/es/fotos/hombre-frente-a-una-mujer-izxMVv2Z9dw
// Se sustituye dejando otra en public/v2/reunion.jpg.
import foto from '@/public/v2/reunion.jpg';

// Versión de prueba de la portada: "Foto". No se indexa.
export const metadata: Metadata = {
  title: 'Portada v2 (prueba)',
  robots: { index: false, follow: false },
};

// Tono más cálido: el mismo papel, con un punto de arena, y líneas a juego.
const TONO_CALIDO = {
  '--color-fondo': '#f3ede4',
  '--color-linea': 'color-mix(in srgb, #a8b3c7 50%, #e9e0d3)',
} as CSSProperties;

export default function PortadaV2() {
  return (
    <div style={TONO_CALIDO} className="flex min-h-dvh flex-col bg-fondo">
      <Cabecera />
      <main id="contenido" className="flex-1">
        {/*
          En el móvil, la foto arriba (con la cara a la vista) y el texto debajo, sobre
          el marino en el que se funde la foto. En escritorio, el texto encima de la foto.
        */}
        <section
          aria-labelledby="portada-titulo"
          className="relative isolate overflow-hidden bg-marino lg:flex lg:h-[calc(100svh-6rem)] lg:min-h-[44rem] lg:items-end"
        >
          <div className="relative h-[15rem] sm:h-[22rem] lg:absolute lg:inset-0 lg:-z-10 lg:h-auto">
            <Image
              src={foto}
              alt="Una consultora explica algo con su portátil a un cliente, sentados en una mesa de madera de una oficina pequeña."
              fill
              priority
              placeholder="blur"
              sizes="100vw"
              className="object-cover object-[60%_32%] lg:object-[64%_40%]"
            />
            {/* Velo oscuro para que el texto blanco se lea sobre la foto. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-marino via-marino/25 to-transparent lg:bg-gradient-to-r lg:from-marino/85 lg:via-marino/45 lg:to-transparent"
            />
          </div>
          <div className={`${MARGENES} relative -mt-8 w-full pb-10 lg:mt-0 lg:pb-20 lg:pt-24`}>
            <div className={CONTENEDOR}>
              <h1 id="portada-titulo" className="max-w-[12ch] text-display font-semibold text-white">
                {TITULAR}
              </h1>
              <p className="mt-5 max-w-[44ch] text-texto text-white/85 lg:mt-8">{SUBTITULO}</p>
              <div className="mt-7 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-8 lg:mt-10">
                <EnlaceBoton href="/test" className="!bg-white !text-marino hover:!bg-fondo">
                  Empezar el test (3 minutos)
                </EnlaceBoton>
                <EnlaceBoton
                  href={URL_CONTACTO}
                  variante="texto"
                  className="self-start !text-white decoration-white/50 hover:decoration-white sm:self-auto"
                >
                  Hablar con David
                </EnlaceBoton>
              </div>
            </div>
          </div>
        </section>

        <SeccionTeSuena />
        <SeccionGanas />
        <SeccionMetodo />
        <SeccionComoTrabajamos captura={<MarcoNavegador />} />
        <SeccionQueRecibes />
        <SeccionPreguntas />
        <SeccionFinal conFoto={hayFotoDavid()} />
      </main>
      <Pie />
    </div>
  );
}
