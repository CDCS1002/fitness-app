-- Alimentos genéricos (frutas, vegetales, granos, semillas, carnes, lácteos).
-- Valores por 100 g de referencia USDA FoodData Central. Generado por scripts/build-generic-seed.mjs.
begin;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Manzana roja', null, null, 'Frutas', 'fruta', false, 52, 0.3, 13.8, 0.2, 2.4, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Manzana roja' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad mediana', 182, true from public.foods where name = 'Manzana roja' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza en trozos', 125, false from public.foods where name = 'Manzana roja' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Naranja', null, null, 'Frutas', 'fruta', false, 47, 0.9, 11.8, 0.1, 2.4, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Naranja' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 131, true from public.foods where name = 'Naranja' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Mandarina', null, null, 'Frutas', 'fruta', false, 53, 0.8, 13.3, 0.3, 1.8, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Mandarina' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 88, true from public.foods where name = 'Mandarina' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Fresas', null, null, 'Frutas', 'fruta', false, 32, 0.7, 7.7, 0.3, 2, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Fresas' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 152, true from public.foods where name = 'Fresas' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 12, false from public.foods where name = 'Fresas' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Uvas', null, null, 'Frutas', 'fruta', false, 69, 0.7, 18.1, 0.2, 0.9, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Uvas' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 151, true from public.foods where name = 'Uvas' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 5, false from public.foods where name = 'Uvas' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Piña', null, null, 'Frutas', 'fruta', false, 50, 0.5, 13.1, 0.1, 1.4, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Piña' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza en trozos', 165, true from public.foods where name = 'Piña' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'rodaja', 84, false from public.foods where name = 'Piña' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Papaya', null, null, 'Frutas', 'fruta', false, 43, 0.5, 10.8, 0.3, 1.7, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Papaya' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza en trozos', 145, true from public.foods where name = 'Papaya' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Mango', null, null, 'Frutas', 'fruta', false, 60, 0.8, 15, 0.4, 1.6, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Mango' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza en trozos', 165, true from public.foods where name = 'Mango' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 207, false from public.foods where name = 'Mango' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Sandía', null, null, 'Frutas', 'fruta', false, 30, 0.6, 7.6, 0.2, 0.4, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Sandía' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza en trozos', 152, true from public.foods where name = 'Sandía' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Melón', null, null, 'Frutas', 'fruta', false, 34, 0.8, 8.2, 0.2, 0.9, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Melón' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza en trozos', 160, true from public.foods where name = 'Melón' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Guayaba', null, null, 'Frutas', 'fruta', false, 68, 2.6, 14.3, 1, 5.4, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Guayaba' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 55, true from public.foods where name = 'Guayaba' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Kiwi', null, null, 'Frutas', 'fruta', false, 61, 1.1, 14.7, 0.5, 3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Kiwi' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 69, true from public.foods where name = 'Kiwi' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pera', null, null, 'Frutas', 'fruta', false, 57, 0.4, 15.2, 0.1, 3.1, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pera' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 178, true from public.foods where name = 'Pera' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Melocotón', null, null, 'Frutas', 'fruta', false, 39, 0.9, 9.5, 0.3, 1.5, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Melocotón' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 150, true from public.foods where name = 'Melocotón' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Arándanos', null, null, 'Frutas', 'fruta', false, 57, 0.7, 14.5, 0.3, 2.4, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Arándanos' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 148, true from public.foods where name = 'Arándanos' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Moras', null, null, 'Frutas', 'fruta', false, 43, 1.4, 9.6, 0.5, 5.3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Moras' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 144, true from public.foods where name = 'Moras' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Frambuesas', null, null, 'Frutas', 'fruta', false, 52, 1.2, 11.9, 0.7, 6.5, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Frambuesas' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 123, true from public.foods where name = 'Frambuesas' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Maracuyá', null, null, 'Frutas', 'fruta', false, 97, 2.2, 23.4, 0.7, 10.4, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Maracuyá' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 18, true from public.foods where name = 'Maracuyá' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Guanábana', null, null, 'Frutas', 'fruta', false, 66, 1, 16.8, 0.3, 3.3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Guanábana' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 225, true from public.foods where name = 'Guanábana' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Limón', null, null, 'Frutas', 'fruta', false, 29, 1.1, 9.3, 0.3, 2.8, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Limón' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 58, true from public.foods where name = 'Limón' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Ciruela', null, null, 'Frutas', 'fruta', false, 46, 0.7, 11.4, 0.3, 1.4, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Ciruela' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 66, true from public.foods where name = 'Ciruela' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Cerezas', null, null, 'Frutas', 'fruta', false, 63, 1.1, 16, 0.2, 2.1, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Cerezas' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 138, true from public.foods where name = 'Cerezas' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pitahaya', null, null, 'Frutas', 'fruta', false, 60, 1.2, 13, 0.4, 3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pitahaya' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza en trozos', 140, true from public.foods where name = 'Pitahaya' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Dátiles', null, null, 'Frutas', 'fruta', false, 277, 1.8, 75, 0.2, 6.7, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Dátiles' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 24, true from public.foods where name = 'Dátiles' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pasas', null, null, 'Frutas', 'fruta', false, 299, 3.1, 79.2, 0.5, 3.7, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pasas' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 9, true from public.foods where name = 'Pasas' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/4 taza', 36, false from public.foods where name = 'Pasas' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Lechuga', null, null, 'Vegetales', 'vegetal', false, 17, 1.2, 3.3, 0.3, 2.1, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Lechuga' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 47, true from public.foods where name = 'Lechuga' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Tomate', null, null, 'Vegetales', 'vegetal', false, 18, 0.9, 3.9, 0.2, 1.2, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Tomate' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 123, true from public.foods where name = 'Tomate' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza picado', 180, false from public.foods where name = 'Tomate' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pepino', null, null, 'Vegetales', 'vegetal', false, 15, 0.7, 3.6, 0.1, 0.5, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pepino' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza en rodajas', 104, true from public.foods where name = 'Pepino' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 300, false from public.foods where name = 'Pepino' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Zanahoria', null, 'crudo', 'Vegetales', 'vegetal', false, 41, 0.9, 9.6, 0.2, 2.8, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Zanahoria' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 61, true from public.foods where name = 'Zanahoria' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza rallada', 110, false from public.foods where name = 'Zanahoria' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Zanahoria', null, 'cocido', 'Vegetales', 'vegetal', false, 35, 0.8, 8.2, 0.2, 3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Zanahoria' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 156, true from public.foods where name = 'Zanahoria' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 78, false from public.foods where name = 'Zanahoria' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Brócoli', null, 'crudo', 'Vegetales', 'vegetal', false, 34, 2.8, 6.6, 0.4, 2.6, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Brócoli' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 91, true from public.foods where name = 'Brócoli' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Brócoli', null, 'cocido', 'Vegetales', 'vegetal', false, 35, 2.4, 7.2, 0.4, 3.3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Brócoli' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 156, true from public.foods where name = 'Brócoli' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 78, false from public.foods where name = 'Brócoli' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Coliflor', null, 'crudo', 'Vegetales', 'vegetal', false, 25, 1.9, 5, 0.3, 2, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Coliflor' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 107, true from public.foods where name = 'Coliflor' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Coliflor', null, 'cocido', 'Vegetales', 'vegetal', false, 23, 1.8, 4.1, 0.5, 2.3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Coliflor' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 124, true from public.foods where name = 'Coliflor' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Chayote', null, 'cocido', 'Vegetales', 'vegetal', false, 24, 0.6, 5.1, 0.5, 2.8, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Chayote' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 160, true from public.foods where name = 'Chayote' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 80, false from public.foods where name = 'Chayote' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Ayote tierno', null, 'cocido', 'Vegetales', 'vegetal', false, 20, 0.9, 4.3, 0.3, 1.4, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Ayote tierno' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 180, true from public.foods where name = 'Ayote tierno' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Ayote sazón', null, 'cocido', 'Vegetales', 'vegetal', false, 40, 0.9, 10.5, 0.1, 3.2, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Ayote sazón' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 205, true from public.foods where name = 'Ayote sazón' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 102, false from public.foods where name = 'Ayote sazón' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Zucchini', null, 'crudo', 'Vegetales', 'vegetal', false, 17, 1.2, 3.1, 0.3, 1, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Zucchini' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 124, true from public.foods where name = 'Zucchini' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 196, false from public.foods where name = 'Zucchini' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Repollo', null, 'crudo', 'Vegetales', 'vegetal', false, 25, 1.3, 5.8, 0.1, 2.5, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Repollo' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza picado', 89, true from public.foods where name = 'Repollo' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pimiento verde', null, null, 'Vegetales', 'vegetal', false, 20, 0.9, 4.6, 0.2, 1.7, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pimiento verde' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 119, true from public.foods where name = 'Pimiento verde' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/4 taza', 37, false from public.foods where name = 'Pimiento verde' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Apio', null, null, 'Vegetales', 'vegetal', false, 16, 0.7, 3, 0.2, 1.6, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Apio' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'tallo', 40, true from public.foods where name = 'Apio' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza picado', 101, false from public.foods where name = 'Apio' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Berenjena', null, 'cocido', 'Vegetales', 'vegetal', false, 35, 0.8, 8.7, 0.2, 2.5, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Berenjena' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 99, true from public.foods where name = 'Berenjena' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Remolacha', null, 'cocido', 'Vegetales', 'vegetal', false, 44, 1.7, 10, 0.2, 2, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Remolacha' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 170, true from public.foods where name = 'Remolacha' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 85, false from public.foods where name = 'Remolacha' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Rábano', null, null, 'Vegetales', 'vegetal', false, 16, 0.7, 3.4, 0.1, 1.6, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Rábano' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 116, true from public.foods where name = 'Rábano' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Palmito', null, null, 'Vegetales', 'vegetal', false, 28, 2.5, 4.6, 0.6, 2.4, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Palmito' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 33, true from public.foods where name = 'Palmito' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Espárragos', null, 'cocido', 'Vegetales', 'vegetal', false, 22, 2.4, 4.1, 0.2, 2, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Espárragos' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 180, true from public.foods where name = 'Espárragos' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 15, false from public.foods where name = 'Espárragos' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Kale', null, 'crudo', 'Vegetales', 'vegetal', false, 35, 2.9, 4.4, 1.5, 4.1, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Kale' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 21, true from public.foods where name = 'Kale' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Vainicas', null, 'cocido', 'Vegetales', 'vegetal', false, 35, 1.9, 7.9, 0.3, 3.2, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Vainicas' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 62, true from public.foods where name = 'Vainicas' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 125, false from public.foods where name = 'Vainicas' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Papa', null, 'crudo', 'Tubérculos y harinosos', 'carbohidrato', false, 77, 2, 17.5, 0.1, 2.1, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Papa' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad mediana', 213, true from public.foods where name = 'Papa' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Camote', null, 'cocido', 'Tubérculos y harinosos', 'carbohidrato', false, 76, 1.4, 17.7, 0.1, 2.5, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Camote' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 164, true from public.foods where name = 'Camote' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 151, false from public.foods where name = 'Camote' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Yuca', null, 'crudo', 'Tubérculos y harinosos', 'carbohidrato', false, 160, 1.4, 38.1, 0.3, 1.8, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Yuca' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 206, true from public.foods where name = 'Yuca' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Plátano maduro', null, 'crudo', 'Tubérculos y harinosos', 'carbohidrato', false, 122, 1.3, 31.9, 0.4, 2.3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Plátano maduro' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 179, true from public.foods where name = 'Plátano maduro' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 unidad', 90, false from public.foods where name = 'Plátano maduro' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Plátano verde', null, 'cocido', 'Tubérculos y harinosos', 'carbohidrato', false, 116, 0.8, 31.2, 0.2, 2.3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Plátano verde' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza en rodajas', 154, true from public.foods where name = 'Plátano verde' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Elote (maíz dulce)', null, 'cocido', 'Tubérculos y harinosos', 'carbohidrato', false, 96, 3.4, 21, 1.5, 2.4, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Elote (maíz dulce)' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza de granos', 164, true from public.foods where name = 'Elote (maíz dulce)' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'mazorca', 100, false from public.foods where name = 'Elote (maíz dulce)' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Arroz blanco', null, 'crudo', 'Cereales', 'carbohidrato', false, 365, 7.1, 80, 0.7, 1.3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Arroz blanco' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/4 taza', 46, true from public.foods where name = 'Arroz blanco' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Arroz integral', null, 'cocido', 'Cereales', 'carbohidrato', false, 112, 2.3, 23.5, 0.8, 1.8, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Arroz integral' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 98, true from public.foods where name = 'Arroz integral' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 195, false from public.foods where name = 'Arroz integral' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Avena en hojuelas', null, 'crudo', 'Cereales', 'carbohidrato', false, 379, 13.2, 67.7, 6.5, 10.1, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Avena en hojuelas' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 40, true from public.foods where name = 'Avena en hojuelas' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 5, false from public.foods where name = 'Avena en hojuelas' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pasta', null, 'cocido', 'Cereales', 'carbohidrato', false, 158, 5.8, 30.9, 0.9, 1.8, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pasta' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 140, true from public.foods where name = 'Pasta' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 70, false from public.foods where name = 'Pasta' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pasta', null, 'crudo', 'Cereales', 'carbohidrato', false, 371, 13, 74.7, 1.5, 3.2, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pasta' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción', 56, true from public.foods where name = 'Pasta' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Quinoa', null, 'cocido', 'Cereales', 'carbohidrato', false, 120, 4.4, 21.3, 1.9, 2.8, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Quinoa' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 92, true from public.foods where name = 'Quinoa' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 185, false from public.foods where name = 'Quinoa' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Cereal de maíz (corn flakes)', null, null, 'Cereales', 'carbohidrato', false, 357, 7.5, 84.1, 0.4, 3.3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Cereal de maíz (corn flakes)' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 28, true from public.foods where name = 'Cereal de maíz (corn flakes)' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pan blanco', null, null, 'Panes y tortillas', 'carbohidrato', false, 266, 7.6, 49.4, 3.3, 2.7, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pan blanco' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'rebanada', 25, true from public.foods where name = 'Pan blanco' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pan integral', null, null, 'Panes y tortillas', 'carbohidrato', false, 252, 12.4, 42.7, 3.5, 6, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pan integral' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'rebanada', 32, true from public.foods where name = 'Pan integral' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Tortilla de maíz', null, null, 'Panes y tortillas', 'carbohidrato', false, 218, 5.7, 44.6, 2.9, 6.3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Tortilla de maíz' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 30, true from public.foods where name = 'Tortilla de maíz' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Frijoles rojos', null, 'cocido', 'Leguminosas', 'carbohidrato', true, 127, 8.7, 22.8, 0.5, 7.4, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Frijoles rojos' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 89, true from public.foods where name = 'Frijoles rojos' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Frijoles blancos', null, 'cocido', 'Leguminosas', 'carbohidrato', true, 139, 9.7, 25.1, 0.4, 6.3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Frijoles blancos' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 90, true from public.foods where name = 'Frijoles blancos' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Frijoles negros', null, 'crudo', 'Leguminosas', 'carbohidrato', true, 341, 21.6, 62.4, 1.4, 15.5, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Frijoles negros' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/4 taza', 48, true from public.foods where name = 'Frijoles negros' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Lentejas', null, 'cocido', 'Leguminosas', 'carbohidrato', true, 116, 9, 20.1, 0.4, 7.9, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Lentejas' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 99, true from public.foods where name = 'Lentejas' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Lentejas', null, 'crudo', 'Leguminosas', 'carbohidrato', true, 352, 24.6, 63.4, 1.1, 10.7, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Lentejas' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/4 taza', 48, true from public.foods where name = 'Lentejas' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Garbanzos', null, 'cocido', 'Leguminosas', 'carbohidrato', true, 164, 8.9, 27.4, 2.6, 7.6, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Garbanzos' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 82, true from public.foods where name = 'Garbanzos' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Garbanzos', null, 'crudo', 'Leguminosas', 'carbohidrato', true, 378, 20.5, 63, 6, 12.2, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Garbanzos' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/4 taza', 50, true from public.foods where name = 'Garbanzos' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Almendras', null, null, 'Semillas y frutos secos', 'grasa', false, 579, 21.2, 21.6, 49.9, 12.5, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Almendras' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'puñado (28 g)', 28, true from public.foods where name = 'Almendras' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 1.2, false from public.foods where name = 'Almendras' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 9, false from public.foods where name = 'Almendras' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Nueces', null, null, 'Semillas y frutos secos', 'grasa', false, 654, 15.2, 13.7, 65.2, 6.7, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Nueces' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'puñado (28 g)', 28, true from public.foods where name = 'Nueces' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'mitad', 2.5, false from public.foods where name = 'Nueces' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Maní tostado', null, null, 'Semillas y frutos secos', 'grasa', false, 585, 24.4, 21.3, 49.7, 8, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Maní tostado' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'puñado (28 g)', 28, true from public.foods where name = 'Maní tostado' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 9, false from public.foods where name = 'Maní tostado' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pistachos', null, null, 'Semillas y frutos secos', 'grasa', false, 560, 20.2, 27.2, 45.3, 10.6, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pistachos' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'puñado (28 g)', 28, true from public.foods where name = 'Pistachos' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 0.7, false from public.foods where name = 'Pistachos' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Macadamia', null, null, 'Semillas y frutos secos', 'grasa', false, 718, 7.9, 13.8, 75.8, 8.6, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Macadamia' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'puñado (28 g)', 28, true from public.foods where name = 'Macadamia' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Avellanas', null, null, 'Semillas y frutos secos', 'grasa', false, 628, 15, 16.7, 60.8, 9.7, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Avellanas' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'puñado (28 g)', 28, true from public.foods where name = 'Avellanas' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pecanas', null, null, 'Semillas y frutos secos', 'grasa', false, 691, 9.2, 13.9, 72, 9.6, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pecanas' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'puñado (28 g)', 28, true from public.foods where name = 'Pecanas' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Semillas de chía', null, null, 'Semillas y frutos secos', 'grasa', false, 486, 16.5, 42.1, 30.7, 34.4, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Semillas de chía' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 12, true from public.foods where name = 'Semillas de chía' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Linaza', null, null, 'Semillas y frutos secos', 'grasa', false, 534, 18.3, 28.9, 42.2, 27.3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Linaza' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 10, true from public.foods where name = 'Linaza' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Semillas de girasol', null, null, 'Semillas y frutos secos', 'grasa', false, 584, 20.8, 20, 51.5, 8.6, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Semillas de girasol' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 9, true from public.foods where name = 'Semillas de girasol' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/4 taza', 35, false from public.foods where name = 'Semillas de girasol' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Semillas de calabaza', null, null, 'Semillas y frutos secos', 'grasa', false, 559, 30.2, 10.7, 49.1, 6, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Semillas de calabaza' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 8, true from public.foods where name = 'Semillas de calabaza' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/4 taza', 32, false from public.foods where name = 'Semillas de calabaza' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Ajonjolí', null, null, 'Semillas y frutos secos', 'grasa', false, 573, 17.7, 23.4, 49.7, 11.8, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Ajonjolí' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 9, true from public.foods where name = 'Ajonjolí' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Mantequilla de maní', null, null, 'Semillas y frutos secos', 'grasa', false, 588, 25.1, 20, 50.4, 6, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Mantequilla de maní' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 16, true from public.foods where name = 'Mantequilla de maní' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 5, false from public.foods where name = 'Mantequilla de maní' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Coco rallado', null, null, 'Semillas y frutos secos', 'grasa', false, 354, 3.3, 15.2, 33.5, 9, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Coco rallado' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 5, true from public.foods where name = 'Coco rallado' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 80, false from public.foods where name = 'Coco rallado' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Aguacate', null, null, 'Aceites y grasas', 'grasa', false, 160, 2, 8.5, 14.7, 6.7, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Aguacate' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '2 cucharadas', 35, true from public.foods where name = 'Aguacate' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad (Hass)', 136, false from public.foods where name = 'Aguacate' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Aceite de oliva', null, null, 'Aceites y grasas', 'grasa', false, 884, 0, 0, 100, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Aceite de oliva' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 4.5, true from public.foods where name = 'Aceite de oliva' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 13.5, false from public.foods where name = 'Aceite de oliva' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Aceite vegetal', null, null, 'Aceites y grasas', 'grasa', false, 884, 0, 0, 100, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Aceite vegetal' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 4.5, true from public.foods where name = 'Aceite vegetal' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 13.5, false from public.foods where name = 'Aceite vegetal' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Mantequilla', null, null, 'Aceites y grasas', 'grasa', false, 717, 0.9, 0.1, 81.1, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Mantequilla' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 5, true from public.foods where name = 'Mantequilla' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 14, false from public.foods where name = 'Mantequilla' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Mayonesa', null, null, 'Aceites y grasas', 'grasa', false, 680, 1, 0.6, 74.9, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Mayonesa' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 14, true from public.foods where name = 'Mayonesa' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 5, false from public.foods where name = 'Mayonesa' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Queso crema', null, null, 'Aceites y grasas', 'grasa', false, 342, 5.9, 4.1, 34.2, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Queso crema' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 14.5, true from public.foods where name = 'Queso crema' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Aceitunas', null, null, 'Aceites y grasas', 'grasa', false, 115, 0.8, 6.3, 10.7, 3.2, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Aceitunas' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 4.4, true from public.foods where name = 'Aceitunas' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Pechuga de pollo', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 165, 31, 0, 3.6, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pechuga de pollo' and brand is null and state is not distinct from 'cocido');

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Muslo de pollo sin piel', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 179, 24.8, 0, 8.2, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Muslo de pollo sin piel' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 52, true from public.foods where name = 'Muslo de pollo sin piel' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Carne molida de res 90/10', null, 'crudo', 'Carnes, pescados y huevo', 'proteina', false, 176, 20, 0, 10, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Carne molida de res 90/10' and brand is null and state is not distinct from 'crudo');

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Carne molida de res 90/10', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 217, 26.1, 0, 11.7, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Carne molida de res 90/10' and brand is null and state is not distinct from 'cocido');

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Lomo de cerdo', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 143, 26.2, 0, 3.5, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Lomo de cerdo' and brand is null and state is not distinct from 'cocido');

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Tilapia', null, 'crudo', 'Carnes, pescados y huevo', 'proteina', false, 96, 20.1, 0, 1.7, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Tilapia' and brand is null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'filete', 87, true from public.foods where name = 'Tilapia' and brand is null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Tilapia', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 128, 26.2, 0, 2.7, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Tilapia' and brand is null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'filete', 87, true from public.foods where name = 'Tilapia' and brand is null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Salmón', null, 'crudo', 'Carnes, pescados y huevo', 'proteina', false, 208, 20.4, 0, 13.4, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Salmón' and brand is null and state is not distinct from 'crudo');

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Salmón', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 206, 22.1, 0, 12.4, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Salmón' and brand is null and state is not distinct from 'cocido');

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Atún en agua (escurrido)', null, null, 'Carnes, pescados y huevo', 'proteina', false, 116, 25.5, 0, 0.8, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Atún en agua (escurrido)' and brand is null and state is not distinct from null);

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Clara de huevo', null, null, 'Carnes, pescados y huevo', 'proteina', false, 52, 10.9, 0.7, 0.2, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Clara de huevo' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 33, true from public.foods where name = 'Clara de huevo' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Queso mozzarella', null, null, 'Quesos', 'proteina', false, 300, 22.2, 2.2, 22.4, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Queso mozzarella' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'rebanada', 28, true from public.foods where name = 'Queso mozzarella' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Queso cottage bajo en grasa', null, null, 'Quesos', 'proteina', false, 81, 10.5, 4.8, 2.3, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Queso cottage bajo en grasa' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 113, true from public.foods where name = 'Queso cottage bajo en grasa' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Tofu firme', null, null, 'Carnes, pescados y huevo', 'proteina', false, 144, 17.3, 2.8, 8.7, 2.3, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Tofu firme' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción', 85, true from public.foods where name = 'Tofu firme' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Leche entera', null, null, 'Lácteos', 'lacteo', false, 61, 3.2, 4.8, 3.3, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Leche entera' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza (240 ml)', 244, true from public.foods where name = 'Leche entera' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Leche semidescremada', null, null, 'Lácteos', 'lacteo', false, 50, 3.3, 4.8, 2, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Leche semidescremada' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza (240 ml)', 244, true from public.foods where name = 'Leche semidescremada' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Leche descremada', null, null, 'Lácteos', 'lacteo', false, 34, 3.4, 5, 0.1, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Leche descremada' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza (240 ml)', 245, true from public.foods where name = 'Leche descremada' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Yogur natural entero', null, null, 'Lácteos', 'lacteo', false, 61, 3.5, 4.7, 3.3, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Yogur natural entero' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 245, true from public.foods where name = 'Yogur natural entero' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'envase', 170, false from public.foods where name = 'Yogur natural entero' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Yogur griego natural descremado', null, null, 'Lácteos', 'lacteo', false, 59, 10.2, 3.6, 0.4, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Yogur griego natural descremado' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'envase', 170, true from public.foods where name = 'Yogur griego natural descremado' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Yogur griego natural entero', null, null, 'Lácteos', 'lacteo', false, 97, 9, 4, 5, 0, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Yogur griego natural entero' and brand is null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'envase', 170, true from public.foods where name = 'Yogur griego natural entero' and brand is null and state is not distinct from null
on conflict (food_id, label) do nothing;

