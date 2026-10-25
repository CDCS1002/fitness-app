-- Alimentos registrados a partir de fotos de la etiqueta. Seguro de correr más de una vez:
-- si el código de barras ya existe (por ejemplo, creado a mano), corrige sus valores y medidas.
--
-- Atún lomo en trozos en agua Great Value, lata 170 g (peso escurrido 110 g), EAN 7441078261352.
-- La etiqueta da 1 porción = 55 g del CONTENIDO CON LÍQUIDO (170 g / 3.1 porciones):
-- 40 kcal, 7 g proteína, 0.5 g grasa, <1 g carbohidratos. Por lata: 124 kcal y 21.7 g de proteína,
-- que quedan en los 110 g escurridos → por 100 g escurridos: 112.7 kcal, 19.7 g proteína, 1.4 g grasa.
do $$
declare fid uuid;
begin
  select id into fid from public.foods where barcode = '7441078261352';
  if fid is null then
    insert into public.foods (name, brand, barcode, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
    values ('Atún lomo en trozos en agua', 'Great Value', '7441078261352', 'Enlatados', 'proteina', false,
            112.7, 19.73, 0, 1.41, 0, 'etiqueta', true,
            case when (select count(*) from auth.users) = 1 then (select id from auth.users limit 1) end)
    returning id into fid;
  else
    update public.foods
       set name = 'Atún lomo en trozos en agua', brand = 'Great Value', category = 'Enlatados', primary_group = 'proteina', protein_source = false,
           kcal = 112.7, protein = 19.73, carbs = 0, fat = 1.41, fiber = 0, source = 'etiqueta', verified = true
     where id = fid;
    delete from public.food_measures where food_id = fid;
  end if;
  insert into public.food_measures (food_id, label, grams, is_default) values
    (fid, 'lata escurrida (110 g)', 110, true),
    (fid, '1/2 lata escurrida', 55, false);
end $$;

-- Productos Perform (etiquetas fotografiadas).
-- Whey Protein Galleta: 1 scoop (35 g) = 130 kcal, 27 g proteína, 2 g carbohidratos, 2 g grasa, 0 g fibra.
-- Barra de proteína mantequilla de maní cubierta en chocolate: 1 barra (60 g) = 215 kcal, 23 g proteína,
--   17 g carbohidratos totales (5 g fibra + 9 g polioles → 3 g netos), 9 g grasa.
--   Las porciones se fijan con los carbohidratos NETOS (portions_override por 100 g):
--   proteína 23/7 = 3.29, harina 3/15 = 0.2, grasa (9 − 8 incluidos en la proteína)/5 = 0.2 por barra.
do $$
declare uid uuid := case when (select count(*) from auth.users) = 1 then (select id from auth.users limit 1) end;
declare fid uuid;
declare r record;
begin
  for r in select * from (values
    ('Whey Protein galleta', 'Perform', 'Suplementos', 371.43, 77.14, 5.71, 5.71, 0::numeric, null::jsonb, 'scoop (35 g)', 35::numeric),
    ('Barra de proteína mantequilla de maní', 'Perform', 'Barras de proteína', 358.33, 38.33, 28.33, 15, 8.33,
     '{"proteina":5.4762,"carbohidrato":0.3333,"grasa":0.3333}'::jsonb, 'barra (60 g)', 60::numeric)
  ) as t(name, brand, category, kcal, protein, carbs, fat, fiber, override, label, grams)
  loop
    select id into fid from public.foods where name = r.name and brand = r.brand and state is null;
    if fid is null then
      insert into public.foods (name, brand, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
      values (r.name, r.brand, r.category, 'proteina', false, r.kcal, r.protein, r.carbs, r.fat, r.fiber, r.override, 'etiqueta', true, uid)
      returning id into fid;
    else
      update public.foods set category = r.category, primary_group = 'proteina', kcal = r.kcal, protein = r.protein, carbs = r.carbs,
             fat = r.fat, fiber = r.fiber, portions_override = r.override, source = 'etiqueta', verified = true
       where id = fid;
      delete from public.food_measures where food_id = fid;
    end if;
    insert into public.food_measures (food_id, label, grams, is_default) values (fid, r.label, r.grams, true);
  end loop;
end $$;
