-- =====================================================================
-- FITNESS APP · Progreso: peso, InBody, días históricos y Post-entreno
-- Ejecutar en Supabase → SQL Editor después de 0004.
-- =====================================================================

-- Post-entreno como tiempo de comida propio
alter table public.meal_entries drop constraint if exists meal_entries_meal_check;
alter table public.meal_entries add constraint meal_entries_meal_check
  check (meal in ('desayuno','almuerzo','cena','snack','postentreno'));

-- Peso corporal (idealmente una vez por semana, en ayunas)
create table if not exists public.body_weights (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day        date not null,
  weight_kg  numeric not null check (weight_kg > 0 and weight_kg < 400),
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- Mediciones InBody: los indicadores van en un jsonb (clave → valor) para
-- poder sumar indicadores sin migraciones. Las claves están en src/lib/inbody.js.
create table if not exists public.inbody_scans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day        date not null,
  metrics    jsonb not null,
  notes      text,
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

-- Días registrados antes de la app (totales que venían de FITIA y del Apple Watch)
create table if not exists public.legacy_days (
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day         date not null,
  kcal        numeric,
  protein     numeric,
  carbs       numeric,
  fat         numeric,
  portions    jsonb,
  active_kcal numeric,
  sleep_h     numeric,
  energy      numeric,
  primary key (user_id, day)
);

alter table public.body_weights enable row level security;
alter table public.inbody_scans enable row level security;
alter table public.legacy_days  enable row level security;
revoke all on public.body_weights, public.inbody_scans, public.legacy_days from anon;
grant select, insert, update, delete on public.body_weights, public.inbody_scans, public.legacy_days to authenticated;

drop policy if exists weights_own on public.body_weights;
create policy weights_own on public.body_weights for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists inbody_own on public.inbody_scans;
create policy inbody_own on public.inbody_scans for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists legacy_own on public.legacy_days;
create policy legacy_own on public.legacy_days for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
