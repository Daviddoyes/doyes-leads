// La escena de engranajes de la portada (v1). Una esfera grande en el centro,
// las seis de los departamentos y unas cuantas pequeñas. Primero flotan
// desordenadas, chocan entre ellas y se apartan del puntero; al ordenarse,
// los departamentos forman un anillo alrededor de la central y las pequeñas
// otro por dentro, y los dos giran en sentidos contrarios, sincronizados como
// engranajes, en un bucle tranquilo que no se para.
//
// Física: cada esfera va hacia su sitio con un muelle; mientras están
// desordenadas, además, se apartan entre ellas.

import { ARRIBA, DEPARTAMENTOS, DERECHA, getGeometria, type Geometria, type Vec3 } from './geometria';
import { crearRender, POR_ESFERA } from './render';

export interface PosicionDepartamento {
  centro: Vec3;
  radioPx: number;
  /** De 0 (desordenado) a 1 (en su sitio del anillo). */
  orden: number;
}

export interface OpcionesEscena {
  piezas: number;
  dpr: number;
  /** Se llama al terminar de ordenarse (true) o al volver al desorden (false). */
  onOrden?: (ordenada: boolean) => void;
  /** En cada fotograma, dónde están los departamentos (para colocar sus nombres). */
  onFotograma?: (geo: Geometria, departamentos: PosicionDepartamento[]) => void;
}

export interface Escena {
  ordenar: () => void;
  desordenar: () => void;
  destruir: () => void;
}

type Color = [number, number, number];
type Tipo = 'centro' | 'departamento' | 'pieza';

const MARINO: Color = [0, 0.047, 0.204];
const CELESTE: Color = [0.082, 0.659, 0.961];
const GRIS: Color = [0.62, 0.67, 0.76];
const BLANCO: Color = [0.97, 0.97, 0.96];

/** Velocidad del anillo de departamentos, en radianes por segundo: una vuelta cada ~40 s. */
const VELOCIDAD_GIRO = 0.16;
const DURACION_ORDEN = 2.2;

interface Esfera {
  tipo: Tipo;
  /** Posición dentro de su anillo. */
  indice: number;
  p: Vec3;
  v: Vec3;
  casa: Vec3;
  ritmo: Vec3;
  /** Tamaño en desorden, relativo al que tendrá ordenada. */
  escalaDesorden: number;
  color: Color;
  material: number;
  orden: number;
  retraso: number;
}

