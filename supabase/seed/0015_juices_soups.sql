-- Jugos naturales y cremas de vegetales caseras. Generado por scripts/build-juices-soups-seed.mjs.
-- Ejecutar después de 0009_combined_engine.sql. Seguro de correr más de una vez.
begin;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de mandarina natural', null, null, 'Jugos naturales', 'fruta', false, 43, 0.5, 10.1, 0.2, 0.2, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de mandarina natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de mandarina natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de mandarina natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de toronja natural', null, null, 'Jugos naturales', 'fruta', false, 39, 0.5, 9.2, 0.1, 0.1, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de toronja natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de toronja natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de toronja natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de piña natural', null, null, 'Jugos naturales', 'fruta', false, 53, 0.4, 12.9, 0.1, 0.2, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de piña natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de piña natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de piña natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de manzana natural', null, null, 'Jugos naturales', 'fruta', false, 46, 0.1, 11.3, 0.1, 0.2, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de manzana natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de manzana natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de manzana natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de uva natural', null, null, 'Jugos naturales', 'fruta', false, 60, 0.4, 14.8, 0.1, 0.2, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de uva natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de uva natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de uva natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de maracuyá natural', null, null, 'Jugos naturales', 'fruta', false, 51, 0.4, 13.6, 0.1, 0.2, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de maracuyá natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de maracuyá natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de maracuyá natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de sandía natural', null, null, 'Jugos naturales', 'fruta', false, 30, 0.6, 7.6, 0.2, 0.4, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de sandía natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de sandía natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de sandía natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de melón natural', null, null, 'Jugos naturales', 'fruta', false, 34, 0.8, 8.2, 0.2, 0.9, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de melón natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de melón natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de melón natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de papaya natural', null, null, 'Jugos naturales', 'fruta', false, 43, 0.5, 10.8, 0.3, 1.7, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de papaya natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de papaya natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de papaya natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de fresa natural', null, null, 'Jugos naturales', 'fruta', false, 32, 0.7, 7.7, 0.3, 2, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de fresa natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de fresa natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de fresa natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de mora natural', null, null, 'Jugos naturales', 'fruta', false, 43, 1.4, 9.6, 0.5, 5.3, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de mora natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de mora natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de mora natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de mango natural', null, null, 'Jugos naturales', 'fruta', false, 60, 0.8, 15, 0.4, 1.6, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de mango natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de mango natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de mango natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de guanábana natural', null, null, 'Jugos naturales', 'fruta', false, 66, 1, 16.8, 0.3, 3.3, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de guanábana natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de guanábana natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de guanábana natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de cas natural', null, null, 'Jugos naturales', 'fruta', false, 68, 2.6, 14.3, 1, 5.4, null, 'estimado', false, null
where not exists (select 1 from public.foods where name = 'Jugo de cas natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de cas natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de cas natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de limón natural', null, null, 'Jugos naturales', 'fruta', false, 25, 0.4, 8.4, 0.1, 0.4, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de limón natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 15, true from public.foods where name = 'Jugo de limón natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 121, false from public.foods where name = 'Jugo de limón natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de tomate natural', null, null, 'Jugos naturales', 'vegetal', false, 17, 0.9, 4.2, 0.3, 0.4, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de tomate natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de tomate natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de tomate natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de remolacha natural', null, null, 'Jugos naturales', 'vegetal', false, 43, 1.6, 9.6, 0.2, 2.8, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de remolacha natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de remolacha natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de remolacha natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de pepino natural', null, null, 'Jugos naturales', 'vegetal', false, 15, 0.7, 3.6, 0.1, 0.5, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de pepino natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de pepino natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de pepino natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de apio natural', null, null, 'Jugos naturales', 'vegetal', false, 14, 0.7, 3, 0.2, 1.6, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de apio natural' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de apio natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, false from public.foods where name = 'Jugo de apio natural' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Agua de pipa', null, null, 'Jugos naturales', 'fruta', false, 19, 0.7, 3.7, 0.2, 1.1, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Agua de pipa' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 250, true from public.foods where name = 'Agua de pipa' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'pipa (≈350 ml)', 350, false from public.foods where name = 'Agua de pipa' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Crema de zanahoria', null, null, 'Cremas y sopas', 'vegetal', false, 31, 0.6, 6.1, 0.6, 1.5, '{"vegetal":0.8066,"carbohidrato":0.1382,"grasa":0.1036}'::jsonb, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Crema de zanahoria' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 245, true from public.foods where name = 'Crema de zanahoria' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 122, false from public.foods where name = 'Crema de zanahoria' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'plato hondo (1 1/2 taza)', 365, false from public.foods where name = 'Crema de zanahoria' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Crema de ayote', null, null, 'Cremas y sopas', 'vegetal', false, 19, 0.5, 3.3, 0.6, 0.7, '{"vegetal":0.6693,"grasa":0.1093}'::jsonb, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Crema de ayote' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 245, true from public.foods where name = 'Crema de ayote' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 122, false from public.foods where name = 'Crema de ayote' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'plato hondo (1 1/2 taza)', 365, false from public.foods where name = 'Crema de ayote' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Crema de tomate', null, null, 'Cremas y sopas', 'vegetal', false, 20, 0.7, 3.2, 0.7, 0.9, '{"vegetal":0.6452,"grasa":0.1093}'::jsonb, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Crema de tomate' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 245, true from public.foods where name = 'Crema de tomate' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 122, false from public.foods where name = 'Crema de tomate' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'plato hondo (1 1/2 taza)', 365, false from public.foods where name = 'Crema de tomate' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Crema de brócoli', null, null, 'Cremas y sopas', 'vegetal', false, 31, 1.3, 5.7, 0.7, 1.6, '{"vegetal":0.7237,"carbohidrato":0.1382,"grasa":0.1036}'::jsonb, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Crema de brócoli' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 245, true from public.foods where name = 'Crema de brócoli' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 122, false from public.foods where name = 'Crema de brócoli' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'plato hondo (1 1/2 taza)', 365, false from public.foods where name = 'Crema de brócoli' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Crema de coliflor', null, null, 'Cremas y sopas', 'vegetal', false, 26, 1, 4.4, 0.7, 1.2, '{"vegetal":0.4667,"carbohidrato":0.1382,"grasa":0.1036}'::jsonb, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Crema de coliflor' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 245, true from public.foods where name = 'Crema de coliflor' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 122, false from public.foods where name = 'Crema de coliflor' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'plato hondo (1 1/2 taza)', 365, false from public.foods where name = 'Crema de coliflor' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Crema de espinaca', null, null, 'Cremas y sopas', 'vegetal', false, 29, 1.4, 5.2, 0.7, 1.2, '{"vegetal":0.383,"carbohidrato":0.2186,"grasa":0.1093}'::jsonb, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Crema de espinaca' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 245, true from public.foods where name = 'Crema de espinaca' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 122, false from public.foods where name = 'Crema de espinaca' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'plato hondo (1 1/2 taza)', 365, false from public.foods where name = 'Crema de espinaca' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Crema de hongos', null, null, 'Cremas y sopas', 'vegetal', false, 28, 1.2, 4.9, 0.7, 1.2, '{"vegetal":0.5662,"carbohidrato":0.1382,"grasa":0.1036}'::jsonb, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Crema de hongos' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 245, true from public.foods where name = 'Crema de hongos' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 122, false from public.foods where name = 'Crema de hongos' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'plato hondo (1 1/2 taza)', 365, false from public.foods where name = 'Crema de hongos' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Crema de chayote', null, null, 'Cremas y sopas', 'vegetal', false, 21, 0.4, 3.3, 0.9, 1.7, '{"vegetal":0.6617,"grasa":0.1156}'::jsonb, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Crema de chayote' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 245, true from public.foods where name = 'Crema de chayote' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 122, false from public.foods where name = 'Crema de chayote' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'plato hondo (1 1/2 taza)', 365, false from public.foods where name = 'Crema de chayote' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Crema de apio', null, null, 'Cremas y sopas', 'vegetal', false, 25, 0.6, 4.7, 0.6, 1, '{"vegetal":0.357,"carbohidrato":0.197,"grasa":0.0985}'::jsonb, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Crema de apio' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 245, true from public.foods where name = 'Crema de apio' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 122, false from public.foods where name = 'Crema de apio' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'plato hondo (1 1/2 taza)', 365, false from public.foods where name = 'Crema de apio' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Crema de vegetales mixtos', null, null, 'Cremas y sopas', 'vegetal', false, 27, 0.6, 5.2, 0.6, 1.3, '{"vegetal":0.6408,"carbohidrato":0.1314,"grasa":0.0985}'::jsonb, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Crema de vegetales mixtos' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 245, true from public.foods where name = 'Crema de vegetales mixtos' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 122, false from public.foods where name = 'Crema de vegetales mixtos' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'plato hondo (1 1/2 taza)', 365, false from public.foods where name = 'Crema de vegetales mixtos' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
commit;
