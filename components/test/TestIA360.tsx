'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getClasesBoton } from '@/components/Boton';
import {
  NOMBRES_BLOQUE,
  PREGUNTA_ABIERTA,
  PREGUNTAS_TEST,
  TOTAL_PREGUNTAS,
  type ResultadoTest,
} from '@/lib/test-ia360';

import { enviarTest } from './enviar';
import { PasoContacto } from './PasoContacto';
import { Resultado } from './Resultado';
import { CONTACTO_VACIO, validarAbierta, type DatosContacto, type ErroresContacto } from './validacion';

/*
 * Pasos: 0-9 las preguntas con puntos, 10 la pregunta abierta y 11 los datos
 * de contacto. Cada paso entra en el historial del navegador, para que el
 * botón "atrás" del móvil vuelva a la pregunta anterior y no saque del test.
 */
const PASO_ABIERTA = PREGUNTAS_TEST.length;
const PASO_CONTACTO = PASO_ABIERTA + 1;
/** Lo justo para ver la respuesta marcada antes de que salga la pregunta. */
const PAUSA_AL_RESPONDER = 140;
/** Lo que dura la salida (.saliendo en globals.css). */
const SALIDA = 160;

// Si el navegador recarga la pestaña (pasa a menudo al volver a Instagram), no se pierde lo respondido.
const CLAVE_GUARDADO = 'ia360-test';

type Direccion = 'adelante' | 'atras' | null;

interface Guardado {
  paso: number;
  respuestas: (number | null)[];
  abierta: string;
  contacto: DatosContacto;
}

function leerGuardado(): Guardado | null {
  try {
    const texto = window.sessionStorage.getItem(CLAVE_GUARDADO);
    if (!texto) return null;
    const guardado = JSON.parse(texto) as Guardado;
    return Array.isArray(guardado.respuestas) && guardado.respuestas.length === PREGUNTAS_TEST.length ? guardado : null;
  } catch {
    return null;
  }
}

function escribirGuardado(guardado: Guardado | null) {
  try {
    if (guardado) window.sessionStorage.setItem(CLAVE_GUARDADO, JSON.stringify(guardado));
    else window.sessionStorage.removeItem(CLAVE_GUARDADO);
  } catch {
    // Almacenamiento bloqueado: el test funciona igual, solo no sobrevive a una recarga.
  }
}

/** El primer paso al que se puede ir: no se salta ninguna pregunta sin responder. */
function getPasoPermitido(paso: number, respuestas: (number | null)[], abierta: string): number {
  const sinResponder = respuestas.findIndex((r) => r === null);
  if (sinResponder !== -1 && paso > sinResponder) return sinResponder;
  if (paso > PASO_ABIERTA && validarAbierta(abierta)) return PASO_ABIERTA;
  return Math.min(Math.max(paso, 0), PASO_CONTACTO);
}

