# Formulário de Atualização Cadastral — Metro I

Formulário público (com upload de fotos) + painel administrativo, hospedados
gratuitamente no GitHub Pages, com Supabase como banco de dados/storage/login.

## Estrutura

```
├── index.html          → formulário público (link a ser compartilhado)
├── admin.html           → painel do administrador (login + tabela de respostas)
├── assets/
│   ├── config.js         → URL e chave do Supabase (você preenche)
│   ├── style.css
│   ├── app.js            → lógica do formulário público
│   └── admin.js          → lógica do painel admin
└── supabase-schema.sql  → script para rodar no Supabase (tabela + storage + segurança)
```

## Passo 1 — Criar o projeto no Supabase

1. Acesse https://supabase.com e crie uma conta (grátis).
2. Clique em **New Project**. Escolha um nome e uma senha para o banco (guarde essa senha).
3. Aguarde o projeto ser criado (leva ~1 minuto).

## Passo 2 — Rodar o schema (tabela + storage + segurança)

1. No painel do Supabase, vá em **SQL Editor** (menu lateral).
2. Clique em **New query**.
3. Abra o arquivo `supabase-schema.sql` deste projeto, copie todo o conteúdo e cole no editor.
4. Clique em **Run**. Isso cria:
   - a tabela `respostas_cadastral` (uma coluna para cada pergunta do formulário)
   - o bucket de storage `fotos-cadastral` (para as fotos anexadas)
   - as regras de segurança (qualquer um pode enviar o formulário; só você, logado, pode ler as respostas)

## Passo 3 — Criar seu usuário administrador

1. No Supabase, vá em **Authentication > Users**.
2. Clique em **Add user > Create new user**.
3. Preencha seu email e uma senha. Marque **Auto Confirm User** (assim você não precisa confirmar por email).
4. Salve. Esse será o login do painel admin (`admin.html`).

## Passo 4 — Pegar a URL e a chave do projeto

1. No Supabase, vá em **Project Settings (ícone de engrenagem) > API**.
2. Copie o valor de **Project URL**.
3. Copie o valor de **anon public** (dentro de "Project API keys").
4. Abra o arquivo `assets/config.js` deste projeto e cole os dois valores:

```js
const SUPABASE_URL = "https://SEUPROJETO.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOi....";
```

## Passo 5 — Subir para o GitHub Pages

1. Crie um repositório novo no GitHub (ex: `atualizacao-cadastral`).
2. Envie todos os arquivos desta pasta para o repositório (pela interface do GitHub,
   arrastando os arquivos, ou via `git push` se preferir usar linha de comando).
3. No repositório, vá em **Settings > Pages**.
4. Em "Source", selecione a branch `main` e a pasta `/ (root)`. Clique em **Save**.
5. Em alguns minutos o GitHub vai te dar um link do tipo:
   `https://SEU-USUARIO.github.io/atualizacao-cadastral/`

## Passo 6 — Usar

- **Link do formulário** (para compartilhar com os colaboradores):
  `https://SEU-USUARIO.github.io/atualizacao-cadastral/`
- **Link do painel admin** (só para você, com login e senha):
  `https://SEU-USUARIO.github.io/atualizacao-cadastral/admin.html`

No painel admin você pode:
- ver todas as respostas em uma tabela
- clicar em uma linha para ver todos os detalhes e as fotos anexadas
- filtrar por nome/cliente/bairro ou por tipo de atualização cadastral
- exportar tudo em CSV (abre direto no Excel)

## Observações importantes

- As fotos ficam guardadas de forma privada no Supabase Storage — só quem
  estiver logado no painel admin consegue vê-las (via link temporário de 1 hora).
- O plano gratuito do Supabase tem limite de 500MB de banco e 1GB de storage,
  o que é bastante para este tipo de formulário. Se o volume de fotos crescer
  muito, pode ser necessário migrar para o plano pago do Supabase.
- Se quiser adicionar mais administradores no futuro, basta criar mais usuários
  em Authentication > Users no Supabase — todos com o mesmo nível de acesso.
