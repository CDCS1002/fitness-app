-- Corrige leches y yogures escaneados (Open Food Facts) que quedaron con otro grupo:
-- pasan a Lácteo, y si traen proteína añadida (más de la que acompaña a su lactosa:
-- 8 g por cada 12 g de carbohidratos, con 20 % de margen), el extra cuenta como Proteína.
-- Después de correrlo: Progreso → "Recalcular registros" para corregir lo ya registrado.
update public.foods
   set primary_group = 'lacteo',
       protein_source = (coalesce(protein, 0) >= 5 and coalesce(protein, 0) > coalesce(carbs, 0) * 8 / 12 * 1.2)
 where source = 'openfoodfacts'
   and primary_group <> 'lacteo'
   and portions_override is null
   and name ~* '\m(leche|yogurt?|yoghurt|yogur|kefir|milk)\M'
   and name !~* '(queso|cheese|dulce de leche|cajeta|polvo|powder|whey|helado|ice cream)'
returning name, brand, primary_group, protein_source;
