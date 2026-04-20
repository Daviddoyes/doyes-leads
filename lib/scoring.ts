import type { LeadFormData, ScoreResult, Qualification } from './types';

export function calculateScore(data: LeadFormData): ScoreResult {
  let score = 0;

  // Company size
  if (data.size === '30+') score += 3;
  else if (data.size === '5-30') score += 2;
  else if (data.size === '1-5') score += 1;

  // Urgency
  if (data.urgency === 'now') score += 4;
  else if (data.urgency === 'quarter') score += 2;

  // Budget (also contributes to total score used for classification)
  if (data.budget === 'yes') score += 5;
  else if (data.budget === 'justify') score += 2;

  // Prior experience with solutions
  if (data.tried === 'tools' || data.tried === 'consultant') score += 1;

  // Classification rules
  let qualification: Qualification;
  if (data.budget === 'yes' && score >= 9) {
    qualification = 'hot';
  } else if (data.budget === 'yes' && score >= 6) {
    qualification = 'warm';
  } else {
    qualification = 'cold';
  }

  return { score, qualification };
}

export const PAIN_PLACEHOLDERS: Record<string, string> = {
  inmobiliario:
    'Ej: no captamos suficientes leads cualificados, el tiempo de cierre es muy largo…',
  servicios:
    'Ej: perdemos oportunidades por falta de seguimiento, no medimos el ROI de marketing…',
  retail:
    'Ej: el tráfico en tienda baja, nuestro ecommerce no convierte, los márgenes se reducen…',
  industria:
    'Ej: necesitamos digitalizar procesos, los distribuidores no reportan pipeline…',
};
