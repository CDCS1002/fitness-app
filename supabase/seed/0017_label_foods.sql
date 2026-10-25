-- Alimentos registrados a partir de fotos de la etiqueta. Seguro de correr más de una vez:
-- si el código de barras ya existe (por ejemplo, creado a mano), corrige sus valores y medidas.
--
-- Atún lomo en trozos en agua, lata 170 g (peso escurrido 110 g), EAN 7441078261352.
-- La etiqueta da 1 porción = 55 g del CONTENIDO CON LÍQUIDO (170 g / 3.1 porciones):
-- 40 kcal, 7 g proteína, 0.5 g grasa, <1 g carbohidratos. Por lata: 124 kcal y 21.7 g de proteína,
-- que quedan en los 110 g escurridos → por 100 g escurridos: 112.7 kcal, 19.7 g proteína, 1.4 g grasa.
do $$
declare fid uuid;
begin
  select id into fid from public.foods where barcode = '7441078261352';
  if fid is null then
    insert into public.foods (name, brand, barcode, category, primary_group, protein_source, kcal, protein, carbs, fat, fiber, source, verified, created_by)
    values ('Atún lomo en trozos en agua', null, '7441078261352', 'Enlatados', 'proteina', false,
            112.7, 19.73, 0, 1.41, 0, 'etiqueta', true,
            case when (select count(*) from auth.users) = 1 then (select id from auth.users limit 1) end)
    returning id into fid;
  else
    update public.foods
       set name = 'Atún lomo en trozos en agua', category = 'Enlatados', primary_group = 'proteina', protein_source = false,
           kcal = 112.7, protein = 19.73, carbs = 0, fat = 1.41, fiber = 0, source = 'etiqueta', verified = true
     where id = fid;
    delete from public.food_measures where food_id = fid;
  end if;
  insert into public.food_measures (food_id, label, grams, is_default) values
    (fid, 'lata escurrida (110 g)', 110, true),
    (fid, '1/2 lata escurrida', 55, false);
end $$;
