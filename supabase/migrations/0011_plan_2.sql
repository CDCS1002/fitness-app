-- =====================================================================
-- FITNESS APP · Planes de la Licda. María Paula Ruiz y báscula de casa
--
-- Plan 1 · consulta 24/08/2026 · recomposición corporal
--   2 lácteos · 3 vegetales · 2 frutas · 10–12 harinas (meta 11) · 2 grasas
--   · 17 proteínas (13 + 1 scoop Iso Sensation ≈ 4) · azúcar máx. 1 cucharada (3 cditas)
--   Meta: 2.080 kcal · 171 P · 237 C · 52 G (con 10 harinas 2.000; con 12, 2.160)
-- Plan 2 · consulta 13/10/2026 · recomposición con déficit moderado
--   2 lácteos · 3 vegetales · 2 frutas · 9 harinas · 3 grasas
--   · 16 proteínas (8 magras + 4 semigrasas + 1 scoop ≈ 4) · azúcar máx. 1 cucharada
--   Meta: 2.040 kcal · 158 P · 207 C · 65 G
-- Metas calculadas con los valores por porción de su lista y la etiqueta del scoop
-- (130 kcal · 25 P · 3 C · 2 G). El azúcar es un máximo: no suma a la meta de kcal.
-- Las mediciones de su báscula no se registran: la referencia es el InBody.
-- =====================================================================

-- Báscula de casa (FitDays): grasa y músculo opcionales junto al peso semanal.
-- Solo se comparan entre pesajes de la misma báscula, nunca contra el InBody.
alter table public.body_weights
  add column if not exists fat_pct   numeric check (fat_pct > 0 and fat_pct < 80),
  add column if not exists muscle_kg numeric check (muscle_kg > 0 and muscle_kg < 150),
  add column if not exists source    text not null default 'fitdays';

do $$
declare
  uid uuid;
  cur public.plans%rowtype;
begin
  if (select count(*) from auth.users) <> 1 then
    raise exception 'Se esperaba exactamente 1 usuario en auth.users; ajusta el script';
  end if;
  select id into uid from auth.users limit 1;

  -- Plan creado al inicio de la app (desde el 28/09): se conservan agua, pasos, sueño y notas
  -- (solo ese: un plan creado más adelante nunca se toca, aunque el script se ejecute de nuevo)
  select * into cur from public.plans
   where user_id = uid and start_date = '2026-09-28'
   order by created_at limit 1;

  -- Plan 1: 24/08/2026 – 12/10/2026
  if not exists (select 1 from public.plans where user_id = uid and start_date = '2026-08-24') then
    insert into public.plans (user_id, name, start_date, end_date, targets, kcal_target, kcal_tolerance_pct,
                              protein_target, carbs_target, fat_target,
                              water_train_ml, water_rest_ml, steps_target, sleep_target, training_days)
    values (uid, 'Plan 1', '2026-08-24', '2026-10-12',
            '{"proteina": 17, "carbohidrato": 11, "grasa": 2, "lacteo": 2, "vegetal": 3, "fruta": 2, "azucar": 3}'::jsonb,
            2080, 10, 171, 237, 52,
            coalesce(cur.water_train_ml, 3550), coalesce(cur.water_rest_ml, 2800),
            coalesce(cur.steps_target, 10000), coalesce(cur.sleep_target, 8), coalesce(cur.training_days, '{1,2,3,4,5}'));
  end if;

  -- Plan 2: desde el 13/10/2026 (vigente)
  if not exists (select 1 from public.plans where user_id = uid and start_date = '2026-10-13') then
    insert into public.plans (user_id, name, start_date, targets, kcal_target, kcal_tolerance_pct,
                              protein_target, carbs_target, fat_target,
                              water_train_ml, water_rest_ml, steps_target, sleep_target, training_days,
                              next_visit, visit_notes)
    values (uid, 'Plan 2', '2026-10-13',
            '{"proteina": 16, "carbohidrato": 9, "grasa": 3, "lacteo": 2, "vegetal": 3, "fruta": 2, "azucar": 3}'::jsonb,
            2040, 10, 158, 207, 65,
            coalesce(cur.water_train_ml, 3550), coalesce(cur.water_rest_ml, 2800),
            coalesce(cur.steps_target, 10000), coalesce(cur.sleep_target, 8), coalesce(cur.training_days, '{1,2,3,4,5}'),
            cur.next_visit, cur.visit_notes);
  end if;

  -- El plan provisional del 28/09 ya no aplica: sus fechas quedan cubiertas por los Planes 1 y 2
  if cur.id is not null then
    delete from public.plans where id = cur.id;
  end if;
end $$;
