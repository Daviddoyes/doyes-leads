// Cámara, anillos y proyección de la escena de engranajes. Sin WebGL: la usan
// el motor (motor.ts) y la imagen fija (con "reducir movimiento"), para que los
// nombres de los departamentos caigan en el mismo sitio en las dos.

export type Vec3 = [number, number, number];

export const DEPARTAMENTOS = ['Marketing', 'Ventas', 'Compras', 'Operaciones', 'Calidad', 'Administración'];

const CAMPO_VISION = (32 * Math.PI) / 180;
const MIRA: Vec3 = [0, -0.15, 0];
const CERCA = 0.1;
const LEJOS = 100;

/**
 * Cómo se encuadra la escena. Lo que no se indica queda como en la portada.
 *   ojo           desde dónde mira la cámara (más alto: los anillos se ven más redondos)
 *   anchoAnillo   qué parte del ancho visible puede ocupar el anillo
 *   altoAnillo    ídem del alto
 *   radioMaximo   tope del anillo, en unidades de la escena
 *   bajar         desplaza la escena hacia abajo en la pantalla (0 = centrada, 1 = media pantalla)
 *   caja          en lugar de las proporciones: el anillo más grande que cabe, con
 *                 sus esferas y nombres, en el hueco que dejan estos márgenes, y
 *                 centrado en él (se ignoran anchoAnillo, altoAnillo y bajar)
 */
export interface Encuadre {
  /** Puede depender del tamaño (p. ej. más bajo en pantallas apaisadas). */
  ojo: Vec3 | ((ancho: number, alto: number) => Vec3);
  anchoAnillo: number;
  altoAnillo: number;
  radioMaximo: number;
  bajar: number;
  caja?: {
    /** Arriba, en fracción del alto (p. ej. lo que ocupa el texto encima); puede depender del tamaño. */
    arriba: number | ((ancho: number, alto: number) => number);
    /** Abajo, en px (sitio para "Ver de nuevo"). */
    abajo: number;
    /** A cada lado, en px. */
    lados: number;
  };
}

/** Alto aproximado del nombre de un departamento, en px. */
const ALTO_NOMBRE = 24;
const PROPORCION = { centro: 0.3, departamento: 0.13, interior: 0.6, pieza: 0.045 };

// Vista desde arriba en diagonal: los anillos se leen como círculos en el espacio.
export const ENCUADRE_PORTADA: Encuadre = { ojo: [0, 5.4, 8.6], anchoAnillo: 0.74, altoAnillo: 1.05, radioMaximo: 3.6, bajar: 0 };

