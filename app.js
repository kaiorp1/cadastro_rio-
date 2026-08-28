const form = document.getElementById('form-cadastral');
const btnEnviar = document.getElementById('btn-enviar');
const msgEnvio = document.getElementById('msg-envio');

const CAMPOS_ARQUIVO = [
  'foto_fachada_1',
  'foto_fachada_2',
  'foto_termo',
  'foto_documento_frente',
  'foto_documento_verso',
  'foto_padrao_instalacao',
  'foto_hidrometro'
];

const CAMPOS_TEXTO = [
  'nome_colaborador', 'tipo_atualizacao',
  'nome_cliente', 'tipo_logradouro', 'nome_logradouro', 'numero', 'complemento',
  'bairro', 'telefone', 'email',
  'indicacao_clandestino', 'categoria', 'cpf_cnpj', 'rg',
  'possui_medidor', 'localizacao_hidrometro', 'numero_hidrometro',
  'hidrometro_unica_residencia', 'quantidade_residencias', 'casas_ou_pavimentos',
  'morador_aceitou', 'motivo_nao_autorizacao', 'cliente_light', 'observacoes'
];

async function enviarArquivo(file, prefixo) {
  if (!file) return null;
  const extensao = file.name.split('.').pop();
  const nomeArquivo = `${prefixo}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${extensao}`;
  const { data, error } = await supabaseClient
    .storage
    .from('fotos-cadastral')
    .upload(nomeArquivo, file);

  if (error) {
    console.error('Erro ao enviar arquivo:', nomeArquivo, error);
    throw new Error(`Falha ao enviar o arquivo "${file.name}". Tente novamente.`);
  }
  return data.path;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msgEnvio.textContent = '';
  msgEnvio.className = 'mensagem';
  btnEnviar.disabled = true;
  btnEnviar.textContent = 'ENVIANDO...';

  try {
    const formData = new FormData(form);
    const registro = {};

    CAMPOS_TEXTO.forEach(campo => {
      registro[campo] = formData.get(campo) || null;
    });

    // Envia os arquivos em paralelo
    const uploads = await Promise.all(
      CAMPOS_ARQUIVO.map(async (campo) => {
        const file = formData.get(campo);
        const path = (file && file.size > 0) ? await enviarArquivo(file, campo) : null;
        return [campo, path];
      })
    );
    uploads.forEach(([campo, path]) => { registro[campo] = path; });

    const { error } = await supabaseClient
      .from('respostas_cadastral')
      .insert([registro]);

    if (error) throw error;

    document.getElementById('tela-form').style.display = 'none';
    document.getElementById('tela-sucesso').style.display = 'block';
    window.scrollTo(0, 0);

  } catch (err) {
    console.error(err);
    msgEnvio.textContent = err.message || 'Erro ao enviar o formulário. Tente novamente.';
    msgEnvio.className = 'mensagem erro';
    btnEnviar.disabled = false;
    btnEnviar.textContent = 'ENVIAR';
  }
});
