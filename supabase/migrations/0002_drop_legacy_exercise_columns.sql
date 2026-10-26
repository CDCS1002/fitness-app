-- =====================================================================
-- Quita las columnas viejas de exercises que quedaron como respaldo al pasar
-- los ejercicios a catálogo común (días y archivado ahora viven en exercise_prefs).
-- Correr solo después de confirmar que Fuerza funciona bien con la rutina en la base.
-- En una base nueva creada con 0001_base.sql no hace nada.
-- =====================================================================
alter table public.exercises drop column if exists days;
alter table public.exercises drop column if exists archived;
alter table public.exercises drop column if exists user_id;
