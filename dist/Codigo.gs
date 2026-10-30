/**
 * VistAR 1.1.0 · servidor completo em um arquivo (gerado por dev/build-dist.js).
 * Não edite aqui: edite src/ e gere de novo. Para instalar, veja docs/GUIA_DE_IMPLANTACAO.md.
 */

/* ════════════════════ Config.gs ════════════════════ */

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


/* ════════════════════ Db.gs ════════════════════ */

/**
 * VistAR · Camada de dados sobre o Google Sheets.
 * Cada aba é uma tabela; a primeira coluna é a chave. Todos os valores são texto.
 */
const Db = (function () {
  let ss_ = null;
  const cacheAbas_ = {};

  function ss() {
    if (ss_) return ss_;
    const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    ss_ = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
    if (!ss_) throw new Error('Planilha não configurada. Execute instalarVistAR() no editor.');
    return ss_;
  }

  function aba(nome) {
    if (cacheAbas_[nome]) return cacheAbas_[nome];
    const sh = ss().getSheetByName(nome);
    if (!sh) throw new Error('Aba "' + nome + '" não encontrada. Execute instalarVistAR().');
    return (cacheAbas_[nome] = sh);
  }

  function paraObjeto_(cols, linha) {
    const o = {};
    cols.forEach((k, i) => {
      let v = linha[i];
      if (v instanceof Date) v = v.toISOString();
      o[k] = v === null || v === undefined ? '' : (typeof v === 'number' ? String(v) : v);
    });
    return o;
  }

  function paraCelula_(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') v = JSON.stringify(v);
    v = String(v);
    return /^[=+@]/.test(v) ? "'" + v : v; // nunca vira fórmula
  }

  /** Lê a aba inteira (memoizado por execução). */
  const memo_ = {};
  function all(nome) {
    if (memo_[nome]) return memo_[nome].map(o => Object.assign({}, o));
    const sh = aba(nome);
    const cols = SCHEMA[nome];
    const n = sh.getLastRow();
    const lista = n < 2 ? [] : sh.getRange(2, 1, n - 1, cols.length).getValues()
      .filter(r => r[0] !== '' && r[0] !== null)
      .map(r => paraObjeto_(cols, r));
    memo_[nome] = lista;
    return lista.map(o => Object.assign({}, o));
  }

  function linhaDe_(nome, id) {
    const sh = aba(nome);
    const n = sh.getLastRow();
    if (n < 2) return 0;
    const cel = sh.getRange(2, 1, n - 1, 1).createTextFinder(String(id)).matchEntireCell(true).findNext();
    return cel ? cel.getRow() : 0;
  }

  function find(nome, id) {
    if (id === '' || id === null || id === undefined) return null;
    if (memo_[nome]) {
      const hit = memo_[nome].find(o => String(o[SCHEMA[nome][0]]) === String(id));
      return hit ? Object.assign({}, hit) : null;
    }
    const row = linhaDe_(nome, id);
    if (!row) return null;
    const cols = SCHEMA[nome];
    return paraObjeto_(cols, aba(nome).getRange(row, 1, 1, cols.length).getValues()[0]);
  }

  /** Insere ou mescla campos no registro com a mesma chave. */
  function upsert(nome, obj) {
    const cols = SCHEMA[nome];
    const sh = aba(nome);
    const id = obj[cols[0]];
    const row = id === undefined || id === '' ? 0 : linhaDe_(nome, id);
    let atual = {};
    if (row) atual = paraObjeto_(cols, sh.getRange(row, 1, 1, cols.length).getValues()[0]);
    const novo = Object.assign({}, atual, obj);
    const valores = [cols.map(k => paraCelula_(novo[k]))];
    if (row) sh.getRange(row, 1, 1, cols.length).setValues(valores);
    else sh.getRange(sh.getLastRow() + 1, 1, 1, cols.length).setNumberFormat('@').setValues(valores);
    delete memo_[nome];
    return novo;
  }

  function remove(nome, id) {
    const row = linhaDe_(nome, id);
    if (row) aba(nome).deleteRow(row);
    delete memo_[nome];
    return !!row;
  }

  function where(nome, fn) { return all(nome).filter(fn); }

  return { ss: ss, aba: aba, all: all, find: find, upsert: upsert, remove: remove, where: where };
})();

/* ───────────── Etapas da vistoria (JSON fatiado em até 6 células) ───────────── */

const FATIA_ = 45000;

/**
 * Grava a etapa. O JSON fica num envelope { __v: 2, d: dados, m: { caminho: carimbo } }:
 * "m" guarda quando cada campo (ou registro de coleção) foi alterado, para mesclar
 * edições de vários técnicos sem que um sobrescreva o outro.
 */
function salvarEtapaDb_(vistoriaId, etapa, dados, autor, meta) {
  const json = JSON.stringify({ __v: 2, d: dados || {}, m: meta || {} });
  if (json.length > FATIA_ * 6) throw new Error('Os dados da etapa ' + etapa + ' ficaram grandes demais.');
  const reg = { id: vistoriaId + ':' + etapa, vistoriaId: vistoriaId, etapa: etapa, atualizadoEm: agora_(), autor: autor || '' };
  for (let i = 0; i < 6; i++) {
    const parte = json.substr(i * FATIA_, FATIA_);
    reg['p' + (i + 1)] = parte ? '~' + parte : '';
  }
  return Db.upsert('Etapas', reg);
}

function lerEnvelope_(r) {
  let json = '';
  for (let i = 1; i <= 6; i++) json += String(r['p' + i] || '').replace(/^~/, '');
  try {
    const o = JSON.parse(json || '{}');
    return o && o.__v === 2 ? { dados: o.d || {}, m: o.m || {}, ts: r.atualizadoEm, autor: r.autor } : { dados: o || {}, m: {}, ts: r.atualizadoEm, autor: r.autor };
  } catch (e) { return { dados: {}, m: {}, ts: '', autor: '' }; }
}

/** Todas as etapas da vistoria: { etapa: { dados, ts } } (sem os carimbos internos). */
function lerEtapas_(vistoriaId) {
  const out = {};
  Db.where('Etapas', r => r.vistoriaId === vistoriaId).forEach(r => {
    const e = lerEnvelope_(r);
    out[r.etapa] = { dados: e.dados, ts: e.ts, autor: e.autor };
  });
  return out;
}

/* ───────────── Mesclagem por campo (vários técnicos na mesma vistoria) ───────────── */

function partes_(caminho) { return String(caminho).split('.').filter(String); }
function definirCaminho_(o, ks, v) {
  let x = o;
  ks.slice(0, -1).forEach((k, i) => {
    if (x[k] === null || x[k] === undefined || typeof x[k] !== 'object') x[k] = /^\d+$/.test(ks[i + 1]) ? [] : {};
    x = x[k];
  });
  x[ks[ks.length - 1]] = v;
}
function lerCaminho_(o, ks) { return ks.reduce((x, k) => (x === null || x === undefined ? undefined : x[k]), o); }
/** Completa em "alvo" só as chaves que não existem (não sobrescreve nada). */
function completar_(alvo, fonte) {
  Object.keys(fonte || {}).forEach(k => {
    if (alvo[k] === undefined) alvo[k] = fonte[k];
    else if (alvo[k] && fonte[k] && typeof alvo[k] === 'object' && typeof fonte[k] === 'object' && !Array.isArray(alvo[k])) completar_(alvo[k], fonte[k]);
  });
  return alvo;
}

/**
 * Aplica operações { p, v, ts, init? } sobre a etapa:
 *  - "etapa.campo.sub"        → define o campo (vence o carimbo mais recente);
 *  - "etapa.colecao#id"       → cria/substitui o registro com aquele id (v = null apaga);
 *  - init (p = "etapa")       → só completa o que ainda não existe (criação/retomada).
 * Operação mais antiga que a última gravada para o mesmo caminho é ignorada.
 */
function aplicarOps_(dados, meta, etapa, ops) {
  let aplicadas = 0;
  (ops || []).forEach(op => {
    const ts = String(op.ts || '');
    const p = String(op.p || '');
    if (p.split(/[.#]/)[0] !== etapa) return;
    if (op.init) { completar_(dados, op.v || {}); aplicadas++; return; }
    const chave = p.slice(etapa.length + 1);
    if (!chave) return;
    if (meta[chave] && meta[chave] > ts) return;
    if (chave.indexOf('#') >= 0) {
      const col = chave.split('#')[0], id = chave.split('#')[1];
      let arr = lerCaminho_(dados, partes_(col));
      if (!Array.isArray(arr)) { arr = []; definirCaminho_(dados, partes_(col), arr); }
      const i = arr.findIndex(r => r && r.id === id);
      if (op.v === null || op.v === undefined) { if (i >= 0) arr.splice(i, 1); }
      else if (i >= 0) arr[i] = op.v; else arr.push(op.v);
    } else {
      definirCaminho_(dados, partes_(chave), op.v === undefined ? '' : op.v);
    }
    meta[chave] = ts;
    aplicadas++;
  });
  return aplicadas;
}

/* ───────────── Utilitários ───────────── */

function agora_() { return new Date().toISOString(); }
function hoje_() { return Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd'); }
function fmtData_(iso, padrao) {
  if (!iso) return '';
  return Utilities.formatDate(new Date(iso), 'America/Sao_Paulo', padrao || 'dd/MM/yyyy');
}
function lista_(s) { return String(s || '').split(',').map(x => x.trim()).filter(String); }
function num_(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace(/\./g, '').replace(',', '.'));
  return isNaN(n) ? Number(String(v).replace(',', '.')) || 0 : n;
}
function dec_(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}
function uid_() { return Utilities.getUuid().replace(/-/g, '').slice(0, 16); }

function log_(usuario, acao, detalhe) {
  try { Db.upsert('Log', { ts: agora_() + '·' + uid_().slice(0, 4), usuario: usuario || '', acao: acao, detalhe: typeof detalhe === 'string' ? detalhe : JSON.stringify(detalhe || '') }); } catch (e) { console.warn(e); }
}

function comLock_(fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw new Error('Servidor ocupado, tente novamente.');
  try { return fn(); } finally { lock.releaseLock(); }
}


/* ════════════════════ Auth.gs ════════════════════ */

/**
 * VistAR · Autenticação própria (e-mail + senha) com token assinado (HMAC).
 * Com a implantação em domínio Google Workspace, o login também é automático
 * pelo e-mail da conta Google (SSO) quando ele existe na aba Usuarios.
 */

function segredo_() {
  const p = PropertiesService.getScriptProperties();
  let s = p.getProperty('TOKEN_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('TOKEN_SECRET', s); }
  return s;
}

function hashSenha_(senha, salt) {
  let h = String(senha);
  for (let i = 0; i < 300; i++) {
    h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + h + salt, Utilities.Charset.UTF_8));
  }
  return h;
}

function criarUsuario_(dados, senha) {
  const atual = Db.find('Usuarios', dados.id);
  const u = Db.upsert('Usuarios', Object.assign({ ativo: 'sim', criadoEm: agora_(), tokenVersao: '1' }, atual || {}, dados));
  if (senha && (!atual || !atual.senhaHash)) definirSenha_(u, senha);
  return u;
}

function definirSenha_(u, senha) {
  if (String(senha || '').length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
  const salt = Utilities.getUuid();
  Db.upsert('Usuarios', { id: u.id, salt: salt, senhaHash: hashSenha_(senha, salt), tokenVersao: String((Number(u.tokenVersao) || 1) + 1) });
}

function emitirToken_(u, curto) {
  const dias = curto ? 1 : (Number(getConfig_().TOKEN_DIAS) || 30);
  const corpo = Utilities.base64EncodeWebSafe(JSON.stringify({ u: u.id, v: String(u.tokenVersao || '1'), e: Date.now() + dias * 864e5 }));
  const sig = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(corpo, segredo_()));
  return corpo + '.' + sig;
}

function erroAuth_(msg) { const e = new Error(msg || 'Sessão expirada. Entre novamente.'); e.code = 'AUTH'; return e; }

function validarToken_(token) {
  if (!token || String(token).indexOf('.') < 0) throw erroAuth_();
  const partes = String(token).split('.');
  const sig = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(partes[0], segredo_()));
  if (sig !== partes[1]) throw erroAuth_();
  const p = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(partes[0])).getDataAsString());
  if (!p.e || p.e < Date.now()) throw erroAuth_();
  const u = Db.find('Usuarios', p.u);
  if (!u || u.ativo === 'nao') throw erroAuth_('Usuário desativado.');
  if (String(u.tokenVersao || '1') !== String(p.v)) throw erroAuth_();
  return u;
}

/** Encontra o usuário pelo e-mail ou pela matrícula. */
function acharUsuario_(login) {
  const l = String(login || '').trim().toLowerCase();
  if (!l) return null;
  return Db.all('Usuarios').find(x => x.ativo !== 'nao' && (String(x.email).toLowerCase() === l || (x.matricula && String(x.matricula).toLowerCase() === l))) || null;
}

function limiteTentativas_(chave) {
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get(chave) || 0);
  if (n >= 6) throw new Error('Muitas tentativas. Aguarde 10 minutos.');
  return () => cache.put(chave, String(n + 1), 600);
}

function acaoLogin_(p) {
  const chave = 'tent:' + String(p.email || '').trim().toLowerCase();
  const falhou = limiteTentativas_(chave);
  const u = acharUsuario_(p.email);
  if (u && !u.senhaHash && u.codigoAtivacao) throw new Error('Este acesso ainda não foi ativado. Toque em "Primeiro acesso".');
  if (!u || !u.senhaHash || hashSenha_(p.senha || '', u.salt) !== u.senhaHash) { falhou(); throw new Error('Usuário ou senha incorretos.'); }
  CacheService.getScriptCache().remove(chave);
  Db.upsert('Usuarios', { id: u.id, ultimoAcesso: agora_() });
  log_(u.id, 'login', '');
  return { token: emitirToken_(u, p.manter === false), boot: montarBoot_(u) };
}

/** Código de 6 dígitos, válido por 72 h, para primeiro acesso ou nova senha. */
function gerarCodigo_(u) {
  const cod = String(Math.floor(100000 + Math.random() * 900000));
  Db.upsert('Usuarios', { id: u.id, codigoAtivacao: cod, codigoExpira: new Date(Date.now() + 72 * 3600e3).toISOString() });
  return cod;
}

function conferirCodigo_(p) {
  const falhou = limiteTentativas_('cod:' + String(p.login || '').toLowerCase());
  const u = acharUsuario_(p.login);
  const ok = u && u.codigoAtivacao && String(u.codigoAtivacao) === String(p.codigo || '').trim() && new Date(u.codigoExpira) > new Date();
  if (!ok) { falhou(); throw new Error('Código inválido ou vencido. Peça um novo ao administrador.'); }
  return u;
}

function acaoValidarCodigo_(p) {
  const u = conferirCodigo_(p);
  const eq = Db.find('Equipes', u.equipeId) || {};
  return { nome: u.nome, cargo: u.cargo, equipe: eq.nome || '', iniciais: publicoUsuario_(u).iniciais };
}

function senhaForte_(s) {
  s = String(s || '');
  if (s.length < 8 || !/[A-Z]/.test(s) || !/\d/.test(s)) throw new Error('A senha precisa de 8 caracteres, uma letra maiúscula e um número.');
}

function acaoAtivar_(p) {
  const u = conferirCodigo_(p);
  if (!p.aceite) throw new Error('É preciso aceitar os termos de uso.');
  senhaForte_(p.senha);
  definirSenha_(u, p.senha);
  Db.upsert('Usuarios', { id: u.id, codigoAtivacao: '', codigoExpira: '', ultimoAcesso: agora_() });
  const atual = Db.find('Usuarios', u.id);
  log_(u.id, 'ativacao', '');
  return { token: emitirToken_(atual), boot: montarBoot_(atual) };
}

