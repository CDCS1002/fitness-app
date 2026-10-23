import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stagesSummary, stageFields, fmtMin } from '../src/lib/sleep.js';

test('Total dormido y porcentajes como en Apple Salud', () => {
  const s = stagesSummary({ sleep_awake_min: 28, sleep_rem_min: 95, sleep_core_min: 280, sleep_deep_min: 60 });
  assert.equal(s.asleepMin, 435);
  assert.equal(s.totalMin, 463);
  assert.deepEqual(s.items.map((i) => i.pct), [6, 21, 60, 13]);
  assert.equal(s.items.reduce((a, i) => a + i.pct, 0), 100);
});

test('Lo escrito en h y min se guarda en minutos y actualiza el total dormido', () => {
  const f = stageFields({ awake: { h: '0', m: '28' }, rem: { h: '1', m: '35' }, core: { h: '4', m: '40' }, deep: { h: '1', m: '' } });
  assert.deepEqual(f, { sleep_awake_min: 28, sleep_rem_min: 95, sleep_core_min: 280, sleep_deep_min: 60, sleep_h: 7.25 });
  assert.equal(fmtMin(435), '7 h 15 min');
  assert.equal(fmtMin(28), '28 min');
});

test('Sin fases no toca el total', () => {
  assert.deepEqual(stageFields({}), { sleep_awake_min: null, sleep_rem_min: null, sleep_core_min: null, sleep_deep_min: null });
});
