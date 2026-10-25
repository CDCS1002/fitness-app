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

-- Great Value (Walmart). No hay etiquetas de Costa Rica publicadas: valores de la etiqueta de
-- EE. UU. (FatSecret), marcados como estimados. Si tu empaque dice otra cosa, corrígelo con
-- "Editar alimento" (quedan como alimentos tuyos).
do $$
declare uid uuid := case when (select count(*) from auth.users) = 1 then (select id from auth.users limit 1) end;
declare fid uuid;
declare r record;
begin
  for r in select * from (values
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/old-fashioned-oats
    ('Avena tradicional', 'crudo', 'Cereales', 'carbohidrato', false, 375.0, 12.5, 67.5, 6.25, null::numeric, '1/2 taza', 40::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/whole-grain-quick-oats
    ('Avena rápida', 'crudo', 'Cereales', 'carbohidrato', false, 375.0, 12.5, 67.5, 6.25, null::numeric, '1/2 taza', 40::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/long-grain-rice-(enriched)
    ('Arroz grano largo', 'crudo', 'Cereales', 'carbohidrato', false, 355.56, 6.67, 80.0, 0.0, null::numeric, '1/4 taza', 45::numeric),
    -- https://foods.fatsecret.com/calories-nutrition/great-value/enriched-spaghetti
    ('Spaghetti', 'crudo', 'Pastas', 'carbohidrato', false, 357.14, 12.5, 75.0, 1.79, null::numeric, 'porción (56 g)', 56::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/lightly-salted-rice-cakes
    ('Galletas de arroz ligeramente saladas', null, 'Snacks', 'carbohidrato', false, 400.0, 6.67, 83.33, 3.33, null::numeric, '3 galletas', 30::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/black-beans-(canned)
    ('Frijoles negros enlatados', null, 'Leguminosas', 'carbohidrato', false, 92.31, 5.38, 16.92, 0.38, null::numeric, '1/2 taza', 130::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/fat-free-refried-beans
    ('Frijoles molidos sin grasa', null, 'Leguminosas', 'carbohidrato', false, 76.92, 4.62, 13.85, 0.0, null::numeric, '1/2 taza', 130::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/chunk-chicken-breast
    ('Pechuga de pollo en trozos enlatada', null, 'Enlatados', 'proteina', false, 83.33, 15.48, 0.0, 1.79, null::numeric, 'porción (84 g)', 84::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/whole-almonds
    ('Almendras enteras', null, 'Semillas y frutos secos', 'grasa', true, 566.67, 16.67, 23.33, 50.0, null::numeric, '1/4 taza', 30::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/deluxe-mixed-nuts
    ('Nueces mixtas deluxe', null, 'Semillas y frutos secos', 'grasa', true, 627.91, 16.28, 20.93, 55.81, null::numeric, 'bolsita (43 g)', 43::numeric),
    -- https://www.fatsecret.com.mx/calor%C3%ADas-nutrici%C3%B3n/great-value/crunchy-peanut-butter/2-tbsp
    ('Mantequilla de maní crunchy', null, 'Semillas y frutos secos', 'grasa', true, 562.5, 21.88, 25.0, 46.88, null::numeric, '2 cucharadas', 32::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/organic-great-value/chia-seeds
    ('Semillas de chía orgánicas', null, 'Semillas y frutos secos', 'grasa', true, 541.67, 20.83, 33.33, 33.33, null::numeric, '2 cucharadas', 24::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/extra-virgin-olive-oil
    ('Aceite de oliva extra virgen', null, 'Aceites y grasas', 'grasa', false, 857.14, 0.0, 0.0, 100.0, null::numeric, 'cucharada (15 ml)', 14::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/frozen-mixed-vegetables
    ('Vegetales mixtos congelados', null, 'Vegetales', 'vegetal', false, 55.56, 2.22, 12.22, 0.0, null::numeric, '2/3 taza', 90::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/frozen-broccoli-florets
    ('Brócoli congelado', null, 'Vegetales', 'vegetal', false, 35.29, 3.53, 4.71, 0.0, null::numeric, '1 taza', 85::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/whole-strawberries
    ('Fresas enteras congeladas', null, 'Frutas', 'fruta', false, 50.0, 0.0, 12.86, 0.0, null::numeric, '1 taza', 140::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/sun-dried-raisins
    ('Pasas', null, 'Frutas', 'fruta', false, 300.0, 2.5, 82.5, 0.0, null::numeric, '1/4 taza', 40::numeric),
    -- https://mobile.fatsecret.com/calories-nutrition/great-value/clover-honey
    ('Miel de abeja', null, 'Azúcares', 'azucar', false, 285.71, 0.0, 80.95, 0.0, null::numeric, 'cucharada', 21::numeric)
  ) as t(name, state, category, grp, psrc, kcal, protein, carbs, fat, fiber, label, grams)
  loop
    select id into fid from public.foods where name = r.name and brand = 'Great Value' and state is not distinct from r.state;
    if fid is null then
      insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
      values (r.name, 'Great Value', r.state, r.category, r.grp, r.psrc, r.kcal, r.protein, r.carbs, r.fat, r.fiber, 'estimado', false, uid)
      returning id into fid;
      insert into public.food_measures (food_id, label, grams, is_default) values (fid, r.label, r.grams, true);
    end if;
  end loop;
end $$;
