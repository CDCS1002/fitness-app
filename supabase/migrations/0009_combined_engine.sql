-- =====================================================================
-- FITNESS APP · Motor de porciones combinado
-- Valores por porción de la lista de la nutricionista (Licda. María Paula Ruiz),
-- aplicados sobre la composición real (USDA / etiqueta). Ver src/lib/portions.js.
-- =====================================================================

-- Grasa que cada porción ya incluye (no suma porciones de grasa)
alter table public.exchange_groups add column if not exists fat_cap numeric not null default 0;

update public.exchange_groups set basis_macro = 'protein', basis_grams = 7,  protein_ref = 7, carbs_ref = 0,  fat_ref = 0, fat_cap = 8 where code = 'proteina';
update public.exchange_groups set basis_macro = 'carbs',   basis_grams = 15, protein_ref = 0, carbs_ref = 15, fat_ref = 0, fat_cap = 1 where code = 'carbohidrato';
update public.exchange_groups set basis_macro = 'fat',     basis_grams = 5,  protein_ref = 0, carbs_ref = 0,  fat_ref = 5, fat_cap = 0 where code = 'grasa';
update public.exchange_groups set basis_macro = 'carbs',   basis_grams = 12, protein_ref = 8, carbs_ref = 12, fat_ref = 0, fat_cap = 8 where code = 'lacteo';
update public.exchange_groups set basis_macro = 'carbs',   basis_grams = 5,  protein_ref = 2, carbs_ref = 5,  fat_ref = 0, fat_cap = 0 where code = 'vegetal';
update public.exchange_groups set basis_macro = 'carbs',   basis_grams = 15, protein_ref = 0, carbs_ref = 15, fat_ref = 0, fat_cap = 0 where code = 'fruta';

-- Azúcar: fuera del plan; la app lo muestra solo si se consume (máximo 1 cucharadita)
insert into public.exchange_groups (code, name, sort, basis_macro, basis_grams, protein_ref, carbs_ref, fat_ref, fat_cap, color)
values ('azucar', 'Azúcar', 7, 'carbs', 5, 0, 5, 0, 0, '#b48ead')
on conflict (code) do update set basis_macro = 'carbs', basis_grams = 5, carbs_ref = 5, fat_cap = 0;

-- Nuevo origen: alimentos de la lista con valores aproximados por equivalencia
alter table public.foods drop constraint if exists foods_source_check;
alter table public.foods add constraint foods_source_check
  check (source in ('manual','estimado','etiqueta','openfoodfacts','fatsecret','tabla','lista'));

-- Frutos secos y yogur griego aportan proteína (lista: "1 grasa + ½ proteína magra")
update public.foods set protein_source = true
 where brand is null and name in ('Almendras','Nueces','Maní tostado','Pistachos','Mantequilla de maní',
                                  'Yogur griego natural descremado','Yogur griego natural entero');

-- Tu leche (Dos Pinos descremada deslactosada 50 % proteína):
-- lista: 1 taza = 1 lácteo descremado + ½ proteína magra
update public.foods
   set name = 'Leche Descremada Deslactosada 50% Proteína',
       protein = 5.0, carbs = 4.6, fat = 1.2, kcal = 49,
       portions_override = '{"lacteo": 0.4167, "proteina": 0.2083}'::jsonb
 where brand = 'Dos Pinos' and name = 'Leche Descremada Deslactosada';
