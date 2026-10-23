-- Importa peso, InBody y los días 13–21 de octubre del Google Sheet.
-- Generado por scripts/build-progress-seed.mjs. Ejecutar después de 0005_progress.sql.
do $$
declare uid uuid;
begin
  if (select count(*) from auth.users) <> 1 then
    raise exception 'Se esperaba exactamente 1 usuario en auth.users; ajusta el script';
  end if;
  select id into uid from auth.users limit 1;
  insert into public.inbody_scans (user_id, day, metrics, notes) values (uid, '2026-06-15', '{"weight":80.4,"smm":33.4,"pbf":27.4}'::jsonb, 'Historial (solo 3 indicadores)') on conflict (user_id, day) do nothing;
  insert into public.inbody_scans (user_id, day, metrics, notes) values (uid, '2026-09-28', '{"tbw":43.5,"protein":12,"minerals":3.91,"fat_mass":21.8,"weight":81.2,"smm":34,"ffm":59.4,"bmi":28.1,"pbf":26.9,"visceral":9,"whr":1.01,"obesity_degree":128,"score":74,"bmr":1653,"kcal_rec":2376,"smi":8.5,"target_weight":69.9,"fat_control":-11.3,"muscle_control":0,"lean_arm_l":3.67,"lean_arm_l_pct":112.9,"lean_arm_r":3.65,"lean_arm_r_pct":112.3,"lean_trunk":28.4,"lean_trunk_pct":109.8,"lean_leg_l":8.53,"lean_leg_l_pct":94.4,"lean_leg_r":8.6,"lean_leg_r_pct":95.2,"fat_arm_l":1.2,"fat_arm_l_pct":216.8,"fat_arm_r":1.3,"fat_arm_r_pct":221,"fat_trunk":12.5,"fat_trunk_pct":310.7,"fat_leg_l":2.7,"fat_leg_l_pct":166.5,"fat_leg_r":2.8,"fat_leg_r_pct":167.7}'::jsonb, null) on conflict (user_id, day) do nothing;
  insert into public.body_weights (user_id, day, weight_kg) values (uid, '2026-10-20', 78.7) on conflict (user_id, day) do nothing;
  insert into public.legacy_days (user_id, day, kcal, protein, carbs, fat, portions, active_kcal, sleep_h, energy)
    values (uid, '2026-10-13', 1908, 149, 207, 52, '{"lacteo":1,"vegetal":2,"fruta":2,"carbohidrato":9,"proteina":15,"grasa":3}'::jsonb, 643, 6.5, 4) on conflict (user_id, day) do nothing;
  insert into public.daily_logs (user_id, day, water_ml, steps) values (uid, '2026-10-13', 2000, 10450) on conflict (user_id, day) do nothing;
  insert into public.legacy_days (user_id, day, kcal, protein, carbs, fat, portions, active_kcal, sleep_h, energy)
    values (uid, '2026-10-14', 2141, 176, 246, 49, '{"lacteo":2,"vegetal":0,"fruta":2,"carbohidrato":9,"proteina":15,"grasa":3}'::jsonb, 652, 6.5, 3) on conflict (user_id, day) do nothing;
  insert into public.daily_logs (user_id, day, water_ml, steps) values (uid, '2026-10-14', 2500, 9263) on conflict (user_id, day) do nothing;
  insert into public.legacy_days (user_id, day, kcal, protein, carbs, fat, portions, active_kcal, sleep_h, energy)
    values (uid, '2026-10-15', 2311, 183, 263, 57, '{"lacteo":2,"vegetal":0,"fruta":2,"carbohidrato":9,"proteina":15,"grasa":3}'::jsonb, 1186, 7.3, 5) on conflict (user_id, day) do nothing;
  insert into public.daily_logs (user_id, day, water_ml, steps) values (uid, '2026-10-15', 3000, 8736) on conflict (user_id, day) do nothing;
  insert into public.legacy_days (user_id, day, kcal, protein, carbs, fat, portions, active_kcal, sleep_h, energy)
    values (uid, '2026-10-16', 1914, 124, 195, 73, '{"lacteo":0,"vegetal":3,"fruta":2,"carbohidrato":9,"proteina":15,"grasa":3}'::jsonb, 774, 3.5, 2) on conflict (user_id, day) do nothing;
  insert into public.daily_logs (user_id, day, water_ml, steps) values (uid, '2026-10-16', 3000, 15240) on conflict (user_id, day) do nothing;
  insert into public.legacy_days (user_id, day, kcal, protein, carbs, fat, portions, active_kcal, sleep_h, energy)
    values (uid, '2026-10-17', 2162, 127, 100, 137, '{"lacteo":1,"vegetal":1,"fruta":1,"carbohidrato":9,"proteina":15,"grasa":3}'::jsonb, 0, 9.5, 5) on conflict (user_id, day) do nothing;
  insert into public.daily_logs (user_id, day, water_ml, steps) values (uid, '2026-10-17', 2500, 2818) on conflict (user_id, day) do nothing;
  insert into public.legacy_days (user_id, day, kcal, protein, carbs, fat, portions, active_kcal, sleep_h, energy)
    values (uid, '2026-10-18', 2038, 100, 241, 74, '{"lacteo":1,"vegetal":0,"fruta":0,"carbohidrato":9,"proteina":10,"grasa":3}'::jsonb, 0, 9.1, 4) on conflict (user_id, day) do nothing;
  insert into public.daily_logs (user_id, day, water_ml, steps) values (uid, '2026-10-18', 1000, 1884) on conflict (user_id, day) do nothing;
  insert into public.legacy_days (user_id, day, kcal, protein, carbs, fat, portions, active_kcal, sleep_h, energy)
    values (uid, '2026-10-19', 1905, 114, 178, 80, '{"lacteo":0,"vegetal":3,"fruta":0,"carbohidrato":9,"proteina":15,"grasa":3}'::jsonb, 967, 5.6, 4) on conflict (user_id, day) do nothing;
  insert into public.daily_logs (user_id, day, water_ml, steps) values (uid, '2026-10-19', 2500, 10035) on conflict (user_id, day) do nothing;
  insert into public.legacy_days (user_id, day, kcal, protein, carbs, fat, portions, active_kcal, sleep_h, energy)
    values (uid, '2026-10-20', 2104, 155, 208, 69, '{"lacteo":1,"vegetal":1,"fruta":1,"carbohidrato":9,"proteina":15,"grasa":3}'::jsonb, 705, 6.7, 4) on conflict (user_id, day) do nothing;
  insert into public.daily_logs (user_id, day, water_ml, steps) values (uid, '2026-10-20', 2000, 7769) on conflict (user_id, day) do nothing;
  insert into public.legacy_days (user_id, day, kcal, protein, carbs, fat, portions, active_kcal, sleep_h, energy)
    values (uid, '2026-10-21', 1986, 151, 181, 70, '{"lacteo":1,"vegetal":3,"fruta":2,"carbohidrato":9,"proteina":15,"grasa":3}'::jsonb, 773, 6.5, 4) on conflict (user_id, day) do nothing;
  insert into public.daily_logs (user_id, day, water_ml, steps) values (uid, '2026-10-21', 2500, 10573) on conflict (user_id, day) do nothing;
end $$;
