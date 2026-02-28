-- ============================================================
-- Fase 3 – Tabelas: Agenda (schedules) + Financeiro (financial_entries)
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- ── Tabela: schedules ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS schedules (
  id             UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID             NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  scheduled_date DATE             NOT NULL,
  scheduled_time TIME             NOT NULL,
  description    TEXT,
  status         TEXT             NOT NULL DEFAULT 'Agendado'
                                  CHECK (status IN ('Agendado', 'Concluído', 'Cancelado')),
  created_at     TIMESTAMPTZ      NOT NULL DEFAULT now()
);

-- Índices para buscas frequentes por data e aluno
CREATE INDEX IF NOT EXISTS idx_schedules_date       ON schedules (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_schedules_student_id ON schedules (student_id);

-- Row Level Security (via service_role, sem RLS por enquanto)
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Política: service_role tem acesso total
CREATE POLICY "Service role full access on schedules"
  ON schedules
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── Tabela: financial_entries ─────────────────────────────

CREATE TABLE IF NOT EXISTS financial_entries (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT         NOT NULL CHECK (type IN ('receita', 'despesa')),
  description TEXT         NOT NULL,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  due_date    DATE         NOT NULL,
  status      TEXT         NOT NULL DEFAULT 'Pendente'
                           CHECK (status IN ('Pendente', 'Pago', 'Cancelado')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Índices para buscas por tipo e vencimento
CREATE INDEX IF NOT EXISTS idx_financial_type     ON financial_entries (type);
CREATE INDEX IF NOT EXISTS idx_financial_due_date ON financial_entries (due_date);

ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on financial_entries"
  ON financial_entries
  FOR ALL
  USING (true)
  WITH CHECK (true);
