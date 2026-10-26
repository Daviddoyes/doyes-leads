// Dibujo de la escena de /v3 en WebGL2, sin librerías: fondo, esfera central con
// el símbolo, esferas de cristal, órbitas y estelas de luz, partículas y bloom.
//
// Todo se pinta primero en una textura (con más rango que la pantalla si el
// navegador lo permite) para que las luces puedan pasar de blanco y el bloom
// las haga brillar; al final se compone en pantalla con una curva suave.

export type Mat4 = Float32Array;

/** Esfera: centro en coordenadas de cámara (3), radio (1), tipo (1: 0 central, 1 cristal) y opacidad (1). */
export const POR_ESFERA = 6;
/** Vértice de cinta (órbitas y estelas): posición (3), tangente (3), lado (1), intensidad (1), ancho (1). */
export const POR_VERTICE_CINTA = 9;
/** Partícula: posición (3), tamaño (1), fase (1). */
export const POR_PARTICULA = 5;

const CABECERA = `#version 300 es
precision highp float;
`;

// ---------- Fondo ----------

const VERTICES_PANTALLA = `${CABECERA}
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENTOS_FONDO = `${CABECERA}
in vec2 vUv;
out vec4 salida;
uniform vec2 uTam;
uniform vec2 uCentro;
uniform float uTiempo;
float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(i + vec2(1, 0), vec2(127.1, 311.7))) * 43758.5453);
  float c = fract(sin(dot(i + vec2(0, 1), vec2(127.1, 311.7))) * 43758.5453);
  float d = fract(sin(dot(i + vec2(1, 1), vec2(127.1, 311.7))) * 43758.5453);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
void main() {
  vec2 p = (vUv - uCentro) * vec2(uTam.x / uTam.y, 1.0);
  float r = length(p);
  // Del marino #000C34 en el centro a casi negro azulado en los bordes.
  vec3 marino = vec3(0.0, 0.047, 0.204);
  vec3 noche = vec3(0.004, 0.008, 0.035);
  vec3 c = mix(marino * 1.15, noche, smoothstep(0.0, 1.05, r));
  // Niebla muy suave, que se mueve despacio: profundidad, no un plano.
  float n = ruido(p * 2.2 + vec2(uTiempo * 0.012, 0.0)) * 0.6 + ruido(p * 5.0 - vec2(0.0, uTiempo * 0.02)) * 0.4;
  c += vec3(0.02, 0.09, 0.2) * n * smoothstep(1.1, 0.1, r) * 0.55;
  // Un halo celeste detrás de la esfera central.
  c += vec3(0.05, 0.3, 0.55) * exp(-r * r * 9.0) * 0.35;
  salida = vec4(c, 1.0);
}`;

// ---------- Esferas ----------

const VERTICES_ESFERA = `${CABECERA}
layout(location=0) in vec2 aEsquina;
layout(location=1) in vec3 aCentro;
layout(location=2) in float aRadio;
layout(location=3) in float aTipo;
layout(location=4) in float aOpacidad;
uniform mat4 uProyeccion;
out vec3 vVista;
flat out vec3 vCentro;
flat out float vRadio;
flat out float vTipo;
flat out float vOpacidad;
void main() {
  vec3 pos = aCentro + vec3(aEsquina * aRadio * 1.35, 0.0);
  vVista = pos; vCentro = aCentro; vRadio = aRadio; vTipo = aTipo; vOpacidad = aOpacidad;
  gl_Position = uProyeccion * vec4(pos, 1.0);
}`;

const FRAGMENTOS_ESFERA = `${CABECERA}
in vec3 vVista;
flat in vec3 vCentro;
flat in float vRadio;
flat in float vTipo;
flat in float vOpacidad;
out vec4 salida;
uniform mat4 uProyeccion;
uniform sampler2D uSimbolo;
uniform float uConSimbolo;
uniform vec2 uTamSimbolo;
const vec3 CELESTE = vec3(0.082, 0.659, 0.961);

