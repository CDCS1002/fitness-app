/**
 * Rueda de emociones (transcrita de la rueda que usa el usuario): 6 emociones base,
 * 36 intermedias y 72 específicas. Cada una trae una definición corta; las base e
 * intermedias, además, cómo suele sentirse en el cuerpo, y algunas, en qué se diferencian
 * de otras parecidas. Son descripciones generales, no clínicas.
 *
 * valence: +1 agradable, 0 neutra/mixta, -1 desagradable (para los patrones del reporte).
 */
const e = (id, name, def, extra = {}, children = []) => ({ id, name, def, ...extra, children });

export const WHEEL = [
  e('felicidad', 'Felicidad', 'Estado agradable de bienestar y satisfacción con lo que está pasando.', {
    color: '#f0a04b', valence: 1, body: 'Cuerpo ligero, respiración tranquila, ganas de sonreír y de moverte.',
  }, [
    e('alegre', 'Alegre', 'Contento de forma viva y expansiva.', { body: 'Energía alta, sonrisa fácil, ganas de compartir.' }, [
      e('liberado', 'Liberado', 'Sentir que te quitaste un peso de encima o que eres libre de una presión.'),
      e('euforico', 'Eufórico', 'Alegría muy intensa, casi desbordada.', { vs: 'Más intenso que alegre; puede ir con impulsividad.' }),
    ]),
    e('interesado', 'Interesado', 'Atención y deseo de saber más sobre algo o alguien.', { body: 'Mente despierta, mirada enfocada.' }, [
      e('curioso', 'Curioso', 'Ganas de explorar, preguntar o descubrir.'),
      e('entretenido', 'Entretenido', 'Disfrutar de algo que te mantiene ocupado y a gusto.'),
    ]),
    e('orgulloso', 'Orgulloso', 'Satisfacción por un logro propio o de alguien cercano.', { body: 'Postura erguida, pecho abierto.' }, [
      e('seguro', 'Seguro', 'Confianza en ti y en tus capacidades.'),
      e('importante', 'Importante', 'Sentir que lo que haces o eres tiene valor y peso.'),
    ]),
    e('aceptado', 'Aceptado', 'Sentirte parte de algo y recibido tal como eres.', { body: 'Calma, hombros relajados.' }, [
      e('satisfecho', 'Satisfecho', 'Sensación de que lo que hay es suficiente y está bien.'),
      e('respetado', 'Respetado', 'Sentir que los demás toman en cuenta tus límites, ideas y valor.'),
    ]),
    e('poderoso', 'Poderoso', 'Sentirte capaz de influir en lo que pasa y de enfrentar retos.', { body: 'Energía firme, sensación de fuerza.' }, [
      e('provocativo', 'Provocativo', 'Con ganas de retar, desafiar o generar reacción.'),
      e('valiente', 'Valiente', 'Actuar a pesar del miedo.'),
    ]),
    e('pacifico', 'Pacífico', 'Tranquilidad interna, sin conflicto.', { body: 'Respiración lenta, músculos sueltos.' }, [
      e('carinoso', 'Cariñoso', 'Ternura y afecto hacia alguien.'),
      e('esperanzado', 'Esperanzado', 'Confianza en que algo bueno puede pasar.'),
    ]),
    e('intimo', 'Íntimo', 'Cercanía y conexión profunda con alguien.', { body: 'Calidez, apertura.' }, [
      e('sensible', 'Sensible', 'Abierto a sentir con intensidad lo propio y lo de otros.'),
      e('bromista', 'Bromista', 'Con ganas de jugar y hacer reír desde la confianza.'),
    ]),
    e('optimista', 'Optimista', 'Ver el futuro con expectativa positiva.', { body: 'Energía disponible, motivación.' }, [
      e('inspirado', 'Inspirado', 'Motivado por una idea, persona o experiencia a crear o mejorar.'),
      e('abierto', 'Abierto', 'Dispuesto a recibir nuevas ideas, personas o experiencias.'),
    ]),
  ]),
  e('sorpresa', 'Sorpresa', 'Reacción breve ante algo inesperado; puede ser agradable o desagradable.', {
    color: '#e8d44d', valence: 0, body: 'Sobresalto, ojos abiertos, respiración que se detiene un instante.',
  }, [
    e('sorprendido', 'Sorprendido', 'Impactado por algo que no esperabas.', { body: 'Sobresalto, alerta repentina.' }, [
      e('conmocionado', 'Conmocionado', 'Golpe emocional fuerte ante algo inesperado.', { vs: 'Más intenso y desagradable que sorprendido.' }),
      e('abatido', 'Abatido', 'Desanimado de golpe por una noticia o hecho inesperado.'),
    ]),
    e('confundido', 'Confundido', 'No entender bien lo que pasa o qué hacer.', { body: 'Mente nublada, dificultad para decidir.' }, [
      e('desilusionado', 'Desilusionado', 'Algo resultó distinto (peor) de lo que creías.'),
      e('perplejo', 'Perplejo', 'Desconcertado, sin saber cómo interpretar algo.'),
    ]),
    e('asombrado', 'Asombrado', 'Admiración o maravilla ante algo extraordinario.', { body: 'Boca abierta, atención total.' }, [
      e('estupefacto', 'Estupefacto', 'Tan asombrado que te quedas sin reacción.'),
      e('impresionado', 'Impresionado', 'Algo te causó una fuerte y buena impresión.'),
    ]),
    e('entusiasmado', 'Entusiasmado', 'Emoción anticipada y ganas por algo que viene.', { body: 'Inquietud agradable, energía alta.' }, [
      e('entusiasta', 'Entusiasta', 'Con ánimo y energía para involucrarte.'),
      e('energico', 'Enérgico', 'Lleno de energía y ganas de actuar.'),
    ]),
  ]),
  e('miedo', 'Miedo', 'Respuesta ante un peligro o amenaza, real o imaginada.', {
    color: '#9aa3ad', valence: -1, body: 'Corazón acelerado, tensión, estómago apretado, ganas de huir o paralizarte.',
  }, [
    e('asustado', 'Asustado', 'Miedo ante algo concreto e inmediato.', { body: 'Sobresalto, pulso rápido.' }, [
      e('espantado', 'Espantado', 'Miedo repentino e intenso.'),
      e('aterrado', 'Aterrado', 'Miedo extremo que puede paralizar.'),
    ]),
    e('ansioso', 'Ansioso', 'Inquietud por algo que podría pasar en el futuro.', {
      body: 'Tensión, pensamientos que se repiten, dificultad para relajarte o dormir.',
      vs: 'El miedo es ante algo presente; la ansiedad, ante algo anticipado.',
    }, [
      e('preocupado', 'Preocupado', 'Pensar una y otra vez en un problema o posible resultado negativo.'),
      e('agobiado', 'Agobiado', 'Sentir que son demasiadas cosas y no das abasto.'),
    ]),
    e('inseguro', 'Inseguro', 'Dudar de ti, de tu valor o de cómo te ven.', { body: 'Encogerte, evitar mirar a los ojos.' }, [
      e('inferior', 'Inferior', 'Sentirte menos que otros.'),
      e('insuficiente', 'Insuficiente', 'Sentir que lo que haces o eres no alcanza.'),
    ]),
    e('sumiso', 'Sumiso', 'Ceder ante otros por miedo a las consecuencias.', { body: 'Postura baja, voz contenida.' }, [
      e('insignificante', 'Insignificante', 'Sentir que no importas o que no se te nota.'),
      e('inutil', 'Inútil', 'Sentir que no sirves o no aportas.'),
    ]),
    e('rechazado', 'Rechazado', 'Sentir que te apartan o no te quieren cerca.', { body: 'Nudo en la garganta, ganas de aislarte.' }, [
      e('alienado', 'Alienado', 'Desconectado o extraño frente a los demás.'),
      e('marginado', 'Marginado', 'Dejado de lado de forma deliberada.'),
    ]),
    e('humillado', 'Humillado', 'Sentirte rebajado o expuesto frente a otros.', { body: 'Calor en la cara, ganas de esconderte.' }, [
      e('ridiculizado', 'Ridiculizado', 'Que se burlen de ti.'),
      e('irrespetado', 'Irrespetado', 'Que no tomen en cuenta tu dignidad o tus límites.'),
    ]),
  ]),
  e('ira', 'Ira', 'Reacción ante algo que se percibe como injusto, una ofensa o un obstáculo.', {
    color: '#e5675f', valence: -1, body: 'Calor, mandíbula y puños apretados, tensión, impulso de actuar.',
  }, [
    e('herido', 'Herido', 'Dolor por algo que alguien hizo o dijo.', { body: 'Pecho apretado, mezcla de tristeza y enojo.' }, [
      e('apenado', 'Apenado', 'Incomodidad y vergüenza por una situación.'),
      e('devastado', 'Devastado', 'Profundamente dolido, sin fuerzas.'),
    ]),
    e('amenazado', 'Amenazado', 'Sentir que algo tuyo (lugar, relación, seguridad) está en riesgo.', { body: 'Alerta, defensiva.' }, [
      e('atacado', 'Atacado', 'Sentir que te agreden o te señalan.'),
      e('celoso', 'Celoso', 'Miedo a perder algo o a alguien ante otra persona.'),
    ]),
    e('lleno-de-odio', 'Lleno de odio', 'Aversión intensa y sostenida hacia alguien o algo.', { body: 'Tensión constante, pensamientos rumiantes.' }, [
      e('resentido', 'Resentido', 'Enojo guardado por algo del pasado que no se resolvió.'),
      e('ultrajado', 'Ultrajado', 'Sentir que pasaron por encima de ti o de tus valores.'),
    ]),
    e('loco', 'Loco', 'Enojo fuerte y desbordado.', { body: 'Calor intenso, impulso de gritar.' }, [
      e('furioso', 'Furioso', 'Ira muy intensa.'),
      e('rabioso', 'Rabioso', 'Ira intensa con dificultad para contenerla.'),
    ]),
    e('agresivo', 'Agresivo', 'Impulso de atacar o confrontar.', { body: 'Cuerpo listo para la acción.' }, [
      e('provocador', 'Provocador', 'Buscar el conflicto o la reacción del otro.'),
      e('hostil', 'Hostil', 'Actitud de rechazo y ataque hacia alguien.'),
    ]),
    e('frustrado', 'Frustrado', 'Enojo porque algo no sale como querías o te bloquean.', {
      body: 'Tensión, suspiros, impaciencia.',
      vs: 'La frustración viene de un obstáculo; la irritación, de algo que molesta.',
    }, [
      e('enfurecido', 'Enfurecido', 'Frustración que escaló a ira fuerte.'),
      e('irritado', 'Irritado', 'Molestia leve pero persistente.'),
    ]),
    e('distante', 'Distante', 'Alejarte emocionalmente como forma de protegerte.', { body: 'Frialdad, poca expresión.' }, [
      e('introvertido', 'Introvertido', 'Volcarte hacia adentro y evitar el contacto.'),
      e('desconfiado', 'Desconfiado', 'Sospechar de las intenciones de otros.'),
    ]),
    e('critico', 'Crítico', 'Juzgar con dureza a otros o a ti.', { body: 'Ceño fruncido, tensión en la cara.' }, [
      e('esceptico', 'Escéptico', 'Dudar de lo que te dicen o de que algo funcione.'),
      e('sarcastico', 'Sarcástico', 'Expresar enojo con ironía o burla.'),
    ]),
  ]),
  e('asco', 'Asco', 'Rechazo hacia algo que se percibe como desagradable, dañino o inmoral.', {
    color: '#4fc39a', valence: -1, body: 'Nariz arrugada, náusea, ganas de alejarte.',
  }, [
    e('disconforme', 'Disconforme', 'No estar de acuerdo con algo o alguien.', { body: 'Tensión, gesto de rechazo.' }, [
      e('moralista', 'Moralista', 'Juzgar algo como incorrecto según tus valores.'),
      e('reacio', 'Reacio', 'Resistencia a hacer o aceptar algo.'),
    ]),
    e('decepcionado', 'Decepcionado', 'Alguien o algo no cumplió lo que esperabas.', {
      body: 'Desánimo, pesadez.',
      vs: 'La decepción es hacia algo o alguien; la desilusión, sobre una expectativa propia.',
    }, [
      e('repugnante', 'Repugnante', 'Rechazo fuerte hacia algo que te parece desagradable.'),
      e('revoltoso', 'Revoltoso', 'Inquietud y rechazo que te mueven a rebelarte.'),
    ]),
    e('horrible', 'Horrible', 'Algo te resulta muy desagradable o difícil de tolerar.', { body: 'Malestar físico, rechazo.' }, [
      e('asqueado', 'Asqueado', 'Asco intenso, incluso físico.'),
      e('odioso', 'Odioso', 'Algo te parece detestable.'),
    ]),
    e('abstinencia', 'Abstinencia', 'Evitar o apartarte de algo que te genera rechazo.', { body: 'Distancia, cuerpo que se cierra.' }, [
      e('aversion', 'Aversión', 'Rechazo que te hace evitar algo.'),
      e('vacilante', 'Vacilante', 'Dudar entre acercarte o alejarte.'),
    ]),
  ]),
  e('tristeza', 'Tristeza', 'Respuesta ante una pérdida, una decepción o algo que duele.', {
    color: '#9b7be0', valence: -1, body: 'Pesadez, poca energía, nudo en la garganta, ganas de llorar o de estar solo.',
  }, [
    e('culpable', 'Culpable', 'Sentir que hiciste algo mal o dañaste a alguien.', {
      body: 'Peso en el pecho, pensamientos sobre lo que pasó.',
      vs: 'La culpa es por lo que hiciste; la vergüenza, por cómo te ves tú.',
    }, [
      e('arrepentido', 'Arrepentido', 'Desear no haber hecho o dicho algo.'),
      e('avergonzado', 'Avergonzado', 'Malestar por cómo te ven o por cómo te ves tú mismo.'),
    ]),
    e('abandonado', 'Abandonado', 'Sentir que te dejaron solo cuando necesitabas a alguien.', { body: 'Vacío, ganas de buscar o de aislarte.' }, [
      e('ignorado', 'Ignorado', 'Que no te tomen en cuenta.'),
      e('victimizado', 'Victimizado', 'Sentir que te trataron injustamente o te hicieron daño.'),
    ]),
    e('desesperado', 'Desesperado', 'Sentir que no hay salida o que nada va a mejorar.', { body: 'Agitación o agotamiento total.' }, [
      e('desvalido', 'Desvalido', 'Sin recursos ni fuerza para cambiar la situación.'),
      e('vulnerable', 'Vulnerable', 'Expuesto, frágil ante lo que pueda pasar.'),
    ]),
    e('deprimido', 'Deprimido', 'Tristeza profunda y sostenida, con poca energía o interés.', {
      body: 'Cansancio, cambios en el sueño o el apetito.',
      vs: 'Como emoción del momento es distinta del diagnóstico de depresión; si se mantiene por semanas, coméntalo con tu psicóloga.',
    }, [
      e('melancolico', 'Melancólico', 'Tristeza suave, a veces con nostalgia.'),
      e('vacio', 'Vacío', 'Ausencia de emociones o de sentido.'),
    ]),
    e('solo', 'Solo', 'Sentir falta de compañía o de conexión.', { body: 'Vacío, ganas de contacto.' }, [
      e('desamparado', 'Desamparado', 'Sin apoyo ni protección.'),
      e('aislado', 'Aislado', 'Separado de los demás, por elección o no.'),
    ]),
    e('aburrido', 'Aburrido', 'Falta de interés o estímulo en lo que haces.', { body: 'Inquietud o letargo.' }, [
      e('apatico', 'Apático', 'Sin ganas ni interés en nada.'),
      e('indiferente', 'Indiferente', 'Nada te mueve ni te importa en ese momento.'),
    ]),
  ]),
];

