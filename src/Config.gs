/**
 * VistAR · Configuração, esquema da planilha e instalação.
 *
 * A planilha é o banco de dados; o Drive guarda fotos, assinaturas e PDFs.
 * Rode `instalarVistAR()` uma vez no editor (ou pelo menu VistAR da planilha).
 */

const VERSAO = '1.0.0';

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
  KW_POR_TR: '1.05'
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
  KW_POR_TR: 'Premissa de consumo elétrico (kW por TR) no pré-dimensionamento'
};

/** Abas e colunas. A primeira coluna é sempre a chave. */
const SCHEMA = {
  Config: ['chave', 'valor', 'descricao'],
  Usuarios: ['id', 'email', 'nome', 'cargo', 'equipeId', 'rg', 'empresa', 'telefone', 'perfil', 'dres',
    'fotoId', 'senhaHash', 'salt', 'tokenVersao', 'ativo', 'criadoEm'],
  Equipes: ['id', 'nome', 'membros', 'supervisorNome', 'supervisorTel', 'status', 'statusDesde',
    'vistoriaAtual', 'destinoEscolaId', 'destinoEta'],
  DREs: ['id', 'nome', 'engenheiroNome', 'engenheiroCargo', 'engenheiroTel', 'engenheiroEmail'],
  Escolas: ['id', 'nome', 'cie', 'dre', 'etapaEnsino', 'logradouro', 'numero', 'cep', 'bairro', 'complemento',
    'lat', 'lng', 'diretor', 'telefone', 'email', 'ambientesPrevistos', 'imovel', 'idadeAnos', 'fotoId',
    'status', 'nota', 'atualizadoEm'],
  Roteiro: ['id', 'data', 'hora', 'equipeId', 'escolaId', 'ordem', 'status', 'nota', 'vistoriaId'],
  Vistorias: ['id', 'codigo', 'escolaId', 'equipeId', 'usuarioId', 'status', 'checkin', 'checkout',
    'latIn', 'lngIn', 'latOut', 'lngOut', 'pastaId', 'relVistoriaId', 'relCompletoId', 'assinadoEm',
    'copiaPara', 'copiaEnviadaEm', 'resumo', 'atualizadoEm'],
  Etapas: ['id', 'vistoriaId', 'etapa', 'atualizadoEm', 'autor', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
  Fotos: ['id', 'vistoriaId', 'escolaId', 'etapa', 'slot', 'ref', 'legenda', 'fileId', 'criadoEm', 'autor', 'lat', 'lng'],
  Pendencias: ['id', 'vistoriaId', 'escolaId', 'etapa', 'descricao', 'status', 'criadoEm', 'resolvidoEm', 'resolvidoPor'],
  Cancelamentos: ['id', 'vistoriaId', 'escolaId', 'motivo', 'houveRecusa', 'quemRecusou', 'descricao', 'fotoId',
    'usuarioId', 'criadoEm'],
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
  criarUsuario_({ id: 'u-marcos', email: emailAdmin, nome: 'Marcos Silva', cargo: 'Técnico de campo', equipeId: 'eq02',
    rg: '12.345.678-9', empresa: CONFIG_PADRAO.EMPRESA, telefone: '(11) 98888-0000', perfil: 'admin',
    dres: 'Penha, Itaquera, Ermelino Matarazzo' }, 'vistar2026');
  criarUsuario_({ id: 'u-joao', email: 'joao.souza@exemplo.com', nome: 'João Souza', cargo: 'Técnico de campo',
    equipeId: 'eq02', rg: '23.456.789-0', empresa: CONFIG_PADRAO.EMPRESA, perfil: 'tecnico',
    dres: 'Penha, Itaquera, Ermelino Matarazzo' }, 'vistar2026');

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

  Db.upsert('Pendencias', { id: 'p-ex1', vistoriaId: '', escolaId: 'e-deodoro', etapa: 'eletrica', descricao: 'Fotos e medição do QDC', status: 'aberta', criadoEm: agora });
  Db.upsert('Pendencias', { id: 'p-ex2', vistoriaId: '', escolaId: 'e-bilac', etapa: 'estrutura', descricao: 'Acesso à cobertura para fotos', status: 'aberta', criadoEm: agora });

  console.log('Dados de exemplo carregados. Login: ' + emailAdmin + ' / senha: vistar2026');
}

/* ───────────────────────── Menu da planilha ───────────────────────── */

function onOpen() {
  try {
    SpreadsheetApp.getUi().createMenu('VistAR')
      .addItem('Instalar / atualizar estrutura', 'instalarVistAR')
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
