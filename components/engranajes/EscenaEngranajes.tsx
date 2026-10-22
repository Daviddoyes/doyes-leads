'use client';

import { useEffect, useRef, useState } from 'react';

import { DEPARTAMENTOS, getEtiqueta, getGeometria, type Geometria, type Vec3 } from './geometria';
import type { Escena, PosicionDepartamento } from './motor';

/*
 * La imagen protagonista de la portada: una esfera central y, alrededor, los
 * seis departamentos y piezas pequeñas, desordenados, que reaccionan al ratón
 * o al dedo. A los pocos segundos de verse (o al hacer scroll) se ordenan en
 * dos anillos que giran sincronizados, como engranajes.
 *
 * El texto de la portada no espera a esto: el motor (motor.ts) se descarga
 * cuando el navegador queda libre. Con "reducir movimiento", o sin WebGL2,
 * se ve una imagen fija de los anillos ya ordenados.
 */

type Modo = 'esperando' | 'viva' | 'fija';

const ESPERA_ORDEN = 3000;
const PAUSA_VER_DE_NUEVO = 2200;

function getEquipo() {
  const movil = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const modesto = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  return {
    piezas: modesto ? 10 : movil ? 16 : 24,
    dpr: Math.min(window.devicePixelRatio || 1, movil ? 1.75 : 2),
  };
}

function tieneWebGL2(): boolean {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

/** Ángulo de cada departamento en la imagen fija: ninguno cae en los lados, donde su nombre no se lee. */
const anguloFijo = (i: number) => (i * 2 * Math.PI) / DEPARTAMENTOS.length;

/** Los anillos ordenados, dibujados sin WebGL: para "reducir movimiento" o navegadores sin WebGL2. */
function AnillosFijos({ geo }: { geo: Geometria }) {
  const piezas = 14;
  const esferas = [
    { p: [0, 0, 0] as Vec3, r: geo.radioCentro, color: 'url(#fijo-marino)' },
    ...DEPARTAMENTOS.map((_, i) => ({ p: geo.enAnillo(anguloFijo(i), geo.radioAnillo), r: geo.radioDepartamento, color: 'url(#fijo-celeste)' })),
    ...Array.from({ length: piezas }, (_, j) => ({
      p: geo.enAnillo((j * 2 * Math.PI) / piezas + 0.2, geo.radioInterior),
      r: geo.radioPieza,
      color: j % 3 === 0 ? 'url(#fijo-marino)' : 'url(#fijo-perla)',
    })),
  ]
    .map((o) => ({ ...o, s: geo.proyectar(o.p), z: geo.aVista(o.p)[2] }))
    .sort((a, b) => a.z - b.z);
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox={`0 0 ${geo.ancho} ${geo.alto}`}>
      <defs>
        <radialGradient id="fijo-marino" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#5b6684" />
          <stop offset="0.35" stopColor="#0b1a4a" />
          <stop offset="1" stopColor="#000c34" />
        </radialGradient>
        <radialGradient id="fijo-celeste" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#bfe7fc" />
          <stop offset="0.45" stopColor="#15a8f5" />
          <stop offset="1" stopColor="#0b6fa6" />
        </radialGradient>
        <radialGradient id="fijo-perla" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#e8ebf1" />
          <stop offset="1" stopColor="#a8b3c7" />
        </radialGradient>
      </defs>
      {esferas.map(({ s, r, color }, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={r * s.escala} fill={color} />
      ))}
    </svg>
  );
}

