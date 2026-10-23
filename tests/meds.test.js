import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dsldUpc, mapDsld, medsForDay, doseLabel, ingredientsLabel } from '../src/lib/meds.js';

test('UPC con el formato del NIH', () => {
  assert.equal(dsldUpc('748927025736'), '7 48927 02573 6');
  assert.equal(dsldUpc('0748927025736'), '7 48927 02573 6');
  assert.equal(dsldUpc('7441001603402'), null); // EAN-13 de Centroamérica: no está en el NIH
});

test('Etiqueta del NIH → formulario (creatina ON real)', () => {
  const label = {
    fullName: 'Micronized Creatine Powder Unflavored', brandName: 'ON Optimum Nutrition',
    servingSizes: [{ minQuantity: 5.25, unit: 'Gram(s)' }],
    physicalState: { langualCodeDescription: 'Powder' },
    ingredientRows: [{ name: 'Creatine Monohydrate', quantity: [{ quantity: 5, unit: 'Gram(s)' }] }],
  };
  const r = mapDsld(label, '748927025736');
  assert.equal(r.form, 'polvo');
  assert.equal(r.dose_amount, 5.25);
  assert.equal(r.dose_unit, 'g');
  assert.deepEqual(r.ingredients, [{ name: 'Creatine Monohydrate', amount: 5, unit: 'g' }]);
  assert.equal(ingredientsLabel(r.ingredients), 'Creatine Monohydrate 5 g');
});

test('Tomas del día: programados por día de la semana y orden por hora', () => {
  const meds = [
    { id: 'mg', name: 'Magnesio', active: true, days: [1, 2, 3, 4, 5, 6, 7], times: ['21:00'], dose_amount: 2, dose_unit: 'cápsula' },
    { id: 'cr', name: 'Creatina', active: true, days: [1, 2, 3, 4, 5], times: ['08:00'], dose_amount: 5, dose_unit: 'g' },
    { id: 'fe', name: 'Hierro', active: false, days: [1, 2, 3, 4, 5, 6, 7], times: [] },
  ];
  const vie = medsForDay(meds, [{ med_id: 'cr', taken_at: '08:10' }], '2026-10-23');
  assert.deepEqual(vie.map((x) => [x.med.id, x.planned, x.taken.length]), [['cr', 1, 1], ['mg', 1, 0]]);
  const sab = medsForDay(meds, [], '2026-10-24');
  assert.deepEqual(sab.map((x) => x.med.id), ['mg']);
  assert.equal(doseLabel(meds[1]), '5 g');
  assert.equal(doseLabel(meds[0]), '2 cápsulas');
});
