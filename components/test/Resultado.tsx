'use client';

import { forwardRef, useEffect, useState } from 'react';

import { EnlaceBoton } from '@/components/Boton';
import { HablasConDavid } from '@/components/HablasConDavid';
import { URL_RESERVA } from '@/lib/marca';
import { TEXTO_RESERVA, type ColorTest, type ResultadoTest } from '@/lib/test-ia360';

const COLORES: Record<ColorTest, { fondo: string; texto: string }> = {
  verde: { fondo: 'bg-exito', texto: 'text-exito' },
  ambar: { fondo: 'bg-aviso', texto: 'text-aviso' },
  rojo: { fondo: 'bg-peligro', texto: 'text-peligro' },
};
const NOMBRES: Record<ColorTest, string> = { verde: 'Verde', ambar: 'Ámbar', rojo: 'Rojo' };
const ORDEN_SEMAFORO: ColorTest[] = ['verde', 'ambar', 'rojo'];
const DURACION_CUENTA = 600;

/** Al aparecer el resultado, la cifra cuenta hasta su valor y las barras se llenan. Una vez. */
function useAparicion(objetivo: number) {
  const [valor, setValor] = useState(0);
  const [lleno, setLleno] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValor(objetivo);
      setLleno(true);
      return;
    }
    const inicio = performance.now();
    let fotograma = requestAnimationFrame(function paso(ahora) {
      const t = Math.min((ahora - inicio) / DURACION_CUENTA, 1);
      setValor(Math.round(objetivo * (1 - (1 - t) ** 3)));
      if (t < 1) fotograma = requestAnimationFrame(paso);
    });
    const temporizador = window.setTimeout(() => setLleno(true), 80);
    return () => {
      cancelAnimationFrame(fotograma);
      window.clearTimeout(temporizador);
    };
  }, [objetivo]);
  return { valor, lleno };
}

interface ResultadoProps {
  resultado: ResultadoTest;
  conFoto: boolean;
}

export const Resultado = forwardRef<HTMLHeadingElement, ResultadoProps>(function Resultado({ resultado, conFoto }, ref) {
  const { valor, lleno } = useAparicion(resultado.puntos);
  const colores = COLORES[resultado.color];
  // La agenda de la web manda; si no está configurada, la que indique el portal.
  const urlReserva = URL_RESERVA ?? resultado.llamada.url;

  return (
    <div className="entrar mt-10 sm:mt-14">
      <section aria-labelledby="resultado-titulo">
        <p className="text-detalle text-tinta-tenue">Tu resultado</p>
        <div className="mt-3 flex items-end justify-between gap-6">
          <p className="flex items-baseline gap-3">
            <span className="font-titulos text-display font-semibold tabular-nums text-marino" aria-hidden="true">
              {valor}
            </span>
            <span className="sr-only">{resultado.puntos}</span>
            <span className="text-tinta-tenue">de {resultado.maximo} puntos</span>
          </p>
          {/* Semáforo: tres tramos, el que toca encendido. */}
          <div aria-hidden="true" className="mb-3 flex gap-1">
            {ORDEN_SEMAFORO.map((c) => (
              <span key={c} className={`h-1.5 w-7 rounded-full ${c === resultado.color ? COLORES[c].fondo : 'bg-linea'}`} />
            ))}
          </div>
        </div>
        <p className={`mt-4 text-detalle font-medium ${colores.texto}`}>{resultado.nombreColor}</p>
        <h2 ref={ref} id="resultado-titulo" tabIndex={-1} className="mt-1 text-titulo text-marino outline-none">
          {resultado.titular}
        </h2>
        <p className="mt-4 max-w-lectura text-tinta-suave">{resultado.mensaje}</p>
      </section>

      <section aria-labelledby="bloques-titulo" className="mt-12 border-t border-linea pt-10">
        <h2 id="bloques-titulo" className="text-subtitulo text-marino">
          Tu empresa, por bloques
        </h2>
        <p className="mt-1 text-detalle text-tinta-tenue">Cuantos más puntos, más tiempo hay por recuperar.</p>
        <ul className="mt-6 space-y-6">
          {resultado.bloques.map((b, i) => {
            const c = COLORES[b.color];
            const porcentaje = b.maximo > 0 ? (b.puntos / b.maximo) * 100 : 0;
            return (
              <li key={b.clave}>
                <div className="flex items-baseline justify-between gap-4 text-detalle">
                  <span className="font-medium text-marino">{b.nombre}</span>
                  <span className={`shrink-0 tabular-nums ${c.texto}`}>
                    {NOMBRES[b.color]}, {b.puntos} de {b.maximo}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-linea" aria-hidden="true">
                  <div
                    className={`h-full rounded-full ${c.fondo} transition-[width] duration-700 ease-out`}
                    style={{ width: lleno ? `${Math.max(porcentaje, 3)}%` : '0%', transitionDelay: `${i * 70}ms` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {resultado.destacados.length > 0 && (
        <section aria-labelledby="destacados-titulo" className="mt-12 border-t border-linea pt-10">
          <h2 id="destacados-titulo" className="text-subtitulo text-marino">
            Dónde mirar primero
          </h2>
          <div className="mt-6 space-y-6">
            {resultado.destacados.map((d) => (
              <article key={d.clave}>
                <h3 className="text-detalle font-medium text-marino">{d.nombre}</h3>
                <p className="mt-1 max-w-lectura text-tinta">{d.frase}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="siguiente-titulo" className="mt-12 border-t border-linea pt-10">
        {resultado.llamada.mostrar ? (
          <>
            <h2 id="siguiente-titulo" className="text-subtitulo text-marino">
              El siguiente paso
            </h2>
            <p className="mt-2 max-w-lectura text-tinta-suave">
              En 30 minutos vemos tu resultado juntos y te digo por dónde empezaría. Además, te hemos enviado el resultado
              por correo.
            </p>
            {urlReserva ? (
              <EnlaceBoton href={urlReserva} className="mt-8 w-full">
                {TEXTO_RESERVA}
              </EnlaceBoton>
            ) : (
              <p className="mt-6 font-medium text-marino">{resultado.llamada.texto}</p>
            )}
            <div className="mt-8">
              <HablasConDavid conFoto={conFoto} />
            </div>
          </>
        ) : (
          <>
            <h2 id="siguiente-titulo" className="text-subtitulo text-marino">
              {resultado.llamada.texto}
            </h2>
            <p className="mt-2 max-w-lectura text-tinta-suave">
              Si no lo ves en unos minutos, revisa la carpeta de spam o de promociones.
            </p>
          </>
        )}
      </section>

      <p className="mt-12 border-t border-linea pt-6">
        <EnlaceBoton href="/" variante="texto">
          Volver a la portada
        </EnlaceBoton>
      </p>
    </div>
  );
});
