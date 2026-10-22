import type { ReactNode } from 'react';

import { EnlaceBoton } from '@/components/Boton';
import { Cabecera } from '@/components/Cabecera';
import { DelEnredoAlFlujo } from '@/components/DelEnredoAlFlujo';
import { HablasConDavid } from '@/components/HablasConDavid';
import { Pie } from '@/components/Pie';
import { hayFotoDavid } from '@/lib/foto-david';
import { PRODUCTO, URL_CONTACTO } from '@/lib/marca';

// Textos de docs/web-test-ia360.md. Las fases, como en el portal (data/catalogo.ts).

const DOLORES = [
  { titulo: 'Todo pasa por ti.', texto: 'Si faltas una semana, la mitad de las cosas se paran.' },
  { titulo: 'Horas que se van.', texto: 'Tu equipo copia datos, prepara informes y responde lo mismo cada semana.' },
  { titulo: 'Herramientas que nadie usa bien.', texto: 'Pagas programas que se solapan y nadie aprovecha.' },
  { titulo: 'La IA, sin saber por dónde empezar.', texto: 'Sabes que puede ayudarte, pero no quieres tirar el dinero.' },
];

const FASES = [
  { nombre: 'Bienvenida', descripcion: 'Firmamos la confidencialidad y nos contáis cómo es vuestra empresa.' },
  { nombre: 'Entender', descripcion: 'Cada responsable de área nos cuenta cómo se trabaja de verdad.' },
  { nombre: 'Hacer visible', descripcion: 'Dibujamos con vosotros los procesos que más pesan y dónde se atascan.' },
  {
    nombre: 'Ordenar y decidir',
    descripcion: 'Detectamos qué simplificar, qué automatizar y dónde aporta la IA, revisando la seguridad de cada cambio.',
  },
  { nombre: 'Plan', descripcion: 'Os entregamos el roadmap priorizado y lo presentamos en una sesión.' },
];

const PASOS = [
  { nombre: 'Test IA360', texto: '10 preguntas y una llamada de 30 minutos', precio: 'Gratis' },
  {
    nombre: `Diagnóstico ${PRODUCTO}`,
    texto: 'Mapa de tu empresa, oportunidades, seguridad y roadmap, en 7-30 días según tamaño',
    precio: 'Desde 3.000 € + IVA',
  },
  {
    nombre: `Implementación ${PRODUCTO}`,
    texto: 'Lo que el roadmap valida, con nosotros, con tu equipo de IT o con quien elijas',
    precio: 'Presupuesto aparte',
  },
];

const ENTREGABLES = [
  {
    titulo: 'Un mapa de cómo funciona tu empresa hoy',
    texto: 'Procesos, herramientas y equipos, con los puntos donde se pierde tiempo o se desordena el trabajo.',
  },
  {
    titulo: 'Las oportunidades reales',
    texto: 'Qué mejorar, qué automatizar y dónde aporta la IA. Y también dónde no hace falta.',
  },
  {
    titulo: 'La seguridad de cada oportunidad',
    texto: 'Accesos, datos, dependencias y riesgos, evaluados antes de implementar nada.',
  },
  {
    titulo: 'Un roadmap ordenado por impacto y riesgo',
    texto: 'Con el porqué de cada paso, presentado en una sesión con tu equipo.',
  },
];

const PREGUNTAS_FRECUENTES = [
  {
    pregunta: '¿Por qué pagar un diagnóstico?',
    respuesta:
      'Porque automatizar sin entender sale caro. El diagnóstico te dice qué hacer, en qué orden y qué no hacer, antes de gastar en herramientas o desarrollos. Y el roadmap es tuyo: lo puedes llevar a cabo con nosotros o con quien quieras.',
  },
  {
    pregunta: 'Ya tenemos IT.',
    respuesta:
      'Perfecto. Tu equipo de IT mantiene los sistemas; nosotros miramos cómo trabaja la empresa: procesos, datos y decisiones. El roadmap le sirve de guía y, si quiere, la implementación la puede hacer él, con nuestro acompañamiento.',
  },
  {
    pregunta: 'Ya usamos ChatGPT.',
    respuesta:
      'Es un buen comienzo. Pero que cada uno use la IA por su cuenta no es lo mismo que llevarla a los procesos que más pesan, con los datos correctos y sin riesgos. Ahí está la diferencia entre probar y ahorrar horas de verdad.',
  },
  {
    pregunta: 'No tenemos tiempo.',
    respuesta:
      'Precisamente por eso. Os pedimos poco: unos formularios por área y unas sesiones cortas con quien hace el trabajo. Del resto nos encargamos nosotros, y el diagnóstico está listo en 7 a 30 días según el tamaño de la empresa.',
  },
  {
    pregunta: '¿Y si no hace falta IA?',
    respuesta:
      'Te lo diremos. Muchas veces lo que más tiempo ahorra es ordenar un proceso o quitar una herramienta que sobra. No todo necesita IA, y decidir no implementar también es valor.',
  },
  {
    pregunta: '¿Qué pasa con nuestros datos?',
    respuesta:
      'Firmamos la confidencialidad desde el primer día, antes de que nos cuentes nada. Trabajamos en un espacio privado, los datos se guardan en Europa y no autorizamos que tu información se use para entrenar modelos de IA.',
  },
];

const MARGENES = 'px-5 sm:px-8 lg:px-16';
const CONTENEDOR = 'mx-auto max-w-[90rem]';

/**
 * Sección editorial: título a la izquierda (4 columnas), contenido a la derecha (8).
 * Lo que va en `anchoCompleto` ocupa las 12 columnas, debajo.
 */
