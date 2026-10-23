-- =====================================================================
-- FITNESS APP · Registro de fuerza
-- Catálogo de ejercicios por usuario y un registro por ejercicio y día
-- (igual que la hoja Fuerza: peso + series en reps o segundos).
-- Marca, volumen y sugerencia de carga se calculan en la app.
-- =====================================================================

create table if not exists public.exercises (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null,
  muscle     text,                                   -- Pierna, Espalda, Bíceps…
  body       text not null default 'superior' check (body in ('superior','inferior','core')),
  measure    text not null default 'reps' check (measure in ('reps','segundos')),
  days       int[] not null default '{}',            -- días habituales, ISO 1 = lunes
  archived   boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.strength_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day         date not null,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  weight_kg   numeric not null default 0 check (weight_kg >= 0),
  sets        numeric[] not null check (cardinality(sets) between 1 and 10),
  rpe         numeric check (rpe between 1 and 10),
  notes       text,
  created_at  timestamptz not null default now()
);
create index if not exists strength_user_day on public.strength_entries (user_id, day);
create index if not exists strength_user_ex  on public.strength_entries (user_id, exercise_id, day desc);

alter table public.exercises        enable row level security;
alter table public.strength_entries enable row level security;
revoke all on public.exercises, public.strength_entries from anon;
grant select, insert, update, delete on public.exercises, public.strength_entries to authenticated;

drop policy if exists exercises_own on public.exercises;
create policy exercises_own on public.exercises for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists strength_own on public.strength_entries;
create policy strength_own on public.strength_entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))
;

-- El ejercicio de un registro debe ser del mismo usuario
create or replace function public.check_strength_owner() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from public.exercises e where e.id = new.exercise_id and e.user_id = new.user_id) then
    raise exception 'El ejercicio no pertenece al usuario';
  end if;
  return new;
end $$;
drop trigger if exists strength_owner on public.strength_entries;
create trigger strength_owner before insert or update on public.strength_entries
  for each row execute function public.check_strength_owner();
