// El Test IA360, tal como está en docs/web-test-ia360.md y en el portal
// (portal-doyes/src/data/test-ia360.ts). La web solo enseña las preguntas: el
// portal recibe las respuestas y calcula el resultado (docs/api-test-ia360.md).
// Si cambia un texto, hay que cambiarlo en los dos sitios.

export type ClaveBloque = 'A' | 'B' | 'C' | 'D';
export type ColorTest = 'verde' | 'ambar' | 'rojo';
export type Personas = 'hasta_10' | '11_50' | 'mas_50';
export type Cuando = 'ahora' | 'trimestre' | 'explorando';

export interface PreguntaTest {
  /** "p1"…"p10": la clave con la que se envía la respuesta. */
  id: string;
  numero: number;
  bloque: ClaveBloque;
  texto: string;
  /** Cuatro respuestas; la posición (0-3) es lo que se envía. */
  respuestas: [string, string, string, string];
}

export const NOMBRES_BLOQUE: Record<ClaveBloque, string> = {
  A: 'Dependencia de personas',
  B: 'Tiempo y datos',
  C: 'Clientes y control',
  D: 'Herramientas e IA',
};

export const URL_API_TEST =
  process.env.NEXT_PUBLIC_TEST_IA360_URL || 'https://portal.doyesdigital.com/api/test-ia360';

export const PREGUNTAS_TEST: PreguntaTest[] = [
  {
    id: 'p1',
    numero: 1,
    bloque: 'A',
    texto: 'Si la persona clave de tu empresa (quizá tú) faltara una semana, ¿qué pasaría?',
    respuestas: ['Nada, todo sigue', 'Algunas cosas se retrasarían', 'Muchas cosas se pararían', 'La empresa se pararía'],
  },
  {
    id: 'p2',
    numero: 2,
    bloque: 'A',
    texto: '¿Vuestros procesos principales están escritos o dibujados?',
    respuestas: ['Sí, y se siguen', 'Algunos', 'Casi ninguno', 'No, cada uno lo hace a su manera'],
  },
  {
    id: 'p3',
    numero: 3,
    bloque: 'B',
    texto:
      '¿Cuántas horas a la semana dedica tu equipo a tareas repetitivas (copiar datos, preparar informes, responder lo mismo)?',
    respuestas: ['Casi ninguna', 'De 1 a 5 horas', 'De 5 a 15 horas', 'Más de 15 horas'],
  },
  {
    id: 'p4',
    numero: 4,
    bloque: 'B',
    texto: '¿Dónde está la información de clientes, pedidos y proyectos?',
    respuestas: [
      'En un sistema que todos usan',
      'En 2 o 3 herramientas conectadas',
      'Repartida entre Excel, correos y programas',
      'En la cabeza de algunas personas',
    ],
  },
  {
    id: 'p5',
    numero: 5,
    bloque: 'B',
    texto: '¿Cuántas veces se vuelve a escribir el mismo dato en sitios distintos?',
    respuestas: ['Nunca', 'Alguna vez', 'A menudo', 'Constantemente'],
  },
  {
    id: 'p6',
    numero: 6,
    bloque: 'C',
    texto: 'Cuando entra un cliente potencial, ¿qué pasa?',
    respuestas: [
      'Hay un proceso claro con seguimiento',
      'Alguien lo atiende, sin seguimiento fijo',
      'Depende de quién lo coja',
      'A veces se pierden',
    ],
  },
  {
    id: 'p7',
    numero: 7,
    bloque: 'C',
    texto: '¿Cuánto tardas en saber cómo va el mes (ventas, cobros, margen)?',
    respuestas: ['Lo veo al momento', 'Unas horas', 'Varios días', 'Solo al cierre, o no lo sé bien'],
  },
  {
    id: 'p8',
    numero: 8,
    bloque: 'C',
    texto: '¿Quién controla los accesos y los datos (contraseñas, quién ve qué)?',
    respuestas: ['Está definido y se revisa', 'Más o menos', 'Cada uno gestiona lo suyo', 'No lo sabemos'],
  },
  {
    id: 'p9',
    numero: 9,
    bloque: 'D',
    texto: '¿Cómo describirías las herramientas que usáis?',
    respuestas: [
      'Pocas y bien usadas',
      'Bastantes, pero útiles',
      'Muchas, y algunas se solapan',
      'Pagamos cosas que casi nadie usa',
    ],
  },
  {
    id: 'p10',
    numero: 10,
    bloque: 'D',
    texto: '¿Cómo estáis usando la IA ahora mismo?',
    respuestas: [
      'Con un plan, en procesos concretos',
      'Algunos la usan por su cuenta',
      'La probamos sin resultado',
      'Aún no, no sabemos por dónde empezar',
    ],
  },
];

/** Pregunta 11: sin puntos y obligatoria. */
export const PREGUNTA_ABIERTA = {
  numero: 11,
  texto: '¿Qué te ha hecho buscar una mejora ahora, y qué te gustaría conseguir?',
  ejemplo:
    'Estamos creciendo y yo ya no llego a todo. Me gustaría que el equipo funcionara sin que todo pase por mí.',
  minimo: 10,
  maximo: 2000,
};

export const TOTAL_PREGUNTAS = PREGUNTAS_TEST.length + 1;

export const OPCIONES_PERSONAS: { clave: Personas; texto: string }[] = [
  { clave: 'hasta_10', texto: 'Hasta 10' },
  { clave: '11_50', texto: 'De 11 a 50' },
  { clave: 'mas_50', texto: 'Más de 50' },
];

export const OPCIONES_CUANDO: { clave: Cuando; texto: string }[] = [
  { clave: 'ahora', texto: 'Ahora' },
  { clave: 'trimestre', texto: 'Este trimestre' },
  { clave: 'explorando', texto: 'Solo estoy explorando' },
];

export const TEXTO_RESERVA = 'Reserva una llamada de 30 minutos';

/** Lo que devuelve el portal (docs/api-test-ia360.md). */
export interface ResultadoTest {
  puntos: number;
  maximo: number;
  color: ColorTest;
  nombreColor: string;
  titular: string;
  mensaje: string;
  bloques: { clave: ClaveBloque; nombre: string; puntos: number; maximo: number; color: ColorTest }[];
  destacados: { clave: ClaveBloque; nombre: string; color: ColorTest; frase: string }[];
  llamada: { mostrar: boolean; texto: string; url: string | null };
}

export type RespuestaApi =
  | { ok: true; resultado: ResultadoTest }
  | { ok: false; error: string; campos?: Record<string, string> };
