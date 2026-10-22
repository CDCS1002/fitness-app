-- Carga inicial generada por scripts/build-seed.mjs (no editar a mano).
-- Valores por 100 g, estimados a partir de tus registros de Fitia (source = 'estimado').
-- Verifica los empacados contra su etiqueta y márcalos como verificados en la app.
begin;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Pechuga de Pollo Ahumada Rebanada', 'Cinta Azul', null, 'Embutidos', 'proteina', false,
       112, 18, 3, 3, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Pechuga de Pollo Ahumada Rebanada' and brand is not distinct from 'Cinta Azul' and state is not distinct from null);

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Pechuga de Pavo', 'Fud', null, 'Embutidos', 'proteina', false,
       118, 18, 4, 3.5, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Pechuga de Pavo' and brand is not distinct from 'Fud' and state is not distinct from null);

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Jamón', null, null, 'Embutidos', 'proteina', false,
       163, 17, 2, 9.7, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Jamón' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'rebanada', 15, false from public.foods where name = 'Jamón' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Queso Fresco', null, null, 'Quesos', 'proteina', false,
       310, 20, 3, 24, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Queso Fresco' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'rebanada', 30, false from public.foods where name = 'Queso Fresco' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'String Cheese Light', 'Crystal Farms', null, 'Quesos', 'proteina', false,
       208, 25, 4, 10.4, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'String Cheese Light' and brand is not distinct from 'Crystal Farms' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'stick', 24, true from public.foods where name = 'String Cheese Light' and brand is not distinct from 'Crystal Farms' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Shaved Parmesan Cheese', 'Dutch Farms', null, 'Quesos', 'proteina', false,
       425, 36, 3, 29, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Shaved Parmesan Cheese' and brand is not distinct from 'Dutch Farms' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 5, false from public.foods where name = 'Shaved Parmesan Cheese' and brand is not distinct from 'Dutch Farms' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Queso Parmesano', 'Dos Pinos', null, 'Quesos', 'proteina', false,
       400, 35, 3, 28, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Queso Parmesano' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 5, false from public.foods where name = 'Queso Parmesano' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Huevo', null, null, 'Huevos', 'proteina', false,
       143, 12.6, 0.7, 9.5, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Huevo' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 50, true from public.foods where name = 'Huevo' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Pollo Deshilachado', null, 'cocido', 'Carnes', 'proteina', false,
       160, 30, 0, 4.4, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Pollo Deshilachado' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 140, false from public.foods where name = 'Pollo Deshilachado' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Pollo Asado (sin piel)', null, 'cocido', 'Carnes', 'proteina', false,
       167, 28, 0, 6, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Pollo Asado (sin piel)' and brand is not distinct from null and state is not distinct from 'cocido');

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Pollo (pechuga)', null, 'crudo', 'Carnes', 'proteina', false,
       120, 22.5, 0, 3.3, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Pollo (pechuga)' and brand is not distinct from null and state is not distinct from 'crudo');

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Carne Molida de Res', null, 'cocido', 'Carnes', 'proteina', false,
       264, 26, 0, 17.5, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Carne Molida de Res' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 140, false from public.foods where name = 'Carne Molida de Res' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Cerdo Empanizado Frito', null, 'cocido', 'Carnes', 'proteina', false,
       266, 24, 10, 14.5, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Cerdo Empanizado Frito' and brand is not distinct from null and state is not distinct from 'cocido');

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Camarones', null, 'cocido', 'Mariscos', 'proteina', false,
       110, 24, 1, 1.1, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Camarones' and brand is not distinct from null and state is not distinct from 'cocido');

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Atún Lomo en Trozos en Aceite', 'Calvo', null, 'Enlatados', 'proteina', false,
       143, 25, 0, 4.8, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Atún Lomo en Trozos en Aceite' and brand is not distinct from 'Calvo' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'lata escurrida', 80, false from public.foods where name = 'Atún Lomo en Trozos en Aceite' and brand is not distinct from 'Calvo' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Iso Sensation 93 Cookies ''n'' Cream', 'Ultimate Nutrition', null, 'Suplementos', 'proteina', false,
       394, 75.8, 9.1, 6.1, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Iso Sensation 93 Cookies ''n'' Cream' and brand is not distinct from 'Ultimate Nutrition' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'scoop', 33, true from public.foods where name = 'Iso Sensation 93 Cookies ''n'' Cream' and brand is not distinct from 'Ultimate Nutrition' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Protein+ Electrolytes Lolli Punch', 'Rooster', null, 'Bebidas', 'proteina', false,
       6.7, 1.67, 0.33, 0, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Protein+ Electrolytes Lolli Punch' and brand is not distinct from 'Rooster' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'botella', 600, true from public.foods where name = 'Protein+ Electrolytes Lolli Punch' and brand is not distinct from 'Rooster' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Leche Descremada Deslactosada', 'Dos Pinos', null, 'Lácteos', 'lacteo', false,
       49, 3.6, 5.2, 1.3, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Leche Descremada Deslactosada' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza (240 ml)', 240, true from public.foods where name = 'Leche Descremada Deslactosada' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Leche Descremada', 'Dos Pinos', null, 'Lácteos', 'lacteo', false,
       39, 3.6, 5, 0.5, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Leche Descremada' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción (250 ml)', 250, true from public.foods where name = 'Leche Descremada' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza (240 ml)', 240, false from public.foods where name = 'Leche Descremada' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Pan Ciabatta', null, null, 'Panes', 'carbohidrato', false,
       259, 9, 49, 3.5, 2, 'estimado', null
