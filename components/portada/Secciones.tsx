import type { ReactNode } from 'react';

import { EnlaceBoton } from '@/components/Boton';

import { DOLORES, ENTREGABLES, FASES, PASOS, PREGUNTAS_FRECUENTES, TITULO_GANAS } from './contenido';

// Las secciones de la portada, compartidas por / y sus versiones de prueba.

export const MARGENES = 'px-5 sm:px-8 lg:px-16';
export const CONTENEDOR = 'mx-auto max-w-[90rem]';

interface SeccionProps {
  id: string;
  titulo: ReactNode;
  children: ReactNode;
  /** Lo que va aquí ocupa las 12 columnas, debajo del título y el contenido. */
  anchoCompleto?: ReactNode;
  /** A todo el ancho en azul marino, para dar contraste. */
  oscura?: boolean;
}

/** Sección editorial: título a la izquierda (4 columnas), contenido a la derecha (8). */
export function Seccion({ id, titulo, children, anchoCompleto, oscura = false }: SeccionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className={`${MARGENES} ${oscura ? 'bg-marino text-white' : ''}`}>
      <div
        className={`${CONTENEDOR} grid gap-10 py-20 lg:grid-cols-12 lg:gap-8 lg:py-28 ${oscura ? '' : 'border-t border-linea'}`}
      >
        <h2 id={`${id}-titulo`} className={`max-w-titular text-titulo lg:col-span-4 ${oscura ? 'text-white' : 'text-marino'}`}>
          {titulo}
        </h2>
        <div className="lg:col-span-8">{children}</div>
        {anchoCompleto && <div className="lg:col-span-12">{anchoCompleto}</div>}
      </div>
    </section>
  );
}

export function SeccionTeSuena() {
  return (
    <Seccion id="te-suena" titulo="¿Te suena?">
      <ul className="grid gap-x-12 sm:grid-cols-2">
        {DOLORES.map((d) => (
          <li
            key={d.titulo}
            className="border-t border-linea py-6 first:border-t-0 first:pt-0 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(2)]:pt-0"
          >
            <h3 className="text-subtitulo text-marino">{d.titulo}</h3>
            <p className="mt-2 max-w-lectura text-tinta-suave">{d.texto}</p>
          </li>
        ))}
      </ul>
    </Seccion>
  );
}

interface SeccionGanasProps {
  titulo?: string;
  /** Una frase entre el título y el texto (en la v1, el antiguo título de la sección). */
  entradilla?: string;
}

export function SeccionGanas({ titulo = TITULO_GANAS, entradilla }: SeccionGanasProps) {
  return (
    <section aria-labelledby="ganas-titulo" className={MARGENES}>
      <div className={`${CONTENEDOR} border-t border-linea py-20 lg:py-28`}>
        <h2 id="ganas-titulo" className="max-w-[24ch] text-titulo text-marino">
          {titulo}
        </h2>
        {entradilla && <p className="mt-6 max-w-[40ch] font-titulos text-subtitulo text-marino lg:mt-8">{entradilla}</p>}
        <p className={`max-w-lectura text-tinta-suave ${entradilla ? 'mt-4' : 'mt-6 lg:mt-8'}`}>
          La tecnología tiene sentido cuando te devuelve horas, te ayuda a crecer o te deja vivir mejor. Si no, solo es
          otra herramienta más.
        </p>
      </div>
    </section>
  );
}