-- Genéricos que estaban estimados desde Fitia: pasan a valores de tabla
update public.foods set kcal = 130, protein = 2.7, carbs = 28.2, fat = 0.3, fiber = 0.4, source = 'tabla', verified = true
 where name = 'Arroz Blanco' and brand is null and state is not distinct from 'cocido' and source = 'estimado';
update public.foods set kcal = 132, protein = 8.9, carbs = 23.7, fat = 0.5, fiber = 8.7, source = 'tabla', verified = true
 where name = 'Frijoles Negros' and brand is null and state is not distinct from 'cocido' and source = 'estimado';
update public.foods set kcal = 143, protein = 12.6, carbs = 0.7, fat = 9.5, fiber = 0, source = 'tabla', verified = true
 where name = 'Huevo' and brand is null and state is not distinct from null and source = 'estimado';
update public.foods set kcal = 89, protein = 1.1, carbs = 22.8, fat = 0.3, fiber = 2.6, source = 'tabla', verified = true
 where name = 'Banano' and brand is null and state is not distinct from null and source = 'estimado';
update public.foods set kcal = 58, protein = 0.4, carbs = 13.6, fat = 0.2, fiber = 2.8, source = 'tabla', verified = true
 where name = 'Manzana Verde' and brand is null and state is not distinct from null and source = 'estimado';
