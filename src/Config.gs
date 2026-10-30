/**
 * VistAR · Configuração, esquema da planilha e instalação.
 *
 * A planilha é o banco de dados; o Drive guarda fotos, assinaturas e PDFs.
 * Rode `instalarVistAR()` uma vez no editor (ou pelo menu VistAR da planilha).
 */

const VERSAO = '1.1.0';

/** Valores padrão. Podem ser sobrescritos na aba "Config" da planilha. */
const CONFIG_PADRAO = {
  CONSORCIO: 'Consórcio Climatiza São Paulo',
  CONTRATO: 'SME-SP 000/2026',
  LOTE: 'Lote Penha',
  EMPRESA: 'Almeida Sapata Engenharia e Construções Ltda.',
  RESPONSAVEL_TECNICO: 'Johnny',
  RESPONSAVEL_TECNICO_CARGO: 'Coordenação Técnica',
  EMAIL_COPIA_CONSORCIO: '',
  EMAIL_COORDENACAO: '',
  SISTEMA_PREVISTO: 'VRF (fluxo de refrigerante variável), evaporadoras cassete/hi-wall',
  RAIO_CHECKIN_M: '400',
  TOKEN_DIAS: '30',
  ENVIO_AUTOMATICO_COPIA: 'sim',
  KW_POR_TR: '1.05',
  FATORES_BTU_M2: '',
  META_INICIO: '',
  META_DATA: '',
  NOME_APP: 'VistAR'
};

const DESCRICOES_CONFIG = {
  CONSORCIO: 'Nome exibido no app e nos relatórios',
  CONTRATO: 'Número do contrato',
  LOTE: 'Lote do contrato',
  EMPRESA: 'Empresa padrão dos técnicos',
  RESPONSAVEL_TECNICO: 'Quem assina o relatório pelo consórcio',
  RESPONSAVEL_TECNICO_CARGO: 'Cargo de quem assina pelo consórcio',
  EMAIL_COPIA_CONSORCIO: 'E-mail que recebe cópia dos relatórios enviados à unidade',
  EMAIL_COORDENACAO: 'E-mail que recebe o resumo diário (18h)',
  SISTEMA_PREVISTO: 'Sistema de climatização previsto',
  RAIO_CHECKIN_M: 'Distância máxima (m) da escola para check-in sem confirmação',
  TOKEN_DIAS: 'Dias que o login permanece válido no aparelho',
  ENVIO_AUTOMATICO_COPIA: 'sim/nao · envia o relatório para a unidade ao finalizar',
  KW_POR_TR: 'Premissa de consumo elétrico (kW por TR) no pré-dimensionamento',
  FATORES_BTU_M2: 'Opcional · ajusta fatores de carga por tipo, em JSON. Ex.: {"Sala de aula": 700, "Biblioteca": 650}',
  META_INICIO: 'Início do contrato (AAAA-MM-DD) · base da linha de meta do painel',
  META_DATA: 'Data para concluir todas as escolas (AAAA-MM-DD)',
  NOME_APP: 'Nome exibido nos e-mails'
};

