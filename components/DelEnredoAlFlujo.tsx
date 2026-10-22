'use client';

import { useEffect, useRef } from 'react';

/*
 * La imagen de la portada: un proceso enredado (líneas, notas, flechas
 * cruzadas) se ordena en cinco pasos unidos por una línea. Primero quieto
 * (entender), después se ordena y la línea se vuelve celeste (automatizar).
 * Los cinco nodos son los de la sección "El método".
 *
 * Se reproduce la primera vez que entra en pantalla, una vez por visita. Con
 * "reducir movimiento", o si ya se ha visto, aparece directamente ordenado.
 */

type Punto = [number, number];

const ANCHO = 600;
const ALTO = 280;
const LINEA_Y = 140;
export const NODOS_X = [60, 180, 300, 420, 540];
const CLAVE_VISTA = 'ia360-animacion-vista';

// ---------- Tiempos (ms) ----------
const CALMA = 350;
const ORDENAR = 1150;
const RETRASO_HEBRA = 45;
const RETRASO_NOTA = 70;
const INICIO_CELESTE = 1650;
const DURACION_CELESTE = 600;
const FIN = INICIO_CELESTE + DURACION_CELESTE;

// Aleatorio con semilla: el enredo es siempre el mismo, en el servidor y en el navegador.
function crearAleatorio(semilla: number) {
  let a = semilla;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const limitar = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const suavizar = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const progreso = (ms: number, inicio: number, duracion: number) => limitar((ms - inicio) / duracion, 0, 1);
const mezclar = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------- Hebras: 4 curvas cada una (13 puntos) ----------
const HEBRAS = 7;

function getHebraOrdenada(): Punto[] {
  const puntos: Punto[] = [];
  NODOS_X.forEach((x, k) => {
    if (k > 0) puntos.push([x - 40, LINEA_Y]);
    puntos.push([x, LINEA_Y]);
    if (k < NODOS_X.length - 1) puntos.push([x + 40, LINEA_Y]);
  });
  return puntos;
}

function getHebrasEnredadas(): Punto[][] {
  const azar = crearAleatorio(360);
  return Array.from({ length: HEBRAS }, () =>
    Array.from({ length: 13 }, (_, i) => {
      const esAncla = i % 3 === 0;
      const x = esAncla ? mezclar(80, 520, azar()) : mezclar(10, 590, azar());
      const y = esAncla ? mezclar(40, 240, azar()) : mezclar(0, 280, azar());
      return [x, y] as Punto;
    }),
  );
}

const ORDENADA = getHebraOrdenada();
const ENREDADAS = getHebrasEnredadas();

function aCamino(puntos: Punto[]): string {
  const f = (p: Punto) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  let d = `M${f(puntos[0])}`;
  for (let i = 1; i < puntos.length; i += 3) d += ` C${f(puntos[i])} ${f(puntos[i + 1])} ${f(puntos[i + 2])}`;
  return d;
}

function getHebra(indice: number, t: number): string {
  return aCamino(ENREDADAS[indice].map((p, i) => [mezclar(p[0], ORDENADA[i][0], t), mezclar(p[1], ORDENADA[i][1], t)]));
}

// ---------- Notas: cada una acaba siendo uno de los cinco nodos ----------
interface Nota {
  x: number;
  y: number;
  giro: number;
  ancho: number;
  alto: number;
}

const NOTAS: Nota[] = [
  { x: 150, y: 76, giro: -9, ancho: 58, alto: 40 },
  { x: 438, y: 58, giro: 7, ancho: 52, alto: 36 },
  { x: 268, y: 196, giro: 12, ancho: 60, alto: 42 },
  { x: 488, y: 206, giro: -6, ancho: 50, alto: 36 },
  { x: 92, y: 216, giro: 5, ancho: 46, alto: 34 },
];
// A qué nodo va cada nota: cruzadas, para que se vea que se reordenan.
const DESTINO_NOTA = [1, 3, 2, 4, 0];
const RADIO_NODO = 9;

function getNota(indice: number, t: number) {
  const n = NOTAS[indice];
  const ancho = mezclar(n.ancho, RADIO_NODO * 2, t);
  const alto = mezclar(n.alto, RADIO_NODO * 2, t);
  return {
    transform: `translate(${mezclar(n.x, NODOS_X[DESTINO_NOTA[indice]], t).toFixed(1)} ${mezclar(n.y, LINEA_Y, t).toFixed(1)}) rotate(${mezclar(n.giro, 0, t).toFixed(2)})`,
    x: -ancho / 2,
    y: -alto / 2,
    ancho,
    alto,
    radio: mezclar(3, RADIO_NODO, t),
  };
}

const FLECHAS = [
  'M118 250 C 230 100, 360 265, 470 80',
  'M490 242 C 380 86, 250 250, 132 68',
];
const LONGITUD_LINEA = NODOS_X[NODOS_X.length - 1] - NODOS_X[0];

export function DelEnredoAlFlujo() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const hebras = Array.from(svg.querySelectorAll<SVGPathElement>('[data-hebra]'));
    const notas = Array.from(svg.querySelectorAll<SVGGElement>('[data-nota]'));
    const flechas = svg.querySelector<SVGGElement>('[data-flechas]')!;
    const celeste = svg.querySelector<SVGPathElement>('[data-celeste]')!;

    function pintar(ms: number) {
      hebras.forEach((hebra, i) => {
        hebra.setAttribute('d', getHebra(i, suavizar(progreso(ms, CALMA + i * RETRASO_HEBRA, ORDENAR))));
        // Ordenadas, las hebras quedan debajo de la línea celeste y se apagan.
        hebra.style.opacity = String(1 - progreso(ms, INICIO_CELESTE + 200, 400));
      });
      notas.forEach((nota, i) => {
        const t = suavizar(progreso(ms, CALMA + 120 + i * RETRASO_NOTA, ORDENAR));
        const n = getNota(i, t);
        nota.setAttribute('transform', n.transform);
        const rect = nota.querySelector('rect')!;
        rect.setAttribute('x', n.x.toFixed(1));
        rect.setAttribute('y', n.y.toFixed(1));
        rect.setAttribute('width', n.ancho.toFixed(1));
        rect.setAttribute('height', n.alto.toFixed(1));
        rect.setAttribute('rx', n.radio.toFixed(1));
        nota.querySelector<SVGGElement>('[data-escrito]')!.style.opacity = String(1 - progreso(ms, CALMA, 350));
        rect.style.stroke = t >= 1 ? 'var(--color-marino)' : '';
      });
      flechas.style.opacity = String(1 - progreso(ms, CALMA, 500));
      celeste.style.strokeDashoffset = String(LONGITUD_LINEA * (1 - suavizar(progreso(ms, INICIO_CELESTE, DURACION_CELESTE))));
    }

    const yaVista = (() => {
      try {
        return window.sessionStorage.getItem(CLAVE_VISTA) === '1';
      } catch {
        return false;
      }
    })();
    if (yaVista || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pintar(FIN + 1000);
      return;
    }

    let fotograma = 0;
    function reproducir() {
      try {
        window.sessionStorage.setItem(CLAVE_VISTA, '1');
      } catch {
        // Sin almacenamiento, se repetirá en otra página: no pasa nada.
      }
      const inicio = performance.now();
      const paso = (ahora: number) => {
        const ms = ahora - inicio;
        pintar(ms);
        if (ms < FIN + 1000) fotograma = requestAnimationFrame(paso);
      };
      fotograma = requestAnimationFrame(paso);
    }

    // En el móvil queda debajo del botón: empieza cuando se ve, no al cargar.
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observador.disconnect();
        reproducir();
      },
      { threshold: 0.6 },
    );
    observador.observe(svg);
    return () => {
      observador.disconnect();
      cancelAnimationFrame(fotograma);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      role="img"
      aria-labelledby="enredo-titulo"
      className="h-auto w-full overflow-visible"
    >
      <title id="enredo-titulo">
        Un proceso enredado, con notas y flechas cruzadas, se ordena en cinco pasos: primero entender, después
        automatizar.
      </title>
      <defs>
        <marker id="punta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10" fill="none" stroke="var(--color-gris-azulado)" strokeWidth="1.5" />
        </marker>
      </defs>

      <g fill="none" stroke="var(--color-gris-azulado)" strokeWidth="1.25" strokeLinecap="round">
        {ENREDADAS.map((_, i) => (
          <path key={i} data-hebra d={getHebra(i, 0)} />
        ))}
      </g>

      <g data-flechas fill="none" stroke="var(--color-gris-azulado)" strokeWidth="1.5" strokeDasharray="5 6">
        {FLECHAS.map((d) => (
          <path key={d} d={d} markerEnd="url(#punta)" />
        ))}
      </g>

      <path
        data-celeste
        d={`M${NODOS_X[0]} ${LINEA_Y} H${NODOS_X[NODOS_X.length - 1]}`}
        stroke="var(--color-celeste)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={LONGITUD_LINEA}
        strokeDashoffset={LONGITUD_LINEA}
      />

      {NOTAS.map((nota, i) => {
        const n = getNota(i, 0);
        return (
          <g key={i} data-nota transform={n.transform}>
            <rect
              x={n.x}
              y={n.y}
              width={n.ancho}
              height={n.alto}
              rx={n.radio}
              fill="var(--color-superficie)"
              stroke="var(--color-gris-azulado)"
              strokeWidth="1.5"
            />
            {/* Unas líneas de "escrito a mano" dentro de la nota. */}
            <g data-escrito stroke="var(--color-gris-azulado)" strokeWidth="1.5" strokeLinecap="round">
              <path d={`M${-nota.ancho / 2 + 9} -6 h${nota.ancho - 22}`} />
              <path d={`M${-nota.ancho / 2 + 9} 4 h${nota.ancho - 30}`} />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
