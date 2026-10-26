'use client';

import { useEffect, useRef, useState } from 'react';

import simboloPng from '@/public/marca/simbolo.png';

import type { Escena, PosicionNombre } from './motor';

/*
 * Fondo de la primera pantalla de /v3. El degradado de CSS está desde el primer
 * momento; la escena 3D (motor.ts) se descarga cuando el navegador queda libre y
 * aparece encima con un fundido. Con "reducir movimiento", un solo fotograma de
 * la escena ya ordenada. Sin WebGL2, el dibujo fijo de abajo.
 */

const DEPARTAMENTOS = ['Marketing', 'Ventas', 'Compras', 'Operaciones', 'Calidad', 'Administración'];

/** El mismo fondo que pinta la escena, para que no se note el paso. */
export const FONDO_NOCHE = 'radial-gradient(ellipse 75% 65% at 50% 38%, #00103f 0%, #000a2b 38%, #01030d 100%)';

type Modo = 'esperando' | 'viva' | 'sin-webgl';

function getEquipo() {
  const movil = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const modesto = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  return {
    movil,
    // En equipos modestos, menos partículas, menos resolución y sin bloom.
    bloom: !modesto,
    particulas: modesto ? 90 : movil ? 260 : 520,
    dpr: modesto ? 1 : Math.min(window.devicePixelRatio || 1, 1.5),
  };
}

function tieneWebGL2(): boolean {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

async function cargarSimbolo(): Promise<HTMLImageElement | null> {
  try {
    const imagen = new Image();
    imagen.src = simboloPng.src;
    await imagen.decode();
    return imagen;
  } catch {
    return null;
  }
}

/** Sin WebGL2: la escena ordenada, dibujada. */
function EscenaDibujada() {
  return (
    <svg aria-hidden="true" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <defs>
        <radialGradient id="o-centro" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#3a5aa0" />
          <stop offset="0.45" stopColor="#06154a" />
          <stop offset="1" stopColor="#000a2b" />
        </radialGradient>
        <radialGradient id="o-cristal" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#e6f6ff" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#15a8f5" stopOpacity="0.35" />
          <stop offset="1" stopColor="#15a8f5" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <g fill="none" stroke="#15a8f5" strokeOpacity="0.35" strokeWidth="1.5">
        <ellipse cx="500" cy="300" rx="260" ry="60" transform="rotate(-8 500 300)" />
        <ellipse cx="500" cy="300" rx="320" ry="85" transform="rotate(10 500 300)" />
        <ellipse cx="500" cy="300" rx="390" ry="110" transform="rotate(-16 500 300)" />
      </g>
      <circle cx="500" cy="300" r="105" fill="url(#o-centro)" stroke="#15a8f5" strokeOpacity="0.6" strokeWidth="2" />
      <image href={simboloPng.src} x="436" y="262" width="128" height={(128 * simboloPng.height) / simboloPng.width} opacity="0.9" />
      {[
        [245, 330],
        [760, 270],
        [190, 240],
        [815, 360],
        [130, 380],
        [870, 220],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="30" fill="url(#o-cristal)" />
      ))}
    </svg>
  );
}

export function EscenaOrbita() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nombresRef = useRef<(HTMLLIElement | null)[]>([]);
  const [modo, setModo] = useState<Modo>('esperando');

  useEffect(() => {
    if (!tieneWebGL2()) {
      setModo('sin-webgl');
      return;
    }
    const fija = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const equipo = getEquipo();
    let cancelado = false;
    let escena: Escena | null = null;

    // Los nombres siguen a las esferas en cada fotograma, sin pasar por React. Para
    // que no ensucien: si dos chocan, solo el de la esfera más cercana, y ninguno
    // toca nunca el texto de la portada (titular, línea y botón).
    const contenedor = canvasRef.current?.parentElement;
    const colocarNombres = (nombres: PosicionNombre[]) => {
      const origen = contenedor?.getBoundingClientRect();
      const margen = 14;
      const ocupados: { x0: number; x1: number; y0: number; y1: number }[] = origen
        ? Array.from(document.querySelectorAll('[data-zona-texto]')).map((pieza) => {
            const t = pieza.getBoundingClientRect();
            return { x0: t.left - origen.left - margen, x1: t.right - origen.left + margen, y0: t.top - origen.top - margen, y1: t.bottom - origen.top + margen };
          })
        : [];
      const limite = Infinity;
      nombres
        .map((n, i) => ({ n, i }))
        .sort((a, b) => a.n.profundidad - b.n.profundidad)
        .forEach(({ n, i }) => {
          const li = nombresRef.current[i];
          if (!li) return;
          const mitad = li.offsetWidth / 2;
          const x = Math.min(Math.max(n.x, mitad + 6), window.innerWidth - mitad - 6);
          const caja = { x0: x - mitad - 6, x1: x + mitad + 6, y0: n.y - 4, y1: n.y + li.offsetHeight + 4 };
          const choca = ocupados.some((o) => caja.x0 < o.x1 && caja.x1 > o.x0 && caja.y0 < o.y1 && caja.y1 > o.y0);
          const visible = n.opacidad > 0.01 && !choca && caja.y1 < limite;
          if (visible) ocupados.push(caja);
          li.style.transform = `translate(${x}px, ${n.y}px) translate(-50%, 0)`;
          li.style.opacity = String(visible ? n.opacidad * 0.8 : 0);
        });
    };

    async function cargar() {
      try {
        const [{ crearEscena }, simbolo] = await Promise.all([import('./motor'), cargarSimbolo()]);
        if (cancelado || !canvasRef.current) return;
        escena = crearEscena(canvasRef.current, {
          dpr: equipo.dpr,
          bloom: equipo.bloom,
          particulas: equipo.particulas,
          simbolo,
          nombresPasajeros: equipo.movil,
          fija,
          onNombres: colocarNombres,
        });
        setModo('viva');
      } catch {
        if (!cancelado) setModo('sin-webgl');
      }
    }

    // El texto ya está: la escena espera a que el navegador quede libre.
    const programar = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 200));
    const id = programar(() => void cargar());
    return () => {
      cancelado = true;
      window.cancelIdleCallback?.(id as number);
      escena?.destruir();
    };
  }, []);

  return (
    <div
      role="img"
      aria-label="Una esfera central con el símbolo de Doyes Digital y, a su alrededor, seis esferas de cristal (marketing, ventas, compras, operaciones, calidad y administración) que, desordenadas al principio, encajan en tres órbitas de luz y giran juntas."
      className="absolute inset-0 -z-10 select-none"
      style={{ background: FONDO_NOCHE }}
    >
      {modo === 'sin-webgl' ? (
        <EscenaDibujada />
      ) : (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${modo === 'viva' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      <ol aria-hidden="true">
        {DEPARTAMENTOS.map((nombre, i) => (
          <li
            key={nombre}
            ref={(li) => {
              nombresRef.current[i] = li;
            }}
            className="pointer-events-none absolute left-0 top-0 whitespace-nowrap text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-white/90 [text-shadow:0_0_10px_#01030d]"
            style={{ opacity: 0 }}
          >
            {nombre}
          </li>
        ))}
      </ol>
    </div>
  );
}