// Entorno de estudio oscuro: suelo casi negro, un anillo de luz celeste en el
// horizonte y una ventana blanca arriba a la izquierda. Pasa de 1: brilla.
vec3 entorno(vec3 r, float luz) {
  vec3 c = mix(vec3(0.005, 0.01, 0.04), vec3(0.03, 0.08, 0.2), smoothstep(-0.4, 0.9, r.y));
  c += CELESTE * 1.4 * exp(-pow((r.y - 0.05) * 8.0, 2.0));
  // Luces pequeñas y finas: con el bloom ya brillan; grandes, serían manchas.
  float ventana = smoothstep(0.965, 0.99, dot(r, normalize(vec3(-0.55, 0.7, 0.45))));
  c += vec3(2.4) * ventana * luz;
  c += vec3(0.6, 0.85, 1.0) * 0.8 * luz * smoothstep(0.975, 0.995, dot(r, normalize(vec3(0.7, 0.25, 0.65))));
  return c;
}

vec2 enSimbolo(vec2 q) {
  return vec2(q.x / uTamSimbolo.x, -(q.y + 0.04) / uTamSimbolo.y) * 0.5 + 0.5;
}
vec4 simbolo(vec2 q) {
  vec2 t = enSimbolo(q);
  if (t.x < 0.0 || t.x > 1.0 || t.y < 0.0 || t.y > 1.0) return vec4(0.0);
  return texture(uSimbolo, t);
}

