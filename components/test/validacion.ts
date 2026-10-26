// Las mismas reglas que aplica el portal (portal-doyes/src/lib/leads/validacion.ts),
// para avisar en el momento y no esperar al envío. El portal vuelve a comprobarlo todo.

import { PREGUNTA_ABIERTA, type Cuando, type Personas } from '@/lib/test-ia360';

export interface DatosContacto {
  nombre: string;
  email: string;
  empresa: string;
  personas: Personas | '';
  sector: string;
  cargo: string;
  telefono: string;
  cuando: Cuando | '';
}

export type CampoContacto = keyof DatosContacto | 'privacidad';
export type ErroresContacto = Partial<Record<CampoContacto, string>>;

export const CONTACTO_VACIO: DatosContacto = {
  nombre: '',
  email: '',
  empresa: '',
  personas: '',
  sector: '',
  cargo: '',
  telefono: '',
  cuando: '',
};

const esEmailValido = (texto: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto);
const esTelefonoValido = (texto: string) =>
  /^\+?[\d\s().-]{6,24}$/.test(texto) && (texto.match(/\d/g)?.length ?? 0) >= 6;

function obligatorio(valor: string, max: number, mensaje: string): string | undefined {
  const limpio = valor.trim();
  if (!limpio) return mensaje;
  if (limpio.length > max) return `Como mucho ${max} caracteres.`;
  return undefined;
}

export function validarAbierta(texto: string): string | undefined {
  const limpio = texto.trim();
  if (limpio.length < PREGUNTA_ABIERTA.minimo) return 'Cuéntanos en una o dos frases qué te ha hecho buscar una mejora.';
  if (limpio.length > PREGUNTA_ABIERTA.maximo) return `Como mucho ${PREGUNTA_ABIERTA.maximo} caracteres.`;
  return undefined;
}

export function validarContacto(datos: DatosContacto, privacidad: boolean): ErroresContacto {
  const errores: ErroresContacto = {
    nombre: obligatorio(datos.nombre, 120, 'Escribe tu nombre.'),
    email: esEmailValido(datos.email.trim()) ? undefined : 'Revisa el email: parece que falta algo.',
    empresa: obligatorio(datos.empresa, 160, 'Escribe el nombre de tu empresa.'),
    personas: datos.personas ? undefined : 'Elige cuántas personas sois.',
    sector: obligatorio(datos.sector, 120, 'Indica el sector de tu empresa.'),
    cargo: obligatorio(datos.cargo, 120, 'Indica tu cargo.'),
    telefono: !datos.telefono.trim()
      ? 'Escribe tu teléfono.'
      : esTelefonoValido(datos.telefono.trim())
        ? undefined
        : 'Revisa el teléfono: parece que falta algo.',
    cuando: datos.cuando ? undefined : 'Elige cuándo te gustaría ponerle solución.',
    privacidad: privacidad ? undefined : 'Para ver tu resultado, acepta la política de privacidad.',
  };
  return Object.fromEntries(Object.entries(errores).filter(([, v]) => v)) as ErroresContacto;
}

/** Orden de los campos en pantalla: al enviar con errores se lleva el foco al primero. */
export const ORDEN_CAMPOS: CampoContacto[] = [
  'nombre',
  'email',
  'empresa',
  'personas',
  'sector',
  'cargo',
  'telefono',
  'cuando',
  'privacidad',
];
