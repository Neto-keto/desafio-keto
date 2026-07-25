import { createClient } from "@supabase/supabase-js";

// Usa a service role key: só roda no servidor (dentro das rotas /app/api),
// nunca é exposta ao navegador do aluno.
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(url, key);
}
