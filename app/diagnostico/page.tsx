'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import Link from 'next/link';
import type { ApiResponse } from '@/lib/types';

// ── Types ─────────────────────────────────────────────────────────────────────

type Sector = 'inmobiliario' | 'servicios' | 'retail' | 'industria';
type Size = '1-5' | '6-15' | '16-50';
type Tried = 'no' | 'tools' | 'consultant';
type Urgency = 'now' | 'quarter' | 'exploring';
type Budget = 'yes' | 'justify' | 'no';

interface FormState {
  sector: Sector | '';
  size: Size | '';
  pain: string;
  tried: Tried | '';
  urgency: Urgency | '';
  budget: Budget | '';
  name: string;
  email: string;
  company: string;
  notes: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;

const SECTOR_OPTIONS: { value: Sector; label: string; sub: string }[] = [
  { value: 'inmobiliario', label: 'Inmobiliario', sub: 'Agencias, promotoras, gestión de patrimonio' },
  { value: 'servicios', label: 'Servicios profesionales', sub: 'Legal, salud, consultoría, contabilidad' },
  { value: 'retail', label: 'Comercio y retail', sub: 'Tiendas físicas, e-commerce, distribución' },
  { value: 'industria', label: 'Industria y logística', sub: 'Fabricación, almacén, transporte' },
];

const PAIN_OPTIONS: Record<Sector, string[]> = {
  inmobiliario: [
    'Captación y seguimiento de clientes',
    'Gestión documental lenta',
    'Poca visibilidad del pipeline',
    'Todo pasa por una sola persona',
  ],
  servicios: [
    'Demasiado trabajo administrativo',
    'Captación y seguimiento de clientes',
    'Procesos internos desorganizados',
    'Dependencia de personas clave',
  ],
  retail: [
    'Gestión de stock y pedidos manual',
    'Sin visibilidad del comportamiento de clientes',
    'Operaciones del día a día muy manuales',
    'Mala coordinación entre tienda y almacén',
  ],
  industria: [
    'Falta de trazabilidad en producción',
    'Mantenimiento reactivo',
    'Documentación de procesos inexistente',
    'Logística y rutas poco optimizadas',
  ],
};

const SIZE_OPTIONS: { value: Size; label: string }[] = [
  { value: '1-5', label: '1–5 personas' },
  { value: '5-30', label: '5–30 personas' },
  { value: '30+', label: 'Más de 30 personas' },
];

const TRIED_OPTIONS: { value: Tried; label: string }[] = [
  { value: 'no', label: 'No, es la primera vez' },
  { value: 'tools', label: 'Sí, probamos herramientas pero sin resultado' },
  { value: 'consultant', label: 'Sí, contratamos a alguien pero no funcionó' },
];

const URGENCY_OPTIONS: { value: Urgency; label: string }[] = [
  { value: 'now', label: 'Ahora mismo' },
  { value: 'quarter', label: 'Este trimestre' },
  { value: 'exploring', label: 'Estoy explorando opciones' },
];

const BUDGET_OPTIONS: { value: Budget; label: string }[] = [
  { value: 'yes', label: 'Sí, tengo presupuesto' },
  { value: 'justify', label: 'Necesito justificarlo internamente' },
  { value: 'no', label: 'Todavía no' },
];

const INITIAL_FORM: FormState = {
  sector: '',
  size: '',
  pain: '',
  tried: '',
  urgency: '',
  budget: '',
  name: '',
  email: '',
  company: '',
  notes: '',
};

// ── Small components ──────────────────────────────────────────────────────────

function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-7">
      <h1 className="text-xl font-bold text-[#F8FAFC] leading-snug">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-slate-400 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function OptionCard({
  selected,
  onClick,
  label,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-150 ${
        selected
          ? 'border-[#0EA5E9] bg-[#0EA5E9]/10'
          : 'border-[#334155] bg-[#1E293B] hover:border-slate-500'
      }`}
    >
      <span
        className={`block font-semibold text-sm leading-snug ${
          selected ? 'text-[#0EA5E9]' : 'text-[#F8FAFC]'
        }`}
      >
        {label}
      </span>
      {sub && (
        <span className="block text-xs text-slate-500 mt-0.5">{sub}</span>
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DiagnosticoPage() {
  const [step, setStep] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [submitError, setSubmitError] = useState('');

  function navigate(newStep: number, dir: 'forward' | 'backward') {
    setDirection(dir);
    setAnimKey((k) => k + 1);
    setStep(newStep);
  }

  function stepIsValid(): boolean {
    switch (step) {
      case 1: return form.sector !== '';
      case 2: return form.size !== '';
      case 3: return form.pain !== '';
      case 4: return form.tried !== '';
      case 5: return form.urgency !== '';
      case 6: return form.budget !== '';
      case 7:
        return (
          form.name.trim() !== '' &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
          form.company.trim() !== ''
        );
      default: return false;
    }
  }

  function handleCard<T extends string>(field: keyof FormState, value: T) {
    if (field === 'sector') {
      setForm((prev) => ({ ...prev, sector: value as Sector, pain: '' }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  }

  function handleInput(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stepIsValid() || submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector: form.sector,
          size: form.size,
          pain: form.pain,
          tried: form.tried,
          urgency: form.urgency,
          budget: form.budget,
          name: form.name,
          email: form.email,
          company: form.company,
          notes: form.notes,
        }),
      });
      const data: ApiResponse = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Error desconocido');
      setResult(data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al enviar el formulario');
      setSubmitting(false);
    }
  }

  // ── Result screen ──────────────────────────────────────────────────────────

  if (result) {
    const canBook = result.qualification === 'hot' || result.qualification === 'warm';
    return (
      <>
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .result-enter { animation: fadeUp 0.4s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        `}</style>
        <div className="min-h-screen bg-[#0F172A] flex flex-col">
          <nav className="px-6 h-16 flex items-center">
            <Link href="/" className="font-bold text-[#F8FAFC] text-lg tracking-tight">
              Doyes Digital
            </Link>
          </nav>
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="result-enter max-w-md w-full">
              <div className="w-8 h-0.5 bg-[#0EA5E9] rounded mb-6" />
              {canBook ? (
                <>
                  <h1 className="text-2xl font-bold text-[#F8FAFC] leading-snug mb-3">
                    Creemos que podemos ayudarte.
                  </h1>
                  <p className="text-slate-400 text-base leading-relaxed mb-8">
                    El siguiente paso es una llamada de 30 minutos para entender tu situación
                    en detalle. Sin compromiso.
                  </p>
                  {result.calendly_url && (
                    <a
                      href={result.calendly_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-[#0EA5E9] hover:bg-[#0284c7] text-white font-semibold py-4 px-6 rounded-xl transition-colors text-sm"
                    >
                      Reservar llamada →
                    </a>
                  )}
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-[#F8FAFC] leading-snug mb-3">
                    Gracias por tu consulta.
                  </h1>
                  <p className="text-slate-400 text-base leading-relaxed">
                    Hemos recibido tus datos. Nos pondremos en contacto contigo en menos de
                    24 horas.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Step screen ────────────────────────────────────────────────────────────

  const progress = Math.round((step / TOTAL_STEPS) * 100);
  const animClass = direction === 'forward' ? 'step-enter-fwd' : 'step-enter-bwd';

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <>
            <StepHeader
              title="¿En qué sector trabaja tu empresa?"
              subtitle="Cada sector tiene sus propios retos."
            />
            <div className="space-y-3">
              {SECTOR_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.sector === opt.value}
                  onClick={() => handleCard('sector', opt.value)}
                  label={opt.label}
                  sub={opt.sub}
                />
              ))}
            </div>
          </>
        );

      case 2:
        return (
          <>
            <StepHeader title="¿Cuántas personas trabajan en tu empresa?" />
            <div className="space-y-3">
              {SIZE_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.size === opt.value}
                  onClick={() => handleCard('size', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </>
        );

      case 3: {
        const opts = form.sector ? PAIN_OPTIONS[form.sector as Sector] : [];
        return (
          <>
            <StepHeader
              title="¿Cuál es el principal problema en tu empresa ahora?"
              subtitle="Elige el que más se parezca a tu situación."
            />
            <div className="space-y-3">
              {opts.map((opt) => (
                <OptionCard
                  key={opt}
                  selected={form.pain === opt}
                  onClick={() => handleCard('pain', opt)}
                  label={opt}
                />
              ))}
            </div>
          </>
        );
      }

      case 4:
        return (
          <>
            <StepHeader title="¿Habéis intentado resolver esto antes?" />
            <div className="space-y-3">
              {TRIED_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.tried === opt.value}
                  onClick={() => handleCard('tried', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </>
        );

      case 5:
        return (
          <>
            <StepHeader title="¿Con qué urgencia quieres resolverlo?" />
            <div className="space-y-3">
              {URGENCY_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.urgency === opt.value}
                  onClick={() => handleCard('urgency', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </>
        );

      case 6:
        return (
          <>
            <StepHeader
              title="¿Tienes presupuesto reservado para esto?"
              subtitle="El diagnóstico inicial tiene precio cerrado."
            />
            <div className="space-y-3">
              {BUDGET_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.budget === opt.value}
                  onClick={() => handleCard('budget', opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </>
        );

      case 7:
        return (
          <>
            <StepHeader
              title="¿Cómo te contactamos?"
              subtitle="Última pregunta. Te respondemos en menos de 24 horas."
            />
            <div className="space-y-4">
              {(
                [
                  { id: 'name', label: 'Nombre y apellido', placeholder: 'Tu nombre completo', type: 'text' },
                  { id: 'email', label: 'Email', placeholder: 'tu@empresa.com', type: 'email' },
                  { id: 'company', label: 'Empresa', placeholder: 'Nombre de tu empresa', type: 'text' },
                ] as const
              ).map(({ id, label, placeholder, type }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">
                    {label} <span className="text-[#0EA5E9]">*</span>
                  </label>
                  <input
                    id={id}
                    name={id}
                    type={type}
                    value={form[id]}
                    onChange={handleInput}
                    placeholder={placeholder}
                    required
                    className="w-full rounded-xl bg-[#1E293B] border border-[#334155] px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 transition"
                  />
                </div>
              ))}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Notas{' '}
                  <span className="text-slate-500 font-normal">(opcional)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleInput}
                  placeholder="Contexto adicional, preguntas concretas…"
                  rows={3}
                  className="w-full rounded-xl bg-[#1E293B] border border-[#334155] px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 transition resize-none"
                />
              </div>
              {submitError && (
                <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3">
                  {submitError}
                </p>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .step-enter-fwd { animation: slideInRight 0.28s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        .step-enter-bwd { animation: slideInLeft  0.28s cubic-bezier(0.25,0.46,0.45,0.94) both; }
      `}</style>

      <div className="min-h-screen bg-[#0F172A] flex flex-col">
        {/* Navbar */}
        <nav className="px-6 h-16 flex items-center border-b border-[#1E293B]">
          <Link href="/" className="font-bold text-[#F8FAFC] text-lg tracking-tight">
            Doyes Digital
          </Link>
        </nav>

        {/* Progress bar */}
        <div className="h-0.5 w-full bg-[#1E293B]">
          <div
            className="h-0.5 bg-[#0EA5E9] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step counter */}
        <div className="px-6 pt-5 pb-2">
          <span className="text-xs font-medium text-slate-500 tracking-wide">
            Paso {step} de {TOTAL_STEPS}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 flex justify-center px-6 pb-10 pt-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div key={animKey} className={animClass}>
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="mt-8 space-y-2">
              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={() => navigate(step + 1, 'forward')}
                  disabled={!stepIsValid()}
                  className="w-full bg-[#0EA5E9] hover:bg-[#0284c7] disabled:bg-[#1E293B] disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors text-sm"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!stepIsValid() || submitting}
                  className="w-full bg-[#0EA5E9] hover:bg-[#0284c7] disabled:bg-[#1E293B] disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors text-sm"
                >
                  {submitting ? 'Enviando…' : 'Ver mi resultado →'}
                </button>
              )}

              {step > 1 && (
                <button
                  type="button"
                  onClick={() => navigate(step - 1, 'backward')}
                  className="w-full py-2.5 text-sm text-[#64748B] hover:text-slate-400 transition-colors"
                >
                  Atrás
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
