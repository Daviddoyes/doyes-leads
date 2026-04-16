-- ============================================================
-- doyes-leads: schema Supabase
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Tipos ENUM
CREATE TYPE lead_sector  AS ENUM ('inmobiliario', 'servicios', 'retail', 'industria');
CREATE TYPE lead_size    AS ENUM ('1-5', '6-15', '16-50');
CREATE TYPE lead_tried   AS ENUM ('no', 'tools', 'consultant');
CREATE TYPE lead_urgency AS ENUM ('now', 'quarter', 'exploring');
CREATE TYPE lead_budget  AS ENUM ('yes', 'justify', 'no');
CREATE TYPE lead_temp    AS ENUM ('caliente', 'tibio', 'frio');

-- Tabla principal
CREATE TABLE IF NOT EXISTS leads (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ  NOT NULL    DEFAULT now(),

  -- Scoring
  score       SMALLINT     NOT NULL,
  temp        lead_temp    NOT NULL,

  -- Datos cualificación
  sector      lead_sector  NOT NULL,
  size        lead_size    NOT NULL,
  tried       lead_tried   NOT NULL,
  urgency     lead_urgency NOT NULL,
  budget      lead_budget  NOT NULL,

  -- Texto libre
  pain        TEXT         NOT NULL,
  notes       TEXT         NOT NULL DEFAULT '',

  -- Contacto
  name        TEXT         NOT NULL,
  email       TEXT         NOT NULL,
  company     TEXT         NOT NULL
);

-- Índices útiles para filtrar en el dashboard de Supabase
CREATE INDEX idx_leads_temp       ON leads (temp);
CREATE INDEX idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX idx_leads_email      ON leads (email);

-- Row Level Security: solo el service role puede leer/escribir
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Política: la anon key (usada desde Next.js) solo puede insertar
CREATE POLICY "anon can insert leads"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política: el service role puede hacer todo (para dashboards internos)
CREATE POLICY "service role full access"
  ON leads FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Vista rápida para análisis
CREATE OR REPLACE VIEW leads_summary AS
SELECT
  temp,
  COUNT(*)                          AS total,
  ROUND(AVG(score), 1)              AS avg_score,
  COUNT(*) FILTER (WHERE urgency = 'now')   AS urgent,
  COUNT(*) FILTER (WHERE budget = 'yes')    AS has_budget,
  DATE_TRUNC('day', created_at)     AS day
FROM leads
GROUP BY temp, DATE_TRUNC('day', created_at)
ORDER BY day DESC, temp;
