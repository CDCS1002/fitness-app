-- =====================================================================
-- FITNESS APP · Esquema inicial (fase 1)
-- Ejecutar completo en Supabase → SQL Editor. Es idempotente donde se puede.
-- =====================================================================

create extension if not exists pg_trgm  with schema extensions;
create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------------------
-- Normalización de texto para búsqueda (minúsculas, sin tildes)
-- unaccent() no es IMMUTABLE; este envoltorio sí, para poder indexar.
-- ---------------------------------------------------------------------
create or replace function public.norm(t text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(t, '')))
$$;

-- ---------------------------------------------------------------------
-- Grupos de intercambio (equivalentes). Editables para calibrar con la
-- nutricionista sin tocar código.
--   basis_macro / basis_grams : macro que define 1 porción del grupo
--   *_ref                     : macros que "consume" 1 porción cuando el
--                               alimento pertenece a este grupo
-- ---------------------------------------------------------------------
create table if not exists public.exchange_groups (
  code         text primary key,
  name         text not null,
  sort         int  not null,
  basis_macro  text not null check (basis_macro in ('protein','carbs','fat')),
  basis_grams  numeric not null check (basis_grams > 0),
  protein_ref  numeric not null default 0,
  carbs_ref    numeric not null default 0,
  fat_ref      numeric not null default 0,
  color        text
);

insert into public.exchange_groups
  (code, name, sort, basis_macro, basis_grams, protein_ref, carbs_ref, fat_ref, color) values
  ('proteina',     'Proteína',     1, 'protein', 7,  7, 0, 0,  '#e4572e'),
  ('carbohidrato', 'Carbohidrato', 2, 'carbs',   15, 0, 15, 0, '#f3a712'),
  ('grasa',        'Grasa',        3, 'fat',     5,  0, 0, 5,  '#a8c686'),
  ('lacteo',       'Lácteo',       4, 'protein', 8,  8, 12, 2, '#4f9de0'),
  ('vegetal',      'Vegetal',      5, 'carbs',   5,  2, 5, 0,  '#3fae6a'),
  ('fruta',        'Fruta',        6, 'carbs',   15, 0, 15, 0, '#d64f9a')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- Alimentos (valores por 100 g)
-- ---------------------------------------------------------------------
create table if not exists public.foods (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  brand              text,
  barcode            text,
  state              text check (state in ('crudo','cocido')),
  category           text,
  primary_group      text not null references public.exchange_groups(code),
  protein_source     boolean not null default false, -- cuenta su proteína como porciones de proteína aunque el grupo sea otro
  kcal               numeric not null default 0,
  protein            numeric not null default 0,
  carbs              numeric not null default 0,
  fat                numeric not null default 0,
  fiber              numeric,
  sugar              numeric,
  sodium_mg          numeric,
  portions_override  jsonb,  -- {"proteina":1,"grasa":0.5} por 100 g; si existe, reemplaza el cálculo
  source             text not null default 'manual'
                     check (source in ('manual','estimado','etiqueta','openfoodfacts','fatsecret','tabla')),
  verified           boolean not null default false,
  created_by         uuid default auth.uid() references auth.users(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  search_text        text generated always as
                     (public.norm(name || ' ' || coalesce(brand,'') || ' ' || coalesce(state,'') || ' ' || coalesce(category,''))) stored
);

create unique index if not exists foods_barcode_uniq on public.foods (barcode) where barcode is not null;
create index if not exists foods_search_trgm on public.foods using gin (search_text extensions.gin_trgm_ops);
create index if not exists foods_brand_idx on public.foods (public.norm(brand));

-- Medidas caseras por alimento (taza, cda, unidad, scoop...). Los gramos siempre están disponibles en la app.
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
-- Planes alimenticios (metas de porciones por período)
-- ---------------------------------------------------------------------
create table if not exists public.plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name        text not null,
  start_date  date not null,
  end_date    date,
  targets     jsonb not null,           -- {"proteina":15,"carbohidrato":9,...}
  kcal_target numeric,
  water_ml    numeric,
  created_at  timestamptz not null default now()
);
create index if not exists plans_user_idx on public.plans (user_id, start_date desc);

