'use client';

import Link from 'next/link';
import { forwardRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';

import { getClasesBoton } from '@/components/Boton';
import { OPCIONES_CUANDO, OPCIONES_PERSONAS } from '@/lib/test-ia360';

import {
  ORDEN_CAMPOS,
  validarContacto,
  type CampoContacto,
  type DatosContacto,
  type ErroresContacto,
} from './validacion';

interface PasoContactoProps {
  datos: DatosContacto;
  onCambio: (datos: DatosContacto) => void;
  privacidad: boolean;
  onPrivacidad: (valor: boolean) => void;
  /** Errores que devuelve el portal al enviar, por campo. */
  erroresServidor: ErroresContacto;
  errorGeneral: string | null;
  enviando: boolean;
  onEnviar: () => void;
  trampaRef: RefObject<HTMLInputElement>;
}

const CLASES_CAMPO =
  'mt-1.5 block min-h-12 w-full rounded-xl border bg-superficie px-4 py-3 text-base text-tinta placeholder:text-tinta-tenue/70 ' +
  'transition-colors duration-200 focus:border-marino focus:outline-none focus:ring-2 focus:ring-celeste/40';

function MensajeError({ id, texto }: { id: string; texto?: string }) {
  if (!texto) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-peligro">
      {texto}
    </p>
  );
}

interface CampoTextoProps {
  campo: Exclude<keyof DatosContacto, 'personas' | 'cuando'>;
  etiqueta: string;
  opcional?: boolean;
  type?: string;
  autoComplete: string;
  inputMode?: 'email' | 'tel' | 'text';
  valor: string;
  error?: string;
  onCambio: (valor: string) => void;
  onSalir: () => void;
}

function CampoTexto({ campo, etiqueta, opcional, type = 'text', autoComplete, inputMode, valor, error, onCambio, onSalir }: CampoTextoProps) {
  const idError = `error-${campo}`;
  return (
    <div>
      <label htmlFor={`campo-${campo}`} className="text-sm font-medium text-marino">
        {etiqueta}
        {opcional && <span className="font-normal text-tinta-tenue"> (opcional)</span>}
      </label>
      <input
        id={`campo-${campo}`}
        name={campo}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        onBlur={onSalir}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? idError : undefined}
        aria-required={!opcional}
        className={`${CLASES_CAMPO} ${error ? 'border-peligro' : 'border-borde-campo'}`}
      />
      <MensajeError id={idError} texto={error} />
    </div>
  );
}

interface GrupoOpcionesProps<T extends string> {
  campo: 'personas' | 'cuando';
  etiqueta: string;
  opciones: { clave: T; texto: string }[];
  valor: T | '';
  error?: string;
  onCambio: (valor: T) => void;
  columnas: string;
}

