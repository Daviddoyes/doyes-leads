// La escena de la portada: en el centro, la esfera con el símbolo dD; alrededor, los seis
// departamentos como esferas de cristal en tres órbitas inclinadas, con estelas de
// luz celeste y partículas finas. Al cargar flotan desordenados y, en unos
// segundos, encajan en sus órbitas y giran juntos sin parar.
//
// Se carga aparte (import dinámico) cuando el navegador queda libre: el texto de
// la portada no espera a nada de esto.

import { crearRender, POR_ESFERA, POR_PARTICULA, POR_VERTICE_CINTA, type Mat4, type Render } from './render';

export type Vec3 = [number, number, number];

export const DEPARTAMENTOS = ['Marketing', 'Ventas', 'Compras', 'Operaciones', 'Calidad', 'Administración'];

export interface PosicionNombre {
  x: number;
  y: number;
  /** 0 invisible, 1 del todo. */
  opacidad: number;
  /** Distancia a la cámara: si dos nombres chocan, se queda el de la esfera más cercana. */
  profundidad: number;
}

export interface OpcionesEscena {
  dpr: number;
  bloom: boolean;
  particulas: number;
  simbolo: HTMLImageElement | null;
  /** En móvil los nombres aparecen al ordenarse y se desvanecen después. */
  nombresPasajeros: boolean;
  /** Imagen fija de la escena ordenada ("reducir movimiento"): un solo fotograma. */
  fija: boolean;
  /** En vertical, a qué altura va el centro de la escena (0 arriba, 1 abajo). */
  centroVertical?: () => number;
  onNombres?: (nombres: PosicionNombre[]) => void;
}

export interface Escena {
  destruir: () => void;
}

// ---------- Escena ----------

const RADIO_CENTRO = 1;
const RADIO_CRISTAL = 0.34;
/** Tres órbitas, con dos departamentos cada una, en lados opuestos. */
const ORBITAS = [
  { radio: 2.55, inclinacion: 0.2, giro: 0.3 },
  { radio: 3.15, inclinacion: -0.32, giro: 2.4 },
  { radio: 3.75, inclinacion: 0.42, giro: 4.4 },
];
/** Todas a la vez: una vuelta cada ~22 s. */
const VELOCIDAD = 0.28;
const INICIO_ORDEN = 1.3;
const DURACION_ORDEN = 2.6;
const ESCALONADO = 0.2;
const LARGO_ESTELA = 1.7;
const TRAMOS_ESTELA = 40;
const TRAMOS_ORBITA = 120;
const CAMPO_VISION = (34 * Math.PI) / 180;

const suavizar = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * t * (t * (6 * t - 15) + 10));
const mezclar = (a: number, b: number, t: number) => a + (b - a) * t;

function crearAleatorio(semilla: number) {
  let a = semilla;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ejes de cada órbita: un círculo horizontal inclinado y girado. */
const EJES = ORBITAS.map(({ inclinacion, giro }) => {
  const ci = Math.cos(inclinacion), si = Math.sin(inclinacion), cg = Math.cos(giro), sg = Math.sin(giro);
  // Inclinar alrededor de X y después girar alrededor de Y.
  const u: Vec3 = [cg, 0, -sg];
  const v: Vec3 = [sg * ci, si, cg * ci];
  return { u, v };
});

function enOrbita(o: number, angulo: number): Vec3 {
  const { u, v } = EJES[o];
  const r = ORBITAS[o].radio;
  const c = Math.cos(angulo), s = Math.sin(angulo);
  return [r * (c * u[0] + s * v[0]), r * (c * u[1] + s * v[1]), r * (c * u[2] + s * v[2])];
}

function tangenteOrbita(o: number, angulo: number): Vec3 {
  const { u, v } = EJES[o];
  const c = Math.cos(angulo), s = Math.sin(angulo);
  return [-s * u[0] + c * v[0], -s * u[1] + c * v[1], -s * u[2] + c * v[2]];
}

// ---------- Cámara ----------

function perspectiva(aspecto: number, desplazarX: number, desplazarY: number): Mat4 {
  const f = 1 / Math.tan(CAMPO_VISION / 2);
  const cerca = 0.1, lejos = 120;
  // El desplazamiento mueve la imagen en pantalla sin girar la cámara.
  return new Float32Array([
    f / aspecto, 0, 0, 0,
    0, f, 0, 0,
    -desplazarX, -desplazarY, (lejos + cerca) / (cerca - lejos), -1,
    0, 0, (2 * lejos * cerca) / (cerca - lejos), 0,
  ]);
}

function mirar(ojo: Vec3, objetivo: Vec3): Mat4 {
  const z = normalizar([ojo[0] - objetivo[0], ojo[1] - objetivo[1], ojo[2] - objetivo[2]]);
  const x = normalizar(cruz([0, 1, 0], z));
  const y = cruz(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -punto(x, ojo), -punto(y, ojo), -punto(z, ojo), 1,
  ]);
}