-- ---------------------------------------------------------------------
-- Registro de comidas. Guarda una "foto" de macros y porciones al momento
-- de registrar, para que editar un alimento no cambie el historial.
-- ---------------------------------------------------------------------
create table if not exists public.meal_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  eaten_on    date not null,
  meal        text not null check (meal in ('desayuno','almuerzo','cena','snack')),
  food_id     uuid references public.foods(id) on delete set null,
  food_name   text not null,
  food_brand  text,
  measure_label text,
  quantity    numeric not null check (quantity > 0),
  grams       numeric not null check (grams > 0),
  kcal        numeric not null,
  protein     numeric not null,
  carbs       numeric not null,
  fat         numeric not null,
  fiber       numeric,
  portions    jsonb not null,           -- exactas (sin redondear)
  created_at  timestamptz not null default now()
);
create index if not exists meal_entries_user_day on public.meal_entries (user_id, eaten_on);
create index if not exists meal_entries_food on public.meal_entries (food_id);

-- updated_at automático
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists foods_touch on public.foods;
create trigger foods_touch before update on public.foods
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Seguridad: RLS + permisos explícitos (la exposición automática está apagada)
-- ---------------------------------------------------------------------
alter table public.exchange_groups enable row level security;
alter table public.foods           enable row level security;
alter table public.food_measures   enable row level security;
alter table public.plans           enable row level security;
alter table public.meal_entries    enable row level security;

revoke all on public.exchange_groups, public.foods, public.food_measures,
              public.plans, public.meal_entries from anon;
grant select                          on public.exchange_groups to authenticated;
grant select, insert, update, delete  on public.foods, public.food_measures,
                                         public.plans, public.meal_entries to authenticated;

drop policy if exists groups_read on public.exchange_groups;
create policy groups_read on public.exchange_groups for select to authenticated using (true);

-- Catálogo de alimentos: lo lee cualquier usuario autenticado; cada quien edita lo suyo.
-- Los alimentos de la carga inicial (created_by null) los puede editar cualquier usuario:
-- hoy solo existes tú; antes de abrir registros a más usuarios se restringe a un rol admin.
drop policy if exists foods_read   on public.foods;
drop policy if exists foods_insert on public.foods;
drop policy if exists foods_update on public.foods;
drop policy if exists foods_delete on public.foods;
create policy foods_read   on public.foods for select to authenticated using (true);
create policy foods_insert on public.foods for insert to authenticated
  with check (created_by = (select auth.uid()));
create policy foods_update on public.foods for update to authenticated
  using (created_by = (select auth.uid()) or created_by is null)
  with check (created_by = (select auth.uid()) or created_by is null);
create policy foods_delete on public.foods for delete to authenticated
  using (created_by = (select auth.uid()));

drop policy if exists measures_read  on public.food_measures;
drop policy if exists measures_write on public.food_measures;
create policy measures_read on public.food_measures for select to authenticated using (true);
create policy measures_write on public.food_measures for all to authenticated
  using (exists (select 1 from public.foods f where f.id = food_id
                 and (f.created_by = (select auth.uid()) or f.created_by is null)))
  with check (exists (select 1 from public.foods f where f.id = food_id
                 and (f.created_by = (select auth.uid()) or f.created_by is null)));

drop policy if exists plans_own on public.plans;
create policy plans_own on public.plans for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists entries_own on public.meal_entries;
create policy entries_own on public.meal_entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- Búsqueda: todas las palabras deben aparecer (en nombre, marca o categoría),
-- o similitud aproximada para tolerar errores de escritura.
-- Prioriza lo que más registras.
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

-- Alimentos recientes del usuario (para registro rápido)
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

revoke execute on function public.search_foods(text, int) from public, anon;
revoke execute on function public.recent_foods(int)       from public, anon;
grant  execute on function public.search_foods(text, int) to authenticated;
grant  execute on function public.recent_foods(int)       to authenticated;
grant  execute on function public.norm(text)              to authenticated;
