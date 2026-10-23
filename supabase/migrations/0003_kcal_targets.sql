-- =====================================================================
-- FITNESS APP · Metas de kcal y macros del día
-- Si quedan vacías, la app las estima a partir de las porciones del plan.
-- =====================================================================
alter table public.plans
  add column if not exists kcal_tolerance_pct numeric default 10,
  add column if not exists protein_target     numeric,
  add column if not exists carbs_target       numeric,
  add column if not exists fat_target         numeric;
-- kcal_target ya existe desde 0001_schema.sql
