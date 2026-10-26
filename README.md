# Porciones · Fitness App

PWA para registrar comidas por **porciones de intercambio** (proteína, carbohidrato, grasa, lácteo, vegetal, fruta), con macros y una base de alimentos con búsqueda por nombre y marca.

- **Frontend:** Vite + Preact, publicado en GitHub Pages (`/fitness-app/`), instalable en el celular.
- **Backend:** Supabase (Postgres + Auth + RLS). La llave publishable va en el frontend; la seguridad la imponen las políticas por fila.
- **Datos:** todo vive en Supabase. El Google Sheet original ya no se usa.

## Estructura

```
supabase/migrations/0001_base.sql     estructura completa: tablas, RLS, búsqueda, grupos de porciones
supabase/migrations/0002_…sql         cambios posteriores (cada uno se corre una vez en el SQL Editor)
supabase/catalog/foods.json           catálogo común de alimentos (por 100 g, con medidas y su fuente)
scripts/build-catalog.mjs             valida el catálogo y genera public/catalog*.json (corre en cada build)
src/lib/catalog.js                    carga automática del catálogo en la app (solo administrador)
src/lib/portions.js · targets.js      motor de porciones; metas del día
src/lib/off.js                        Open Food Facts: búsqueda por código y conversión
src/lib/routine.js · strength.js      rutina semanal (datos en la base) y doble progresión
src/lib/exerciseMatch.js              aviso de ejercicios con nombre parecido
src/lib/profile.js                    perfil con sesión: administrador, rutina y reglas de progresión
src/lib/energy.js                     gasto = basal InBody + anillo rojo; balance
src/lib/sleep.js · meds.js            fases del sueño; medicamentos y escáner (NIH DSLD → Open Food Facts)
src/lib/emotions.js · moodReport.js   rueda de emociones y reporte de psicología
src/lib/weekly.js · report.js         resumen semanal y reporte para la cita
src/lib/inbody.js                     indicadores InBody
src/components/ · src/screens/        interfaz
tests/                                pruebas (`npm test`); tests/fixtures con datos de ejemplo
```

### Base de datos

- **Base nueva:** correr `supabase/migrations/0001_base.sql` completo y marcar al primer usuario como
  administrador (instrucción al final del archivo). Los alimentos llegan solos al abrir la app.
- **Cambios futuros:** una migración nueva numerada desde la última (`0003_…`), idempotente.
- `0001_base.sql` consolida las migraciones anteriores (historial en git); se verificó que deja exactamente la
  misma estructura (tablas, columnas, restricciones, índices, políticas, funciones, triggers y permisos).

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
3. Si tampoco está ahí, el administrador lo agrega con la etiqueta; los demás usuarios ven el aviso para pedírselo.

Lo que se guarda queda en el catálogo común, así que el siguiente escaneo del mismo producto es instantáneo.

## Fuerza

Doble progresión con las reglas de cada usuario (`strength_settings`; por defecto 6–10 reps, 30–90 s en isométricos,
+5 kg tren inferior y +2,5 kg el resto): si todas las series llegan al máximo se sube la carga, si alguna queda por
debajo del mínimo se baja, y si no se mantiene. La marca es el 1RM estimado (Epley) con la mejor serie.

### Rutina flexible

Cada rutina se identifica con su día habitual (`routines`, y los días de cada ejercicio en `exercise_prefs`). En la pestaña Fuerza se puede
elegir la rutina del día; la lista trae todos sus ejercicios por grupo muscular y el abdomen al final. La app
deduce qué rutinas se hicieron cada día a partir de lo registrado (una sesión mixta cuenta para varias si tiene
al menos 2 ejercicios exclusivos de cada una) y avisa qué rutina de la semana falta. La elección se guarda en el
dispositivo; si se pierde, la rutina se deduce de los registros (`src/lib/routine.js`, `tests/routine.test.js`).

## Emociones

- Dos formas de registrar: **¿Cómo me siento ahora?** (momento con hora, varios por día) y **¿Cómo me sentí hoy?** (un resumen por día).
- Paso 1: rueda por niveles (base → intermedia → específica) o búsqueda; cada emoción tiene definición (ⓘ) e intensidad 1–5.
- Paso 2: áreas que influyen (trabajo, familia, pareja, dinero, salud, sueño, etc. y propias). Paso 3: nota y detalles opcionales (situación, pensamientos, cuerpo, qué hice).
- Cada día muestra su contexto: sueño y fases, energía, entrenamiento y kcal frente al rango del plan.
- Los reportes viven en **Progreso**: nutrición (el de antes) y psicología (período, distribución, palabras y áreas frecuentes, comparación de días agradables vs difíciles con ≥3 días de cada tipo, detalle por día con notas opcionales, PDF).

## Catálogo de alimentos (carga automática)

Los alimentos no requieren SQL:

1. Se agregan a `supabase/catalog/foods.json` (valores por 100 g, medidas y `ref` con la fuente).
2. `npm run build` valida el catálogo y genera `public/catalog.json` y `public/catalog-version.json`.
3. Al abrir la app, 3 s después y en segundo plano, `syncCatalog` (src/lib/catalog.js) compara la versión con la
   última sincronizada en el dispositivo. Si cambió: inserta los nuevos, enlaza los que ya existían por scripts
   anteriores (por código de barras o nombre/marca/estado) y aplica correcciones solo a los que no editaste
   (huella `catalog_hash`). Ante cualquier error lo reintenta en la siguiente apertura.

Los cambios de estructura (tablas y columnas) siguen siendo migraciones SQL.

## Varios usuarios

- **Código:** diseño y estructura (pantallas, rueda de emociones, tiempos de comida, tipos de actividad, motor de porciones).
- **Base de datos:** catálogos comunes (alimentos, ejercicios, equivalencias de porciones con sus kcal por porción) y datos de cada usuario.
- **Administrador** (`app_admins`, `is_admin()`): corrige alimentos y ejercicios y carga el catálogo automático.
- **Alimentos:** un solo catálogo que todos ven. Los demás usuarios solo pueden agregar productos escaneados de
  Open Food Facts con kcal, proteína, carbohidratos y grasa; si falta algo, se pide al administrador.
- **Ejercicios:** catálogo común; cualquiera agrega (con aviso de nombres parecidos, `src/lib/exerciseMatch.js`).
  Lo personal (en qué días va cada ejercicio, archivado) está en `exercise_prefs`.
- **Rutina semanal** (`routines`) y **reglas de progresión** (`strength_settings`) por usuario; se editan en Fuerza → «⚙︎ Rutina».