const punto = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cruz = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function normalizar(a: Vec3): Vec3 {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}
const aVista = (m: Mat4, p: Vec3): Vec3 => [
  m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
  m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
  m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
];

/**
 * Encuadre según la pantalla: en móvil (vertical) el centro va a la altura que pide la
 * portada y las órbitas llegan a los bordes; en escritorio, algo por encima del centro.
 */
function getEncuadre(ancho: number, alto: number, centroVertical: number) {
  const aspecto = ancho / Math.max(alto, 1);
  const vertical = aspecto < 0.9;
  const t = Math.tan(CAMPO_VISION / 2);
  // En móvil hace de fondo a pantalla completa: las órbitas de fuera se salen por los lados.
  const ocupar = vertical ? 0.62 : 1.05;
  const distancia = Math.max(vertical ? 9 : 9.2, (ORBITAS[2].radio * ocupar) / (t * aspecto));
  // En apaisado, el texto va abajo a la izquierda: la escena sube y se aparta un poco a la derecha.
  // En vertical, el centro va a la altura pedida (fracción desde arriba); subir va de -1 a 1.
  return { aspecto, distancia, subir: vertical ? 1 - 2 * centroVertical : 0.27, derecha: vertical ? 0 : 0.1 };
}

// ---------- Escena ----------

interface Departamento {
  orbita: number;
  fase: number;
  desorden: Vec3;
  ritmo: Vec3;
  retraso: number;
}

