import test from 'node:test';
import assert from 'node:assert/strict';
import { hashFood, planSync, catalogKey, canonical } from '../src/lib/catalog.js';

const base = { name: 'Lomito de res', brand: null, state: 'cocido', barcode: null, category: 'Carnes', primary_group: 'proteina', protein_source: false,
  kcal: 207, protein: 28.6, carbs: 0, fat: 9.4, fiber: 0, portions_override: null, source: 'tabla', verified: true,
  measures: [{ label: 'porción de 3 oz (85 g)', grams: 85, is_default: true }, { label: '1 oz (30 g)', grams: 30, is_default: false }] };
const item = (f) => ({ key: catalogKey(f), hash: hashFood(f), ...f });

test('la huella no depende del orden de llaves ni de medidas, ni de números como texto', () => {
  const a = { ...base, portions_override: { proteina: 5.4762, grasa: 0.3333 } };
  const b = { ...base, kcal: '207.000', portions_override: { grasa: 0.3333, proteina: 5.4762 }, measures: [...base.measures].reverse() };
  assert.equal(hashFood(a), hashFood(b));
  assert.notEqual(hashFood(a), hashFood({ ...a, kcal: 208 }));
  assert.equal(canonical(base).measures[0].label, '1 oz (30 g)');
});

test('llave estable sin tildes', () => {
  assert.equal(catalogKey({ name: 'Jugo de piña natural', brand: null, state: null }), 'generico.jugo-de-pina-natural.na');
  assert.equal(catalogKey({ name: 'Whey Protein galleta', brand: 'Perform', state: null }), 'perform.whey-protein-galleta.na');
});

test('nuevo → insertar; existente de un script → enlazar sin duplicar', () => {
  const it = item(base);
  const other = item({ ...base, name: 'Corvina' });
  const plan = planSync([it, other], [{ id: 'f1', catalog_key: null, catalog_hash: null, ...base }]);
  assert.deepEqual(plan.inserts.map((x) => x.name), ['Corvina']);
  assert.deepEqual(plan.adopts, [{ id: 'f1', item: it, hash: it.hash }]);
});

test('enlaza por código de barras aunque cambie el nombre', () => {
  const f = { ...base, name: 'Atún en agua', barcode: '7441078261352' };
  const plan = planSync([item(f)], [{ id: 'f1', catalog_key: null, catalog_hash: null, ...base, name: 'Atun lata', barcode: '7441078261352' }]);
  assert.equal(plan.adopts.length, 1);
  assert.equal(plan.adopts[0].hash, null); // valores distintos: queda enlazado pero no se toca
  assert.equal(plan.inserts.length, 0);
});

test('corrección del catálogo: se aplica si no lo editaste, se respeta si lo editaste', () => {
  const old = item(base);
  const fixed = item({ ...base, kcal: 210 });
  const untouched = { id: 'f1', catalog_key: old.key, catalog_hash: old.hash, ...base };
  const edited = { id: 'f1', catalog_key: old.key, catalog_hash: old.hash, ...base, fat: 7 };
  assert.deepEqual(planSync([fixed], [untouched]).updates.map((u) => u.id), ['f1']);
  const p = planSync([fixed], [edited]);
  assert.equal(p.updates.length, 0);
  assert.equal(p.kept.length, 1);
  // Sin cambios en el catálogo: nada que hacer
  const same = planSync([old], [untouched]);
  assert.deepEqual([same.inserts.length, same.updates.length, same.adopts.length, same.kept.length], [0, 0, 0, 0]);
});

test('un alimento enlazado sin huella se retoma cuando coincide con el catálogo', () => {
  const it = item(base);
  const p = planSync([it], [{ id: 'f1', catalog_key: it.key, catalog_hash: null, ...base }]);
  assert.deepEqual(p.adopts.map((a) => [a.id, a.hash]), [['f1', it.hash]]);
  const q = planSync([it], [{ id: 'f1', catalog_key: it.key, catalog_hash: null, ...base, kcal: 1 }]);
  assert.equal(q.kept.length, 1);
});
