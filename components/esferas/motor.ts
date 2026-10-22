// La escena de esferas de /v1, en WebGL2 sin librerías. Cada esfera se dibuja
// como un cuadrado al que el sombreador recorta la silueta exacta (intersección
// rayo-esfera) y da luz, brillo y reflejo del entorno. Así pesa unos pocos KB
// en lugar de los megas de three.js y un motor de física.
//
// Física: cada esfera va hacia su sitio con un muelle. En desorden, su sitio
// flota despacio alrededor de una posición propia y las esferas se apartan
// entre ellas; ordenadas, las seis grandes son los departamentos y las pequeñas
// circulan por el circuito que los conecta. El puntero las empuja con suavidad.

import { ARRIBA, DEPARTAMENTOS, DERECHA, getGeometria, type Geometria, type Vec3 } from './geometria';

export interface OpcionesEscena {
  cantidad: number;
  dpr: number;
  /** Se llama al terminar de ordenarse (true) o al volver al desorden (false). */
  onOrden?: (ordenada: boolean) => void;
}

export interface Escena {
  ordenar: () => void;
  desordenar: () => void;
  destruir: () => void;
}

type Color = [number, number, number];

const MARINO: Color = [0, 0.047, 0.204];
const CELESTE: Color = [0.082, 0.659, 0.961];
const GRIS: Color = [0.62, 0.67, 0.76];
const BLANCO: Color = [0.97, 0.97, 0.96];
const ESTACIONES = DEPARTAMENTOS.length;

interface Esfera {
  p: Vec3;
  v: Vec3;
  casa: Vec3;
  ritmo: Vec3;
  radioDesorden: number;
  color: Color;
  /** 0: pulida (oscura o de color); 1: nacarada (blanca o gris). */
  material: number;
  /** De 0 (desorden) a 1 (en su sitio del flujo). */
  orden: number;
  retraso: number;
  /** Para las piezas, su posición de salida en el circuito. */
  desfase: number;
  estacion: number;
}

const VERTICES = `#version 300 es
layout(location=0) in vec2 aEsquina;
layout(location=1) in vec3 aCentro;
layout(location=2) in float aRadio;
layout(location=3) in vec3 aColor;
layout(location=4) in float aMaterial;
uniform mat4 uProyeccion;
out vec3 vVista;
flat out vec3 vCentro;
flat out float vRadio;
flat out vec3 vColor;
flat out float vMaterial;
void main() {
  vec3 pos = aCentro + vec3(aEsquina * aRadio * 1.3, 0.0);
  vVista = pos; vCentro = aCentro; vRadio = aRadio; vColor = aColor; vMaterial = aMaterial;
  gl_Position = uProyeccion * vec4(pos, 1.0);
}`;

const FRAGMENTOS = `#version 300 es
precision highp float;
in vec3 vVista;
flat in vec3 vCentro;
flat in float vRadio;
flat in vec3 vColor;
flat in float vMaterial;
out vec4 salida;
const vec3 FONDO = vec3(0.969, 0.965, 0.953);
const vec3 CELESTE = vec3(0.082, 0.659, 0.961);
void main() {
  vec3 d = normalize(vVista);
  float b = dot(d, vCentro);
  float h = b * b - dot(vCentro, vCentro) + vRadio * vRadio;
  float w = fwidth(h);
  if (h < -w) discard;
  vec3 p = d * (b - sqrt(max(h, 0.0)));
  vec3 n = normalize(p - vCentro);
  vec3 V = -d;

  vec3 L = normalize(vec3(-0.55, 0.75, 0.55));
  float dif = max(dot(n, L), 0.0);
  float esp = pow(max(dot(n, normalize(L + V)), 0.0), mix(90.0, 40.0, vMaterial));
  float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);

  // Entorno de estudio: techo claro y cálido, suelo gris azulado y una ventana arriba a la izquierda.
  vec3 R = reflect(-V, n);
  vec3 entorno = mix(vec3(0.36, 0.41, 0.5), vec3(0.98, 0.975, 0.965), smoothstep(-0.3, 0.5, R.y));
  float ventana = smoothstep(0.9, 0.95, dot(R, normalize(vec3(-0.5, 0.65, 0.6))));
  entorno += ventana;

  vec3 c;
  if (vMaterial < 0.5) {
    c = vColor * (0.22 + 0.7 * dif);
    c = mix(c, entorno, 0.06 + 0.7 * fres);
    c += vec3(esp + ventana * 0.55);
  } else {
    c = vColor * (0.62 + 0.38 * dif);
    c = mix(c, entorno, 0.18 + 0.45 * fres);
    c += vec3(esp * 0.45);
  }
  // Un borde celeste por debajo: la marca, sin pintar nada más.
  c += CELESTE * pow(1.0 - max(dot(n, V), 0.0), 2.5) * smoothstep(0.1, -0.7, n.y) * 0.45;
  // Las del fondo se funden un poco con el papel.
  c = mix(c, FONDO, smoothstep(9.5, 14.0, -vCentro.z) * 0.4);

  float a = smoothstep(-w, w, h);
  salida = vec4(clamp(c, 0.0, 1.0) * a, a);
}`;

