-- =====================================================================
-- FITNESS APP · Estructura completa de la base de datos
--
-- Para una base nueva: ejecutar este archivo completo en Supabase → SQL Editor.
-- Consolida las migraciones anteriores (0001–0021). Las bases que ya las corrieron
-- no necesitan correrlo; los cambios futuros van en migraciones desde 0003.
--
-- Qué vive aquí: solo estructura, reglas de acceso y catálogos de referencia
-- (grupos de porciones). Los alimentos llegan solos desde el catálogo de la app
-- (supabase/catalog/foods.json). Los datos de cada usuario los crea la app.
-- =====================================================================

create extension if not exists pg_trgm  with schema extensions;
create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------------------
-- Funciones de apoyo
-- ---------------------------------------------------------------------
-- Texto normalizado para búsqueda (minúsculas, sin tildes). unaccent() no es
-- IMMUTABLE; este envoltorio sí, para poder indexar.
create or replace function public.norm(t text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(t, '')))
$$;

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

create or replace function public.touch_daily_log() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

-- ---------------------------------------------------------------------
-- Administrador: corrige los catálogos comunes (alimentos y ejercicios)
-- ---------------------------------------------------------------------
create table if not exists public.app_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.app_admins where user_id = (select auth.uid()))
$$;

-- ---------------------------------------------------------------------
-- Grupos de porciones (lista de intercambio de la nutricionista)
--   basis_macro / basis_grams : macro que define 1 porción del grupo
--   *_ref                     : macros que "consume" 1 porción
--   fat_cap                   : grasa que la porción ya incluye (no suma grasa)
--   portion_*                 : kcal y macros de 1 porción, para estimar metas del plan
-- ---------------------------------------------------------------------
create table if not exists public.exchange_groups (
  code            text primary key,
  name            text not null,
  sort            int  not null,
  basis_macro     text not null check (basis_macro in ('protein','carbs','fat')),
  basis_grams     numeric not null check (basis_grams > 0),
  protein_ref     numeric not null default 0,
  carbs_ref       numeric not null default 0,
  fat_ref         numeric not null default 0,
  color           text,
  fat_cap         numeric not null default 0,
  portion_kcal    numeric,
  portion_protein numeric,
  portion_carbs   numeric,
  portion_fat     numeric
);

insert into public.exchange_groups
  (code, name, sort, basis_macro, basis_grams, protein_ref, carbs_ref, fat_ref, fat_cap, color,
   portion_kcal, portion_protein, portion_carbs, portion_fat) values
  ('proteina',     'Proteína',     1, 'protein', 7,  7, 0,  0, 8, '#e4572e',  45, 7, 0,  2),
  ('carbohidrato', 'Carbohidrato', 2, 'carbs',   15, 0, 15, 0, 1, '#f3a712',  80, 3, 15, 1),
  ('grasa',        'Grasa',        3, 'fat',     5,  0, 0,  5, 0, '#a8c686',  45, 0, 0,  5),
  ('lacteo',       'Lácteo',       4, 'carbs',   12, 8, 12, 0, 8, '#4f9de0', 100, 8, 12, 1.5),
  ('vegetal',      'Vegetal',      5, 'carbs',   5,  2, 5,  0, 0, '#3fae6a',  25, 2, 5,  0),
  ('fruta',        'Fruta',        6, 'carbs',   15, 0, 15, 0, 0, '#d64f9a',  60, 0, 15, 0),
  ('azucar',       'Azúcar',       7, 'carbs',   5,  0, 5,  0, 0, '#b48ead', null, null, null, null)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- Alimentos: catálogo común (valores por 100 g)
