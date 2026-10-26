'use client';

import { useEffect, useRef, useState } from 'react';

import simboloPng from '@/public/marca/simbolo.png';

import {
  DEPARTAMENTOS,
  ENCUADRE_PORTADA,
  getEtiqueta,
  getEtiquetaDebajo,
  getGeometria,
  type Encuadre,
  type Geometria,
  type Vec3,
} from './geometria';
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
 *
 * Variantes:
 *   portada    la de doyesdigital.com
 *   corazon    /v1: más grande, el símbolo dD en la esfera central, nombres siempre visibles
 *   inmersiva  /v2: igual, sobre fondo marino y a pantalla completa
 */

export type VarianteEscena = 'portada' | 'corazon' | 'inmersiva';

interface Ajustes {
  encuadre: Encuadre;
  oscuro: boolean;
  simbolo: boolean;
  /** Nombres siempre debajo de su esfera y siempre visibles, también en desorden. */
  nombresSiempre: boolean;
  /** Tamaño de la escena (la de la portada lo fija aquí; las otras lo dan desde fuera). */
  caja: string;
  nombre: string;
}

// Las nuevas miran más desde arriba (40°): los anillos se ven más redondos y los
// nombres de detrás caben entre su esfera y la central. Su tamaño no es una
// proporción fija: es el mayor anillo que cabe en el hueco, con sus nombres.
// En pantallas apaisadas, algo más bajo (37°): el anillo se abre a lo ancho y, en el mismo alto, es mayor.
const OJO_NUEVAS = (ancho: number, alto: number): Vec3 => (ancho > alto * 1.3 ? [0, 6.1, 8.1] : [0, 6.6, 7.9]);
/** Abajo queda sitio para "Ver de nuevo". */
const SITIO_VER_DE_NUEVO = 44;

/**
 * En /v2 el texto va encima de las esferas: el anillo ordenado empieza debajo de
 * él. Lo que ocupa el texto (margen, titular, línea y botón), estimado por tamaño.
 */
function getAlturaTextoV2(ancho: number, alto: number) {
  const texto = ancho < 640 ? 0.09 * alto + 300 : 0.11 * alto + 330;
  return Math.min(Math.max(texto / alto, 0.3), 0.62);
}

const AJUSTES: Record<VarianteEscena, Ajustes> = {
  portada: {
    encuadre: ENCUADRE_PORTADA,
    oscuro: false,
    simbolo: false,
    nombresSiempre: false,
    caja: 'mx-auto h-[300px] w-full max-w-[64rem] sm:h-[420px] lg:h-[540px]',
    nombre: 'text-detalle font-medium text-marino',
  },
  corazon: {
    encuadre: { ojo: OJO_NUEVAS, anchoAnillo: 0, altoAnillo: 0, radioMaximo: 6, bajar: 0, caja: { arriba: 0, abajo: SITIO_VER_DE_NUEVO, lados: 4 } },
    oscuro: false,
    simbolo: true,
    nombresSiempre: true,
    caja: 'h-full w-full',
    nombre: 'text-detalle font-medium text-marino [text-shadow:0_0_6px_#f7f6f3,0_0_2px_#f7f6f3]',
  },
  inmersiva: {
    encuadre: { ojo: OJO_NUEVAS, anchoAnillo: 0, altoAnillo: 0, radioMaximo: 6, bajar: 0, caja: { arriba: getAlturaTextoV2, abajo: SITIO_VER_DE_NUEVO, lados: 16 } },
    oscuro: true,
    simbolo: true,
    nombresSiempre: true,
    caja: 'h-full w-full',
    nombre: 'text-detalle font-medium text-white [text-shadow:0_1px_8px_#000c34,0_0_2px_#000c34]',
  },
};

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

/** El símbolo, ya decodificado, para la textura. Si no carga, la esfera va sin él. */
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

/**
 * Ángulo de cada departamento en la imagen fija. En la portada, ninguno cae en
 * los lados, donde su nombre no se lee; con los nombres siempre debajo, ninguno
 * justo detrás de la central, donde su nombre se montaría sobre ella.
 */
