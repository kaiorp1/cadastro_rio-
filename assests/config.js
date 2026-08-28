// =========================================================
// CONFIGURAÇÃO DO SUPABASE
// Preencha com os dados do SEU projeto Supabase:
// Project Settings > API > Project URL / anon public key
// =========================================================
const SUPABASE_URL = "COLE_AQUI_A_URL_DO_SEU_PROJETO";
const SUPABASE_ANON_KEY = "COLE_AQUI_A_ANON_KEY";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
