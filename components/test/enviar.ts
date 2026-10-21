// Envío del test al portal, con el formato de docs/api-test-ia360.md.

import { getOrigen } from '@/lib/origen';
import { PREGUNTAS_TEST, URL_API_TEST, type RespuestaApi } from '@/lib/test-ia360';

import type { DatosContacto } from './validacion';

interface DatosEnvio {
  respuestas: number[];
  abierta: string;
  contacto: DatosContacto;
  /** El campo trampa: una persona lo deja vacío. */
  website: string;
}

const ESPERA_MAXIMA = 25_000;
const ERROR_CONEXION =
  'No hemos podido enviar el test. Revisa tu conexión e inténtalo de nuevo: tus respuestas siguen aquí.';

export async function enviarTest({ respuestas, abierta, contacto, website }: DatosEnvio): Promise<RespuestaApi> {
  const cuerpo = {
    respuestas: Object.fromEntries(PREGUNTAS_TEST.map((p, i) => [p.id, respuestas[i]])),
    abierta: abierta.trim(),
    contacto: {
      nombre: contacto.nombre.trim(),
      email: contacto.email.trim(),
      empresa: contacto.empresa.trim(),
      personas: contacto.personas,
      sector: contacto.sector.trim(),
      cargo: contacto.cargo.trim(),
      telefono: contacto.telefono.trim(),
      cuando: contacto.cuando,
    },
    privacidad: true,
    origen: getOrigen(),
    website,
  };

  const control = new AbortController();
  const temporizador = window.setTimeout(() => control.abort(), ESPERA_MAXIMA);
  try {
    const respuesta = await fetch(URL_API_TEST, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
      signal: control.signal,
    });
    try {
      return (await respuesta.json()) as RespuestaApi;
    } catch {
      return { ok: false, error: ERROR_CONEXION };
    }
  } catch {
    return { ok: false, error: ERROR_CONEXION };
  } finally {
    window.clearTimeout(temporizador);
  }
}