export function EscenaEngranajes() {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const etiquetasRef = useRef<(HTMLLIElement | null)[]>([]);
  const escenaRef = useRef<Escena | null>(null);
  const [modo, setModo] = useState<Modo>('esperando');
  const [ordenada, setOrdenada] = useState(false);
  const [geoFija, setGeoFija] = useState<Geometria | null>(null);

  // Los nombres siguen a las esferas en cada fotograma, sin pasar por React.
  function colocarEtiquetas(geo: Geometria, departamentos: PosicionDepartamento[]) {
    departamentos.forEach((d, i) => {
      const li = etiquetasRef.current[i];
      if (!li) return;
      const e = getEtiqueta(geo, d.centro, d.radioPx);
      // Que el nombre no se salga por los lados del móvil.
      const mitad = li.offsetWidth / 2;
      const x = Math.min(Math.max(e.x, mitad + 4), geo.ancho - mitad - 4);
      li.style.transform = `translate(${x}px, ${e.y}px) translate(-50%, ${e.delante ? '0' : '-100%'})`;
      li.style.opacity = String(e.opacidad * Math.max(0, (d.orden - 0.7) / 0.3));
    });
  }

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !tieneWebGL2()) {
      const observador = new ResizeObserver(() => setGeoFija(getGeometria(contenedor.clientWidth, contenedor.clientHeight)));
      observador.observe(contenedor);
      setModo('fija');
      setOrdenada(true);
      return () => observador.disconnect();
    }

    let cancelado = false;
    let temporizador = 0;
    const limpiezas: (() => void)[] = [];
    const equipo = getEquipo();
    const ordenar = () => escenaRef.current?.ordenar();

    async function cargar() {
      try {
        const { crearEscena } = await import('./motor');
        if (cancelado || !canvasRef.current) return;
        escenaRef.current = crearEscena(canvasRef.current, {
          piezas: equipo.piezas,
          dpr: equipo.dpr,
          onOrden: setOrdenada,
          onFotograma: colocarEtiquetas,
        });
        setModo('viva');
      } catch {
        if (!cancelado) {
          setGeoFija(getGeometria(contenedor!.clientWidth, contenedor!.clientHeight));
          setModo('fija');
          setOrdenada(true);
        }
        return;
      }

      // Se ordena a los pocos segundos de verse, o antes si se hace scroll.
      const observador = new IntersectionObserver(
        ([entrada]) => {
          if (!entrada.isIntersecting) return;
          observador.disconnect();
          temporizador = window.setTimeout(ordenar, ESPERA_ORDEN);
        },
        { threshold: 0.4 },
      );
      observador.observe(contenedor!);
      const alDesplazar = () => {
        if (window.scrollY > 40) ordenar();
      };
      window.addEventListener('scroll', alDesplazar, { passive: true });
      limpiezas.push(() => observador.disconnect(), () => window.removeEventListener('scroll', alDesplazar));
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
    // colocarEtiquetas solo usa refs: no hace falta repetir el efecto.
  }, []);

  function verDeNuevo() {
    const escena = escenaRef.current;
    if (!escena) return;
    escena.desordenar();
    window.setTimeout(() => escena.ordenar(), PAUSA_VER_DE_NUEVO);
  }

  // En la imagen fija, los nombres se colocan una vez.
  const etiquetasFijas = geoFija
    ? DEPARTAMENTOS.map((_, i) => {
        const centro = geoFija.enAnillo(anguloFijo(i), geoFija.radioAnillo);
        return getEtiqueta(geoFija, centro, geoFija.radioDepartamento * geoFija.proyectar(centro).escala);
      })
    : null;

  return (
    <div>
      <div
        ref={contenedorRef}
        role="img"
        aria-label="Una esfera central rodeada por los seis departamentos (marketing, ventas, compras, operaciones, calidad y administración) y piezas pequeñas que, desordenadas al principio, se ordenan en dos anillos que giran sincronizados como engranajes."
        className="relative mx-auto h-[300px] w-full max-w-[64rem] touch-pan-y select-none sm:h-[420px] lg:h-[540px]"
      >
        {modo === 'fija' && geoFija ? (
          <AnillosFijos geo={geoFija} />
        ) : (
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${modo === 'viva' ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        <ol aria-hidden="true">
          {DEPARTAMENTOS.map((nombre, i) => {
            const fija = etiquetasFijas?.[i];
            return (
              <li
                key={nombre}
                ref={(li) => {
                  etiquetasRef.current[i] = li;
                }}
                className="absolute left-0 top-0 whitespace-nowrap text-detalle font-medium text-marino"
                style={
                  fija
                    ? { transform: `translate(${fija.x}px, ${fija.y}px) translate(-50%, ${fija.delante ? '0' : '-100%'})`, opacity: fija.opacidad }
                    : { opacity: 0 }
                }
              >
                {nombre}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-2 flex h-11 items-center justify-center">
        {modo === 'viva' && ordenada && (
          <button
            type="button"
            onClick={verDeNuevo}
            className="min-h-11 px-1 text-detalle font-medium text-tinta-tenue underline decoration-gris-azulado underline-offset-[6px] transition-colors duration-150 hover:text-marino hover:decoration-marino"
          >
            Ver de nuevo
          </button>
        )}
      </div>
    </div>
  );
}
