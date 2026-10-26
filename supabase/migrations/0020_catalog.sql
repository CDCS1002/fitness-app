-- Catálogo de alimentos que la app carga sola (public/catalog.json).
-- catalog_key: identificador estable del alimento en el catálogo.
-- catalog_hash: huella de los valores con que se cargó; si editas el alimento deja de coincidir
--               y las correcciones posteriores del catálogo ya no lo sobrescriben.
alter table public.foods add column if not exists catalog_key text;
alter table public.foods add column if not exists catalog_hash text;
create unique index if not exists foods_catalog_key_uniq on public.foods (catalog_key, created_by);
