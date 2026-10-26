import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapOFF, guessGroup, barcodeVariants } from '../src/lib/off.js';

test('Variantes de código UPC-A / EAN-13', () => {
  assert.deepEqual(barcodeVariants('041303001431'), ['041303001431', '0041303001431']);
  assert.deepEqual(barcodeVariants('0041303001431'), ['0041303001431', '041303001431']);
  assert.deepEqual(barcodeVariants('7441001603403'), ['7441001603403']);
});

test('Producto completo con valores por 100 g', () => {
  const r = mapOFF({
    code: '7441001603403',
    product_name: 'Galleta Maracuyá y Chía',
    brands: 'Nutri Snacks, Grupo X',
    serving_size: '1 galleta (24 g)',
    serving_quantity: 24,
    categories_tags: ['en:snacks', 'en:sweet-snacks', 'en:biscuits'],
    nutriments: { 'energy-kcal_100g': 437, proteins_100g: 6, carbohydrates_100g: 65, fat_100g: 17, fiber_100g: 4 },
  });
  assert.equal(r.name, 'Galleta Maracuyá y Chía');
  assert.equal(r.brand, 'Nutri Snacks');
  assert.equal(r.primary_group, 'carbohidrato');
  assert.equal(r.protein_source, false);
  assert.equal(r.kcal, 437);
  assert.equal(r.serving_label, 'galleta');
  assert.equal(r.serving_grams, 24);
  assert.equal(r.complete, true);
});

test('Solo valores por porción y energía en kJ → convierte a 100 g y kcal', () => {
  const r = mapOFF({
    code: '1', product_name_es: 'Proteína en polvo', product_name: 'Whey',
    serving_size: '1 scoop (33 g)', serving_quantity: 33, categories_tags: ['en:protein-powders'],
    nutriments: { energy_serving: 544, proteins_serving: 25, carbohydrates_serving: 3, fat_serving: 2 },
  });
  assert.equal(r.name, 'Proteína en polvo');
  assert.equal(r.primary_group, 'proteina');
  assert.equal(Math.round(r.kcal), 394);
  assert.equal(Math.round(r.protein * 10) / 10, 75.8);
  assert.equal(r.serving_label, 'scoop');
});

test('Categorías: lácteos, quesos, jugos y grasas', () => {
  assert.equal(guessGroup(['en:dairies', 'en:milks', 'en:skimmed-milks'], {}), 'lacteo');
  assert.equal(guessGroup(['en:dairies', 'en:cheeses'], {}), 'proteina');
  assert.equal(guessGroup(['en:beverages', 'en:fruit-juices', 'en:orange-juices'], {}), 'fruta');
  assert.equal(guessGroup(['en:nuts', 'en:cashew-nuts'], {}), 'grasa');
  assert.equal(guessGroup([], { protein: 2, carbs: 4, fat: 30 }), 'grasa');
});

test('Datos incompletos se marcan para revisar', () => {
  const r = mapOFF({ code: '2', product_name: 'X', nutriments: { 'energy-kcal_100g': 100 } });
  assert.equal(r.complete, false);
  assert.equal(r.protein, '');
  assert.equal(r.serving_grams, '');
});

test('leche con proteína sin categoría: lácteo por el nombre y el extra cuenta como proteína', async () => {
  const { portionsFor, roundedPortions } = await import('../src/lib/portions.js');
  const p = { code: '7441000000000', product_name: 'Leche 50% + Proteína Choco Almendras', brands: 'Dos Pinos', categories_tags: [],
    nutriments: { 'energy-kcal_100g': 64, proteins_100g: 6, carbohydrates_100g: 6, fat_100g: 1.6 }, serving_size: '250 ml', serving_quantity: 250 };
  const r = mapOFF(p);
  assert.equal(r.primary_group, 'lacteo');
  assert.equal(r.protein_source, true);
  const food = { primary_group: r.primary_group, protein_source: r.protein_source, kcal: r.kcal, protein: r.protein, carbs: r.carbs, fat: r.fat };
  const por = roundedPortions(portionsFor(food, 250));
  // 15 g de carbohidratos → 1¼ lácteo (redondea a 1½); 15 − 10 g de proteína → ½ proteína
  assert.equal(por.lacteo, 1.5);
  assert.equal(por.proteina, 0.5);
  assert.equal(por.carbohidrato, undefined);
});

test('nombres que no son lácteo de la lista', () => {
  assert.equal(guessGroup([], { protein: 80, carbs: 6, fat: 5 }, 'Whey protein leche'), 'proteina');
  assert.equal(guessGroup([], { protein: 25, carbs: 2, fat: 30 }, 'Queso de leche de vaca'), 'grasa');
  assert.equal(guessGroup([], { protein: 7, carbs: 55, fat: 8 }, 'Dulce de leche'), 'carbohidrato');
  assert.equal(guessGroup([], { protein: 3.3, carbs: 4.8, fat: 1 }, 'Leche semidescremada'), 'lacteo');
});
