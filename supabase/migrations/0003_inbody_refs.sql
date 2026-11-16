-- Rangos de referencia del InBody por medición (dependen de sexo, talla y peso de cada persona).
-- Antes estaban fijos en el código con los del administrador.
alter table public.inbody_scans add column if not exists refs jsonb;

-- Pasa los rangos que estaban en el código a las mediciones del administrador.
update public.inbody_scans
   set refs = '{"weight": "54,1 a 73,1", "fat_mass": "7,6 a 15,3", "pbf": "10 a 20", "tbw": "35,7 a 43,7", "protein": "9,5 a 11,7", "minerals": "3,30 a 4,04", "ffm": "48,6 a 59,4", "bmi": "18,5 a 25,0", "visceral": "menor a 10", "whr": "0,80 a 0,90", "obesity_degree": "90 a 110", "bmr": "1712 a 2010"}'::jsonb
 where refs is null
   and user_id in (select user_id from public.app_admins);
