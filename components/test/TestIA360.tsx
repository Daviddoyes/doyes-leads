'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getClasesBoton } from '@/components/Boton';
import {
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
const LETRAS = ['A', 'B', 'C', 'D'];
/** Lo justo para ver la respuesta marcada antes de pasar a la siguiente. */
const PAUSA_AL_RESPONDER = 260;

// Si el navegador recarga la pestaña (pasa a menudo al volver a Instagram), no se pierde lo respondido.
const CLAVE_GUARDADO = 'ia360-test';

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

export function TestIA360({ conFoto }: { conFoto: boolean }) {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(() => PREGUNTAS_TEST.map(() => null));
  const [abierta, setAbierta] = useState('');
  const [errorAbierta, setErrorAbierta] = useState<string | null>(null);
  const [contacto, setContacto] = useState<DatosContacto>(CONTACTO_VACIO);
  const [privacidad, setPrivacidad] = useState(false);
  const [erroresServidor, setErroresServidor] = useState<ErroresContacto>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoTest | null>(null);
  const [avanzando, setAvanzando] = useState(false);

  const tituloRef = useRef<HTMLHeadingElement>(null);
  const trampaRef = useRef<HTMLInputElement>(null);
  const pasosEnHistorial = useRef(0);
  const montado = useRef(false);
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
      const destino = evento.state?.pasoTest;
      pasosEnHistorial.current = Math.max(pasosEnHistorial.current - 1, 0);
      setPaso(typeof destino === 'number' ? destino : 0);
      setAvanzando(false);
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
    setPaso(destino);
  }

  function responder(indicePregunta: number, valor: number) {
    if (avanzando) return;
    setRespuestas((anteriores) => anteriores.map((r, i) => (i === indicePregunta ? valor : r)));
    setAvanzando(true);
    window.setTimeout(() => {
      setAvanzando(false);
      irA(indicePregunta + 1);
    }, PAUSA_AL_RESPONDER);
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

  if (resultado) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-8 sm:py-14">
        <Resultado ref={tituloRef} resultado={resultado} conFoto={conFoto} />
      </div>
    );
  }

  const numero = Math.min(paso + 1, TOTAL_PREGUNTAS);
  const progreso = paso === PASO_CONTACTO ? 100 : Math.round((paso / TOTAL_PREGUNTAS) * 100);
  const pregunta = PREGUNTAS_TEST[paso];

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-12 pt-4 sm:pt-10">
      {/* Progreso y "atrás" */}
      <div className="sticky top-16 z-10 -mx-4 bg-fondo/95 px-4 pb-4 pt-3 backdrop-blur-sm sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
        <div className="flex min-h-11 items-center justify-between gap-3">
          {paso > 0 ? (
            <button
              type="button"
              onClick={volver}
              className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-tinta-suave transition-colors duration-200 hover:text-marino"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                <path d="M16 10H5m0 0 4.5-4.5M5 10l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Atrás
            </button>
          ) : (
            <span className="text-sm text-tinta-tenue">Unos 3 minutos</span>
          )}
          <span className="text-sm text-tinta-tenue" aria-live="polite">
            {paso === PASO_CONTACTO ? 'Tus datos' : `Pregunta ${numero} de ${TOTAL_PREGUNTAS}`}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Progreso del test"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progreso}
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-borde"
        >
          <div className="h-full rounded-full bg-celeste transition-[width] duration-300 ease-out" style={{ width: `${Math.max(progreso, 3)}%` }} />
        </div>
      </div>

      <div className="mt-4 sm:mt-8">
        {pregunta && (
          <fieldset key={pregunta.id} className="animate-aparecer">
            <legend className="sr-only">Pregunta {pregunta.numero}</legend>
            <h1 ref={tituloRef} tabIndex={-1} className="text-xl font-semibold tracking-tight text-marino outline-none sm:text-2xl">
              {pregunta.texto}
            </h1>
            <ul className="mt-7 space-y-3">
              {pregunta.respuestas.map((texto, valor) => {
                const elegida = respuestas[paso] === valor;
                return (
                  <li key={texto}>
                    <button
                      type="button"
                      onClick={() => responder(paso, valor)}
                      aria-pressed={elegida}
                      className={`flex min-h-[3.75rem] w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left text-base transition-all duration-200 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste ${
                        elegida
                          ? 'border-marino bg-marino text-white'
                          : 'border-borde-campo/50 bg-superficie text-tinta hover:border-marino'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          elegida ? 'bg-celeste text-marino' : 'bg-fondo text-tinta-suave'
                        }`}
                      >
                        {LETRAS[valor]}
                      </span>
                      {texto}
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        )}

        {paso === PASO_ABIERTA && (
          <div className="animate-aparecer">
            <h1 ref={tituloRef} tabIndex={-1} className="text-xl font-semibold tracking-tight text-marino outline-none sm:text-2xl">
              <label htmlFor="respuesta-abierta">{PREGUNTA_ABIERTA.texto}</label>
            </h1>
            <p className="mt-2 text-tinta-suave">Con dos o tres líneas basta. Es lo que más nos ayuda a entender tu caso.</p>
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
              className={`mt-6 block w-full resize-y rounded-2xl border bg-superficie px-4 py-3 text-base text-tinta placeholder:text-tinta-tenue/70 focus:border-marino focus:outline-none focus:ring-2 focus:ring-celeste/40 ${
                errorAbierta ? 'border-peligro' : 'border-borde-campo'
              }`}
            />
            {errorAbierta && (
              <p id="error-abierta" className="mt-1.5 text-xs font-medium text-peligro">
                {errorAbierta}
              </p>
            )}
            <button type="button" onClick={continuarAbierta} className={`${getClasesBoton('principal', 'grande')} mt-6 w-full`}>
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
    </div>
  );
}
