import type { ReactNode } from 'react';

import { EnlaceBoton } from '@/components/Boton';
import { DATOS_EMPRESA, URL_CONTACTO } from '@/lib/marca';

import { BOTON_TEST, DOLORES, ENTREGABLES, GANAS, METODO, PASOS, PREGUNTAS } from './contenido';
import { LineaFases } from './LineaFases';

// Las secciones de la portada, en el mundo nocturno de la primera pantalla:
// fondos de noche con variaciones suaves, títulos display en mayúsculas,
// separadores de luz y todas terminan con el mismo botón al test.

export const MARGENES = 'px-5 sm:px-8 lg:px-16';
export const CONTENEDOR = 'mx-auto max-w-[90rem]';

/**
 * Tonos de noche: cada sección, un poco distinta, para dar ritmo. Cada una
 * empieza en el tono en que acaba la anterior, así que no hay cortes. Todos
 * dejan el texto por encima de AA.
 */
const TONOS = {
  noche: 'bg-[linear-gradient(180deg,#01030d_0%,#030a26_100%)]',
  azul: 'bg-[#030a26]',
  // Un resplandor azul en medio; los bordes, del azul de siempre.
  profundo: 'bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,#081c52_0%,#030a26_72%)]',
  bajo: 'bg-[linear-gradient(180deg,#030a26_0%,#020719_100%)]',
  subir: 'bg-[linear-gradient(180deg,#020719_0%,#030a26_100%)]',
} as const;
type Tono = keyof typeof TONOS;

const TITULO_SECCION = 'font-titulos text-seccion font-extrabold uppercase text-tinta';

function BotonTest() {
  return (
    <EnlaceBoton href="/test" className="w-full sm:w-auto sm:px-10">
      {BOTON_TEST}
    </EnlaceBoton>
  );
}

interface SeccionProps {
  id: string;
  titulo: ReactNode;
  children: ReactNode;
  tono: Tono;
  /** Lo que va aquí ocupa las 12 columnas, debajo del título y el contenido. */
  anchoCompleto?: ReactNode;
}

/** Sección editorial: título a la izquierda (4 columnas), contenido a la derecha (8) y el botón al test. */
function Seccion({ id, titulo, children, tono, anchoCompleto }: SeccionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className={`${MARGENES} ${TONOS[tono]}`}>
      <div className={CONTENEDOR}>
        <div aria-hidden="true" className="linea-luz" />
        <div className="grid gap-10 py-20 lg:grid-cols-12 lg:gap-8 lg:py-28">
          <h2 id={`${id}-titulo`} className={`max-w-[12ch] lg:col-span-4 ${TITULO_SECCION}`}>
            {titulo}
          </h2>
          <div className="lg:col-span-8">{children}</div>
          {anchoCompleto && <div className="lg:col-span-12">{anchoCompleto}</div>}
          <div className="lg:col-span-8 lg:col-start-5">
            <BotonTest />
          </div>
        </div>
      </div>
    </section>
  );
}

export function SeccionTeSuena() {
  return (
    <Seccion id="te-suena" tono="noche" titulo="¿Te suena?">
      <ul className="grid gap-x-12 sm:grid-cols-2">
        {DOLORES.map((d, i) => (
          <li key={d.titulo} className="py-6 first:pt-0 sm:[&:nth-child(2)]:pt-0">
            {/* Luz fina entre una y otra, nunca encima de la primera fila. */}
            {i > 0 && <div aria-hidden="true" className={`linea-luz mb-6 opacity-70 ${i === 1 ? 'sm:hidden' : ''}`} />}
            <h3 className="text-subtitulo text-tinta">{d.titulo}</h3>
            <p className="mt-2 max-w-lectura text-tinta-suave">{d.texto}</p>
          </li>
        ))}
      </ul>
    </Seccion>
  );
}

export function SeccionGanas() {
  return (
    <section aria-labelledby="ganas-titulo" className={`${MARGENES} ${TONOS.azul}`}>
      <div className={CONTENEDOR}>
        <div aria-hidden="true" className="linea-luz" />
        <div className="py-20 lg:py-28">
          {/* Una frase larga: en Inter, grande y en minúsculas (la display, solo para titulares cortos). */}
          <h2 id="ganas-titulo" className="max-w-[22ch] text-titulo text-tinta">
            {GANAS.titulo}
          </h2>
          <p className="mt-6 max-w-[40ch] text-subtitulo text-tinta-suave lg:mt-8">{GANAS.entradilla}</p>
          <div className="mt-10">
            <BotonTest />
          </div>
        </div>
      </div>
    </section>
  );
}

export function SeccionMetodo() {
  return (
    <Seccion id="metodo" tono="profundo" titulo={METODO.titulo} anchoCompleto={<LineaFases fases={METODO.fases} />}>
      <p className="max-w-lectura text-tinta-suave">{METODO.texto}</p>
    </Seccion>
  );
}

