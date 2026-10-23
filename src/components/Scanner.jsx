import { useEffect, useRef, useState } from 'preact/hooks';
import { BarcodeDetector, prepareZXingModule } from 'barcode-detector/ponyfill';
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url';

// El lector (zxing compilado a WebAssembly) se sirve desde la propia app, no desde un CDN.
prepareZXingModule({
  overrides: { locateFile: (path, prefix) => (path.endsWith('.wasm') ? wasmUrl : prefix + path) },
});

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

/**
 * Cámara trasera + lector de códigos de barras. Llama a onCode una sola vez.
 * Si la cámara no está disponible, permite escribir el código a mano.
 */
export function Scanner({ onCode, onCancel }) {
  const video = useRef(null);
  const [status, setStatus] = useState('starting'); // starting | scanning | error
  const [error, setError] = useState('');
  const [manual, setManual] = useState('');
  const done = useRef(false);

  useEffect(() => {
    let stream;
    let timer;
    let cancelled = false;
    const detector = new BarcodeDetector({ formats: FORMATS });

    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador no permite usar la cámara.');
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        const v = video.current;
        v.srcObject = stream;
        await v.play();
        setStatus('scanning');
        tick();
      } catch (err) {
        setStatus('error');
        setError(err.name === 'NotAllowedError'
          ? 'No hay permiso para usar la cámara. Actívalo en Ajustes → Safari → Cámara, o escribe el código abajo.'
          : err.message || 'No se pudo abrir la cámara.');
      }
    }

    async function tick() {
      if (cancelled || done.current) return;
      const v = video.current;
      if (v && v.readyState >= 2) {
        try {
          const codes = await detector.detect(v);
          const hit = codes.find((c) => /^\d{8,14}$/.test(c.rawValue));
          if (hit && !done.current) {
            done.current = true;
            onCode(hit.rawValue);
            return;
          }
        } catch { /* cuadro sin código: seguir */ }
      }
      timer = setTimeout(tick, 120);
    }

    start();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function submitManual(e) {
    e.preventDefault();
    const code = manual.replace(/\D/g, '');
    if (code.length >= 8 && !done.current) {
      done.current = true;
      onCode(code);
    }
  }

  return (
    <>
      <header class="sheet-head">
        <b>Escanear código</b>
        <button class="link" onClick={onCancel}>Cancelar</button>
      </header>
      <div class="sheet-body">
        <div class={`viewfinder ${status}`}>
          <video ref={video} playsInline muted autoPlay />
          <div class="frame" aria-hidden="true"><span /></div>
          {status === 'starting' && <p class="vf-msg">Abriendo cámara…</p>}
        </div>
        {status === 'scanning' && <p class="muted center">Centra el código de barras dentro del recuadro.</p>}
        {error && <p class="error">{error}</p>}
        <form class="manual-code" onSubmit={submitManual}>
          <input inputmode="numeric" placeholder="O escribe el código" value={manual}
            onInput={(e) => setManual(e.currentTarget.value)} />
          <button class="btn primary" disabled={manual.replace(/\D/g, '').length < 8}>Buscar</button>
        </form>
      </div>
    </>
  );
}
