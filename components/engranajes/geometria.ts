// Cámara, anillos y proyección de la escena de engranajes. Sin WebGL: la usan
// el motor (motor.ts) y la imagen fija (con "reducir movimiento"), para que los
// nombres de los departamentos caigan en el mismo sitio en las dos.

export type Vec3 = [number, number, number];

export const DEPARTAMENTOS = ['Marketing', 'Ventas', 'Compras', 'Operaciones', 'Calidad', 'Administración'];

const CAMPO_VISION = (32 * Math.PI) / 180;
// Vista desde arriba en diagonal: los anillos se leen como círculos en el espacio.
const OJO: Vec3 = [0, 5.4, 8.6];
const MIRA: Vec3 = [0, -0.15, 0];
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
  /** La esfera central, el anillo de departamentos y el anillo interior de piezas. */
  radioCentro: number;
  radioAnillo: number;
  radioDepartamento: number;
  radioInterior: number;
  radioPieza: number;
  /** Zona visible alrededor del centro, para repartir el desorden. */
  mitadAncho: number;
  mitadAlto: number;
  /** Un punto de un anillo horizontal: ángulo 0 es el punto más cercano a la cámara. */
  enAnillo: (angulo: number, radio: number) => Vec3;
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

  // El anillo, con sus esferas y los nombres, cabe en el ancho y en el alto visibles.
  const radioAnillo = Math.min(mitadAncho * 0.74, mitadAlto * 1.05, 3.6);

  const enAnillo = (angulo: number, radio: number): Vec3 => [radio * Math.sin(angulo), 0, radio * Math.cos(angulo)];

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
    const y = (v[1] * f) / profundidad;
    return { x: ((x + 1) / 2) * ancho, y: ((1 - y) / 2) * alto, escala: (alto / 2) * (f / profundidad) };
  }

  return {
    ancho,
    alto,
    proyeccion,
    radioCentro: radioAnillo * 0.3,
    radioAnillo,
    radioDepartamento: radioAnillo * 0.13,
    radioInterior: radioAnillo * 0.6,
    radioPieza: radioAnillo * 0.045,
    mitadAncho,
    mitadAlto,
    enAnillo,
    aVista,
    proyectar,
  };
}

/**
 * Dónde va el nombre de un departamento: debajo si la esfera está en la mitad
 * de delante, encima si está detrás, y se desvanece al pasar por los lados
 * (donde se montaría con la esfera).
 */
export function getEtiqueta(geo: Geometria, centro: Vec3, radioPx: number) {
  const s = geo.proyectar(centro);
  const delante = centro[2] >= 0;
  const lado = Math.abs(centro[2]) / geo.radioAnillo;
  return {
    x: s.x,
    y: delante ? s.y + radioPx + 6 : s.y - radioPx - 6,
    delante,
    opacidad: Math.min(Math.max((lado - 0.18) / 0.27, 0), 1),
  };
}
