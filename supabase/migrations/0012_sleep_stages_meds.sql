-- =====================================================================
-- FITNESS APP · Fases del sueño y medicamentos / suplementos
-- =====================================================================

-- Fases del sueño en minutos (como las da Apple Salud). El total dormido es
-- REM + ligero (principal) + profundo; "despierto" se registra aparte.
alter table public.daily_logs
  add column if not exists sleep_awake_min int check (sleep_awake_min between 0 and 1440),
  add column if not exists sleep_rem_min   int check (sleep_rem_min   between 0 and 1440),
  add column if not exists sleep_core_min  int check (sleep_core_min  between 0 and 1440),
  add column if not exists sleep_deep_min  int check (sleep_deep_min  between 0 and 1440);

-- Catálogo personal de medicamentos y suplementos (la proteína en polvo sigue siendo alimento)
create table if not exists public.meds (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name         text not null,
  brand        text,
  kind         text not null default 'suplemento'
               check (kind in ('suplemento','medicamento','anticonceptivo','otro')),
  form         text check (form in ('cápsula','tableta','polvo','líquido','gotas','inyección','parche','otro')),
  dose_amount  numeric check (dose_amount > 0),        -- cantidad por toma (2 cápsulas, 5 g…)
  dose_unit    text,                                   -- cápsula, tableta, g, mg, ml, scoop…
  ingredients  jsonb not null default '[]'::jsonb,     -- [{name, amount, unit}] por toma
  barcode      text,
  times        text[] not null default '{}',           -- horas sugeridas ('08:00')
  days         int[]  not null default '{1,2,3,4,5,6,7}', -- días en que se toma (ISO)
  active       boolean not null default true,
  notes        text,
  source       text not null default 'manual' check (source in ('manual','dsld','openfoodfacts')),
  created_at   timestamptz not null default now()
);
create unique index if not exists meds_user_barcode on public.meds (user_id, barcode) where barcode is not null;

-- Tomas registradas
create table if not exists public.med_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day        date not null,
  med_id     uuid not null references public.meds(id) on delete cascade,
  taken_at   time,
  amount     numeric check (amount > 0),
  unit       text,
  notes      text,
  created_at timestamptz not null default now()
);
create index if not exists med_logs_user_day on public.med_logs (user_id, day);

alter table public.meds     enable row level security;
alter table public.med_logs enable row level security;
revoke all on public.meds, public.med_logs from anon;
grant select, insert, update, delete on public.meds, public.med_logs to authenticated;

drop policy if exists meds_own on public.meds;
create policy meds_own on public.meds for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists med_logs_own on public.med_logs;
create policy med_logs_own on public.med_logs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Una toma solo puede referirse a un medicamento del mismo usuario
create or replace function public.check_med_owner() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from public.meds m where m.id = new.med_id and m.user_id = new.user_id) then
    raise exception 'El medicamento no pertenece al usuario';
  end if;
  return new;
end $$;
drop trigger if exists med_logs_owner on public.med_logs;
create trigger med_logs_owner before insert or update on public.med_logs
  for each row execute function public.check_med_owner();