-- ---------------------------------------------------------------------
create table if not exists public.foods (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  brand              text,
  barcode            text,
  state              text check (state in ('crudo','cocido')),
  category           text,
  primary_group      text not null references public.exchange_groups(code),
  protein_source     boolean not null default false, -- su proteína cuenta como porciones de proteína aunque el grupo sea otro
  kcal               numeric not null default 0,
  protein            numeric not null default 0,
  carbs              numeric not null default 0,
  fat                numeric not null default 0,
  fiber              numeric,
  sugar              numeric,
  sodium_mg          numeric,
  portions_override  jsonb,  -- {"proteina":1,"grasa":0.5} por 100 g; si existe, reemplaza el cálculo
  source             text not null default 'manual'
                     constraint foods_source_check
                     check (source in ('manual','estimado','etiqueta','openfoodfacts','fatsecret','tabla','lista')),
  verified           boolean not null default false,
  created_by         uuid default auth.uid() references auth.users(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  search_text        text generated always as
                     (public.norm(name || ' ' || coalesce(brand,'') || ' ' || coalesce(state,'') || ' ' || coalesce(category,''))) stored,
  catalog_key        text,   -- identificador en el catálogo de la app
  catalog_hash       text    -- huella de los valores con que se cargó (si se edita, deja de coincidir)
);
create unique index if not exists foods_barcode_uniq on public.foods (barcode) where barcode is not null;
create index if not exists foods_search_trgm on public.foods using gin (search_text extensions.gin_trgm_ops);
create index if not exists foods_brand_idx on public.foods (public.norm(brand));
create unique index if not exists foods_catalog_key_uniq on public.foods (catalog_key, created_by);

drop trigger if exists foods_touch on public.foods;
create trigger foods_touch before update on public.foods
  for each row execute function public.touch_updated_at();

-- Medidas caseras (taza, cucharada, scoop…). Los gramos siempre están disponibles en la app.
create table if not exists public.food_measures (
  id          uuid primary key default gen_random_uuid(),
  food_id     uuid not null references public.foods(id) on delete cascade,
  label       text not null,
  grams       numeric not null check (grams > 0),
  is_default  boolean not null default false,
  unique (food_id, label)
);
create index if not exists food_measures_food_idx on public.food_measures (food_id);

-- ---------------------------------------------------------------------
-- Planes alimenticios (metas por período)
-- ---------------------------------------------------------------------
create table if not exists public.plans (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name               text not null,
  start_date         date not null,
  end_date           date,
  targets            jsonb not null,           -- {"proteina":16,"carbohidrato":9,…}
  kcal_target        numeric,
  water_ml           numeric,
  created_at         timestamptz not null default now(),
  water_train_ml     numeric default 3550,
  water_rest_ml      numeric default 2800,
  steps_target       int     default 10000,
  training_days      int[]   default '{1,2,3,4,5}', -- ISO: 1 = lunes … 7 = domingo
  kcal_tolerance_pct numeric default 10,
  protein_target     numeric,
  carbs_target       numeric,
  fat_target         numeric,
  sleep_target       numeric default 8,
  next_visit         date,
  visit_notes        text
);
create index if not exists plans_user_idx on public.plans (user_id, start_date desc);

-- ---------------------------------------------------------------------
-- Comidas registradas: guardan una "foto" de macros y porciones al registrar
-- ---------------------------------------------------------------------
create table if not exists public.meal_entries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  eaten_on      date not null,
  meal          text not null
                constraint meal_entries_meal_check
                check (meal in ('desayuno','almuerzo','cena','snack','postentreno')),
  food_id       uuid references public.foods(id) on delete set null,
  food_name     text not null,
  food_brand    text,
  measure_label text,
  quantity      numeric not null check (quantity > 0),
  grams         numeric not null check (grams > 0),
  kcal          numeric not null,
  protein       numeric not null,
  carbs         numeric not null,
  fat           numeric not null,
  fiber         numeric,
  portions      jsonb not null,           -- exactas (sin redondear)
  created_at    timestamptz not null default now()
);
create index if not exists meal_entries_user_day on public.meal_entries (user_id, eaten_on);
create index if not exists meal_entries_food on public.meal_entries (food_id);

