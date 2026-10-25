import test from 'node:test';
import assert from 'node:assert/strict';
import { entryPatches, canEditFood } from '../src/lib/foodEdit.js';

const groups = undefined; // grupos por defecto
const old = [{ id: 'm1', label: 'scoop', grams: 3 }]; // error: eran 30 g
const fixedFood = { name: 'Proteína Perform', brand: 'Perform', state: null, primary_group: 'proteina', protein_source: false, kcal: 380, protein: 80, carbs: 6, fat: 4, fiber: null };

test('corregir los gramos de una medida recalcula los registros hechos con esa medida', () => {
  const entries = [
    { id: 'e1', measure_label: 'scoop', quantity: 1, grams: 3, kcal: 11.4, portions: { proteina: 0.34 }, food_name: 'Proteina Perform', food_brand: 'Perform' },
    { id: 'e2', measure_label: 'g', quantity: 15, grams: 15, kcal: 57, portions: { proteina: 1.71 }, food_name: 'Proteína Perform', food_brand: 'Perform' },
  ];
  const out = entryPatches(entries, old, [{ id: 'm1', label: 'scoop', grams: 30 }], fixedFood, groups);
  const e1 = out.find((x) => x.id === 'e1').patch;
  assert.equal(e1.grams, 30);
  assert.equal(e1.kcal, 114);
  assert.equal(e1.food_name, 'Proteína Perform');
  assert.ok(e1.portions.proteina > 3.4 && e1.portions.proteina < 3.5);
  // El registro en gramos conserva sus gramos
  const e2 = out.find((x) => x.id === 'e2');
  assert.ok(!e2 || e2.patch.grams === 15);
});

test('renombrar una medida actualiza el nombre en el registro', () => {
  const entries = [{ id: 'e1', measure_label: 'scoop', quantity: 2, grams: 60, kcal: 228, portions: { proteina: 6.86 }, food_name: 'Proteína Perform', food_brand: 'Perform' }];
  const [p] = entryPatches(entries, [{ id: 'm1', label: 'scoop', grams: 30 }], [{ id: 'm1', label: 'medida', grams: 30 }], fixedFood, groups);
  assert.equal(p.patch.measure_label, 'medida');
  assert.equal(p.patch.grams, 60);
});

test('solo se editan alimentos propios creados a mano', () => {
  assert.equal(canEditFood({ created_by: 'u1', source: 'etiqueta' }, 'u1'), true);
  assert.equal(canEditFood({ created_by: 'u1', source: 'openfoodfacts' }, 'u1'), false);
  assert.equal(canEditFood({ created_by: null, source: 'tabla' }, 'u1'), false);
  assert.equal(canEditFood({ created_by: 'u2', source: 'etiqueta' }, 'u1'), false);
});