function Seccion({
  id,
  titulo,
  children,
  anchoCompleto,
}: {
  id: string;
  titulo: ReactNode;
  children: ReactNode;
  anchoCompleto?: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className={MARGENES}>
      <div className={`${CONTENEDOR} grid gap-10 border-t border-linea py-20 lg:grid-cols-12 lg:gap-8 lg:py-28`}>
        <h2 id={`${id}-titulo`} className="max-w-titular text-titulo text-marino lg:col-span-4">
          {titulo}
        </h2>
        <div className="lg:col-span-8">{children}</div>
        {anchoCompleto && <div className="lg:col-span-12">{anchoCompleto}</div>}
      </div>
    </section>
  );
}

export default function Portada() {
  const conFoto = hayFotoDavid();
  return (
    <>
      {/* Sin enlace al test en la cabecera: el botón principal está justo debajo. */}
      <Cabecera />
      <main id="contenido" className="flex-1">
        {/* Portada: lo único audaz de la web. */}
        <section aria-labelledby="portada-titulo" className={MARGENES}>
          <div className={`${CONTENEDOR} grid items-center gap-14 pb-20 pt-6 lg:grid-cols-12 lg:gap-8 lg:pb-32 lg:pt-16`}>
            <div className="lg:col-span-6">
              <h1 id="portada-titulo" className="max-w-[12ch] text-display font-semibold text-marino">
                Tecnología que te quita trabajo, no que te da más.
              </h1>
              <p className="mt-5 max-w-[46ch] text-texto text-tinta-suave lg:mt-8">
                Analizamos cómo funciona tu empresa y te decimos qué ordenar, qué automatizar y dónde la IA te ahorra
                tiempo y dinero. Y también dónde no hace falta.
              </p>
              <div className="mt-7 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-8 lg:mt-10">
                <EnlaceBoton href="/test">Empezar el test (3 minutos)</EnlaceBoton>
                <EnlaceBoton href={URL_CONTACTO} variante="texto" className="self-start sm:self-auto">
                  Hablar con David
                </EnlaceBoton>
              </div>
            </div>
            <div className="lg:col-span-6 lg:pl-8">
              <DelEnredoAlFlujo />
            </div>
          </div>
        </section>

        <Seccion id="te-suena" titulo="¿Te suena?">
          <ul className="grid gap-x-12 sm:grid-cols-2">
            {DOLORES.map((d) => (
              <li key={d.titulo} className="border-t border-linea py-6 first:border-t-0 first:pt-0 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(2)]:pt-0">
                <h3 className="text-subtitulo text-marino">{d.titulo}</h3>
                <p className="mt-2 max-w-lectura text-tinta-suave">{d.texto}</p>
              </li>
            ))}
          </ul>
        </Seccion>

        <section aria-labelledby="ganas-titulo" className={MARGENES}>
          <div className={`${CONTENEDOR} border-t border-linea py-20 lg:py-28`}>
            <h2 id="ganas-titulo" className="max-w-[24ch] text-titulo text-marino">
              Más tiempo. Más margen. Una empresa que no depende de una sola persona.
            </h2>
            <p className="mt-6 max-w-lectura text-tinta-suave lg:mt-8">
              La tecnología tiene sentido cuando te devuelve horas, te ayuda a crecer o te deja vivir mejor. Si no, solo
              es otra herramienta más.
            </p>
          </div>
        </section>

        <Seccion
          id="metodo"
          titulo="Primero entender. Después automatizar."
          anchoCompleto={
          /* La misma línea de cinco nodos en la que acaba la animación de la portada. */
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
                <span aria-hidden="true" className="relative mt-1 block h-[1.125rem] w-[1.125rem] rounded-full border-[1.5px] border-marino bg-fondo lg:mt-0" />
                <div className="lg:mt-6">
                  <p className="text-detalle text-tinta-tenue">Fase {i + 1}</p>
                  <h3 className="mt-1 text-subtitulo text-marino">{f.nombre}</h3>
                  <p className="mt-2 max-w-[30ch] text-detalle text-tinta-suave">{f.descripcion}</p>
                </div>
              </li>
            ))}
          </ol>
          }
        >
          <p className="max-w-lectura text-tinta-suave">
            La IA no arregla una empresa desordenada: la hace ir más rápido en la dirección equivocada. Por eso empezamos
            por entender cómo trabajáis de verdad.
          </p>
        </Seccion>

        <Seccion id="como-trabajamos" titulo="Cómo trabajamos contigo">
          <table className="w-full text-left">
            <thead className="sr-only lg:not-sr-only">
              <tr className="text-detalle text-tinta-tenue">
                <th scope="col" className="pb-4 font-medium lg:w-[34%]">Paso</th>
                <th scope="col" className="pb-4 font-medium">Qué es</th>
                <th scope="col" className="pb-4 text-right font-medium lg:w-[24%]">Precio</th>
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

        <section aria-labelledby="final-titulo" className={MARGENES}>
          <div className={`${CONTENEDOR} grid gap-12 border-t border-linea py-20 lg:grid-cols-12 lg:items-end lg:gap-8 lg:py-32`}>
            <div className="lg:col-span-7">
              <h2 id="final-titulo" className="max-w-[16ch] text-titulo text-marino">
                ¿Cuánto tiempo está perdiendo tu empresa?
              </h2>
              <p className="mt-4 text-tinta-suave">Descúbrelo en 3 minutos.</p>
              <EnlaceBoton href="/test" className="mt-8 w-full sm:w-auto">
                Empezar el test
              </EnlaceBoton>
            </div>
            <div className="lg:col-span-5">
              <HablasConDavid conFoto={conFoto} />
            </div>
          </div>
        </section>
      </main>
      <Pie />
    </>
  );
}