export function SeccionComoTrabajamos() {
  return (
    <Seccion id="como-trabajamos" tono="azul" titulo="Cómo trabajamos contigo">
      <table className="w-full text-left">
        <thead className="sr-only lg:not-sr-only">
          <tr className="text-detalle text-tinta-tenue">
            <th scope="col" className="pb-4 font-medium lg:w-[34%]">
              Paso
            </th>
            <th scope="col" className="pb-4 font-medium">
              Qué es
            </th>
            <th scope="col" className="pb-4 text-right font-medium lg:w-[24%]">
              Precio
            </th>
          </tr>
        </thead>
        <tbody>
          {PASOS.map((p) => (
            <tr
              key={p.nombre}
              className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 bg-[linear-gradient(90deg,rgba(21,168,245,0.4),rgba(120,200,255,0.25)_60%,transparent)] bg-[length:100%_1px] bg-no-repeat py-6 lg:table-row"
            >
              <th scope="row" className="text-subtitulo font-semibold text-tinta lg:py-7 lg:pr-6 lg:align-top">
                {p.nombre}
              </th>
              <td className="col-span-2 row-start-2 max-w-[44ch] text-tinta-suave lg:py-7 lg:pr-6 lg:align-top">{p.texto}</td>
              <td className="col-start-2 row-start-1 whitespace-nowrap text-right font-medium text-[#9fdcff] lg:py-7 lg:align-top">
                {p.precio}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Seccion>
  );
}

export function SeccionQueRecibes() {
  return (
    <Seccion id="que-recibes" tono="bajo" titulo="Qué recibes con el Diagnóstico">
      <ul className="grid gap-4 sm:grid-cols-2">
        {ENTREGABLES.map((e) => (
          <li key={e.titulo} className="cristal p-6 lg:p-8">
            <h3 className="text-subtitulo text-tinta">{e.titulo}</h3>
            <p className="mt-2 max-w-lectura text-tinta-suave">{e.texto}</p>
          </li>
        ))}
      </ul>
    </Seccion>
  );
}

export function SeccionPreguntas() {
  return (
    <Seccion id="preguntas" tono="subir" titulo="Preguntas frecuentes">
      <div>
        {PREGUNTAS.map((p, i) => (
          <details key={p.pregunta} className={`group ${i > 0 ? 'bg-[linear-gradient(90deg,transparent,rgba(21,168,245,0.35)_25%,rgba(120,200,255,0.4)_50%,rgba(21,168,245,0.35)_75%,transparent)] bg-[length:100%_1px] bg-no-repeat' : ''}`}>
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-sans text-subtitulo font-semibold text-tinta [&::-webkit-details-marker]:hidden">
              {p.pregunta}
              <span aria-hidden="true" className="relative h-4 w-4 shrink-0">
                <span className="absolute left-0 top-[7px] h-[1.5px] w-4 bg-celeste" />
                <span className="absolute left-[7px] top-0 h-4 w-[1.5px] bg-celeste transition-transform duration-200 group-open:scale-y-0" />
              </span>
            </summary>
            <p className="max-w-lectura pb-7 text-tinta-suave">{p.respuesta}</p>
          </details>
        ))}
      </div>
    </Seccion>
  );
}

/** En la portada (sin cabecera), "Contacto" va también aquí, junto al botón, con la dirección comercial. */
export function SeccionFinal({ conContacto = false }: { conContacto?: boolean }) {
  return (
    <section aria-labelledby="final-titulo" className={`${MARGENES} ${TONOS.profundo}`}>
      <div className={CONTENEDOR}>
        <div aria-hidden="true" className="linea-luz" />
        <div className="py-20 lg:py-32">
          <h2 id="final-titulo" className={`max-w-[14ch] ${TITULO_SECCION}`}>
            ¿Cuánto tiempo está perdiendo tu empresa?
          </h2>
          <p className="mt-4 text-tinta-suave">Descúbrelo en 3 minutos.</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
            <BotonTest />
            {conContacto && (
              <EnlaceBoton href={URL_CONTACTO} variante="texto">
                Contacto
              </EnlaceBoton>
            )}
          </div>
          {conContacto && (
            <address className="mt-8 text-detalle not-italic text-tinta-tenue">
              {DATOS_EMPRESA.nombreCorto} · {DATOS_EMPRESA.direccionComercial} ·{' '}
              <a href={`tel:${DATOS_EMPRESA.telefonoEnlace}`} className="underline-offset-4 hover:text-tinta hover:underline">
                {DATOS_EMPRESA.telefono}
              </a>
            </address>
          )}
        </div>
      </div>
    </section>
  );
}