where not exists (select 1 from public.foods where name = 'Pan Ciabatta' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 110, false from public.foods where name = 'Pan Ciabatta' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Tortillas Aliñadas Caseras Queso', 'Flor de Lys', null, 'Tortillas', 'carbohidrato', false,
       176, 5, 30, 4, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Tortillas Aliñadas Caseras Queso' and brand is not distinct from 'Flor de Lys' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 45, false from public.foods where name = 'Tortillas Aliñadas Caseras Queso' and brand is not distinct from 'Flor de Lys' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Espagueti', 'Roma', 'cocido', 'Pastas', 'carbohidrato', false,
       145, 5.3, 29, 0.9, 1.8, 'estimado', null
where not exists (select 1 from public.foods where name = 'Espagueti' and brand is not distinct from 'Roma' and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 140, false from public.foods where name = 'Espagueti' and brand is not distinct from 'Roma' and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Arroz Blanco', null, 'cocido', 'Cereales', 'carbohidrato', false,
       130, 2.7, 28.2, 0.3, 0.4, 'estimado', null
where not exists (select 1 from public.foods where name = 'Arroz Blanco' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 100, true from public.foods where name = 'Arroz Blanco' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 200, false from public.foods where name = 'Arroz Blanco' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Arroz Chino', null, 'cocido', 'Platillos', 'carbohidrato', false,
       174, 5, 25, 6, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Arroz Chino' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 200, true from public.foods where name = 'Arroz Chino' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Gallo Pinto', null, 'cocido', 'Platillos', 'carbohidrato', true,
       143, 5.5, 23, 3.2, 4, 'estimado', null
where not exists (select 1 from public.foods where name = 'Gallo Pinto' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 200, true from public.foods where name = 'Gallo Pinto' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 100, false from public.foods where name = 'Gallo Pinto' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Frijoles Negros', null, 'cocido', 'Leguminosas', 'carbohidrato', true,
       132, 8.9, 23.7, 0.5, 8.7, 'estimado', null
where not exists (select 1 from public.foods where name = 'Frijoles Negros' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 100, true from public.foods where name = 'Frijoles Negros' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Papa', null, 'cocido', 'Tubérculos', 'carbohidrato', false,
       86, 1.9, 20, 0.1, 1.8, 'estimado', null
where not exists (select 1 from public.foods where name = 'Papa' and brand is not distinct from null and state is not distinct from 'cocido');
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad mediana', 150, false from public.foods where name = 'Papa' and brand is not distinct from null and state is not distinct from 'cocido'
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Galleta Maracuyá y Chía', 'Nutri Snacks', null, 'Snacks', 'carbohidrato', false,
       437, 6, 65, 17, 4, 'estimado', null
where not exists (select 1 from public.foods where name = 'Galleta Maracuyá y Chía' and brand is not distinct from 'Nutri Snacks' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'galleta', 24, true from public.foods where name = 'Galleta Maracuyá y Chía' and brand is not distinct from 'Nutri Snacks' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Palitrokes Aceite de Oliva y Ajo', 'Jack', null, 'Snacks', 'carbohidrato', false,
       429, 9, 62, 16, 3, 'estimado', null
where not exists (select 1 from public.foods where name = 'Palitrokes Aceite de Oliva y Ajo' and brand is not distinct from 'Jack' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción', 35, true from public.foods where name = 'Palitrokes Aceite de Oliva y Ajo' and brand is not distinct from 'Jack' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Mix de Nueces', null, null, 'Semillas', 'grasa', false,
       614, 18, 20, 54, 7, 'estimado', null
where not exists (select 1 from public.foods where name = 'Mix de Nueces' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 14, true from public.foods where name = 'Mix de Nueces' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Marañón', null, null, 'Semillas', 'grasa', false,
       553, 18, 30, 44, 3.3, 'estimado', null
where not exists (select 1 from public.foods where name = 'Marañón' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 14, true from public.foods where name = 'Marañón' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Natilla con Sal', 'Zarcero', null, 'Lácteos grasos', 'grasa', false,
       133, 2.5, 4, 12, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Natilla con Sal' and brand is not distinct from 'Zarcero' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 15, true from public.foods where name = 'Natilla con Sal' and brand is not distinct from 'Zarcero' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Aderezo Ranch', 'Zafrán', null, 'Aderezos', 'grasa', false,
       300, 1, 6, 30, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Aderezo Ranch' and brand is not distinct from 'Zafrán' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 15, false from public.foods where name = 'Aderezo Ranch' and brand is not distinct from 'Zafrán' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Guacamole', null, null, 'Aderezos', 'grasa', false,
       160, 2, 8.5, 13.5, 6, 'estimado', null
where not exists (select 1 from public.foods where name = 'Guacamole' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'cucharada', 15, false from public.foods where name = 'Guacamole' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Ensalada Fiesta', 'Marketside', null, 'Ensaladas', 'vegetal', false,
       120, 3, 10, 7.5, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Ensalada Fiesta' and brand is not distinct from 'Marketside' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 90, true from public.foods where name = 'Ensalada Fiesta' and brand is not distinct from 'Marketside' and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Vainicas', null, null, 'Vegetales', 'vegetal', false,
       31, 1.8, 6, 0.2, 2.7, 'estimado', null
where not exists (select 1 from public.foods where name = 'Vainicas' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/2 taza', 50, true from public.foods where name = 'Vainicas' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Champiñones', null, null, 'Vegetales', 'vegetal', false,
       22, 3.1, 3.3, 0.3, 1, 'estimado', null
where not exists (select 1 from public.foods where name = 'Champiñones' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/4 taza', 17.5, true from public.foods where name = 'Champiñones' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Espinaca', null, null, 'Vegetales', 'vegetal', false,
       23, 2.9, 3.6, 0.4, 2.2, 'estimado', null
where not exists (select 1 from public.foods where name = 'Espinaca' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/4 taza', 5, true from public.foods where name = 'Espinaca' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'taza', 20, false from public.foods where name = 'Espinaca' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Pimiento Rojo', null, null, 'Vegetales', 'vegetal', false,
       26, 1, 6, 0.3, 2.1, 'estimado', null
where not exists (select 1 from public.foods where name = 'Pimiento Rojo' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/4 taza', 37.5, true from public.foods where name = 'Pimiento Rojo' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Cebolla', null, null, 'Vegetales', 'vegetal', false,
       40, 1.1, 9.3, 0.1, 1.7, 'estimado', null
where not exists (select 1 from public.foods where name = 'Cebolla' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, '1/4 taza', 40, true from public.foods where name = 'Cebolla' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Banano', null, null, 'Frutas', 'fruta', false,
       89, 1.1, 22.8, 0.3, 2.6, 'estimado', null
where not exists (select 1 from public.foods where name = 'Banano' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'pequeño', 100, true from public.foods where name = 'Banano' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'mediano', 118, false from public.foods where name = 'Banano' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Manzana Verde', null, null, 'Frutas', 'fruta', false,
       58, 0.4, 13.6, 0.2, 2.8, 'estimado', null
where not exists (select 1 from public.foods where name = 'Manzana Verde' and brand is not distinct from null and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'unidad', 160, true from public.foods where name = 'Manzana Verde' and brand is not distinct from null and state is not distinct from null
on conflict (food_id, label) do nothing;

insert into public.foods (name, brand, state, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, created_by)
select 'Jugo de Naranja 100%', 'Dos Pinos', null, 'Bebidas', 'fruta', false,
       32.4, 0.5, 7.5, 0, null, 'estimado', null
where not exists (select 1 from public.foods where name = 'Jugo de Naranja 100%' and brand is not distinct from 'Dos Pinos' and state is not distinct from null);
insert into public.food_measures (food_id, label, grams, is_default)
select id, 'porción (250 ml)', 250, true from public.foods where name = 'Jugo de Naranja 100%' and brand is not distinct from 'Dos Pinos' and state is not distinct from null
on conflict (food_id, label) do nothing;

commit;
