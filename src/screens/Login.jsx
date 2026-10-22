import { useState } from 'preact/hooks';
import { supabase } from '../lib/supabase.js';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : error.message);
    setBusy(false);
  }

  return (
    <main class="login">
      <div class="login-card">
        <div class="brand-mark" aria-hidden="true">
          <span style="background:var(--g-proteina)" /><span style="background:var(--g-carbohidrato)" />
          <span style="background:var(--g-grasa)" /><span style="background:var(--g-lacteo)" />
          <span style="background:var(--g-vegetal)" /><span style="background:var(--g-fruta)" />
        </div>
        <h1>Porciones</h1>
        <p class="muted">Tu registro de comidas por equivalentes.</p>
        <form onSubmit={submit}>
          <label>Correo
            <input type="email" autocomplete="email" required value={email} onInput={(e) => setEmail(e.currentTarget.value)} />
          </label>
          <label>Contraseña
            <input type="password" autocomplete="current-password" required value={password} onInput={(e) => setPassword(e.currentTarget.value)} />
          </label>
          {error && <p class="error">{error}</p>}
          <button class="btn primary" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        </form>
      </div>
    </main>
  );
}