/** Abas e colunas. A primeira coluna é sempre a chave. */
const SCHEMA = {
  Config: ['chave', 'valor', 'descricao'],
  Usuarios: ['id', 'email', 'nome', 'cargo', 'equipeId', 'rg', 'empresa', 'telefone', 'perfil', 'dres',
    'fotoId', 'senhaHash', 'salt', 'tokenVersao', 'ativo', 'criadoEm', 'matricula', 'codigoAtivacao', 'codigoExpira',
    'ultimoAcesso', 'lat', 'lng', 'vistoEm', 'fila', 'vistoriaAtual'],
  Equipes: ['id', 'nome', 'membros', 'supervisorNome', 'supervisorTel', 'status', 'statusDesde',
    'vistoriaAtual', 'destinoEscolaId', 'destinoEta', 'lat', 'lng', 'vistoEm', 'fila'],
  DREs: ['id', 'nome', 'engenheiroNome', 'engenheiroCargo', 'engenheiroTel', 'engenheiroEmail'],
  Escolas: ['id', 'nome', 'cie', 'dre', 'etapaEnsino', 'logradouro', 'numero', 'cep', 'bairro', 'complemento',
    'lat', 'lng', 'diretor', 'telefone', 'email', 'ambientesPrevistos', 'imovel', 'idadeAnos', 'fotoId',
    'status', 'nota', 'atualizadoEm'],
  Roteiro: ['id', 'data', 'hora', 'equipeId', 'escolaId', 'ordem', 'status', 'nota', 'vistoriaId', 'tipo', 'horaFim',
    'confirmado', 'criadoPor'],
  Vistorias: ['id', 'codigo', 'escolaId', 'equipeId', 'usuarioId', 'status', 'checkin', 'checkout',
    'latIn', 'lngIn', 'latOut', 'lngOut', 'pastaId', 'relVistoriaId', 'relCompletoId', 'assinadoEm',
    'copiaPara', 'copiaEnviadaEm', 'resumo', 'atualizadoEm', 'validacao', 'validadoPor', 'validadoEm', 'validacaoNota',
    'versao', 'retomadaDe', 'historico', 'participantes', 'mescladaEm'],
  Etapas: ['id', 'vistoriaId', 'etapa', 'atualizadoEm', 'autor', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
  Fotos: ['id', 'vistoriaId', 'escolaId', 'etapa', 'slot', 'ref', 'legenda', 'fileId', 'criadoEm', 'autor', 'lat', 'lng'],
  Pendencias: ['id', 'vistoriaId', 'escolaId', 'etapa', 'descricao', 'status', 'criadoEm', 'resolvidoEm', 'resolvidoPor'],
  Cancelamentos: ['id', 'vistoriaId', 'escolaId', 'motivo', 'houveRecusa', 'quemRecusou', 'descricao', 'fotoId',
    'usuarioId', 'criadoEm', 'situacao', 'cobradoEm'],
  Log: ['ts', 'usuario', 'acao', 'detalhe']
};

function getConfig_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('cfg');
  if (hit) return JSON.parse(hit);
  const cfg = Object.assign({}, CONFIG_PADRAO);
  try {
    Db.all('Config').forEach(r => { if (r.chave) cfg[r.chave] = String(r.valor); });
  } catch (e) { /* planilha ainda não instalada */ }
  cache.put('cfg', JSON.stringify(cfg), 300);
  return cfg;
}

function configPublica_(cfg) {
  return {
    consorcio: cfg.CONSORCIO,
    contrato: cfg.CONTRATO,
    raioCheckin: Number(cfg.RAIO_CHECKIN_M) || 400,
    responsavelTecnico: cfg.RESPONSAVEL_TECNICO, responsavelCargo: cfg.RESPONSAVEL_TECNICO_CARGO, lote: cfg.LOTE,
    versao: VERSAO
  };
}

/* ───────────────────────── Instalação ───────────────────────── */

/** Cria (ou atualiza) planilha, abas, pasta no Drive e gatilhos. Idempotente. */
function instalarVistAR() {
  const props = PropertiesService.getScriptProperties();
  let ss = null;
  const id = props.getProperty('SPREADSHEET_ID');
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) ss = SpreadsheetApp.create('VistAR · Banco de dados');
  props.setProperty('SPREADSHEET_ID', ss.getId());

  Object.keys(SCHEMA).forEach(nome => {
    let sh = ss.getSheetByName(nome);
    if (!sh) sh = ss.insertSheet(nome);
    const cols = SCHEMA[nome];
    if (sh.getMaxColumns() < cols.length) sh.insertColumnsAfter(sh.getMaxColumns(), cols.length - sh.getMaxColumns());
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold')
      .setBackground('#0F2140').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    // Tudo como texto puro: CEP, CIE, telefones e horários não viram número/data.
    sh.getRange(1, 1, sh.getMaxRows(), cols.length).setNumberFormat('@');
  });
  const padrao = ss.getSheetByName('Sheet1') || ss.getSheetByName('Página1') || ss.getSheetByName('Planilha1');
  if (padrao && ss.getSheets().length > 1 && padrao.getLastRow() === 0) ss.deleteSheet(padrao);

  const existentes = Db.all('Config').map(r => r.chave);
  Object.keys(CONFIG_PADRAO).forEach(k => {
    if (existentes.indexOf(k) < 0) Db.upsert('Config', { chave: k, valor: CONFIG_PADRAO[k], descricao: DESCRICOES_CONFIG[k] || '' });
  });
  CacheService.getScriptCache().remove('cfg');

  pastaRaiz_();
  segredo_();

  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'resumoDiario')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('resumoDiario').timeBased().atHour(18).everyDays(1).inTimezone('America/Sao_Paulo').create();

  console.log('VistAR instalado. Planilha: ' + ss.getUrl());
  return ss.getUrl();
}

