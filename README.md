# Porciones · Fitness App

PWA para registrar comidas por **porciones de intercambio** (proteína, carbohidrato, grasa, lácteo, vegetal, fruta), con macros y una base de alimentos con búsqueda por nombre y marca.

- **Frontend:** Vite + Preact, publicado en GitHub Pages (`/fitness-app/`), instalable en el celular.
- **Backend:** Supabase (Postgres + Auth + RLS). La llave publishable va en el frontend; la seguridad la imponen las políticas por fila.
- **Panel:** el Google Sheet existente sigue siendo el dashboard; la sincronización llega en una fase siguiente.

## Estructura

```
supabase/migrations/0001_schema.sql   tablas, RLS, búsqueda (pg_trgm + unaccent)
supabase/seed/foods.json              alimentos iniciales (editar aquí)
supabase/seed/0002_foods.sql          generado con `npm run seed`
src/lib/portions.js                   motor de porciones
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