function compilar(gl: WebGL2RenderingContext, tipo: number, fuente: string) {
  const s = gl.createShader(tipo)!;
  gl.shaderSource(s, fuente);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'sombreador');
  return s;
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

function crearEsferas(cantidad: number, geo: Geometria): Esfera[] {
  const azar = crearAleatorio(2026);
  const piezas = cantidad - ESTACIONES;
  return Array.from({ length: cantidad }, (_, i) => {
    const esEstacion = i < ESTACIONES;
    const tirada = azar();
    let color = MARINO;
    let material = 0;
    if (!esEstacion) {
      if (tirada < 0.35) color = CELESTE;
      else if (tirada < 0.65) [color, material] = [BLANCO, 1];
      else if (tirada < 0.8) [color, material] = [GRIS, 1];
    }
    const casa: Vec3 = [
      mezclar(-geo.mitadAncho * 0.85, geo.mitadAncho * 0.85, azar()),
      mezclar(-geo.mitadAlto * 0.55, geo.mitadAlto * 0.75, azar()),
      mezclar(-2.6, 1.6, azar()),
    ];
    return {
      p: [...casa],
      v: [0, 0, 0],
      casa,
      ritmo: [mezclar(0.25, 0.6, azar()), mezclar(0.2, 0.5, azar()), mezclar(0.2, 0.45, azar())],
      radioDesorden: esEstacion ? mezclar(0.42, 0.58, azar()) : mezclar(0.16, 0.38, azar()),
      color,
      material,
      orden: 0,
      retraso: azar() * 0.6,
      desfase: esEstacion ? 0 : (i - ESTACIONES) / piezas,
      estacion: esEstacion ? i : -1,
    };
  });
}

