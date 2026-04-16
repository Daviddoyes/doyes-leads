import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { calculateScore } from '@/lib/scoring';
import type { LeadFormData, ApiResponse } from '@/lib/types';

// ── Clients (instantiated per-request to work in Edge/serverless) ─────────────

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY missing');
  return new Resend(key);
}

// ── Validation ────────────────────────────────────────────────────────────────

const VALID_SECTORS = ['inmobiliario', 'servicios', 'retail', 'industria'] as const;
const VALID_SIZES = ['1-5', '6-15', '16-50'] as const;
const VALID_TRIED = ['no', 'tools', 'consultant'] as const;
const VALID_URGENCY = ['now', 'quarter', 'exploring'] as const;
const VALID_BUDGET = ['yes', 'justify', 'no'] as const;

function validate(data: unknown): LeadFormData {
  if (!data || typeof data !== 'object') throw new Error('Payload inválido');
  const d = data as Record<string, unknown>;

  function required(field: string): string {
    const val = d[field];
    if (typeof val !== 'string' || !val.trim()) {
      throw new Error(`El campo "${field}" es obligatorio`);
    }
    return val.trim();
  }

  function oneOf<T extends string>(field: string, values: readonly T[]): T {
    const val = required(field) as T;
    if (!(values as readonly string[]).includes(val)) {
      throw new Error(`Valor inválido para "${field}": ${val}`);
    }
    return val;
  }

  return {
    sector: oneOf('sector', VALID_SECTORS),
    size: oneOf('size', VALID_SIZES),
    pain: required('pain'),
    tried: oneOf('tried', VALID_TRIED),
    urgency: oneOf('urgency', VALID_URGENCY),
    budget: oneOf('budget', VALID_BUDGET),
    name: required('name'),
    email: (() => {
      const val = required('email');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        throw new Error('Email inválido');
      }
      return val;
    })(),
    company: required('company'),
    notes: typeof d['notes'] === 'string' ? d['notes'].trim() : '',
  };
}

// ── Email template ────────────────────────────────────────────────────────────

function buildEmailHtml(
  form: LeadFormData,
  score: number,
  qualification: string,
  calendlyUrl: string | undefined
): string {
  const tempEmoji = { hot: '🔥', warm: '☀️', cold: '❄️' }[qualification] ?? '';
  const tempLabel = { hot: 'HOT', warm: 'WARM', cold: 'COLD' }[qualification] ?? qualification.toUpperCase();

  const sizeLabel = { '1-5': '1–5 personas', '6-15': '6–15 personas', '16-50': '16–50 personas' }[form.size];
  const urgencyLabel = { now: 'Necesita solución ya', quarter: 'Este trimestre', exploring: 'Solo explorando' }[form.urgency];
  const budgetLabel = { yes: 'Sí, tiene partida', justify: 'Podría justificarse', no: 'No por ahora' }[form.budget];
  const triedLabel = { no: 'Todavía no', tools: 'Herramientas', consultant: 'Consultor/agencia' }[form.tried];

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="font-family:system-ui,sans-serif;background:#f8fafc;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#1e293b;padding:24px 32px;">
      <h1 style="margin:0;color:#fff;font-size:18px;">
        ${tempEmoji} Nuevo lead <span style="color:#94a3b8;">${tempLabel}</span> — Score ${score}
      </h1>
    </div>
    <div style="padding:24px 32px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#64748b;width:40%;">Nombre</td><td style="padding:8px 0;font-weight:600;">${form.name}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="padding:8px 0;"><a href="mailto:${form.email}" style="color:#4f6ef7;">${form.email}</a></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Empresa</td><td style="padding:8px 0;">${form.company}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Sector</td><td style="padding:8px 0;">${form.sector}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Tamaño</td><td style="padding:8px 0;">${sizeLabel}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Urgencia</td><td style="padding:8px 0;">${urgencyLabel}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Presupuesto</td><td style="padding:8px 0;">${budgetLabel}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Ha probado</td><td style="padding:8px 0;">${triedLabel}</td></tr>
      </table>
      <div style="margin-top:16px;padding:16px;background:#f1f5f9;border-radius:8px;">
        <p style="margin:0 0 6px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">Reto principal</p>
        <p style="margin:0;font-size:14px;">${form.pain}</p>
      </div>
      ${form.notes ? `<div style="margin-top:12px;padding:16px;background:#f1f5f9;border-radius:8px;"><p style="margin:0 0 6px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">Notas adicionales</p><p style="margin:0;font-size:14px;">${form.notes}</p></div>` : ''}
      ${
        calendlyUrl
          ? `<div style="margin-top:24px;text-align:center;"><a href="${calendlyUrl}" style="display:inline-block;background:#4f6ef7;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Agendar llamada →</a></div>`
          : ''
      }
    </div>
  </div>
</body>
</html>`;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body: unknown = await req.json();
    console.log('[leads] body recibido:', JSON.stringify(body, null, 2));
    const form = validate(body);
    const { score, qualification } = calculateScore(form);

    const calendlyUrl =
      (qualification === 'hot' || qualification === 'warm') && process.env.CALENDLY_URL
        ? process.env.CALENDLY_URL
        : undefined;

    // 1. Save to Supabase
    const supabase = getSupabase();
    const { error: dbError } = await supabase.from('leads').insert({
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
      score,
      qualification,
    });

    if (dbError) {
      console.error('[leads] Supabase error:', dbError);
      throw new Error('Error al guardar el lead');
    }

    // 2. Send alert email
    const alertEmail = process.env.ALERT_EMAIL;
    if (alertEmail) {
      const resend = getResend();
      const tempEmoji = { hot: '🔥', warm: '☀️', cold: '❄️' }[qualification] ?? '';
      const { error: emailError } = await resend.emails.send({
        from: 'Doyes Leads <onboarding@resend.dev>',
        to: [alertEmail],
        subject: `${tempEmoji} Nuevo lead ${qualification} — ${form.name} (${form.company}) · ${score} pts`,
        html: buildEmailHtml(form, score, qualification, calendlyUrl),
      });

      if (emailError) {
        // Non-fatal: log but don't fail the request
        console.error('[leads] Resend error:', emailError);
      }
    }

    return NextResponse.json({ success: true, qualification, score, calendly_url: calendlyUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno';
    console.error('[leads] POST error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
