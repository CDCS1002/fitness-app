/**
 * Al corregir un alimento creado por el usuario, recalcula sus registros:
 * - si se corrigieron los gramos de una medida, los registros hechos con esa medida
 *   toman los gramos nuevos (cantidad × gramos de la medida);
 * - si se renombró la medida, el registro toma el nombre nuevo;
 * - kcal, macros, porciones, nombre y marca se recalculan con los valores nuevos.
 */
import { macrosFor, portionsFor } from './portions.js';

const r2 = (n) => (n == null ? null : Math.round(n * 100) / 100);

/** El catálogo de alimentos es común: solo el administrador corrige alimentos. */
export function canEditFood(food, isAdmin) {
  return !!food && !!isAdmin;
}

/**
 * @param entries   registros del alimento (id, measure_label, quantity, grams, kcal, portions…)
 * @param oldMeasures medidas antes de editar ({ id, label, grams })
 * @param newMeasures medidas después ({ id?, label, grams }); las que conservan id son las mismas
 * @param food      alimento ya corregido (valores por 100 g)
 * @returns [{ id, patch }] solo de los registros que cambian
 */
export function entryPatches(entries, oldMeasures, newMeasures, food, groups) {
  const byOldLabel = Object.fromEntries(oldMeasures.map((m) => [m.label, m]));
  const byId = Object.fromEntries(newMeasures.filter((m) => m.id).map((m) => [m.id, m]));
  const name = food.name + (food.state ? ` · ${food.state}` : '');
  const out = [];
  for (const e of entries) {
    let grams = Number(e.grams);
    let label = e.measure_label;
    if (label !== 'g') {
      const old = byOldLabel[label];
      const now = old && byId[old.id];
      if (now) {
        grams = Number(e.quantity) * Number(now.grams);
        label = now.label;
      }
    }
    const m = macrosFor(food, grams);
    const portions = Object.fromEntries(Object.entries(portionsFor(food, grams, groups)).map(([k, v]) => [k, r2(v)]));
    const patch = {
      food_name: name, food_brand: food.brand ?? null, measure_label: label, grams: r2(grams),
      kcal: r2(m.kcal), protein: r2(m.protein), carbs: r2(m.carbs), fat: r2(m.fat), fiber: r2(m.fiber), portions,
    };
    const changed = Object.entries(patch).some(([k, v]) =>
      k === 'portions' ? JSON.stringify(v) !== JSON.stringify(e.portions || {}) : typeof v === 'number' ? v !== r2(Number(e[k])) : (v ?? null) !== (e[k] ?? null));
    if (changed) out.push({ id: e.id, patch });
  }
  return out;
}
