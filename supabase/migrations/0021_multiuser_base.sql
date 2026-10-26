-- Base para varios usuarios: los datos personales salen del código y los catálogos son comunes.
-- Copia tus datos tal cual están hoy (rutina, días de cada ejercicio, reglas de progresión).
-- No borra columnas viejas (exercises.days / archived): quedan como respaldo hasta confirmar.
-- Seguro de correr más de una vez.

-- ---------------------------------------------------------------------
-- Administrador
-- ---------------------------------------------------------------------
create table if not exists public.app_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.app_admins enable row level security;
revoke all on public.app_admins from anon;
grant select on public.app_admins to authenticated;
drop policy if exists admins_self on public.app_admins;
create policy admins_self on public.app_admins for select to authenticated using (user_id = (select auth.uid()));

-- Hoy hay un solo usuario: es el administrador
insert into public.app_admins (user_id)
select id from auth.users where (select count(*) from auth.users) = 1
on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.app_admins where user_id = (select auth.uid()))
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------
-- Alimentos: un solo catálogo común. Todos ven todo.
-- Agrega y corrige el administrador; los demás solo pueden agregar productos escaneados
-- de Open Food Facts con todos sus datos nutricionales.
-- ---------------------------------------------------------------------
drop policy if exists foods_insert on public.foods;
drop policy if exists foods_update on public.foods;
drop policy if exists foods_delete on public.foods;
create policy foods_insert on public.foods for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and ((select public.is_admin())
         or (source = 'openfoodfacts' and kcal is not null and protein is not null and carbs is not null and fat is not null))
  );
create policy foods_update on public.foods for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy foods_delete on public.foods for delete to authenticated
  using ((select public.is_admin()));

drop policy if exists measures_write  on public.food_measures;
drop policy if exists measures_insert on public.food_measures;
drop policy if exists measures_update on public.food_measures;
drop policy if exists measures_delete on public.food_measures;
create policy measures_insert on public.food_measures for insert to authenticated
  with check (
    (select public.is_admin())
    or exists (select 1 from public.foods f where f.id = food_id
               and f.created_by = (select auth.uid()) and f.source = 'openfoodfacts')
  );
create policy measures_update on public.food_measures for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy measures_delete on public.food_measures for delete to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- Ejercicios: catálogo común. Cualquiera agrega; el administrador corrige.
-- Lo personal (en qué días/rutinas lo haces, si lo archivaste) pasa a exercise_prefs.
-- ---------------------------------------------------------------------
alter table public.exercises add column if not exists created_by uuid references auth.users(id) on delete set null;
update public.exercises set created_by = user_id where created_by is null;
alter table public.exercises alter column user_id drop not null;

create table if not exists public.exercise_prefs (
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  days        int[] not null default '{}',
  archived    boolean not null default false,
  primary key (user_id, exercise_id)
);
insert into public.exercise_prefs (user_id, exercise_id, days, archived)
select user_id, id, days, archived from public.exercises where user_id is not null
on conflict do nothing;

alter table public.exercise_prefs enable row level security;
revoke all on public.exercise_prefs from anon;
grant select, insert, update, delete on public.exercise_prefs to authenticated;
drop policy if exists exercise_prefs_own on public.exercise_prefs;
create policy exercise_prefs_own on public.exercise_prefs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists exercises_own    on public.exercises;
drop policy if exists exercises_read   on public.exercises;
drop policy if exists exercises_insert on public.exercises;
drop policy if exists exercises_update on public.exercises;
drop policy if exists exercises_delete on public.exercises;
create policy exercises_read   on public.exercises for select to authenticated using (true);
create policy exercises_insert on public.exercises for insert to authenticated
  with check (created_by = (select auth.uid()));
create policy exercises_update on public.exercises for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy exercises_delete on public.exercises for delete to authenticated
  using ((select public.is_admin()));

-- Nombre único en todo el catálogo (sin distinguir mayúsculas ni tildes)
alter table public.exercises drop constraint if exists exercises_user_id_name_key;
create unique index if not exists exercises_name_uniq on public.exercises (public.norm(name));