export function TestIA360() {
  const [paso, setPaso] = useState(0);
  const [direccion, setDireccion] = useState<Direccion>(null);
  const [saliendo, setSaliendo] = useState(false);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(() => PREGUNTAS_TEST.map(() => null));
  const [abierta, setAbierta] = useState('');
  const [errorAbierta, setErrorAbierta] = useState<string | null>(null);
  const [contacto, setContacto] = useState<DatosContacto>(CONTACTO_VACIO);
  const [privacidad, setPrivacidad] = useState(false);
  const [erroresServidor, setErroresServidor] = useState<ErroresContacto>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoTest | null>(null);

  const tituloRef = useRef<HTMLHeadingElement>(null);
  const trampaRef = useRef<HTMLInputElement>(null);
  const pasosEnHistorial = useRef(0);
  const montado = useRef(false);
  const ocupado = useRef(false);
  const pasoRef = useRef(0);
  pasoRef.current = paso;
  const resultadoRef = useRef<ResultadoTest | null>(null);
  resultadoRef.current = resultado;

  // Al entrar: recupera lo respondido y marca el paso actual en el historial.
  useEffect(() => {
    const guardado = leerGuardado();
    let inicial = 0;
    if (guardado) {
      setRespuestas(guardado.respuestas);
      setAbierta(guardado.abierta ?? '');
      setContacto({ ...CONTACTO_VACIO, ...guardado.contacto });
      inicial = getPasoPermitido(guardado.paso, guardado.respuestas, guardado.abierta ?? '');
      setPaso(inicial);
    }
    window.history.replaceState({ ...window.history.state, pasoTest: inicial }, '');

    function alVolver(evento: PopStateEvent) {
      // Con el resultado ya en pantalla, volver no reabre el formulario.
      if (resultadoRef.current) return;
      const destino = typeof evento.state?.pasoTest === 'number' ? evento.state.pasoTest : 0;
      pasosEnHistorial.current = Math.max(pasosEnHistorial.current - 1, 0);
      ocupado.current = false;
      setSaliendo(false);
      setDireccion(destino < pasoRef.current ? 'atras' : 'adelante');
      setPaso(destino);
    }
    window.addEventListener('popstate', alVolver);
    return () => window.removeEventListener('popstate', alVolver);
  }, []);

  useEffect(() => {
    if (resultado) return;
    escribirGuardado({ paso, respuestas, abierta, contacto });
  }, [paso, respuestas, abierta, contacto, resultado]);

  // Cada pantalla nueva empieza arriba, con el foco en su título (para lectores de pantalla).
  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      return;
    }
    window.scrollTo({ top: 0 });
    tituloRef.current?.focus({ preventScroll: true });
  }, [paso, resultado]);

  const irA = useCallback((destino: number) => {
    window.history.pushState({ ...window.history.state, pasoTest: destino }, '');
    pasosEnHistorial.current += 1;
    setDireccion('adelante');
    setSaliendo(false);
    setPaso(destino);
  }, []);

  function volver() {
    if (pasosEnHistorial.current > 0) {
      window.history.back();
      return;
    }
    // Se ha llegado a este paso recargando: no hay historial propio al que volver.
    const destino = Math.max(paso - 1, 0);
    window.history.replaceState({ ...window.history.state, pasoTest: destino }, '');
    setDireccion('atras');
    setPaso(destino);
  }

  function responder(indicePregunta: number, valor: number) {
    if (ocupado.current) return;
    ocupado.current = true;
    setRespuestas((anteriores) => anteriores.map((r, i) => (i === indicePregunta ? valor : r)));
    // La respuesta se marca, la pregunta sale y entra la siguiente.
    window.setTimeout(() => setSaliendo(true), PAUSA_AL_RESPONDER);
    window.setTimeout(() => {
      ocupado.current = false;
      irA(indicePregunta + 1);
    }, PAUSA_AL_RESPONDER + SALIDA);
  }

  function continuarAbierta() {
    const error = validarAbierta(abierta);
    setErrorAbierta(error ?? null);
    if (error) {
      document.getElementById('respuesta-abierta')?.focus();
      return;
    }
    irA(PASO_CONTACTO);
  }

  async function enviar() {
    setEnviando(true);
    setErrorGeneral(null);
    setErroresServidor({});
    const respuesta = await enviarTest({
      respuestas: respuestas.map((r) => r ?? 0),
      abierta,
      contacto,
      website: trampaRef.current?.value ?? '',
    });
    setEnviando(false);

    if (respuesta.ok) {
      escribirGuardado(null);
      window.history.pushState({ ...window.history.state, pasoTest: 'resultado' }, '');
      setResultado(respuesta.resultado);
      return;
    }

    setErrorGeneral(respuesta.error);
    const campos = respuesta.campos ?? {};
    const deContacto: ErroresContacto = {};
    for (const [clave, mensaje] of Object.entries(campos)) {
      if (clave.startsWith('contacto.')) deContacto[clave.slice(9) as keyof ErroresContacto] = mensaje;
      if (clave === 'privacidad') deContacto.privacidad = mensaje;
    }
    setErroresServidor(deContacto);
    // Un error en las respuestas o en la pregunta abierta: se vuelve a esa pantalla.
    const pregunta = PREGUNTAS_TEST.findIndex((p) => campos[`respuestas.${p.id}`]);
    if (pregunta !== -1) irA(pregunta);
    else if (campos.abierta) {
      setErrorAbierta(campos.abierta);
      irA(PASO_ABIERTA);
    }
  }

  const numero = Math.min(paso + 1, TOTAL_PREGUNTAS);
  const progreso = resultado || paso === PASO_CONTACTO ? 100 : Math.round((paso / TOTAL_PREGUNTAS) * 100);
  const pregunta = PREGUNTAS_TEST[paso];
  const claseEntrada = saliendo ? 'saliendo' : direccion === 'atras' ? 'entrar-atras' : direccion === 'adelante' ? 'entrar-adelante' : '';

  return (
    <div className="mx-auto w-full max-w-[40rem] px-5 pb-16 pt-2 sm:pt-8">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-subtitulo text-tinta">Test IA360</h1>
        {!resultado && (
          <p className="text-detalle tabular-nums text-tinta-tenue" aria-live="polite">
            {paso === PASO_CONTACTO ? 'Tus datos' : `${numero} / ${TOTAL_PREGUNTAS}`}
          </p>
        )}
      </div>
      <div
        role="progressbar"
        aria-label="Progreso del test"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progreso}
        className="mt-3 h-px bg-white/10"
      >
        <div className="h-full bg-gradient-to-r from-celeste/40 via-celeste to-[#9fdcff] shadow-[0_0_10px_1px_rgba(21,168,245,0.8)] transition-[width] duration-300 ease-out" style={{ width: `${progreso}%` }} />
      </div>

      {resultado ? (
        <Resultado ref={tituloRef} resultado={resultado} />
      ) : (
        <>
          <div className="mt-4 flex min-h-11 items-center">
            {paso > 0 ? (
              <button
                type="button"
                onClick={volver}
                className="-ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-detalle font-medium text-tinta-suave transition-colors duration-150 hover:text-tinta"
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                  <path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Atrás
              </button>
            ) : (
              <p className="text-detalle text-tinta-tenue">Unos 3 minutos. Al final verás tu resultado.</p>
            )}
          </div>

          <div key={paso} className={`mt-6 sm:mt-10 ${claseEntrada}`}>
            {pregunta && (
              <fieldset>
                <legend className="sr-only">Pregunta {pregunta.numero}</legend>
                <p className="text-detalle text-tinta-tenue">{NOMBRES_BLOQUE[pregunta.bloque]}</p>
                <h2 ref={tituloRef} tabIndex={-1} className="mt-2 text-pregunta text-tinta outline-none">
                  {pregunta.texto}
                </h2>
                <ul className="mt-8 space-y-3">
                  {pregunta.respuestas.map((texto, valor) => {
                    const elegida = respuestas[paso] === valor;
                    return (
                      <li key={texto}>
                        <button
                          type="button"
                          onClick={() => responder(paso, valor)}
                          aria-pressed={elegida}
                          className={`flex min-h-16 w-full items-center rounded-xl border px-5 py-3 text-left text-texto transition-all duration-200 ${
                            elegida
                              ? 'border-celeste bg-celeste/15 text-white shadow-[0_0_28px_-6px_rgba(21,168,245,0.75),inset_0_0_0_1px_rgba(21,168,245,0.6)]'
                              : 'border-white/10 bg-white/[0.035] text-tinta hover:border-celeste/50 hover:bg-white/[0.06]'
                          }`}
                        >
                          {texto}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            )}

            {paso === PASO_ABIERTA && (
              <div>
                <p className="text-detalle text-tinta-tenue">Para terminar</p>
                <h2 ref={tituloRef} tabIndex={-1} className="mt-2 text-pregunta text-tinta outline-none">
                  <label htmlFor="respuesta-abierta">{PREGUNTA_ABIERTA.texto}</label>
                </h2>
                <p className="mt-3 text-tinta-suave">Con dos o tres líneas basta.</p>
                <textarea
                  id="respuesta-abierta"
                  rows={5}
                  value={abierta}
                  maxLength={PREGUNTA_ABIERTA.maximo}
                  onChange={(e) => {
                    setAbierta(e.target.value);
                    if (errorAbierta) setErrorAbierta(validarAbierta(e.target.value) ?? null);
                  }}
                  onBlur={() => abierta && setErrorAbierta(validarAbierta(abierta) ?? null)}
                  placeholder={PREGUNTA_ABIERTA.ejemplo}
                  aria-invalid={Boolean(errorAbierta)}
                  aria-describedby={errorAbierta ? 'error-abierta' : undefined}
                  aria-required
                  className={`mt-6 block w-full resize-y rounded-xl border bg-white/[0.04] px-4 py-3 text-texto text-tinta placeholder:text-tinta-tenue focus:border-celeste focus:bg-white/[0.06] focus:outline-none ${
                    errorAbierta ? 'border-peligro' : 'border-borde-campo'
                  }`}
                />
                {errorAbierta && (
                  <p id="error-abierta" className="mt-2 text-detalle font-medium text-peligro">
                    {errorAbierta}
                  </p>
                )}
                <button type="button" onClick={continuarAbierta} className={`${getClasesBoton()} mt-8 w-full`}>
                  Continuar
                </button>
              </div>
            )}

            {paso === PASO_CONTACTO && (
              <PasoContacto
                ref={tituloRef}
                datos={contacto}
                onCambio={(datos) => {
                  setContacto(datos);
                  setErroresServidor({});
                }}
                privacidad={privacidad}
                onPrivacidad={setPrivacidad}
                erroresServidor={erroresServidor}
                errorGeneral={errorGeneral}
                enviando={enviando}
                onEnviar={enviar}
                trampaRef={trampaRef}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
