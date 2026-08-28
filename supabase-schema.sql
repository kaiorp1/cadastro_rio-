-- =========================================================
-- FORMULÁRIO DE ATUALIZAÇÃO CADASTRAL — Metro I
-- Schema para Supabase (Postgres + Storage + RLS)
-- Rode este arquivo inteiro no SQL Editor do Supabase
-- =========================================================

-- 1) TABELA PRINCIPAL DE RESPOSTAS
create table if not exists public.respostas_cadastral (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),

  nome_colaborador text not null,
  tipo_atualizacao text not null,

  nome_cliente text,
  tipo_logradouro text,
  nome_logradouro text,
  numero text,
  complemento text,
  bairro text,
  telefone text,
  email text,

  indicacao_clandestino text,
  categoria text,
  cpf_cnpj text,
  rg text,

  possui_medidor text,
  localizacao_hidrometro text,
  numero_hidrometro text,

  hidrometro_unica_residencia text,
  quantidade_residencias text,
  casas_ou_pavimentos text,

  morador_aceitou text,
  motivo_nao_autorizacao text,
  cliente_light text,

  observacoes text,

  -- caminhos dos arquivos no Storage (bucket "fotos-cadastral")
  foto_fachada_1 text,
  foto_fachada_2 text,
  foto_termo text,
  foto_documento_frente text,
  foto_documento_verso text,
  foto_padrao_instalacao text,
  foto_hidrometro text
);

-- 2) ROW LEVEL SECURITY
alter table public.respostas_cadastral enable row level security;

-- Qualquer pessoa (anon) pode INSERIR uma resposta (é o formulário público)
create policy "Qualquer um pode enviar o formulario"
  on public.respostas_cadastral
  for insert
  to anon
  with check (true);

-- Só usuário autenticado (você, admin) pode LER as respostas
create policy "Somente autenticado pode ler"
  on public.respostas_cadastral
  for select
  to authenticated
  using (true);

-- (opcional) Só autenticado pode apagar/editar, caso precise corrigir algo depois
create policy "Somente autenticado pode atualizar"
  on public.respostas_cadastral
  for update
  to authenticated
  using (true);

create policy "Somente autenticado pode deletar"
  on public.respostas_cadastral
  for delete
  to authenticated
  using (true);

-- 3) STORAGE — bucket para as fotos
insert into storage.buckets (id, name, public)
values ('fotos-cadastral', 'fotos-cadastral', false)
on conflict (id) do nothing;

-- Qualquer um pode enviar (upload) foto para o bucket (o formulário é público)
create policy "Qualquer um pode enviar fotos"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'fotos-cadastral');

-- Só autenticado pode ler/baixar as fotos (painel admin)
create policy "Somente autenticado pode ver fotos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'fotos-cadastral');

-- =========================================================
-- PRÓXIMOS PASSOS (fora deste script, no painel do Supabase):
-- 1. Authentication > Users > criar seu usuário admin (email + senha)
-- 2. Desative "Enable email confirmations" se quiser logar direto,
--    ou confirme o email que o Supabase enviar
-- 3. Copie a "Project URL" e a "anon public key" em
--    Project Settings > API para colocar no config.js do site
-- =========================================================
