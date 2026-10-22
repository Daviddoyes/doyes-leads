// Dibujo de esferas en WebGL2, sin librerías. Cada esfera es un cuadrado al que
// el sombreador recorta la silueta exacta (intersección rayo-esfera) y da luz,
// brillo y reflejo del entorno. Pesa unos pocos KB en lugar de los megas de three.js.

/** Por esfera: centro en coordenadas de cámara (3), radio (1), color (3) y material (1). */
export const POR_ESFERA = 8;

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

export interface Render {
  redimensionar: (ancho: number, alto: number) => void;
  /** Dibuja las esferas, ya ordenadas de la más lejana a la más cercana. */
  pintar: (datos: Float32Array, cantidad: number, proyeccion: Float32Array) => void;
  destruir: () => void;
}

function compilar(gl: WebGL2RenderingContext, tipo: number, fuente: string) {
  const s = gl.createShader(tipo)!;
  gl.shaderSource(s, fuente);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'sombreador');
  return s;
}

export function crearRender(canvas: HTMLCanvasElement, dpr: number, maximo: number): Render {
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
