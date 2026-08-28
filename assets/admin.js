const telaLogin = document.getElementById('tela-login');
const telaPainel = document.getElementById('tela-painel');
const msgLogin = document.getElementById('msg-login');

let TODAS_RESPOSTAS = [];

const ROTULOS = {
  nome_colaborador: 'Nome do colaborador',
  tipo_atualizacao: 'Tipo de atualização cadastral',
  nome_cliente: 'Nome do cliente',
  tipo_logradouro: 'Tipo de logradouro',
  nome_logradouro: 'Nome do logradouro',
  numero: 'Número',
  complemento: 'Complemento',
  bairro: 'Bairro',
  telefone: 'Telefone',
  email: 'Email',
  indicacao_clandestino: 'Indicação de clandestino?',
  categoria: 'Categoria',
  cpf_cnpj: 'CPF/CNPJ',
  rg: 'RG',
  possui_medidor: 'Possui medidor (hidrômetro)?',
  localizacao_hidrometro: 'Localização do hidrômetro',
  numero_hidrometro: 'Número do hidrômetro',
  hidrometro_unica_residencia: 'Hidrômetro abastece 1 residência?',
  quantidade_residencias: 'Quantidade de residências',
  casas_ou_pavimentos: 'Casas ou pavimentos?',
  morador_aceitou: 'Morador aceitou a atualização?',
  motivo_nao_autorizacao: 'Motivo da não autorização',
  cliente_light: 'Cliente cadastrado na Light?',
  observacoes: 'Observações'
};

const CAMPOS_FOTO = {
  foto_fachada_1: 'Foto 1 da fachada',
  foto_fachada_2: 'Foto 2 da fachada',
  foto_termo: 'Foto do termo',
  foto_documento_frente: 'Documento (frente)',
  foto_documento_verso: 'Documento (verso)',
  foto_padrao_instalacao: 'Padrão de instalação',
  foto_hidrometro: 'Foto do hidrômetro'
};

// ---------- SESSÃO ----------
async function verificarSessao() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    mostrarPainel(session.user.email);
  } else {
    telaLogin.style.display = 'block';
    telaPainel.style.display = 'none';
  }
}

function mostrarPainel(email) {
  telaLogin.style.display = 'none';
  telaPainel.style.display = 'block';
  document.getElementById('usuario-logado').textContent = email;
  carregarRespostas();
}

document.getElementById('btn-login').addEventListener('click', async () => {
  msgLogin.textContent = '';
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value;
  if (!email || !senha) {
    msgLogin.textContent = 'Preencha email e senha.';
    return;
  }
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });
  if (error) {
    msgLogin.textContent = 'Login inválido: ' + error.message;
    return;
  }
  mostrarPainel(data.user.email);
});

document.getElementById('btn-logout').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  location.reload();
});

// ---------- CARREGAR RESPOSTAS ----------
async function carregarRespostas() {
  const corpo = document.getElementById('tabela-corpo');
  corpo.innerHTML = '<tr><td colspan="6">Carregando...</td></tr>';

  const { data, error } = await supabaseClient
    .from('respostas_cadastral')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) {
    corpo.innerHTML = `<tr><td colspan="6">Erro ao carregar: ${error.message}</td></tr>`;
    return;
  }

  TODAS_RESPOSTAS = data;
  renderizarTabela(data);
}

function renderizarTabela(lista) {
  const corpo = document.getElementById('tabela-corpo');
  document.getElementById('card-total').textContent = `Total: ${lista.length} resposta(s)`;

  if (lista.length === 0) {
    corpo.innerHTML = '<tr><td colspan="6">Nenhuma resposta encontrada.</td></tr>';
    return;
  }

  corpo.innerHTML = lista.map(r => `
    <tr onclick="abrirDetalhe('${r.id}')">
      <td>${formatarData(r.criado_em)}</td>
      <td>${r.nome_colaborador || '-'}</td>
      <td>${r.nome_cliente || '-'}</td>
      <td><span class="badge">${r.tipo_atualizacao || '-'}</span></td>
      <td>${r.bairro || '-'}</td>
      <td>${r.categoria || '-'}</td>
    </tr>
  `).join('');
}

function formatarData(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR');
}

// ---------- FILTROS ----------
function aplicarFiltros() {
  const busca = document.getElementById('filtro-busca').value.toLowerCase();
  const tipo = document.getElementById('filtro-tipo').value;

  const filtradas = TODAS_RESPOSTAS.filter(r => {
    const bateBusca = !busca || [r.nome_colaborador, r.nome_cliente, r.bairro, r.cpf_cnpj]
      .some(v => (v || '').toLowerCase().includes(busca));
    const bateTipo = !tipo || r.tipo_atualizacao === tipo;
    return bateBusca && bateTipo;
  });

  renderizarTabela(filtradas);
}

document.getElementById('filtro-busca').addEventListener('input', aplicarFiltros);
document.getElementById('filtro-tipo').addEventListener('change', aplicarFiltros);
document.getElementById('btn-atualizar').addEventListener('click', carregarRespostas);

// ---------- MODAL DE DETALHE ----------
const overlay = document.getElementById('overlay-detalhe');
document.getElementById('fechar-modal').addEventListener('click', () => overlay.classList.remove('ativo'));
overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('ativo'); });

async function abrirDetalhe(id) {
  const registro = TODAS_RESPOSTAS.find(r => r.id === id);
  if (!registro) return;

  let html = '<h2>Detalhes da resposta</h2>';
  html += `<p class="descricao">Enviado em ${formatarData(registro.criado_em)}</p>`;

  for (const campo in ROTULOS) {
    const valor = registro[campo];
    if (!valor) continue;
    html += `
      <div class="campo-detalhe">
        <div class="rotulo">${ROTULOS[campo]}</div>
        <div class="valor">${valor}</div>
      </div>`;
  }

  // Fotos: gera URLs assinadas (bucket é privado)
  const camposComFoto = Object.keys(CAMPOS_FOTO).filter(c => registro[c]);
  if (camposComFoto.length > 0) {
    html += '<h2>Fotos anexadas</h2><div class="grid-fotos" id="grid-fotos">Carregando fotos...</div>';
  }

  document.getElementById('conteudo-modal').innerHTML = html;
  overlay.classList.add('ativo');

  if (camposComFoto.length > 0) {
    const grid = document.getElementById('grid-fotos');
    const itens = await Promise.all(camposComFoto.map(async (campo) => {
      const { data, error } = await supabaseClient
        .storage
        .from('fotos-cadastral')
        .createSignedUrl(registro[campo], 3600);
      if (error || !data) return '';
      return `
        <a href="${data.signedUrl}" target="_blank">
          <img src="${data.signedUrl}" alt="${CAMPOS_FOTO[campo]}">
          <div class="legenda">${CAMPOS_FOTO[campo]}</div>
        </a>`;
    }));
    grid.innerHTML = itens.join('');
  }
}

// ---------- EXPORTAR CSV ----------
document.getElementById('btn-exportar-csv').addEventListener('click', () => {
  if (TODAS_RESPOSTAS.length === 0) return;

  const colunas = ['criado_em', ...Object.keys(ROTULOS)];
  const linhas = [colunas.join(';')];

  TODAS_RESPOSTAS.forEach(r => {
    const linha = colunas.map(c => `"${(r[c] || '').toString().replace(/"/g, '""')}"`);
    linhas.push(linha.join(';'));
  });

  const csv = linhas.join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `respostas_cadastral_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

verificarSessao();
