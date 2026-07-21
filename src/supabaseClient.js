import { createClient } from "@supabase/supabase-js";

/**
 * Chaves do projeto Supabase.
 * A "publishable key" (antigo "anon key") é feita para ficar no
 * front-end — ela sozinha não dá acesso a nada que as políticas de
 * Row Level Security (RLS) do banco não permitam. Ainda assim, para
 * ambientes de produção é boa prática manter isso em variáveis de
 * ambiente (.env) em vez de fixo no código. Veja o README.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://dnowwydvxtdnvbwotqrg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_0iZG4WtpkdKhPpgZhcRyWw_EZhLImnR";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  realtime: { params: { eventsPerSecond: 10 } },
});
