-- Productos de marca (Gricket House, Herbalife, Lizano, Rooster). Generado por scripts/build-brands-seed.mjs.
-- Ejecutar después de 0009_combined_engine.sql. Seguro de correr más de una vez.
begin;

-- https://www.etiqueteando.com/shop/galletas-y-barritas/barritas/gricket-house-barra-de-proteina-sabor-chocolate-amargo/
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Barra de proteína de grillo chocolate amargo', 'Gricket House', null, 'Barras de proteína de grillo (cricket)', 'proteina', false, 370, 40, 22, 14, 6, 'etiqueta', true, null
where not exists (select 1 from public.foods where name = 'Barra de proteína de grillo chocolate amargo' and brand is not distinct from 'Gricket House' and state is null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'barra', 50, true from public.foods where name = 'Barra de proteína de grillo chocolate amargo' and brand is not distinct from 'Gricket House' and state is null
on conflict (food_id, label) do nothing;

-- https://www.etiqueteando.com/shop/galletas-y-barritas/barritas/gricket-house-barra-de-proteina-sabor-chocolate-blanco/
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Barra de proteína de grillo chocolate blanco', 'Gricket House', null, 'Barras de proteína de grillo (cricket)', 'proteina', false, 348, 40, 22, 14, 6, 'etiqueta', true, null
where not exists (select 1 from public.foods where name = 'Barra de proteína de grillo chocolate blanco' and brand is not distinct from 'Gricket House' and state is null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'barra', 50, true from public.foods where name = 'Barra de proteína de grillo chocolate blanco' and brand is not distinct from 'Gricket House' and state is null
on conflict (food_id, label) do nothing;

-- https://www.etiqueteando.com/shop/galletas-y-barritas/barritas/gricket-house-barra-de-proteina-sabor-pina-colada/
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Barra de proteína de grillo piña colada', 'Gricket House', null, 'Barras de proteína de grillo (cricket)', 'proteina', false, 366.67, 33.33, 33.33, 10, 16.67, 'etiqueta', true, null
where not exists (select 1 from public.foods where name = 'Barra de proteína de grillo piña colada' and brand is not distinct from 'Gricket House' and state is null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'barra', 60, true from public.foods where name = 'Barra de proteína de grillo piña colada' and brand is not distinct from 'Gricket House' and state is null
on conflict (food_id, label) do nothing;

-- https://www.fatsecret.com.mx/calor%C3%ADas-nutrici%C3%B3n/herbalife/formula-1-sabor-vainilla/2-cucharadas
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Fórmula 1 batido nutricional vainilla', 'Herbalife', null, 'Suplementos', 'proteina', false, 380, 36, 52, 3, null, 'estimado', false, null
where not exists (select 1 from public.foods where name = 'Fórmula 1 batido nutricional vainilla' and brand is not distinct from 'Herbalife' and state is null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '2 cucharadas', 25, true from public.foods where name = 'Fórmula 1 batido nutricional vainilla' and brand is not distinct from 'Herbalife' and state is null
on conflict (food_id, label) do nothing;

-- https://www.fatsecret.com.mx/calor%C3%ADas-nutrici%C3%B3n/herbalife/personalized-protein-powder/1-porci%C3%B3n
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Proteína en polvo personalizada (PPP)', 'Herbalife', null, 'Suplementos', 'proteina', false, 366.67, 83.33, 1.67, 3.33, null, 'estimado', false, null
where not exists (select 1 from public.foods where name = 'Proteína en polvo personalizada (PPP)' and brand is not distinct from 'Herbalife' and state is null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'medida', 6, true from public.foods where name = 'Proteína en polvo personalizada (PPP)' and brand is not distinct from 'Herbalife' and state is null
on conflict (food_id, label) do nothing;

-- https://www.fatsecret.com.mx/calor%C3%ADas-nutrici%C3%B3n/herbalife/barra-con-prote%C3%ADna-sabor-vainilla-con-almendras/1-barra
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Barra con proteína vainilla con almendras', 'Herbalife', null, 'Barras de proteína', 'proteina', false, 400, 28.57, 45.71, 11.43, null, 'estimado', false, null
where not exists (select 1 from public.foods where name = 'Barra con proteína vainilla con almendras' and brand is not distinct from 'Herbalife' and state is null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'barra', 35, true from public.foods where name = 'Barra con proteína vainilla con almendras' and brand is not distinct from 'Herbalife' and state is null
on conflict (food_id, label) do nothing;

-- https://www.kroger.com/p/lizano-salsa-sauce/0004100036640
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Salsa Lizano', 'Lizano', null, 'Salsas y aderezos', 'azucar', false, 93.75, 0, 18.75, 0, null, 'etiqueta', true, null
where not exists (select 1 from public.foods where name = 'Salsa Lizano' and brand is not distinct from 'Lizano' and state is null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada (15 ml)', 16, true from public.foods where name = 'Salsa Lizano' and brand is not distinct from 'Lizano' and state is null
on conflict (food_id, label) do nothing;

-- https://www.drinkrooster.com/
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Energy', 'Rooster', null, 'Bebidas', 'carbohidrato', false, 0, 0, 0, 0, null, 'etiqueta', true, null
where not exists (select 1 from public.foods where name = 'Energy' and brand is not distinct from 'Rooster' and state is null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'lata (300 ml)', 300, true from public.foods where name = 'Energy' and brand is not distinct from 'Rooster' and state is null
on conflict (food_id, label) do nothing;

-- https://www.drinkrooster.com/
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Energy + Hydration', 'Rooster', null, 'Bebidas', 'carbohidrato', false, 0, 0, 0, 0, null, 'etiqueta', true, null
where not exists (select 1 from public.foods where name = 'Energy + Hydration' and brand is not distinct from 'Rooster' and state is null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'botella (600 ml)', 600, true from public.foods where name = 'Energy + Hydration' and brand is not distinct from 'Rooster' and state is null
on conflict (food_id, label) do nothing;

-- https://www.drinkrooster.com/
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Energy Tea', 'Rooster', null, 'Bebidas', 'carbohidrato', false, 0, 0, 0, 0, null, 'etiqueta', true, null
where not exists (select 1 from public.foods where name = 'Energy Tea' and brand is not distinct from 'Rooster' and state is null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'botella (600 ml)', 600, true from public.foods where name = 'Energy Tea' and brand is not distinct from 'Rooster' and state is null
on conflict (food_id, label) do nothing;

-- https://www.drinkrooster.com/
insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
select 'Performance Water', 'Rooster', null, 'Bebidas', 'carbohidrato', false, 0, 0, 0, 0, null, 'etiqueta', true, null
where not exists (select 1 from public.foods where name = 'Performance Water' and brand is not distinct from 'Rooster' and state is null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'botella (600 ml)', 600, true from public.foods where name = 'Performance Water' and brand is not distinct from 'Rooster' and state is null
on conflict (food_id, label) do nothing;
commit;
