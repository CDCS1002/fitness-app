import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMoodReport, dayTone } from '../src/lib/moodReport.js';

const mood = (day, ids, extra = {}) => ({ day, kind: 'momento', at_time: '10:00', emotions: ids.map(([id, intensity]) => ({ id, intensity })), areas: [], ...extra });

test('Distribución, palabras frecuentes y áreas', () => {
  const r = buildMoodReport({
    from: '2026-10-19', to: '2026-10-25',
    moods: [
      mood('2026-10-19', [['preocupado', 4]], { areas: ['Trabajo'] }),
      mood('2026-10-20', [['preocupado', 3], ['orgulloso', 2]], { areas: ['Trabajo', 'Sueño/descanso'] }),
      mood('2026-10-21', [['satisfecho', 4]], { areas: ['Entrenamiento'] }),
      mood('2026-11-01', [['furioso', 5]]), // fuera del período
    ],
  });
  assert.equal(r.entries, 3);
  assert.equal(r.daysWithEntries, 3);
  assert.deepEqual(r.coreDist.map((c) => [c.id, c.n, c.pct]), [['felicidad', 2, 50], ['miedo', 2, 50]]);
  assert.equal(r.topWords[0].name, 'Preocupado');
  assert.deepEqual(r.topAreas[0], { name: 'Trabajo', n: 2 });
  assert.equal(r.avgIntensity, 3.3);
});

test('Patrones solo con al menos 3 días de cada tipo', () => {
  const days = {};
  const moods = [];
  for (let i = 0; i < 3; i++) {
    const good = `2026-10-0${i + 1}`, bad = `2026-10-1${i + 1}`;
    moods.push(mood(good, [['satisfecho', 4]]), mood(bad, [['agobiado', 4]]));
    days[good] = { sleepH: 7.5, energy: 4, trained: true, kcalInRange: true };
    days[bad] = { sleepH: 6, energy: 2, trained: i === 0, kcalInRange: false };
  }
  const r = buildMoodReport({ moods, days, from: '2026-10-01', to: '2026-10-31' });
  assert.equal(r.patterns.enough, true);
  assert.deepEqual([r.patterns.agradable.sleepH, r.patterns.desagradable.sleepH], [7.5, 6]);
  assert.deepEqual([r.patterns.agradable.trainedPct, r.patterns.desagradable.trainedPct], [100, 33]);
  assert.equal(r.patterns.desagradable.kcalInRangePct, 0);
  const few = buildMoodReport({ moods: moods.slice(0, 2), days, from: '2026-10-01', to: '2026-10-31' });
  assert.equal(few.patterns.enough, false);
});

test('Tono del día', () => {
  assert.equal(dayTone(0.6), 'agradable');
  assert.equal(dayTone(-0.5), 'desagradable');
  assert.equal(dayTone(0), 'mixto');
});
