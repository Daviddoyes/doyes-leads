// Dibujo de esferas en WebGL2, sin librerías. Cada esfera es un cuadrado al que
// el sombreador recorta la silueta exacta (intersección rayo-esfera) y da luz,
// brillo y reflejo del entorno. Pesa unos pocos KB en lugar de los megas de three.js.

/** Por esfera: centro en coordenadas de cámara (3), radio (1), color (3) y material (1). */
export const POR_ESFERA = 8;

/** Materiales: 0 brillante, 1 mate, 2 brillante con el símbolo dD en relieve (la esfera central). */
export const MATERIAL_SIMBOLO = 2;

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
uniform vec3 uFondo;
uniform float uOscuro;
uniform sampler2D uSimbolo;
uniform float uConSimbolo;
uniform vec2 uTamSimbolo;
const vec3 CELESTE = vec3(0.082, 0.659, 0.961);

// El símbolo, calcado en la cara de la esfera que mira a la cámara: x, y de -1 a 1.
// Algo por debajo del centro, para que el brillo de arriba no lo tape.
const float BAJAR_SIMBOLO = 0.1;
vec2 enSimbolo(vec2 q) {
  return vec2(q.x / uTamSimbolo.x, -(q.y + BAJAR_SIMBOLO) / uTamSimbolo.y) * 0.5 + 0.5;
}
float relieve(vec2 q) {
  vec2 t = enSimbolo(q);
  if (t.x < 0.0 || t.x > 1.0 || t.y < 0.0 || t.y > 1.0) return 0.0;
  return texture(uSimbolo, t).a;
}
vec3 colorSimbolo(vec2 q) {
  return texture(uSimbolo, clamp(enSimbolo(q), 0.0, 1.0)).rgb;
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
  vec3 base = vColor;

  if (vMaterial > 1.5 && uConSimbolo > 0.5) {
    // Ejes de la cara que mira a la cámara: el símbolo siempre de frente.
    vec3 c = normalize(vCentro);
    vec3 u = normalize(cross(c, vec3(0.0, 1.0, 0.0)));
    vec3 v = cross(u, c);
    vec3 local = (p - vCentro) / vRadio;
    vec2 q = vec2(dot(local, u), dot(local, v));
    float e = 0.012;
    float a = relieve(q);
    float gx = relieve(q + vec2(e, 0.0)) - relieve(q - vec2(e, 0.0));
    float gy = relieve(q + vec2(0.0, e)) - relieve(q - vec2(0.0, e));
    // Relieve: la normal se inclina en los bordes del símbolo, y la luz lo dibuja.
    n = normalize(n - (u * gx + v * gy) * 0.9);
    // La "D" queda tono sobre tono; la "d" toma un poco de su celeste.
    vec3 tinte = colorSimbolo(q);
    base = mix(base, mix(base, tinte, 0.55) + 0.03, a);
  }

  vec3 L = normalize(vec3(-0.55, 0.75, 0.55));
  float dif = max(dot(n, L), 0.0);
  float esp = pow(max(dot(n, normalize(L + V)), 0.0), mix(90.0, 40.0, min(vMaterial, 1.0)));
  float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);

  // Entorno de estudio: techo claro y cálido, suelo gris azulado y una ventana arriba a la izquierda.
  // Sobre marino, el estudio es oscuro y la ventana y los bordes se tiñen de celeste.
  vec3 R = reflect(-V, n);
  vec3 techo = mix(vec3(0.98, 0.975, 0.965), vec3(0.62, 0.78, 0.95), uOscuro);
  vec3 suelo = mix(vec3(0.36, 0.41, 0.5), vec3(0.01, 0.04, 0.14), uOscuro);
  vec3 entorno = mix(suelo, techo, smoothstep(-0.3, 0.5, R.y));
  float ventana = smoothstep(0.9, 0.95, dot(R, normalize(vec3(-0.5, 0.65, 0.6))));
  entorno += ventana;

  vec3 col;
  if (vMaterial < 0.5 || vMaterial > 1.5) {
    col = base * (0.22 + 0.7 * dif);
    col = mix(col, entorno, 0.06 + 0.7 * fres);
    col += vec3(esp + ventana * 0.55);
  } else {
    col = base * (0.62 + 0.38 * dif);
    col = mix(col, entorno, 0.18 + 0.45 * fres);
    col += vec3(esp * 0.45);
  }
  // Un borde celeste por debajo: la marca, sin pintar nada más. Sobre marino, más luz.
  float borde = pow(1.0 - max(dot(n, V), 0.0), 2.5);
  col += CELESTE * borde * smoothstep(0.1, -0.7, n.y) * mix(0.45, 0.9, uOscuro);
  col += mix(vec3(0.0), vec3(0.55, 0.8, 1.0) * borde * 0.35, uOscuro);
  // Las del fondo se funden un poco con el fondo.
  col = mix(col, uFondo, smoothstep(9.5, 14.0, -vCentro.z) * 0.4);

  float a = smoothstep(-w, w, h);
  salida = vec4(clamp(col, 0.0, 1.0) * a, a);
}`;

export interface OpcionesRender {
  /** Fondo marino (/v2): entorno oscuro, más brillo en los bordes. */
  oscuro?: boolean;
  /** Imagen del símbolo dD (con transparencia) para la esfera central. */
  simbolo?: HTMLImageElement | null;
}

export interface Render {
  redimensionar: (ancho: number, alto: number) => void;
  /** Dibuja las esferas, ya ordenadas de la más lejana a la más cercana. */
  pintar: (datos: Float32Array, cantidad: number, proyeccion: Float32Array) => void;
  destruir: () => void;
}

const FONDO_CLARO: [number, number, number] = [0.969, 0.965, 0.953];
const FONDO_OSCURO: [number, number, number] = [0, 0.047, 0.204];

function compilar(gl: WebGL2RenderingContext, tipo: number, fuente: string) {
  const s = gl.createShader(tipo)!;
  gl.shaderSource(s, fuente);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'sombreador');
  return s;
}

export function crearRender(canvas: HTMLCanvasElement, dpr: number, maximo: number, { oscuro = false, simbolo = null }: OpcionesRender = {}): Render {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
  if (!gl) throw new Error('Sin WebGL2');

  const programa = gl.createProgram()!;
  gl.attachShader(programa, compilar(gl, gl.VERTEX_SHADER, VERTICES));
  gl.attachShader(programa, compilar(gl, gl.FRAGMENT_SHADER, FRAGMENTOS));
  gl.linkProgram(programa);
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(programa) ?? 'programa');
  const uProyeccion = gl.getUniformLocation(programa, 'uProyeccion');

  gl.bindVertexArray(gl.createVertexArray());
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const bufferEsferas = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferEsferas);
  gl.bufferData(gl.ARRAY_BUFFER, maximo * POR_ESFERA * 4, gl.DYNAMIC_DRAW);
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
  gl.uniform3fv(gl.getUniformLocation(programa, 'uFondo'), oscuro ? FONDO_OSCURO : FONDO_CLARO);
  gl.uniform1f(gl.getUniformLocation(programa, 'uOscuro'), oscuro ? 1 : 0);
  gl.uniform1f(gl.getUniformLocation(programa, 'uConSimbolo'), simbolo ? 1 : 0);
  if (simbolo) {
    // El símbolo ocupa el 60 % del ancho de la esfera, con sus proporciones.
    const ancho = 0.6;
    gl.uniform2f(gl.getUniformLocation(programa, 'uTamSimbolo'), ancho, (ancho * simbolo.naturalHeight) / simbolo.naturalWidth);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, simbolo);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(programa, 'uSimbolo'), 0);
  }
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  return {
    redimensionar(ancho, alto) {
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    pintar(datos, cantidad, proyeccion) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniformMatrix4fv(uProyeccion, false, proyeccion);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferEsferas);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, datos, 0, cantidad * POR_ESFERA);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, cantidad);
    },
    destruir() {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