const getAnguloFijo = (ajustes: Ajustes) => (i: number) =>
  ((i + (ajustes.nombresSiempre ? 0.5 : 0)) * 2 * Math.PI) / DEPARTAMENTOS.length;

/** Ancho aproximado de un nombre (texto de detalle, ~7,6 px por letra), para que no se salga en la imagen fija. */
const anchoNombre = (nombre: string) => nombre.length * 7.6;

/** Los anillos ordenados, dibujados sin WebGL: para "reducir movimiento" o navegadores sin WebGL2. */
function AnillosFijos({ geo, ajustes }: { geo: Geometria; ajustes: Ajustes }) {
  const piezas = 14;
  const anguloFijo = getAnguloFijo(ajustes);
  const centro = { p: [0, 0, 0] as Vec3, r: geo.radioCentro, color: 'url(#fijo-marino)', esCentro: true };
  const esferas = [
    centro,
    ...DEPARTAMENTOS.map((_, i) => ({ p: geo.enAnillo(anguloFijo(i), geo.radioAnillo), r: geo.radioDepartamento, color: 'url(#fijo-celeste)', esCentro: false })),
    ...Array.from({ length: piezas }, (_, j) => ({
      p: geo.enAnillo((j * 2 * Math.PI) / piezas + 0.2, geo.radioInterior),
      r: geo.radioPieza,
      color: j % 3 === 0 ? 'url(#fijo-marino)' : 'url(#fijo-perla)',
      esCentro: false,
    })),
  ]
    .map((o) => ({ ...o, s: geo.proyectar(o.p), z: geo.aVista(o.p)[2] }))
    .sort((a, b) => a.z - b.z);
  const { oscuro } = ajustes;
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox={`0 0 ${geo.ancho} ${geo.alto}`}>
      <defs>
        <radialGradient id="fijo-marino" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor={oscuro ? '#7d8fb8' : '#5b6684'} />
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
        {/* Relieve del símbolo: una sombra por debajo y una luz por encima. */}
        <filter id="fijo-sombra">
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" />
        </filter>
        <filter id="fijo-luz">
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.3 0" />
        </filter>
      </defs>
      {esferas.map(({ s, r, color, esCentro }, i) => {
        const radio = r * s.escala;
        if (!esCentro || !ajustes.simbolo) return <circle key={i} cx={s.x} cy={s.y} r={radio} fill={color} />;
        const ancho = radio * 1.2;
        const alto = (ancho * simboloPng.height) / simboloPng.width;
        const caja = { x: s.x - ancho / 2, width: ancho, height: alto, href: simboloPng.src };
        // Como en la escena viva: algo por debajo del centro.
        const y = s.y + radio * 0.1 - alto / 2;
        return (
          <g key={i}>
            <circle cx={s.x} cy={s.y} r={radio} fill={color} {...(oscuro && { stroke: '#15a8f5', strokeOpacity: 0.45, strokeWidth: 1.5 })} />
            <image {...caja} y={y + 1.2} filter="url(#fijo-sombra)" />
            <image {...caja} y={y - 0.8} filter="url(#fijo-luz)" />
            <image {...caja} y={y} opacity={0.6} />
          </g>
        );
      })}
    </svg>
  );
}

interface EscenaEngranajesProps {
  variante?: VarianteEscena;
}