/** Envia um código de redefinição para o e-mail do usuário (resposta sempre genérica). */
function acaoEsqueciSenha_(p) {
  limiteTentativas_('esq:' + String(p.login || '').toLowerCase())();
  const u = acharUsuario_(p.login);
  if (u && /@/.test(u.email)) {
    const cod = gerarCodigo_(u);
    const cfg = getConfig_();
    try {
      MailApp.sendEmail({
        to: u.email, name: 'VistAR · ' + cfg.CONSORCIO, subject: 'Seu código de acesso ao VistAR',
        htmlBody: '<div style="font-family:Arial,sans-serif"><p>Olá, ' + esc_(u.nome) + '.</p><p>Use o código abaixo em <b>Primeiro acesso</b> para criar uma nova senha. Ele vale por 72 horas.</p>' +
          '<p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#0F2140">' + cod + '</p><p style="color:#5B6B82">Se não foi você, ignore este e-mail.</p></div>'
      });
    } catch (e) { console.warn(e); }
    log_(u.id, 'esqueci', '');
  }
  return { ok: true };
}

function acaoSenha_(p, u) {
  if (hashSenha_(p.atual || '', u.salt) !== u.senhaHash) throw new Error('Senha atual incorreta.');
  senhaForte_(p.nova);
  definirSenha_(u, p.nova);
  const atualizado = Db.find('Usuarios', u.id);
  log_(u.id, 'senha', 'alterada');
  return { token: emitirToken_(atualizado) };
}

function publicoUsuario_(u) {
  return {
    id: u.id, email: u.email, nome: u.nome, cargo: u.cargo, equipeId: u.equipeId, rg: u.rg,
    empresa: u.empresa, telefone: u.telefone, perfil: u.perfil || 'tecnico', dres: lista_(u.dres), fotoId: u.fotoId, matricula: u.matricula,
    supervisor: ['supervisor', 'admin', 'coordenacao'].indexOf(u.perfil) >= 0,
    iniciais: String(u.nome || '?').split(/\s+/).filter(String).map(s => s[0]).slice(0, 2).join('').toUpperCase()
  };
}


/* ════════════════════ Code.gs ════════════════════ */

/**
 * VistAR · Ponto de entrada do App da Web.
 */

/** Meta tags que o Google aceita em App da Web (qualquer outra derruba a página). */
const META_PERMITIDAS_ = ['viewport', 'mobile-web-app-capable', 'apple-mobile-web-app-capable', 'apple-mobile-web-app-title', 'apple-mobile-web-app-status-bar-style'];