/** Áreas que pueden estar influyendo. Las tres últimas conectan con el resto de la app. */
export const AREAS = [
  'Trabajo', 'Familia', 'Amistades', 'Pareja', 'Vida sentimental', 'Educación', 'Viajes', 'Clima', 'Dinero',
  'Salud', 'Condición física', 'Pasatiempos', 'Espiritualidad', 'Sueño/descanso', 'Alimentación', 'Entrenamiento',
];

/* ------------------------------ Índices ------------------------------ */
const INDEX = {};
(function walk(nodes, path) {
  for (const n of nodes) {
    const p = [...path, n];
    INDEX[n.id] = { node: n, path: p, core: p[0], level: p.length - 1 };
    walk(n.children || [], p);
  }
})(WHEEL, []);

export const getEmotion = (id) => INDEX[id] || null;
export const ALL_EMOTIONS = Object.values(INDEX);

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Búsqueda por palabra (sin tildes). Prioriza las que empiezan con el texto. */
export function searchEmotions(q) {
  const t = norm(q.trim());
  if (!t) return [];
  return ALL_EMOTIONS
    .filter((x) => norm(x.node.name).includes(t))
    .sort((a, b) => Number(!norm(a.node.name).startsWith(t)) - Number(!norm(b.node.name).startsWith(t)) || a.level - b.level)
    .slice(0, 12);
}

export const INTENSITY = ['', 'Muy leve', 'Leve', 'Moderada', 'Fuerte', 'Muy fuerte'];

/** Balance emocional de un conjunto de emociones: −1 (desagradable) a +1 (agradable), ponderado por intensidad. */
export function balance(emotions = []) {
  let num = 0, den = 0;
  for (const em of emotions) {
    const x = getEmotion(em.id);
    if (!x) continue;
    const w = Number(em.intensity || 3);
    num += x.core.valence * w;
    den += w;
  }
  return den ? num / den : null;
}
