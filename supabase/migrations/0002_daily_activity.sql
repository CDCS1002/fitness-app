-- =====================================================================
-- FITNESS APP · Agua, pasos y actividad (fase 1b)
-- Ejecutar en Supabase → SQL Editor después de 0001_schema.sql.
-- =====================================================================

-- Metas de agua y pasos en el plan.
-- Agua: 35 ml/kg (81,2 kg) + extra en días de entreno → 3,55 L entreno / 2,8 L descanso.
alter table public.plans
  add column if not exists water_train_ml numeric default 3550,
  add column if not exists water_rest_ml  numeric default 2800,
  add column if not exists steps_target   int     default 10000,
  add column if not exists training_days  int[]   default '{1,2,3,4,5}'; -- ISO: 1 = lunes … 7 = domingo

update public.plans
   set water_train_ml = coalesce(water_train_ml, 3550),
       water_rest_ml  = coalesce(water_rest_ml, 2800),
       steps_target   = coalesce(steps_target, 10000),
       training_days  = coalesce(training_days, '{1,2,3,4,5}');

-- Un registro por día: agua y pasos
create table if not exists public.daily_logs (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day        date not null,
  water_ml   numeric not null default 0 check (water_ml >= 0),
  steps      int check (steps >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- Sesiones de actividad (lo que registra el Apple Watch)
create table if not exists public.activities (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day          date not null,
  kind         text not null,          -- fuerza, cardio, natacion, caminata, otro
  title        text,                   -- "Pierna", "Caminadora", "Perros"…
  duration_min numeric check (duration_min >= 0),
  active_kcal  numeric check (active_kcal >= 0),
  notes        text,
  created_at   timestamptz not null default now()
);
create index if not exists activities_user_day on public.activities (user_id, day);

drop trigger if exists daily_logs_touch on public.daily_logs;
create or replace function public.touch_daily_log() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
create trigger daily_logs_touch before update on public.daily_logs
  for each row execute function public.touch_daily_log();

alter table public.daily_logs enable row level security;
alter table public.activities enable row level security;
revoke all on public.daily_logs, public.activities from anon;
grant select, insert, update, delete on public.daily_logs, public.activities to authenticated;

drop policy if exists daily_logs_own on public.daily_logs;
create policy daily_logs_own on public.daily_logs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists activities_own on public.activities;
create policy activities_own on public.activities for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Suma atómica de agua (evita perder vasos si tocas + rápido o desde dos dispositivos)
create or replace function public.add_water(p_day date, p_delta_ml numeric)
returns numeric
language sql
security invoker
set search_path = public
as $$
  insert into public.daily_logs (user_id, day, water_ml)
  values (auth.uid(), p_day, greatest(0, p_delta_ml))
  on conflict (user_id, day)
  do update set water_ml = greatest(0, public.daily_logs.water_ml + p_delta_ml)
  returning water_ml;
$$;
revoke execute on function public.add_water(date, numeric) from public, anon;
grant  execute on function public.add_water(date, numeric) to authenticated;
