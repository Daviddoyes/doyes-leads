import type { ReactNode } from 'react';

import { EnlaceBoton, Flecha } from '@/components/Boton';
import { Cabecera } from '@/components/Cabecera';
import { HablasConDavid } from '@/components/HablasConDavid';
import { Pie } from '@/components/Pie';
import { hayFotoDavid } from '@/lib/foto-david';
import { PRODUCTO, URL_CONTACTO } from '@/lib/marca';

// Textos de docs/web-test-ia360.md. Las fases, como en el portal (data/catalogo.ts).

const DOLORES: { titulo: string; texto: string; icono: ReactNode }[] = [
  {
    titulo: 'Todo pasa por ti.',
    texto: 'Si faltas una semana, la mitad de las cosas se paran.',
    icono: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />,
  },
  {
    titulo: 'Horas que se van.',
    texto: 'Tu equipo copia datos, prepara informes y responde lo mismo cada semana.',
    icono: <path d="M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  },
  {
    titulo: 'Herramientas que nadie usa bien.',
    texto: 'Pagas programas que se solapan y nadie aprovecha.',
    icono: <path d="M4 5h7v7H4zM13 12h7v7h-7zM13 5h7v4h-7zM4 15h7v4H4z" />,
  },
  {
    titulo: 'La IA, sin saber por dónde empezar.',
    texto: 'Sabes que puede ayudarte, pero no quieres tirar el dinero.',
    icono: <path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3Z" />,
  },
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

function Seccion({
  id,
  antetitulo,
  titulo,
  children,
  className = '',
}: {
  id?: string;
  antetitulo?: string;
  titulo: string;
  children: ReactNode;
  className?: string;
}) {
  const idTitulo = id ? `${id}-titulo` : undefined;
  return (
    <section id={id} aria-labelledby={idTitulo} className={`scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {antetitulo && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-acento">{antetitulo}</p>}
        <h2 id={idTitulo} className="max-w-3xl text-2xl font-semibold tracking-tight text-marino">
          {titulo}
        </h2>
        {children}
      </div>
    </section>
  );
}

function Icono({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-celeste-suave text-acento">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

/** Una vista de la primera pregunta del test, solo decorativa (escritorio). */
function MuestraTest() {
  return (
    <div aria-hidden="true" className="relative hidden lg:block">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-celeste-suave" />
      <div className="rounded-2xl border border-borde bg-superficie p-7 shadow-[0_20px_50px_-24px_rgba(0,12,52,0.35)]">
        <div className="flex items-center justify-between text-xs text-tinta-tenue">
          <span>Pregunta 1 de 11</span>
          <span>Test IA360</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-borde">
          <div className="h-full w-[9%] rounded-full bg-celeste" />
        </div>
        <p className="mt-6 font-titulos text-lg font-semibold leading-snug text-marino">
          Si la persona clave de tu empresa (quizá tú) faltara una semana, ¿qué pasaría?
        </p>
        <ul className="mt-5 space-y-2.5 text-sm">
          {['Nada, todo sigue', 'Algunas cosas se retrasarían', 'Muchas cosas se pararían', 'La empresa se pararía'].map((r, i) => (
            <li
              key={r}
              className={`rounded-xl border px-4 py-3 ${i === 2 ? 'border-marino bg-marino text-white' : 'border-borde text-tinta'}`}
            >
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Portada() {
  const conFoto = hayFotoDavid();
  return (
    <>
      <Cabecera conNavegacion />
      <main id="contenido" className="flex-1">
        {/* 1. Portada */}
        <section className="px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-acento">
                {PRODUCTO} · por Doyes Digital
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-marino">
                Tecnología que te quita trabajo, no que te da más.
              </h1>
              <p className="mt-5 max-w-xl text-base text-tinta-suave">
                Analizamos cómo funciona tu empresa y te decimos qué ordenar, qué automatizar y dónde la IA te ahorra
                tiempo y dinero. Y también dónde no hace falta.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <EnlaceBoton href="/test" tamano="grande">
                  Haz el Test IA360 (3 minutos)
                  <Flecha />
                </EnlaceBoton>
                <EnlaceBoton href={URL_CONTACTO} variante="secundario" tamano="grande">
                  Hablar con David
                </EnlaceBoton>
              </div>
            </div>
            <MuestraTest />
          </div>
        </section>

        {/* 2. ¿Te suena? */}
        <Seccion id="te-suena" titulo="¿Te suena?" className="bg-superficie">
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DOLORES.map((d) => (
              <li key={d.titulo} className="rounded-2xl border border-borde bg-fondo p-6">
                <Icono>{d.icono}</Icono>
                <h3 className="mt-5 text-lg font-semibold text-marino">{d.titulo}</h3>
                <p className="mt-2 text-tinta-suave">{d.texto}</p>
              </li>
            ))}
          </ul>
        </Seccion>

        {/* 3. Lo que ganas */}
        <section aria-labelledby="ganas-titulo" className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-acento">Lo que ganas</p>
            <h2 id="ganas-titulo" className="text-3xl font-semibold tracking-tight text-marino">
              Más tiempo. Más margen. Una empresa que no depende de una sola persona.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base text-tinta-suave">
              La tecnología tiene sentido cuando te devuelve horas, te ayuda a crecer o te deja vivir mejor. Si no, solo
              es otra herramienta más.
            </p>
          </div>
        </section>

        {/* 4. El método */}
        <Seccion id="metodo" antetitulo="El método" titulo="Primero entender. Después automatizar." className="bg-superficie">
          <p className="mt-5 max-w-2xl text-base text-tinta-suave">
            La IA no arregla una empresa desordenada: la hace ir más rápido en la dirección equivocada. Por eso empezamos
            por entender cómo trabajáis de verdad.
          </p>
          <ol className="mt-12 grid gap-0 lg:grid-cols-5 lg:gap-6">
            {FASES.map((f, i) => (
              <li key={f.nombre} className="relative flex gap-4 pb-8 last:pb-0 lg:flex-col lg:gap-0 lg:pb-0">
                {/* Línea que une las fases: vertical en móvil, horizontal en escritorio. */}
                {i < FASES.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-px bg-borde lg:left-12 lg:top-5 lg:h-px lg:w-[calc(100%-1.5rem)]"
                  />
                )}
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-celeste bg-superficie font-titulos text-sm font-semibold text-marino">
                  {i + 1}
                </span>
                <div className="pt-1.5 lg:pt-5">
                  <h3 className="text-lg font-semibold text-marino">{f.nombre}</h3>
                  <p className="mt-1.5 text-tinta-suave">{f.descripcion}</p>
                </div>
              </li>
            ))}
          </ol>
        </Seccion>

        {/* 5. Cómo trabajamos contigo */}
        <Seccion id="como-trabajamos" antetitulo="Paso a paso" titulo="Cómo trabajamos contigo">
          <ol className="mt-10 grid gap-4 lg:grid-cols-3">
            {PASOS.map((p, i) => {
              const primero = i === 0;
              return (
                <li
                  key={p.nombre}
                  className={`flex flex-col rounded-2xl border p-6 sm:p-7 ${
                    primero ? 'border-marino bg-marino text-white' : 'border-borde bg-superficie'
                  }`}
                >
                  <span className={`text-xs font-semibold uppercase tracking-[0.14em] ${primero ? 'text-celeste' : 'text-acento'}`}>
                    Paso {i + 1}
                  </span>
                  <h3 className={`mt-3 text-xl font-semibold ${primero ? 'text-white' : 'text-marino'}`}>{p.nombre}</h3>
                  <p className={`mt-2 flex-1 ${primero ? 'text-white/80' : 'text-tinta-suave'}`}>{p.texto}</p>
                  <p
                    className={`mt-6 border-t pt-4 font-titulos text-lg font-semibold ${
                      primero ? 'border-white/20 text-white' : 'border-borde text-marino'
                    }`}
                  >
                    {p.precio}
                  </p>
                  {primero && (
                    <EnlaceBoton href="/test" className="mt-5 !bg-white !text-marino hover:!bg-celeste-suave">
                      Haz el Test IA360
                      <Flecha />
                    </EnlaceBoton>
                  )}
                </li>
              );
            })}
          </ol>
        </Seccion>

        {/* 6. Qué recibes con el Diagnóstico */}
        <Seccion id="que-recibes" antetitulo={`Diagnóstico ${PRODUCTO}`} titulo="Qué recibes con el Diagnóstico" className="bg-superficie">
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {ENTREGABLES.map((e, i) => (
              <li key={e.titulo} className="flex gap-4 rounded-2xl border border-borde bg-fondo p-6 sm:p-7">
                <span aria-hidden="true" className="font-titulos text-2xl font-semibold leading-none text-celeste">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-marino">{e.titulo}</h3>
                  <p className="mt-2 text-tinta-suave">{e.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </Seccion>

        {/* 8. Preguntas frecuentes */}
        <Seccion id="preguntas" antetitulo="Preguntas frecuentes" titulo="Lo que nos suelen preguntar">
          <div className="mt-10 max-w-3xl divide-y divide-borde border-y border-borde">
            {PREGUNTAS_FRECUENTES.map((p) => (
              <details key={p.pregunta} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-titulos text-base font-medium text-marino [&::-webkit-details-marker]:hidden">
                  {p.pregunta}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="h-5 w-5 shrink-0 text-acento transition-transform duration-200 group-open:rotate-45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M10 4v12M4 10h12" />
                  </svg>
                </summary>
                <p className="pb-5 pr-8 text-tinta-suave">{p.respuesta}</p>
              </details>
            ))}
          </div>
        </Seccion>

        {/* 9. Llamada final, con 7. Hablas con David */}
        <section aria-labelledby="final-titulo" className="px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-marino px-6 py-12 text-center sm:px-12 sm:py-16">
            <h2 id="final-titulo" className="text-3xl font-semibold tracking-tight text-white">
              ¿Cuánto tiempo está perdiendo tu empresa?
            </h2>
            <p className="mt-4 text-base text-white/80">Descúbrelo en 3 minutos.</p>
            <EnlaceBoton href="/test" tamano="grande" className="mt-8 w-full !bg-celeste !text-marino hover:!bg-white sm:w-auto">
              Haz el Test IA360
              <Flecha />
            </EnlaceBoton>
            <div className="mx-auto mt-10 flex max-w-md justify-center border-t border-white/15 pt-8">
              <HablasConDavid conFoto={conFoto} invertido />
            </div>
          </div>
        </section>
      </main>
      <Pie />
    </>
  );
}
