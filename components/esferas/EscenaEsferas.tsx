'use client';

import { useEffect, useRef, useState } from 'react';

import { ESTACIONES, getGeometria, type Geometria } from './geometria';
import type { Escena } from './motor';

/*
 * Esferas desordenadas que reaccionan al ratón o al dedo y, al hacer scroll
 * (o a los pocos segundos en el móvil), se ordenan en un flujo de cinco pasos
 * por el que circulan despacio, en bucle.
 *
 * El texto de la portada no espera a esto: el motor (motor.ts) se descarga
 * cuando el navegador queda libre. Con "reducir movimiento", o sin WebGL2,
 * se ve una imagen fija del flujo ya ordenado.
 */

type Modo = 'esperando' | 'viva' | 'fija';

const ESPERA_MOVIL = 3500;
const PAUSA_VER_DE_NUEVO = 2200;

interface Equipo {
  cantidad: number;
  dpr: number;
  tactil: boolean;
}

function getEquipo(): Equipo {
  const tactil = window.matchMedia('(pointer: coarse)').matches;
  const movil = tactil || window.innerWidth < 768;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const modesto = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  return {
    cantidad: modesto ? 14 : movil ? 22 : 34,
    dpr: Math.min(window.devicePixelRatio || 1, movil ? 1.75 : 2),
    tactil,
  };
}

function tieneWebGL2(): boolean {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

/** El flujo ordenado, dibujado sin WebGL: para "reducir movimiento" o navegadores sin WebGL2. */
function FlujoFijo({ geo }: { geo: Geometria }) {
  const piezas = Array.from({ length: 12 }, (_, i) => geo.puntoPista(i / 12 + 0.02));
  const puntos = [
    ...piezas.map((p, i) => ({ p, r: geo.radioPieza, color: i % 3 === 0 ? 'url(#perla)' : 'url(#celeste)' })),
    ...geo.estaciones.map((p) => ({ p, r: geo.radioEstacion, color: 'url(#marino)' })),
  ]
    .map((o) => ({ ...o, s: geo.proyectar(o.p), z: geo.aVista(o.p)[2] }))
    .sort((a, b) => a.z - b.z);
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox={`0 0 ${geo.ancho} ${geo.alto}`}>
      <defs>
        <radialGradient id="marino" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#5b6684" />
          <stop offset="0.35" stopColor="#0b1a4a" />
          <stop offset="1" stopColor="#000c34" />
        </radialGradient>
        <radialGradient id="celeste" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#bfe7fc" />
          <stop offset="0.45" stopColor="#15a8f5" />
          <stop offset="1" stopColor="#0b6fa6" />
        </radialGradient>
        <radialGradient id="perla" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#e8ebf1" />
          <stop offset="1" stopColor="#a8b3c7" />
        </radialGradient>
      </defs>
      {puntos.map(({ s, r, color }, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={r * s.escala} fill={color} />
      ))}
    </svg>
  );
}

