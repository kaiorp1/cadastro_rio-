// =========================================================
// CONFIGURAÇÃO DO SUPABASE
// Preencha com os dados do SEU projeto Supabase:
// Project Settings > API > Project URL / anon public key
// =========================================================
const SUPABASE_URL = "https://lbeygpdcpkhkulvmwlan.supabase.com";
const SUPABASE_ANON_KEY = "sb_publishable_jmOI21Hnk0HpVxR-AGW2Xg_Y5sIDymR";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
