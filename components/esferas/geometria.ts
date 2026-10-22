// Cámara, circuito y proyección de la escena de esferas. Sin WebGL: la usan el
// motor (motor.ts) y la imagen fija (con "reducir movimiento"), para que los
// nombres de los departamentos caigan en el mismo sitio en las dos.

export type Vec3 = [number, number, number];

/**
 * Los seis departamentos, en el orden del circuito: tres por delante (de
 * izquierda a derecha) y tres por detrás (de derecha a izquierda).
 */
export const DEPARTAMENTOS = ['Marketing', 'Ventas', 'Compras', 'Operaciones', 'Calidad', 'Administración'];
export const POR_FILA = 3;

const CAMPO_VISION = (32 * Math.PI) / 180;
// Cámara elevada: el circuito se lee como un óvalo, con una fila delante y otra detrás.
const OJO: Vec3 = [0, 6, 8.6];
const MIRA: Vec3 = [0, -0.3, 0];
const CERCA = 0.1;
const LEJOS = 100;

const restar = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const punto = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cruz = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const normalizar = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

// Ejes de la cámara: hacia delante, derecha y arriba.
const DELANTE = normalizar(restar(MIRA, OJO));
export const DERECHA = normalizar(cruz(DELANTE, [0, 1, 0]));
export const ARRIBA = cruz(DERECHA, DELANTE);

export interface Geometria {
  ancho: number;
  alto: number;
  proyeccion: Float32Array;
  /** Un punto por departamento (ver DEPARTAMENTOS). */
  estaciones: Vec3[];
  /** Separación entre departamentos de una misma fila, en unidades de la escena. */
  separacion: number;
  /** Radio de los departamentos y de las piezas cuando están ordenados. */
  radioEstacion: number;
  radioPieza: number;
  /** Ancho y alto de la zona visible alrededor del flujo, para repartir el desorden. */
  mitadAncho: number;
  mitadAlto: number;
  /** Punto del circuito por el que circulan las piezas, de 0 a 1. */
  puntoPista: (s: number) => Vec3;
  aVista: (p: Vec3) => Vec3;
  /** Posición en pantalla (px) y cuántos px mide una unidad a esa distancia. */
  proyectar: (p: Vec3) => { x: number; y: number; escala: number };
}

export function getGeometria(ancho: number, alto: number): Geometria {
  const aspecto = ancho / Math.max(alto, 1);
  const distancia = Math.hypot(...restar(MIRA, OJO));
  const tangente = Math.tan(CAMPO_VISION / 2);
  const mitadAlto = tangente * distancia;
  const mitadAncho = mitadAlto * aspecto;

  // El circuito entero (recta, curvas y el radio de los pasos) cabe en el ancho
  // visible con margen, sin pasar de un máximo en pantallas anchas.
  // El óvalo es profundo para que las dos filas no se monten en pantalla.
  const PROPORCION_FONDO = 0.6;
  const anchoFlujo = Math.min((mitadAncho * 2 * 0.86 - 0.7) / (1 + PROPORCION_FONDO), 6.4);
  const separacion = anchoFlujo / (POR_FILA - 1);
  const fondoPista = Math.min(3.4, anchoFlujo * PROPORCION_FONDO);
  const tamano = Math.min(1, separacion / 2);
  const radioEstacion = 0.42 * tamano;
  const radioPieza = 0.15 * tamano;
  const y = MIRA[1];
  const zDelante = fondoPista / 2;
  const zCentro = 0;
  const radioCurva = fondoPista / 2;

  const estaciones: Vec3[] = DEPARTAMENTOS.map((_, i) =>
    i < POR_FILA
      ? [-anchoFlujo / 2 + i * separacion, y, zDelante]
      : [anchoFlujo / 2 - (i - POR_FILA) * separacion, y, zDelante - fondoPista],
  );

  // Circuito cerrado: recto por delante, curva, vuelta por detrás y curva.
  const largoCurva = Math.PI * radioCurva;
  const largo = 2 * anchoFlujo + 2 * largoCurva;
  function puntoPista(s: number): Vec3 {
    let u = (((s % 1) + 1) % 1) * largo;
    if (u < anchoFlujo) return [-anchoFlujo / 2 + u, y, zDelante];
    u -= anchoFlujo;
    if (u < largoCurva) {
      const a = u / radioCurva;
      return [anchoFlujo / 2 + radioCurva * Math.sin(a), y, zCentro + radioCurva * Math.cos(a)];
    }
    u -= largoCurva;
    if (u < anchoFlujo) return [anchoFlujo / 2 - u, y, zDelante - fondoPista];
    u -= anchoFlujo;
    const a = u / radioCurva;
    return [-anchoFlujo / 2 - radioCurva * Math.sin(a), y, zCentro - radioCurva * Math.cos(a)];
  }

  function aVista(p: Vec3): Vec3 {
    const r = restar(p, OJO);
    return [punto(r, DERECHA), punto(r, ARRIBA), -punto(r, DELANTE)];
  }

  // Perspectiva, por columnas (como la espera WebGL).
  const f = 1 / tangente;
  const proyeccion = new Float32Array([
    f / aspecto, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (LEJOS + CERCA) / (CERCA - LEJOS), -1,
    0, 0, (2 * LEJOS * CERCA) / (CERCA - LEJOS), 0,
  ]);

  function proyectar(p: Vec3) {
    const v = aVista(p);
    const profundidad = Math.max(-v[2], 0.01);
    const x = (v[0] * f) / aspecto / profundidad;
    const yNdc = (v[1] * f) / profundidad;
    return { x: ((x + 1) / 2) * ancho, y: ((1 - yNdc) / 2) * alto, escala: (alto / 2) * (f / profundidad) };
  }

  return {
    ancho,
    alto,
    proyeccion,
    estaciones,
    separacion,
    radioEstacion,
    radioPieza,
    mitadAncho,
    mitadAlto,
    puntoPista,
    aVista,
    proyectar,
  };
}