export function EscenaEsferas() {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const escenaRef = useRef<Escena | null>(null);
  const [modo, setModo] = useState<Modo>('esperando');
  const [ordenada, setOrdenada] = useState(false);
  const [geo, setGeo] = useState<Geometria | null>(null);

  // La geometría (para colocar los nombres de los pasos) sigue al tamaño del contenedor.
  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    const observador = new ResizeObserver(() => setGeo(getGeometria(contenedor.clientWidth, contenedor.clientHeight)));
    observador.observe(contenedor);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !tieneWebGL2()) {
      setModo('fija');
      setOrdenada(true);
      return;
    }

    let cancelado = false;
    let temporizador = 0;
    const limpiezas: (() => void)[] = [];
    const equipo = getEquipo();

    function ordenar() {
      escenaRef.current?.ordenar();
    }

    async function cargar() {
      try {
        const { crearEscena } = await import('./motor');
        if (cancelado || !canvasRef.current) return;
        escenaRef.current = crearEscena(canvasRef.current, {
          cantidad: equipo.cantidad,
          dpr: equipo.dpr,
          onOrden: setOrdenada,
        });
        setModo('viva');
      } catch {
        if (!cancelado) {
          setModo('fija');
          setOrdenada(true);
        }
        return;
      }

      // Se ordena al hacer scroll…
      const alDesplazar = () => {
        if (window.scrollY > 40) ordenar();
      };
      window.addEventListener('scroll', alDesplazar, { passive: true });
      limpiezas.push(() => window.removeEventListener('scroll', alDesplazar));
      alDesplazar();

      // …o, en el móvil, a los pocos segundos de verse.
      if (equipo.tactil && contenedorRef.current) {
        const observador = new IntersectionObserver(
          ([entrada]) => {
            if (!entrada.isIntersecting) return;
            observador.disconnect();
            temporizador = window.setTimeout(ordenar, ESPERA_MOVIL);
          },
          { threshold: 0.5 },
        );
        observador.observe(contenedorRef.current);
        limpiezas.push(() => observador.disconnect());
      }
    }

    // El texto y el botón ya están: la escena espera a que el navegador quede libre.
    const programar = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 200));
    const id = programar(() => void cargar());

    return () => {
      cancelado = true;
      window.cancelIdleCallback?.(id as number);
      window.clearTimeout(temporizador);
      limpiezas.forEach((f) => f());
      escenaRef.current?.destruir();
      escenaRef.current = null;
    };
  }, []);

  function verDeNuevo() {
    const escena = escenaRef.current;
    if (!escena) return;
    escena.desordenar();
    window.setTimeout(() => escena.ordenar(), PAUSA_VER_DE_NUEVO);
  }

  const etiquetas = geo
    ? geo.estaciones.map((p, i) => {
        const s = geo.proyectar(p);
        // Arriba, el nombre va por encima de las piezas que vuelven por detrás.
        const fondo = geo.proyectar(geo.estacionesFondo[i]);
        return { x: s.x, y: s.y, radio: geo.radioEstacion * s.escala, techo: fondo.y - geo.radioPieza * fondo.escala };
      })
    : [];
  // Si los pasos quedan muy juntos (móvil), los nombres se alternan arriba y abajo.
  const alternar = etiquetas.length > 1 && etiquetas[1].x - etiquetas[0].x < 86;

  return (
    <div>
      <div
        ref={contenedorRef}
        role="img"
        aria-label="Esferas desordenadas que se ordenan en un flujo de cinco pasos (pedido, almacén, envío, factura y cobro) por el que circulan: primero entender, después automatizar."
        className="relative h-[260px] w-full touch-pan-y select-none sm:h-[380px] lg:h-[560px]"
      >
        {/* La línea del flujo, por detrás de las esferas. */}
        {etiquetas.length > 0 && (
          <svg aria-hidden="true" className="absolute inset-0 h-full w-full" width="100%" height="100%">
            <line
              x1={etiquetas[0].x}
              y1={etiquetas[0].y}
              x2={etiquetas[etiquetas.length - 1].x}
              y2={etiquetas[etiquetas.length - 1].y}
              stroke="var(--color-celeste)"
              strokeWidth="2"
              strokeLinecap="round"
              className={`transition-opacity duration-700 ${ordenada ? 'opacity-100' : 'opacity-0'}`}
            />
          </svg>
        )}

        {modo === 'fija' && geo ? (
          <FlujoFijo geo={geo} />
        ) : (
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${modo === 'viva' ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        <ol aria-hidden="true">
          {etiquetas.map((e, i) => {
            const arriba = alternar && i % 2 === 1;
            return (
              <li
                key={ESTACIONES[i]}
                className={`absolute whitespace-nowrap text-detalle font-medium text-marino transition-opacity duration-700 ${
                  ordenada ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  left: e.x,
                  top: arriba ? e.techo - 8 : e.y + e.radio + 10,
                  transform: `translate(-50%, ${arriba ? '-100%' : '0'})`,
                  transitionDelay: ordenada ? `${i * 90}ms` : '0ms',
                }}
              >
                {ESTACIONES[i]}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-2 flex h-12 items-center justify-end">
        {modo === 'viva' && ordenada && (
          <button
            type="button"
            onClick={verDeNuevo}
            className="min-h-11 px-1 text-detalle font-medium text-tinta-suave underline decoration-gris-azulado underline-offset-[6px] transition-colors duration-150 hover:text-marino hover:decoration-marino"
          >
            Ver de nuevo
          </button>
        )}
      </div>
    </div>
  );
}
