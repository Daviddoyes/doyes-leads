'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import type { LeadFormData, Sector, ApiResponse } from '@/lib/types';
import { PAIN_PLACEHOLDERS } from '@/lib/scoring';

const INITIAL_FORM: LeadFormData = {
  sector: 'servicios',
  size: '6-15',
  pain: '',
  tried: 'no',
  urgency: 'quarter',
  budget: 'justify',
  name: '',
  email: '',
  company: '',
  notes: '',
};

type Status = 'idle' | 'loading' | 'success' | 'error';

const TEMP_CONFIG = {
  hot: {
    emoji: '🔥',
    label: 'Lead caliente',
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800',
    message:
      'Perfil muy alineado. Agendamos una llamada estratégica de 30 min sin coste.',
  },
  warm: {
    emoji: '☀️',
    label: 'Lead tibio',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
    message:
      'Buena alineación. Te enviamos un diagnóstico personalizado y valoramos si tiene sentido hablar.',
  },
  cold: {
    emoji: '❄️',
    label: 'Lead frío',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    message:
      'Recibimos tu solicitud. Te mantenemos informado con recursos útiles para tu etapa actual.',
  },
} as const;

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-slate-700 mb-1"
    >
      {children}
    </label>
  );
}

function selectClass() {
  return 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition';
}

function inputClass() {
  return 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition';
}

export default function HomePage() {
  const [form, setForm] = useState<LeadFormData>(INITIAL_FORM);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<ApiResponse | null>(null);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setResult(null);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data: ApiResponse = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error ?? 'Error desconocido');

      setResult(data);
      setStatus('success');
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Error al enviar el formulario',
      });
      setStatus('error');
    }
  }

  const painPlaceholder =
    PAIN_PLACEHOLDERS[form.sector] ?? 'Describe tu principal reto…';

  if (status === 'success' && result?.qualification) {
    const cfg = TEMP_CONFIG[result.qualification];
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-brand-50">
        <div
          className={`max-w-lg w-full rounded-2xl border-2 p-8 shadow-lg ${cfg.bg}`}
        >
          <div className="text-center">
            <span className="text-5xl">{cfg.emoji}</span>
            <h1 className={`mt-4 text-2xl font-bold ${cfg.text}`}>
              {cfg.label}
            </h1>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${cfg.badge}`}
            >
              Score: {result.score} pts
            </span>
            <p className="mt-4 text-slate-700">{cfg.message}</p>

            {result.calendly_url && (
              <a
                href={result.calendly_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-brand-700 transition"
              >
                Agendar llamada →
              </a>
            )}

            <button
              onClick={() => {
                setForm(INITIAL_FORM);
                setStatus('idle');
                setResult(null);
              }}
              className="mt-4 block w-full text-center text-sm text-slate-500 hover:text-slate-700 transition"
            >
              Enviar otra solicitud
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Diagnóstico gratuito
          </h1>
          <p className="mt-2 text-slate-500">
            Cuéntanos tu situación y te decimos cómo podemos ayudarte a crecer.
            Son menos de 2 minutos.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100"
        >
          {/* Section 1: Empresa */}
          <div className="p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Tu empresa
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="sector">Sector</FieldLabel>
                <select
                  id="sector"
                  name="sector"
                  value={form.sector}
                  onChange={handleChange}
                  className={selectClass()}
                  required
                >
                  <option value="inmobiliario">Inmobiliario</option>
                  <option value="servicios">Servicios B2B</option>
                  <option value="retail">Retail / eCommerce</option>
                  <option value="industria">Industria</option>
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="size">Tamaño del equipo</FieldLabel>
                <select
                  id="size"
                  name="size"
                  value={form.size}
                  onChange={handleChange}
                  className={selectClass()}
                  required
                >
                  <option value="1-5">1–5 personas</option>
                  <option value="6-15">6–15 personas</option>
                  <option value="16-50">16–50 personas</option>
                </select>
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="pain">
                ¿Cuál es tu mayor reto comercial ahora mismo?
              </FieldLabel>
              <textarea
                id="pain"
                name="pain"
                value={form.pain}
                onChange={handleChange}
                placeholder={painPlaceholder}
                rows={3}
                className={inputClass()}
                required
              />
            </div>
          </div>

          {/* Section 2: Contexto */}
          <div className="p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Contexto
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <FieldLabel htmlFor="tried">¿Has probado algo?</FieldLabel>
                <select
                  id="tried"
                  name="tried"
                  value={form.tried}
                  onChange={handleChange}
                  className={selectClass()}
                  required
                >
                  <option value="no">No, todavía no</option>
                  <option value="tools">Sí, herramientas</option>
                  <option value="consultant">Sí, consultor/agencia</option>
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="urgency">Urgencia</FieldLabel>
                <select
                  id="urgency"
                  name="urgency"
                  value={form.urgency}
                  onChange={handleChange}
                  className={selectClass()}
                  required
                >
                  <option value="now">Necesito solución ya</option>
                  <option value="quarter">Este trimestre</option>
                  <option value="exploring">Solo explorando</option>
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="budget">Presupuesto disponible</FieldLabel>
                <select
                  id="budget"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  className={selectClass()}
                  required
                >
                  <option value="yes">Sí, tenemos partida</option>
                  <option value="justify">Podría justificarse</option>
                  <option value="no">No por ahora</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Contacto */}
          <div className="p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Tus datos
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className={inputClass()}
                  required
                />
              </div>

              <div>
                <FieldLabel htmlFor="email">Email profesional</FieldLabel>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@empresa.com"
                  className={inputClass()}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <FieldLabel htmlFor="company">Empresa</FieldLabel>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Nombre de tu empresa"
                  className={inputClass()}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <FieldLabel htmlFor="notes">
                  Algo más que quieras añadir{' '}
                  <span className="text-slate-400 font-normal">(opcional)</span>
                </FieldLabel>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Contexto adicional, preguntas concretas…"
                  rows={2}
                  className={inputClass()}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6">
            {status === 'error' && result?.error && (
              <p className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {result.error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {status === 'loading' ? 'Enviando…' : 'Obtener mi diagnóstico gratuito →'}
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Sin spam. Tus datos solo se usan para preparar tu diagnóstico.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
