-- Cortes de carne (cocidos) y cubaces. Valores USDA por 100 g. Generado por scripts/build-meats-seed.mjs.
-- Ejecutar después de 0009_combined_engine.sql. Seguro de correr más de una vez.
begin;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Lomito de res', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 207, 28.6, 0, 9.4, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Lomito de res' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Lomito de res' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Lomito de res' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Bistec de res magro (posta)', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 188, 31.8, 0, 5.3, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Bistec de res magro (posta)' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Bistec de res magro (posta)' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Bistec de res magro (posta)' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Solomo de res', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 202, 30.6, 0, 7.8, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Solomo de res' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Solomo de res' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Solomo de res' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Falda de res (arrachera)', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 194, 27.8, 0, 8.5, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Falda de res (arrachera)' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Falda de res (arrachera)' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Falda de res (arrachera)' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Carne de res para desmechar', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 200, 31.5, 0, 7.5, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Carne de res para desmechar' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Carne de res para desmechar' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Carne de res para desmechar' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Ribeye (lomo ancho)', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 291, 24.6, 0, 21, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Ribeye (lomo ancho)' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Ribeye (lomo ancho)' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Ribeye (lomo ancho)' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Costilla de res', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 295, 30.8, 0, 18.1, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Costilla de res' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Costilla de res' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Costilla de res' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Carne molida de res 80/20', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 270, 25.6, 0, 17.8, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Carne molida de res 80/20' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Carne molida de res 80/20' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Carne molida de res 80/20' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Hígado de res', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 175, 26.5, 5.2, 4.7, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Hígado de res' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Hígado de res' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Hígado de res' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Chuleta de cerdo magra', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 196, 29.5, 0, 7.9, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Chuleta de cerdo magra' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Chuleta de cerdo magra' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Chuleta de cerdo magra' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pierna de cerdo magra', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 211, 29.4, 0, 9.4, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pierna de cerdo magra' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Pierna de cerdo magra' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Pierna de cerdo magra' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Costilla de cerdo', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 397, 29.1, 0, 30.3, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Costilla de cerdo' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Costilla de cerdo' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Costilla de cerdo' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pollo entero asado con piel', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 239, 27.3, 0, 13.6, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pollo entero asado con piel' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Pollo entero asado con piel' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Pollo entero asado con piel' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Muslo de pollo con piel', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 229, 23.3, 0, 14.7, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Muslo de pollo con piel' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Muslo de pollo con piel' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Muslo de pollo con piel' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Alas de pollo con piel', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 254, 23.8, 0, 16.9, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Alas de pollo con piel' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Alas de pollo con piel' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Alas de pollo con piel' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Carne molida de pavo 93/7', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 213, 27.1, 0, 11.6, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Carne molida de pavo 93/7' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Carne molida de pavo 93/7' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Carne molida de pavo 93/7' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Corvina', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 124, 23.6, 0, 2.6, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Corvina' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Corvina' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Corvina' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pargo', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 128, 26.3, 0, 1.7, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pargo' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Pargo' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Pargo' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Dorado (mahi-mahi)', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 109, 23.7, 0, 0.9, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Dorado (mahi-mahi)' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1 oz (30 g)', 30, false from public.foods where name = 'Dorado (mahi-mahi)' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción de 3 oz (85 g)', 85, true from public.foods where name = 'Dorado (mahi-mahi)' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Cubaces', null, 'cocido', 'Leguminosas', 'carbohidrato', true, 115, 7.8, 20.9, 0.4, 7, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Cubaces' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 94, true from public.foods where name = 'Cubaces' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Cubaces', null, 'crudo', 'Leguminosas', 'carbohidrato', true, 338, 21.5, 63.4, 0.7, 19, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Cubaces' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/4 taza', 45, true from public.foods where name = 'Cubaces' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;
commit;