const restar = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const punto = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cruz = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const normalizar = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export interface Geometria {
  ancho: number;
  alto: number;
  proyeccion: Float32Array;
  /** Ejes de la cámara en la escena: para apartar las esferas del puntero. */
  derecha: Vec3;
  arriba: Vec3;
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

export function getGeometria(ancho: number, alto: number, encuadre: Encuadre = ENCUADRE_PORTADA): Geometria {
  const ojo = typeof encuadre.ojo === 'function' ? encuadre.ojo(ancho, alto) : encuadre.ojo;
  const delante = normalizar(restar(MIRA, ojo));
  const derecha = normalizar(cruz(delante, [0, 1, 0]));
  const arriba = cruz(derecha, delante);

  const aspecto = ancho / Math.max(alto, 1);
  const distancia = Math.hypot(...restar(MIRA, ojo));
  const tangente = Math.tan(CAMPO_VISION / 2);
  const f = 1 / tangente;
  const mitadAlto = tangente * distancia;
  const mitadAncho = mitadAlto * aspecto;

  const enAnillo = (angulo: number, radio: number): Vec3 => [radio * Math.sin(angulo), 0, radio * Math.cos(angulo)];

  function aVista(p: Vec3): Vec3 {
    const r = restar(p, ojo);
    return [punto(r, derecha), punto(r, arriba), -punto(r, delante)];
  }

  /** Proyección sin desplazar: posición en px y px por unidad. */
  function proyectarCentrado(p: Vec3) {
    const v = aVista(p);
    const profundidad = Math.max(-v[2], 0.01);
    const x = (v[0] * f) / aspecto / profundidad;
    const y = (v[1] * f) / profundidad;
    return { x: ((x + 1) / 2) * ancho, y: ((1 - y) / 2) * alto, escala: (alto / 2) * (f / profundidad) };
  }

  /** Lo que ocupa en pantalla el anillo ordenado de radio r: de arriba abajo y a cada lado del centro. */
  function medir(r: number) {
    const atras = proyectarCentrado([0, 0, -r]);
    const frente = proyectarCentrado([0, 0, r]);
    const lado = proyectarCentrado([r, 0, 0]);
    const centro = proyectarCentrado([0, 0, 0]);
    const rDep = r * PROPORCION.departamento;
    return {
      arriba: Math.min(atras.y - rDep * atras.escala, centro.y - r * PROPORCION.centro * centro.escala),
      abajo: frente.y + rDep * frente.escala + 4 + ALTO_NOMBRE,
      lado: lado.x + rDep * lado.escala - ancho / 2,
    };
  }

  let radioAnillo: number;
  let bajar = encuadre.bajar;
  if (encuadre.caja) {
    // El radio más grande que cabe en la caja (búsqueda binaria: el tamaño crece con el radio).
    const { caja } = encuadre;
    // Un poco de aire arriba: que la esfera de atrás no toque lo que haya encima (el botón).
    const techo = (typeof caja.arriba === 'function' ? caja.arriba(ancho, alto) : caja.arriba) * alto + 12;
    const disponible = alto - caja.abajo - techo - 4;
    let menor = 0.05;
    let mayor = encuadre.radioMaximo;
    for (let i = 0; i < 24; i++) {
      const r = (menor + mayor) / 2;
      const m = medir(r);
      if (m.abajo - m.arriba <= disponible && m.lado <= ancho / 2 - caja.lados) menor = r;
      else mayor = r;
    }
    radioAnillo = menor;
    // Y centrado en el hueco: se desplaza la imagen sin mover la cámara.
    const m = medir(radioAnillo);
    const desplazamiento = techo + (disponible - (m.abajo - m.arriba)) / 2 - m.arriba;
    bajar = (2 * desplazamiento) / alto;
  } else {
    // El anillo, con sus esferas y los nombres, cabe en el ancho y en el alto visibles.
    radioAnillo = Math.min(mitadAncho * encuadre.anchoAnillo, mitadAlto * encuadre.altoAnillo, encuadre.radioMaximo);
  }

  // Perspectiva, por columnas (como la espera WebGL). "bajar" desplaza la imagen
  // sin girar la cámara: la escena se ve igual, solo que más abajo.
  const proyeccion = new Float32Array([
    f / aspecto, 0, 0, 0,
    0, f, 0, 0,
    0, bajar, (LEJOS + CERCA) / (CERCA - LEJOS), -1,
    0, 0, (2 * LEJOS * CERCA) / (CERCA - LEJOS), 0,
  ]);

  function proyectar(p: Vec3) {
    const s = proyectarCentrado(p);
    return { ...s, y: s.y + (bajar * alto) / 2 };
  }

  return {
    ancho,
    alto,
    proyeccion,
    derecha,
    arriba,
    radioCentro: radioAnillo * PROPORCION.centro,
    radioAnillo,
    radioDepartamento: radioAnillo * PROPORCION.departamento,
    radioInterior: radioAnillo * PROPORCION.interior,
    radioPieza: radioAnillo * PROPORCION.pieza,
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

/** El nombre siempre debajo de su esfera y siempre visible (versiones /v1 y /v2). */
export function getEtiquetaDebajo(geo: Geometria, centro: Vec3, radioPx: number) {
  const s = geo.proyectar(centro);
  return { x: s.x, y: s.y + radioPx + 4, delante: true, opacidad: 1 };
}