-- ---------------------------------------------------------------------
-- Registro diario: agua, pasos, sueño (y fases), energía, anillo rojo
-- ---------------------------------------------------------------------
create table if not exists public.daily_logs (
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day             date not null,
  water_ml        numeric not null default 0 check (water_ml >= 0),
  steps           int check (steps >= 0),
  updated_at      timestamptz not null default now(),
  sleep_h         numeric check (sleep_h >= 0 and sleep_h <= 24),
  energy          smallint check (energy between 1 and 5),
  sleep_awake_min int check (sleep_awake_min between 0 and 1440),
  sleep_rem_min   int check (sleep_rem_min   between 0 and 1440),
  sleep_core_min  int check (sleep_core_min  between 0 and 1440),
  sleep_deep_min  int check (sleep_deep_min  between 0 and 1440),
  day_active_kcal numeric check (day_active_kcal >= 0 and day_active_kcal <= 10000), -- anillo rojo del reloj
  primary key (user_id, day)
);
drop trigger if exists daily_logs_touch on public.daily_logs;
create trigger daily_logs_touch before update on public.daily_logs
  for each row execute function public.touch_daily_log();

-- Sesiones de actividad (lo que registra el reloj)
create table if not exists public.activities (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day          date not null,
  kind         text not null,          -- fuerza, cardio, natacion, caminata, otro
  title        text,
  duration_min numeric check (duration_min >= 0),
  active_kcal  numeric check (active_kcal >= 0),
  notes        text,
  created_at   timestamptz not null default now()
);
create index if not exists activities_user_day on public.activities (user_id, day);

-- Suma atómica de agua (no se pierden vasos al tocar rápido o desde dos dispositivos)
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