export function EscenaEngranajes({ variante = 'portada' }: EscenaEngranajesProps) {
  const ajustes = AJUSTES[variante];
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
      const e = ajustes.nombresSiempre ? getEtiquetaDebajo(geo, d.centro, d.radioPx) : getEtiqueta(geo, d.centro, d.radioPx);
      // Que el nombre no se salga por los lados del móvil.
      const mitad = li.offsetWidth / 2;
      const x = Math.min(Math.max(e.x, mitad + 4), geo.ancho - mitad - 4);
      li.style.transform = `translate(${x}px, ${e.y}px) translate(-50%, ${e.delante ? '0' : '-100%'})`;
      li.style.opacity = ajustes.nombresSiempre ? '1' : String(e.opacidad * Math.max(0, (d.orden - 0.7) / 0.3));
    });
  }

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    const geometriaFija = () => getGeometria(contenedor.clientWidth, contenedor.clientHeight, ajustes.encuadre);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !tieneWebGL2()) {
      const observador = new ResizeObserver(() => setGeoFija(geometriaFija()));
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
        const [{ crearEscena }, simbolo] = await Promise.all([import('./motor'), ajustes.simbolo ? cargarSimbolo() : null]);
        if (cancelado || !canvasRef.current) return;
        escenaRef.current = crearEscena(canvasRef.current, {
          piezas: equipo.piezas,
          dpr: equipo.dpr,
          onOrden: setOrdenada,
          onFotograma: colocarEtiquetas,
          encuadre: ajustes.encuadre,
          oscuro: ajustes.oscuro,
          simbolo,
          repartir: ajustes.nombresSiempre,
        });
        setModo('viva');
      } catch {
        if (!cancelado) {
          setGeoFija(geometriaFija());
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
    // colocarEtiquetas y ajustes no cambian mientras la escena vive: no hace falta repetir el efecto.
  }, []);

  function verDeNuevo() {
    const escena = escenaRef.current;
    if (!escena) return;
    escena.desordenar();
    window.setTimeout(() => escena.ordenar(), PAUSA_VER_DE_NUEVO);
  }

  // En la imagen fija, los nombres se colocan una vez.
  const anguloFijo = getAnguloFijo(ajustes);
  const etiquetasFijas = geoFija
    ? DEPARTAMENTOS.map((nombre, i) => {
        const centro = geoFija.enAnillo(anguloFijo(i), geoFija.radioAnillo);
        const radioPx = geoFija.radioDepartamento * geoFija.proyectar(centro).escala;
        if (!ajustes.nombresSiempre) return getEtiqueta(geoFija, centro, radioPx);
        const e = getEtiquetaDebajo(geoFija, centro, radioPx);
        const mitad = anchoNombre(nombre) / 2;
        return { ...e, x: Math.min(Math.max(e.x, mitad + 4), geoFija.ancho - mitad - 4) };
      })
    : null;

  const botonVerDeNuevo = modo === 'viva' && ordenada && (
    <button
      type="button"
      onClick={verDeNuevo}
      className={`min-h-11 px-1 text-detalle font-medium underline underline-offset-[6px] transition-colors duration-150 ${
        ajustes.oscuro
          ? 'text-white/70 decoration-white/40 hover:text-white hover:decoration-white'
          : 'text-tinta-tenue decoration-gris-azulado hover:text-marino hover:decoration-marino'
      }`}
    >
      Ver de nuevo
    </button>
  );

  const escena = (
    <div
      ref={contenedorRef}
      role="img"
      aria-label="Una esfera central rodeada por los seis departamentos (marketing, ventas, compras, operaciones, calidad y administración) y piezas pequeñas que, desordenadas al principio, se ordenan en dos anillos que giran sincronizados como engranajes."
      className={`relative touch-pan-y select-none ${ajustes.caja}`}
    >
      {modo === 'fija' && geoFija ? (
        <AnillosFijos geo={geoFija} ajustes={ajustes} />
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
              className={`absolute left-0 top-0 whitespace-nowrap ${ajustes.nombre}`}
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
  );

  // En la portada, "Ver de nuevo" va debajo; en las nuevas, encima de la escena, abajo, sin ocupar sitio.
  if (variante === 'portada') {
    return (
      <div>
        {escena}
        <div className="mt-2 flex h-11 items-center justify-center">{botonVerDeNuevo}</div>
      </div>
    );
  }
  // Llena el hueco que le dé la página (que debe ser relative).
  return (
    <div className="absolute inset-0">
      {escena}
      {botonVerDeNuevo && <div className="absolute inset-x-0 bottom-1 flex justify-center">{botonVerDeNuevo}</div>}
    </div>
  );
}
