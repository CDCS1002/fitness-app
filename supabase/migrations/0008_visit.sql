-- =====================================================================
-- FITNESS APP · Datos de la cita: próxima fecha y notas para la nutricionista
-- =====================================================================
alter table public.plans
  add column if not exists next_visit  date,
  add column if not exists visit_notes text;