/** Popula a planilha com dados de exemplo (iguais aos protótipos). */
function carregarExemplo() {
  instalarVistAR();
  const hoje = new Date();
  const dia = n => Utilities.formatDate(new Date(hoje.getTime() + n * 864e5), 'America/Sao_Paulo', 'yyyy-MM-dd');
  const agora = agora_();

  [
    { id: 'Penha', nome: 'DRE Penha', engenheiroNome: 'Ana Paula Rocha', engenheiroCargo: 'Engenheiro DRE', engenheiroTel: '(11) 3000-0000' },
    { id: 'Itaquera', nome: 'DRE Itaquera', engenheiroNome: 'Carlos Mendes', engenheiroCargo: 'Engenheiro DRE', engenheiroTel: '(11) 3000-1111' },
    { id: 'Ermelino Matarazzo', nome: 'DRE Ermelino Matarazzo', engenheiroNome: 'Fernanda Dias', engenheiroCargo: 'Engenheiro DRE', engenheiroTel: '(11) 3000-2222' }
  ].forEach(d => Db.upsert('DREs', d));

  Db.upsert('Equipes', {
    id: 'eq02', nome: 'Equipe 02', membros: 'Marcos Silva, João Souza', supervisorNome: 'Roberto Lima',
    supervisorTel: '(11) 99000-0000', status: 'disponivel', statusDesde: agora
  });

  const emailAdmin = Session.getEffectiveUser().getEmail() || 'admin@exemplo.com';
  // Você (quem instalou) entra como coordenação/admin: vê o módulo de supervisão e pode usar o modo campo.
  criarUsuario_({ id: 'u-admin', email: emailAdmin, nome: 'Johnny', cargo: 'Coordenação técnica', equipeId: 'eq02',
    empresa: CONFIG_PADRAO.EMPRESA, perfil: 'admin', matricula: '1000', dres: 'Penha, Itaquera, Ermelino Matarazzo' }, 'vistar2026');
  criarUsuario_({ id: 'u-marcos', email: 'marcos.silva@exemplo.com', nome: 'Marcos Silva', cargo: 'Técnico de campo', equipeId: 'eq02',
    rg: '12.345.678-9', empresa: CONFIG_PADRAO.EMPRESA, telefone: '(11) 98888-0000', perfil: 'tecnico', matricula: '1001',
    dres: 'Penha, Itaquera, Ermelino Matarazzo' }, 'vistar2026');
  criarUsuario_({ id: 'u-joao', email: 'joao.souza@exemplo.com', nome: 'João Souza', cargo: 'Técnico de campo',
    equipeId: 'eq02', rg: '23.456.789-0', empresa: CONFIG_PADRAO.EMPRESA, perfil: 'tecnico', matricula: '1002',
    dres: 'Penha, Itaquera, Ermelino Matarazzo' });
  const codJoao = gerarCodigo_(Db.find('Usuarios', 'u-joao'));
  criarUsuario_({ id: 'u-roberto', email: 'roberto.lima@exemplo.com', nome: 'Roberto Lima', cargo: 'Supervisor', equipeId: '',
    empresa: CONFIG_PADRAO.EMPRESA, perfil: 'supervisor', matricula: '2001', dres: 'Penha, Itaquera, Ermelino Matarazzo' }, 'vistar2026');
  Db.upsert('Equipes', { id: 'eq01', nome: 'Equipe 01', membros: 'Paulo Reis, Ana Lopes', supervisorNome: 'Roberto Lima', supervisorTel: '(11) 99000-0000', status: 'em_campo', statusDesde: agora });
  Db.upsert('Equipes', { id: 'eq03', nome: 'Equipe 03', membros: 'Lucas Prado, Rita Alves', supervisorNome: 'Roberto Lima', supervisorTel: '(11) 99000-0000', status: 'disponivel', statusDesde: agora });
  Db.upsert('Config', { chave: 'META_INICIO', valor: dia(-30), descricao: DESCRICOES_CONFIG.META_INICIO });
  Db.upsert('Config', { chave: 'META_DATA', valor: dia(31), descricao: DESCRICOES_CONFIG.META_DATA });
  CacheService.getScriptCache().remove('cfg');

  const escolas = [
    ['e-farialima', 'EMEF Brigadeiro Faria Lima', '10183472', 'Penha', 'Rua Heloísa Helena', '29', '03660-000', 'Vila Antonieta', -23.5442, -46.5262, 13, 'agendada'],
    ['e-infante', 'EMEF Infante Dom Henrique', '10183510', 'Penha', 'Rua Heloísa Helena', '290', '03660-010', 'Vila Antonieta', -23.5372, -46.5180, 13, 'agendada'],
    ['e-deodoro', 'EMEF Marechal Deodoro', '10183600', 'Penha', 'Rua Pecrateria', '110', '03640-000', 'Penha', -23.5290, -46.5400, 11, 'retorno'],
    ['e-portinari', 'EMEF Cândido Portinari', '10184001', 'Itaquera', 'Av. Itaquera', '1950', '08210-000', 'Itaquera', -23.5400, -46.4700, 0, 'agendada'],
    ['e-alencar', 'EMEF José de Alencar', '10184120', 'Itaquera', 'Rua Gregório Ramalho', '300', '08210-430', 'Itaquera', -23.5450, -46.4600, 9, 'agendada'],
    ['e-bilac', 'EMEF Olavo Bilac', '10183777', 'Ermelino Matarazzo', 'Av. Paranaguá', '1500', '03806-010', 'Ermelino Matarazzo', -23.4980, -46.4790, 12, 'retorno'],
    ['e-anchieta', 'EMEF Padre Anchieta', '10183011', 'Penha', 'Rua Dr. João Ribeiro', '400', '03634-010', 'Penha', -23.5250, -46.5430, 14, 'concluida'],
    ['e-monteiro', 'EMEF Monteiro Lobato', '10183022', 'Penha', 'Rua Padre Benedito', '55', '03631-000', 'Penha', -23.5230, -46.5380, 10, 'concluida'],
    ['e-cecilia', 'EMEF Cecília Meireles', '10183033', 'Penha', 'Rua Coronel Rodovalho', '120', '03632-000', 'Penha', -23.5270, -46.5450, 12, 'concluida'],
    ['e-rui', 'EMEF Rui Barbosa', '10184044', 'Itaquera', 'Rua Victório Santim', '800', '08290-000', 'Itaquera', -23.5470, -46.4660, 15, 'concluida'],
    ['e-tarsila', 'EMEF Tarsila do Amaral', '10184055', 'Itaquera', 'Av. Jacu-Pêssego', '2000', '08260-000', 'Itaquera', -23.5520, -46.4560, 11, 'concluida'],
    ['e-drummond', 'EMEF Carlos Drummond', '10183066', 'Ermelino Matarazzo', 'Rua Abel Tavares', '90', '03812-000', 'Ermelino Matarazzo', -23.4950, -46.4820, 9, 'concluida']
  ];
  escolas.forEach(e => Db.upsert('Escolas', {
    id: e[0], nome: e[1], cie: e[2], dre: e[3], etapaEnsino: 'Ensino Fundamental', logradouro: e[4], numero: e[5],
    cep: e[6], bairro: e[7], lat: e[8], lng: e[9], ambientesPrevistos: e[10], status: e[11], imovel: 'Próprio',
    idadeAnos: '30', nota: e[11] === 'retorno' ? 'Falta QDC e medição' : '', atualizadoEm: agora
  }));

  const rot = [
    ['r1', dia(0), '08:30', 'e-farialima', 1, 'agendada', ''],
    ['r2', dia(0), '13:30', 'e-infante', 2, 'agendada', ''],
    ['r3', dia(-2), '', 'e-deodoro', 0, 'retorno', 'Falta QDC e medição'],
    ['r4', dia(4), '08:30', 'e-portinari', 1, 'agendada', ''],
    ['r5', dia(5), '08:30', 'e-alencar', 1, 'agendada', ''],
    ['r6', dia(-3), '', 'e-bilac', 0, 'retorno', 'Cobertura sem acesso'],
    ['r7', dia(-9), '08:30', 'e-anchieta', 1, 'concluida', ''],
    ['r8', dia(-9), '13:30', 'e-monteiro', 2, 'concluida', ''],
    ['r9', dia(-8), '08:30', 'e-cecilia', 1, 'concluida', ''],
    ['r10', dia(-7), '08:30', 'e-rui', 1, 'concluida', ''],
    ['r11', dia(-7), '13:30', 'e-tarsila', 2, 'concluida', ''],
    ['r12', dia(-6), '08:30', 'e-drummond', 1, 'concluida', '']
  ];
  rot.forEach(r => Db.upsert('Roteiro', { id: r[0], data: r[1], hora: r[2], equipeId: 'eq02', escolaId: r[3], ordem: r[4], status: r[5], nota: r[6] }));

  // Histórico das escolas concluídas (alimenta o painel e a tela da escola).
  rot.filter(r => r[5] === 'concluida').forEach((r, i) => {
    const ini = r[1] + 'T' + (r[2] || '08:30') + ':00-03:00';
    const fim = new Date(new Date(ini).getTime() + (150 + i * 9) * 60000).toISOString();
    Db.upsert('Vistorias', {
      id: 'v-ex' + i, codigo: 'VST-EX-' + ('00' + (i + 1)).slice(-3), escolaId: r[3], equipeId: 'eq02', usuarioId: 'u-marcos',
      status: 'finalizada', checkin: new Date(ini).toISOString(), checkout: fim, assinadoEm: fim, validacao: i < 3 ? 'aprovada' : '',
      resumo: JSON.stringify({ ambientes: 18 + i * 3, fotos: 35 + i * 4, pendencias: i % 3 }), versao: '1', atualizadoEm: fim
    });
    Db.upsert('Roteiro', { id: r[0], vistoriaId: 'v-ex' + i, horaFim: Utilities.formatDate(new Date(fim), 'America/Sao_Paulo', 'HH:mm') });
  });
  Db.upsert('Cancelamentos', { id: 'c-ex1', vistoriaId: '', escolaId: 'e-bilac', motivo: 'Aguardando autorização da DRE', situacao: 'aguardando_autorizacao',
    houveRecusa: 'nao', descricao: 'Falta autorização da DRE para acesso à cobertura. A equipe concluiu o que foi possível sem subir.', usuarioId: 'u-marcos', criadoEm: agora });
  Db.upsert('Cancelamentos', { id: 'c-ex2', vistoriaId: '', escolaId: 'e-deodoro', motivo: 'Retorno solicitado pela unidade', situacao: 'retorno_solicitado',
    houveRecusa: 'nao', descricao: 'A diretora pediu para voltar outro dia por causa da reforma do pátio. Parte do levantamento já foi feita.', usuarioId: 'u-marcos', criadoEm: agora });

  Db.upsert('Pendencias', { id: 'p-ex1', vistoriaId: '', escolaId: 'e-deodoro', etapa: 'eletrica', descricao: 'Fotos e medição do QDC', status: 'aberta', criadoEm: agora });
  Db.upsert('Pendencias', { id: 'p-ex2', vistoriaId: '', escolaId: 'e-bilac', etapa: 'estrutura', descricao: 'Acesso à cobertura para fotos', status: 'aberta', criadoEm: agora });

  const msg = 'Dados de exemplo carregados.\n' +
    '• Coordenação (você): ' + emailAdmin + ' / senha vistar2026\n' +
    '• Técnico: marcos.silva@exemplo.com (ou matrícula 1001) / senha vistar2026\n' +
    '• Supervisor: roberto.lima@exemplo.com (ou matrícula 2001) / senha vistar2026\n' +
    '• Primeiro acesso de teste: matrícula 1002 com o código ' + codJoao;
  console.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { /* executado pelo editor */ }
  return msg;
}

