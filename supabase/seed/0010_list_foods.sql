-- Alimentos de la lista de intercambio de la nutricionista. Generado por scripts/build-list-seed.mjs.
-- Ejecutar después de 0009_combined_engine.sql.
begin;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Tiquizque', null, 'cocido', 'Tubérculos y harinosos', 'carbohidrato', false, 142, 0.5, 34.6, 0.1, 5.1, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Tiquizque' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 66, true from public.foods where name = 'Tiquizque' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Ñampí', null, 'cocido', 'Tubérculos y harinosos', 'carbohidrato', false, 142, 0.5, 34.6, 0.1, 5.1, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Ñampí' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 66, true from public.foods where name = 'Ñampí' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Ñame', null, 'cocido', 'Tubérculos y harinosos', 'carbohidrato', false, 116, 1.5, 27.5, 0.1, 3.9, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Ñame' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 68, true from public.foods where name = 'Ñame' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yuca', null, 'cocido', 'Tubérculos y harinosos', 'carbohidrato', false, 125, 0.6, 30.1, 0.3, 1.6, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Yuca' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 70, true from public.foods where name = 'Yuca' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'trozo (4 dedos)', 60, false from public.foods where name = 'Yuca' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Arvejas', null, 'cocido', 'Leguminosas', 'carbohidrato', true, 84, 5.4, 15.6, 0.2, 5.5, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Arvejas' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 80, true from public.foods where name = 'Arvejas' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Edamame', null, 'cocido', 'Leguminosas', 'proteina', false, 121, 11.9, 8.9, 5.2, 5.2, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Edamame' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 78, true from public.foods where name = 'Edamame' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Hummus', null, null, 'Leguminosas', 'proteina', false, 166, 7.9, 14.3, 9.6, 6, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Hummus' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/3 taza', 82, true from public.foods where name = 'Hummus' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 15, false from public.foods where name = 'Hummus' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Pan pita', null, null, 'Panes y tortillas', 'carbohidrato', false, 275, 9.1, 55.7, 1.2, 2.2, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pan pita' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 60, true from public.foods where name = 'Pan pita' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Pan para hamburguesa', null, null, 'Panes y tortillas', 'carbohidrato', false, 279, 9.5, 49.4, 4.3, 2.1, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pan para hamburguesa' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 55, true from public.foods where name = 'Pan para hamburguesa' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Higos frescos', null, null, 'Frutas', 'fruta', false, 74, 0.8, 19.2, 0.3, 2.9, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Higos frescos' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad mediana', 50, true from public.foods where name = 'Higos frescos' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Toronja', null, null, 'Frutas', 'fruta', false, 42, 0.8, 10.7, 0.1, 1.6, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Toronja' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 115, true from public.foods where name = 'Toronja' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Granada', null, null, 'Frutas', 'fruta', false, 83, 1.7, 18.7, 1.2, 4, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Granada' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 87, true from public.foods where name = 'Granada' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Nectarina', null, null, 'Frutas', 'fruta', false, 44, 1.1, 10.6, 0.3, 1.7, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Nectarina' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 142, true from public.foods where name = 'Nectarina' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Albaricoque', null, null, 'Frutas', 'fruta', false, 48, 1.4, 11.1, 0.4, 2, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Albaricoque' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 35, true from public.foods where name = 'Albaricoque' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Uchuvas', null, null, 'Frutas', 'fruta', false, 53, 1.9, 11.2, 0.7, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Uchuvas' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 5, true from public.foods where name = 'Uchuvas' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Zapote', null, null, 'Frutas', 'fruta', false, 124, 1.5, 32.1, 0.5, 5.4, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Zapote' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/3 taza', 58, true from public.foods where name = 'Zapote' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Carambola', null, null, 'Frutas', 'fruta', false, 31, 1, 6.7, 0.3, 2.8, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Carambola' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 91, true from public.foods where name = 'Carambola' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Anona', null, null, 'Frutas', 'fruta', false, 94, 2.1, 23.6, 0.3, 4.4, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Anona' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 155, true from public.foods where name = 'Anona' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Nísperos', null, null, 'Frutas', 'fruta', false, 47, 0.4, 12.1, 0.2, 1.7, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Nísperos' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 10, true from public.foods where name = 'Nísperos' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Chirimoya', null, null, 'Frutas', 'fruta', false, 75, 1.6, 17.7, 0.7, 3, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Chirimoya' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción (90 g)', 90, true from public.foods where name = 'Chirimoya' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Ciruela pasa', null, null, 'Frutas', 'fruta', false, 240, 2.2, 63.9, 0.4, 7.1, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Ciruela pasa' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 9.5, true from public.foods where name = 'Ciruela pasa' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Agua de pipa', null, null, 'Frutas', 'fruta', false, 19, 0.7, 3.7, 0.2, 1.1, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Agua de pipa' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (240 ml)', 240, true from public.foods where name = 'Agua de pipa' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de naranja natural', null, null, 'Frutas', 'fruta', false, 45, 0.7, 10.4, 0.2, 0.2, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de naranja natural' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, true from public.foods where name = 'Jugo de naranja natural' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'vaso (250 ml)', 248, false from public.foods where name = 'Jugo de naranja natural' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Acelga', null, 'crudo', 'Vegetales', 'vegetal', false, 19, 1.8, 3.7, 0.2, 1.6, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Acelga' and brand is not distinct from null and state is not distinct from 'crudo');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 36, true from public.foods where name = 'Acelga' and brand is not distinct from null and state is not distinct from 'crudo'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Arúgula', null, null, 'Vegetales', 'vegetal', false, 25, 2.6, 3.7, 0.7, 1.6, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Arúgula' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 20, true from public.foods where name = 'Arúgula' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Tomate cherry', null, null, 'Vegetales', 'vegetal', false, 18, 0.9, 3.9, 0.2, 1.2, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Tomate cherry' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 17, true from public.foods where name = 'Tomate cherry' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 149, false from public.foods where name = 'Tomate cherry' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Coles de Bruselas', null, 'cocido', 'Vegetales', 'vegetal', false, 36, 2.6, 7.1, 0.5, 2.6, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Coles de Bruselas' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 78, true from public.foods where name = 'Coles de Bruselas' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jícama', null, null, 'Vegetales', 'vegetal', false, 38, 0.7, 8.8, 0.1, 4.9, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jícama' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 130, true from public.foods where name = 'Jícama' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Jugo de zanahoria', null, null, 'Vegetales', 'vegetal', false, 40, 0.9, 9.3, 0.2, 0.8, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Jugo de zanahoria' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 118, true from public.foods where name = 'Jugo de zanahoria' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Pechuga de pavo', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 147, 30.1, 0, 2.1, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Pechuga de pavo' and brand is not distinct from null and state is not distinct from 'cocido');

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Bacalao', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 105, 22.8, 0, 0.9, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Bacalao' and brand is not distinct from null and state is not distinct from 'cocido');

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Trucha', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 168, 23.8, 0, 7.4, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Trucha' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'filete', 71, true from public.foods where name = 'Trucha' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Sardinas en aceite (escurridas)', null, null, 'Carnes, pescados y huevo', 'proteina', false, 208, 24.6, 0, 11.5, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Sardinas en aceite (escurridas)' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 12, true from public.foods where name = 'Sardinas en aceite (escurridas)' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Chorizo', null, null, 'Carnes, pescados y huevo', 'proteina', false, 455, 24.1, 1.9, 38.3, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Chorizo' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 60, true from public.foods where name = 'Chorizo' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Tocineta', null, 'cocido', 'Carnes, pescados y huevo', 'proteina', false, 541, 37, 1.4, 41.8, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Tocineta' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'tira', 8, true from public.foods where name = 'Tocineta' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Queso ricotta semidescremado', null, null, 'Quesos', 'proteina', false, 138, 11.4, 5.1, 7.9, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Queso ricotta semidescremado' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '2 cucharadas', 30, true from public.foods where name = 'Queso ricotta semidescremado' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 124, false from public.foods where name = 'Queso ricotta semidescremado' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Queso cheddar', null, null, 'Quesos', 'proteina', false, 403, 24.9, 1.3, 33.1, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Queso cheddar' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'rebanada', 28, true from public.foods where name = 'Queso cheddar' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Leche evaporada descremada', null, null, 'Lácteos', 'lacteo', false, 78, 7.6, 11.4, 0.2, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Leche evaporada descremada' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 128, true from public.foods where name = 'Leche evaporada descremada' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Leche en polvo descremada', null, null, 'Lácteos', 'lacteo', false, 362, 36.2, 52, 0.8, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Leche en polvo descremada' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '3 cucharadas', 21, true from public.foods where name = 'Leche en polvo descremada' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Leche en polvo entera', null, null, 'Lácteos', 'lacteo', false, 496, 26.3, 38.4, 26.7, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Leche en polvo entera' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '3 cucharadas', 24, true from public.foods where name = 'Leche en polvo entera' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Kéfir natural bajo en grasa', null, null, 'Lácteos', 'lacteo', false, 41, 3.8, 4.5, 1, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Kéfir natural bajo en grasa' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 243, true from public.foods where name = 'Kéfir natural bajo en grasa' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Leche de almendras sin azúcar', null, null, 'Bebidas vegetales', 'grasa', false, 15, 0.6, 0.3, 1.1, 0.2, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Leche de almendras sin azúcar' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza (240 ml)', 240, true from public.foods where name = 'Leche de almendras sin azúcar' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Aceite de canola', null, null, 'Aceites y grasas', 'grasa', false, 884, 0, 0, 100, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Aceite de canola' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 4.5, true from public.foods where name = 'Aceite de canola' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 13.5, false from public.foods where name = 'Aceite de canola' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Aceite de coco', null, null, 'Aceites y grasas', 'grasa', false, 892, 0, 0, 99.1, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Aceite de coco' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 4.5, true from public.foods where name = 'Aceite de coco' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 13.5, false from public.foods where name = 'Aceite de coco' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Margarina', null, null, 'Aceites y grasas', 'grasa', false, 717, 0.2, 0.7, 80.7, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Margarina' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 5, true from public.foods where name = 'Margarina' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 14, false from public.foods where name = 'Margarina' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Natilla regular', null, null, 'Aceites y grasas', 'grasa', false, 198, 2.4, 4.6, 19.4, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Natilla regular' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 15, true from public.foods where name = 'Natilla regular' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '2 cucharadas', 30, false from public.foods where name = 'Natilla regular' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Queso crema light', null, null, 'Aceites y grasas', 'grasa', false, 253, 9.2, 3.6, 22.8, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Queso crema light' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 15, true from public.foods where name = 'Queso crema light' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Azúcar blanca', null, null, 'Azúcares', 'azucar', false, 387, 0, 100, 0, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Azúcar blanca' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 4.2, true from public.foods where name = 'Azúcar blanca' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 12.5, false from public.foods where name = 'Azúcar blanca' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Azúcar morena', null, null, 'Azúcares', 'azucar', false, 380, 0.1, 98.1, 0, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Azúcar morena' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 4.6, true from public.foods where name = 'Azúcar morena' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Miel de abeja', null, null, 'Azúcares', 'azucar', false, 304, 0.3, 82.4, 0, 0.2, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Miel de abeja' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 7, true from public.foods where name = 'Miel de abeja' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 21, false from public.foods where name = 'Miel de abeja' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Mermelada', null, null, 'Azúcares', 'azucar', false, 278, 0.4, 68.9, 0.1, 1.1, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Mermelada' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 6.7, true from public.foods where name = 'Mermelada' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 20, false from public.foods where name = 'Mermelada' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Sirope de maple', null, null, 'Azúcares', 'azucar', false, 260, 0, 67, 0.1, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Sirope de maple' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 6.7, true from public.foods where name = 'Sirope de maple' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 20, false from public.foods where name = 'Sirope de maple' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Leche condensada', null, null, 'Azúcares', 'azucar', false, 321, 7.9, 54.4, 8.7, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Leche condensada' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 6.4, true from public.foods where name = 'Leche condensada' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 19, false from public.foods where name = 'Leche condensada' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Dulce de leche', null, null, 'Azúcares', 'azucar', false, 315, 6.8, 55.4, 7.4, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Dulce de leche' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 6.3, true from public.foods where name = 'Dulce de leche' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Crema de avellanas y cacao', null, null, 'Azúcares', 'azucar', false, 539, 6.3, 57.5, 30.9, 5.4, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Crema de avellanas y cacao' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharadita', 6.2, true from public.foods where name = 'Crema de avellanas y cacao' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Gelatina regular', null, null, 'Azúcares', 'azucar', false, 62, 1.2, 14.2, 0, 0, null, 'tabla', true, null
where not exists (select 1 from public.foods where name = 'Gelatina regular' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 135, true from public.foods where name = 'Gelatina regular' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Leche con calcio', 'Dos Pinos', null, 'Yogures y lácteos', 'lacteo', false, 100, 8, 12, 1.5, null, '{"lacteo":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Leche con calcio' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 100, true from public.foods where name = 'Leche con calcio' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Leche doble proteína', null, null, 'Yogures y lácteos', 'lacteo', false, 145, 15, 12, 3.5, null, '{"lacteo":1,"proteina":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Leche doble proteína' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 100, true from public.foods where name = 'Leche doble proteína' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Leche 50% + Proteína sabor coco', 'Dos Pinos', null, 'Yogures y lácteos', 'lacteo', false, 122, 11.5, 12, 2.5, null, '{"lacteo":1,"proteina":0.5}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Leche 50% + Proteína sabor coco' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Leche 50% + Proteína sabor coco' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Leche 50% + Proteína choco almendras', 'Dos Pinos', null, 'Yogures y lácteos', 'lacteo', false, 122, 11.5, 12, 2.5, null, '{"lacteo":1,"proteina":0.5}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Leche 50% + Proteína choco almendras' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Leche 50% + Proteína choco almendras' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Leche líquida light', 'Dos Pinos', null, 'Yogures y lácteos', 'lacteo', false, 120, 8, 12, 5, null, '{"lacteo":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Leche líquida light' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 100, true from public.foods where name = 'Leche líquida light' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Bio Delactomy (fresa, maracuyá, ciruela o arándano)', 'Dos Pinos', null, 'Yogures y lácteos', 'lacteo', false, 100, 8, 12, 1.5, null, '{"lacteo":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Bio Delactomy (fresa, maracuyá, ciruela o arándano)' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Bio Delactomy (fresa, maracuyá, ciruela o arándano)' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Bio Balance sabor ciruela', 'Dos Pinos', null, 'Yogures y lácteos', 'lacteo', false, 100, 8, 12, 1.5, null, '{"lacteo":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Bio Balance sabor ciruela' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 100, true from public.foods where name = 'Bio Balance sabor ciruela' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt líquido Inline Deligurt', 'Dos Pinos', null, 'Yogures y lácteos', 'lacteo', false, 100, 8, 12, 1.5, null, '{"lacteo":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt líquido Inline Deligurt' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Yogurt líquido Inline Deligurt' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt natural Inline Deligurt', 'Dos Pinos', null, 'Yogures y lácteos', 'lacteo', false, 50, 4, 6, 0.8, null, '{"lacteo":0.5}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt natural Inline Deligurt' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 100, true from public.foods where name = 'Yogurt natural Inline Deligurt' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt líquido griego plus', 'Dos Pinos', null, 'Yogures y lácteos', 'lacteo', false, 190, 22, 12, 5.5, null, '{"lacteo":1,"proteina":2}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt líquido griego plus' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Yogurt líquido griego plus' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt griego plus (piña-mora o vainilla)', 'Dos Pinos', null, 'Yogures y lácteos', 'lacteo', false, 190, 22, 12, 5.5, null, '{"lacteo":1,"proteina":2}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt griego plus (piña-mora o vainilla)' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Yogurt griego plus (piña-mora o vainilla)' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt griego sabor fresa', 'Dos Pinos', null, 'Yogures y lácteos', 'lacteo', false, 162, 11.5, 22, 2.5, null, '{"lacteo":1,"proteina":0.5,"azucar":2}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt griego sabor fresa' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Yogurt griego sabor fresa' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt griego (mora o arándanos)', 'Nikkos', null, 'Yogures y lácteos', 'lacteo', false, 95, 11, 6, 2.8, null, '{"lacteo":0.5,"proteina":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt griego (mora o arándanos)' and brand is not distinct from 'Nikkos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Yogurt griego (mora o arándanos)' and brand is not distinct from 'Nikkos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt griego sabor maracuyá', 'Nikkos', null, 'Yogures y lácteos', 'lacteo', false, 122, 11.5, 12, 2.5, null, '{"lacteo":1,"proteina":0.5}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt griego sabor maracuyá' and brand is not distinct from 'Nikkos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Yogurt griego sabor maracuyá' and brand is not distinct from 'Nikkos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt griego descremado natural', 'Nikkos', null, 'Yogures y lácteos', 'lacteo', false, 95, 11, 6, 2.8, null, '{"lacteo":0.5,"proteina":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt griego descremado natural' and brand is not distinct from 'Nikkos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Yogurt griego descremado natural' and brand is not distinct from 'Nikkos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt fit griego sabor coco', 'Nikkos', null, 'Yogures y lácteos', 'lacteo', false, 168, 18.5, 12, 4.5, null, '{"lacteo":1,"proteina":1.5}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt fit griego sabor coco' and brand is not distinct from 'Nikkos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Yogurt fit griego sabor coco' and brand is not distinct from 'Nikkos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt fit griego sabor limón', 'Nikkos', null, 'Yogures y lácteos', 'lacteo', false, 190, 22, 12, 5.5, null, '{"lacteo":1,"proteina":2}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt fit griego sabor limón' and brand is not distinct from 'Nikkos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Yogurt fit griego sabor limón' and brand is not distinct from 'Nikkos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt líquido fit con proteína chocolate', 'Nikkos', null, 'Yogures y lácteos', 'lacteo', false, 245, 23, 24, 5, null, '{"lacteo":2,"proteina":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt líquido fit con proteína chocolate' and brand is not distinct from 'Nikkos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Yogurt líquido fit con proteína chocolate' and brand is not distinct from 'Nikkos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt light (frutas, guanábana o fresa)', 'Pops', null, 'Yogures y lácteos', 'lacteo', false, 100, 8, 12, 1.5, null, '{"lacteo":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt light (frutas, guanábana o fresa)' and brand is not distinct from 'Pops' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Yogurt light (frutas, guanábana o fresa)' and brand is not distinct from 'Pops' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt griego natural', 'Member''s Selection', null, 'Yogures y lácteos', 'lacteo', false, 145, 15, 12, 3.5, null, '{"lacteo":1,"proteina":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt griego natural' and brand is not distinct from 'Member''s Selection' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 100, true from public.foods where name = 'Yogurt griego natural' and brand is not distinct from 'Member''s Selection' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt griego vainilla', 'Member''s Selection', null, 'Yogures y lácteos', 'lacteo', false, 165, 15, 17, 3.5, null, '{"lacteo":1,"proteina":1,"azucar":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt griego vainilla' and brand is not distinct from 'Member''s Selection' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 100, true from public.foods where name = 'Yogurt griego vainilla' and brand is not distinct from 'Member''s Selection' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Griego natural sin azúcar', 'Yes', null, 'Yogures y lácteos', 'lacteo', false, 122, 11.5, 12, 2.5, null, '{"lacteo":1,"proteina":0.5}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Griego natural sin azúcar' and brand is not distinct from 'Yes' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Griego natural sin azúcar' and brand is not distinct from 'Yes' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Yogurt líquido light de fresa', 'Yes', null, 'Yogures y lácteos', 'lacteo', false, 100, 8, 12, 1.5, null, '{"lacteo":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Yogurt líquido light de fresa' and brand is not distinct from 'Yes' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Yogurt líquido light de fresa' and brand is not distinct from 'Yes' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Helado + Proteína (chocolate o coco)', 'Dos Pinos', null, 'Helados', 'lacteo', false, 100, 8, 12, 1.5, null, '{"lacteo":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Helado + Proteína (chocolate o coco)' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 100, true from public.foods where name = 'Helado + Proteína (chocolate o coco)' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Paleta + Proteína dulce de leche con turrón', 'Dos Pinos', null, 'Helados', 'lacteo', false, 100, 8, 12, 1.5, null, '{"lacteo":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Paleta + Proteína dulce de leche con turrón' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Paleta + Proteína dulce de leche con turrón' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Frijoles molidos negros', 'Ducal', null, 'Leguminosas', 'carbohidrato', false, 125, 3, 15, 6, null, '{"carbohidrato":1,"grasa":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Frijoles molidos negros' and brand is not distinct from 'Ducal' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 100, true from public.foods where name = 'Frijoles molidos negros' and brand is not distinct from 'Ducal' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Frijoles molidos negros', 'La Chula', null, 'Leguminosas', 'carbohidrato', false, 80, 3, 15, 1, null, '{"carbohidrato":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Frijoles molidos negros' and brand is not distinct from 'La Chula' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 100, true from public.foods where name = 'Frijoles molidos negros' and brand is not distinct from 'La Chula' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Frijoles molidos rojos', 'Tío Pelón', null, 'Leguminosas', 'grasa', false, 85, 1.5, 7.5, 5.5, null, '{"carbohidrato":0.5,"grasa":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Frijoles molidos rojos' and brand is not distinct from 'Tío Pelón' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 100, true from public.foods where name = 'Frijoles molidos rojos' and brand is not distinct from 'Tío Pelón' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Barrita de cereal Lyne', 'Tosh', null, 'Snacks', 'carbohidrato', false, 80, 3, 15, 1, null, '{"carbohidrato":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Barrita de cereal Lyne' and brand is not distinct from 'Tosh' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'barrita', 100, true from public.foods where name = 'Barrita de cereal Lyne' and brand is not distinct from 'Tosh' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Barrita de granola uchuva y almendras sin azúcar', 'Nutri Snacks', null, 'Snacks', 'carbohidrato', false, 102, 3, 15, 3.5, null, '{"carbohidrato":1,"grasa":0.5}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Barrita de granola uchuva y almendras sin azúcar' and brand is not distinct from 'Nutri Snacks' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'barrita', 100, true from public.foods where name = 'Barrita de granola uchuva y almendras sin azúcar' and brand is not distinct from 'Nutri Snacks' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Barrita de granola sabor caramelo sin azúcar', 'Nutri Snacks', null, 'Snacks', 'carbohidrato', false, 80, 3, 15, 1, null, '{"carbohidrato":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Barrita de granola sabor caramelo sin azúcar' and brand is not distinct from 'Nutri Snacks' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'barrita', 100, true from public.foods where name = 'Barrita de granola sabor caramelo sin azúcar' and brand is not distinct from 'Nutri Snacks' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Barrita de granola maracuyá y chía sin azúcar', 'Nutri Snacks', null, 'Snacks', 'carbohidrato', false, 80, 3, 15, 1, null, '{"carbohidrato":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Barrita de granola maracuyá y chía sin azúcar' and brand is not distinct from 'Nutri Snacks' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'barrita', 100, true from public.foods where name = 'Barrita de granola maracuyá y chía sin azúcar' and brand is not distinct from 'Nutri Snacks' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Galleta manzana-canela sin azúcar', 'Nutri Snacks', null, 'Snacks', 'carbohidrato', false, 102, 3, 15, 3.5, null, '{"carbohidrato":1,"grasa":0.5}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Galleta manzana-canela sin azúcar' and brand is not distinct from 'Nutri Snacks' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Galleta manzana-canela sin azúcar' and brand is not distinct from 'Nutri Snacks' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Galleta choco macadamia sin azúcar', 'Nutri Snacks', null, 'Snacks', 'carbohidrato', false, 102, 3, 15, 3.5, null, '{"carbohidrato":1,"grasa":0.5}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Galleta choco macadamia sin azúcar' and brand is not distinct from 'Nutri Snacks' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Galleta choco macadamia sin azúcar' and brand is not distinct from 'Nutri Snacks' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Galleta Soda', 'Pozuelo', null, 'Snacks', 'carbohidrato', false, 102, 3, 15, 3.5, null, '{"carbohidrato":1,"grasa":0.5}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Galleta Soda' and brand is not distinct from 'Pozuelo' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'paquete', 100, true from public.foods where name = 'Galleta Soda' and brand is not distinct from 'Pozuelo' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Galleta integral con ajonjolí', 'Tosh', null, 'Snacks', 'carbohidrato', false, 102, 3, 15, 3.5, null, '{"carbohidrato":1,"grasa":0.5}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Galleta integral con ajonjolí' and brand is not distinct from 'Tosh' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'paquete', 100, true from public.foods where name = 'Galleta integral con ajonjolí' and brand is not distinct from 'Tosh' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Galleta de arroz de tomate y aceite de oliva', 'Bicentury', null, 'Snacks', 'carbohidrato', false, 40, 1.5, 7.5, 0.5, null, '{"carbohidrato":0.5}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Galleta de arroz de tomate y aceite de oliva' and brand is not distinct from 'Bicentury' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 100, true from public.foods where name = 'Galleta de arroz de tomate y aceite de oliva' and brand is not distinct from 'Bicentury' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Galleta Salmas', 'Sanissimo', null, 'Snacks', 'carbohidrato', false, 80, 3, 15, 1, null, '{"carbohidrato":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Galleta Salmas' and brand is not distinct from 'Sanissimo' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'paquete', 100, true from public.foods where name = 'Galleta Salmas' and brand is not distinct from 'Sanissimo' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, portions_override, source, verified, created_by)
select 'Multicereal (pasas o almendras)', 'All Inclusive', null, 'Cereales', 'carbohidrato', false, 80, 3, 15, 1, null, '{"carbohidrato":1}'::jsonb, 'lista', false, null
where not exists (select 1 from public.foods where name = 'Multicereal (pasas o almendras)' and brand is not distinct from 'All Inclusive' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '3/4 taza', 100, true from public.foods where name = 'Multicereal (pasas o almendras)' and brand is not distinct from 'All Inclusive' and state is not distinct from null
on conflict (food_id, label) do nothing;
commit;