/** Radios con aspecto de botón: grandes y fáciles de tocar en el móvil. */
function GrupoOpciones<T extends string>({ campo, etiqueta, opciones, valor, error, onCambio, columnas }: GrupoOpcionesProps<T>) {
  const idError = `error-${campo}`;
  return (
    <fieldset id={`campo-${campo}`} tabIndex={-1} aria-describedby={error ? idError : undefined} className="outline-none">
      <legend className="text-sm font-medium text-marino">{etiqueta}</legend>
      <div className={`mt-1.5 grid gap-2 ${columnas}`}>
        {opciones.map((o) => {
          const elegida = valor === o.clave;
          return (
            <label
              key={o.clave}
              className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-center text-sm font-medium transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-celeste ${
                elegida
                  ? 'border-marino bg-marino text-white'
                  : `bg-superficie text-tinta hover:border-marino ${error ? 'border-peligro' : 'border-borde-campo'}`
              }`}
            >
              <input
                type="radio"
                name={campo}
                value={o.clave}
                checked={elegida}
                onChange={() => onCambio(o.clave)}
                className="sr-only"
              />
              {o.texto}
            </label>
          );
        })}
      </div>
      <MensajeError id={idError} texto={error} />
    </fieldset>
  );
}

export const PasoContacto = forwardRef<HTMLHeadingElement, PasoContactoProps>(function PasoContacto(
  { datos, onCambio, privacidad, onPrivacidad, erroresServidor, errorGeneral, enviando, onEnviar, trampaRef },
  tituloRef,
) {
  const [tocados, setTocados] = useState<Partial<Record<CampoContacto, boolean>>>({});
  const [intentado, setIntentado] = useState(false);

  const erroresLocales = validarContacto(datos, privacidad);
  // Un campo enseña su error al salir de él (o al intentar enviar); el del portal, hasta que se cambia algo.
  const getError = (campo: CampoContacto) =>
    (tocados[campo] || intentado ? erroresLocales[campo] : undefined) ?? erroresServidor[campo];

  const tocar = (campo: CampoContacto) => setTocados((t) => ({ ...t, [campo]: true }));
  const cambiar = <K extends keyof DatosContacto>(campo: K, valor: DatosContacto[K]) => onCambio({ ...datos, [campo]: valor });

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    setIntentado(true);
    const primero = ORDEN_CAMPOS.find((c) => erroresLocales[c]);
    if (primero) {
      document.getElementById(`campo-${primero}`)?.focus();
      return;
    }
    onEnviar();
  }

  const texto = (campo: CampoTextoProps['campo'], etiqueta: string, autoComplete: string, extra: Partial<CampoTextoProps> = {}) => (
    <CampoTexto
      campo={campo}
      etiqueta={etiqueta}
      autoComplete={autoComplete}
      valor={datos[campo]}
      error={getError(campo)}
      onCambio={(v) => cambiar(campo, v)}
      onSalir={() => tocar(campo)}
      {...extra}
    />
  );

  return (
    <form noValidate onSubmit={enviar} className="animate-aparecer">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-acento">Último paso</p>
      <h1 ref={tituloRef} tabIndex={-1} className="mt-2 text-2xl font-semibold tracking-tight text-marino outline-none">
        ¿Dónde te enviamos tu resultado?
      </h1>
      <p className="mt-2 text-tinta-suave">Lo verás aquí mismo al momento y te llegará también por correo.</p>

      <div className="mt-7 space-y-5">
        {texto('nombre', 'Nombre', 'name')}
        {texto('email', 'Email', 'email', { type: 'email', inputMode: 'email' })}
        {texto('empresa', 'Empresa', 'organization')}
        <GrupoOpciones
          campo="personas"
          etiqueta="¿Cuántas personas sois?"
          opciones={OPCIONES_PERSONAS}
          valor={datos.personas}
          error={getError('personas')}
          onCambio={(v) => cambiar('personas', v)}
          columnas="grid-cols-3"
        />
        {texto('sector', 'Sector', 'off')}
        {texto('cargo', 'Cargo', 'organization-title')}
        {texto('telefono', 'Teléfono', 'tel', { type: 'tel', inputMode: 'tel', opcional: true })}
        <GrupoOpciones
          campo="cuando"
          etiqueta="¿Cuándo te gustaría ponerle solución?"
          opciones={OPCIONES_CUANDO}
          valor={datos.cuando}
          error={getError('cuando')}
          onCambio={(v) => cambiar('cuando', v)}
          columnas="grid-cols-1 sm:grid-cols-3"
        />

        {/* Campo trampa: invisible para las personas, los robots lo rellenan. */}
        <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
          <label>
            Web
            <input ref={trampaRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl py-1 text-sm text-tinta-suave">
            <input
              id="campo-privacidad"
              type="checkbox"
              checked={privacidad}
              onChange={(e) => {
                onPrivacidad(e.target.checked);
                tocar('privacidad');
              }}
              aria-invalid={Boolean(getError('privacidad'))}
              aria-describedby={getError('privacidad') ? 'error-privacidad' : undefined}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-marino"
            />
            <span>
              He leído y acepto la{' '}
              <Link href="/privacidad" target="_blank" className="font-medium text-acento underline underline-offset-2 hover:text-acento-hover">
                política de privacidad
              </Link>
              . Usaremos tus datos para enviarte el resultado y, si quieres, hablar contigo sobre tu empresa.
            </span>
          </label>
          <MensajeError id="error-privacidad" texto={getError('privacidad')} />
        </div>
      </div>

      {errorGeneral && (
        <p role="alert" className="mt-6 rounded-xl border border-peligro/30 bg-peligro-suave p-4 text-sm text-peligro">
          {errorGeneral}
        </p>
      )}

      <button type="submit" disabled={enviando} className={`${getClasesBoton('principal', 'grande')} mt-7 w-full`}>
        {enviando ? (
          <>
            <Spinner />
            Calculando tu resultado…
          </>
        ) : (
          'Ver mi resultado'
        )}
      </button>
    </form>
  );
});

function Spinner(): ReactNode {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 animate-spin" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