/**
 * Cria (ou recria) o acesso de administrador para quem está executando o script
 * e mostra um código de ativação para usar em "Primeiro acesso" no app.
 */
function criarAdministrador() {
  instalarVistAR();
  const email = Session.getEffectiveUser().getEmail();
  if (!email) throw new Error('Não foi possível identificar seu e-mail Google.');
  const ex = Db.all('Usuarios').find(x => String(x.email).toLowerCase() === email.toLowerCase());
  const u = Db.upsert('Usuarios', Object.assign({ ativo: 'sim', criadoEm: agora_(), tokenVersao: '1', cargo: 'Coordenação técnica', empresa: getConfig_().EMPRESA },
    ex || { id: 'u-admin', nome: email.split('@')[0] }, { email: email, perfil: 'admin', matricula: (ex && ex.matricula) || '1000', ativo: 'sim' }));
  const cod = gerarCodigo_(u);
  const msg = 'Acesso de administrador pronto.\n\nNo app, toque em "Primeiro acesso" e informe:\n• Usuário: ' + email + ' (ou matrícula ' + u.matricula + ')\n• Código: ' + cod +
    '\n\nO código vale por 72 horas. Depois edite seu nome e equipe na aba Usuarios, se quiser.';
  console.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { /* executado pelo editor: veja o registro de execução */ }
  return msg;
}