// Aleatorio con semilla: el mismo desorden en cada visita.
function crearAleatorio(semilla: number) {
  let a = semilla;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const mezclar = (a: number, b: number, t: number) => a + (b - a) * t;
const suavizar = (t: number) => t * t * (3 - 2 * t);

function crearEsferas(piezas: number, geo: Geometria): Esfera[] {
  const azar = crearAleatorio(360);
  const casa = (): Vec3 => [
    mezclar(-geo.mitadAncho * 0.85, geo.mitadAncho * 0.85, azar()),
    mezclar(-geo.mitadAlto * 0.35, geo.mitadAlto * 0.55, azar()),
    mezclar(-geo.radioAnillo, geo.radioAnillo * 0.9, azar()),
  ];
  const base = (tipo: Tipo, indice: number, color: Color, material: number, retraso: number): Esfera => {
    const p = tipo === 'centro' ? ([0, 0, 0] as Vec3) : casa();
    return {
      tipo,
      indice,
      p: [...p],
      v: [0, 0, 0],
      casa: p,
      ritmo: [mezclar(0.25, 0.6, azar()), mezclar(0.2, 0.5, azar()), mezclar(0.2, 0.45, azar())],
      escalaDesorden: tipo === 'pieza' ? mezclar(1.2, 2.6, azar()) : mezclar(0.8, 1.25, azar()),
      color,
      material,
      orden: 0,
      retraso,
    };
  };
  const esferas = [base('centro', 0, MARINO, 0, 0)];
  // Los departamentos encajan uno tras otro; después, las piezas.
  DEPARTAMENTOS.forEach((_, i) => esferas.push(base('departamento', i, CELESTE, 0, 0.3 + i * 0.25)));
  for (let j = 0; j < piezas; j++) {
    const tirada = azar();
    const [color, material] = tirada < 0.45 ? [BLANCO, 1] : tirada < 0.75 ? [GRIS, 1] : [MARINO, 0];
    esferas.push(base('pieza', j, color, material, 1.4 + j * 0.05));
  }
  return esferas;
}

export function crearEscena(canvas: HTMLCanvasElement, { piezas, dpr, onOrden, onFotograma }: OpcionesEscena): Escena {
  let geo = getGeometria(canvas.clientWidth || 1, canvas.clientHeight || 1);
  const esferas = crearEsferas(piezas, geo);
  const render = crearRender(canvas, dpr, esferas.length);
  const datos = new Float32Array(esferas.length * POR_ESFERA);
  const puntero = { x: 0, y: 0, activo: false };

  let ordenada = false;
  let avisada = false;
  let tiempo = 0;
  let tiempoOrden = 0;
  let giro = 0;
  let giroInterior = 0;
  let entrada = 0;

  function redimensionar() {
    const ancho = canvas.clientWidth;
    const alto = canvas.clientHeight;
    if (!ancho || !alto) return;
    render.redimensionar(ancho, alto);
    const anterior = geo;
    geo = getGeometria(ancho, alto);
    for (const e of esferas) {
      e.casa[0] *= geo.mitadAncho / anterior.mitadAncho;
      e.casa[1] *= geo.mitadAlto / anterior.mitadAlto;
      e.casa[2] *= geo.radioAnillo / anterior.radioAnillo;
    }
  }
  const observadorTamano = new ResizeObserver(redimensionar);
  observadorTamano.observe(canvas);
  redimensionar();

  /** El sitio y el tamaño de cada esfera, ordenada. */
  function getSitio(e: Esfera): { sitio: Vec3; radio: number } {
    if (e.tipo === 'centro') return { sitio: [0, 0, 0], radio: geo.radioCentro };
    if (e.tipo === 'departamento') {
      return { sitio: geo.enAnillo(giro + (e.indice * 2 * Math.PI) / DEPARTAMENTOS.length, geo.radioAnillo), radio: geo.radioDepartamento };
    }
    return { sitio: geo.enAnillo(-giroInterior + (e.indice * 2 * Math.PI) / piezas, geo.radioInterior), radio: geo.radioPieza };
  }

  function paso(dt: number) {
    tiempo += dt;
    if (ordenada) {
      tiempoOrden += dt;
      // El giro arranca suave cuando el anillo ya está casi formado.
      const velocidad = VELOCIDAD_GIRO * suavizar(Math.min(Math.max((tiempoOrden - 1.5) / 3, 0), 1));
      giro += velocidad * dt;
      // Como engranajes: el anillo de dentro gira al revés, a la velocidad que le toca por su radio.
      giroInterior += velocidad * (geo.radioAnillo / geo.radioInterior) * dt;
    }
    entrada = Math.min(1, entrada + dt / 0.7);
    const radios: number[] = [];

    esferas.forEach((e, i) => {
      const objetivo = ordenada && tiempoOrden > e.retraso ? 1 : 0;
      e.orden += Math.sign(objetivo - e.orden) * Math.min(Math.abs(objetivo - e.orden), dt / (objetivo ? DURACION_ORDEN : 0.5));
      const t = suavizar(e.orden);
      const { sitio, radio } = getSitio(e);
      const flota: Vec3 =
        e.tipo === 'centro'
          ? [0, 0.12 * Math.sin(tiempo * 0.7), 0]
          : [
              e.casa[0] + 0.35 * Math.sin(tiempo * e.ritmo[0] + e.retraso * 9),
              e.casa[1] + 0.3 * Math.cos(tiempo * e.ritmo[1] + e.retraso * 7),
              e.casa[2] + 0.4 * Math.sin(tiempo * e.ritmo[2] + e.retraso * 5),
            ];
      const destino: Vec3 = [mezclar(flota[0], sitio[0], t), mezclar(flota[1], sitio[1], t), mezclar(flota[2], sitio[2], t)];
      radios[i] = mezclar(radio * e.escalaDesorden, radio, t) * suavizar(entrada);

      const k = mezclar(e.tipo === 'centro' ? 12 : 3, 22, t);
      const c = mezclar(e.tipo === 'centro' ? 6 : 2.2, 8.5, t);
      const f: Vec3 = [0, 0, 0];
      for (let j = 0; j < 3; j++) f[j] = k * (destino[j] - e.p[j]) - c * e.v[j];

      if (puntero.activo && e.tipo !== 'centro') {
        const s = geo.proyectar(e.p);
        const dx = s.x - puntero.x;
        const dy = s.y - puntero.y;
        const d = Math.hypot(dx, dy);
        const r = Math.min(130, geo.ancho * 0.22);
        if (d < r && d > 0.5) {
          const fuerza = mezclar(26, 7, t) * (1 - d / r) ** 2;
          for (let j = 0; j < 3; j++) f[j] += (DERECHA[j] * dx - ARRIBA[j] * dy) * (fuerza / d);
        }
      }
      for (let j = 0; j < 3; j++) {
        e.v[j] += f[j] * dt;
        e.p[j] += e.v[j] * dt;
      }
    });

    // Chocan entre ellas mientras están desordenadas (la central no se mueve por un choque).
    for (let i = 0; i < esferas.length; i++) {
      for (let j = i + 1; j < esferas.length; j++) {
        const a = esferas[i];
        const b = esferas[j];
        const peso = (1 - Math.max(a.orden, b.orden)) * 0.5;
        if (peso <= 0) continue;
        const dx = b.p[0] - a.p[0];
        const dy = b.p[1] - a.p[1];
        const dz = b.p[2] - a.p[2];
        const d = Math.hypot(dx, dy, dz) || 0.0001;
        const solape = radios[i] + radios[j] + 0.03 - d;
        if (solape <= 0) continue;
        const m = (solape * peso) / d;
        const ma = a.tipo === 'centro' ? 0 : 1;
        const mb = b.tipo === 'centro' ? 0 : 1;
        a.p[0] -= dx * m * ma * (2 - mb); a.p[1] -= dy * m * ma * (2 - mb); a.p[2] -= dz * m * ma * (2 - mb);
        b.p[0] += dx * m * mb * (2 - ma); b.p[1] += dy * m * mb * (2 - ma); b.p[2] += dz * m * mb * (2 - ma);
      }
    }

    if (ordenada && !avisada && esferas.every((e) => e.orden >= 1)) {
      avisada = true;
      onOrden?.(true);
    }
    return radios;
  }

  function pintar(radios: number[]) {
    const orden = esferas
      .map((e, i) => ({ e, r: radios[i], vista: geo.aVista(e.p) }))
      .sort((a, b) => a.vista[2] - b.vista[2]); // las lejanas primero
    orden.forEach(({ e, r, vista }, i) => {
      datos.set([vista[0], vista[1], vista[2], r, e.color[0], e.color[1], e.color[2], e.material], i * POR_ESFERA);
    });
    render.pintar(datos, esferas.length, geo.proyeccion);

    if (onFotograma) {
      const departamentos = esferas
        .map((e, i) => ({ e, r: radios[i] }))
        .filter(({ e }) => e.tipo === 'departamento')
        .map(({ e, r }) => ({ centro: [...e.p] as Vec3, radioPx: r * geo.proyectar(e.p).escala, orden: e.orden }));
      onFotograma(geo, departamentos);
    }
  }

  // ---------- Bucle: solo mientras se ve ----------
  let fotograma = 0;
  let anterior = 0;
  let visible = false;
  function bucle(ahora: number) {
    const dt = Math.min((ahora - (anterior || ahora)) / 1000, 1 / 30);
    anterior = ahora;
    // Dos subpasos: los muelles son más estables.
    paso(dt / 2);
    pintar(paso(dt / 2));
    fotograma = requestAnimationFrame(bucle);
  }
  function arrancar() {
    if (fotograma || !visible || document.hidden) return;
    anterior = 0;
    fotograma = requestAnimationFrame(bucle);
  }
  function parar() {
    cancelAnimationFrame(fotograma);
    fotograma = 0;
  }
  const observadorVista = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) arrancar();
    else parar();
  });
  observadorVista.observe(canvas);
  const alCambiarPestana = () => (document.hidden ? parar() : arrancar());
  document.addEventListener('visibilitychange', alCambiarPestana);

  // ---------- Puntero: ratón o dedo ----------
  const contenedor = canvas.parentElement ?? canvas;
  function mover(x: number, y: number) {
    const caja = canvas.getBoundingClientRect();
    puntero.x = x - caja.left;
    puntero.y = y - caja.top;
    puntero.activo = true;
  }
  const alMover = (ev: PointerEvent) => mover(ev.clientX, ev.clientY);
  const alTocar = (ev: TouchEvent) => ev.touches[0] && mover(ev.touches[0].clientX, ev.touches[0].clientY);
  const alSalir = () => (puntero.activo = false);
  contenedor.addEventListener('pointermove', alMover, { passive: true });
  contenedor.addEventListener('touchstart', alTocar, { passive: true });
  contenedor.addEventListener('touchmove', alTocar, { passive: true });
  contenedor.addEventListener('pointerleave', alSalir);
  contenedor.addEventListener('touchend', alSalir);

  return {
    ordenar() {
      if (ordenada) return;
      ordenada = true;
      avisada = false;
      tiempoOrden = 0;
    },
    desordenar() {
      ordenada = false;
      onOrden?.(false);
      // Un pequeño impulso hacia fuera, como si se soltaran.
      for (const e of esferas) {
        if (e.tipo === 'centro') continue;
        e.v[0] += (e.casa[0] - e.p[0]) * 1.5;
        e.v[1] += (e.casa[1] - e.p[1]) * 1.5 + 1;
        e.v[2] += (e.casa[2] - e.p[2]) * 1.5;
      }
    },
    destruir() {
      parar();
      observadorTamano.disconnect();
      observadorVista.disconnect();
      document.removeEventListener('visibilitychange', alCambiarPestana);
      contenedor.removeEventListener('pointermove', alMover);
      contenedor.removeEventListener('touchstart', alTocar);
      contenedor.removeEventListener('touchmove', alTocar);
      contenedor.removeEventListener('pointerleave', alSalir);
      contenedor.removeEventListener('touchend', alSalir);
      render.destruir();
    },
  };
}
