import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WHEEL, ALL_EMOTIONS, getEmotion, searchEmotions, balance } from '../src/lib/emotions.js';

test('La rueda tiene 6 base, 36 intermedias y 72 específicas, todas con definición', () => {
  assert.equal(WHEEL.length, 6);
  assert.equal(ALL_EMOTIONS.filter((x) => x.level === 1).length, 36);
  assert.equal(ALL_EMOTIONS.filter((x) => x.level === 2).length, 72);
  assert.ok(ALL_EMOTIONS.every((x) => x.node.def && x.node.def.length > 10));
  assert.equal(new Set(ALL_EMOTIONS.map((x) => x.node.id)).size, ALL_EMOTIONS.length);
  assert.ok(ALL_EMOTIONS.filter((x) => x.level < 2).every((x) => x.node.body));
});

test('Ruta de adentro hacia afuera', () => {
  const x = getEmotion('preocupado');
  assert.deepEqual(x.path.map((n) => n.name), ['Miedo', 'Ansioso', 'Preocupado']);
  assert.equal(x.core.id, 'miedo');
});

test('Buscador sin tildes', () => {
  assert.equal(searchEmotions('frustr')[0].node.name, 'Frustrado');
  assert.equal(searchEmotions('energico')[0].node.name, 'Enérgico');
});

test('Balance ponderado por intensidad', () => {
  assert.equal(balance([{ id: 'orgulloso', intensity: 4 }]), 1);
  assert.equal(balance([{ id: 'orgulloso', intensity: 3 }, { id: 'agobiado', intensity: 3 }]), 0);
  assert.equal(balance([]), null);
});
