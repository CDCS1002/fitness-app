import { useEffect, useState } from 'preact/hooks';
import { saveMood, deleteMood, usedAreas } from '../lib/api.js';
import { getEmotion, searchEmotions, AREAS, INTENSITY } from '../lib/emotions.js';
import { EmotionWheel } from './EmotionWheel.jsx';

const nowHM = () => new Date().toTimeString().slice(0, 5);
const DETAILS = [
  { key: 'situacion', label: 'Situación', ph: '¿Qué pasó? ¿Dónde estabas, con quién?' },
  { key: 'pensamiento', label: 'Pensamientos', ph: '¿Qué pensaste en ese momento?' },
  { key: 'cuerpo', label: 'En el cuerpo', ph: '¿Qué sentiste físicamente?' },
  { key: 'accion', label: 'Qué hice', ph: '¿Cómo reaccionaste o qué hiciste después?' },
];

/** Registro de emociones en 3 pasos: emociones (rueda) → áreas → notas. */
export function MoodSheet({ date, kind, entry, onClose, onSaved, onDeleted }) {
  const [step, setStep] = useState('emociones');
  const [path, setPath] = useState([]);
  const [q, setQ] = useState('');
  const [info, setInfo] = useState(null);
  const [emotions, setEmotions] = useState(entry?.emotions || []);
  const [areas, setAreas] = useState(entry?.areas || []);
  const [extraAreas, setExtraAreas] = useState([]);
  const [custom, setCustom] = useState('');
  const [note, setNote] = useState(entry?.note || '');
  const [details, setDetails] = useState(entry?.details || {});
  const [showDetails, setShowDetails] = useState(Object.values(entry?.details || {}).some(Boolean));
  const [time, setTime] = useState(entry?.at_time ? String(entry.at_time).slice(0, 5) : nowHM());
  const [busy, setBusy] = useState(false);
  const k = entry?.kind || kind;

  useEffect(() => { usedAreas().then((a) => setExtraAreas(a.filter((x) => !AREAS.includes(x)))).catch(() => {}); }, []);

  const selected = new Set(emotions.map((x) => x.id));
  function pick(node) {
    if (!selected.has(node.id)) setEmotions((l) => [...l, { id: node.id, intensity: 3 }]);
    setInfo(null);
    setPath([]);
    setQ('');
  }
  const remove = (id) => setEmotions((l) => l.filter((x) => x.id !== id));
  const setIntensity = (id, v) => setEmotions((l) => l.map((x) => (x.id === id ? { ...x, intensity: v } : x)));
  const toggleArea = (a) => setAreas((l) => (l.includes(a) ? l.filter((x) => x !== a) : [...l, a]));
  function addCustom(e) {
    e.preventDefault();
    const a = custom.trim();
    if (!a) return;
    if (!AREAS.includes(a) && !extraAreas.includes(a)) setExtraAreas((l) => [...l, a]);
    if (!areas.includes(a)) setAreas((l) => [...l, a]);
    setCustom('');
  }

  async function save() {
    setBusy(true);
    try {
      const row = await saveMood({
        id: entry?.id,
        day: date,
        kind: k,
        at_time: k === 'momento' ? time || null : null,
        emotions,
        areas,
        note: note.trim() || null,
        details: Object.fromEntries(Object.entries(details).filter(([, v]) => String(v || '').trim())),
      });
      onSaved(row);
    } catch (err) { alert(err.message); setBusy(false); }
  }

  async function remove_() {
    if (!confirm('¿Eliminar este registro?')) return;
    try { await deleteMood(entry.id); onDeleted(entry.id); } catch (err) { alert(err.message); }
  }

  const node = path.at(-1);
  const results = searchEmotions(q);
  const list = node ? node.children : [];
  const STEPS = ['emociones', 'areas', 'notas'];

  return (
    <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet" role="dialog" aria-modal="true">
        <header class="sheet-head">
          <button class="link" onClick={step === 'emociones' ? onClose : () => setStep(STEPS[STEPS.indexOf(step) - 1])}>
            {step === 'emociones' ? 'Cerrar' : '‹ Atrás'}
          </button>
          <b>{k === 'dia' ? '¿Cómo me sentí hoy?' : '¿Cómo me siento ahora?'}</b>
          <span class="muted small">{STEPS.indexOf(step) + 1}/3</span>
        </header>

        {step === 'emociones' && (
          <div class="sheet-body mood-step">
            <input class="search" type="search" placeholder="Buscar una emoción (ej. frustrado)…" value={q} onInput={(e) => setQ(e.currentTarget.value)} />
            {q.trim() ? (
              <ul class="emo-list">
                {results.map((x) => (
                  <li key={x.node.id}>
                    <button class="emo-item" onClick={() => pick(x.node)}>
                      <i style={`background:${x.core.color}`} />
                      <span><b>{x.node.name}</b><small class="muted"> {x.path.slice(0, -1).map((p) => p.name).join(' › ')}</small></span>
                      <span class={selected.has(x.node.id) ? 'up' : 'muted'}>{selected.has(x.node.id) ? '✓' : '+'}</span>
                    </button>
                    <button class="info-btn" aria-label={`Qué significa ${x.node.name}`} onClick={() => setInfo(x.node)}>i</button>
                  </li>
                ))}
                {!results.length && <li class="muted empty">No encontré esa palabra en la rueda.</li>}
              </ul>
            ) : (
              <>
                <p class="muted hint center">{node ? 'Toca una emoción para ir más adentro, o elige esta.' : 'Empieza por la emoción más general y ve hacia afuera.'}</p>
                <EmotionWheel path={path} selected={selected} onOpen={(n) => setPath((p) => [...p, n])} onPick={pick} onBack={() => setPath((p) => p.slice(0, -1))} />
                {node && (
                  <div class="emo-current">
                    <button class="btn primary" onClick={() => pick(node)}>{selected.has(node.id) ? '✓ ' : ''}Elegir «{node.name}»</button>
                    <button class="info-btn big" aria-label={`Qué significa ${node.name}`} onClick={() => setInfo(node)}>i</button>
                  </div>
                )}
                {node && (
                  <ul class="emo-list">
                    {list.map((c) => (
                      <li key={c.id}>
                        <button class="emo-item" onClick={() => (c.children?.length ? setPath((p) => [...p, c]) : pick(c))}>
                          <i style={`background:${path[0].color}`} />
                          <span><b>{c.name}</b><small class="muted"> {c.def}</small></span>
                          <span class={selected.has(c.id) ? 'up' : 'muted'}>{selected.has(c.id) ? '✓' : c.children?.length ? '›' : '+'}</span>
                        </button>
                        <button class="info-btn" aria-label={`Qué significa ${c.name}`} onClick={() => setInfo(c)}>i</button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {emotions.length > 0 && (
              <div class="emo-selected">
                <p class="section-label">Lo que sientes · intensidad</p>
                {emotions.map((em) => {
                  const x = getEmotion(em.id);
                  if (!x) return null;
                  return (
                    <div class="emo-sel" key={em.id} style={`--c:${x.core.color}`}>
                      <div class="emo-sel-head">
                        <span><b>{x.node.name}</b><small class="muted"> {x.path.slice(0, -1).map((p) => p.name).join(' › ')}</small></span>
                        <button class="link danger" aria-label={`Quitar ${x.node.name}`} onClick={() => remove(em.id)}>✕</button>
                      </div>
                      <div class="intensity" role="radiogroup" aria-label={`Intensidad de ${x.node.name}`}>
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button key={v} role="radio" aria-checked={em.intensity === v} aria-label={INTENSITY[v]}
                            class={v <= em.intensity ? 'on' : ''} onClick={() => setIntensity(em.id, v)} />
                        ))}
                        <span class="muted small">{INTENSITY[em.intensity]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button class="btn primary wide" disabled={!emotions.length} onClick={() => setStep('areas')}>Continuar</button>
          </div>
        )}

        {step === 'areas' && (
          <div class="sheet-body mood-step">
            <p class="muted hint">¿Qué crees que está influyendo? Puedes elegir varias o ninguna.</p>
            <div class="chips">
              {[...AREAS, ...extraAreas].map((a) => (
                <button key={a} class={areas.includes(a) ? 'on' : ''} onClick={() => toggleArea(a)}>{a}</button>
              ))}
            </div>
            <form class="manual-code" onSubmit={addCustom}>
              <input placeholder="Otra área…" value={custom} onInput={(e) => setCustom(e.currentTarget.value)} />
              <button class="btn ghost" disabled={!custom.trim()}>Agregar</button>
            </form>
            <button class="btn primary wide" onClick={() => setStep('notas')}>Continuar</button>
          </div>
        )}

        {step === 'notas' && (
          <div class="sheet-body mood-step form">
            {k === 'momento' && <label>Hora<input type="time" value={time} onInput={(e) => setTime(e.currentTarget.value)} /></label>}
            <label>¿Por qué crees que te sientes así?
              <textarea rows="5" value={note} placeholder="Cuéntalo con tus palabras. Es opcional." onInput={(e) => setNote(e.currentTarget.value)} />
            </label>
            <button type="button" class="link" onClick={() => setShowDetails(!showDetails)}>{showDetails ? '− Ocultar detalles' : '+ Más detalles (opcional)'}</button>
            {showDetails && DETAILS.map((d) => (
              <label key={d.key}>{d.label}
                <textarea rows="2" placeholder={d.ph} value={details[d.key] || ''} onInput={(e) => setDetails({ ...details, [d.key]: e.currentTarget.value })} />
              </label>
            ))}
            <button class="btn primary wide" disabled={busy} onClick={save}>{busy ? 'Guardando…' : 'Guardar'}</button>
            {entry && <button class="link danger center" onClick={remove_}>Eliminar registro</button>}
          </div>
        )}

        {info && <EmotionInfo node={info} selected={selected.has(info.id)} onPick={() => pick(info)} onClose={() => setInfo(null)} />}
      </div>
    </div>
  );
}

function EmotionInfo({ node, selected, onPick, onClose }) {
  const x = getEmotion(node.id);
  return (
    <div class="info-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="info-card" role="dialog" aria-modal="true" style={`--c:${x.core.color}`}>
        <p class="muted small">{x.path.map((p) => p.name).join(' › ')}</p>
        <h3>{node.name}</h3>
        <p>{node.def}</p>
        {(node.body || x.path.at(-2)?.body) && (
          <p><b>En el cuerpo:</b> {node.body || x.path.at(-2).body}</p>
        )}
        {node.vs && <p class="muted">{node.vs}</p>}
        <div class="info-actions">
          <button class="link" onClick={onClose}>Cerrar</button>
          <button class="btn primary" onClick={onPick}>{selected ? '✓ Elegida' : 'Me identifico'}</button>
        </div>
      </div>
    </div>
  );
}