-- Un registro de fuerza puede usar cualquier ejercicio del catálogo
create or replace function public.check_strength_owner() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from public.exercises e where e.id = new.exercise_id) then
    raise exception 'El ejercicio no existe';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------
-- Rutina semanal por usuario (antes estaba en el código)
-- weekday ISO: 1 = lunes … 7 = domingo. Los ejercicios de cada rutina son los que
-- tienen ese día en exercise_prefs.days.
-- ---------------------------------------------------------------------
create table if not exists public.routines (
  user_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  weekday   int  not null check (weekday between 1 and 7),
  name      text not null,          -- corto, para botones: "Pecho · Tríceps · Hombro"
  full_name text not null,          -- completo: "Pecho, tríceps y hombro + abdomen"
  is_rest   boolean not null default false,
  primary key (user_id, weekday)
);
alter table public.routines enable row level security;
revoke all on public.routines from anon;
grant select, insert, update, delete on public.routines to authenticated;
drop policy if exists routines_own on public.routines;
create policy routines_own on public.routines for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

insert into public.routines (user_id, weekday, name, full_name, is_rest)
select u.id, r.weekday, r.name, r.full_name, r.is_rest
from (select id from auth.users where (select count(*) from auth.users) = 1) u
cross join (values
  (1, 'Full body',                 'Full body + abdomen',                false),
  (2, 'Espalda · Bíceps · Hombro', 'Espalda, bíceps y hombro + abdomen', false),
  (3, 'Pierna',                    'Pierna + abdomen',                   false),
  (4, 'Pecho · Tríceps · Hombro',  'Pecho, tríceps y hombro + abdomen',  false),
  (5, 'Cardio',                    'Cardio + abdomen',                   false),
  (6, 'Descanso',                  'Descanso',                           true),
  (7, 'Descanso',                  'Descanso',                           true)
) as r(weekday, name, full_name, is_rest)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Reglas de progresión por usuario (antes en el código)
-- ---------------------------------------------------------------------
create table if not exists public.strength_settings (
  user_id         uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  reps_min        int     not null default 6  check (reps_min > 0),
  reps_max        int     not null default 10 check (reps_max >= reps_min),
  secs_min        int     not null default 30 check (secs_min > 0),
  secs_max        int     not null default 90 check (secs_max >= secs_min),
  step_inferior   numeric not null default 5   check (step_inferior > 0),
  step_superior   numeric not null default 2.5 check (step_superior > 0),
  step_core       numeric not null default 2.5 check (step_core > 0),
  step_isometrico numeric not null default 2.5 check (step_isometrico > 0),
  updated_at      timestamptz not null default now()
);
alter table public.strength_settings enable row level security;
revoke all on public.strength_settings from anon;
grant select, insert, update, delete on public.strength_settings to authenticated;
drop policy if exists strength_settings_own on public.strength_settings;
create policy strength_settings_own on public.strength_settings for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop trigger if exists strength_settings_touch on public.strength_settings;
create trigger strength_settings_touch before update on public.strength_settings
  for each row execute function public.touch_updated_at();

insert into public.strength_settings (user_id)
select id from auth.users where (select count(*) from auth.users) = 1
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Valores por porción de la lista de la nutricionista (antes en el código):
-- se usan para estimar kcal y macros de un plan a partir de sus porciones.
-- ---------------------------------------------------------------------
alter table public.exchange_groups add column if not exists portion_kcal    numeric;
alter table public.exchange_groups add column if not exists portion_protein numeric;
alter table public.exchange_groups add column if not exists portion_carbs   numeric;
alter table public.exchange_groups add column if not exists portion_fat     numeric;
update public.exchange_groups g set portion_kcal = v.kcal, portion_protein = v.p, portion_carbs = v.c, portion_fat = v.f
from (values
  ('proteina',      45, 7, 0,  2),
  ('carbohidrato',  80, 3, 15, 1),
  ('grasa',         45, 0, 0,  5),
  ('lacteo',       100, 8, 12, 1.5),
  ('vegetal',       25, 2, 5,  0),
  ('fruta',         60, 0, 15, 0)
) as v(code, kcal, p, c, f)
where g.code = v.code and g.portion_kcal is null;