export function crearEscena(canvas: HTMLCanvasElement, { cantidad, dpr, onOrden }: OpcionesEscena): Escena {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
  if (!gl) throw new Error('Sin WebGL2');

  const programa = gl.createProgram()!;
  gl.attachShader(programa, compilar(gl, gl.VERTEX_SHADER, VERTICES));
  gl.attachShader(programa, compilar(gl, gl.FRAGMENT_SHADER, FRAGMENTOS));
  gl.linkProgram(programa);
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(programa) ?? 'programa');
  const uProyeccion = gl.getUniformLocation(programa, 'uProyeccion');

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const POR_ESFERA = 8;
  const datos = new Float32Array(cantidad * POR_ESFERA);
  const bufferEsferas = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferEsferas);
  gl.bufferData(gl.ARRAY_BUFFER, datos.byteLength, gl.DYNAMIC_DRAW);
  const atributo = (lugar: number, tamano: number, desplazamiento: number) => {
    gl.enableVertexAttribArray(lugar);
    gl.vertexAttribPointer(lugar, tamano, gl.FLOAT, false, POR_ESFERA * 4, desplazamiento * 4);
    gl.vertexAttribDivisor(lugar, 1);
  };
  atributo(1, 3, 0);
  atributo(2, 1, 3);
  atributo(3, 3, 4);
  atributo(4, 1, 7);

  gl.useProgram(programa);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let geo = getGeometria(canvas.clientWidth || 1, canvas.clientHeight || 1);
  const esferas = crearEsferas(cantidad, geo);
  const puntero = { x: 0, y: 0, activo: false };
  const radioPuntero = () => Math.min(130, geo.ancho * 0.22);

  let ordenada = false;
  let avisada = false;
  let tiempo = 0;
  let tiempoOrden = 0;
  let entrada = 0;

  function redimensionar() {
    const ancho = canvas.clientWidth;
    const alto = canvas.clientHeight;
    if (!ancho || !alto) return;
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    const anterior = geo;
    geo = getGeometria(ancho, alto);
    // Las posiciones de desorden se reparten de nuevo en el espacio visible.
    for (const e of esferas) {
      e.casa[0] *= geo.mitadAncho / anterior.mitadAncho;
      e.casa[1] *= geo.mitadAlto / anterior.mitadAlto;
    }
  }
  const observadorTamano = new ResizeObserver(redimensionar);
  observadorTamano.observe(canvas);
  redimensionar();

  function getDestino(e: Esfera): { destino: Vec3; radio: number } {
    const flota: Vec3 = [
      e.casa[0] + 0.35 * Math.sin(tiempo * e.ritmo[0] + e.retraso * 9),
      e.casa[1] + 0.3 * Math.cos(tiempo * e.ritmo[1] + e.retraso * 7),
      e.casa[2] + 0.4 * Math.sin(tiempo * e.ritmo[2] + e.retraso * 5),
    ];
    const enFlujo: Vec3 =
      e.estacion >= 0 ? geo.estaciones[e.estacion] : geo.puntoPista(e.desfase + tiempoOrden * (0.5 / (geo.separacion * 6)));
    const radioOrden = e.estacion >= 0 ? geo.radioEstacion : geo.radioPieza;
    const t = suavizar(e.orden);
    return {
      destino: [mezclar(flota[0], enFlujo[0], t), mezclar(flota[1], enFlujo[1], t), mezclar(flota[2], enFlujo[2], t)],
      radio: mezclar(e.radioDesorden * Math.min(1, geo.separacion / 1.6), radioOrden, t),
    };
  }

  function paso(dt: number) {
    tiempo += dt;
    if (ordenada) tiempoOrden += dt;
    entrada = Math.min(1, entrada + dt / 0.7);
    const radios: number[] = [];

    esferas.forEach((e, i) => {
      // Cada una se ordena (o se desordena) a su ritmo.
      const objetivo = ordenada && tiempoOrden > e.retraso ? 1 : 0;
      e.orden += Math.sign(objetivo - e.orden) * Math.min(Math.abs(objetivo - e.orden), dt / (objetivo ? 1.5 : 0.5));
      const { destino, radio } = getDestino(e);
      radios[i] = radio * suavizar(entrada);

      const k = mezclar(3, 18, e.orden);
      const c = mezclar(2.2, 7.2, e.orden);
      const f: Vec3 = [0, 0, 0];
      for (let j = 0; j < 3; j++) f[j] = k * (destino[j] - e.p[j]) - c * e.v[j];

      if (puntero.activo) {
        const s = geo.proyectar(e.p);
        const dx = s.x - puntero.x;
        const dy = s.y - puntero.y;
        const d = Math.hypot(dx, dy);
        const r = radioPuntero();
        if (d < r && d > 0.5) {
          const fuerza = mezclar(26, 9, e.orden) * (1 - d / r) ** 2;
          for (let j = 0; j < 3; j++) f[j] += (DERECHA[j] * dx - ARRIBA[j] * dy) * (fuerza / d);
        }
      }
      for (let j = 0; j < 3; j++) {
        e.v[j] += f[j] * dt;
        e.p[j] += e.v[j] * dt;
      }
    });

    // Se apartan entre ellas mientras están desordenadas (ordenadas, las piezas atraviesan los departamentos).
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
        const solape = radios[i] + radios[j] + 0.04 - d;
        if (solape <= 0) continue;
        const m = (solape * peso) / d;
        a.p[0] -= dx * m; a.p[1] -= dy * m; a.p[2] -= dz * m;
        b.p[0] += dx * m; b.p[1] += dy * m; b.p[2] += dz * m;
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
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.uniformMatrix4fv(uProyeccion, false, geo.proyeccion);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, bufferEsferas);
    gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, datos);
    gl!.drawArraysInstanced(gl!.TRIANGLE_STRIP, 0, 4, cantidad);
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
  const observadorVista = new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting;
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
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