update public.foods set kcal = 553, protein = 18.2, carbs = 30.2, fat = 43.9, fiber = 3.3, source = 'tabla', verified = true
 where name = 'Marañón' and brand is null and state is not distinct from null and source = 'estimado';
update public.foods set kcal = 23, protein = 2.9, carbs = 3.6, fat = 0.4, fiber = 2.2, source = 'tabla', verified = true
 where name = 'Espinaca' and brand is null and state is not distinct from null and source = 'estimado';
update public.foods set kcal = 40, protein = 1.1, carbs = 9.3, fat = 0.1, fiber = 1.7, source = 'tabla', verified = true
 where name = 'Cebolla' and brand is null and state is not distinct from null and source = 'estimado';
update public.foods set kcal = 31, protein = 1, carbs = 6, fat = 0.3, fiber = 2.1, source = 'tabla', verified = true
 where name = 'Pimiento Rojo' and brand is null and state is not distinct from null and source = 'estimado';
update public.foods set kcal = 22, protein = 3.1, carbs = 3.3, fat = 0.3, fiber = 1, source = 'tabla', verified = true
 where name = 'Champiñones' and brand is null and state is not distinct from null and source = 'estimado';
update public.foods set kcal = 31, protein = 1.8, carbs = 7, fat = 0.2, fiber = 2.7, source = 'tabla', verified = true
 where name = 'Vainicas' and brand is null and state is not distinct from null and source = 'estimado';
update public.foods set kcal = 86, protein = 1.7, carbs = 20, fat = 0.1, fiber = 1.8, source = 'tabla', verified = true
 where name = 'Papa' and brand is null and state is not distinct from 'cocido' and source = 'estimado';
update public.foods set kcal = 120, protein = 22.5, carbs = 0, fat = 2.6, fiber = 0, source = 'tabla', verified = true
 where name = 'Pollo (pechuga)' and brand is null and state is not distinct from 'crudo' and source = 'estimado';
update public.foods set kcal = 99, protein = 24, carbs = 0.2, fat = 0.3, fiber = 0, source = 'tabla', verified = true
 where name = 'Camarones' and brand is null and state is not distinct from 'cocido' and source = 'estimado';
commit;
