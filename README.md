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

## Motor de porciones

Calibrado con ejemplos de la base de KG Nutrición:

| Grupo | 1 porción |
|---|---|
| Proteína | 7 g de proteína |
| Carbohidrato | 15 g de carbohidrato |
| Grasa | 5 g de grasa |
| Lácteo | 8 g proteína · 12 g carbos · 2 g grasa |
| Vegetal | 5 g de carbohidrato |
| Fruta | 15 g de carbohidrato |

1. El grupo principal del alimento define sus porciones y "consume" sus macros de referencia.
2. La grasa restante cuenta como grasa (÷ 5).
3. Los carbos restantes cuentan como carbohidrato (÷ 15), salvo en grasas, vegetales y frutas.
4. La proteína restante solo cuenta si el alimento está marcado como fuente de proteína.
5. `portions_override` (por 100 g) reemplaza el cálculo cuando el criterio clínico pesa más que la fórmula.
6. Cada registro se redondea a medias porciones y el total del día suma esos valores.

Los valores de cada grupo viven en la tabla `exchange_groups` y se pueden ajustar sin tocar código.

**Pendiente de calibrar:** con 7 g por porción, el pollo frito de 200 g (53,6 g de proteína) da 7½ proteínas; KG reporta 8. Hacen falta más ejemplos para saber si usa 6,5 g o redondea hacia arriba.

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