export async function crearEscena(canvas: HTMLCanvasElement, opciones: OpcionesEscena): Promise<Escena> {
  const azar = crearAleatorio(2024);
  const departamentos: Departamento[] = DEPARTAMENTOS.map((_, i) => ({
    orbita: i % 3,
    fase: (i < 3 ? 0 : Math.PI) + (i % 3) * 1.15,
    desorden: [mezclar(-4.6, 4.6, azar()), mezclar(-1.6, 2.2, azar()), mezclar(-3, 2.4, azar())],
    ritmo: [mezclar(0.3, 0.7, azar()), mezclar(0.25, 0.6, azar()), mezclar(0.2, 0.5, azar())],
    retraso: i * ESCALONADO,
  }));

  // Partículas: la mayoría en un disco grueso alrededor de las órbitas; el resto, al fondo.
  const particulas = Array.from({ length: opciones.particulas }, (_, i) => {
    const lejana = i % 10 < 3;
    const r = lejana ? mezclar(9, 22, azar()) : mezclar(1.6, 6.5, azar());
    return {
      r,
      angulo: azar() * Math.PI * 2,
      y: lejana ? mezclar(-10, 10, azar()) : mezclar(-1.4, 1.4, azar()) * (r / 4),
      velocidad: (lejana ? 0.01 : 0.05) * mezclar(0.6, 1.4, azar()),
      tam: lejana ? mezclar(0.4, 1.0, azar()) : mezclar(0.6, 1.6, azar()),
      fase: azar(),
    };
  });

  const render: Render = await crearRender(canvas, {
    dpr: opciones.dpr,
    bloom: opciones.bloom,
    simbolo: opciones.simbolo,
    maxEsferas: 1 + DEPARTAMENTOS.length,
    maxVerticesCinta: (ORBITAS.length * (TRAMOS_ORBITA + 1) * 2 + DEPARTAMENTOS.length * (TRAMOS_ESTELA + 1) * 2) + (ORBITAS.length + DEPARTAMENTOS.length) * 2,
    maxParticulas: opciones.particulas,
  });
  const datosEsferas = new Float32Array((1 + DEPARTAMENTOS.length) * POR_ESFERA);
  const datosCinta = new Float32Array(
    (ORBITAS.length * (TRAMOS_ORBITA + 1) * 2 + DEPARTAMENTOS.length * (TRAMOS_ESTELA + 1) * 2 + (ORBITAS.length + DEPARTAMENTOS.length) * 2) * POR_VERTICE_CINTA,
  );
  const datosParticulas = new Float32Array(opciones.particulas * POR_PARTICULA);

  let ancho = 1;
  let alto = 1;
  function redimensionar() {
    ancho = canvas.clientWidth || 1;
    alto = canvas.clientHeight || 1;
    render.redimensionar(ancho, alto);
    if (opciones.fija) pintar(12);
  }
  const observadorTamano = new ResizeObserver(redimensionar);
  observadorTamano.observe(canvas);

  // ---------- Parallax: ratón y, si lo hay sin pedir permiso, el giro del móvil ----------
  const objetivo = { x: 0, y: 0 };
  const actual = { x: 0, y: 0 };
  const alMover = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    objetivo.x = (e.clientX / window.innerWidth) * 2 - 1;
    objetivo.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const alGirar = (e: DeviceOrientationEvent) => {
    if (e.gamma === null || e.beta === null) return;
    objetivo.x = Math.max(-1, Math.min(1, e.gamma / 25));
    objetivo.y = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
  };
  if (!opciones.fija) {
    window.addEventListener('pointermove', alMover, { passive: true });
    window.addEventListener('deviceorientation', alGirar, { passive: true });
  }

  // ---------- Un fotograma ----------
  let horaOrdenada = -1;
  function pintar(tiempo: number, dt = 0) {
    const k = 1 - Math.exp(-dt * 2.2);
    actual.x += (objetivo.x - actual.x) * k;
    actual.y += (objetivo.y - actual.y) * k;

    const { aspecto, distancia, subir, derecha } = getEncuadre(ancho, alto, opciones.centroVertical?.() ?? 0.33);
    const ojo: Vec3 = [actual.x * 1.1, 2.1 - actual.y * 0.7, distancia];
    const vista = mirar(ojo, [0, 0, 0]);
    const proyeccion = perspectiva(aspecto, derecha, subir);

    // Esferas
    const giro = tiempo * VELOCIDAD;
    const lista: { centro: Vec3; radio: number; tipo: number; opacidad: number; z: number; orden: number }[] = [];
    const entrada = suavizar(Math.min(tiempo / 1.1, 1));
    lista.push({ centro: [0, 0.06 * Math.sin(tiempo * 0.8), 0], radio: RADIO_CENTRO * mezclar(0.7, 1, entrada), tipo: 0, opacidad: entrada, z: 0, orden: 1 });
    const posiciones: { p: Vec3; orden: number }[] = [];
    departamentos.forEach((d) => {
      const orden = suavizar((tiempo - INICIO_ORDEN - d.retraso) / DURACION_ORDEN);
      const sitio = enOrbita(d.orbita, giro + d.fase);
      const flota: Vec3 = [
        d.desorden[0] + 0.4 * Math.sin(tiempo * d.ritmo[0] + d.retraso * 9),
        d.desorden[1] + 0.35 * Math.cos(tiempo * d.ritmo[1] + d.retraso * 7),
        d.desorden[2] + 0.4 * Math.sin(tiempo * d.ritmo[2] + d.retraso * 5),
      ];
      const p: Vec3 = [mezclar(flota[0], sitio[0], orden), mezclar(flota[1], sitio[1], orden), mezclar(flota[2], sitio[2], orden)];
      posiciones.push({ p, orden });
      lista.push({ centro: p, radio: RADIO_CRISTAL * mezclar(1.2, 1, orden), tipo: 1, opacidad: entrada, z: 0, orden });
    });
    for (const e of lista) {
      e.centro = aVista(vista, e.centro);
      e.z = e.centro[2];
    }
    lista.sort((a, b) => a.z - b.z);
    lista.forEach((e, i) => datosEsferas.set([e.centro[0], e.centro[1], e.centro[2], e.radio, e.tipo, e.opacidad], i * POR_ESFERA));

    // Órbitas y estelas, en una sola tira con uniones invisibles entre trozos.
    let n = 0;
    const vertice = (p: Vec3, t: Vec3, lado: number, intensidad: number, anchoCinta: number) => {
      datosCinta.set([p[0], p[1], p[2], t[0], t[1], t[2], lado, intensidad, anchoCinta], n * POR_VERTICE_CINTA);
      n++;
    };
    const repetir = () => {
      datosCinta.copyWithin(n * POR_VERTICE_CINTA, (n - 1) * POR_VERTICE_CINTA, n * POR_VERTICE_CINTA);
      n++;
    };
    const ordenTotal = Math.min(...posiciones.map((x) => x.orden));
    const luzOrbitas = suavizar((ordenTotal - 0.5) / 0.5);
    ORBITAS.forEach((_, o) => {
      if (n) repetir();
      for (let s = 0; s <= TRAMOS_ORBITA; s++) {
        const a = (s / TRAMOS_ORBITA) * Math.PI * 2;
        const p = enOrbita(o, a);
        const t = tangenteOrbita(o, a);
        // Unión invisible con el trozo anterior: su último vértice (repetido) y este primero, dos veces.
        if (s === 0 && n) vertice(p, t, -1, 0.16 * luzOrbitas, 0.012);
        vertice(p, t, -1, 0.16 * luzOrbitas, 0.012);
        vertice(p, t, 1, 0.16 * luzOrbitas, 0.012);
      }
    });
    departamentos.forEach((d, i) => {
      const luz = suavizar((posiciones[i].orden - 0.75) / 0.25);
      if (luz <= 0) return;
      repetir();
      const cabeza = giro + d.fase;
      for (let s = 0; s <= TRAMOS_ESTELA; s++) {
        const f = s / TRAMOS_ESTELA; // 0 cola, 1 cabeza
        const a = cabeza - LARGO_ESTELA * (1 - f);
        const p = enOrbita(d.orbita, a);
        const t = tangenteOrbita(d.orbita, a);
        const intensidad = Math.pow(f, 2) * 2.2 * luz;
        const anchoCinta = 0.012 + 0.05 * Math.pow(f, 1.5);
        if (s === 0) vertice(p, t, -1, intensidad, anchoCinta);
        vertice(p, t, -1, intensidad, anchoCinta);
        vertice(p, t, 1, intensidad, anchoCinta);
      }
    });

    // Partículas
    particulas.forEach((q, i) => {
      const a = q.angulo + tiempo * q.velocidad;
      datosParticulas.set([q.r * Math.cos(a), q.y + 0.15 * Math.sin(tiempo * 0.3 + q.fase * 6), q.r * Math.sin(a), q.tam, q.fase], i * POR_PARTICULA);
    });

    render.pintar({
      vista,
      proyeccion,
      centroPantalla: [0.5 + derecha / 2, 0.5 + subir / 2],
      tiempo,
      esferas: datosEsferas,
      cantidadEsferas: lista.length,
      cinta: datosCinta,
      cantidadVerticesCinta: n,
      particulas: datosParticulas,
      cantidadParticulas: particulas.length,
    });

    // Nombres: discretos; en móvil, solo un rato tras ordenarse.
    if (opciones.onNombres) {
      if (ordenTotal >= 1 && horaOrdenada < 0) horaOrdenada = tiempo;
      let visibilidad = suavizar((ordenTotal - 0.85) / 0.15);
      if (opciones.nombresPasajeros && !opciones.fija && horaOrdenada >= 0) {
        const desde = tiempo - horaOrdenada;
        visibilidad *= 1 - suavizar((desde - 4) / 1.2);
      }
      const enPantalla = (p: Vec3, radio: number) => {
        const v = aVista(vista, p);
        const w = -v[2];
        return {
          x: (((proyeccion[0] * v[0] + proyeccion[8] * v[2]) / w + 1) / 2) * ancho,
          y: ((1 - (proyeccion[5] * v[1] + proyeccion[9] * v[2]) / w) / 2) * alto,
          radio: (radio * (alto / 2)) / Math.tan(CAMPO_VISION / 2) / w,
          w,
        };
      };
      const centro = enPantalla([0, 0, 0], RADIO_CENTRO);
      opciones.onNombres(
        posiciones.map(({ p }) => {
          const s = enPantalla(p, RADIO_CRISTAL);
          const y = s.y + s.radio + 6;
          // Si la esfera pasa por detrás de la central, su nombre no se pinta encima de ella.
          const tapado = s.w > centro.w && Math.hypot(s.x - centro.x, y - centro.y) < centro.radio + 12;
          return { x: s.x, y, opacidad: tapado ? 0 : visibilidad, profundidad: s.w };
        }),
      );
    }
  }

  // ---------- Bucle: solo mientras se ve ----------
  let fotograma = 0;
  let anterior = 0;
  let tiempo = 0;
  let visible = false;
  function bucle(ahora: number) {
    const dt = Math.min((ahora - (anterior || ahora)) / 1000, 1 / 20);
    anterior = ahora;
    tiempo += dt;
    pintar(tiempo, dt);
    fotograma = requestAnimationFrame(bucle);
  }
  function arrancar() {
    if (opciones.fija || fotograma || !visible || document.hidden) return;
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

  redimensionar();

  return {
    destruir() {
      parar();
      observadorTamano.disconnect();
      observadorVista.disconnect();
      document.removeEventListener('visibilitychange', alCambiarPestana);
      window.removeEventListener('pointermove', alMover);
      window.removeEventListener('deviceorientation', alGirar);
      render.destruir();
    },
  };
}