/* ───────────────────────── Menu da planilha ───────────────────────── */

function onOpen() {
  try {
    SpreadsheetApp.getUi().createMenu('VistAR')
      .addItem('Instalar / atualizar estrutura', 'instalarVistAR')
      .addItem('Criar meu acesso de administrador', 'criarAdministrador')
      .addItem('Carregar dados de exemplo', 'carregarExemplo')
      .addSeparator()
      .addItem('Definir senha de usuário…', 'menuSenha_')
      .addItem('Geocodificar escolas sem coordenadas', 'geocodificarEscolas')
      .addItem('Abrir o app', 'menuAbrirApp_')
      .addToUi();
  } catch (e) { /* sem UI (ex.: execução por gatilho) */ }
}

function menuSenha_() {
  const ui = SpreadsheetApp.getUi();
  const r1 = ui.prompt('VistAR', 'E-mail do usuário:', ui.ButtonSet.OK_CANCEL);
  if (r1.getSelectedButton() !== ui.Button.OK) return;
  const r2 = ui.prompt('VistAR', 'Nova senha (mín. 6 caracteres):', ui.ButtonSet.OK_CANCEL);
  if (r2.getSelectedButton() !== ui.Button.OK) return;
  const email = r1.getResponseText().trim().toLowerCase();
  const u = Db.all('Usuarios').find(x => String(x.email).toLowerCase() === email);
  if (!u) { ui.alert('Usuário não encontrado. Cadastre-o na aba Usuarios primeiro (id, email, nome, equipeId…).'); return; }
  definirSenha_(u, r2.getResponseText());
  ui.alert('Senha definida para ' + u.nome + '.');
}

function menuAbrirApp_() {
  const url = ScriptApp.getService().getUrl();
  const html = url
    ? '<p style="font-family:sans-serif">Abra: <a target="_blank" href="' + url + '">' + url + '</a></p>'
    : '<p style="font-family:sans-serif">Publique primeiro: Implantar › Nova implantação › App da Web.</p>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(420).setHeight(120), 'VistAR');
}

/** Usa o serviço Maps do Apps Script para preencher lat/lng das escolas. */
function geocodificarEscolas() {
  const geo = Maps.newGeocoder().setRegion('br').setLanguage('pt-BR');
  Db.all('Escolas').filter(e => !e.lat || !e.lng).forEach(e => {
    const end = [e.logradouro, e.numero, e.bairro, 'São Paulo - SP', e.cep].filter(String).join(', ');
    const r = geo.geocode(end);
    if (r.status === 'OK' && r.results.length) {
      const loc = r.results[0].geometry.location;
      Db.upsert('Escolas', { id: e.id, lat: loc.lat, lng: loc.lng });
    }
    Utilities.sleep(150);
  });
}
