# Porciones · Fitness App

PWA para registrar comidas por **porciones de intercambio** (proteína, carbohidrato, grasa, lácteo, vegetal, fruta), con macros y una base de alimentos con búsqueda por nombre y marca.

- **Frontend:** Vite + Preact, publicado en GitHub Pages (`/fitness-app/`), instalable en el celular.
- **Backend:** Supabase (Postgres + Auth + RLS). La llave publishable va en el frontend; la seguridad la imponen las políticas por fila.
- **Panel:** el Google Sheet existente sigue siendo el dashboard; la sincronización llega en una fase siguiente.

## Estructura

```
supabase/migrations/0001_schema.sql   tablas, RLS, búsqueda (pg_trgm + unaccent)
supabase/migrations/0002_daily_activity.sql  agua, pasos y actividad
supabase/migrations/0003_kcal_targets.sql    metas de kcal y macros
supabase/migrations/0004_strength.sql        ejercicios y registros de fuerza
supabase/seed/0004_strength_import.sql       catálogo e historial del Sheet (`node scripts/build-strength-seed.mjs`)
src/lib/strength.js                   doble progresión, 1RM estimado y volumen
supabase/migrations/0005_progress.sql        peso, InBody, días históricos y Post-entreno
supabase/migrations/0006_sleep_energy.sql    sueño, energía y meta de sueño
supabase/seed/0007_generic_foods.sql         112 alimentos genéricos (USDA) y corrección de genéricos estimados
supabase/migrations/0008_visit.sql           próxima cita y notas para la nutricionista
supabase/migrations/0009_combined_engine.sql motor combinado, grupo azúcar y equivalencia de tu leche
supabase/seed/0010_list_foods.sql            alimentos de la lista de la nutricionista (56 genéricos, 39 de marca)
supabase/migrations/0011_plan_2.sql          Planes 1 (24/08) y 2 (13/10) y grasa/músculo de la báscula de casa
src/lib/report.js                     reporte para la cita (misma estructura que la hoja Reporte cita)
supabase/seed/0005_progress_import.sql       peso, InBody y Diario 13–21 oct del Sheet
src/lib/weekly.js                     resumen semanal (misma lógica que la hoja Semanal)
src/lib/inbody.js                     indicadores InBody, rangos y si conviene que suban o bajen
src/lib/targets.js                    metas del día (explícitas o estimadas por porciones)
supabase/seed/foods.json              alimentos iniciales (editar aquí)
supabase/seed/0002_foods.sql          generado con `npm run seed`
src/lib/portions.js                   motor de porciones
src/lib/off.js                        Open Food Facts: búsqueda por código y conversión
src/components/Scanner.jsx            cámara + lector de códigos (zxing-wasm, servido localmente)
src/screens/                          Login, Día, Agregar, Nuevo alimento
tests/                                pruebas del motor (`npm test`)
```

## Motor de porciones (combinado)

- **Valor de cada porción:** lista de intercambio de la nutricionista (Licda. María Paula Ruiz).
- **Composición:** USDA FoodData Central o la etiqueta, por gramos reales.
- **De KG Nutrición:** la proteína incidental de harinas no suma; leguminosas y fuentes de proteína sí.

| Grupo | 1 porción | Grasa que ya incluye |
|---|---|---|
| Proteína | 7 g de proteína | hasta 8 g (magra 2 · semigrasa 5 · grasa 8) |
| Carbohidrato (harina) | 15 g de carbohidratos | 1 g |
| Lácteo | 12 g de lactosa, sin pasar de proteína ÷ 8 | hasta 8 g (descremado · semi · entero) |
| Vegetal | 5 g de carbohidratos | 0 |
| Fruta | 15 g de carbohidratos | 0 |
| Grasa | 5 g de grasa | — |
| Azúcar (fuera del plan) | 5 g de carbohidratos | 0 |

Solo la grasa que excede lo incluido cuenta como porciones de grasa. Carbos excedentes: en proteínas cuentan como
harina; en lácteos, como azúcar. `portions_override` fija equivalencias de la lista (p. ej. leche 50 % proteína:
1 taza = 1 lácteo + ½ proteína). Coincide con la lista donde sus medidas caseras son exactas y se corrige donde
se quedan cortas (½ taza de arroz cocido ≈ 1,5 harinas). La opción *Recalcular registros* (pestaña Progreso)
aplica el motor actual a los registros anteriores.

## Desarrollo

```bash
npm install
npm test
npm run dev
```

## Escáner de código de barras

1. Busca el código en tu base (`foods.barcode`, probando variantes UPC-A/EAN-13).
2. Si no existe, consulta Open Food Facts y prellena el formulario (valores por 100 g, porción del empaque y grupo sugerido por categoría o macros).
3. Si tampoco está ahí, abre el formulario con el código ya puesto para copiar la etiqueta.

Lo que guardas queda en tu base, así que el siguiente escaneo del mismo producto es instantáneo.

## Fuerza

Misma lógica que la hoja Fuerza del Sheet: rango 6–10 reps (30–90 s en isométricos); si todas las series llegan al máximo se sube la carga (+5 kg tren inferior, +2,5 kg superior, core e isométricos), si alguna queda por debajo del mínimo se baja, y si no se mantiene. La marca es el 1RM estimado (Epley) con la mejor serie. `tests/strength.test.js` reproduce casos reales del Sheet.
