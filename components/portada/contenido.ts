// Textos de la portada, de docs/web-test-ia360.md. Las fases, como en el portal
// (data/catalogo.ts). Los usan la portada y sus versiones de prueba (/v1, /v2).

import { PRODUCTO } from '@/lib/marca';

export const TITULAR = 'Tecnología que te quita trabajo, no que te da más.';
export const SUBTITULO =
  'Analizamos cómo funciona tu empresa y te decimos qué ordenar, qué automatizar y dónde la IA te ahorra tiempo y dinero. Y también dónde no hace falta.';

/** El título de "Lo que ganas". */
export const TITULO_GANAS = 'Más tiempo. Más margen. Una empresa que no depende de una sola persona.';

export const DOLORES = [
  { titulo: 'Todo pasa por ti.', texto: 'Si faltas una semana, la mitad de las cosas se paran.' },
  { titulo: 'Horas que se van.', texto: 'Tu equipo copia datos, prepara informes y responde lo mismo cada semana.' },
  { titulo: 'Herramientas que nadie usa bien.', texto: 'Pagas programas que se solapan y nadie aprovecha.' },
  { titulo: 'La IA, sin saber por dónde empezar.', texto: 'Sabes que puede ayudarte, pero no quieres tirar el dinero.' },
];

export const FASES = [
  { nombre: 'Bienvenida', descripcion: 'Firmamos la confidencialidad y nos contáis cómo es vuestra empresa.' },
  { nombre: 'Entender', descripcion: 'Cada responsable de área nos cuenta cómo se trabaja de verdad.' },
  { nombre: 'Hacer visible', descripcion: 'Dibujamos con vosotros los procesos que más pesan y dónde se atascan.' },
  {
    nombre: 'Ordenar y decidir',
    descripcion: 'Detectamos qué simplificar, qué automatizar y dónde aporta la IA, revisando la seguridad de cada cambio.',
  },
  { nombre: 'Plan', descripcion: 'Os entregamos el roadmap priorizado y lo presentamos en una sesión.' },
];

export const PASOS = [
  { nombre: 'Test IA360', texto: '10 preguntas y una llamada de 30 minutos', precio: 'Gratis' },
  {
    nombre: `Diagnóstico ${PRODUCTO}`,
    texto: 'Mapa de tu empresa, oportunidades, seguridad y roadmap, en 7-30 días según tamaño',
    precio: 'Desde 3.000 € + IVA',
  },
  {
    nombre: `Implementación ${PRODUCTO}`,
    texto: 'Lo que el roadmap valida, con nosotros, con tu equipo de IT o con quien elijas',
    precio: 'Presupuesto aparte',
  },
];

export const ENTREGABLES = [
  {
    titulo: 'Un mapa de cómo funciona tu empresa hoy',
    texto: 'Procesos, herramientas y equipos, con los puntos donde se pierde tiempo o se desordena el trabajo.',
  },
  {
    titulo: 'Las oportunidades reales',
    texto: 'Qué mejorar, qué automatizar y dónde aporta la IA. Y también dónde no hace falta.',
  },
  {
    titulo: 'La seguridad de cada oportunidad',
    texto: 'Accesos, datos, dependencias y riesgos, evaluados antes de implementar nada.',
  },
  {
    titulo: 'Un roadmap ordenado por impacto y riesgo',
    texto: 'Con el porqué de cada paso, presentado en una sesión con tu equipo.',
  },
];

export const PREGUNTAS_FRECUENTES = [
  {
    pregunta: '¿Por qué pagar un diagnóstico?',
    respuesta:
      'Porque automatizar sin entender sale caro. El diagnóstico te dice qué hacer, en qué orden y qué no hacer, antes de gastar en herramientas o desarrollos. Y el roadmap es tuyo: lo puedes llevar a cabo con nosotros o con quien quieras.',
  },
  {
    pregunta: 'Ya tenemos IT.',
    respuesta:
      'Perfecto. Tu equipo de IT mantiene los sistemas; nosotros miramos cómo trabaja la empresa: procesos, datos y decisiones. El roadmap le sirve de guía y, si quiere, la implementación la puede hacer él, con nuestro acompañamiento.',
  },
  {
    pregunta: 'Ya usamos ChatGPT.',
    respuesta:
      'Es un buen comienzo. Pero que cada uno use la IA por su cuenta no es lo mismo que llevarla a los procesos que más pesan, con los datos correctos y sin riesgos. Ahí está la diferencia entre probar y ahorrar horas de verdad.',
  },
  {
    pregunta: 'No tenemos tiempo.',
    respuesta:
      'Precisamente por eso. Os pedimos poco: unos formularios por área y unas sesiones cortas con quien hace el trabajo. Del resto nos encargamos nosotros, y el diagnóstico está listo en 7 a 30 días según el tamaño de la empresa.',
  },
  {
    pregunta: '¿Y si no hace falta IA?',
    respuesta:
      'Te lo diremos. Muchas veces lo que más tiempo ahorra es ordenar un proceso o quitar una herramienta que sobra. No todo necesita IA, y decidir no implementar también es valor.',
  },
  {
    pregunta: '¿Qué pasa con nuestros datos?',
    respuesta:
      'Firmamos la confidencialidad desde el primer día, antes de que nos cuentes nada. Trabajamos en un espacio privado, los datos se guardan en Europa y no autorizamos que tu información se use para entrenar modelos de IA.',
  },
];
