import { createClient } from '@supabase/supabase-js';

// Valores públicos: la llave "publishable" está pensada para el frontend.
// La seguridad la imponen las políticas RLS de la base de datos.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://tqjpdlxdjvmjzxywkoyd.supabase.co';
const key = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_M98C0MlfUYw5dyQuHExbxg_-tv6J2P_';

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});
