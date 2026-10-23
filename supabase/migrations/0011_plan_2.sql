-- =====================================================================
-- FITNESS APP · Plan 2 (consulta del 13/10/2026, Licda. María Paula Ruiz)
-- Objetivo: recomposición corporal con déficit moderado.
-- Intercambios: 2 lácteos · 3 vegetales · 2 frutas · 9 harinas · 3 grasas
--   · 16 proteínas (8 magras + 4 semigrasas + 1 scoop Iso Sensation ≈ 4) · azúcar 1 cdita.
-- Meta calculada con los valores por porción de su lista + etiqueta del scoop:
--   2.060 kcal · 158 g proteína · 212 g carbohidratos · 65 g grasa.
-- =====================================================================
do $$
declare
  uid uuid;
  p1  public.plans%rowtype;
begin
  if (select count(*) from auth.users) <> 1 then
    raise exception 'Se esperaba exactamente 1 usuario en auth.users; ajusta el script';
  end if;
  select id into uid from auth.users limit 1;

  -- El plan anterior (desde el 28/09) pasa a llamarse Plan 1 y termina el 12/10
  select * into p1 from public.plans
   where user_id = uid and start_date < '2026-10-13' and (end_date is null or end_date >= '2026-10-13')
   order by start_date desc limit 1;
  if found then
    update public.plans set name = 'Plan 1', end_date = '2026-10-12' where id = p1.id;
  end if;

  if not exists (select 1 from public.plans where user_id = uid and start_date = '2026-10-13') then
    insert into public.plans (user_id, name, start_date, targets, kcal_target, kcal_tolerance_pct,
                              protein_target, carbs_target, fat_target,
                              water_train_ml, water_rest_ml, steps_target, sleep_target, training_days,
                              next_visit, visit_notes)
    values (uid, 'Plan 2', '2026-10-13',
            '{"proteina": 16, "carbohidrato": 9, "grasa": 3, "lacteo": 2, "vegetal": 3, "fruta": 2, "azucar": 1}'::jsonb,
            2060, 10, 158, 212, 65,
            coalesce(p1.water_train_ml, 3550), coalesce(p1.water_rest_ml, 2800),
            coalesce(p1.steps_target, 10000), coalesce(p1.sleep_target, 8), coalesce(p1.training_days, '{1,2,3,4,5}'),
            p1.next_visit, p1.visit_notes);
    -- Las notas y la próxima cita viajan al plan vigente
    if p1.id is not null then
      update public.plans set next_visit = null, visit_notes = null where id = p1.id;
    end if;
  end if;

  -- Peso de la consulta del 13/10 (báscula de la nutricionista)
  insert into public.body_weights (user_id, day, weight_kg) values (uid, '2026-10-13', 79.9)
  on conflict (user_id, day) do nothing;
end $$;
