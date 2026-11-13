-- Comidas del 12 de noviembre de 2026 (abrir la app ANTES para que cargue los alimentos nuevos).
-- Se puede correr más de una vez: no duplica registros.
with me as (select user_id from public.app_admins limit 1),
data(meal, catalog_key, food_name, food_brand, measure_label, quantity, grams, kcal, protein, carbs, fat, fiber, portions) as (values
  ('desayuno', 'generico.croque-madame-jamon-queso-bechamel-y-huevo.na', 'Croque madame (jamón, queso, bechamel y huevo)', null, 'unidad', 1, 241, 575.99, 30.8, 40.39, 31.81, 2, '{"carbohidrato":2.69,"grasa":5.82,"proteina":4.4}'),
  ('desayuno', 'generico.hojaldre-de-frutas-con-crema-danesa.na', 'Hojaldre de frutas con crema (danesa)', null, 'unidad pequeña', 1, 60, 230, 3, 20, 16, null, '{"azucar":4,"grasa":3.2}'),
  ('almuerzo', 'generico.entrana-a-la-parrilla.cocido', 'Entraña a la parrilla · cocido', null, 'porción (100 g)', 1, 100, 255, 23.5, 0, 17.1, 0, '{"proteina":3.36}'),
  ('almuerzo', 'generico.pechuga-de-pollo.cocido', 'Pechuga de pollo · cocido', null, 'g', 100, 100, 165, 31, 0, 3.6, 0, '{"proteina":4.43}'),
  ('almuerzo', 'generico.papas-campesinas-gajos-con-cascara.na', 'Papas campesinas (gajos con cáscara)', null, 'porción', 1, 150, 240, 3.75, 34.5, 9.75, 3.3, '{"carbohidrato":2.3,"grasa":1.49}'),
  ('almuerzo', 'generico.berenjena-salteada-con-ajonjoli.na', 'Berenjena salteada con ajonjolí', null, 'porción', 1, 120, 132, 1.92, 12, 9, 3.6, '{"vegetal":2.4,"grasa":1.8}'),
  ('almuerzo', 'generico.mil-hojas-de-arandanos-con-dulce-de-leche-y-chantilly.na', 'Mil hojas de arándanos con dulce de leche y chantilly', null, 'porción', 1, 120, 408, 4.8, 50.4, 20.4, 1.2, '{"azucar":10.08,"grasa":4.08}'),
  ('cena', 'generico.sopa-azteca-con-pollo-y-aguacate.na', 'Sopa azteca (con pollo y aguacate)', null, 'tazón', 1, 350, 210, 17.5, 14, 9.45, 2.8, '{"proteina":2.5,"carbohidrato":0.93}'),
  ('cena', 'generico.tiritas-de-tortilla-fritas.na', 'Tiritas de tortilla fritas', null, 'porción (20 g)', 1, 20, 96, 1.3, 12.8, 4.4, 1, '{"carbohidrato":0.85,"grasa":0.71}'),
  ('cena', 'generico.queso-mozzarella.na', 'Queso mozzarella', null, 'g', 30, 30, 90, 6.66, 0.66, 6.72, 0, '{"proteina":0.95,"carbohidrato":0.04}'),
  ('cena', 'generico.cebolla.na', 'Cebolla', null, 'g', 30, 30, 12, 0.33, 2.79, 0.03, 0.51, '{"vegetal":0.56,"grasa":0.01}'),
  ('cena', 'generico.choripan-con-chimichurri.na', 'Choripán con chimichurri', null, 'unidad', 1, 195, 614.99, 22.99, 46, 38.01, 2.01, '{"carbohidrato":3.07,"grasa":6.99,"proteina":3.28}'),
  ('snack', 'heineken.heineken-0-0-sin-alcohol.na', 'Heineken 0.0 (sin alcohol)', 'Heineken', 'botella 330 ml', 3, 990, 207.9, 3.96, 47.52, 0, null, '{"carbohidrato":3.17}')
)
insert into public.meal_entries (user_id, eaten_on, meal, food_id, food_name, food_brand, measure_label, quantity, grams, kcal, protein, carbs, fat, fiber, portions)
select me.user_id, date '2026-11-12', d.meal,
       (select f.id from public.foods f where f.catalog_key = d.catalog_key order by (f.created_by = me.user_id) desc limit 1),
       d.food_name, d.food_brand, d.measure_label, d.quantity, d.grams, d.kcal, d.protein, d.carbs, d.fat, d.fiber, d.portions::jsonb
from data d cross join me
where not exists (select 1 from public.meal_entries e
                  where e.user_id = me.user_id and e.eaten_on = date '2026-11-12' and e.meal = d.meal and e.food_name = d.food_name)
returning meal, food_name, kcal, (food_id is not null) as enlazado;