export function SeccionMetodo({ oscura = false }: { oscura?: boolean }) {
  const nodo = oscura ? 'border-white bg-marino' : 'border-marino bg-fondo';
  return (
    <Seccion
      id="metodo"
      oscura={oscura}
      titulo="Primero entender. Después automatizar."
      anchoCompleto={
        <ol className="grid gap-8 lg:mt-8 lg:grid-cols-5 lg:gap-6">
          {FASES.map((f, i) => (
            <li key={f.nombre} className="relative grid grid-cols-[1.125rem_1fr] gap-x-5 lg:block">
              {/* Tramo de línea hasta el nodo siguiente: hacia abajo en móvil, a la derecha en escritorio. */}
              {i < FASES.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[7.5px] top-[13px] h-[calc(100%+2rem)] w-[3px] bg-celeste lg:left-[9px] lg:top-[7.5px] lg:h-[3px] lg:w-[calc(100%+1.5rem)]"
                />
              )}
              <span
                aria-hidden="true"
                className={`relative mt-1 block h-[1.125rem] w-[1.125rem] rounded-full border-[1.5px] lg:mt-0 ${nodo}`}
              />
              <div className="lg:mt-6">
                <p className={`text-detalle ${oscura ? 'text-white/65' : 'text-tinta-tenue'}`}>Fase {i + 1}</p>
                <h3 className={`mt-1 text-subtitulo ${oscura ? 'text-white' : 'text-marino'}`}>{f.nombre}</h3>
                <p className={`mt-2 max-w-[30ch] text-detalle ${oscura ? 'text-white/75' : 'text-tinta-suave'}`}>
                  {f.descripcion}
                </p>
              </div>
            </li>
          ))}
        </ol>
      }
    >
      <p className={`max-w-lectura ${oscura ? 'text-white/80' : 'text-tinta-suave'}`}>
        La IA no arregla una empresa desordenada: la hace ir más rápido en la dirección equivocada. Por eso empezamos por
        entender cómo trabajáis de verdad.
      </p>
    </Seccion>
  );
}

export function SeccionComoTrabajamos({ captura }: { captura?: ReactNode }) {
  return (
    <Seccion id="como-trabajamos" titulo="Cómo trabajamos contigo" anchoCompleto={captura}>
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
            <tr key={p.nombre} className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 border-t border-linea py-6 lg:table-row">
              <th scope="row" className="font-titulos text-subtitulo font-medium text-marino lg:py-7 lg:pr-6 lg:align-top">
                {p.nombre}
              </th>
              <td className="col-span-2 row-start-2 max-w-[44ch] text-tinta-suave lg:py-7 lg:pr-6 lg:align-top">{p.texto}</td>
              <td className="col-start-2 row-start-1 whitespace-nowrap text-right font-medium text-marino lg:py-7 lg:align-top">
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
    <Seccion id="que-recibes" titulo="Qué recibes con el Diagnóstico">
      <ul className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
        {ENTREGABLES.map((e) => (
          <li key={e.titulo} className="border-t border-linea pt-6">
            <h3 className="text-subtitulo text-marino">{e.titulo}</h3>
            <p className="mt-2 max-w-lectura text-tinta-suave">{e.texto}</p>
          </li>
        ))}
      </ul>
    </Seccion>
  );
}

export function SeccionPreguntas() {
  return (
    <Seccion id="preguntas" titulo="Preguntas frecuentes">
      <div className="border-b border-linea">
        {PREGUNTAS_FRECUENTES.map((p) => (
          <details key={p.pregunta} className="group border-t border-linea first:border-t-0">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-titulos text-subtitulo font-medium text-marino [&::-webkit-details-marker]:hidden">
              {p.pregunta}
              <span aria-hidden="true" className="relative h-4 w-4 shrink-0">
                <span className="absolute left-0 top-[7px] h-[1.5px] w-4 bg-marino" />
                <span className="absolute left-[7px] top-0 h-4 w-[1.5px] bg-marino transition-transform duration-200 group-open:scale-y-0" />
              </span>
            </summary>
            <p className="max-w-lectura pb-7 text-tinta-suave">{p.respuesta}</p>
          </details>
        ))}
      </div>
    </Seccion>
  );
}

export function SeccionFinal() {
  return (
    <section aria-labelledby="final-titulo" className={MARGENES}>
      <div className={`${CONTENEDOR} border-t border-linea py-20 lg:py-32`}>
        <h2 id="final-titulo" className="max-w-[16ch] text-titulo text-marino">
          ¿Cuánto tiempo está perdiendo tu empresa?
        </h2>
        <p className="mt-4 text-tinta-suave">Descúbrelo en 3 minutos.</p>
        <EnlaceBoton href="/test" className="mt-8 w-full sm:w-auto">
          Empezar el test
        </EnlaceBoton>
      </div>
    </section>
  );
}
