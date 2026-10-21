import { forwardRef } from 'react';

import { EnlaceBoton, Flecha } from '@/components/Boton';
import { HablasConDavid } from '@/components/HablasConDavid';
import { URL_RESERVA } from '@/lib/marca';
import { TEXTO_RESERVA, type ColorTest, type ResultadoTest } from '@/lib/test-ia360';

const COLORES: Record<ColorTest, { fondo: string; suave: string; texto: string; borde: string }> = {
  verde: { fondo: 'bg-exito', suave: 'bg-exito-suave', texto: 'text-exito', borde: 'border-exito/30' },
  ambar: { fondo: 'bg-aviso', suave: 'bg-aviso-suave', texto: 'text-aviso', borde: 'border-aviso/30' },
  rojo: { fondo: 'bg-peligro', suave: 'bg-peligro-suave', texto: 'text-peligro', borde: 'border-peligro/30' },
};

const NOMBRES: Record<ColorTest, string> = { verde: 'Verde', ambar: 'Ámbar', rojo: 'Rojo' };
const ORDEN_SEMAFORO: ColorTest[] = ['verde', 'ambar', 'rojo'];

function Semaforo({ color }: { color: ColorTest }) {
  return (
    <div aria-hidden="true" className="flex gap-2 rounded-full bg-marino p-2">
      {ORDEN_SEMAFORO.map((c) => (
        <span
          key={c}
          className={`h-5 w-5 rounded-full transition-opacity ${COLORES[c].fondo} ${c === color ? 'opacity-100 ring-2 ring-white/70' : 'opacity-25'}`}
        />
      ))}
    </div>
  );
}

interface ResultadoProps {
  resultado: ResultadoTest;
  conFoto: boolean;
}

export const Resultado = forwardRef<HTMLHeadingElement, ResultadoProps>(function Resultado({ resultado, conFoto }, ref) {
  const colores = COLORES[resultado.color];
  // La agenda de la web manda; si no está configurada, la que indique el portal.
  const urlReserva = URL_RESERVA ?? resultado.llamada.url;

  return (
    <div className="animate-aparecer space-y-6">
      <section aria-labelledby="resultado-titulo" className={`rounded-3xl border bg-superficie p-6 sm:p-8 ${colores.borde}`}>
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-acento">Tu resultado</p>
          <Semaforo color={resultado.color} />
        </div>
        <p className="mt-6 flex items-baseline gap-2">
          <span className="font-titulos text-4xl font-semibold text-marino">{resultado.puntos}</span>
          <span className="text-tinta-tenue">de {resultado.maximo} puntos</span>
        </p>
        <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colores.suave} ${colores.texto}`}>
          {resultado.nombreColor}
        </p>
        <h1 ref={ref} id="resultado-titulo" tabIndex={-1} className="mt-4 text-2xl font-semibold tracking-tight text-marino outline-none">
          {resultado.titular}
        </h1>
        <p className="mt-3 text-base text-tinta-suave">{resultado.mensaje}</p>
        <p className="mt-4 text-xs text-tinta-tenue">Cuantos más puntos, más tiempo hay por recuperar.</p>
      </section>

      <section aria-labelledby="bloques-titulo" className="rounded-3xl border border-borde bg-superficie p-6 sm:p-8">
        <h2 id="bloques-titulo" className="text-lg font-semibold text-marino">
          Tu empresa, por bloques
        </h2>
        <ul className="mt-5 space-y-5">
          {resultado.bloques.map((b) => {
            const c = COLORES[b.color];
            const porcentaje = b.maximo > 0 ? Math.round((b.puntos / b.maximo) * 100) : 0;
            return (
              <li key={b.clave}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium text-marino">{b.nombre}</span>
                  <span className={`shrink-0 text-xs font-semibold ${c.texto}`}>
                    {NOMBRES[b.color]} · {b.puntos}/{b.maximo}
                  </span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-fondo" aria-hidden="true">
                  <div className={`h-full rounded-full ${c.fondo}`} style={{ width: `${Math.max(porcentaje, 4)}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {resultado.destacados.length > 0 && (
        <section aria-labelledby="destacados-titulo" className="space-y-3">
          <h2 id="destacados-titulo" className="px-1 text-lg font-semibold text-marino">
            Dónde mirar primero
          </h2>
          {resultado.destacados.map((d) => {
            const c = COLORES[d.color];
            return (
              <article key={d.clave} className="relative overflow-hidden rounded-2xl border border-borde bg-superficie p-5 pl-6 sm:p-6 sm:pl-7">
                <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${c.fondo}`} />
                <h3 className={`text-sm font-semibold ${c.texto}`}>{d.nombre}</h3>
                <p className="mt-1.5 text-base text-tinta">{d.frase}</p>
              </article>
            );
          })}
        </section>
      )}

      <section aria-label="Siguiente paso" className="rounded-3xl bg-marino p-6 text-white sm:p-8">
        {resultado.llamada.mostrar ? (
          <>
            <h2 className="text-xl font-semibold text-white">El siguiente paso</h2>
            <p className="mt-2 text-white/80">
              En 30 minutos vemos tu resultado juntos y te digo por dónde empezaría. Además, te hemos enviado el resultado
              por correo.
            </p>
            {urlReserva ? (
              <EnlaceBoton href={urlReserva} tamano="grande" className="mt-6 w-full !bg-celeste !text-marino hover:!bg-white">
                {TEXTO_RESERVA}
                <Flecha />
              </EnlaceBoton>
            ) : (
              <p className="mt-6 rounded-2xl bg-white/10 p-4 font-medium">{resultado.llamada.texto}</p>
            )}
            <div className="mt-6 border-t border-white/15 pt-6">
              <HablasConDavid conFoto={conFoto} invertido />
            </div>
          </>
        ) : (
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">{resultado.llamada.texto}</h2>
              <p className="mt-1 text-white/80">Si no lo ves en unos minutos, revisa la carpeta de spam o promociones.</p>
            </div>
          </div>
        )}
      </section>

      <p className="text-center">
        <EnlaceBoton href="/" variante="secundario">
          Volver a la portada
        </EnlaceBoton>
      </p>
    </div>
  );
});