void main() {
  vec3 d = normalize(vVista);
  float b = dot(d, vCentro);
  float h = b * b - dot(vCentro, vCentro) + vRadio * vRadio;
  float w = fwidth(h);
  if (h < -w) discard;
  vec3 p = d * (b - sqrt(max(h, 0.0)));
  vec3 n = normalize(p - vCentro);
  vec3 V = -d;
  float cosV = max(dot(n, V), 0.0);
  float fres = pow(1.0 - cosV, 5.0);
  vec3 L = normalize(vec3(-0.55, 0.7, 0.45));
  vec3 col;
  float alfa;

  if (vTipo < 0.5) {
    // Esfera central: marino brillante, el símbolo en relieve; la "d" emite luz celeste y la "D" es metal.
    vec3 base = vec3(0.0, 0.035, 0.14);
    float marca = 0.0;
    float metal = 0.0;
    if (uConSimbolo > 0.5) {
      vec3 c = normalize(vCentro);
      vec3 u = normalize(cross(c, vec3(0.0, 1.0, 0.0)));
      vec3 v = cross(u, c);
      vec3 local = (p - vCentro) / vRadio;
      vec2 q = vec2(dot(local, u), dot(local, v));
      float e = 0.01;
      vec4 s = simbolo(q);
      float gx = simbolo(q + vec2(e, 0.0)).a - simbolo(q - vec2(e, 0.0)).a;
      float gy = simbolo(q + vec2(0.0, e)).a - simbolo(q - vec2(0.0, e)).a;
      n = normalize(n - (u * gx + v * gy) * 1.1);
      // En el PNG, la "d" es celeste y la "D" marino.
      float esCeleste = smoothstep(0.25, 0.5, s.b - s.r);
      marca = s.a * esCeleste;
      metal = s.a * (1.0 - esCeleste);
    }
    vec3 R = reflect(-V, n);
    float dif = max(dot(n, L), 0.0);
    float esp = pow(max(dot(n, normalize(L + V)), 0.0), 90.0) * 0.35;
    col = base * (0.25 + 0.6 * dif);
    col = mix(col, entorno(R, 0.3), 0.1 + 0.6 * fres);
    col += vec3(esp);
    // La "D", de plata: clara, con la luz de la escena por encima.
    vec3 plata = vec3(0.6, 0.67, 0.8) * (0.5 + 0.5 * dif) + entorno(R, 0.3) * 0.3 + vec3(esp);
    col = mix(col, plata, metal);
    // La "d": su celeste con una luz suave propia, sin llegar a neón.
    col = mix(col, CELESTE * (0.75 + 0.35 * dif), marca);
    col += CELESTE * marca * 0.28;
    // El borde, de luz celeste: la marca rodeada de luz.
    col += CELESTE * pow(1.0 - cosV, 3.0) * 0.55;
    alfa = 1.0;
  } else {
    // Cristal: refleja el entorno en los bordes, deja ver a través por el centro, con un brillo celeste dentro.
    vec3 R = reflect(-V, n);
    vec3 T = refract(-V, n, 0.72);
    float F = 0.04 + 0.96 * fres;
    vec3 reflejo = entorno(R, 1.0);
    vec3 dentro = entorno(T, 1.0) * vec3(0.55, 0.85, 1.0) * 0.55 + CELESTE * (0.18 + 0.5 * pow(1.0 - cosV, 2.0));
    float esp = pow(max(dot(n, normalize(L + V)), 0.0), 160.0);
    // La luz que atraviesa el cristal se concentra en el lado opuesto, y el borde brilla.
    float atraviesa = pow(max(dot(n, -L), 0.0), 5.0);
    col = mix(dentro, reflejo, F) + vec3(esp * 4.0);
    col += CELESTE * atraviesa * 1.6 + vec3(0.55, 0.85, 1.0) * pow(1.0 - cosV, 4.0) * 0.9;
    alfa = mix(0.5, 1.0, F);
  }

  vec4 clip = uProyeccion * vec4(p, 1.0);
  gl_FragDepth = clip.z / clip.w * 0.5 + 0.5;
  float a = smoothstep(-w, w, h) * alfa * vOpacidad;
  salida = vec4(col * a, a);
}`;

// ---------- Órbitas y estelas ----------

const VERTICES_CINTA = `${CABECERA}
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aTangente;
layout(location=2) in float aLado;
layout(location=3) in float aIntensidad;
layout(location=4) in float aAncho;
uniform mat4 uVista;
uniform mat4 uProyeccion;
out float vIntensidad;
out float vLado;
void main() {
  vec3 p = (uVista * vec4(aPos, 1.0)).xyz;
  vec3 t = normalize((uVista * vec4(aTangente, 0.0)).xyz);
  // La cinta se abre hacia los lados, de cara a la cámara.
  vec3 lado = normalize(cross(t, normalize(-p)));
  p += lado * aLado * aAncho;
  vIntensidad = aIntensidad;
  vLado = aLado;
  gl_Position = uProyeccion * vec4(p, 1.0);
}`;

const FRAGMENTOS_CINTA = `${CABECERA}
in float vIntensidad;
in float vLado;
out vec4 salida;
const vec3 CELESTE = vec3(0.082, 0.659, 0.961);
void main() {
  // Más brillo en el eje de la cinta, que se apaga hacia los bordes.
  float perfil = exp(-vLado * vLado * 3.5);
  // Celeste; solo la cabeza de la estela llega casi a blanco.
  vec3 c = mix(CELESTE, vec3(0.75, 0.92, 1.0), smoothstep(1.6, 2.2, vIntensidad)) * vIntensidad * perfil;
  salida = vec4(c, 0.0);
}`;

// ---------- Partículas ----------

const VERTICES_PARTICULA = `${CABECERA}
layout(location=0) in vec3 aPos;
layout(location=1) in float aTam;
layout(location=2) in float aFase;
uniform mat4 uVista;
uniform mat4 uProyeccion;
uniform float uTiempo;
uniform float uAltoPx;
out float vBrillo;
void main() {
  vec4 p = uVista * vec4(aPos, 1.0);
  gl_Position = uProyeccion * p;
  float profundidad = max(-p.z, 0.1);
  gl_PointSize = clamp(aTam * uAltoPx * 0.0016 / profundidad * 8.0, 1.0, 9.0);
  vBrillo = 0.45 + 0.55 * sin(uTiempo * (0.6 + aFase) + aFase * 40.0);
}`;

const FRAGMENTOS_PARTICULA = `${CABECERA}
in float vBrillo;
out vec4 salida;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float a = exp(-dot(q, q) * 4.0);
  salida = vec4(vec3(0.55, 0.82, 1.0) * a * vBrillo * 0.9, 0.0);
}`;

// ---------- Bloom y composición ----------

const FRAGMENTOS_BRILLO = `${CABECERA}
in vec2 vUv;
out vec4 salida;
uniform sampler2D uOrigen;
uniform vec2 uPaso;
uniform float uUmbral;
void main() {
  // Cuatro muestras (suaviza al reducir) y solo lo que pasa del umbral.
  vec3 c = texture(uOrigen, vUv + uPaso * vec2(-1, -1)).rgb + texture(uOrigen, vUv + uPaso * vec2(1, -1)).rgb
         + texture(uOrigen, vUv + uPaso * vec2(-1, 1)).rgb + texture(uOrigen, vUv + uPaso * vec2(1, 1)).rgb;
  c *= 0.25;
  float m = max(c.r, max(c.g, c.b));
  salida = vec4(c * max(m - uUmbral, 0.0) / max(m, 0.0001), 1.0);
}`;

const FRAGMENTOS_REDUCIR = `${CABECERA}
in vec2 vUv;
out vec4 salida;
uniform sampler2D uOrigen;
uniform vec2 uPaso;
void main() {
  // Filtro "dual": el centro y cuatro esquinas, para un desenfoque amplio y barato.
  vec3 c = texture(uOrigen, vUv).rgb * 4.0;
  c += texture(uOrigen, vUv + uPaso * vec2(-1, -1)).rgb + texture(uOrigen, vUv + uPaso * vec2(1, -1)).rgb;
  c += texture(uOrigen, vUv + uPaso * vec2(-1, 1)).rgb + texture(uOrigen, vUv + uPaso * vec2(1, 1)).rgb;
  salida = vec4(c / 8.0, 1.0);
}`;

const FRAGMENTOS_AMPLIAR = `${CABECERA}
in vec2 vUv;
out vec4 salida;
uniform sampler2D uOrigen;
uniform vec2 uPaso;
void main() {
  vec3 c = texture(uOrigen, vUv + uPaso * vec2(-1, 0)).rgb + texture(uOrigen, vUv + uPaso * vec2(1, 0)).rgb;
  c += texture(uOrigen, vUv + uPaso * vec2(0, -1)).rgb + texture(uOrigen, vUv + uPaso * vec2(0, 1)).rgb;
  c += (texture(uOrigen, vUv + uPaso * vec2(-0.5, -0.5)).rgb + texture(uOrigen, vUv + uPaso * vec2(0.5, -0.5)).rgb
      + texture(uOrigen, vUv + uPaso * vec2(-0.5, 0.5)).rgb + texture(uOrigen, vUv + uPaso * vec2(0.5, 0.5)).rgb) * 2.0;
  salida = vec4(c / 12.0, 1.0);
}`;

const FRAGMENTOS_COMPONER = `${CABECERA}
in vec2 vUv;
out vec4 salida;
uniform sampler2D uEscena;
uniform sampler2D uBloom;
uniform float uConBloom;
uniform float uIntensidad;
// Hasta 0,8 el color queda tal cual (el marino es el marino); por encima se curva hacia el blanco.
vec3 curva(vec3 c) {
  vec3 x = max(c - 0.8, 0.0);
  return min(c, 0.8) + 0.2 * (1.0 - exp(-x / 0.2));
}
void main() {
  vec3 c = texture(uEscena, vUv).rgb;
  if (uConBloom > 0.5) c += texture(uBloom, vUv).rgb * uIntensidad;
  c = curva(c);
  // Un poco de grano: sin él, el degradado del fondo hace escalones.
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  salida = vec4(c + (g - 0.5) / 255.0, 1.0);
}`;

// ---------- Programa ----------

function compilar(gl: WebGL2RenderingContext, tipo: number, fuente: string) {
  const s = gl.createShader(tipo)!;
  gl.shaderSource(s, fuente);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'sombreador');
  return s;
}

function programa(gl: WebGL2RenderingContext, vertices: string, fragmentos: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compilar(gl, gl.VERTEX_SHADER, vertices));
  gl.attachShader(p, compilar(gl, gl.FRAGMENT_SHADER, fragmentos));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'programa');
  const uniformes = new Map<string, WebGLUniformLocation | null>();
  const u = (nombre: string) => {
    if (!uniformes.has(nombre)) uniformes.set(nombre, gl.getUniformLocation(p, nombre));
    return uniformes.get(nombre)!;
  };
  return { p, u };
}

interface Destino {
  fb: WebGLFramebuffer;
  tex: WebGLTexture;
  ancho: number;
  alto: number;
}

export interface OpcionesRender {
  dpr: number;
  /** Sin bloom en equipos modestos. */
  bloom: boolean;
  simbolo: HTMLImageElement | null;
  maxEsferas: number;
  maxVerticesCinta: number;
  maxParticulas: number;
}

export interface Cuadro {
  vista: Mat4;
  proyeccion: Mat4;
  /** Dónde cae el centro de la escena en pantalla (0-1), para el halo del fondo. */
  centroPantalla: [number, number];
  tiempo: number;
  esferas: Float32Array;
  cantidadEsferas: number;
  cinta: Float32Array;
  cantidadVerticesCinta: number;
  particulas: Float32Array;
  cantidadParticulas: number;
}

export interface Render {
  redimensionar: (ancho: number, alto: number) => void;
  pintar: (cuadro: Cuadro) => void;
  destruir: () => void;
}

export function crearRender(canvas: HTMLCanvasElement, opciones: OpcionesRender): Render {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: true, powerPreference: 'high-performance', premultipliedAlpha: false });
  if (!gl) throw new Error('Sin WebGL2');
  // Con más rango, las luces pueden pasar de blanco antes del bloom.
  const conRango = Boolean(gl.getExtension('EXT_color_buffer_float'));

  const fondo = programa(gl, VERTICES_PANTALLA, FRAGMENTOS_FONDO);
  const esfera = programa(gl, VERTICES_ESFERA, FRAGMENTOS_ESFERA);
  const cinta = programa(gl, VERTICES_CINTA, FRAGMENTOS_CINTA);
  const particula = programa(gl, VERTICES_PARTICULA, FRAGMENTOS_PARTICULA);
  const brillo = programa(gl, VERTICES_PANTALLA, FRAGMENTOS_BRILLO);
  const reducir = programa(gl, VERTICES_PANTALLA, FRAGMENTOS_REDUCIR);
  const ampliar = programa(gl, VERTICES_PANTALLA, FRAGMENTOS_AMPLIAR);
  const componer = programa(gl, VERTICES_PANTALLA, FRAGMENTOS_COMPONER);

  // ---------- Geometría ----------
  const vaoVacio = gl.createVertexArray()!;

  const vaoEsferas = gl.createVertexArray()!;
  gl.bindVertexArray(vaoEsferas);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const bufEsferas = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufEsferas);
  gl.bufferData(gl.ARRAY_BUFFER, opciones.maxEsferas * POR_ESFERA * 4, gl.DYNAMIC_DRAW);
  [[1, 3, 0], [2, 1, 3], [3, 1, 4], [4, 1, 5]].forEach(([lugar, tam, desp]) => {
    gl.enableVertexAttribArray(lugar);
    gl.vertexAttribPointer(lugar, tam, gl.FLOAT, false, POR_ESFERA * 4, desp * 4);
    gl.vertexAttribDivisor(lugar, 1);
  });

  const vaoCinta = gl.createVertexArray()!;
  gl.bindVertexArray(vaoCinta);
  const bufCinta = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufCinta);
  gl.bufferData(gl.ARRAY_BUFFER, opciones.maxVerticesCinta * POR_VERTICE_CINTA * 4, gl.DYNAMIC_DRAW);
  [[0, 3, 0], [1, 3, 3], [2, 1, 6], [3, 1, 7], [4, 1, 8]].forEach(([lugar, tam, desp]) => {
    gl.enableVertexAttribArray(lugar);
    gl.vertexAttribPointer(lugar, tam, gl.FLOAT, false, POR_VERTICE_CINTA * 4, desp * 4);
  });

  const vaoParticulas = gl.createVertexArray()!;
  gl.bindVertexArray(vaoParticulas);
  const bufParticulas = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufParticulas);
  gl.bufferData(gl.ARRAY_BUFFER, opciones.maxParticulas * POR_PARTICULA * 4, gl.DYNAMIC_DRAW);
  [[0, 3, 0], [1, 1, 3], [2, 1, 4]].forEach(([lugar, tam, desp]) => {
    gl.enableVertexAttribArray(lugar);
    gl.vertexAttribPointer(lugar, tam, gl.FLOAT, false, POR_PARTICULA * 4, desp * 4);
  });
  gl.bindVertexArray(null);

  // ---------- Símbolo ----------
  gl.useProgram(esfera.p);
  gl.uniform1f(esfera.u('uConSimbolo'), opciones.simbolo ? 1 : 0);
  if (opciones.simbolo) {
    const ancho = 0.62;
    gl.uniform2f(esfera.u('uTamSimbolo'), ancho, (ancho * opciones.simbolo.naturalHeight) / opciones.simbolo.naturalWidth);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, opciones.simbolo);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(esfera.u('uSimbolo'), 2);
  }
  const texSimbolo = opciones.simbolo ? gl.getParameter(gl.TEXTURE_BINDING_2D) : null;
  // La unidad 2 queda para el símbolo: las texturas de trabajo se crean en la 0.
  gl.activeTexture(gl.TEXTURE0);

  // ---------- Texturas de trabajo ----------
  function crearDestino(ancho: number, alto: number, conProfundidad: boolean): Destino {
    const tex = gl!.createTexture()!;
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, conRango ? gl!.RGBA16F : gl!.RGBA8, ancho, alto, 0, gl!.RGBA, conRango ? gl!.HALF_FLOAT : gl!.UNSIGNED_BYTE, null);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    const fb = gl!.createFramebuffer()!;
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fb);
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
    if (conProfundidad) {
      const rb = gl!.createRenderbuffer();
      gl!.bindRenderbuffer(gl!.RENDERBUFFER, rb);
      gl!.renderbufferStorage(gl!.RENDERBUFFER, gl!.DEPTH_COMPONENT24, ancho, alto);
      gl!.framebufferRenderbuffer(gl!.FRAMEBUFFER, gl!.DEPTH_ATTACHMENT, gl!.RENDERBUFFER, rb);
    }
    return { fb, tex, ancho, alto };
  }
  let escena: Destino | null = null;
  let cadena: Destino[] = [];
  let tam = { ancho: 1, alto: 1 };

  function liberar() {
    for (const d of [escena, ...cadena]) {
      if (!d) continue;
      gl!.deleteFramebuffer(d.fb);
      gl!.deleteTexture(d.tex);
    }
    escena = null;
    cadena = [];
  }

  function pasada(p: ReturnType<typeof programa>, destino: Destino | null, origen: Destino | null, extra?: () => void) {
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, destino?.fb ?? null);
    gl!.viewport(0, 0, destino?.ancho ?? canvas.width, destino?.alto ?? canvas.height);
    gl!.useProgram(p.p);
    if (origen) {
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, origen.tex);
      gl!.uniform1i(p.u('uOrigen'), 0);
      gl!.uniform2f(p.u('uPaso'), 1 / origen.ancho, 1 / origen.alto);
    }
    extra?.();
    gl!.bindVertexArray(vaoVacio);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  return {
    redimensionar(ancho, alto) {
      canvas.width = Math.max(1, Math.round(ancho * opciones.dpr));
      canvas.height = Math.max(1, Math.round(alto * opciones.dpr));
      tam = { ancho, alto };
      liberar();
      escena = crearDestino(canvas.width, canvas.height, true);
      if (opciones.bloom) {
        // Mitad, cuarto, octavo y dieciseisavo del tamaño: desde el brillo fino hasta el halo ancho.
        let w = canvas.width;
        let h = canvas.height;
        for (let i = 0; i < 4; i++) {
          w = Math.max(1, Math.round(w / 2));
          h = Math.max(1, Math.round(h / 2));
          cadena.push(crearDestino(w, h, false));
        }
      }
    },

    pintar(c) {
      if (!escena) return;
      gl.bindFramebuffer(gl.FRAMEBUFFER, escena.fb);
      gl.viewport(0, 0, escena.ancho, escena.alto);
      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
      gl.depthMask(false);

      // 1. Fondo
      gl.useProgram(fondo.p);
      gl.uniform2f(fondo.u('uTam'), tam.ancho, tam.alto);
      gl.uniform2f(fondo.u('uCentro'), c.centroPantalla[0], c.centroPantalla[1]);
      gl.uniform1f(fondo.u('uTiempo'), c.tiempo);
      gl.bindVertexArray(vaoVacio);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // 2. Esferas (la central opaca y los cristales, de la más lejana a la más cercana)
      gl.depthMask(true);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(esfera.p);
      gl.uniformMatrix4fv(esfera.u('uProyeccion'), false, c.proyeccion);
      if (texSimbolo) {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, texSimbolo);
        gl.activeTexture(gl.TEXTURE0);
      }
      gl.bindVertexArray(vaoEsferas);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufEsferas);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, c.esferas, 0, c.cantidadEsferas * POR_ESFERA);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, c.cantidadEsferas);

      // 3. Órbitas, estelas y partículas: luz que se suma, sin tapar nada.
      gl.depthMask(false);
      gl.blendFunc(gl.ONE, gl.ONE);
      if (c.cantidadVerticesCinta > 0) {
        gl.useProgram(cinta.p);
        gl.uniformMatrix4fv(cinta.u('uVista'), false, c.vista);
        gl.uniformMatrix4fv(cinta.u('uProyeccion'), false, c.proyeccion);
        gl.bindVertexArray(vaoCinta);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufCinta);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, c.cinta, 0, c.cantidadVerticesCinta * POR_VERTICE_CINTA);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, c.cantidadVerticesCinta);
      }
      gl.useProgram(particula.p);
      gl.uniformMatrix4fv(particula.u('uVista'), false, c.vista);
      gl.uniformMatrix4fv(particula.u('uProyeccion'), false, c.proyeccion);
      gl.uniform1f(particula.u('uTiempo'), c.tiempo);
      gl.uniform1f(particula.u('uAltoPx'), escena.alto);
      gl.bindVertexArray(vaoParticulas);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufParticulas);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, c.particulas, 0, c.cantidadParticulas * POR_PARTICULA);
      gl.drawArrays(gl.POINTS, 0, c.cantidadParticulas);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);

      // 4. Bloom: lo que brilla, cada vez más pequeño y difuso, y vuelta a sumar.
      if (opciones.bloom && cadena.length) {
        pasada(brillo, cadena[0], escena, () => gl.uniform1f(brillo.u('uUmbral'), 0.75));
        for (let i = 1; i < cadena.length; i++) pasada(reducir, cadena[i], cadena[i - 1]);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        for (let i = cadena.length - 1; i > 0; i--) pasada(ampliar, cadena[i - 1], cadena[i]);
        gl.disable(gl.BLEND);
      }

      // 5. A la pantalla
      pasada(componer, null, null, () => {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, escena!.tex);
        gl.uniform1i(componer.u('uEscena'), 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, cadena[0]?.tex ?? escena!.tex);
        gl.uniform1i(componer.u('uBloom'), 1);
        gl.uniform1f(componer.u('uConBloom'), opciones.bloom ? 1 : 0);
        gl.uniform1f(componer.u('uIntensidad'), 1.15);
      });
    },

    destruir() {
      liberar();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