function doGet(e) {
  try {
    const t = HtmlService.createTemplateFromFile('Index');
    const cfg = getConfig_();
    let sso = null;
    try {
      const email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
      if (email) {
        const u = Db.all('Usuarios').find(x => String(x.email).toLowerCase() === email && x.ativo !== 'nao');
        if (u) sso = { token: emitirToken_(u), email: email };
      }
    } catch (err) { /* sem e-mail disponível para esta implantação */ }

    t.boot = JSON.stringify({ cfg: configPublica_(cfg), sso: sso, params: (e && e.parameter) || {} })
      .replace(/</g, '\\u003c');

    const out = t.evaluate().setTitle('VistAR · ' + cfg.CONSORCIO).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    [['viewport', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover'], ['mobile-web-app-capable', 'yes'],
      ['apple-mobile-web-app-capable', 'yes'], ['apple-mobile-web-app-title', 'VistAR'], ['apple-mobile-web-app-status-bar-style', 'black-translucent']]
      .forEach(m => { try { out.addMetaTag(m[0], m[1]); } catch (err) { console.warn('meta ' + m[0], err); } });
    return out;
  } catch (err) {
    console.error('[doGet]', err && err.stack ? err.stack : err);
    return paginaErro_(err);
  }
}

/** Página amigável quando o app não consegue abrir (com a causa mais provável). */
function paginaErro_(err) {
  const msg = String((err && err.message) || err);
  let dica = 'Tente recarregar a página. Se continuar, avise o administrador do sistema com a mensagem abaixo.';
  if (/Planilha não configurada|Aba ".*" não encontrada/.test(msg)) dica = 'O administrador precisa executar a função <b>instalarVistAR</b> no editor do Apps Script.';
  else if (/Arquivo HTML|No HTML file|não encontrado.*HTML|Index/i.test(msg)) dica = 'Falta um arquivo HTML no projeto. Confira se existem <b>Index</b>, <b>RelatorioVistoria</b> e <b>RelatorioCompleto</b>, com esses nomes exatos.';
  else if (/autoriza|authoriz|permission|permiss/i.test(msg)) dica = 'O administrador precisa abrir o editor do Apps Script, executar <b>instalarVistAR</b> e autorizar as permissões.';
  return HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;max-width:520px;margin:40px auto;padding:24px;border-radius:16px;background:#F1F4F8;color:#0F1E36">' +
    '<div style="font-size:28px;font-weight:800">Vist<span style="color:#1F8F86">AR</span></div>' +
    '<h2 style="margin:18px 0 8px">Não foi possível abrir o app</h2><p>' + dica + '</p>' +
    '<p style="background:#fff;border-radius:10px;padding:10px 12px;font-family:monospace;font-size:13px;color:#A62626">' + esc_(msg) + '</p>' +
    '<p><a href="" target="_top" style="color:#1F8F86;font-weight:bold">Tentar de novo</a></p></div>')
    .setTitle('VistAR · erro').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Inclui um arquivo HTML (CSS/JS) dentro do template. */
function include(nome) {
  try { return HtmlService.createHtmlOutputFromFile(nome).getContent(); }
  catch (err) { throw new Error('Arquivo HTML "' + nome + '" não encontrado no projeto (' + err.message + ').'); }
}

/** Erros passageiros do Google (cota, servidor ocupado, tempo): o app tenta de novo, sem contar como recusa. */
function erroTemporario_(msg) {
  return /Servidor ocupado|too many|Limite|quota|cota|Service invoked|Service unavailable|temporarily|temporariamente|timed out|tempo limite|Tempo máximo|Exceeded maximum execution|lock|Address unavailable|Ocorreu um erro do servidor|server error|Internal error|erro interno/i.test(msg);
}

/**
 * Ponto único chamado pelo cliente via google.script.run.api(acao, token, payload).
 * Sempre devolve { ok, data } ou { ok:false, error, code } — nunca lança exceção:
 *   code "AUTH" → entrar de novo; "TEMP" → falha passageira do Google (repetir);
 *   sem código → recusa de negócio (não repetir sem corrigir).
 */
function api(acao, token, payload) {
  const inicio = Date.now();
  let u = null;
  try {
    const def = acoes_()[acao];
    if (!def) throw new Error('Ação desconhecida: ' + acao + '. O app pode estar desatualizado: recarregue a página.');
    u = def.publico ? null : validarToken_(token);
    const exec = () => def.fn(payload || {}, u);
    const data = def.lock ? comLock_(exec) : exec();
    return { ok: true, data: data === undefined ? null : data, ms: Date.now() - inicio };
  } catch (err) {
    const msg = String((err && err.message) || err);
    const code = (err && err.code) || (erroTemporario_(msg) ? 'TEMP' : '');
    console.error('[api:' + acao + ']', err && err.stack ? err.stack : err);
    if (code !== 'AUTH') { try { log_(u ? u.id : '', 'erro', { acao: acao, erro: msg.slice(0, 300) }); } catch (x) { /* planilha indisponível */ } }
    return { ok: false, error: msg, code: code };
  }
}

/** Erros de tela (JavaScript no celular) registrados na aba Log para diagnóstico. */
function acaoLogErro_(p, u) {
  log_(u ? u.id : '', 'erro_app', { msg: String(p.msg || '').slice(0, 300), onde: String(p.onde || '').slice(0, 200), tela: p.tela || '', versao: p.versao || '' });
  return { ok: true };
}

/** Montado sob demanda: evita depender da ordem de carga dos arquivos .gs. */
function acoes_() {
  return {
    login: { fn: acaoLogin_, publico: true },
    bootstrap: { fn: (p, u) => montarBoot_(u) },
    senha: { fn: acaoSenha_, lock: true },
    fotoPerfil: { fn: acaoFotoPerfil_, lock: true },
    checkin: { fn: acaoCheckin_, lock: true },
    salvarEtapa: { fn: acaoSalvarEtapa_, lock: true },
    uploadFoto: { fn: acaoUploadFoto_, lock: true },
    removerFoto: { fn: acaoRemoverFoto_, lock: true },
    cancelar: { fn: acaoCancelar_, lock: true },
    finalizar: { fn: acaoFinalizar_, lock: true },
    relatorio: { fn: acaoRelatorio_ },
    pdf: { fn: acaoPdf_ },
    enviarCopia: { fn: acaoEnviarCopia_ },
    rota: { fn: acaoRota_ },
    escola: { fn: acaoEscola_ },
    thumbs: { fn: acaoThumbs_ },
    resolverPendencia: { fn: acaoResolverPendencia_, lock: true },
    statusEquipe: { fn: acaoStatusEquipe_, lock: true },
    validarCodigo: { fn: acaoValidarCodigo_, publico: true },
    ativar: { fn: acaoAtivar_, publico: true, lock: true },
    esqueciSenha: { fn: acaoEsqueciSenha_, publico: true, lock: true },
    ping: { fn: acaoPing_, lock: true },
    painel: { fn: acaoPainel_ },
    equipes: { fn: acaoEquipes_ },
    validacoes: { fn: acaoValidacoes_ },
    validar: { fn: acaoValidar_, lock: true },
    vistoriaDetalhe: { fn: acaoVistoriaDetalhe_ },
    reabrir: { fn: acaoReabrir_, lock: true },
    pendenciasPainel: { fn: acaoPendenciasPainel_ },
    reagendar: { fn: acaoReagendar_, lock: true },
    cobrarDre: { fn: acaoCobrarDre_, lock: true },
    registro: { fn: acaoRegistro_ },
    retomarDados: { fn: acaoRetomarDados_ },
    programacao: { fn: acaoProgramacao_ },
    salvarVisita: { fn: acaoSalvarVisita_, lock: true },
    excluirVisita: { fn: acaoExcluirVisita_, lock: true },
    galeria: { fn: acaoGaleria_ },
    legenda: { fn: acaoLegenda_, lock: true },
    usuarios: { fn: acaoUsuarios_ },
    salvarUsuario: { fn: acaoSalvarUsuario_, lock: true },
    novoCodigo: { fn: acaoNovoCodigo_, lock: true },
    entrarVistoria: { fn: acaoEntrarVistoria_, lock: true },
    sairVistoria: { fn: acaoSairVistoria_, lock: true },
    puxarVistoria: { fn: acaoPuxarVistoria_ },
    guardarFalha: { fn: acaoGuardarFalha_, lock: true },
    logErro: { fn: acaoLogErro_ }
  };
}


/* ════════════════════ Api.gs ════════════════════ */

/**
 * VistAR · Ações chamadas pelo app (ver acoes_() em Code.gs).
 * Todas são idempotentes pela chave enviada pelo cliente, porque o app
 * trabalha offline e reenvia a fila quando a conexão volta.
 */

/* ───────────────────────── Bootstrap ───────────────────────── */

function montarBoot_(u) {
  const cfg = getConfig_();
  const equipe = Db.find('Equipes', u.equipeId) || { id: u.equipeId, nome: u.equipeId, membros: u.nome };
  const dresUsuario = lista_(u.dres);
  const dres = Db.all('DREs').filter(d => !dresUsuario.length || dresUsuario.indexOf(d.id) >= 0);
  const escolas = Db.all('Escolas').filter(e => !dresUsuario.length || dresUsuario.indexOf(e.dre) >= 0);
  const idsEscolas = {};
  escolas.forEach(e => { idsEscolas[e.id] = true; });
  const roteiro = Db.where('Roteiro', r => r.equipeId === u.equipeId);
  const vistorias = Db.where('Vistorias', v => v.equipeId === u.equipeId && v.status !== 'mesclada');
  const abertas = vistorias.filter(v => v.status === 'em_andamento').sort((a, b) => a.checkin < b.checkin ? 1 : -1);
  // Cada técnico tem a sua vistoria ativa; a equipe pode ter várias abertas (escolas diferentes).
  const ativa = abertas.find(v => lista_(v.participantes).indexOf(u.id) >= 0) || (abertas.length === 1 && !lista_(abertas[0].participantes).length ? abertas[0] : null);
  const nomes = {};
  Db.all('Usuarios').forEach(x => { nomes[x.id] = x.nome; });
  const ultimas = vistorias.filter(v => v.status === 'finalizada')
    .sort((a, b) => a.checkout < b.checkout ? 1 : -1).slice(0, 10)
    .map(v => ({ id: v.id, codigo: v.codigo, escolaId: v.escolaId, checkin: v.checkin, checkout: v.checkout, resumo: parse_(v.resumo) }));
  const pendencias = Db.where('Pendencias', p => p.status === 'aberta' && idsEscolas[p.escolaId]);

  const membros = lista_(equipe.membros);
  const parceiro = membros.filter(m => m !== u.nome)[0] || '';

  return {
    usuario: publicoUsuario_(u),
    equipe: {
      id: equipe.id, nome: equipe.nome, membros: membros, parceiro: parceiro, status: equipe.status || 'disponivel',
      statusDesde: equipe.statusDesde, destinoEscolaId: equipe.destinoEscolaId, destinoEta: equipe.destinoEta,
      supervisorNome: equipe.supervisorNome, supervisorTel: equipe.supervisorTel
    },
    cfg: configPublica_(cfg),
    empresa: u.empresa || cfg.EMPRESA,
    dres: dres,
    escolas: escolas,
    roteiro: roteiro,
    stats: {
      concluidas: roteiro.filter(r => r.status === 'concluida').length,
      aguardando: roteiro.filter(r => r.status === 'agendada' || r.status === 'em_andamento').length,
      pendentes: roteiro.filter(r => r.status === 'retorno').length
    },
    vistoriaAtiva: ativa ? vistoriaCliente_(ativa) : null,
    emAndamento: abertas.map(v => ({ id: v.id, codigo: v.codigo, escolaId: v.escolaId, checkin: v.checkin,
      participantes: participantes_(v).map(id => nomes[id] || id), souParticipante: participantes_(v).indexOf(u.id) >= 0 })),
    ultimas: ultimas,
    pendencias: pendencias,
    hoje: hoje_(),
    serverTime: agora_()
  };
}

function parse_(s) { try { return s ? JSON.parse(s) : {}; } catch (e) { return {}; } }
function historico_(s) { const h = parse_(s); return Array.isArray(h) ? h : []; }

function participantes_(v) { const l = lista_(v.participantes); return l.length ? l : (v.usuarioId ? [v.usuarioId] : []); }

function vistoriaCliente_(v) {
  const nomes = {};
  Db.all('Usuarios').forEach(x => { nomes[x.id] = x.nome; });
  return {
    id: v.id, codigo: v.codigo, escolaId: v.escolaId, status: v.status, checkin: v.checkin, checkout: v.checkout,
    participantes: participantes_(v).map(id => nomes[id] || id),
    etapas: lerEtapas_(v.id),
    fotos: Db.where('Fotos', f => f.vistoriaId === v.id).map(f => ({
      id: f.id, etapa: f.etapa, slot: f.slot, ref: f.ref, fileId: f.fileId, criadoEm: f.criadoEm, legenda: f.legenda, lat: f.lat, lng: f.lng, autor: nomes[f.autor] || ''
    }))
  };
}

/* ───────────────────────── Permissões ───────────────────────── */

/** A escola precisa estar numa DRE autorizada para o usuário (sem DREs = todas). */
function exigirEscola_(id, u) {
  const e = Db.find('Escolas', id);
  if (!e) throw new Error('Escola não encontrada.');
  const dres = lista_(u.dres);
  if (dres.length && dres.indexOf(e.dre) < 0) throw new Error('Esta escola não pertence às suas DREs autorizadas.');
  return e;
}

/** Segue vistorias "mescladas" (check-in duplicado offline) até a vistoria real. */
function resolverVistoria_(id) {
  let v = Db.find('Vistorias', id);
  for (let i = 0; v && v.mescladaEm && i < 5; i++) v = Db.find('Vistorias', v.mescladaEm);
  return v;
}

/* ───────────────────────── Check-in ───────────────────────── */

function acaoCheckin_(p, u) {
  const existente = Db.find('Vistorias', p.id);
  if (existente) {
    const real = resolverVistoria_(p.id);
    return { id: existente.id, codigo: real.codigo, pastaId: real.pastaId, mescladaEm: existente.mescladaEm || '' };
  }
  const escola = exigirEscola_(p.escolaId, u);

  // A equipe pode estar em várias escolas ao mesmo tempo, mas cada escola tem uma vistoria aberta.
  // Se o colega já abriu esta escola (ex.: os dois fizeram check-in sem sinal), as duas viram uma só.
  const mesma = Db.where('Vistorias', v => v.escolaId === escola.id && v.status === 'em_andamento')[0];
  if (mesma) {
    if (mesma.equipeId !== u.equipeId && !ehSupervisor_(u)) throw new Error('Outra equipe já está vistoriando esta escola (' + mesma.codigo + ').');
    Db.upsert('Vistorias', { id: p.id, codigo: mesma.codigo, escolaId: escola.id, equipeId: mesma.equipeId, usuarioId: u.id, status: 'mesclada',
      mescladaEm: mesma.id, checkin: p.checkin || agora_(), atualizadoEm: agora_() });
    adicionarParticipante_(mesma, u);
    log_(u.id, 'checkin', { vistoria: mesma.codigo, escola: escola.nome, juntou: true });
    return { id: p.id, codigo: mesma.codigo, pastaId: mesma.pastaId, mescladaEm: mesma.id };
  }

  const anterior = p.retomarDe ? Db.find('Vistorias', p.retomarDe) : null;
  const v = Db.upsert('Vistorias', {
    id: p.id, codigo: anterior ? anterior.codigo + '-R' + ((Number(anterior.versao) || 1) + 1) : proximoCodigo_(), escolaId: escola.id, equipeId: u.equipeId, usuarioId: u.id,
    status: 'em_andamento', checkin: p.checkin || agora_(), latIn: p.lat || '', lngIn: p.lng || '', atualizadoEm: agora_(), participantes: u.id,
    versao: anterior ? String((Number(anterior.versao) || 1) + 1) : '1', retomadaDe: anterior ? anterior.id : '',
    historico: anterior ? JSON.stringify(historico_(anterior.historico).length ? historico_(anterior.historico) : [{ v: Number(anterior.versao) || 1, em: anterior.checkout || anterior.checkin, nota: anterior.status }]) : ''
  });
  pastaVistoria_(v, escola);
  // Retomada: as fotos já enviadas continuam valendo na nova versão.
  (p.fotosCopiar || []).forEach(c => {
    const f = Db.find('Fotos', c.de);
    if (f && !Db.find('Fotos', c.id)) Db.upsert('Fotos', Object.assign({}, f, { id: c.id, vistoriaId: v.id }));
  });

  const hoje = hoje_();
  let rot = Db.where('Roteiro', r => r.equipeId === u.equipeId && r.escolaId === escola.id && r.status !== 'concluida')
    .sort((a, b) => Math.abs(new Date(a.data) - new Date(hoje)) - Math.abs(new Date(b.data) - new Date(hoje)))[0];
  if (!rot) rot = { id: 'r-' + uid_(), data: hoje, hora: fmtData_(v.checkin, 'HH:mm'), equipeId: u.equipeId, escolaId: escola.id, ordem: 0 };
  Db.upsert('Roteiro', Object.assign(rot, { status: 'em_andamento', vistoriaId: v.id }));

  Db.upsert('Equipes', { id: u.equipeId, status: 'em_campo', statusDesde: agora_(), vistoriaAtual: v.id, destinoEscolaId: '', destinoEta: '' });
  Db.upsert('Usuarios', { id: u.id, vistoriaAtual: v.id });
  log_(u.id, 'checkin', { vistoria: v.codigo, escola: escola.nome });
  return { id: v.id, codigo: v.codigo, pastaId: v.pastaId };
}

function adicionarParticipante_(v, u) {
  const l = participantes_(v);
  if (l.indexOf(u.id) < 0) Db.upsert('Vistorias', { id: v.id, participantes: l.concat(u.id).join(',') });
  Db.upsert('Usuarios', { id: u.id, vistoriaAtual: v.id });
  Db.upsert('Equipes', { id: v.equipeId, status: 'em_campo', statusDesde: agora_(), destinoEscolaId: '' });
}

/** Entrar na vistoria que o colega já abriu (mesma escola). */
function acaoEntrarVistoria_(p, u) {
  const v = exigirVistoria_(p.vistoriaId, u);
  if (v.status !== 'em_andamento') throw new Error('Esta vistoria já foi ' + (v.status === 'cancelada' ? 'cancelada.' : 'finalizada.'));
  adicionarParticipante_(v, u);
  log_(u.id, 'entrar', { vistoria: v.codigo });
  return vistoriaCliente_(Db.find('Vistorias', v.id));
}

/** Sair da vistoria sem encerrá-la (o colega continua). */
function acaoSairVistoria_(p, u) {
  const v = resolverVistoria_(p.vistoriaId);
  if (!v) return { ok: true };
  Db.upsert('Vistorias', { id: v.id, participantes: participantes_(v).filter(x => x !== u.id).join(',') });
  Db.upsert('Usuarios', { id: u.id, vistoriaAtual: '' });
  return { ok: true };
}

/** Atualizações da vistoria feitas pelos colegas (o app consulta de tempos em tempos). */
function acaoPuxarVistoria_(p, u) {
  const v = exigirVistoria_(p.vistoriaId, u);
  const r = vistoriaCliente_(v);
  if (v.status !== 'em_andamento') {
    const quem = Db.where('Log', l => /finalizar|cancelar/.test(l.acao) && String(l.detalhe).indexOf(v.codigo) >= 0).pop();
    r.encerradaPor = quem ? (Db.find('Usuarios', quem.usuario) || {}).nome || '' : '';
  }
  return r;
}

/** Cópia de segurança, no Drive, de um envio que o servidor recusou (nada se perde). */
function acaoGuardarFalha_(p, u) {
  const pasta = subpasta_(pastaRaiz_(), 'Falhas de sincronização');
  const nome = [fmtData_(agora_(), 'yyyyMMdd-HHmmss'), u.nome, p.acao].join('_').replace(/[^\w.-]+/g, '_') + '.json';
  const arq = pasta.createFile(Utilities.newBlob(JSON.stringify({ usuario: u.nome, acao: p.acao, erro: p.erro, em: agora_(), payload: p.payload }, null, 1), 'application/json', nome));
  log_(u.id, 'falha', { acao: p.acao, erro: p.erro, arquivo: arq.getId() });
  return { fileId: arq.getId() };
}

function proximoCodigo_() {
  const ano = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy');
  const props = PropertiesService.getScriptProperties();
  const chave = 'SEQ_' + ano;
  const n = Number(props.getProperty(chave) || 0) + 1;
  props.setProperty(chave, String(n));
  return 'VST-' + ano + '-' + ('000' + n).slice(-4);
}

/** Vistoria acessível: da própria equipe (ou supervisão) e de escola nas DREs do usuário. */
function exigirVistoria_(id, u) {
  const v = resolverVistoria_(id);
  if (!v) throw new Error('Vistoria não encontrada.');
  if (v.equipeId !== u.equipeId && !ehSupervisor_(u)) throw new Error('Esta vistoria pertence a outra equipe.');
  exigirEscola_(v.escolaId, u);
  return v;
}

/* ───────────────────────── Etapas e fotos ───────────────────────── */

const ETAPAS_VALIDAS_ = ['dados', 'entrada', 'estrutura', 'eletrica', 'ambientes', 'equipamentos', 'revisao'];

function acaoSalvarEtapa_(p, u) {
  const v = exigirVistoria_(p.vistoriaId, u);
  if (ETAPAS_VALIDAS_.indexOf(p.etapa) < 0) throw new Error('Etapa inválida: ' + p.etapa);
  if (v.status !== 'em_andamento') return { ignorado: true, status: v.status };
  const atual = Db.find('Etapas', v.id + ':' + p.etapa);
  const env = atual ? lerEnvelope_(atual) : { dados: {}, m: {} };
  // Formato antigo (etapa inteira) vira uma operação de inicialização.
  const ops = p.ops || [{ p: p.etapa, v: p.dados || {}, ts: agora_(), init: !!atual }];
  if (!p.ops && !atual) env.dados = p.dados || {};
  else aplicarOps_(env.dados, env.m, p.etapa, ops);
  salvarEtapaDb_(v.id, p.etapa, env.dados, u.id, env.m);
  Db.upsert('Vistorias', { id: v.id, atualizadoEm: agora_() });
  return { ts: agora_(), etapa: p.etapa, vistoriaId: v.id, dados: env.dados };
}

function acaoUploadFoto_(p, u) {
  const ja = Db.find('Fotos', p.id);
  if (ja) return { id: ja.id, fileId: ja.fileId };
  const v = exigirVistoria_(p.vistoriaId, u);
  const escola = Db.find('Escolas', v.escolaId) || { nome: v.escolaId };
  const pasta = p.etapa === 'cancelamento'
    ? subpasta_(pastaVistoria_(v, escola), 'Cancelamento')
    : subpasta_(pastaVistoria_(v, escola), rotuloEtapa_(p.etapa));
  const nome = [String(p.slot || 'foto').replace(/[^\w.-]+/g, '_'), fmtData_(p.criadoEm || agora_(), 'yyyyMMdd-HHmmss'), p.id.slice(0, 4)].join('_') + '.jpg';
  const arq = salvarBase64_(pasta, nome, p.data, p.mime || 'image/jpeg');
  arq.setDescription([escola.nome, v.codigo, p.slot, p.legenda].filter(String).join(' · '));
  Db.upsert('Fotos', {
    id: p.id, vistoriaId: v.id, escolaId: v.escolaId, etapa: p.etapa, slot: p.slot, ref: p.ref || '', legenda: p.legenda || '',
    fileId: arq.getId(), criadoEm: p.criadoEm || agora_(), autor: u.id, lat: p.lat || '', lng: p.lng || ''
  });
  return { id: p.id, fileId: arq.getId() };
}

function acaoRemoverFoto_(p, u) {
  const f = Db.find('Fotos', p.id);
  if (!f) return { removida: false };
  exigirVistoria_(f.vistoriaId, u);
  try { DriveApp.getFileById(f.fileId).setTrashed(true); } catch (e) { console.warn(e); }
  Db.remove('Fotos', p.id);
  return { removida: true };
}

function acaoFotoPerfil_(p, u) {
  const pasta = subpasta_(pastaRaiz_(), 'Credenciais');
  if (u.fotoId) { try { DriveApp.getFileById(u.fotoId).setTrashed(true); } catch (e) { /* já removida */ } }
  const arq = salvarBase64_(pasta, 'credencial_' + u.id + '.jpg', p.data, 'image/jpeg');
  Db.upsert('Usuarios', { id: u.id, fotoId: arq.getId() });
  return { fotoId: arq.getId() };
}

/** Miniaturas (data URLs) de arquivos do Drive para galerias e credencial. */
function acaoThumbs_(p, u) {
  const pedidos = (p.ids || []).slice(0, 40);
  // Só arquivos que o usuário pode ver: fotos de escolas das suas DREs (supervisão vê todas) e fotos de credencial.
  const dres = lista_(u.dres);
  const esc = {};
  Db.all('Escolas').forEach(e => { if (!dres.length || dres.indexOf(e.dre) >= 0) esc[e.id] = true; });
  const ok = {};
  Db.all('Fotos').forEach(f => { if (esc[f.escolaId]) ok[f.fileId] = true; });
  Db.all('Usuarios').forEach(x => { if (x.fotoId && (x.id === u.id || ehSupervisor_(u))) ok[x.fotoId] = true; });
  return miniaturas_(pedidos.filter(id => ok[id]), Number(p.tamanho) || 360);
}

/* ───────────────────────── Cancelamento ───────────────────────── */

function acaoCancelar_(p, u) {
  const v = exigirVistoria_(p.vistoriaId, u);
  if (v.status === 'cancelada') return { ok: true };
  if (v.status === 'finalizada') throw new Error('Esta vistoria já foi finalizada.');
  const escola = Db.find('Escolas', v.escolaId) || {};
  Db.upsert('Cancelamentos', {
    id: v.id, vistoriaId: v.id, escolaId: v.escolaId, motivo: p.motivo, houveRecusa: p.houveRecusa ? 'sim' : 'nao',
    quemRecusou: p.quemRecusou || '', descricao: p.descricao || '', fotoId: p.fotoId || '', usuarioId: u.id, criadoEm: agora_(),
    situacao: p.situacao || situacaoDoMotivo_(p.motivo)
  });
  Db.upsert('Vistorias', { id: v.id, status: 'cancelada', checkout: agora_(), atualizadoEm: agora_() });
  const nota = 'Cancelada: ' + p.motivo;
  Db.where('Roteiro', r => r.vistoriaId === v.id).forEach(r => Db.upsert('Roteiro', { id: r.id, status: 'retorno', tipo: 'retorno', nota: nota,
    data: p.retornoData || '', hora: p.retornoHora || '' }));
  Db.upsert('Escolas', { id: v.escolaId, status: 'retorno', nota: nota, atualizadoEm: agora_() });
  Db.upsert('Pendencias', {
    id: 'pc-' + v.id, vistoriaId: v.id, escolaId: v.escolaId, etapa: 'cancelamento',
    descricao: 'Nova visita necessária · ' + p.motivo + (p.quemRecusou ? ' (' + p.quemRecusou + ')' : ''), status: 'aberta', criadoEm: agora_()
  });
  statusEquipeAposEncerrar_(v.equipeId, v.id, null);
  log_(u.id, 'cancelar', { vistoria: v.codigo, escola: escola.nome, motivo: p.motivo });

  const cfg = getConfig_();
  if (cfg.EMAIL_COORDENACAO) {
    try {
      MailApp.sendEmail({
        to: cfg.EMAIL_COORDENACAO, name: 'VistAR',
        subject: '[VistAR] Vistoria cancelada · ' + escola.nome,
        htmlBody: '<p>A vistoria <b>' + v.codigo + '</b> da <b>' + escola.nome + '</b> foi cancelada por ' + u.nome + '.</p>' +
          '<p>Motivo: <b>' + p.motivo + '</b>' + (p.houveRecusa ? '<br>Recusa por: ' + (p.quemRecusou || '—') + '<br>Relato: ' + (p.descricao || '—') : '') + '</p>'
      });
    } catch (e) { console.warn(e); }
  }
  return { ok: true };
}

/* ───────────────────────── Finalização ───────────────────────── */

function acaoFinalizar_(p, u) {
  const v = exigirVistoria_(p.vistoriaId, u);
  const cfg = getConfig_();
  if (v.status === 'cancelada') throw new Error('Esta vistoria foi cancelada.');
  const escola = Db.find('Escolas', v.escolaId) || {};

  if (v.status !== 'finalizada') {
    const et = lerEtapas_(v.id);
    const rev = (et.revisao && et.revisao.dados) || {};
    const dados = (et.dados && et.dados.dados) || {};
    const pasta = pastaVistoria_(v, escola);

    // Assinaturas também ficam como arquivos no Drive (registro).
    ['assResp', 'assEmpresa'].forEach(k => {
      if (rev[k]) { try { salvarBase64_(subpasta_(pasta, 'Assinaturas'), k + '.png', rev[k], 'image/png'); } catch (e) { console.warn(e); } }
    });

    // Correções feitas no cadastro voltam para a aba Escolas.
    const campos = ['nome', 'logradouro', 'numero', 'cep', 'bairro', 'complemento', 'diretor', 'telefone', 'email', 'imovel', 'idadeAnos', 'etapaEnsino'];
    const atualiza = { id: escola.id, status: 'concluida', nota: '', atualizadoEm: agora_() };
    campos.forEach(c => { if (dados[c]) atualiza[c] = dados[c]; });
    if (!escola.lat && v.latIn) { atualiza.lat = v.latIn; atualiza.lng = v.lngIn; }
    Db.upsert('Escolas', atualiza);

    (p.pendencias || []).forEach((pd, i) => Db.upsert('Pendencias', {
      id: 'pv-' + v.id + '-' + i, vistoriaId: v.id, escolaId: v.escolaId, etapa: pd.etapa, descricao: pd.descricao,
      status: 'aberta', criadoEm: agora_()
    }));
    // Pendências antigas da escola que esta visita resolveu.
    Db.where('Pendencias', x => x.escolaId === v.escolaId && x.status === 'aberta' && x.vistoriaId !== v.id)
      .forEach(x => Db.upsert('Pendencias', { id: x.id, status: 'resolvida', resolvidoEm: agora_(), resolvidoPor: u.id }));

    const assinado = !!(rev.assResp && rev.assEmpresa);
    Db.upsert('Vistorias', {
      id: v.id, status: 'finalizada', checkout: p.checkout || agora_(), latOut: p.lat || '', lngOut: p.lng || '',
      assinadoEm: assinado ? agora_() : '', resumo: JSON.stringify(p.resumo || {}), atualizadoEm: agora_(), validacao: 'pendente',
      historico: JSON.stringify(historico_(v.historico).concat([{ v: Number(v.versao) || 1, em: agora_(), nota: 'gerada' }]))
    });
    if (v.retomadaDe) Db.where('Pendencias', x => x.vistoriaId === v.retomadaDe && x.status === 'aberta')
      .forEach(x => Db.upsert('Pendencias', { id: x.id, status: 'resolvida', resolvidoEm: agora_(), resolvidoPor: u.id }));
    Db.where('Roteiro', r => r.vistoriaId === v.id).forEach(r => Db.upsert('Roteiro', { id: r.id, status: 'concluida', nota: '' }));
  }

  const vf = Db.find('Vistorias', v.id);
  const prox = proximaEscola_(v.equipeId, v.escolaId);
  const st = statusEquipeAposEncerrar_(v.equipeId, v.id, prox);

  // Relatórios em PDF no Drive.
  const docs = {};
  try { docs.vistoria = gerarPdf_(v.id, 'vistoria'); } catch (e) { console.error(e); docs.vistoria = { erro: String(e.message || e) }; }
  try { docs.completo = gerarPdf_(v.id, 'completo'); } catch (e) { console.error(e); docs.completo = { erro: String(e.message || e) }; }

  let copia = { enviada: false };
  const rev = ((lerEtapas_(v.id).revisao || {}).dados) || {};
  const para = rev.respEmail || escola.email;
  if (/^sim/i.test(cfg.ENVIO_AUTOMATICO_COPIA) && para && vf.assinadoEm && !vf.copiaEnviadaEm) {
    try { copia = acaoEnviarCopia_({ vistoriaId: v.id, para: para }, u); } catch (e) { copia = { enviada: false, erro: String(e.message || e) }; }
  } else if (vf.copiaEnviadaEm) {
    copia = { enviada: true, para: vf.copiaPara, em: vf.copiaEnviadaEm };
  }
  log_(u.id, 'finalizar', { vistoria: vf.codigo, escola: escola.nome });

  return {
    id: v.id, codigo: vf.codigo, escolaId: v.escolaId, checkin: vf.checkin, checkout: vf.checkout,
    assinado: !!vf.assinadoEm, assinantes: [cfg.RESPONSAVEL_TECNICO, rev.respNome].filter(String),
    resumo: parse_(vf.resumo), docs: docs, copia: copia,
    equipeStatus: st,
    proxima: prox ? { escolaId: prox.escola.id, hora: prox.rot.hora } : null
  };
}

/** Depois de encerrar: se a equipe ainda tem outra escola aberta, continua em campo. */
function statusEquipeAposEncerrar_(equipeId, vistoriaId, prox) {
  const outra = Db.where('Vistorias', x => x.equipeId === equipeId && x.status === 'em_andamento' && x.id !== vistoriaId)[0];
  const st = outra ? 'em_campo' : prox ? 'em_transito' : 'disponivel';
  Db.upsert('Equipes', { id: equipeId, status: st, statusDesde: agora_(), vistoriaAtual: outra ? outra.id : '', destinoEscolaId: !outra && prox ? prox.escola.id : '' });
  Db.where('Usuarios', x => x.vistoriaAtual === vistoriaId).forEach(x => Db.upsert('Usuarios', { id: x.id, vistoriaAtual: '' }));
  return st;
}

function proximaEscola_(equipeId, exceto) {
  const hoje = hoje_();
  const rot = Db.where('Roteiro', r => r.equipeId === equipeId && r.data === hoje && r.escolaId !== exceto && r.status === 'agendada')
    .sort((a, b) => String(a.hora).localeCompare(String(b.hora)))[0];
  if (!rot) return null;
  const escola = Db.find('Escolas', rot.escolaId);
  return escola ? { rot: rot, escola: escola } : null;
}

function acaoStatusEquipe_(p, u) {
  const permitidos = ['disponivel', 'em_campo', 'em_transito', 'pausa'];
  if (permitidos.indexOf(p.status) < 0) throw new Error('Status inválido.');
  Db.upsert('Equipes', { id: u.equipeId, status: p.status, statusDesde: agora_(), destinoEscolaId: p.destinoEscolaId || '' });
  return { status: p.status };
}

/* ───────────────────────── Escola e pendências ───────────────────────── */

function acaoResolverPendencia_(p, u) {
  const x = Db.find('Pendencias', p.id);
  if (!x) throw new Error('Pendência não encontrada.');
  exigirEscola_(x.escolaId, u);
  Db.upsert('Pendencias', { id: x.id, status: 'resolvida', resolvidoEm: agora_(), resolvidoPor: u.id });
  log_(u.id, 'pendencia', { id: x.id, descricao: x.descricao });
  return { ok: true };
}

/* ───────────────────────── Rotas (serviço Maps) ───────────────────────── */

function acaoRota_(p, u) {
  const e = exigirEscola_(p.escolaId, u);
  const destino = e.lat && e.lng ? [Number(e.lat), Number(e.lng)] : null;
  const endereco = [e.logradouro, e.numero, e.bairro, 'São Paulo - SP'].filter(String).join(', ');
  const out = { escolaId: e.id, destino: destino, endereco: endereco, min: null, km: null, chegada: null, mapa: null };
  if (!p.lat || !p.lng) return out;
  const cacheKey = 'rota:' + e.id + ':' + Number(p.lat).toFixed(3) + ',' + Number(p.lng).toFixed(3);
  const cache = CacheService.getScriptCache();
  const hit = cache.get(cacheKey);
  let rota = hit ? JSON.parse(hit) : null;
  try {
    if (!rota) {
      const df = Maps.newDirectionFinder().setLanguage('pt-BR').setRegion('br')
        .setOrigin(Number(p.lat), Number(p.lng))
        .setMode(Maps.DirectionFinder.Mode.DRIVING)
        .setDepart(new Date());
      if (destino) df.setDestination(destino[0], destino[1]); else df.setDestination(endereco);
      const r = df.getDirections();
      if (r.routes && r.routes.length) {
        const leg = r.routes[0].legs[0];
        const seg = (leg.duration_in_traffic || leg.duration).value;
        rota = { seg: seg, m: leg.distance.value, poly: r.routes[0].overview_polyline.points, fim: [leg.end_location.lat, leg.end_location.lng] };
        cache.put(cacheKey, JSON.stringify(rota), 300);
      }
    }
    if (rota) {
      out.min = Math.max(1, Math.round(rota.seg / 60));
      out.km = Math.round(rota.m / 100) / 10;
      out.chegada = new Date(Date.now() + rota.seg * 1000).toISOString();
      out.destino = out.destino || rota.fim;
      if (p.mapa !== false) {
        const mapa = Maps.newStaticMap().setSize(640, 320).setLanguage('pt-BR').setMobile(true)
          .setPathStyle(5, '0x1F8F86FF', '0x00000000')
          .addPath(rota.poly)
          .setMarkerStyle(Maps.StaticMap.MarkerSize.MID, '0x0F2140', 'A').addMarker(Number(p.lat), Number(p.lng))
          .setMarkerStyle(Maps.StaticMap.MarkerSize.MID, '0xD93C3C', 'B').addMarker(out.destino[0], out.destino[1]);
        out.mapa = 'data:image/png;base64,' + Utilities.base64Encode(mapa.getBlob().getBytes());
      }
    }
  } catch (err) {
    console.warn('rota', err);
    if (destino) {
      const km = distanciaKm_(Number(p.lat), Number(p.lng), destino[0], destino[1]) * 1.3;
      out.km = Math.round(km * 10) / 10;
      out.min = Math.max(1, Math.round(km / 25 * 60));
      out.chegada = new Date(Date.now() + out.min * 60000).toISOString();
    }
  }
  if (out.chegada && p.salvarEta && u) Db.upsert('Equipes', { id: u.equipeId, destinoEta: out.chegada });
  return out;
}

function distanciaKm_(a, b, c, d) {
  const R = 6371, r = x => x * Math.PI / 180;
  const h = Math.pow(Math.sin(r(c - a) / 2), 2) + Math.cos(r(a)) * Math.cos(r(c)) * Math.pow(Math.sin(r(d - b) / 2), 2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* ───────────────────────── Drive ───────────────────────── */

function pastaRaiz_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('PASTA_RAIZ_ID');
  if (id) { try { const f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (e) { /* recria */ } }
  const f = DriveApp.createFolder('VistAR');
  props.setProperty('PASTA_RAIZ_ID', f.getId());
  return f;
}

function subpasta_(pai, nome) {
  const it = pai.getFoldersByName(nome);
  return it.hasNext() ? it.next() : pai.createFolder(nome);
}

function pastaVistoria_(v, escola) {
  if (v.pastaId) { try { return DriveApp.getFolderById(v.pastaId); } catch (e) { /* recria */ } }
  const dre = subpasta_(subpasta_(pastaRaiz_(), 'Vistorias'), 'DRE ' + (escola.dre || 'sem DRE'));
  const f = subpasta_(dre, v.codigo + ' · ' + (escola.nome || v.escolaId));
  Db.upsert('Vistorias', { id: v.id, pastaId: f.getId() });
  v.pastaId = f.getId();
  return f;
}

function salvarBase64_(pasta, nome, dados, mime) {
  const b64 = String(dados || '').replace(/^data:[^,]+,/, '');
  if (!b64) throw new Error('Arquivo vazio.');
  return pasta.createFile(Utilities.newBlob(Utilities.base64Decode(b64), mime, nome));
}

function rotuloEtapa_(e) {
  return ({ dados: '1 · Dados da escola', entrada: '2 · Entrada de energia', estrutura: '3 · Estrutura', eletrica: '4 · Elétrica',
    ambientes: '5 · Ambientes', equipamentos: '6 · Equipamentos', revisao: '7 · Revisão', geral: 'Fotos gerais', doc: 'Documentos' })[e] || e || 'Outros';
}

/**
 * Miniaturas via Drive API avançada (thumbnailLink em lote com UrlFetchApp.fetchAll);
 * se falhar, usa a miniatura padrão do DriveApp.
 */
function miniaturas_(fileIds, tamanho) {
  const out = {};
  const ids = fileIds.filter(String);
  if (!ids.length) return out;
  const cache = CacheService.getScriptCache();
  const faltam = [];
  ids.forEach(id => { const hit = cache.get('th' + tamanho + ':' + id); if (hit) out[id] = hit; else faltam.push(id); });
  if (!faltam.length) return out;

  const links = {};
  faltam.forEach(id => {
    try {
      const f = Drive.Files.get(id, { fields: 'thumbnailLink' });
      if (f.thumbnailLink) links[id] = f.thumbnailLink.replace(/=s\d+$/, '=s' + tamanho);
    } catch (e) { /* sem serviço avançado ou sem miniatura */ }
  });
  const comLink = Object.keys(links);
  if (comLink.length) {
    const token = ScriptApp.getOAuthToken();
    const resp = UrlFetchApp.fetchAll(comLink.map(id => ({ url: links[id], headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true })));
    resp.forEach((r, i) => {
      if (r.getResponseCode() === 200) {
        const blob = r.getBlob();
        out[comLink[i]] = 'data:' + (blob.getContentType() || 'image/jpeg') + ';base64,' + Utilities.base64Encode(blob.getBytes());
      }
    });
  }
  faltam.filter(id => !out[id]).forEach(id => {
    try {
      const b = DriveApp.getFileById(id).getThumbnail();
      if (b) out[id] = 'data:image/png;base64,' + Utilities.base64Encode(b.getBytes());
    } catch (e) { /* ignora */ }
  });
  faltam.forEach(id => { if (out[id] && out[id].length < 95000) cache.put('th' + tamanho + ':' + id, out[id], 21600); });
  return out;
}


/* ════════════════════ Relatorios.gs ════════════════════ */

/**
 * VistAR · Relatórios (HTML → PDF pelo HtmlService), pré-dimensionamento,
 * envio por e-mail (MailApp) e resumo diário (gatilho).
 */

/* ───────────────────────── Premissas de pré-dimensionamento ───────────────────────── */

/** BTU/h por m² por tipo de ambiente climatizável. Tipos ausentes não são climatizados. */
const FATOR_BTU_M2_ = {
  'Sala de aula': 650, 'Sala de leitura': 600, 'Biblioteca': 600, 'Sala dos professores': 600, 'Secretaria': 550,
  'Diretoria': 550, 'Coordenação': 550, 'Sala de informática': 800, 'Laboratório': 700, 'Auditório': 750,
  'Refeitório': 650, 'Sala multiuso': 650, 'Brinquedoteca': 600, 'Sala de recursos': 600, 'Enfermaria': 550
};
/** Potência típica (W) dos equipamentos de uso específico; somada à carga térmica. */
const POT_TUE_W_ = { 'Computador': 250, 'Projetor': 300, 'Lousa digital': 200, 'TV': 150, 'Impressora': 300, 'Geladeira': 150, 'Micro-ondas': 1200, 'Ventilador': 0 };
/** Ganho solar pelo vidro (BTU/h por m² de vidro) conforme a fachada — valores de referência para o hemisfério sul. */
const GANHO_SOLAR_VIDRO_ = { Norte: 520, Leste: 600, Oeste: 700, Sul: 160, Interna: 0 };
/** Redução do ganho solar pela proteção da abertura. */
const PROTECAO_SOLAR_ = { 'Nenhuma': 1, 'Cortina ou persiana': 0.7, 'Película': 0.7, 'Brise ou marquise': 0.5 };
const ABERTURA_VIDRO_ = { 'Janela': 1, 'Porta de vidro': 1, 'Porta': 0 };

/** Fatores por tipo, com os ajustes opcionais da aba Config (FATORES_BTU_M2, em JSON). */
function fatoresBtu_(cfg) {
  const f = Object.assign({}, FATOR_BTU_M2_);
  try { if (cfg && cfg.FATORES_BTU_M2) Object.assign(f, JSON.parse(cfg.FATORES_BTU_M2)); } catch (e) { console.warn('FATORES_BTU_M2 inválido'); }
  return f;
}

/** Aberturas do ambiente (formato novo) ou a janela única do formato antigo. */
function aberturas_(a) {
  if (a.aberturas && a.aberturas.length) return a.aberturas;
  const j = a.jan || {};
  if (!j.qtd) return [];
  return [{ tipo: 'Janela', larg: j.larg || '', alt: j.alt, qtd: j.qtd, fachada: (a.fachadas || [])[0] || '', protecao: 'Nenhuma' }];
}

/** Ganho solar das aberturas envidraçadas (BTU/h), ou null se não houver medidas. */
function ganhoSolar_(a) {
  let g = 0, medidas = false;
  aberturas_(a).forEach(x => {
    const area = dec_(x.larg) * dec_(x.alt) * (Number(x.qtd) || 1);
    if (!area || !ABERTURA_VIDRO_[x.tipo || 'Janela']) return;
    medidas = true;
    g += area * (GANHO_SOLAR_VIDRO_[x.fachada] || 0) * (PROTECAO_SOLAR_[x.protecao] || 1);
  });
  return medidas ? g : null;
}

/** Potência (kVA) de uma corrente conforme o fornecimento: mono (F-N), bi (F-F) ou trifásico. */
function kvaFornecimento_(en, corrente) {
  const vll = /380/.test(en.tensao) ? 380 : 220;
  const vfn = vll / Math.sqrt(3);
  const f = en.fases || 'Trifásico';
  const v = f === 'Monofásico' ? vfn : f === 'Bifásico' ? vll : Math.sqrt(3) * vll;
  return v * dec_(corrente) / 1000;
}

const CAPACIDADES_BTU_ = [9000, 12000, 18000, 24000, 30000, 36000, 48000, 58000, 60000];

function capacidadeComercial_(btu) {
  for (let i = 0; i < CAPACIDADES_BTU_.length; i++) if (btu <= CAPACIDADES_BTU_[i]) return CAPACIDADES_BTU_[i];
  return Math.ceil(btu / 12000) * 12000;
}

function nomePav_(p) { return Number(p) === 0 ? 'Térreo' : p + 'º pav.'; }
function letraBloco_(b) { return String.fromCharCode(65 + Number(b || 0)); }
/** Nome do bloco/setor: o nome dado em campo ou "Bloco A, B…". */
function nomeBloco_(blocos, b) { const x = (blocos || [])[Number(b) || 0] || {}; return x.nome || 'Bloco ' + letraBloco_(b); }
function cvParaW_(pot, un) { const n = dec_(pot); return un === 'CV' ? n * 735.5 : n; }

function preDimensionamento_(et, cfg) {
  const estr = et.estrutura || {};
  const blocos = estr.blocos || [];
  const itens = ((et.ambientes || {}).itens || []);
  const fatores = fatoresBtu_(cfg);
  const linhas = [];
  let area = 0, areaClim = 0, btu = 0, ambientes = 0, externos = 0, pontosTug = 0, pontosIlum = 0;
  itens.forEach(a => {
    const qtd = Math.max(1, Number(a.qtd) || 1);
    const areaUn = dec_(a.c) * dec_(a.l);
    if (a.externo) { externos += qtd; } else { ambientes += qtd; }
    area += areaUn * qtd;
    pontosTug += (Number(a.tug) || 0) * qtd;
    pontosIlum += (a.lum || []).reduce((s, l) => s + (Number(l.qtd) || 0), 0) * qtd;
    const tipo = a.tipo === 'Outro' ? (a.tipoOutro || 'Outro') : a.tipo;
    const fator = a.externo ? 0 : fatores[tipo];
    if (!fator || !areaUn) return;
    const bl = blocos[Number(a.bloco) || 0] || {};
    const ultimo = Number(a.pav) === (Number(bl.pav) || 1) - 1;
    const fach = a.fachadas || [];
    // Com aberturas medidas, usa o ganho solar do vidro; sem elas, a regra simples (+10% para Norte/Oeste).
    const solar = ganhoSolar_(a);
    const sol = solar === null && (fach.indexOf('Norte') >= 0 || fach.indexOf('Oeste') >= 0);
    const mult = 1 + (sol ? 0.1 : 0) + (ultimo ? 0.1 : 0);
    const equipW = (a.tue || []).reduce((s, t) => s + (Number(t.qtd) || 0) * (POT_TUE_W_[t.nome] !== undefined ? POT_TUE_W_[t.nome] : 150), 0);
    const btuUn = areaUn * fator * mult + (solar || 0) + equipW * 3.412;
    const cap = capacidadeComercial_(btuUn);
    areaClim += areaUn * qtd;
    btu += cap * qtd;
    linhas.push({
      local: nomeBloco_(blocos, a.bloco) + ' · ' + nomePav_(a.pav), nome: a.nome || tipo, tipo: tipo, qtd: qtd,
      areaUn: areaUn, fator: fator, ajustes: [sol ? 'insolação N/O +10%' : '', solar ? 'vidro +' + fmtNum_(solar) + ' BTU/h' : '', ultimo ? 'último pav. +10%' : ''].filter(String).join(', '),
      btuUn: Math.round(btuUn), cap: cap, tr: cap / 12000 * qtd
    });
  });
  const tr = btu / 12000;
  const kwPorTr = dec_(cfg.KW_POR_TR) || 1.05;
  const kwAc = tr * kwPorTr;

  // Capacidade da entrada existente (premissa FP 0,92).
  const en = et.entrada || {};
  let kwEntrada = 0, kwMedido = 0, vll = 0;
  if (en.padrao === 'MT') {
    kwEntrada = (Number((en.trafo || {}).n) || 1) * dec_((en.trafo || {}).kva) * 0.92;
  } else {
    vll = /380/.test(en.tensao) ? 380 : 220;
    kwEntrada = kvaFornecimento_(en, (en.cx2 || {}).disjuntor) * 0.92;
    const m = en.med || {};
    const imax = Math.max(dec_(m.ir), dec_(m.is), dec_(m.it));
    kwMedido = kvaFornecimento_(en, imax) * 0.92;
  }
  const folga = kwEntrada ? kwEntrada - kwMedido : 0;
  return {
    linhas: linhas, area: area, areaClim: areaClim, btu: btu, tr: tr, kwAc: kwAc, kwPorTr: kwPorTr,
    ambientes: ambientes, externos: externos, pontosTug: pontosTug, pontosIlum: pontosIlum,
    kwEntrada: kwEntrada, kwMedido: kwMedido, folga: folga, vll: vll,
    entradaSuporta: kwEntrada ? folga >= kwAc : null
  };
}

/* ───────────────────────── Montagem dos dados ───────────────────────── */

function dadosRelatorio_(vistoriaId) {
  const cfg = getConfig_();
  const v = Db.find('Vistorias', vistoriaId);
  if (!v) throw new Error('Vistoria não encontrada.');
  const escola = Db.find('Escolas', v.escolaId) || {};
  const equipe = Db.find('Equipes', v.equipeId) || {};
  const usuario = Db.find('Usuarios', v.usuarioId) || {};
  const dre = Db.find('DREs', escola.dre) || {};
  const etRaw = lerEtapas_(v.id);
  const et = {};
  Object.keys(etRaw).forEach(k => { et[k] = etRaw[k].dados || {}; });
  const d = Object.assign({}, escola, et.dados || {});
  const rev = et.revisao || {};
  const fotos = Db.where('Fotos', f => f.vistoriaId === v.id);
  const pend = Db.where('Pendencias', p => p.vistoriaId === v.id && p.status === 'aberta');
  const calc = preDimensionamento_(et, cfg);

  let prioridades = String(rev.prioridades || '').split('\n').map(s => s.replace(/^[-•\s]+/, '').trim()).filter(String);
  if (!prioridades.length) {
    const nomes = calc.linhas.map(l => l.nome).filter((x, i, a) => a.indexOf(x) === i).slice(0, 8);
    prioridades = [
      'Adequação do sistema de ar-condicionado e ventilação dos ambientes' + (nomes.length ? ': ' + nomes.join(', ') + '.' : '.'),
      'Adequação das instalações elétricas dos ambientes acima, com revisão do quadro e circuitos.',
      'Pintura dos ambientes corrigidos.',
      'Serviços complementares nos ambientes corrigidos.'
    ];
  }
  const dur = v.checkout && v.checkin ? Math.round((new Date(v.checkout) - new Date(v.checkin)) / 60000) : 0;
  return {
    cfg: cfg, v: v, escola: escola, d: d, equipe: equipe, usuario: usuario, dre: dre, et: et, rev: rev,
    fotos: fotos, pend: pend, calc: calc, prioridades: prioridades,
    data: fmtData_(v.checkout || v.checkin || agora_(), 'dd/MM/yy'),
    dataLonga: fmtData_(v.checkout || v.checkin || agora_(), 'dd/MM/yyyy'),
    horario: fmtData_(v.checkin, 'HH:mm') + (v.checkout ? ' – ' + fmtData_(v.checkout, 'HH:mm') : ''),
    duracao: dur ? Math.floor(dur / 60) + 'h' + ('0' + dur % 60).slice(-2) : '',
    geradoEm: Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm'),
    assinado: !!(rev.assResp && rev.assEmpresa),
    fmt: fmtNum_, letra: letraBloco_, pav: nomePav_, cvParaW: cvParaW_,
    bloco: b => nomeBloco_((et.estrutura || {}).blocos, b)
  };
}

function fmtNum_(n, casas) {
  const c = casas === undefined ? 0 : casas;
  const s = (Number(n) || 0).toFixed(c).split('.');
  s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return s.join(',');
}

function htmlRelatorio_(R, tipo, modo) {
  const t = HtmlService.createTemplateFromFile(tipo === 'completo' ? 'RelatorioCompleto' : 'RelatorioVistoria');
  t.R = R;
  t.H = HREL_;
  t.modo = modo || 'pdf';
  if (tipo === 'completo') {
    const comFoto = R.fotos.filter(f => f.fileId).slice(0, 36);
    t.thumbs = modo === 'tela' && comFoto.length > 12 ? miniaturas_(comFoto.slice(0, 12).map(f => f.fileId), 400)
      : miniaturas_(comFoto.map(f => f.fileId), 400);
    t.fotosRel = comFoto;
  }
  return t.evaluate().getContent();
}

/* ───────────────────────── Ações ───────────────────────── */

function acaoRelatorio_(p, u) {
  const v = exigirVistoria_(p.vistoriaId, u);
  const R = dadosRelatorio_(v.id);
  const html = htmlRelatorio_(R, p.tipo, 'tela');
  return {
    html: html, assinado: R.assinado, codigo: R.v.codigo, geradoEm: R.geradoEm,
    paginas: (html.match(/class="pg/g) || []).length || 1
  };
}

function acaoPdf_(p, u) {
  const v = exigirVistoria_(p.vistoriaId, u);
  const r = gerarPdf_(v.id, p.tipo);
  const arq = DriveApp.getFileById(r.fileId);
  r.base64 = p.semArquivo ? '' : Utilities.base64Encode(arq.getBlob().getBytes());
  return r;
}

/** Gera (ou regera) o PDF no Drive e guarda o id na vistoria. */
function gerarPdf_(vistoriaId, tipo) {
  const R = dadosRelatorio_(vistoriaId);
  const html = htmlRelatorio_(R, tipo, 'pdf');
  const nome = (tipo === 'completo' ? 'Relatorio_' : 'Relatorio_Vistoria_') + R.v.codigo + '.pdf';
  const blob = HtmlService.createHtmlOutput(html).getAs(MimeType.PDF).setName(nome);
  const pasta = pastaVistoria_(R.v, R.escola);
  const campo = tipo === 'completo' ? 'relCompletoId' : 'relVistoriaId';
  if (R.v[campo]) { try { DriveApp.getFileById(R.v[campo]).setTrashed(true); } catch (e) { /* já removido */ } }
  const arq = pasta.createFile(blob);
  arq.setDescription((tipo === 'completo' ? 'Relatório técnico completo' : 'Relatório de vistoria') + ' · ' + R.escola.nome);
  const upd = { id: R.v.id };
  upd[campo] = arq.getId();
  Db.upsert('Vistorias', upd);
  const bytes = blob.getBytes().length;
  return {
    fileId: arq.getId(), url: arq.getUrl(), nome: nome, bytes: bytes,
    tamanho: fmtNum_(bytes / 1048576, 1) + ' MB',
    paginas: (html.match(/class="pg/g) || []).length || 1,
    assinado: R.assinado, geradoEm: R.geradoEm
  };
}

function acaoEnviarCopia_(p, u) {
  const v = exigirVistoria_(p.vistoriaId, u);
  const cfg = getConfig_();
  const para = String(p.para || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(para)) throw new Error('Informe um e-mail válido para a unidade.');
  const R = dadosRelatorio_(v.id);
  let arqV = null;
  try { if (R.v.relVistoriaId) arqV = DriveApp.getFileById(R.v.relVistoriaId); } catch (e) { arqV = null; }
  if (!arqV || p.regerar) arqV = DriveApp.getFileById(gerarPdf_(v.id, 'vistoria').fileId);
  const anexos = [arqV.getBlob()];
  if (p.completo) {
    let arqC = null;
    try { if (R.v.relCompletoId) arqC = DriveApp.getFileById(R.v.relCompletoId); } catch (e) { arqC = null; }
    if (arqC) anexos.push(arqC.getBlob());
  }
  const corpo =
    '<div style="font-family:Arial,sans-serif;color:#0F1E36;max-width:560px">' +
    '<div style="background:#0F2140;color:#fff;padding:18px 22px;border-radius:12px 12px 0 0">' +
    '<div style="font-size:12px;opacity:.75">' + cfg.CONSORCIO + '</div>' +
    '<div style="font-size:20px;font-weight:bold">Relatório de vistoria</div></div>' +
    '<div style="border:1px solid #E3E8EF;border-top:0;padding:20px 22px;border-radius:0 0 12px 12px">' +
    '<p>Prezada(o) ' + (R.rev.respNome || 'responsável') + ',</p>' +
    '<p>Segue em anexo o relatório da vistoria realizada em <b>' + R.dataLonga + '</b> na <b>' + R.escola.nome + '</b> (' + R.v.codigo + '), ' +
    'anexo obrigatório ao memorial descritivo do contrato ' + cfg.CONTRATO + '.</p>' +
    '<p style="color:#5B6B82;font-size:13px">Equipe: ' + (R.equipe.nome || '') + ' · ' + (R.equipe.membros || '') + '<br>Horário: ' + R.horario + '</p>' +
    '<p style="color:#5B6B82;font-size:12px">Mensagem enviada pelo VistAR.</p></div></div>';
  const email = { to: para, name: 'VistAR · ' + cfg.CONSORCIO, subject: 'Relatório de vistoria · ' + R.escola.nome + ' · ' + R.data, htmlBody: corpo, attachments: anexos };
  if (cfg.EMAIL_COPIA_CONSORCIO) email.cc = cfg.EMAIL_COPIA_CONSORCIO;
  if (MailApp.getRemainingDailyQuota() < 1) throw new Error('A cota diária de e-mails do Google acabou. A cópia pode ser enviada amanhã pela tela do relatório.');
  MailApp.sendEmail(email);
  const em = agora_();
  Db.upsert('Vistorias', { id: v.id, copiaPara: para, copiaEnviadaEm: em });
  log_(u.id, 'copia', { vistoria: v.codigo, para: para });
  return { enviada: true, para: para, em: em, cc: cfg.EMAIL_COPIA_CONSORCIO || '' };
}

/* ───────────────────────── Resumo diário (gatilho 18h) ───────────────────────── */

function resumoDiario() {
  const cfg = getConfig_();
  if (!cfg.EMAIL_COORDENACAO) return;
  const hoje = hoje_();
  const vs = Db.where('Vistorias', v => String(v.checkin).slice(0, 10) === hoje || String(v.checkout).slice(0, 10) === hoje);
  if (!vs.length) return;
  const esc = {}; Db.all('Escolas').forEach(e => { esc[e.id] = e; });
  const eq = {}; Db.all('Equipes').forEach(e => { eq[e.id] = e; });
  const linhas = vs.map(v => {
    const r = parse_(v.resumo);
    const cor = v.status === 'finalizada' ? '#1E9E55' : v.status === 'cancelada' ? '#D93C3C' : '#E08A00';
    return '<tr><td style="padding:6px;border-bottom:1px solid #eee">' + (esc[v.escolaId] || {}).nome + '</td>' +
      '<td style="padding:6px;border-bottom:1px solid #eee">' + ((eq[v.equipeId] || {}).nome || '') + '</td>' +
      '<td style="padding:6px;border-bottom:1px solid #eee;color:' + cor + '">' + v.status.replace('_', ' ') + '</td>' +
      '<td style="padding:6px;border-bottom:1px solid #eee">' + (r.ambientes || 0) + ' amb · ' + (r.fotos || 0) + ' fotos · ' + (r.pendencias || 0) + ' pend.</td></tr>';
  }).join('');
  MailApp.sendEmail({
    to: cfg.EMAIL_COORDENACAO, name: 'VistAR',
    subject: '[VistAR] Resumo do dia ' + fmtData_(new Date().toISOString()),
    htmlBody: '<div style="font-family:Arial,sans-serif"><h2 style="color:#0F2140">Vistorias de hoje</h2>' +
      '<table style="border-collapse:collapse;font-size:13px"><tr style="background:#0F2140;color:#fff"><th style="padding:6px">Escola</th><th>Equipe</th><th>Status</th><th>Resumo</th></tr>' +
      linhas + '</table></div>'
  });
}

/* ───────────────────────── Helpers de HTML dos relatórios ───────────────────────── */

function esc_(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function val_(v, sufixo) {
  if (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) return '<span style="color:#9AA6B6">—</span>';
  if (Array.isArray(v)) return esc_(v.join(', '));
  if (v === true) return 'Sim';
  if (v === false) return 'Não';
  return esc_(v) + (sufixo ? ' ' + sufixo : '');
}

/** Tabela de pares rótulo/valor em 2 colunas de pares. */
function tabelaKV_(pares) {
  const p = pares.filter(x => x);
  let h = '<table class="kv">';
  for (let i = 0; i < p.length; i += 2) {
    h += '<tr><th>' + esc_(p[i][0]) + '</th><td>' + val_(p[i][1], p[i][2]) + '</td>';
    h += p[i + 1] ? '<th>' + esc_(p[i + 1][0]) + '</th><td>' + val_(p[i + 1][1], p[i + 1][2]) + '</td>' : '<th></th><td></td>';
    h += '</tr>';
  }
  return h + '</table>';
}

function tabelaConservacao_(cons, itens) {
  const cor = { Boa: '#1E9E55', Regular: '#E08A00', Ruim: '#D93C3C' };
  let h = '<table class="grid"><tr><th>Item</th><th>Estado</th></tr>';
  itens.forEach(it => {
    const v = (cons || {})[it[0]];
    h += '<tr><td>' + esc_(it[1]) + '</td><td style="color:' + (cor[v] || '#9AA6B6') + ';font-weight:bold">' + (v ? esc_(v) : '—') + '</td></tr>';
  });
  return h + '</table>';
}

function secaoCabo_(d) {
  const n = dec_(d);
  return n ? fmtNum_(Math.PI * Math.pow(n / 2, 2), 1) + ' mm²' : '';
}

const HREL_ = {
  esc: esc_, val: val_, kv: tabelaKV_, cons: tabelaConservacao_, secao: secaoCabo_,
  rotulo: function (e) { return rotuloEtapa_(e); },
  aberturas: function (a) {
    return aberturas_(a).map(x => (x.qtd || 1) + '× ' + (x.tipo || 'Janela') + (x.larg && x.alt ? ' ' + x.larg + '×' + x.alt + ' m' : '') + (x.fachada ? ' (' + x.fachada + ')' : '')).join(', ');
  }
};


/* ════════════════════ Supervisao.gs ════════════════════ */

/**
 * VistAR · Supervisão, painel do contrato, programação, pendências de retorno,
 * galeria de fotos, detalhe de escola/vistoria e gestão de usuários.
 */

const PERFIS_SUPERVISAO_ = ['supervisor', 'admin', 'coordenacao'];

function exigirSupervisor_(u) {
  if (PERFIS_SUPERVISAO_.indexOf(u.perfil) < 0) throw new Error('Disponível só para supervisão e coordenação.');
}
function ehSupervisor_(u) { return PERFIS_SUPERVISAO_.indexOf(u.perfil) >= 0; }

/** Escolas que o usuário enxerga (pelas DREs autorizadas). */
function escolasDoUsuario_(u) {
  const dres = lista_(u.dres);
  return Db.all('Escolas').filter(e => !dres.length || dres.indexOf(e.dre) >= 0);
}

function diaISO_(d) { return Utilities.formatDate(d, 'America/Sao_Paulo', 'yyyy-MM-dd'); }
function somaDias_(iso, n) { return diaISO_(new Date(new Date(iso + 'T12:00:00-03:00').getTime() + n * 864e5)); }

/* ───────────────────────── Situação de cada escola ───────────────────────── */

const SITUACAO_POR_MOTIVO_ = {
  'Recusa da direção': 'recusa', 'Escola fechada ou sem acesso': 'sem_acesso', 'Área interditada ou em obra': 'area_interditada',
  'Retorno solicitado pela unidade': 'retorno_solicitado', 'Não houve tempo para finalizar': 'nao_concluida',
  'Aguardando autorização da DRE': 'aguardando_autorizacao', 'Problema da equipe': 'nao_concluida'
};
function situacaoDoMotivo_(m) { return SITUACAO_POR_MOTIVO_[m] || 'outro'; }

/** Status de painel: concluida, andamento, agendada, retorno ou nao_iniciada. */
function statusEscolas_(escolas) {
  const vist = Db.all('Vistorias');
  const rot = Db.all('Roteiro');
  const out = {};
  escolas.forEach(e => {
    let st = 'nao_iniciada';
    if (rot.some(r => r.escolaId === e.id && r.status === 'agendada')) st = 'agendada';
    if (e.status === 'retorno' || rot.some(r => r.escolaId === e.id && r.status === 'retorno')) st = 'retorno';
    if (e.status === 'concluida') st = 'concluida';
    if (vist.some(v => v.escolaId === e.id && v.status === 'em_andamento')) st = 'andamento';
    out[e.id] = st;
  });
  return out;
}

/* ───────────────────────── Painel (Escolas / supervisão) ───────────────────────── */

function acaoPainel_(p, u) {
  const cfg = getConfig_();
  const hoje = hoje_();
  let escolas = escolasDoUsuario_(u);
  if (p.dre) escolas = escolas.filter(e => e.dre === p.dre);
  const ids = {};
  escolas.forEach(e => { ids[e.id] = true; });
  const st = statusEscolas_(escolas);
  const cont = { concluida: 0, andamento: 0, agendada: 0, retorno: 0, nao_iniciada: 0 };
  Object.keys(st).forEach(k => { cont[st[k]]++; });
  const total = escolas.length || 1;

  const vist = Db.where('Vistorias', v => ids[v.escolaId]);
  const fin = vist.filter(v => v.status === 'finalizada' && v.checkout);
  const diaFim = v => diaISO_(new Date(v.checkout));

  // Período
  const inicioContrato = cfg.META_INICIO || (fin.length ? fin.map(diaFim).sort()[0] : hoje);
  const dias = { hoje: 1, semana: 7, mes: 14 }[p.periodo || 'mes'] || Math.max(1, Math.round((new Date(hoje) - new Date(inicioContrato)) / 864e5) + 1);
  const ini = somaDias_(hoje, -(dias - 1));
  const iniAnt = somaDias_(ini, -dias);

  // Uma escola conta como concluída no dia da 1ª finalização.
  const concluidaEm = {};
  fin.forEach(v => { const d = diaFim(v); if (!concluidaEm[v.escolaId] || d < concluidaEm[v.escolaId]) concluidaEm[v.escolaId] = d; });
  const serie = [];
  for (let i = 0; i < dias; i++) {
    const d = somaDias_(ini, i);
    const n = Object.keys(concluidaEm).filter(k => concluidaEm[k] === d).length;
    const acum = Object.keys(concluidaEm).filter(k => concluidaEm[k] <= d).length;
    serie.push({ d: d, n: n, pct: acum / total });
  }
  // Meta linear entre início e data-alvo.
  const metaData = cfg.META_DATA || '';
  const metaPct = d => {
    if (!metaData) return null;
    const a = new Date(inicioContrato), b = new Date(metaData), x = new Date(d);
    return Math.max(0, Math.min(1, (x - a) / Math.max(1, b - a)));
  };
  serie.forEach(s => { s.meta = metaPct(s.d); });
  const ult14 = Object.keys(concluidaEm).filter(k => concluidaEm[k] > somaDias_(hoje, -14)).length;
  const ritmo = ult14 / 14;
  const faltam = total - cont.concluida;
  const previsao = ritmo > 0 ? somaDias_(hoje, Math.ceil(faltam / ritmo)) : '';
  const pctHoje = cont.concluida / total;
  const metaHoje = metaPct(hoje);

  const noPer = (v, a, b) => { const d = diaFim(v); return d >= a && d <= b; };
  const finPer = fin.filter(v => noPer(v, ini, hoje));
  const finAnt = fin.filter(v => noPer(v, iniAnt, somaDias_(ini, -1)));
  const soma = (lista, k) => lista.reduce((s, v) => s + (Number(parse_(v.resumo)[k]) || 0), 0);
  const varia = (a, b) => b ? Math.round((a - b) / b * 100) : null;

  const porDre = {};
  escolas.forEach(e => { const x = porDre[e.dre] = porDre[e.dre] || { dre: e.dre, total: 0, concluidas: 0 }; x.total++; if (st[e.id] === 'concluida') x.concluidas++; });
  const equipes = Db.all('Equipes');
  const porEquipe = equipes.map(eq => ({ id: eq.id, nome: eq.nome, n: finPer.filter(v => v.equipeId === eq.id).length }));
  const nTot = porEquipe.reduce((s, x) => s + x.n, 0) || 1;
  porEquipe.forEach(x => { x.pct = x.n / nTot; });

  return {
    periodo: p.periodo || 'mes', dre: p.dre || '', dres: lista_(u.dres).length ? lista_(u.dres) : Db.all('DREs').map(d => d.id),
    total: escolas.length, cont: cont, pct: pctHoje, ritmo: ritmo, previsao: previsao, metaData: metaData,
    metaHoje: metaHoje, deltaMeta: metaHoje === null ? null : pctHoje - metaHoje,
    serie: serie,
    kpis: {
      ambientes: soma(finPer, 'ambientes'), ambientesVar: varia(soma(finPer, 'ambientes'), soma(finAnt, 'ambientes')),
      fotos: soma(finPer, 'fotos'), fotosVar: varia(soma(finPer, 'fotos'), soma(finAnt, 'fotos')),
      assinados: finPer.filter(v => v.assinadoEm).length, assinadosPct: finPer.length ? finPer.filter(v => v.assinadoEm).length / finPer.length : 0
    },
    porDre: Object.keys(porDre).map(k => porDre[k]).sort((a, b) => b.concluidas / b.total - a.concluidas / a.total),
    porEquipe: porEquipe.sort((a, b) => b.n - a.n),
    mapa: escolas.filter(e => e.lat && e.lng).map(e => ({ id: e.id, nome: e.nome, lat: Number(e.lat), lng: Number(e.lng), st: st[e.id] }))
  };
}

/* ───────────────────────── Equipes ao vivo ───────────────────────── */

function acaoPing_(p, u) {
  const pos = p.lat && p.lng ? { lat: p.lat, lng: p.lng } : {};
  Db.upsert('Usuarios', Object.assign({ id: u.id, vistoEm: agora_(), fila: String(p.fila || 0) }, pos));
  if (u.equipeId) Db.upsert('Equipes', Object.assign({ id: u.equipeId, vistoEm: agora_(), fila: String(p.fila || 0) }, pos));
  return { ok: true };
}

function acaoEquipes_(p, u) {
  exigirSupervisor_(u);
  const hoje = hoje_();
  const esc = {};
  Db.all('Escolas').forEach(e => { esc[e.id] = e; });
  const vist = Db.all('Vistorias');
  const fotos = Db.all('Fotos');
  const rot = Db.where('Roteiro', r => r.data === hoje);
  const canc = Db.where('Cancelamentos', c => String(c.criadoEm).slice(0, 10) === hoje);
  const usuarios = Db.all('Usuarios');
  const nomes = {};
  usuarios.forEach(x => { nomes[x.id] = x.nome; });
  const equipes = Db.all('Equipes').map(eq => {
    const abertas = vist.filter(v => v.equipeId === eq.id && v.status === 'em_andamento');
    const r = rot.filter(x => x.equipeId === eq.id);
    const resumo = v => ({ id: v.id, codigo: v.codigo, escola: (esc[v.escolaId] || {}).nome, escolaId: v.escolaId, checkin: v.checkin,
      fotos: fotos.filter(f => f.vistoriaId === v.id).length, participantes: participantes_(v).map(id => nomes[id] || id) });
    const membros = usuarios.filter(x => x.equipeId === eq.id && x.ativo !== 'nao' && (x.perfil || 'tecnico') === 'tecnico');
    // Fila e último sinal: pior caso entre os membros (cada técnico tem a sua fila no celular).
    const visto = membros.map(x => x.vistoEm).filter(String).sort().pop() || eq.vistoEm;
    const fila = membros.reduce((s, x) => s + (Number(x.fila) || 0), 0) || Number(eq.fila) || 0;
    return {
      id: eq.id, nome: eq.nome, membros: lista_(eq.membros), status: abertas.length ? 'em_campo' : (eq.status || 'disponivel'), statusDesde: eq.statusDesde,
      lat: eq.lat, lng: eq.lng, vistoEm: visto, fila: fila,
      pessoas: membros.map(x => ({ nome: x.nome, lat: x.lat, lng: x.lng, vistoEm: x.vistoEm, fila: Number(x.fila) || 0,
        escola: x.vistoriaAtual ? (esc[(vist.find(v => v.id === x.vistoriaAtual) || {}).escolaId] || {}).nome || '' : '' })),
      atuais: abertas.map(resumo),
      atual: abertas[0] ? resumo(abertas[0]) : null,
      destino: eq.destinoEscolaId ? (esc[eq.destinoEscolaId] || {}).nome : '', eta: eq.destinoEta,
      hoje: { total: r.length, concluidas: r.filter(x => x.status === 'concluida').length }
    };
  });
  const alertas = [];
  equipes.forEach(eq => {
    if (eq.atual && eq.vistoEm && Date.now() - new Date(eq.vistoEm) > 3600e3) alertas.push({ tipo: 'sync', texto: eq.nome + ' sem sincronizar há mais de 1 h', equipeId: eq.id });
    if (eq.fila > 10) alertas.push({ tipo: 'fila', texto: eq.nome + ' com ' + eq.fila + ' itens na fila de envio', equipeId: eq.id });
    eq.atuais.forEach(a => { if (Date.now() - new Date(a.checkin) > 5 * 3600e3) alertas.push({ tipo: 'tempo', texto: eq.nome + ' em campo há mais de 5 h em ' + a.escola, equipeId: eq.id }); });
  });
  canc.forEach(c => alertas.push({ tipo: 'cancelada', texto: 'Cancelada hoje: ' + (esc[c.escolaId] || {}).nome + ' · ' + c.motivo, escolaId: c.escolaId }));
  const aValidar = vist.filter(v => v.status === 'finalizada' && (!v.validacao || v.validacao === 'pendente')).length;
  return { equipes: equipes, alertas: alertas, aValidar: aValidar };
}

/* ───────────────────────── Validação ───────────────────────── */

function acaoValidacoes_(p, u) {
  exigirSupervisor_(u);
  const esc = {}; Db.all('Escolas').forEach(e => { esc[e.id] = e; });
  const eqs = {}; Db.all('Equipes').forEach(e => { eqs[e.id] = e; });
  const filtro = p.filtro || 'pendente';
  return Db.where('Vistorias', v => v.status === 'finalizada' && (filtro === 'todas' || (filtro === 'pendente' ? (!v.validacao || v.validacao === 'pendente') : v.validacao === filtro)))
    .sort((a, b) => a.checkout < b.checkout ? 1 : -1).slice(0, 80)
    .map(v => ({ id: v.id, codigo: v.codigo, escola: (esc[v.escolaId] || {}).nome, dre: (esc[v.escolaId] || {}).dre, equipe: (eqs[v.equipeId] || {}).nome,
      checkout: v.checkout, assinado: !!v.assinadoEm, resumo: parse_(v.resumo), validacao: v.validacao || 'pendente', nota: v.validacaoNota }));
}

function acaoValidar_(p, u) {
  exigirSupervisor_(u);
  const v = exigirVistoria_(p.vistoriaId, u);
  if (!v || v.status !== 'finalizada') throw new Error('Vistoria não encontrada ou não finalizada.');
  if (['aprovada', 'correcao'].indexOf(p.decisao) < 0) throw new Error('Decisão inválida.');
  if (p.decisao === 'correcao' && !p.nota) throw new Error('Descreva o que precisa ser corrigido.');
  Db.upsert('Vistorias', { id: v.id, validacao: p.decisao, validadoPor: u.nome, validadoEm: agora_(), validacaoNota: p.nota || '' });
  if (p.decisao === 'correcao') {
    Db.upsert('Pendencias', { id: 'pq-' + v.id + '-' + uid_().slice(0, 4), vistoriaId: v.id, escolaId: v.escolaId, etapa: 'revisao',
      descricao: 'Correção pedida pela supervisão: ' + p.nota, status: 'aberta', criadoEm: agora_() });
    marcarRetorno_(v.escolaId, v.equipeId, 'Correção: ' + p.nota, u);
  }
  log_(u.id, 'validar', { vistoria: v.codigo, decisao: p.decisao });
  return { ok: true };
}

function marcarRetorno_(escolaId, equipeId, nota, u) {
  const ex = Db.where('Roteiro', r => r.escolaId === escolaId && r.status === 'retorno')[0];
  Db.upsert('Roteiro', Object.assign(ex || { id: 'r-' + uid_(), data: '', hora: '', ordem: 0, criadoPor: u.id },
    { equipeId: equipeId || (ex && ex.equipeId) || '', escolaId: escolaId, status: 'retorno', tipo: 'retorno', nota: nota }));
  Db.upsert('Escolas', { id: escolaId, status: 'retorno', nota: nota, atualizadoEm: agora_() });
}

/* ───────────────────────── Detalhe da escola ───────────────────────── */

function acaoEscola_(p, u) {
  const e = exigirEscola_(p.escolaId, u);
  const eqs = {}; Db.all('Equipes').forEach(x => { eqs[x.id] = x; });
  const vist = Db.where('Vistorias', v => v.escolaId === e.id && v.status !== 'mesclada').sort((a, b) => a.checkin < b.checkin ? 1 : -1);
  const ultFin = vist.find(v => v.status === 'finalizada');
  let resumo = null, contato = null;
  if (ultFin) {
    const et = lerEtapas_(ultFin.id);
    const R = { et: {} };
    Object.keys(et).forEach(k => { R.et[k] = et[k].dados || {}; });
    const c = preDimensionamento_(R.et, getConfig_());
    resumo = { blocos: Number((R.et.estrutura || {}).nBlocos) || 1, ambientes: c.ambientes + c.externos, m2clim: Math.round(c.areaClim) };
    const rv = R.et.revisao || {};
    if (rv.respNome) contato = { nome: rv.respNome, cargo: rv.respCargo, rf: rv.respRF, tel: rv.respTel, email: rv.respEmail };
  }
  if (!contato && (e.diretor || e.telefone || e.email)) contato = { nome: e.diretor, cargo: e.diretor ? 'Diretor(a)' : '', tel: e.telefone, email: e.email };
  const fotos = Db.where('Fotos', f => f.escolaId === e.id).sort((a, b) => a.criadoEm < b.criadoEm ? 1 : -1);
  const retorno = Db.where('Roteiro', r => r.escolaId === e.id && r.status === 'retorno')[0];
  const pend = Db.where('Pendencias', x => x.escolaId === e.id && x.status === 'aberta');
  const doc = id => { try { const f = DriveApp.getFileById(id); return { url: f.getUrl(), bytes: f.getSize() }; } catch (x) { return null; } };
  return {
    escola: e,
    status: statusEscolas_([e])[e.id],
    contato: contato, resumo: resumo,
    historico: vist.map(v => {
      const c = v.status === 'cancelada' ? Db.find('Cancelamentos', v.id) : null;
      const r = parse_(v.resumo);
      return { id: v.id, codigo: v.codigo, status: v.status, checkin: v.checkin, checkout: v.checkout, equipe: (eqs[v.equipeId] || {}).nome,
        fotos: r.fotos, assinado: !!v.assinadoEm, motivo: c ? c.motivo : '', validacao: v.validacao };
    }),
    retorno: retorno ? { data: retorno.data, hora: retorno.hora, nota: retorno.nota } : null,
    pendencias: pend,
    documentos: ultFin ? { vistoriaId: ultFin.id, vistoria: ultFin.relVistoriaId ? doc(ultFin.relVistoriaId) : null, completo: ultFin.relCompletoId ? doc(ultFin.relCompletoId) : null,
      assinadoEm: ultFin.assinadoEm } : null,
    fotos: fotos.slice(0, 8).map(f => ({ id: f.id, fileId: f.fileId, legenda: f.legenda, etapa: f.etapa })), totalFotos: fotos.length,
    cfg: { contrato: getConfig_().CONTRATO, lote: getConfig_().LOTE, consorcio: getConfig_().CONSORCIO },
    equipe: ultFin ? eqs[ultFin.equipeId] || null : null
  };
}

/* ───────────────────────── Detalhe da vistoria (somente leitura) ───────────────────────── */

function potenciaLuminaria_(nome) { const m = String(nome || '').match(/(\d+[.,]?\d*)\s*W/i); return m ? dec_(m[1]) : 20; }

function acaoVistoriaDetalhe_(p, u) {
  const v = exigirVistoria_(p.vistoriaId, u);
  const R = dadosRelatorio_(v.id);
  const et = R.et, en = et.entrada || {};
  // Carga instalada (estimativa): TUG 100 W, luminárias pela potência do nome, TUE típicos, equipamentos.
  let w = 0;
  ((et.ambientes || {}).itens || []).forEach(a => {
    const q = Number(a.qtd) || 1;
    w += q * ((Number(a.tug) || 0) * 100 +
      (a.lum || []).reduce((s, l) => s + (Number(l.qtd) || 0) * (Number(l.lamp) || 1) * potenciaLuminaria_(l.nome), 0) +
      (a.tue || []).reduce((s, t) => s + (Number(t.qtd) || 0) * (POT_TUE_W_[t.nome] !== undefined ? POT_TUE_W_[t.nome] || 60 : 150), 0));
  });
  ((et.equipamentos || {}).itens || []).forEach(x => { if (!x.desc) w += cvParaW_(x.pot, x.un) * (Number(x.qtd) || 1); });
  const m = en.med || {};
  const imax = Math.max(dec_(m.ir), dec_(m.is), dec_(m.it));
  const enDem = en.padrao === 'MT' ? { tensao: '380 V', fases: 'Trifásico' } : en;
  const demanda = imax ? kvaFornecimento_(enDem, imax) : null;
  const padrao = en.padrao === 'MT' ? (Number((en.trafo || {}).n) || 1) * dec_((en.trafo || {}).kva) : (dec_((en.cx2 || {}).disjuntor) ? kvaFornecimento_(en, en.cx2.disjuntor) : null);
  const prevista = (demanda || 0) + R.calc.kwAc / 0.92;
  const d = R.d, es = et.estrutura || {}, el = et.eletrica || {};
  const qd = (el.blocos || []).reduce((s, b) => s + (Number(b.quadros) || 0), 0);
  const vagas = (el.blocos || []).reduce((s, b) => s + (Number(b.vagas) || 0), 0);
  const fotos = R.fotos;
  const porEt = k => fotos.filter(f => f.etapa === k).length;
  const it = (et.ambientes || {}).itens || [];
  const clim = R.calc.linhas.reduce((s, l) => s + l.qtd, 0);
  const etapas = [
    { k: 'dados', t: 'Dados da escola', s: 'Identificação, endereço, ' + porEt('dados') + ' fotos' },
    { k: 'entrada', t: 'Entrada de energia', s: en.padrao === 'MT' ? 'MT · ' + ((en.trafo || {}).kva || '?') + ' kVA' : 'BT ' + String(en.tipoEntrada || '').toLowerCase() + ' · 2 caixas' + (en.resist ? ' · aterramento ' + en.resist + ' Ω' : '') },
    { k: 'estrutura', t: 'Estrutura', s: (Number(es.nBlocos) || 1) + ' bloco(s)' + ((es.vrfLocal || []).length ? ' · condensadoras: ' + es.vrfLocal.join(', ').toLowerCase() : '') },
    { k: 'eletrica', t: 'Elétrica', s: qd + ' quadros · ' + vagas + ' vagas livres' },
    { k: 'ambientes', t: 'Ambientes', s: clim + ' climatizáveis · ' + (R.calc.ambientes - clim) + ' de apoio · ' + R.calc.externos + ' externas' },
    { k: 'equipamentos', t: 'Equipamentos com carga', s: ((et.equipamentos || {}).itens || []).length + ' itens · ' + ((et.equipamentos || {}).itens || []).filter(x => x.desc).length + ' inacessível' }
  ];
  etapas.forEach(e => { e.pend = R.pend.filter(x => x.etapa === e.k).length; });
  const eq = R.equipe;
  return {
    id: v.id, codigo: v.codigo, status: v.status, escola: { id: R.escola.id, nome: d.nome, dre: d.dre }, data: v.checkin,
    checkin: v.checkin, checkout: v.checkout, duracao: R.duracao, equipe: eq.nome, membros: lista_(eq.membros), respTecnico: R.cfg.RESPONSAVEL_TECNICO,
    resultado: { instalada: w / 1000, demanda: demanda, prevista: prevista, padrao: padrao, pct: padrao ? prevista / padrao : null, tr: R.calc.tr, disjuntor: (en.cx2 || {}).disjuntor },
    etapas: etapas,
    fotos: fotos.slice(0, 4).map(f => ({ id: f.id, fileId: f.fileId, legenda: f.legenda })), totalFotos: fotos.length,
    pendencias: R.pend.map(x => ({ etapa: x.etapa, descricao: x.descricao })),
    assinaturas: [
      { nome: R.cfg.RESPONSAVEL_TECNICO + ' · ' + R.cfg.RESPONSAVEL_TECNICO_CARGO, em: R.rev.assEmpresaEm || v.assinadoEm, ok: !!R.rev.assEmpresa },
      { nome: (R.rev.respNome || 'Responsável') + (R.rev.respCargo ? ' · ' + R.rev.respCargo : ''), em: R.rev.assRespEm || v.assinadoEm, ok: !!R.rev.assResp }
    ],
    copia: v.copiaEnviadaEm ? { para: v.copiaPara, em: v.copiaEnviadaEm } : null, respEmail: R.rev.respEmail || d.email,
    historico: historico_(v.historico).length ? historico_(v.historico) : [{ v: Number(v.versao) || 1, em: v.checkout, nota: 'gerada' }],
    validacao: { status: v.validacao || 'pendente', por: v.validadoPor, em: v.validadoEm, nota: v.validacaoNota },
    podeValidar: ehSupervisor_(u)
  };
}

function acaoReabrir_(p, u) {
  const v = exigirVistoria_(p.vistoriaId, u);
  marcarRetorno_(v.escolaId, v.equipeId, p.motivo || 'Reaberta para retorno', u);
  Db.upsert('Pendencias', { id: 'pr-' + v.id + '-' + uid_().slice(0, 4), vistoriaId: v.id, escolaId: v.escolaId, etapa: 'revisao',
    descricao: 'Reaberta para retorno' + (p.motivo ? ': ' + p.motivo : ''), status: 'aberta', criadoEm: agora_() });
  log_(u.id, 'reabrir', { vistoria: v.codigo });
  return { ok: true };
}

/* ───────────────────────── Pendências de retorno ───────────────────────── */

const LIMITE_ETAPA_ = { dados: 6, entrada: 8, estrutura: 6, eletrica: 5 };
function contarPreenchidos_(o) {
  if (o === null || o === undefined || o === '' || o === false) return 0;
  if (Array.isArray(o)) return o.reduce((s, x) => s + contarPreenchidos_(x), 0) || 0;
  if (typeof o === 'object') return Object.keys(o).reduce((s, k) => s + contarPreenchidos_(o[k]), 0);
  return 1;
}
function progressoEtapas_(vistoriaId) {
  const et = vistoriaId ? lerEtapas_(vistoriaId) : {};
  return ['dados', 'entrada', 'estrutura', 'eletrica', 'ambientes'].map(k => {
    const d = (et[k] || {}).dados;
    if (!d) return 'vazio';
    if (k === 'ambientes') { const n = (d.itens || []).length; return n >= 3 ? 'ok' : n ? 'parcial' : 'vazio'; }
    const n = contarPreenchidos_(d);
    return n >= LIMITE_ETAPA_[k] ? 'ok' : n > 1 ? 'parcial' : 'vazio';
  });
}

function acaoPendenciasPainel_(p, u) {
  const hoje = hoje_();
  const escolas = escolasDoUsuario_(u);
  const eqs = {}; Db.all('Equipes').forEach(x => { eqs[x.id] = x; });
  const rot = Db.where('Roteiro', r => r.status === 'retorno');
  const canc = Db.all('Cancelamentos').sort((a, b) => a.criadoEm < b.criadoEm ? 1 : -1);
  const vist = Db.where('Vistorias', v => v.status !== 'mesclada').sort((a, b) => a.checkin < b.checkin ? 1 : -1);
  const pend = Db.where('Pendencias', x => x.status === 'aberta');
  const itens = [];
  escolas.forEach(e => {
    const r = rot.find(x => x.escolaId === e.id);
    const c = canc.find(x => x.escolaId === e.id);
    const ps = pend.filter(x => x.escolaId === e.id);
    if (!r && e.status !== 'retorno' && !ps.length) return;
    const ult = vist.find(v => v.escolaId === e.id);
    const situacao = c && (!ult || !ult.checkout || c.criadoEm >= ult.checkout || c.vistoriaId === ult.id) ? (c.situacao || situacaoDoMotivo_(c.motivo))
      : ps.length ? 'pendencias' : 'retorno_solicitado';
    itens.push({
      escolaId: e.id, escola: e.nome, dre: e.dre, equipe: (eqs[(r && r.equipeId) || (ult && ult.equipeId)] || {}).nome || '',
      situacao: situacao, motivo: c ? c.motivo : '', descricao: c ? c.descricao : (r && r.nota) || ps.map(x => x.descricao).join('; '),
      quem: c ? c.quemRecusou : '', temRegistro: !!(c && (c.fotoId || c.descricao)), cobradoEm: c ? c.cobradoEm : '',
      registroEm: c ? c.criadoEm : '', pendencias: ps.map(x => ({ id: x.id, descricao: x.descricao, etapa: x.etapa })),
      etapas: progressoEtapas_(ult && ult.id), ultimaVistoriaId: ult ? ult.id : '',
      retorno: r && r.data ? { data: r.data, hora: r.hora, confirmado: r.confirmado === 'sim', nota: r.nota, equipe: (eqs[r.equipeId] || {}).nome } : null
    });
  });
  const decisao = ['recusa', 'aguardando_autorizacao'];
  return {
    itens: itens,
    kpis: {
      pendentes: itens.length, total: escolas.length,
      comRetorno: itens.filter(i => i.retorno && i.retorno.data >= hoje).length,
      proximo: itens.filter(i => i.retorno && i.retorno.data >= hoje).map(i => i.retorno.data).sort()[0] || '',
      reagendar: itens.filter(i => (!i.retorno || i.retorno.data < hoje) && decisao.indexOf(i.situacao) < 0).length,
      decisaoDre: itens.filter(i => decisao.indexOf(i.situacao) >= 0).length
    }
  };
}

function acaoReagendar_(p, u) {
  if (!p.escolaId || !/^\d{4}-\d{2}-\d{2}$/.test(p.data || '')) throw new Error('Informe a data.');
  const e = exigirEscola_(p.escolaId, u);
  const equipeId = p.equipeId && ehSupervisor_(u) ? p.equipeId : u.equipeId;
  const ex = Db.where('Roteiro', r => r.escolaId === e.id && (r.status === 'retorno' || r.status === 'agendada'))[0];
  Db.upsert('Roteiro', Object.assign(ex || { id: 'r-' + uid_(), ordem: 0, criadoPor: u.id }, {
    escolaId: e.id, data: p.data, hora: p.hora || '', equipeId: equipeId, status: e.status === 'retorno' || (ex && ex.status === 'retorno') ? 'retorno' : 'agendada',
    tipo: p.tipo || (ex && ex.tipo) || 'retorno', confirmado: p.confirmado ? 'sim' : '', nota: p.nota || (ex && ex.nota) || ''
  }));
  log_(u.id, 'reagendar', { escola: e.nome, data: p.data });
  return { ok: true };
}

function acaoCobrarDre_(p, u) {
  const e = exigirEscola_(p.escolaId, u);
  const d = Db.find('DREs', e.dre);
  if (!d) throw new Error('DRE não encontrada.');
  const c = Db.all('Cancelamentos').filter(x => x.escolaId === e.id).sort((a, b) => a.criadoEm < b.criadoEm ? 1 : -1)[0];
  let enviado = false;
  if (d.engenheiroEmail) {
    MailApp.sendEmail({
      to: d.engenheiroEmail, name: 'VistAR · ' + getConfig_().CONSORCIO,
      subject: 'Pendência de autorização · ' + e.nome,
      htmlBody: '<div style="font-family:Arial,sans-serif"><p>Prezado(a) ' + esc_(d.engenheiroNome || '') + ',</p><p>A vistoria da <b>' + esc_(e.nome) +
        '</b> aguarda posicionamento da DRE ' + esc_(e.dre) + '.</p><p><b>Situação:</b> ' + esc_(c ? c.motivo : 'pendente') + '<br>' + esc_(c ? c.descricao : '') +
        '</p><p>Atenciosamente,<br>' + esc_(u.nome) + '</p></div>'
    });
    enviado = true;
  }
  if (c) Db.upsert('Cancelamentos', { id: c.id, cobradoEm: agora_() });
  log_(u.id, 'cobrar', { escola: e.nome, enviado: enviado });
  return { enviado: enviado, tel: d.engenheiroTel, nome: d.engenheiroNome };
}

function acaoRegistro_(p, u) {
  exigirEscola_(p.escolaId, u);
  const c = Db.all('Cancelamentos').filter(x => x.escolaId === p.escolaId).sort((a, b) => a.criadoEm < b.criadoEm ? 1 : -1)[0];
  if (!c) throw new Error('Nenhum registro.');
  const f = c.fotoId ? Db.find('Fotos', c.fotoId) : null;
  const usr = Db.find('Usuarios', c.usuarioId) || {};
  return { motivo: c.motivo, houveRecusa: c.houveRecusa === 'sim', quem: c.quemRecusou, descricao: c.descricao, em: c.criadoEm, por: usr.nome,
    foto: f ? miniaturas_([f.fileId], 800)[f.fileId] || '' : '' };
}

/** Dados da última visita para retomar de onde parou. */
function acaoRetomarDados_(p, u) {
  exigirEscola_(p.escolaId, u);
  const v = Db.where('Vistorias', x => x.escolaId === p.escolaId && x.status !== 'em_andamento' && x.status !== 'mesclada').sort((a, b) => a.checkin < b.checkin ? 1 : -1)[0];
  if (!v) return null;
  return { id: v.id, codigo: v.codigo, versao: Number(v.versao) || 1, etapas: lerEtapas_(v.id),
    fotos: Db.where('Fotos', f => f.vistoriaId === v.id).map(f => ({ id: f.id, etapa: f.etapa, slot: f.slot, ref: f.ref, fileId: f.fileId, legenda: f.legenda, criadoEm: f.criadoEm })) };
}

/* ───────────────────────── Programação ───────────────────────── */

function acaoProgramacao_(p, u) {
  const sup = ehSupervisor_(u);
  const equipeId = sup && p.equipeId !== undefined ? p.equipeId : u.equipeId;
  const esc = {}; Db.all('Escolas').forEach(e => { esc[e.id] = e; });
  const vist = {}; Db.all('Vistorias').forEach(v => { vist[v.id] = v; });
  const itens = Db.where('Roteiro', r => (!equipeId || r.equipeId === equipeId) && r.data >= p.inicio && r.data <= p.fim)
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .map(r => {
      const e = esc[r.escolaId] || {};
      const v = vist[r.vistoriaId];
      return {
        id: r.id, data: r.data, hora: r.hora, horaFim: r.horaFim || (v && v.checkout ? fmtData_(v.checkout, 'HH:mm') : ''), equipeId: r.equipeId,
        escolaId: r.escolaId, escola: e.nome || r.nota, dre: e.dre, endereco: [e.logradouro, e.numero].filter(String).join(', '),
        ambientes: e.ambientesPrevistos, status: r.status, tipo: r.tipo || (r.status === 'retorno' ? 'retorno' : r.escolaId ? 'visita' : 'escritorio'),
        nota: r.nota, confirmado: r.confirmado === 'sim', responsavel: e.diretor,
        vistoria: v ? { id: v.id, checkin: v.checkin, checkout: v.checkout, resumo: parse_(v.resumo), status: v.status } : null
      };
    });
  return { itens: itens, equipes: sup ? Db.all('Equipes').map(e => ({ id: e.id, nome: e.nome })) : null, equipeId: equipeId };
}

function acaoSalvarVisita_(p, u) {
  exigirSupervisor_(u);
  if (p.tipo !== 'escritorio') exigirEscola_(p.escolaId, u);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.data || '')) throw new Error('Informe a data.');
  if (p.tipo !== 'escritorio' && !Db.find('Escolas', p.escolaId)) throw new Error('Escolha a escola.');
  if (!p.equipeId) throw new Error('Escolha a equipe.');
  const r = Db.upsert('Roteiro', {
    id: p.id || 'r-' + uid_(), data: p.data, hora: p.hora || '', horaFim: p.horaFim || '', equipeId: p.equipeId,
    escolaId: p.tipo === 'escritorio' ? '' : p.escolaId, ordem: 0, status: p.tipo === 'retorno' ? 'retorno' : 'agendada',
    tipo: p.tipo || 'visita', nota: p.nota || '', confirmado: p.confirmado ? 'sim' : '', criadoPor: u.id
  });
  if (p.tipo !== 'escritorio') {
    const e = Db.find('Escolas', p.escolaId);
    if (e.status !== 'concluida' && e.status !== 'retorno') Db.upsert('Escolas', { id: e.id, status: 'agendada' });
  }
  log_(u.id, 'programar', { id: r.id, data: p.data });
  return { id: r.id };
}

function acaoExcluirVisita_(p, u) {
  exigirSupervisor_(u);
  const r = Db.find('Roteiro', p.id);
  if (!r) return { ok: true };
  if (r.status === 'concluida' || r.status === 'em_andamento') throw new Error('Visitas iniciadas ou concluídas não podem ser excluídas.');
  Db.remove('Roteiro', p.id);
  return { ok: true };
}

/* ───────────────────────── Galeria de fotos ───────────────────────── */

const ROTULO_SLOT_ = {
  placa: 'Placa', frontal: 'Fachada', lateral: 'Fachada lateral', entrada: 'Entrada', medidor: 'Medidor', quadro: 'Quadro', aterramento: 'Aterramento',
  cabine: 'Cabine', tc: 'TC/TP', trafo: 'Transformador', cobertura: 'Cobertura', solo: 'Solo/pátio', base: 'Base condensadora', disjuntores: 'Disjuntores',
  pontoForca: 'Ponto de força', eletroduto: 'Eletroduto', aterr: 'Aterramento', vista: 'Ambiente', teto: 'Teto/forro', ilum: 'Iluminação', chapa: 'Chapa',
  registro: 'Registro', documento: 'Documento', foto: 'Geral', extra: 'Extra', fachada: 'Fachada'
};
function rotuloFoto_(f) { return f.legenda || ROTULO_SLOT_[String(f.slot || '').split('.').pop()] || 'Foto'; }

function acaoGaleria_(p, u) {
  const escolas = escolasDoUsuario_(u);
  const esc = {}; escolas.forEach(e => { esc[e.id] = e; });
  const vist = {}; Db.all('Vistorias').forEach(v => { vist[v.id] = v; });
  const sup = ehSupervisor_(u);
  const desde = p.periodo === 'semana' ? somaDias_(hoje_(), -6) : p.periodo === 'mes' ? somaDias_(hoje_(), -29) : '';
  const busca = String(p.busca || '').toLowerCase();
  let fotos = Db.where('Fotos', f => esc[f.escolaId] && f.etapa !== 'cancelamento');
  const total = fotos.length;
  if (!sup) fotos = fotos.filter(f => (vist[f.vistoriaId] || {}).equipeId === u.equipeId);
  if (p.equipeId) fotos = fotos.filter(f => (vist[f.vistoriaId] || {}).equipeId === p.equipeId);
  if (p.dre) fotos = fotos.filter(f => esc[f.escolaId].dre === p.dre);
  if (p.escolaId) fotos = fotos.filter(f => f.escolaId === p.escolaId);
  if (desde) fotos = fotos.filter(f => String(f.criadoEm).slice(0, 10) >= desde);
  if (p.etapa) fotos = fotos.filter(f => p.etapa === 'dados' ? (f.etapa === 'dados' && /placa|frontal|lateral|entrada|fachada/.test(f.slot)) : f.etapa === p.etapa);
  if (busca) fotos = fotos.filter(f => (esc[f.escolaId].nome + ' ' + rotuloFoto_(f) + ' ' + f.etapa).toLowerCase().indexOf(busca) >= 0);
  const grupos = {};
  fotos.sort((a, b) => a.criadoEm < b.criadoEm ? 1 : -1).forEach(f => { (grupos[f.escolaId] = grupos[f.escolaId] || []).push(f); });
  const lim = p.escolaId ? 300 : 9;
  return {
    total: total, filtradas: fotos.length, escolasComFotos: Object.keys(grupos).length,
    grupos: Object.keys(grupos).map(id => ({
      escolaId: id, escola: esc[id].nome, dre: esc[id].dre, data: grupos[id][0].criadoEm, total: grupos[id].length,
      fotos: grupos[id].slice(0, lim).map(f => ({ id: f.id, fileId: f.fileId, rotulo: rotuloFoto_(f), etapa: f.etapa, slot: f.slot, criadoEm: f.criadoEm,
        lat: f.lat, lng: f.lng, autor: f.autor, vistoriaId: f.vistoriaId, legenda: f.legenda }))
    })).sort((a, b) => a.data < b.data ? 1 : -1),
    autores: Db.all('Usuarios').reduce((m, x) => { m[x.id] = x.nome; return m; }, {})
  };
}

function acaoLegenda_(p, u) {
  const f = Db.find('Fotos', p.id);
  if (!f) throw new Error('Foto ainda não sincronizada.');
  exigirVistoria_(f.vistoriaId, u);
  Db.upsert('Fotos', { id: f.id, legenda: String(p.legenda || '').slice(0, 300) });
  try { DriveApp.getFileById(f.fileId).setDescription(p.legenda); } catch (e) { /* sem acesso ao arquivo */ }
  return { ok: true };
}

/* ───────────────────────── Usuários ───────────────────────── */

function acaoUsuarios_(p, u) {
  exigirSupervisor_(u);
  return {
    usuarios: Db.all('Usuarios').map(x => ({
      id: x.id, nome: x.nome, email: x.email, matricula: x.matricula, cargo: x.cargo, perfil: x.perfil || 'tecnico', equipeId: x.equipeId,
      dres: x.dres, ativo: x.ativo !== 'nao', ativado: !!x.senhaHash, codigoPendente: !!x.codigoAtivacao, ultimoAcesso: x.ultimoAcesso, rg: x.rg, telefone: x.telefone
    })).sort((a, b) => String(a.nome).localeCompare(b.nome)),
    equipes: Db.all('Equipes').map(e => ({ id: e.id, nome: e.nome, membros: e.membros })),
    dres: Db.all('DREs').map(d => d.id)
  };
}

function acaoSalvarUsuario_(p, u) {
  exigirSupervisor_(u);
  if (!p.nome || !(p.email || p.matricula)) throw new Error('Informe nome e e-mail ou matrícula.');
  if (p.perfil === 'admin' && u.perfil !== 'admin') throw new Error('Só o administrador cria outro administrador.');
  const dup = Db.all('Usuarios').find(x => x.id !== p.id && ((p.email && String(x.email).toLowerCase() === String(p.email).toLowerCase()) || (p.matricula && x.matricula === p.matricula)));
  if (dup) throw new Error('Já existe um usuário com este e-mail ou matrícula (' + dup.nome + ').');
  const novo = !p.id;
  const reg = Db.upsert('Usuarios', {
    id: p.id || 'u-' + uid_().slice(0, 8), nome: p.nome, email: p.email || '', matricula: p.matricula || '', cargo: p.cargo || '', perfil: p.perfil || 'tecnico',
    equipeId: p.equipeId || '', dres: Array.isArray(p.dres) ? p.dres.join(', ') : (p.dres || ''), rg: p.rg || '', telefone: p.telefone || '',
    empresa: p.empresa || getConfig_().EMPRESA, ativo: p.ativo === false ? 'nao' : 'sim', criadoEm: novo ? agora_() : undefined, tokenVersao: novo ? '1' : undefined
  });
  // Mantém a lista de membros da equipe coerente.
  if (reg.equipeId) {
    const eq = Db.find('Equipes', reg.equipeId);
    if (eq && lista_(eq.membros).indexOf(reg.nome) < 0 && reg.perfil === 'tecnico') Db.upsert('Equipes', { id: eq.id, membros: lista_(eq.membros).concat(reg.nome).join(', ') });
  }
  let codigo = '';
  if (novo || p.novoCodigo) codigo = enviarCodigo_(reg, p.enviarEmail !== false);
  log_(u.id, 'usuario', { id: reg.id, novo: novo });
  return { id: reg.id, codigo: codigo };
}

function enviarCodigo_(reg, email) {
  const cod = gerarCodigo_(reg);
  if (email && /@/.test(reg.email)) {
    const url = ScriptApp.getService().getUrl() || '';
    try {
      MailApp.sendEmail({
        to: reg.email, name: 'VistAR · ' + getConfig_().CONSORCIO, subject: 'Seu acesso ao VistAR',
        htmlBody: '<div style="font-family:Arial,sans-serif"><p>Olá, ' + esc_(reg.nome) + '.</p><p>Seu acesso ao VistAR foi criado.</p>' +
          '<ol><li>Abra o app' + (url ? ': <a href="' + url + '">' + url + '</a>' : '') + '</li><li>Toque em <b>Primeiro acesso</b></li>' +
          '<li>Informe ' + (reg.matricula ? 'a matrícula <b>' + esc_(reg.matricula) + '</b> ou ' : '') + 'o e-mail e o código abaixo</li></ol>' +
          '<p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#0F2140">' + cod + '</p><p style="color:#5B6B82">O código vale por 72 horas.</p></div>'
      });
    } catch (e) { console.warn(e); }
  }
  return cod;
}

function acaoNovoCodigo_(p, u) {
  exigirSupervisor_(u);
  const reg = Db.find('Usuarios', p.id);
  if (!reg) throw new Error('Usuário não encontrado.');
  if (p.bloquearSenha) Db.upsert('Usuarios', { id: reg.id, senhaHash: '', tokenVersao: String((Number(reg.tokenVersao) || 1) + 1) });
  return { codigo: enviarCodigo_(Db.find('Usuarios', reg.id), true) };
}
