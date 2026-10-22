// Cámara, flujo y proyección de la escena de esferas. Sin WebGL: la usan el
// motor (motor.ts) y la imagen fija (con "reducir movimiento"), para que los
// nombres de los pasos caigan en el mismo sitio en las dos.

export type Vec3 = [number, number, number];

export const ESTACIONES = ['Pedido', 'Almacén', 'Envío', 'Factura', 'Cobro'];

const CAMPO_VISION = (32 * Math.PI) / 180;
// Cámara algo elevada: el circuito se lee como un óvalo, no como dos filas.
const OJO: Vec3 = [0, 4.6, 9.4];
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
  estaciones: Vec3[];
  /** El punto de la vuelta (por detrás) que queda detrás de cada paso. */
  estacionesFondo: Vec3[];
  /** Separación entre pasos, en unidades de la escena. */
  separacion: number;
  /** Radio de los pasos y de las piezas cuando están ordenados. */
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
  const PROPORCION_FONDO = 0.36;
  const anchoFlujo = Math.min((mitadAncho * 2 * 0.84 - 0.7) / (1 + PROPORCION_FONDO), 7.6);
  const separacion = anchoFlujo / (ESTACIONES.length - 1);
  const fondoPista = Math.min(2.4, anchoFlujo * PROPORCION_FONDO);
  const tamano = Math.min(1, separacion / 1.3);
  const radioEstacion = 0.34 * tamano;
  const radioPieza = 0.13 * tamano;
  const y = MIRA[1];
  const zDelante = 0.7;
  const zCentro = zDelante - fondoPista / 2;
  const radioCurva = fondoPista / 2;

  const estaciones: Vec3[] = ESTACIONES.map((_, i) => [-anchoFlujo / 2 + i * separacion, y, zDelante]);
  const estacionesFondo: Vec3[] = estaciones.map(([x]) => [x, y, zDelante - fondoPista]);

  // Circuito cerrado: recto por delante (los cinco pasos), curva, vuelta por detrás y curva.
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
    estacionesFondo,
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
