// Textos de la portada: lo esencial, en frases cortas, y todo hacia el test.
// Las preguntas del test, en lib/test-ia360.ts; las fases, como en el portal
// (data/catalogo.ts), pero recortadas.

/** El botón al test dice siempre lo mismo, en toda la web. */
export const BOTON_TEST = 'Haz el test gratis';

/** El titular de la portada, en mayúsculas y en dos frases. */
export const TITULAR = ['Ordena tu empresa.', 'Poténciala con IA.'];
/** Una línea; en el móvil se parte por la pregunta. */
export const LINEA = ['¿Cómo está la tuya?', 'Descúbrelo en 3 minutos.'];

export const DOLORES = [
  { titulo: 'Todo pasa por ti.', texto: 'Si faltas una semana, se para.' },
  { titulo: 'Horas que se van.', texto: 'Copiar datos, preparar informes, responder lo mismo.' },
  { titulo: 'Herramientas que nadie usa bien.', texto: 'Programas que se solapan y nadie aprovecha.' },
  { titulo: 'La IA, sin saber por dónde empezar.', texto: 'Puede ayudarte, pero no quieres tirar el dinero.' },
];

export const GANAS = {
  titulo: 'Tecnología que te quita trabajo, no que te da más.',
  entradilla: 'Más tiempo. Más margen. Una empresa que no depende de una sola persona.',
};

export const METODO = {
  titulo: 'Primero afilamos el hacha.',
  texto: 'La IA no arregla una empresa desordenada. Por eso empezamos por entender cómo trabajáis.',
  fases: [
    { nombre: 'Bienvenida', descripcion: 'Firmamos la confidencialidad.' },
    { nombre: 'Entender', descripcion: 'Cada área nos cuenta cómo trabaja.' },
    { nombre: 'Hacer visible', descripcion: 'Dibujamos los procesos que más pesan.' },
    { nombre: 'Ordenar y decidir', descripcion: 'Qué simplificar, qué automatizar y dónde aporta la IA.' },
    { nombre: 'Plan', descripcion: 'Un roadmap priorizado, presentado en una sesión.' },
  ],
};

export const PASOS: { nombre: string; texto: string; precio: string; enlace?: { href: string; texto: string } }[] = [
  { nombre: 'Test IA360', texto: '10 preguntas y una llamada de 30 minutos.', precio: 'Gratis' },
  { nombre: 'Diagnóstico IA360Empresas', texto: 'Mapa, oportunidades, seguridad y roadmap. De 7 a 30 días.', precio: 'Desde 3.000 € + IVA' },
  {
    nombre: 'Implementación IA360Empresas',
    texto: 'Lo que valide el roadmap, con quien elijas.',
    precio: 'Presupuesto aparte',
    enlace: { href: '#partner', texto: 'Cómo te acompañamos' },
  },
];

export const PARTNER = {
  titulo: 'Tu partner tecnológico',
  entradilla: 'El roadmap es el principio. Te acompañamos en lo que venga después.',
  servicios: [
    {
      nombre: 'Implementación',
      texto: 'Aplicaciones, integraciones y automatizaciones que valida el roadmap. Con nosotros, con tu equipo o con quien elijas.',
    },
    {
      nombre: 'IA para CEOs y directivos',
      texto: 'Programas 1 a 1 a medida: aprende a usar la IA y a decidir con criterio, con seguimiento si lo necesitas.',
    },
    {
      nombre: 'Herramientas para dirección',
      texto: 'Cuadros de mando, asistentes de IA e informes automáticos hechos para quien dirige.',
    },
  ],
  boton: 'Hablemos',
};

export const ENTREGABLES = [
  { titulo: 'Un mapa de tu empresa hoy', texto: 'Dónde se pierde tiempo y se desordena el trabajo.' },
  { titulo: 'Las oportunidades reales', texto: 'Qué automatizar, dónde aporta la IA y dónde no hace falta.' },
  { titulo: 'La seguridad de cada una', texto: 'Riesgos evaluados antes de implementar nada.' },
  { titulo: 'Un roadmap por impacto y riesgo', texto: 'Con el porqué de cada paso.' },
];

export const PREGUNTAS = [
  {
    pregunta: '¿Por qué pagar un diagnóstico?',
    respuesta: 'Porque automatizar sin entender sale caro. Y el roadmap es tuyo: úsalo con quien quieras.',
  },
  {
    pregunta: 'Ya tenemos IT.',
    respuesta: 'Perfecto. IT mantiene los sistemas; nosotros miramos cómo trabaja la empresa. El roadmap le sirve de guía.',
  },
  {
    pregunta: 'Ya usamos ChatGPT.',
    respuesta: 'Buen comienzo. La diferencia está en llevar la IA a los procesos que más pesan, sin riesgos.',
  },
  { pregunta: 'No tenemos tiempo.', respuesta: 'Precisamente por eso. Os pedimos poco, y en 7 a 30 días está listo.' },
  { pregunta: '¿Y si no hace falta IA?', respuesta: 'Te lo diremos. Decidir no implementar también es valor.' },
  { pregunta: '¿Qué pasa con nuestros datos?', respuesta: 'Confidencialidad firmada desde el primer día y datos en Europa.' },
];