-- ---------------------------------------------------------------------
-- Fuerza: catálogo común de ejercicios; rutina, preferencias y reglas por usuario
-- ---------------------------------------------------------------------
create table if not exists public.exercises (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  muscle     text,                                   -- Pierna, Espalda, Bíceps…
  body       text not null default 'superior' check (body in ('superior','inferior','core')),
  measure    text not null default 'reps' check (measure in ('reps','segundos')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);
-- Nombre único en todo el catálogo (sin distinguir mayúsculas ni tildes)
create unique index if not exists exercises_name_uniq on public.exercises (public.norm(name));

-- En qué días (rutinas) va cada ejercicio para cada usuario, y si lo archivó
create table if not exists public.exercise_prefs (
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  days        int[] not null default '{}',
  archived    boolean not null default false,
  primary key (user_id, exercise_id)
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

create or replace function public.check_strength_owner() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from public.exercises e where e.id = new.exercise_id) then
    raise exception 'El ejercicio no existe';
  end if;
  return new;
end $$;
drop trigger if exists strength_owner on public.strength_entries;
create trigger strength_owner before insert or update on public.strength_entries
  for each row execute function public.check_strength_owner();

-- Semana de rutinas (weekday ISO: 1 = lunes … 7 = domingo)
create table if not exists public.routines (
  user_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  weekday   int  not null check (weekday between 1 and 7),
  name      text not null,          -- corto, para botones: "Pecho · Tríceps · Hombro"
  full_name text not null,          -- completo: "Pecho, tríceps y hombro + abdomen"
  is_rest   boolean not null default false,
  primary key (user_id, weekday)
);

-- Reglas de progresión
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
drop trigger if exists strength_settings_touch on public.strength_settings;
create trigger strength_settings_touch before update on public.strength_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Progreso: peso (báscula de casa), InBody y días anteriores a la app
-- ---------------------------------------------------------------------
create table if not exists public.body_weights (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day        date not null,
  weight_kg  numeric not null check (weight_kg > 0 and weight_kg < 400),
  created_at timestamptz not null default now(),
  fat_pct    numeric check (fat_pct > 0 and fat_pct < 80),
  muscle_kg  numeric check (muscle_kg > 0 and muscle_kg < 150),
  source     text not null default 'fitdays',
  primary key (user_id, day)
);

-- Indicadores InBody en jsonb (claves en src/lib/inbody.js)
create table if not exists public.inbody_scans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day        date not null,
  metrics    jsonb not null,
  notes      text,
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

-- Totales de días registrados antes de la app (importados)
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

-- ---------------------------------------------------------------------
-- Medicamentos y suplementos (la proteína en polvo es alimento)
-- ---------------------------------------------------------------------
create table if not exists public.meds (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name         text not null,
  brand        text,
  kind         text not null default 'suplemento'
               check (kind in ('suplemento','medicamento','anticonceptivo','otro')),
  form         text check (form in ('cápsula','tableta','polvo','líquido','gotas','inyección','parche','otro')),
  dose_amount  numeric check (dose_amount > 0),        -- cantidad por toma
  dose_unit    text,
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

-- ---------------------------------------------------------------------
-- Emociones. kind = 'momento' (con hora) o 'dia'.
-- emotions: [{ "id": "preocupado", "intensity": 1..5 }] (ids de src/lib/emotions.js)
-- ---------------------------------------------------------------------
create table if not exists public.mood_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day        date not null,
  kind       text not null default 'momento' check (kind in ('momento','dia')),
  at_time    time,
  emotions   jsonb not null check (jsonb_typeof(emotions) = 'array' and jsonb_array_length(emotions) between 1 and 10),
  areas      text[] not null default '{}',
  note       text,
  details    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists mood_entries_user_day on public.mood_entries (user_id, day);
drop trigger if exists mood_touch on public.mood_entries;
create trigger mood_touch before update on public.mood_entries
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Búsqueda de alimentos: todas las palabras deben aparecer (o casi, para tolerar
-- errores de escritura). Prioriza lo que más registra el usuario.
-- ---------------------------------------------------------------------
create or replace function public.search_foods(q text, lim int default 30)
returns table (
  id uuid, name text, brand text, state text, category text, primary_group text,
  protein_source boolean, kcal numeric, protein numeric, carbs numeric, fat numeric,
  fiber numeric, portions_override jsonb, source text, verified boolean,
  barcode text, uses bigint, score real
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with term as (select public.norm(trim(q)) as t),
  words as (select w from term, unnest(string_to_array(term.t, ' ')) w where w <> ''),
  usage as (
    select food_id, count(*) as n
    from public.meal_entries
    where user_id = auth.uid() and eaten_on > current_date - 120
    group by food_id
  )
  select f.id, f.name, f.brand, f.state, f.category, f.primary_group, f.protein_source,
         f.kcal, f.protein, f.carbs, f.fat, f.fiber, f.portions_override, f.source,
         f.verified, f.barcode,
         coalesce(u.n, 0) as uses,
         (word_similarity(term.t, f.search_text) + similarity(term.t, f.search_text) * 0.5
          + least(coalesce(u.n, 0), 20) * 0.03)::real as score
  from public.foods f
  cross join term
  left join usage u on u.food_id = f.id
  where term.t = ''
     or f.barcode = trim(q)
     -- cada palabra aparece tal cual o con un error de escritura menor
     or not exists (
          select 1 from words
          where f.search_text not like '%' || words.w || '%'
            and word_similarity(words.w, f.search_text) < 0.6
        )
  order by score desc, f.name
  limit greatest(1, least(lim, 100));
$$;

-- Alimentos recientes del usuario (registro rápido)
create or replace function public.recent_foods(lim int default 15)
returns setof uuid
language sql stable security invoker set search_path = public
as $$
  select food_id from (
    select food_id, max(created_at) as last
    from public.meal_entries
    where user_id = auth.uid() and food_id is not null
    group by food_id
  ) r order by last desc limit lim;
$$;

-- =====================================================================
-- Seguridad: RLS en todas las tablas y permisos explícitos
-- (la exposición automática de Supabase está apagada; anon no ve nada)
-- =====================================================================
alter table public.app_admins        enable row level security;
alter table public.exchange_groups   enable row level security;
alter table public.foods             enable row level security;
alter table public.food_measures     enable row level security;
alter table public.plans             enable row level security;
alter table public.meal_entries      enable row level security;
alter table public.daily_logs        enable row level security;
alter table public.activities        enable row level security;
alter table public.exercises         enable row level security;
alter table public.exercise_prefs    enable row level security;
alter table public.strength_entries  enable row level security;
alter table public.routines          enable row level security;
alter table public.strength_settings enable row level security;
alter table public.body_weights      enable row level security;
alter table public.inbody_scans      enable row level security;
alter table public.legacy_days       enable row level security;
alter table public.meds              enable row level security;
alter table public.med_logs          enable row level security;
alter table public.mood_entries      enable row level security;

revoke all on public.app_admins, public.exchange_groups, public.foods, public.food_measures, public.plans,
              public.meal_entries, public.daily_logs, public.activities, public.exercises, public.exercise_prefs,
              public.strength_entries, public.routines, public.strength_settings, public.body_weights,
              public.inbody_scans, public.legacy_days, public.meds, public.med_logs, public.mood_entries from anon;
grant select on public.app_admins, public.exchange_groups to authenticated;
grant select, insert, update, delete on public.foods, public.food_measures, public.plans, public.meal_entries,
              public.daily_logs, public.activities, public.exercises, public.exercise_prefs, public.strength_entries,
              public.routines, public.strength_settings, public.body_weights, public.inbody_scans, public.legacy_days,
              public.meds, public.med_logs, public.mood_entries to authenticated;

-- Cada quien ve si es administrador
drop policy if exists admins_self on public.app_admins;
create policy admins_self on public.app_admins for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists groups_read on public.exchange_groups;
create policy groups_read on public.exchange_groups for select to authenticated using (true);

-- Alimentos: todos ven todo. Agrega y corrige el administrador; los demás solo pueden
-- agregar productos escaneados de Open Food Facts con todos sus datos nutricionales.
drop policy if exists foods_read   on public.foods;
drop policy if exists foods_insert on public.foods;
drop policy if exists foods_update on public.foods;
drop policy if exists foods_delete on public.foods;
create policy foods_read   on public.foods for select to authenticated using (true);
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

drop policy if exists measures_read   on public.food_measures;
drop policy if exists measures_insert on public.food_measures;
drop policy if exists measures_update on public.food_measures;
drop policy if exists measures_delete on public.food_measures;
create policy measures_read on public.food_measures for select to authenticated using (true);
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

-- Ejercicios: todos ven todo; cualquiera agrega; el administrador corrige
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

-- Datos personales: cada quien solo ve y modifica lo suyo
drop policy if exists plans_own             on public.plans;
drop policy if exists entries_own           on public.meal_entries;
drop policy if exists daily_logs_own        on public.daily_logs;
drop policy if exists activities_own        on public.activities;
drop policy if exists exercise_prefs_own    on public.exercise_prefs;
drop policy if exists strength_own          on public.strength_entries;
drop policy if exists routines_own          on public.routines;
drop policy if exists strength_settings_own on public.strength_settings;
drop policy if exists weights_own           on public.body_weights;
drop policy if exists inbody_own            on public.inbody_scans;
drop policy if exists legacy_own            on public.legacy_days;
drop policy if exists meds_own              on public.meds;
drop policy if exists med_logs_own          on public.med_logs;
drop policy if exists mood_own              on public.mood_entries;
create policy plans_own on public.plans for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy entries_own on public.meal_entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy daily_logs_own on public.daily_logs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy activities_own on public.activities for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy exercise_prefs_own on public.exercise_prefs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy strength_own on public.strength_entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy routines_own on public.routines for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy strength_settings_own on public.strength_settings for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy weights_own on public.body_weights for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy inbody_own on public.inbody_scans for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy legacy_own on public.legacy_days for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy meds_own on public.meds for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy med_logs_own on public.med_logs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy mood_own on public.mood_entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Funciones expuestas a usuarios con sesión
revoke all     on function public.is_admin()               from public, anon;
revoke execute on function public.search_foods(text, int)   from public, anon;
revoke execute on function public.recent_foods(int)         from public, anon;
revoke execute on function public.add_water(date, numeric)  from public, anon;
grant  execute on function public.is_admin()                to authenticated;
grant  execute on function public.search_foods(text, int)   to authenticated;
grant  execute on function public.recent_foods(int)         to authenticated;
grant  execute on function public.add_water(date, numeric)  to authenticated;
grant  execute on function public.norm(text)                to authenticated;

-- =====================================================================
-- Después de crear tu usuario en Authentication, márcalo como administrador:
--   insert into public.app_admins (user_id)
--   select id from auth.users where email = 'tu-correo@ejemplo.com';
-- =====================================================================
