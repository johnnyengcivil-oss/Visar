/**
 * VistAR 1.2.1 · servidor completo em um arquivo (gerado por dev/build-dist.js).
 * Não edite aqui: edite src/ e gere de novo. Para instalar, veja docs/GUIA_DE_IMPLANTACAO.md.
 */

/* ════════════════════ Config.gs ════════════════════ */

/**
 * VistAR · Configuração, esquema da planilha e instalação.
 *
 * A planilha é o banco de dados; o Drive guarda fotos, assinaturas e PDFs.
 * Rode `instalarVistAR()` uma vez no editor (ou pelo menu VistAR da planilha).
 */

const VERSAO = '1.2.1';

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
  CONSORCIO_CNPJ: '',
  CONTRATANTE: 'Secretaria Municipal de Educação de São Paulo (SME-SP)',
  CONTRATO_OBJETO: 'Climatização de unidades escolares',
  CONTRATO_VIGENCIA: '',
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
  CONSORCIO_CNPJ: 'CNPJ do consórcio (aparece nos relatórios)',
  CONTRATANTE: 'Órgão contratante',
  CONTRATO_OBJETO: 'Objeto do contrato',
  CONTRATO_VIGENCIA: 'Vigência do contrato (texto livre)',
  META_INICIO: 'Início do contrato (AAAA-MM-DD) · base da linha de meta do painel',
  META_DATA: 'Data para concluir todas as escolas (AAAA-MM-DD)',
  NOME_APP: 'Nome exibido nos e-mails'
};

/** Abas e colunas. A primeira coluna é sempre a chave. */
const SCHEMA = {
  Config: ['chave', 'valor', 'descricao'],
  Usuarios: ['id', 'email', 'nome', 'cargo', 'equipeId', 'rg', 'empresa', 'telefone', 'perfil', 'dres',
    'fotoId', 'senhaHash', 'salt', 'tokenVersao', 'ativo', 'criadoEm', 'matricula', 'codigoAtivacao', 'codigoExpira',
    'ultimoAcesso', 'lat', 'lng', 'vistoEm', 'fila', 'vistoriaAtual', 'perfilId', 'empresaId'],
  Equipes: ['id', 'nome', 'membros', 'supervisorNome', 'supervisorTel', 'status', 'statusDesde',
    'vistoriaAtual', 'destinoEscolaId', 'destinoEta', 'lat', 'lng', 'vistoEm', 'fila', 'empresaId', 'dres', 'ativo', 'baseNome', 'baseLat', 'baseLng'],
  DREs: ['id', 'nome', 'engenheiroNome', 'engenheiroCargo', 'engenheiroTel', 'engenheiroEmail', 'sigla', 'empresaId', 'ativo'],
  Empresas: ['id', 'nome', 'sigla', 'cnpj', 'emailGestao', 'logo', 'pastaId', 'ativo', 'criadoEm'],
  Perfis: ['id', 'nome', 'nivel', 'escopo', 'permissoes', 'padrao', 'descricao', 'ativo', 'atualizadoEm'],
  Escolas: ['id', 'nome', 'cie', 'dre', 'etapaEnsino', 'logradouro', 'numero', 'cep', 'bairro', 'complemento',
    'lat', 'lng', 'diretor', 'telefone', 'email', 'ambientesPrevistos', 'imovel', 'idadeAnos', 'fotoId',
    'status', 'nota', 'atualizadoEm', 'ativo', 'tipoUnidade', 'inep', 'telefone2', 'distrito', 'subprefeitura', 'obs', 'motivoInativacao',
    'inativadaEm', 'inativadaPor', 'ordemSme', 'tempMax', 'obsSme', 'salas', 'areaSalas', 'g1Qtd', 'g1Area', 'g2Qtd', 'g2Area', 'g3Qtd', 'g3Area',
    'labs', 'leitura', 'auditorio', 'areaAmbientes', 'padraoConstrutivo', 'notas'],
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
  Orcamentos: ['id', 'vistoriaId', 'escolaId', 'empresaId', 'status', 'responsavelId', 'atribuidoPor', 'atribuidoEm', 'prazo', 'valor',
    'versaoAtual', 'aprovadoPor', 'aprovadoEm', 'observacao', 'historico', 'criadoEm', 'atualizadoEm'],
  OrcRevisoes: ['id', 'orcamentoId', 'versao', 'valor', 'valorAc', 'valorEletrica', 'valorCivil', 'valorOutros', 'notas', 'arquivos', 'status',
    'enviadoPor', 'enviadoEm', 'parecer', 'parecerPor', 'parecerEm'],
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
    raioCheckin: Number(cfg.RAIO_CHECKIN_M) || 400, logo: cfg.LOGO || '', contratante: cfg.CONTRATANTE, cnpj: cfg.CONSORCIO_CNPJ,
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
    ex || { id: 'u-admin', nome: email.split('@')[0] }, { email: email, perfil: 'admin', perfilId: 'admin', matricula: (ex && ex.matricula) || '1000', ativo: 'sim' }));
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
      .addItem('Carregar escolas iniciais (131 EMEFs)', 'carregarEscolasIniciais')
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
    const novo = Object.assign({}, atual);
    Object.keys(obj).forEach(k => { if (obj[k] !== undefined) novo[k] = obj[k]; }); // undefined = não mexer
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


/* ════════════════════ Acesso.gs ════════════════════ */

/**
 * VistAR · Perfis de acesso, permissões e escopo (hierarquia do consórcio).
 *
 *   Administrador ─ vê e configura tudo
 *   Diretoria / Coordenação geral ─ vê tudo (todas as empresas)
 *   Gestão da empresa ─ programação, equipes, usuários e validação, só na sua empresa
 *   Orçamentos ─ escritório: consulta e extração do que lhe foi atribuído
 *   Vistoriador ─ trabalho de campo da sua equipe
 *
 * Cada perfil = nível (hierarquia) + escopo (o que enxerga) + permissões (o que faz).
 * Os perfis padrão ficam protegidos (podem ser restaurados); perfis personalizados
 * são cópias editáveis.
 */

/** Ordem hierárquica: quem cadastra usuários só atribui perfis de nível menor ou igual ao seu. */
const NIVEIS_ = { admin: 5, diretoria: 4, gestor: 3, orcamento: 2, vistoriador: 1 };
const NOMES_NIVEL_ = { admin: 'Administrador', diretoria: 'Diretoria / Coordenação geral', gestor: 'Gestão da empresa', orcamento: 'Orçamentos', vistoriador: 'Vistoriador' };

/** Escopos: tudo (todas as empresas), empresa (DREs da empresa), dres (DREs do usuário), equipe (só a própria equipe). */
const ESCOPOS_ = { tudo: 'Tudo (todas as empresas)', empresa: 'Empresa do usuário', dres: 'DREs atribuídas ao usuário', equipe: 'Somente a própria equipe' };

/** Funções do sistema que podem ser ligadas ou desligadas em cada perfil. */
const CAPS_ = [
  ['campo.vistoriar', 'Campo', 'Fazer vistorias (check-in, etapas, fotos, finalizar)'],
  ['escolas.ver', 'Escolas', 'Consultar escolas, localização e dados'],
  ['escolas.editar', 'Escolas', 'Cadastrar, editar, importar, inativar e reativar escolas'],
  ['dres.editar', 'Escolas', 'Cadastrar e editar DREs'],
  ['programacao.ver', 'Programação', 'Ver programação'],
  ['programacao.editar', 'Programação', 'Programar visitas e usar o assistente de roteiro'],
  ['supervisao.painel', 'Supervisão', 'Painel do dia e equipes ao vivo'],
  ['vistorias.consultar', 'Vistorias', 'Consultar vistorias e relatórios do escopo'],
  ['vistorias.validar', 'Vistorias', 'Validar vistorias (aprovar ou pedir correção)'],
  ['vistorias.reabrir', 'Vistorias', 'Reabrir vistoria para retorno'],
  ['pendencias.gerir', 'Vistorias', 'Reagendar retornos e cobrar DRE'],
  ['fotos.ver', 'Vistorias', 'Ver galeria de fotos'],
  ['orcamentos.ver', 'Orçamentos', 'Consultar orçamentos, valores e status do escopo'],
  ['orcamentos.elaborar', 'Orçamentos', 'Elaborar orçamentos atribuídos (valores, documentos, revisões)'],
  ['orcamentos.atribuir', 'Orçamentos', 'Atribuir orçamentos a orçamentistas e definir prazos'],
  ['orcamentos.aprovar', 'Orçamentos', 'Aprovar, devolver ou reabrir orçamentos'],
  ['extracao.usar', 'Dados', 'Extrair dados (CSV, Excel, Planilha Google)'],
  ['equipes.editar', 'Gestão', 'Cadastrar e editar equipes'],
  ['usuarios.gerenciar', 'Gestão', 'Cadastrar usuários e enviar códigos de acesso'],
  ['perfis.gerenciar', 'Administração', 'Criar e editar perfis de acesso'],
  ['empresas.gerenciar', 'Administração', 'Cadastrar empresas do consórcio e suas DREs'],
  ['config.editar', 'Administração', 'Personalizar logo, contrato e premissas']
];

const PERFIS_PADRAO_ = [
  { id: 'admin', nome: 'Administrador', nivel: 'admin', escopo: 'tudo', permissoes: CAPS_.map(c => c[0]),
    descricao: 'Acesso total, inclusive configurações, perfis e empresas.' },
  { id: 'diretoria', nome: 'Diretoria / Coordenação geral', nivel: 'diretoria', escopo: 'tudo',
    permissoes: CAPS_.map(c => c[0]).filter(c => ['config.editar', 'perfis.gerenciar', 'empresas.gerenciar'].indexOf(c) < 0),
    descricao: 'Vê e acompanha todas as empresas do consórcio.' },
  { id: 'gestor', nome: 'Gestão da empresa', nivel: 'gestor', escopo: 'empresa',
    permissoes: ['campo.vistoriar', 'escolas.ver', 'programacao.ver', 'programacao.editar', 'supervisao.painel', 'vistorias.consultar', 'vistorias.validar',
      'vistorias.reabrir', 'pendencias.gerir', 'fotos.ver', 'extracao.usar', 'equipes.editar', 'usuarios.gerenciar',
      'orcamentos.ver', 'orcamentos.atribuir', 'orcamentos.aprovar'],
    descricao: 'Programação, equipes, usuários, validação e aprovação de orçamentos na sua empresa.' },
  { id: 'orcamento', nome: 'Orçamentos', nivel: 'orcamento', escopo: 'empresa',
    permissoes: ['escolas.ver', 'programacao.ver', 'vistorias.consultar', 'fotos.ver', 'extracao.usar', 'orcamentos.elaborar'],
    descricao: 'Escritório: elabora os orçamentos atribuídos; consulta vistorias, relatórios e dados.' },
  { id: 'vistoriador', nome: 'Vistoriador', nivel: 'vistoriador', escopo: 'equipe',
    permissoes: ['campo.vistoriar', 'escolas.ver', 'programacao.ver', 'fotos.ver'],
    descricao: 'Trabalho de campo da sua equipe.' }
];

/** Perfis antigos (v1.0/1.1) → perfis padrão. */
const PERFIL_LEGADO_ = { tecnico: 'vistoriador', supervisor: 'gestor', coordenacao: 'diretoria', admin: 'admin' };

function perfisTodos_() {
  const salvos = {};
  try { Db.all('Perfis').forEach(p => { salvos[p.id] = p; }); } catch (e) { /* aba ainda não criada */ }
  const lista = PERFIS_PADRAO_.map(p => {
    const s = salvos[p.id];
    const r = s ? normPerfil_(Object.assign({}, s, { padrao: 'sim', nivel: p.nivel })) : normPerfil_(Object.assign({ padrao: 'sim', ativo: 'sim' }, p));
    if (p.id === 'admin') r.permissoes = CAPS_.map(c => c[0]); // o administrador nunca perde acesso (nem a funções novas)
    return r;
  });
  Object.keys(salvos).forEach(id => { if (!PERFIS_PADRAO_.some(p => p.id === id)) lista.push(normPerfil_(salvos[id])); });
  return lista;
}

function normPerfil_(p) {
  const perms = Array.isArray(p.permissoes) ? p.permissoes : lista_(p.permissoes);
  return { id: p.id, nome: p.nome, nivel: NIVEIS_[p.nivel] ? p.nivel : 'vistoriador', escopo: ESCOPOS_[p.escopo] ? p.escopo : 'equipe',
    permissoes: perms.filter(c => CAPS_.some(x => x[0] === c)), padrao: p.padrao === 'sim' || p.padrao === true, descricao: p.descricao || '', ativo: p.ativo !== 'nao' };
}

/** Perfil efetivo do usuário (memo por execução). */
const memoPerfil_ = {};
function perfilDe_(u) {
  if (!u) return normPerfil_(PERFIS_PADRAO_[4]);
  const chave = u.id + ':' + (u.perfilId || u.perfil);
  if (memoPerfil_[chave]) return memoPerfil_[chave];
  const id = u.perfilId || PERFIL_LEGADO_[u.perfil] || 'vistoriador';
  const p = perfisTodos_().find(x => x.id === id) || perfisTodos_().find(x => x.id === 'vistoriador');
  return (memoPerfil_[chave] = p);
}
function nivelDe_(u) { return NIVEIS_[perfilDe_(u).nivel] || 1; }
function pode_(u, cap) { return !!u && perfilDe_(u).permissoes.indexOf(cap) >= 0; }
function exigir_(u, cap) {
  if (!pode_(u, cap)) {
    const c = CAPS_.find(x => x[0] === cap);
    throw new Error('Seu perfil não permite: ' + (c ? c[2].toLowerCase() : cap) + '.');
  }
}
/** Enxerga além da própria equipe (gestão, orçamentos, diretoria, administrador). */
function ehSupervisor_(u) { return !!u && perfilDe_(u).escopo !== 'equipe'; }
function exigirSupervisor_(u) { exigir_(u, 'supervisao.painel'); }

/* ───────────── Escopo: o que cada usuário enxerga ───────────── */

/** DREs visíveis: tudo → todas; empresa → as da empresa (∩ DREs do usuário, se houver); dres/equipe → as do usuário. */
function dresPermitidas_(u) {
  const todas = Db.all('DREs');
  if (perfilDe_(u).escopo === 'tudo') return todas;
  const minhas = lista_(u.dres);
  if (!u.empresaId && !minhas.length) return todas; // usuário sem empresa nem DREs (instalações antigas)
  let l = u.empresaId ? todas.filter(d => d.empresaId === u.empresaId) : todas;
  if (minhas.length) l = l.filter(d => minhas.indexOf(d.id) >= 0);
  return l;
}

/** Escolas visíveis (ativas, a menos que incluirInativas e o perfil possa editar escolas). */
function escolasPermitidas_(u, incluirInativas) {
  const ids = {};
  dresPermitidas_(u).forEach(d => { ids[d.id] = true; });
  const tudo = perfilDe_(u).escopo === 'tudo';
  return Db.all('Escolas').filter(e => (tudo || ids[e.dre]) && (e.ativo !== 'nao' || (incluirInativas && pode_(u, 'escolas.editar'))));
}
function escolasDoUsuario_(u) { return escolasPermitidas_(u, false); }

function equipesPermitidas_(u) {
  const p = perfilDe_(u);
  const eqs = Db.all('Equipes').filter(e => e.ativo !== 'nao');
  if (p.escopo === 'tudo') return eqs;
  if (p.escopo === 'equipe') return eqs.filter(e => e.id === u.equipeId);
  return eqs.filter(e => !u.empresaId || !e.empresaId || e.empresaId === u.empresaId);
}

/** Usuários que este usuário pode ver/gerenciar (mesma empresa e nível menor ou igual). */
function usuariosPermitidos_(u) {
  const p = perfilDe_(u), n = nivelDe_(u);
  return Db.all('Usuarios').filter(x => (p.escopo === 'tudo' || !u.empresaId || x.empresaId === u.empresaId) && nivelDe_(x) <= n);
}

function exigirEscola_(id, u) {
  const e = Db.find('Escolas', id);
  if (!e) throw new Error('Escola não encontrada.');
  const ok = escolasPermitidas_(u, true).some(x => x.id === e.id);
  if (!ok) throw new Error('Esta escola não pertence às suas DREs autorizadas.');
  return e;
}

/** Empresa de uma escola (pela DRE). */
function empresaDaEscola_(e) {
  const d = e && Db.find('DREs', e.dre);
  return d && d.empresaId ? Db.find('Empresas', d.empresaId) : null;
}

/* ───────────── Perfis: ações de administração ───────────── */

function acaoPerfis_(p, u) {
  exigir_(u, 'perfis.gerenciar');
  const contagem = {};
  Db.all('Usuarios').forEach(x => { const id = x.perfilId || PERFIL_LEGADO_[x.perfil] || 'vistoriador'; contagem[id] = (contagem[id] || 0) + 1; });
  return { perfis: perfisTodos_().map(x => Object.assign(x, { usuarios: contagem[x.id] || 0 })), caps: CAPS_, niveis: NOMES_NIVEL_, escopos: ESCOPOS_ };
}

function acaoSalvarPerfil_(p, u) {
  exigir_(u, 'perfis.gerenciar');
  if (!p.nome) throw new Error('Dê um nome ao perfil.');
  if (!NIVEIS_[p.nivel]) throw new Error('Nível inválido.');
  if (NIVEIS_[p.nivel] > nivelDe_(u)) throw new Error('Você não pode criar perfil de nível acima do seu.');
  const padrao = PERFIS_PADRAO_.find(x => x.id === p.id);
  const id = p.id || 'p-' + uid_().slice(0, 8);
  Db.upsert('Perfis', {
    id: id, nome: p.nome, nivel: padrao ? padrao.nivel : p.nivel, escopo: ESCOPOS_[p.escopo] ? p.escopo : 'equipe',
    permissoes: (p.permissoes || []).filter(c => CAPS_.some(x => x[0] === c)).join(','), padrao: padrao ? 'sim' : 'nao',
    descricao: p.descricao || '', ativo: 'sim', atualizadoEm: agora_()
  });
  log_(u.id, 'perfil', { id: id, nome: p.nome });
  return { id: id };
}

function acaoExcluirPerfil_(p, u) {
  exigir_(u, 'perfis.gerenciar');
  if (PERFIS_PADRAO_.some(x => x.id === p.id)) throw new Error('Perfis padrão não podem ser excluídos (use "Restaurar padrão").');
  if (Db.all('Usuarios').some(x => x.perfilId === p.id)) throw new Error('Há usuários com este perfil. Troque o perfil deles antes.');
  Db.remove('Perfis', p.id);
  return { ok: true };
}

/** Volta um perfil padrão às permissões originais. */
function acaoRestaurarPerfil_(p, u) {
  exigir_(u, 'perfis.gerenciar');
  if (!PERFIS_PADRAO_.some(x => x.id === p.id)) throw new Error('Só perfis padrão podem ser restaurados.');
  Db.remove('Perfis', p.id);
  return { ok: true };
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
    perfilId: perfilDe_(u).id, perfilNome: perfilDe_(u).nome, nivel: perfilDe_(u).nivel, escopo: perfilDe_(u).escopo, perms: perfilDe_(u).permissoes,
    empresaId: u.empresaId || '', empresaNome: (Db.find('Empresas', u.empresaId) || {}).nome || '',
    supervisor: pode_(u, 'supervisao.painel'),
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
    // Viewport exatamente no formato documentado pelo Google: sem ele o celular desenha a página com ~980 px e encolhe tudo.
    [['viewport', 'width=device-width, initial-scale=1'], ['mobile-web-app-capable', 'yes'],
      ['apple-mobile-web-app-capable', 'yes'], ['apple-mobile-web-app-title', 'VistAR'], ['apple-mobile-web-app-status-bar-style', 'black-translucent']]
      .forEach(m => { try { out.addMetaTag(m[0], m[1]); } catch (err) { console.error('[doGet] meta tag recusada: ' + m[0], err); } });
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
    documentos: { fn: acaoDocumentos_ },
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
    logErro: { fn: acaoLogErro_ },
    perfis: { fn: acaoPerfis_ },
    salvarPerfil: { fn: acaoSalvarPerfil_, lock: true },
    excluirPerfil: { fn: acaoExcluirPerfil_, lock: true },
    restaurarPerfil: { fn: acaoRestaurarPerfil_, lock: true },
    cadastroEscolas: { fn: acaoCadastroEscolas_ },
    salvarEscola: { fn: acaoSalvarEscola_, lock: true },
    ativarEscola: { fn: acaoAtivarEscola_, lock: true },
    geocodificar: { fn: acaoGeocodificar_ },
    importarEscolas: { fn: acaoImportarEscolas_, lock: true },
    salvarDre: { fn: acaoSalvarDre_, lock: true },
    empresas: { fn: acaoEmpresas_ },
    salvarEmpresa: { fn: acaoSalvarEmpresa_, lock: true },
    compartilharPastaEmpresa: { fn: acaoCompartilharPastaEmpresa_, lock: true },
    equipesCad: { fn: acaoEquipesCad_ },
    salvarEquipe: { fn: acaoSalvarEquipe_, lock: true },
    configAdmin: { fn: acaoConfigAdmin_ },
    salvarConfig: { fn: acaoSalvarConfig_, lock: true },
    manual: { fn: acaoManual_ },
    consultaVistorias: { fn: acaoConsultaVistorias_ },
    extrair: { fn: acaoExtrair_ },
    candidatos: { fn: acaoCandidatos_ },
    salvarRoteiro: { fn: acaoSalvarRoteiro_, lock: true },
    orcamentos: { fn: acaoOrcamentos_, lock: true },
    orcamento: { fn: acaoOrcamento_, lock: true },
    atribuirOrcamento: { fn: acaoAtribuirOrcamento_, lock: true },
    uploadDocOrcamento: { fn: acaoUploadDocOrcamento_ },
    enviarOrcamento: { fn: acaoEnviarOrcamento_, lock: true },
    decidirOrcamento: { fn: acaoDecidirOrcamento_, lock: true }
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
  const dres = dresPermitidas_(u);
  const escolas = escolasPermitidas_(u, false);
  const idsEscolas = {};
  escolas.forEach(e => { idsEscolas[e.id] = true; });
  const roteiro = Db.where('Roteiro', r => r.equipeId === u.equipeId && (!r.escolaId || idsEscolas[r.escolaId]));
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

/** PDFs no Drive e cópia para a unidade (pode levar de 20 s a 1 min). */
function documentosVistoria_(vf, escola, u) {
  const cfg = getConfig_();
  const docs = {};
  try { docs.vistoria = gerarPdf_(vf.id, 'vistoria'); } catch (e) { console.error(e); docs.vistoria = { erro: String(e.message || e) }; }
  try { docs.completo = gerarPdf_(vf.id, 'completo'); } catch (e) { console.error(e); docs.completo = { erro: String(e.message || e) }; }
  let copia = { enviada: false };
  const atual = Db.find('Vistorias', vf.id) || vf;
  const rev = ((lerEtapas_(vf.id).revisao || {}).dados) || {};
  const para = rev.respEmail || escola.email;
  if (/^sim/i.test(cfg.ENVIO_AUTOMATICO_COPIA) && para && atual.assinadoEm && !atual.copiaEnviadaEm) {
    try { copia = acaoEnviarCopia_({ vistoriaId: vf.id, para: para }, u); } catch (e) { copia = { enviada: false, erro: String(e.message || e) }; }
  } else if (atual.copiaEnviadaEm) {
    copia = { enviada: true, para: atual.copiaPara, em: atual.copiaEnviadaEm };
  }
  return { docs: docs, copia: copia };
}

/** Segunda parte da finalização: relatórios e cópia, fora da trava (as outras equipes não esperam). */
function acaoDocumentos_(p, u) {
  const v = exigirVistoria_(p.vistoriaId, u);
  if (v.status !== 'finalizada') throw new Error('A vistoria ainda não foi finalizada.');
  const r = documentosVistoria_(v, Db.find('Escolas', v.escolaId) || {}, u);
  const rev = ((lerEtapas_(v.id).revisao || {}).dados) || {};
  return { id: v.id, docs: r.docs, copia: r.copia, assinado: !!v.assinadoEm, assinantes: [getConfig_().RESPONSAVEL_TECNICO, rev.respNome].filter(String) };
}

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
    try { sincronizarOrcamentos_(); } catch (e) { console.error('[orcamentos]', e); } // vistoria finalizada → disponível para orçamento
  }

  const vf = Db.find('Vistorias', v.id);
  const prox = proximaEscola_(v.equipeId, v.escolaId);
  const st = statusEquipeAposEncerrar_(v.equipeId, v.id, prox);

  // Relatórios e cópia: no próprio envio (apps antigos) ou depois, pela ação "documentos" (sem segurar a trava do servidor).
  const extra = p.docsDepois ? { docs: { pendente: true }, copia: { pendente: true } } : documentosVistoria_(vf, escola, u);
  const docs = extra.docs, copia = extra.copia;
  const rev = ((lerEtapas_(v.id).revisao || {}).dados) || {};
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
      out.poly = rota.poly;
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
  // Cada empresa do consórcio guarda fotos e PDFs na sua própria pasta: VistAR/Empresas/<empresa>/Vistorias/DRE …
  const emp = empresaDaEscola_(escola);
  const base = emp ? pastaEmpresa_(emp) : pastaRaiz_();
  const dre = subpasta_(subpasta_(base, 'Vistorias'), 'DRE ' + (escola.dre || 'sem DRE'));
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
  const equipes = equipesPermitidas_(u);
  const porEquipe = equipes.map(eq => ({ id: eq.id, nome: eq.nome, n: finPer.filter(v => v.equipeId === eq.id).length }));
  const nTot = porEquipe.reduce((s, x) => s + x.n, 0) || 1;
  porEquipe.forEach(x => { x.pct = x.n / nTot; });

  return {
    periodo: p.periodo || 'mes', dre: p.dre || '', dres: dresPermitidas_(u).map(d => d.id),
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
    mapa: escolas.filter(e => e.lat && e.lng).map(e => ({ id: e.id, nome: e.nome, lat: Number(e.lat), lng: Number(e.lng), st: st[e.id] })),
    orcamentos: resumoOrcamentos_(u, ids)
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
  exigir_(u, 'supervisao.painel');
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
  const equipes = equipesPermitidas_(u).map(eq => {
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
  exigir_(u, 'vistorias.validar');
  const esc = {}; Db.all('Escolas').forEach(e => { esc[e.id] = e; });
  const eqs = {}; Db.all('Equipes').forEach(e => { eqs[e.id] = e; });
  const filtro = p.filtro || 'pendente';
  const visiveis = {};
  escolasPermitidas_(u, true).forEach(e => { visiveis[e.id] = true; });
  return Db.where('Vistorias', v => v.status === 'finalizada' && visiveis[v.escolaId] && (filtro === 'todas' || (filtro === 'pendente' ? (!v.validacao || v.validacao === 'pendente') : v.validacao === filtro)))
    .sort((a, b) => a.checkout < b.checkout ? 1 : -1).slice(0, 80)
    .map(v => ({ id: v.id, codigo: v.codigo, escola: (esc[v.escolaId] || {}).nome, dre: (esc[v.escolaId] || {}).dre, equipe: (eqs[v.equipeId] || {}).nome,
      checkout: v.checkout, assinado: !!v.assinadoEm, resumo: parse_(v.resumo), validacao: v.validacao || 'pendente', nota: v.validacaoNota }));
}

function acaoValidar_(p, u) {
  exigir_(u, 'vistorias.validar');
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
    podeValidar: ehSupervisor_(u),
    orcamento: orcamentoDaVistoria_(v.id, u)
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
  const eqOk = {}; equipesPermitidas_(u).forEach(e => { eqOk[e.id] = e.nome; });
  const itens = Db.where('Roteiro', r => (!equipeId || r.equipeId === equipeId) && (!sup || eqOk[r.equipeId] !== undefined) && r.data >= p.inicio && r.data <= p.fim)
    .sort((a, b) => (a.data + (a.hora || '99') + String(a.ordem || 0).padStart(3, '0')).localeCompare(b.data + (b.hora || '99') + String(b.ordem || 0).padStart(3, '0')))
    .map(r => {
      const e = esc[r.escolaId] || {};
      const v = vist[r.vistoriaId];
      return {
        id: r.id, data: r.data, hora: r.hora, horaFim: r.horaFim || (v && v.checkout ? fmtData_(v.checkout, 'HH:mm') : ''), equipeId: r.equipeId,
        escolaId: r.escolaId, escola: e.nome || r.nota, dre: e.dre, endereco: [e.logradouro, e.numero].filter(String).join(', '),
        ambientes: e.ambientesPrevistos, status: r.status, tipo: r.tipo || (r.status === 'retorno' ? 'retorno' : r.escolaId ? 'visita' : 'escritorio'),
        nota: r.nota, confirmado: r.confirmado === 'sim', responsavel: e.diretor, ordem: Number(r.ordem) || 0, lat: e.lat, lng: e.lng, equipe: eqOk[r.equipeId] || '',
        vistoria: v ? { id: v.id, checkin: v.checkin, checkout: v.checkout, resumo: parse_(v.resumo), status: v.status } : null
      };
    });
  return { itens: itens, equipes: sup ? equipesPermitidas_(u).map(e => ({ id: e.id, nome: e.nome })) : null, equipeId: equipeId };
}

function acaoSalvarVisita_(p, u) {
  exigir_(u, 'programacao.editar');
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
  exigir_(u, 'programacao.editar');
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



/* ════════════════════ Cadastros.gs ════════════════════ */

/**
 * VistAR · Cadastros: escolas, DREs, empresas do consórcio, equipes, usuários,
 * personalização e e-mail de boas-vindas (com manual e guia rápido em PDF).
 */

/* ───────────────────────── Escolas ───────────────────────── */

const CAMPOS_ESCOLA_ = ['nome', 'cie', 'inep', 'tipoUnidade', 'dre', 'etapaEnsino', 'logradouro', 'numero', 'cep', 'bairro', 'complemento', 'distrito',
  'subprefeitura', 'lat', 'lng', 'diretor', 'telefone', 'telefone2', 'email', 'ambientesPrevistos', 'imovel', 'idadeAnos', 'obs'];

function acaoCadastroEscolas_(p, u) {
  exigir_(u, 'escolas.ver');
  const editar = pode_(u, 'escolas.editar');
  const st = statusEscolas_(escolasPermitidas_(u, true));
  return {
    escolas: escolasPermitidas_(u, editar).map(e => Object.assign({}, e, { situacao: st[e.id] || 'nao_iniciada', ativo: e.ativo !== 'nao' })),
    dres: dresPermitidas_(u).map(d => Object.assign({}, d, { empresa: (Db.find('Empresas', d.empresaId) || {}).nome || '' })),
    empresas: Db.all('Empresas').filter(x => perfilDe_(u).escopo === 'tudo' || x.id === u.empresaId),
    podeEditar: editar, podeDres: pode_(u, 'dres.editar')
  };
}

function acaoSalvarEscola_(p, u) {
  exigir_(u, 'escolas.editar');
  const x = p.escola || {};
  if (!x.nome) throw new Error('Informe o nome da escola.');
  if (!x.dre || !dresPermitidas_(u).some(d => d.id === x.dre)) throw new Error('Escolha uma DRE que você administra.');
  if (x.id) exigirEscola_(x.id, u);
  const dup = x.cie && Db.all('Escolas').find(e => e.id !== x.id && String(e.cie) === String(x.cie));
  if (dup) throw new Error('Já existe escola com este código (' + dup.nome + ').');
  const reg = { id: x.id || 'esc-' + (x.cie || uid_().slice(0, 8)), atualizadoEm: agora_() };
  CAMPOS_ESCOLA_.forEach(k => { if (x[k] !== undefined) reg[k] = x[k]; });
  if (!x.id) { reg.status = 'nao_iniciada'; reg.ativo = 'sim'; }
  Db.upsert('Escolas', reg);
  log_(u.id, 'escola', { id: reg.id, nome: x.nome });
  return { id: reg.id };
}

/** Inativa (sai da lista de vistorias, roteiro e painel) ou reativa uma escola. */
function acaoAtivarEscola_(p, u) {
  exigir_(u, 'escolas.editar');
  const e = exigirEscola_(p.id, u);
  const ativo = !!p.ativo;
  if (!ativo && Db.where('Vistorias', v => v.escolaId === e.id && v.status === 'em_andamento').length) throw new Error('Há uma vistoria em andamento nesta escola. Finalize ou cancele antes de inativar.');
  Db.upsert('Escolas', { id: e.id, ativo: ativo ? 'sim' : 'nao', motivoInativacao: ativo ? '' : (p.motivo || ''), inativadaEm: ativo ? '' : agora_(), inativadaPor: ativo ? '' : u.nome });
  if (!ativo) Db.where('Roteiro', r => r.escolaId === e.id && r.status === 'agendada').forEach(r => Db.remove('Roteiro', r.id));
  log_(u.id, ativo ? 'reativar' : 'inativar', { escola: e.nome, motivo: p.motivo || '' });
  return { ok: true };
}

/** Coordenadas pelo endereço (serviço Maps). */
function acaoGeocodificar_(p, u) {
  exigir_(u, 'escolas.editar');
  const r = Maps.newGeocoder().setRegion('br').setLanguage('pt-BR').geocode(String(p.endereco || '') + ', São Paulo - SP');
  if (r.status !== 'OK' || !r.results.length) throw new Error('Endereço não encontrado no mapa.');
  const l = r.results[0].geometry.location;
  return { lat: l.lat, lng: l.lng, formatado: r.results[0].formatted_address };
}

/**
 * Importa linhas de planilha (já convertidas pelo app): atualiza pelo código EOL/CIE
 * ou cria. DREs inexistentes são criadas (na empresa escolhida, se houver).
 */
function acaoImportarEscolas_(p, u) {
  exigir_(u, 'escolas.editar');
  const linhas = (p.linhas || []).slice(0, 2000);
  const dres = {};
  Db.all('DREs').forEach(d => { dres[norm_(d.id)] = d; if (d.sigla) dres[norm_(d.sigla)] = d; if (d.nome) dres[norm_(d.nome).replace(/^dre /, '')] = d; });
  const porCodigo = {};
  Db.all('Escolas').forEach(e => { if (e.cie) porCodigo[String(e.cie)] = e; });
  const res = { criadas: 0, atualizadas: 0, dresCriadas: 0, erros: [] };
  linhas.forEach((l, i) => {
    try {
      if (!l.nome) throw new Error('sem nome');
      const chaveDre = norm_(l.dre || '').replace(/^dre /, '');
      let d = dres[chaveDre];
      if (!d) {
        if (!l.dre) throw new Error('sem DRE');
        if (!pode_(u, 'dres.editar')) throw new Error('DRE "' + l.dre + '" não cadastrada');
        d = Db.upsert('DREs', { id: String(l.dre).trim(), nome: 'DRE ' + String(l.dre).trim(), sigla: '', empresaId: p.empresaId || u.empresaId || '', ativo: 'sim' });
        dres[chaveDre] = d; res.dresCriadas++;
      }
      if (!dresPermitidas_(u).some(x => x.id === d.id) && perfilDe_(u).escopo !== 'tudo') throw new Error('DRE fora do seu escopo');
      const ex = l.cie ? porCodigo[String(l.cie)] : null;
      const reg = { id: ex ? ex.id : 'esc-' + (l.cie || uid_().slice(0, 8)), dre: d.id, atualizadoEm: agora_() };
      CAMPOS_ESCOLA_.concat(CAMPOS_SME_).forEach(k => { if (k !== 'dre' && l[k] !== undefined && l[k] !== '') reg[k] = l[k]; });
      if (!ex) { reg.status = 'nao_iniciada'; reg.ativo = 'sim'; res.criadas++; } else res.atualizadas++;
      Db.upsert('Escolas', reg);
      if (reg.cie) porCodigo[String(reg.cie)] = reg;
    } catch (e) { res.erros.push('Linha ' + (i + 2) + ': ' + e.message); }
  });
  log_(u.id, 'importar', { criadas: res.criadas, atualizadas: res.atualizadas, erros: res.erros.length });
  return res;
}

function norm_(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }

/** Dados da SME guardados por escola (vêm da carga inicial ou da importação). */
const CAMPOS_SME_ = ['ordemSme', 'tempMax', 'obsSme', 'salas', 'areaSalas', 'g1Qtd', 'g1Area', 'g2Qtd', 'g2Area', 'g3Qtd', 'g3Area', 'labs', 'leitura', 'auditorio', 'areaAmbientes', 'padraoConstrutivo', 'notas'];

/** Carga inicial: 131 EMEFs priorizadas (4 DREs). Idempotente: atualiza pelo código EOL. */
function carregarEscolasIniciais(empresaId) {
  instalarVistAR();
  const dreId = {};
  DRES_INICIAIS_.forEach(d => {
    const ex = Db.find('DREs', d.nome);
    Db.upsert('DREs', { id: d.nome, nome: 'DRE ' + d.nome, sigla: d.sigla, ativo: 'sim', empresaId: (ex && ex.empresaId) || empresaId || '' });
    dreId[d.sigla] = d.nome;
  });
  let n = 0;
  ESCOLAS_INICIAIS_.forEach(r => {
    const o = {};
    CAMPOS_ESCOLAS_INICIAIS_.forEach((k, i) => { o[k] = r[i]; });
    const ex = Db.find('Escolas', o.id);
    Db.upsert('Escolas', Object.assign({}, o, {
      nome: (o.tipo || 'EMEF') + ' ' + o.nome, cie: o.eol, tipoUnidade: o.tipo, dre: dreId[o.dreSigla], etapaEnsino: 'Ensino Fundamental',
      status: ex ? ex.status : 'nao_iniciada', ativo: ex ? ex.ativo || 'sim' : 'sim', obs: [o.obsSme, o.notas].filter(String).join(' · '), atualizadoEm: agora_()
    }));
    n++;
  });
  const msg = n + ' escolas carregadas em ' + DRES_INICIAIS_.length + ' DREs. Associe cada DRE a uma empresa em Menu › Cadastros › Empresas e DREs.';
  console.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { /* executado pelo editor */ }
  return msg;
}

/* ───────────────────────── DREs e empresas ───────────────────────── */

function acaoSalvarDre_(p, u) {
  exigir_(u, 'dres.editar');
  const d = p.dre || {};
  if (!d.id && !d.nomeCurto) throw new Error('Informe o nome da DRE.');
  const id = d.id || String(d.nomeCurto).trim();
  if (d.empresaId && perfilDe_(u).escopo !== 'tudo' && d.empresaId !== u.empresaId) throw new Error('Você só pode vincular DREs à sua empresa.');
  Db.upsert('DREs', { id: id, nome: d.nome || 'DRE ' + id, sigla: d.sigla || '', empresaId: d.empresaId || '', engenheiroNome: d.engenheiroNome || '',
    engenheiroCargo: d.engenheiroCargo || 'Engenheiro DRE', engenheiroTel: d.engenheiroTel || '', engenheiroEmail: d.engenheiroEmail || '', ativo: d.ativo === false ? 'nao' : 'sim' });
  log_(u.id, 'dre', { id: id });
  return { id: id };
}

function acaoEmpresas_(p, u) {
  exigir_(u, 'empresas.gerenciar');
  const dres = Db.all('DREs');
  return Db.all('Empresas').map(e => Object.assign({}, e, {
    dres: dres.filter(d => d.empresaId === e.id).map(d => d.id),
    usuarios: Db.all('Usuarios').filter(x => x.empresaId === e.id).length,
    pastaUrl: e.pastaId ? 'https://drive.google.com/drive/folders/' + e.pastaId : ''
  }));
}

function acaoSalvarEmpresa_(p, u) {
  exigir_(u, 'empresas.gerenciar');
  const x = p.empresa || {};
  if (!x.nome) throw new Error('Informe o nome da empresa.');
  const id = x.id || 'emp-' + uid_().slice(0, 6);
  Db.upsert('Empresas', { id: id, nome: x.nome, sigla: x.sigla || '', cnpj: x.cnpj || '', emailGestao: x.emailGestao || '', logo: x.logo !== undefined ? x.logo : undefined,
    ativo: x.ativo === false ? 'nao' : 'sim', criadoEm: x.id ? undefined : agora_() });
  // DREs da empresa
  if (Array.isArray(x.dres)) {
    Db.all('DREs').forEach(d => {
      const dentro = x.dres.indexOf(d.id) >= 0;
      if (dentro && d.empresaId !== id) Db.upsert('DREs', { id: d.id, empresaId: id });
      if (!dentro && d.empresaId === id) Db.upsert('DREs', { id: d.id, empresaId: '' });
    });
  }
  pastaEmpresa_(Db.find('Empresas', id));
  log_(u.id, 'empresa', { id: id, nome: x.nome });
  return { id: id };
}

/** Pasta própria da empresa no Drive: VistAR/Empresas/<nome>. */
function pastaEmpresa_(emp) {
  if (!emp) return null;
  if (emp.pastaId) { try { return DriveApp.getFolderById(emp.pastaId); } catch (e) { /* recria */ } }
  const f = subpasta_(subpasta_(pastaRaiz_(), 'Empresas'), emp.sigla ? emp.sigla + ' · ' + emp.nome : emp.nome);
  Db.upsert('Empresas', { id: emp.id, pastaId: f.getId() });
  return f;
}

/** Dá acesso de leitura à pasta da empresa para os gestores e orçamentistas dela (opcional). */
function acaoCompartilharPastaEmpresa_(p, u) {
  exigir_(u, 'empresas.gerenciar');
  const emp = Db.find('Empresas', p.id);
  const pasta = pastaEmpresa_(emp);
  const emails = Db.all('Usuarios').filter(x => x.empresaId === emp.id && x.ativo !== 'nao' && /@/.test(x.email) && ['gestor', 'orcamento'].indexOf(perfilDe_(x).nivel) >= 0).map(x => x.email);
  emails.forEach(m => { try { pasta.addViewer(m); } catch (e) { console.warn(m, e); } });
  return { compartilhados: emails.length, url: pasta.getUrl() };
}

/* ───────────────────────── Equipes ───────────────────────── */

function acaoEquipesCad_(p, u) {
  exigir_(u, 'equipes.editar');
  const usuarios = usuariosPermitidos_(u);
  return {
    equipes: Db.all('Equipes').filter(e => perfilDe_(u).escopo === 'tudo' || !u.empresaId || e.empresaId === u.empresaId).map(e => Object.assign({}, e, {
      pessoas: usuarios.filter(x => x.equipeId === e.id).map(x => ({ id: x.id, nome: x.nome, perfil: perfilDe_(x).nome })),
      empresa: (Db.find('Empresas', e.empresaId) || {}).nome || '', ativo: e.ativo !== 'nao'
    })),
    usuarios: usuarios.filter(x => x.ativo !== 'nao').map(x => ({ id: x.id, nome: x.nome, equipeId: x.equipeId, nivel: perfilDe_(x).nivel })),
    empresas: Db.all('Empresas').filter(x => perfilDe_(u).escopo === 'tudo' || x.id === u.empresaId).map(x => ({ id: x.id, nome: x.nome })),
    dres: dresPermitidas_(u).map(d => d.id)
  };
}

function acaoSalvarEquipe_(p, u) {
  exigir_(u, 'equipes.editar');
  const x = p.equipe || {};
  if (!x.nome) throw new Error('Informe o nome da equipe.');
  const empresaId = perfilDe_(u).escopo === 'tudo' ? (x.empresaId || '') : u.empresaId;
  if (x.id) { const ex = Db.find('Equipes', x.id); if (ex && ex.empresaId && empresaId !== ex.empresaId && perfilDe_(u).escopo !== 'tudo') throw new Error('Equipe de outra empresa.'); }
  const id = x.id || 'eq-' + uid_().slice(0, 6);
  const permitidos = {};
  usuariosPermitidos_(u).forEach(y => { permitidos[y.id] = y; });
  const membros = (x.membros || []).filter(m => permitidos[m]);
  Db.all('Usuarios').forEach(y => {
    if (membros.indexOf(y.id) >= 0 && y.equipeId !== id) Db.upsert('Usuarios', { id: y.id, equipeId: id });
    if (membros.indexOf(y.id) < 0 && y.equipeId === id && permitidos[y.id]) Db.upsert('Usuarios', { id: y.id, equipeId: '' });
  });
  Db.upsert('Equipes', { id: id, nome: x.nome, empresaId: empresaId, membros: membros.map(m => permitidos[m].nome).join(', '),
    supervisorNome: x.supervisorNome || '', supervisorTel: x.supervisorTel || '', dres: (x.dres || []).join(', '), ativo: x.ativo === false ? 'nao' : 'sim',
    baseNome: x.baseNome || '', baseLat: x.baseLat || '', baseLng: x.baseLng || '', status: x.id ? undefined : 'disponivel' });
  log_(u.id, 'equipe', { id: id, nome: x.nome });
  return { id: id };
}

/* ───────────────────────── Usuários ───────────────────────── */

function acaoUsuarios_(p, u) {
  exigir_(u, 'usuarios.gerenciar');
  const n = nivelDe_(u);
  return {
    usuarios: usuariosPermitidos_(u).map(x => {
      const pf = perfilDe_(x);
      return { id: x.id, nome: x.nome, email: x.email, matricula: x.matricula, cargo: x.cargo, perfil: pf.nivel, perfilId: pf.id, perfilNome: pf.nome,
        equipeId: x.equipeId, empresaId: x.empresaId, dres: x.dres, ativo: x.ativo !== 'nao', ativado: !!x.senhaHash, codigoPendente: !!x.codigoAtivacao,
        ultimoAcesso: x.ultimoAcesso, rg: x.rg, telefone: x.telefone };
    }).sort((a, b) => String(a.nome).localeCompare(b.nome)),
    equipes: equipesPermitidas_(u).map(e => ({ id: e.id, nome: e.nome, empresaId: e.empresaId })),
    dres: dresPermitidas_(u).map(d => ({ id: d.id, empresaId: d.empresaId })),
    perfis: perfisTodos_().filter(x => x.ativo && NIVEIS_[x.nivel] <= n).map(x => ({ id: x.id, nome: x.nome, nivel: x.nivel, escopo: x.escopo })),
    empresas: Db.all('Empresas').filter(x => perfilDe_(u).escopo === 'tudo' || x.id === u.empresaId).map(x => ({ id: x.id, nome: x.nome })),
    escopoTudo: perfilDe_(u).escopo === 'tudo', minhaEmpresa: u.empresaId || ''
  };
}

function acaoSalvarUsuario_(p, u) {
  exigir_(u, 'usuarios.gerenciar');
  if (!p.nome || !(p.email || p.matricula)) throw new Error('Informe nome e e-mail ou matrícula.');
  const perfil = perfisTodos_().find(x => x.id === (p.perfilId || PERFIL_LEGADO_[p.perfil] || 'vistoriador'));
  if (!perfil) throw new Error('Perfil inválido.');
  if (NIVEIS_[perfil.nivel] > nivelDe_(u)) throw new Error('Você não pode atribuir um perfil de nível acima do seu.');
  const tudo = perfilDe_(u).escopo === 'tudo';
  const empresaId = tudo ? (p.empresaId || '') : u.empresaId;
  if (p.id) {
    const alvo = Db.find('Usuarios', p.id);
    if (!alvo || !usuariosPermitidos_(u).some(x => x.id === p.id)) throw new Error('Você não pode editar este usuário.');
  }
  const dup = Db.all('Usuarios').find(x => x.id !== p.id && ((p.email && String(x.email).toLowerCase() === String(p.email).toLowerCase()) || (p.matricula && x.matricula === p.matricula)));
  if (dup) throw new Error('Já existe um usuário com este e-mail ou matrícula (' + dup.nome + ').');
  const dresOk = dresPermitidas_(u).map(d => d.id);
  const dres = (Array.isArray(p.dres) ? p.dres : lista_(p.dres)).filter(d => tudo || dresOk.indexOf(d) >= 0);
  if (p.equipeId && !equipesPermitidas_(u).some(e => e.id === p.equipeId)) throw new Error('Equipe fora do seu escopo.');
  const novo = !p.id;
  const reg = Db.upsert('Usuarios', {
    id: p.id || 'u-' + uid_().slice(0, 8), nome: p.nome, email: p.email || '', matricula: p.matricula || '', cargo: p.cargo || perfil.nome,
    perfilId: perfil.id, perfil: perfil.nivel === 'vistoriador' ? 'tecnico' : perfil.nivel, empresaId: empresaId, equipeId: p.equipeId || '',
    dres: dres.join(', '), rg: p.rg || '', telefone: p.telefone || '', empresa: (Db.find('Empresas', empresaId) || {}).nome || p.empresa || getConfig_().EMPRESA,
    ativo: p.ativo === false ? 'nao' : 'sim', criadoEm: novo ? agora_() : undefined, tokenVersao: novo ? '1' : undefined
  });
  if (reg.equipeId) {
    const eq = Db.find('Equipes', reg.equipeId);
    if (eq && lista_(eq.membros).indexOf(reg.nome) < 0 && perfil.nivel === 'vistoriador') Db.upsert('Equipes', { id: eq.id, membros: lista_(eq.membros).concat(reg.nome).join(', ') });
  }
  let codigo = '';
  if (novo || p.novoCodigo) codigo = enviarCodigo_(reg, p.enviarEmail !== false);
  log_(u.id, 'usuario', { id: reg.id, novo: novo, perfil: perfil.id });
  return { id: reg.id, codigo: codigo };
}

function acaoNovoCodigo_(p, u) {
  exigir_(u, 'usuarios.gerenciar');
  const reg = Db.find('Usuarios', p.id);
  if (!reg || !usuariosPermitidos_(u).some(x => x.id === reg.id)) throw new Error('Usuário não encontrado.');
  if (p.bloquearSenha) Db.upsert('Usuarios', { id: reg.id, senhaHash: '', tokenVersao: String((Number(reg.tokenVersao) || 1) + 1) });
  return { codigo: enviarCodigo_(Db.find('Usuarios', reg.id), true) };
}

/* ───────────────────────── Boas-vindas, manual e guia ───────────────────────── */

/** PDF do manual ou do guia rápido para um nível (guardado no Drive por versão). */
function manualPdf_(tipo, nivel, nome, empresa) {
  const cfg = getConfig_();
  const t = HtmlService.createTemplateFromFile('Manual');
  t.tipo = tipo; t.nivel = nivel; t.nome = nome || '';
  t.cfg = { consorcio: cfg.CONSORCIO, contrato: cfg.CONTRATO, versao: VERSAO, url: ScriptApp.getService().getUrl() || '', logo: cfg.LOGO || '', empresa: empresa || '' };
  const html = t.evaluate().getContent();
  const nomeArq = (tipo === 'guia' ? 'Guia_rapido_VistAR_' : 'Manual_VistAR_') + NOMES_NIVEL_[nivel].replace(/\W+/g, '_') + '.pdf';
  return HtmlService.createHtmlOutput(html).getAs(MimeType.PDF).setName(nomeArq);
}

function enviarCodigo_(reg, email) {
  const cod = gerarCodigo_(reg);
  if (email && /@/.test(reg.email)) {
    const cfg = getConfig_();
    const url = ScriptApp.getService().getUrl() || '';
    const pf = perfilDe_(reg);
    const emp = (Db.find('Empresas', reg.empresaId) || {}).nome || '';
    const anexos = [];
    try { anexos.push(manualPdf_('guia', pf.nivel, reg.nome, emp)); anexos.push(manualPdf_('manual', pf.nivel, reg.nome, emp)); } catch (e) { console.warn('manual', e); }
    const papel = {
      vistoriador: 'Com ele você faz as vistorias nas escolas: check-in, fotos, ambientes, assinaturas e relatórios — inclusive sem internet.',
      orcamento: 'Com ele você consulta as vistorias, os relatórios e extrai os dados dos ambientes para os orçamentos.',
      gestor: 'Com ele você programa as visitas, acompanha as equipes ao vivo, valida as vistorias e cadastra os usuários da sua empresa.',
      diretoria: 'Com ele você acompanha o avanço do contrato em todas as empresas, DREs e equipes.',
      admin: 'Você tem acesso total: cadastros, perfis de acesso, empresas e personalização.'
    }[pf.nivel];
    const corpo = '<div style="font-family:Arial,sans-serif;color:#0F1E36;max-width:580px">' +
      '<div style="background:#0F2140;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">' +
      (cfg.LOGO ? '<img src="' + cfg.LOGO + '" alt="" style="height:36px;margin-bottom:8px"><br>' : '') +
      '<div style="font-size:24px;font-weight:bold">Vist<span style="color:#3CC1B5">AR</span></div>' +
      '<div style="font-size:13px;opacity:.8">' + esc_(cfg.CONSORCIO) + '</div></div>' +
      '<div style="border:1px solid #E3E8EF;border-top:0;padding:22px 24px;border-radius:0 0 12px 12px">' +
      '<p style="font-size:16px">Olá, <b>' + esc_(reg.nome) + '</b>! Boas-vindas ao VistAR.</p>' +
      '<p>O VistAR é o aplicativo de vistorias de climatização das escolas do contrato <b>' + esc_(cfg.CONTRATO) + '</b>. ' + papel + '</p>' +
      '<p>Seu perfil: <b>' + esc_(pf.nome) + '</b>' + (emp ? ' · ' + esc_(emp) : '') + '.</p>' +
      '<h3 style="color:#1F8F86;margin-bottom:6px">Como entrar (2 minutos)</h3><ol style="padding-left:20px;line-height:1.6">' +
      '<li>Abra o app' + (url ? ': <a href="' + url + '">' + url + '</a>' : '') + ' (no celular, use "Adicionar à tela inicial").</li>' +
      '<li>Toque em <b>Primeiro acesso</b>.</li><li>Informe ' + (reg.matricula ? 'a matrícula <b>' + esc_(reg.matricula) + '</b> ou ' : '') + 'o seu e-mail e o código abaixo.</li>' +
      '<li>Crie sua senha e permita localização e câmera.</li></ol>' +
      '<p style="font-size:30px;font-weight:bold;letter-spacing:8px;color:#0F2140;background:#F1F4F8;text-align:center;padding:12px;border-radius:10px">' + cod + '</p>' +
      '<p style="color:#5B6B82;font-size:13px">O código vale por 72 horas e só pode ser usado uma vez.</p>' +
      (anexos.length ? '<p><b>Em anexo:</b> o <b>Guia rápido</b> (2 páginas, para começar hoje) e o <b>Manual do usuário</b> completo para o seu perfil.</p>' : '') +
      '<p style="color:#5B6B82;font-size:13px">Dúvidas? Fale com o gestor da sua empresa ou com o administrador do sistema.</p></div></div>';
    try {
      MailApp.sendEmail({ to: reg.email, name: 'VistAR · ' + cfg.CONSORCIO, subject: 'Boas-vindas ao VistAR · seu acesso', htmlBody: corpo, attachments: anexos });
    } catch (e) { console.warn(e); }
  }
  return cod;
}

/** Baixar o manual/guia pelo app (Configurações › Ajuda). */
function acaoManual_(p, u) {
  const pf = perfilDe_(u);
  const b = manualPdf_(p.tipo === 'guia' ? 'guia' : 'manual', pf.nivel, u.nome, (Db.find('Empresas', u.empresaId) || {}).nome || '');
  return { nome: b.getName(), base64: Utilities.base64Encode(b.getBytes()) };
}

/* ───────────────────────── Personalização ───────────────────────── */

const CONFIG_EDITAVEL_ = ['CONSORCIO', 'CONSORCIO_CNPJ', 'CONTRATANTE', 'CONTRATO', 'CONTRATO_OBJETO', 'CONTRATO_VIGENCIA', 'LOTE', 'EMPRESA', 'RESPONSAVEL_TECNICO',
  'RESPONSAVEL_TECNICO_CARGO', 'SISTEMA_PREVISTO', 'EMAIL_COPIA_CONSORCIO', 'EMAIL_COORDENACAO', 'META_INICIO', 'META_DATA', 'RAIO_CHECKIN_M', 'TOKEN_DIAS',
  'ENVIO_AUTOMATICO_COPIA', 'KW_POR_TR', 'FATORES_BTU_M2'];

function acaoConfigAdmin_(p, u) {
  exigir_(u, 'config.editar');
  const cfg = getConfig_();
  return { valores: CONFIG_EDITAVEL_.map(k => ({ chave: k, valor: cfg[k] || '', descricao: DESCRICOES_CONFIG[k] || '' })), logo: cfg.LOGO || '',
    fatores: Object.assign({}, FATOR_BTU_M2_, (() => { try { return JSON.parse(cfg.FATORES_BTU_M2 || '{}'); } catch (e) { return {}; } })()) };
}

function acaoSalvarConfig_(p, u) {
  exigir_(u, 'config.editar');
  const v = p.valores || {};
  Object.keys(v).forEach(k => {
    if (CONFIG_EDITAVEL_.indexOf(k) < 0) return;
    if (k === 'FATORES_BTU_M2' && v[k]) { try { JSON.parse(v[k]); } catch (e) { throw new Error('Fatores BTU inválidos.'); } }
    Db.upsert('Config', { chave: k, valor: String(v[k]), descricao: DESCRICOES_CONFIG[k] || '' });
  });
  if (p.logo !== undefined) {
    if (p.logo && (!/^data:image\//.test(p.logo) || p.logo.length > 45000)) throw new Error('Logo inválido ou grande demais (use uma imagem pequena).');
    Db.upsert('Config', { chave: 'LOGO', valor: p.logo || '', descricao: 'Logo do consórcio (imagem pequena, gerada pelo app)' });
  }
  CacheService.getScriptCache().remove('cfg');
  log_(u.id, 'config', Object.keys(v).join(','));
  return { ok: true };
}


/* ════════════════════ Extracao.gs ════════════════════ */

/**
 * VistAR · Extração de dados (consulta e exportação) e assistente de roteiro.
 */

const CONJUNTOS_ = {
  vistorias: 'Vistorias (resumo por escola)',
  ambientes: 'Ambientes (um por linha)',
  aberturas: 'Aberturas (janelas e portas)',
  pontos: 'Pontos elétricos (TUG, iluminação, TUE)',
  equipamentos: 'Equipamentos com carga',
  entrada: 'Entrada de energia e elétrica',
  predim: 'Pré-dimensionamento (TR por ambiente)',
  pendencias: 'Pendências',
  fotos: 'Fotos (links do Drive)',
  escolas: 'Cadastro de escolas (com dados SME)',
  orcamentos: 'Orçamentos (status, valores e revisões)'
};

/** Vistorias do escopo, conforme filtros. Por padrão, só a última finalizada de cada escola. */
function vistoriasFiltradas_(u, f) {
  f = f || {};
  const esc = {};
  escolasPermitidas_(u, true).forEach(e => { esc[e.id] = e; });
  const dres = {};
  Db.all('DREs').forEach(d => { dres[d.id] = d; });
  let l = Db.where('Vistorias', v => esc[v.escolaId] && v.status !== 'mesclada' && v.status !== 'em_andamento' && (f.incluirCanceladas || v.status === 'finalizada'));
  if (perfilDe_(u).escopo === 'equipe') l = l.filter(v => v.equipeId === u.equipeId);
  if (f.empresaId) l = l.filter(v => (dres[esc[v.escolaId].dre] || {}).empresaId === f.empresaId);
  if (f.dre) l = l.filter(v => esc[v.escolaId].dre === f.dre);
  if (f.escolaId) l = l.filter(v => v.escolaId === f.escolaId);
  if (f.de) l = l.filter(v => String(v.checkout || v.checkin).slice(0, 10) >= f.de);
  if (f.ate) l = l.filter(v => String(v.checkout || v.checkin).slice(0, 10) <= f.ate);
  if (f.validacao) l = l.filter(v => (v.validacao || 'pendente') === f.validacao);
  l.sort((a, b) => String(a.checkout || a.checkin) < String(b.checkout || b.checkin) ? 1 : -1);
  if (!f.todasVersoes) { const vistas = {}; l = l.filter(v => !vistas[v.escolaId] && (vistas[v.escolaId] = true)); }
  return { lista: l, esc: esc, dres: dres };
}

function acaoConsultaVistorias_(p, u) {
  exigir_(u, 'vistorias.consultar');
  const r = vistoriasFiltradas_(u, Object.assign({ todasVersoes: true, incluirCanceladas: true }, p.filtros || {}));
  const eqs = {}; Db.all('Equipes').forEach(e => { eqs[e.id] = e.nome; });
  const verOrc = pode_(u, 'orcamentos.ver') || pode_(u, 'orcamentos.elaborar');
  const orc = {};
  if (verOrc) Db.all('Orcamentos').forEach(o => { orc[o.vistoriaId] = o; });
  let l = r.lista;
  const fo = (p.filtros || {}).orcamento;
  if (fo) l = l.filter(v => fo === 'sem' ? !orc[v.id] : (orc[v.id] || {}).status === fo);
  return l.slice(0, 500).map(v => {
    const e = r.esc[v.escolaId], o = orc[v.id];
    return { id: v.id, codigo: v.codigo, escolaId: v.escolaId, escola: e.nome, dre: e.dre, equipe: eqs[v.equipeId] || '', status: v.status, checkin: v.checkin, checkout: v.checkout,
      validacao: v.validacao || 'pendente', assinado: !!v.assinadoEm, resumo: parse_(v.resumo), versao: v.versao || '1',
      orcamento: o && podeVerOrc_(u, o) ? { id: o.id, status: o.status, nome: STATUS_ORC_[o.status], valor: Number(o.valor) || 0 } : null };
  });
}

function acaoExtrair_(p, u) {
  exigir_(u, 'extracao.usar');
  const conj = p.conjunto;
  if (!CONJUNTOS_[conj]) throw new Error('Conjunto de dados inválido.');
  const t = tabelaExtracao_(conj, u, p.filtros || {});
  if (p.planilha) {
    const ss = SpreadsheetApp.create('VistAR · ' + CONJUNTOS_[conj] + ' · ' + fmtData_(agora_(), 'dd-MM-yyyy HH.mm'));
    const sh = ss.getSheets()[0];
    sh.setName(conj);
    const dados = [t.colunas].concat(t.linhas.map(l => l.map(x => x === null || x === undefined ? '' : x)));
    sh.getRange(1, 1, dados.length, t.colunas.length).setValues(dados);
    sh.getRange(1, 1, 1, t.colunas.length).setFontWeight('bold').setBackground('#0F2140').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    try { sh.autoResizeColumns(1, Math.min(t.colunas.length, 30)); } catch (e) { /* planilha grande */ }
    // Guarda na pasta da empresa do usuário (ou em VistAR/Extrações).
    const emp = Db.find('Empresas', u.empresaId);
    const pasta = subpasta_(emp ? pastaEmpresa_(emp) : pastaRaiz_(), 'Extrações');
    const arq = DriveApp.getFileById(ss.getId());
    pasta.addFile(arq); DriveApp.getRootFolder().removeFile(arq);
    if (/@/.test(u.email)) { try { ss.addEditor(u.email); } catch (e) { /* conta sem Google */ } }
    log_(u.id, 'extrair', { conjunto: conj, linhas: t.linhas.length, planilha: ss.getId() });
    return { url: ss.getUrl(), linhas: t.linhas.length };
  }
  log_(u.id, 'extrair', { conjunto: conj, linhas: t.linhas.length });
  return { titulo: CONJUNTOS_[conj], colunas: t.colunas, linhas: t.linhas.slice(0, 20000), total: t.linhas.length };
}

function tabelaExtracao_(conj, u, f) {
  const cfg = getConfig_();
  if (conj === 'escolas') {
    const cols = ['Código EOL/CIE', 'INEP', 'Tipo', 'Nome', 'DRE', 'Logradouro', 'Nº', 'Bairro', 'CEP', 'Distrito', 'Subprefeitura', 'Telefone', 'Telefone 2', 'E-mail', 'Diretor(a)',
      'Latitude', 'Longitude', 'Ativa', 'Situação', 'Ordem SME', 'Temp. máx. média (°C)', 'Salas de aula', 'Área salas (m²)', 'Total ambientes', 'Área ambientes (m²)', 'Observações'];
    let es = escolasPermitidas_(u, true);
    if (f.dre) es = es.filter(e => e.dre === f.dre);
    const st = statusEscolas_(es);
    return { colunas: cols, linhas: es.map(e => [e.cie, e.inep, e.tipoUnidade, e.nome, e.dre, e.logradouro, e.numero, e.bairro, e.cep, e.distrito, e.subprefeitura, e.telefone, e.telefone2,
      e.email, e.diretor, num0_(e.lat), num0_(e.lng), e.ativo === 'nao' ? 'Não' : 'Sim', st[e.id], num0_(e.ordemSme), num0_(e.tempMax), num0_(e.salas), num0_(e.areaSalas),
      num0_(e.ambientesPrevistos), num0_(e.areaAmbientes), [e.obs, e.motivoInativacao].filter(String).join(' · ')]) };
  }
  if (conj === 'orcamentos') return tabelaOrcamentos_(u, f);
  const r = vistoriasFiltradas_(u, f);
  const eqs = {}; Db.all('Equipes').forEach(e => { eqs[e.id] = e.nome; });
  const emp = {}; Db.all('Empresas').forEach(e => { emp[e.id] = e.nome; });
  const linhas = [];
  let cols = [];
  const base = v => { const e = r.esc[v.escolaId]; return [v.codigo, e.cie, e.nome, e.dre]; };
  const baseCols = ['Vistoria', 'Código EOL/CIE', 'Escola', 'DRE'];
  r.lista.forEach(v => {
    const etRaw = lerEtapas_(v.id), et = {};
    Object.keys(etRaw).forEach(k => { et[k] = etRaw[k].dados || {}; });
    const blocos = (et.estrutura || {}).blocos || [];
    const amb = (et.ambientes || {}).itens || [];
    const local = a => a.externo ? 'Área externa' : nomeBloco_(blocos, a.bloco) + ' · ' + nomePav_(a.pav);
    const tipo = a => a.tipo === 'Outro' ? (a.tipoOutro || 'Outro') : a.tipo;
    if (conj === 'vistorias') {
      cols = baseCols.concat(['Empresa', 'Equipe', 'Status', 'Check-in', 'Check-out', 'Validação', 'Assinada', 'Ambientes', 'Fotos', 'Pendências',
        'Área total (m²)', 'Área climatizável (m²)', 'Carga (BTU/h)', 'Carga (TR)', 'Potência AC (kW)', 'Padrão de entrada', 'Capacidade entrada (kW)', 'Demanda medida (kW)']);
      const c = preDimensionamento_(et, cfg), rs = parse_(v.resumo), en = et.entrada || {};
      linhas.push(base(v).concat([emp[(r.dres[r.esc[v.escolaId].dre] || {}).empresaId] || '', eqs[v.equipeId] || '', v.status, fmtData_(v.checkin, 'dd/MM/yyyy HH:mm'),
        v.checkout ? fmtData_(v.checkout, 'dd/MM/yyyy HH:mm') : '', v.validacao || 'pendente', v.assinadoEm ? 'Sim' : 'Não', rs.ambientes || c.ambientes + c.externos, rs.fotos || '', rs.pendencias || 0,
        r2_(c.area), r2_(c.areaClim), Math.round(c.btu), r2_(c.tr), r2_(c.kwAc), en.padrao || '', r2_(c.kwEntrada), r2_(c.kwMedido)]));
    } else if (conj === 'ambientes') {
      cols = baseCols.concat(['Local', 'Externo', 'Tipo', 'Identificação', 'Quantidade', 'Comprimento (m)', 'Largura (m)', 'Pé-direito (m)', 'Área unitária (m²)', 'Área total (m²)',
        'Fachadas', 'Aberturas (qtd)', 'Área de vidro (m²)', 'TUG (por un.)', 'Pontos de iluminação (por un.)', 'TUE (por un.)', 'Ventilação cruzada']);
      amb.forEach(a => {
        const au = dec_(a.c) * dec_(a.l), q = Number(a.qtd) || 1;
        const ab = aberturas_(a);
        const vidro = ab.reduce((s, x) => s + (ABERTURA_VIDRO_[x.tipo || 'Janela'] ? dec_(x.larg) * dec_(x.alt) * (Number(x.qtd) || 1) : 0), 0);
        linhas.push(base(v).concat([local(a), a.externo ? 'Sim' : 'Não', tipo(a), a.nome || '', q, dec_(a.c), dec_(a.l), dec_(a.pd), r2_(au), r2_(au * q), (a.fachadas || []).join(', '),
          ab.reduce((s, x) => s + (Number(x.qtd) || 0), 0), r2_(vidro), Number(a.tug) || 0, (a.lum || []).reduce((s, l) => s + (Number(l.qtd) || 0), 0),
          (a.tue || []).filter(t => Number(t.qtd)).map(t => t.qtd + '× ' + t.nome).join(', '), a.ventCruz ? 'Sim' : 'Não']));
      });
    } else if (conj === 'aberturas') {
      cols = baseCols.concat(['Local', 'Ambiente', 'Tipo', 'Modelo', 'Vidro', 'Largura (m)', 'Altura (m)', 'Peitoril (m)', 'Quantidade', 'Área (m²)', '% abertura', 'Fachada', 'Proteção solar']);
      amb.forEach(a => aberturas_(a).forEach(x => linhas.push(base(v).concat([local(a), a.nome || tipo(a), x.tipo || 'Janela', x.modelo || '', x.vidro || '', dec_(x.larg), dec_(x.alt), dec_(x.peit),
        Number(x.qtd) || 0, r2_(dec_(x.larg) * dec_(x.alt) * (Number(x.qtd) || 1)), x.abert || '', x.fachada || '', x.protecao || '']))));
    } else if (conj === 'pontos') {
      cols = baseCols.concat(['Local', 'Ambiente', 'Qtd ambientes', 'Categoria', 'Descrição', 'Lâmpadas por luminária', 'Pontos por ambiente', 'Pontos no total']);
      amb.forEach(a => {
        const q = Number(a.qtd) || 1;
        if (Number(a.tug)) linhas.push(base(v).concat([local(a), a.nome || tipo(a), q, 'TUG', 'Tomada de uso geral', '', Number(a.tug), Number(a.tug) * q]));
        (a.lum || []).forEach(l => { if (Number(l.qtd)) linhas.push(base(v).concat([local(a), a.nome || tipo(a), q, 'Iluminação', l.nome || '', Number(l.lamp) || 1, Number(l.qtd), Number(l.qtd) * q])); });
        (a.tue || []).forEach(t => { if (Number(t.qtd)) linhas.push(base(v).concat([local(a), a.nome || tipo(a), q, 'TUE', t.nome || '', '', Number(t.qtd), Number(t.qtd) * q])); });
      });
    } else if (conj === 'equipamentos') {
      cols = baseCols.concat(['Equipamento', 'Quantidade', 'Potência nominal', 'Unidade', 'Potência total (W)', 'Desconhecido/inacessível']);
      ((et.equipamentos || {}).itens || []).forEach(x => linhas.push(base(v).concat([x.nome, Number(x.qtd) || 1, x.desc ? '' : x.pot, x.un || '', x.desc ? '' : Math.round(cvParaW_(x.pot, x.un) * (Number(x.qtd) || 1)), x.desc ? 'Sim' : 'Não'])));
    } else if (conj === 'entrada') {
      cols = baseCols.concat(['Padrão', 'Tipo de entrada', 'Fornecimento', 'Tensão', 'Caixa medição', 'Nº medidor', 'Proteção', 'Disjuntor geral (A)', 'Transformador (kVA)', 'Aterramento',
        'Resistência (Ω)', 'Neutro', 'Cabo fase', 'Cabo neutro', 'Cabo terra', 'Corrente R (A)', 'Corrente S (A)', 'Corrente T (A)', 'Quadros (total)', 'Vagas livres', 'DR em todos os blocos', 'Aterramento dos quadros']);
      const en = et.entrada || {}, m = en.med || {}, cb = en.cabos || {}, el = ((et.eletrica || {}).blocos || []);
      linhas.push(base(v).concat([en.padrao || '', en.tipoEntrada || '', en.fases || '', en.padrao === 'MT' ? en.tensaoMT : en.tensao, (en.cx1 || {}).tipo || '', en.medidor || (en.cx1 || {}).medidor || '',
        en.padrao === 'MT' ? en.protecaoMT : (en.cx2 || {}).protecao || '', (en.cx2 || {}).disjuntor || '', (en.trafo || {}).kva || '', en.aterr || '', en.resist || '', en.neutro || '',
        cb.fase || '', cb.neutro || '', cb.terra || '', m.ir || '', m.is || '', m.it || '', el.reduce((s, b) => s + (Number(b.quadros) || 0), 0), el.reduce((s, b) => s + (Number(b.vagas) || 0), 0),
        el.length && el.every(b => b.dr === 'Sim') ? 'Sim' : 'Não', el.map(b => b.aterr || '—').join(' / ')]));
    } else if (conj === 'predim') {
      cols = baseCols.concat(['Local', 'Ambiente', 'Tipo', 'Quantidade', 'Área unitária (m²)', 'Fator (BTU/h·m²)', 'Ajustes', 'Carga unitária (BTU/h)', 'Capacidade comercial (BTU/h)', 'TR total']);
      preDimensionamento_(et, cfg).linhas.forEach(l => linhas.push(base(v).concat([l.local, l.nome, l.tipo, l.qtd, r2_(l.areaUn), l.fator, l.ajustes, l.btuUn, l.cap, r2_(l.tr)])));
    } else if (conj === 'pendencias') {
      cols = baseCols.concat(['Etapa', 'Descrição', 'Status', 'Criada em', 'Resolvida em']);
      Db.where('Pendencias', x => x.vistoriaId === v.id).forEach(x => linhas.push(base(v).concat([rotuloEtapa_(x.etapa), x.descricao, x.status, fmtData_(x.criadoEm), x.resolvidoEm ? fmtData_(x.resolvidoEm) : ''])));
    } else if (conj === 'fotos') {
      cols = baseCols.concat(['Etapa', 'Item', 'Legenda', 'Data', 'Latitude', 'Longitude', 'Link']);
      Db.where('Fotos', x => x.vistoriaId === v.id).forEach(x => linhas.push(base(v).concat([rotuloEtapa_(x.etapa), rotuloFoto_(x), x.legenda || '', fmtData_(x.criadoEm, 'dd/MM/yyyy HH:mm'),
        x.lat, x.lng, 'https://drive.google.com/file/d/' + x.fileId + '/view'])));
    }
  });
  if (!cols.length) cols = baseCols;
  return { colunas: cols, linhas: linhas };
}
function r2_(n) { return Math.round((Number(n) || 0) * 100) / 100; }
function num0_(v) { return v === '' || v === null || v === undefined ? '' : Number(v); }

/* ───────────────────────── Assistente de roteiro ───────────────────────── */

/** Escolas que ainda precisam de visita (com coordenadas e prioridade SME) para montar roteiros. */
function acaoCandidatos_(p, u) {
  exigir_(u, 'programacao.editar');
  const hoje = hoje_();
  const es = escolasPermitidas_(u, false);
  const st = statusEscolas_(es);
  const rot = Db.where('Roteiro', r => r.data >= hoje && (r.status === 'agendada' || r.status === 'retorno'));
  const eqs = {}; equipesPermitidas_(u).forEach(e => { eqs[e.id] = e; });
  return {
    escolas: es.filter(e => st[e.id] !== 'concluida' && st[e.id] !== 'andamento').map(e => {
      const r = rot.filter(x => x.escolaId === e.id).sort((a, b) => a.data < b.data ? -1 : 1)[0];
      return { id: e.id, nome: e.nome, dre: e.dre, bairro: e.bairro, lat: Number(e.lat) || null, lng: Number(e.lng) || null, situacao: st[e.id],
        ambientes: Number(e.ambientesPrevistos) || 0, area: Number(e.areaAmbientes) || 0, tempMax: Number(e.tempMax) || null, ordemSme: Number(e.ordemSme) || null,
        programada: r && r.data ? { data: r.data, hora: r.hora, equipe: (eqs[r.equipeId] || {}).nome || '' } : null };
    }),
    equipes: Object.keys(eqs).map(id => ({ id: id, nome: eqs[id].nome, dres: lista_(eqs[id].dres), base: eqs[id].baseLat ? { nome: eqs[id].baseNome, lat: Number(eqs[id].baseLat), lng: Number(eqs[id].baseLng) } : null }))
  };
}

/**
 * Salva o roteiro de um dia (ordem e horários) para uma equipe.
 * substituir: tira do dia as visitas agendadas da equipe que não estão na lista.
 */
function acaoSalvarRoteiro_(p, u) {
  exigir_(u, 'programacao.editar');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.data || '')) throw new Error('Informe a data.');
  if (!equipesPermitidas_(u).some(e => e.id === p.equipeId)) throw new Error('Escolha uma equipe do seu escopo.');
  const itens = p.itens || [];
  itens.forEach(i => exigirEscola_(i.escolaId, u));
  const doDia = Db.where('Roteiro', r => r.equipeId === p.equipeId && r.data === p.data && r.status === 'agendada');
  if (p.substituir) doDia.filter(r => !itens.some(i => i.escolaId === r.escolaId)).forEach(r => Db.remove('Roteiro', r.id));
  itens.forEach((i, k) => {
    const ex = doDia.find(r => r.escolaId === i.escolaId) || Db.where('Roteiro', r => r.escolaId === i.escolaId && r.status === 'retorno' && r.equipeId === p.equipeId)[0];
    Db.upsert('Roteiro', Object.assign(ex || { id: 'r-' + uid_(), status: 'agendada', tipo: 'visita', criadoPor: u.id }, {
      data: p.data, hora: i.hora || '', horaFim: i.horaFim || '', equipeId: p.equipeId, escolaId: i.escolaId, ordem: k + 1, nota: i.nota !== undefined ? i.nota : (ex && ex.nota) || ''
    }));
    const e = Db.find('Escolas', i.escolaId);
    if (e && e.status !== 'concluida' && e.status !== 'retorno') Db.upsert('Escolas', { id: e.id, status: 'agendada' });
  });
  log_(u.id, 'roteiro', { equipe: p.equipeId, data: p.data, escolas: itens.length });
  return { ok: true, total: itens.length };
}

/** Orçamentos visíveis ao usuário: uma linha por orçamento, com a última revisão e valores por grupo. */
function tabelaOrcamentos_(u, f) {
  if (!pode_(u, 'orcamentos.ver') && !pode_(u, 'orcamentos.elaborar')) exigir_(u, 'orcamentos.ver');
  const m = mapasOrc_();
  const revs = {};
  Db.all('OrcRevisoes').forEach(r => { revs[r.id] = r; });
  let l = orcamentosVisiveis_(u, false);
  if (f.dre) l = l.filter(o => (m.esc[o.escolaId] || {}).dre === f.dre);
  if (f.empresaId) l = l.filter(o => o.empresaId === f.empresaId);
  if (f.status) l = l.filter(o => o.status === f.status);
  const cols = ['Vistoria', 'Código EOL/CIE', 'Escola', 'DRE', 'Empresa', 'Status do orçamento', 'Orçamentista', 'Atribuído em', 'Prazo', 'Atrasado', 'Revisão atual']
    .concat(GRUPOS_ORC_.map(g => g[1] + ' (R$)')).concat(['Valor total (R$)', 'Aprovado por', 'Aprovado em', 'Último parecer', 'Documentos']);
  const linhas = l.map(o => {
    const e = m.esc[o.escolaId] || {}, v = m.vist[o.vistoriaId] || {}, r = revs[o.id + '-v' + o.versaoAtual] || {};
    const atrasado = o.prazo && o.prazo < hoje_() && ['em_andamento', 'revisao'].indexOf(o.status) >= 0;
    return [v.codigo || '', e.cie || '', e.nome || o.escolaId, e.dre || '', (m.emp[o.empresaId] || {}).nome || '', STATUS_ORC_[o.status] || o.status, (m.usr[o.responsavelId] || {}).nome || '',
      o.atribuidoEm ? fmtData_(o.atribuidoEm, 'dd/MM/yyyy') : '', o.prazo ? fmtData_(o.prazo + 'T12:00:00', 'dd/MM/yyyy') : '', atrasado ? 'Sim' : 'Não', Number(o.versaoAtual) || 0]
      .concat(GRUPOS_ORC_.map(g => r2_(Number(r[g[0]]) || 0))).concat([r2_(Number(o.valor) || 0), (m.usr[o.aprovadoPor] || {}).nome || '',
        o.aprovadoEm ? fmtData_(o.aprovadoEm, 'dd/MM/yyyy') : '', r.parecer || '', historico_(r.arquivos).map(a => a.url).join(' ')]);
  });
  return { colunas: cols, linhas: linhas };
}


/* ════════════════════ Orcamentos.gs ════════════════════ */

/**
 * VistAR · Gestão de orçamentos.
 *
 * Vistoria finalizada → Aguardando atribuição → (gestor atribui) Em elaboração
 *   → (orçamentista envia revisão com documentos e valores) Em aprovação
 *   → (gestor aprova) Orçamento finalizado   |   (gestor devolve) Em revisão → nova revisão …
 * Cada envio é uma revisão (v1, v2…) com valores por grupo, documentos no Drive e parecer.
 */

const STATUS_ORC_ = {
  aguardando: 'Aguardando atribuição', em_andamento: 'Em elaboração', em_aprovacao: 'Em aprovação',
  revisao: 'Em revisão', finalizado: 'Orçamento finalizado', cancelado: 'Cancelado'
};
const GRUPOS_ORC_ = [['valorAc', 'Climatização (equipamentos e instalação)'], ['valorEletrica', 'Adequação elétrica'], ['valorCivil', 'Obras civis e complementares'], ['valorOutros', 'Outros']];

/** Vê o orçamento: escola no escopo e, para quem só elabora, apenas os atribuídos a ele. */
function podeVerOrc_(u, o) {
  if (!pode_(u, 'orcamentos.ver') && !pode_(u, 'orcamentos.elaborar')) return false;
  if (!escolasPermitidas_(u, true).some(e => e.id === o.escolaId)) return false;
  if (pode_(u, 'orcamentos.atribuir') || pode_(u, 'orcamentos.aprovar')) return true;
  return o.responsavelId === u.id || (perfilDe_(u).escopo !== 'equipe' && pode_(u, 'orcamentos.ver') && !pode_(u, 'orcamentos.elaborar'));
}

/**
 * Garante um orçamento para a última vistoria finalizada de cada escola.
 * Se uma nova vistoria da mesma escola é finalizada (retorno), o orçamento antigo ainda não iniciado é substituído.
 */
function sincronizarOrcamentos_() {
  const porVistoria = {}, porEscola = {};
  Db.all('Orcamentos').forEach(o => { porVistoria[o.vistoriaId] = o; (porEscola[o.escolaId] = porEscola[o.escolaId] || []).push(o); });
  const ultima = {};
  Db.where('Vistorias', v => v.status === 'finalizada').forEach(v => { if (!ultima[v.escolaId] || String(v.checkout) > String(ultima[v.escolaId].checkout)) ultima[v.escolaId] = v; });
  Object.keys(ultima).forEach(k => {
    const v = ultima[k];
    if (porVistoria[v.id]) return;
    const e = Db.find('Escolas', v.escolaId) || {};
    const emp = empresaDaEscola_(e);
    (porEscola[v.escolaId] || []).forEach(o => {
      if (o.status === 'aguardando') Db.upsert('Orcamentos', { id: o.id, status: 'cancelado', atualizadoEm: agora_(), historico: historicoOrc_(o, 'cancelado', 'Substituído: nova vistoria ' + (v.codigo || '') + ' finalizada') });
      else if (o.status !== 'cancelado') Db.upsert('Orcamentos', { id: o.id, atualizadoEm: agora_(), historico: historicoOrc_(o, o.status, 'Atenção: nova vistoria ' + (v.codigo || '') + ' finalizada para esta escola') });
    });
    Db.upsert('Orcamentos', { id: 'orc-' + v.id, vistoriaId: v.id, escolaId: v.escolaId, empresaId: emp ? emp.id : '', status: 'aguardando', versaoAtual: '0',
      criadoEm: agora_(), atualizadoEm: agora_(), historico: JSON.stringify([{ em: agora_(), status: 'aguardando', nota: 'Vistoria finalizada · disponível para orçamento' }]) });
  });
}

function historicoOrc_(o, status, nota, u) {
  const h = historico_(o.historico);
  h.push({ em: agora_(), status: status, nota: nota || '', por: u ? u.nome : '' });
  return JSON.stringify(h.slice(-60));
}

function resumoOrc_(o, mapas) {
  const e = mapas.esc[o.escolaId] || {};
  const v = mapas.vist[o.vistoriaId] || {};
  return {
    id: o.id, vistoriaId: o.vistoriaId, codigo: v.codigo || '', escolaId: o.escolaId, escola: e.nome || o.escolaId, dre: e.dre || '', empresa: (mapas.emp[o.empresaId] || {}).nome || '',
    status: o.status, statusNome: STATUS_ORC_[o.status], responsavelId: o.responsavelId || '', responsavel: (mapas.usr[o.responsavelId] || {}).nome || '',
    prazo: o.prazo || '', valor: Number(o.valor) || 0, versao: Number(o.versaoAtual) || 0, vistoriaEm: v.checkout || '', atualizadoEm: o.atualizadoEm,
    atrasado: !!(o.prazo && o.prazo < hoje_() && ['em_andamento', 'revisao'].indexOf(o.status) >= 0)
  };
}
function mapasOrc_() {
  const m = { esc: {}, vist: {}, emp: {}, usr: {} };
  Db.all('Escolas').forEach(x => { m.esc[x.id] = x; });
  Db.all('Vistorias').forEach(x => { m.vist[x.id] = x; });
  Db.all('Empresas').forEach(x => { m.emp[x.id] = x; });
  Db.all('Usuarios').forEach(x => { m.usr[x.id] = x; });
  return m;
}

/** sincronizar: só em ações com trava (lock) — os painéis apenas leem. */
function orcamentosVisiveis_(u, sincronizar) {
  if (sincronizar) sincronizarOrcamentos_();
  return Db.all('Orcamentos').filter(o => podeVerOrc_(u, o));
}

function acaoOrcamentos_(p, u) {
  if (!pode_(u, 'orcamentos.ver') && !pode_(u, 'orcamentos.elaborar')) exigir_(u, 'orcamentos.ver');
  const m = mapasOrc_();
  const l = orcamentosVisiveis_(u, true).map(o => resumoOrc_(o, m)).sort((a, b) => String(b.atualizadoEm).localeCompare(a.atualizadoEm));
  const cont = {};
  Object.keys(STATUS_ORC_).forEach(k => { cont[k] = 0; });
  l.forEach(o => { cont[o.status] = (cont[o.status] || 0) + 1; });
  return {
    itens: l, contagem: cont, status: STATUS_ORC_,
    totais: { finalizado: l.filter(o => o.status === 'finalizado').reduce((s, o) => s + o.valor, 0), emAprovacao: l.filter(o => o.status === 'em_aprovacao').reduce((s, o) => s + o.valor, 0) },
    podeAtribuir: pode_(u, 'orcamentos.atribuir'), podeAprovar: pode_(u, 'orcamentos.aprovar'), podeElaborar: pode_(u, 'orcamentos.elaborar')
  };
}

/** Orçamentistas que este gestor pode escolher (perfil com "elaborar orçamentos", no escopo). */
function orcamentistas_(u) {
  return usuariosPermitidos_(u).filter(x => x.ativo !== 'nao' && pode_(x, 'orcamentos.elaborar')).map(x => ({ id: x.id, nome: x.nome, empresaId: x.empresaId }));
}

function exigirOrc_(id, u) {
  const busca = () => Db.find('Orcamentos', id) || Db.where('Orcamentos', x => x.vistoriaId === id)[0];
  const o = busca() || (sincronizarOrcamentos_(), busca());
  if (!o || !podeVerOrc_(u, o)) throw new Error('Orçamento não encontrado ou fora do seu acesso.');
  return o;
}

function acaoOrcamento_(p, u) {
  const o = exigirOrc_(p.id, u);
  const m = mapasOrc_();
  const revs = Db.where('OrcRevisoes', r => r.orcamentoId === o.id).sort((a, b) => Number(b.versao) - Number(a.versao)).map(r => ({
    id: r.id, versao: Number(r.versao), status: r.status, valor: Number(r.valor) || 0, grupos: GRUPOS_ORC_.map(g => [g[1], Number(r[g[0]]) || 0]), notas: r.notas,
    arquivos: historico_(r.arquivos), enviadoPor: (m.usr[r.enviadoPor] || {}).nome || '', enviadoEm: r.enviadoEm, parecer: r.parecer, parecerPor: (m.usr[r.parecerPor] || {}).nome || '', parecerEm: r.parecerEm
  }));
  let tecnico = null;
  try {
    const et = {};
    const raw = lerEtapas_(o.vistoriaId);
    Object.keys(raw).forEach(k => { et[k] = raw[k].dados || {}; });
    const c = preDimensionamento_(et, getConfig_());
    tecnico = { area: c.area, areaClim: c.areaClim, tr: c.tr, kwAc: c.kwAc, ambientes: c.ambientes, externos: c.externos, kwEntrada: c.kwEntrada, suporta: c.entradaSuporta, padrao: (et.entrada || {}).padrao || '' };
  } catch (e) { console.warn(e); }
  const souResp = o.responsavelId === u.id;
  return Object.assign(resumoOrc_(o, m), {
    historico: historico_(o.historico).reverse(), revisoes: revs, tecnico: tecnico, grupos: GRUPOS_ORC_, observacao: o.observacao || '',
    aprovadoPor: (m.usr[o.aprovadoPor] || {}).nome || '', aprovadoEm: o.aprovadoEm || '',
    pode: {
      atribuir: pode_(u, 'orcamentos.atribuir') && ['aguardando', 'em_andamento', 'revisao'].indexOf(o.status) >= 0,
      elaborar: pode_(u, 'orcamentos.elaborar') && (souResp || pode_(u, 'orcamentos.atribuir')) && ['em_andamento', 'revisao'].indexOf(o.status) >= 0,
      aprovar: pode_(u, 'orcamentos.aprovar') && o.status === 'em_aprovacao',
      reabrir: pode_(u, 'orcamentos.aprovar') && o.status === 'finalizado'
    },
    orcamentistas: pode_(u, 'orcamentos.atribuir') ? orcamentistas_(u) : []
  });
}

function acaoAtribuirOrcamento_(p, u) {
  exigir_(u, 'orcamentos.atribuir');
  const o = exigirOrc_(p.id, u);
  if (['aguardando', 'em_andamento', 'revisao'].indexOf(o.status) < 0) throw new Error('Este orçamento não pode ser atribuído agora (' + STATUS_ORC_[o.status] + ').');
  const resp = orcamentistas_(u).find(x => x.id === p.responsavelId);
  if (!resp) throw new Error('Escolha um orçamentista do seu escopo.');
  const novo = o.status === 'aguardando' ? 'em_andamento' : o.status;
  Db.upsert('Orcamentos', { id: o.id, responsavelId: resp.id, atribuidoPor: u.id, atribuidoEm: agora_(), prazo: p.prazo || '', status: novo, atualizadoEm: agora_(),
    historico: historicoOrc_(o, novo, 'Atribuído a ' + resp.nome + (p.prazo ? ' · prazo ' + fmtData_(p.prazo + 'T12:00:00') : ''), u) });
  avisarOrc_(Db.find('Usuarios', resp.id), 'Novo orçamento atribuído', o, 'Você recebeu o orçamento da <b>' + esc_((Db.find('Escolas', o.escolaId) || {}).nome) + '</b>' + (p.prazo ? ', com prazo em ' + fmtData_(p.prazo + 'T12:00:00') : '') + '.');
  log_(u.id, 'orc_atribuir', { orcamento: o.id, responsavel: resp.id });
  return { ok: true };
}

/** Documento do orçamento (planilha, PDF…) na pasta da empresa: Orçamentos/<escola>/v<n>. */
function acaoUploadDocOrcamento_(p, u) {
  const o = exigirOrc_(p.id, u);
  if (!(pode_(u, 'orcamentos.elaborar') && (o.responsavelId === u.id || pode_(u, 'orcamentos.atribuir')))) throw new Error('Só o orçamentista responsável envia documentos.');
  const b64 = String(p.data || '').replace(/^data:[^,]+,/, '');
  if (b64.length > 20 * 1024 * 1024 * 4 / 3) throw new Error('Arquivo grande demais (máximo 20 MB).');
  const e = Db.find('Escolas', o.escolaId) || {};
  const emp = Db.find('Empresas', o.empresaId);
  const pasta = subpasta_(subpasta_(subpasta_(emp ? pastaEmpresa_(emp) : pastaRaiz_(), 'Orçamentos'), e.nome || o.escolaId), 'v' + ((Number(o.versaoAtual) || 0) + 1));
  const nome = String(p.nome || 'documento').replace(/[\\/:*?"<>|]+/g, '_');
  const arq = pasta.createFile(Utilities.newBlob(Utilities.base64Decode(b64), p.mime || 'application/octet-stream', nome));
  return { fileId: arq.getId(), nome: nome, url: arq.getUrl(), mime: p.mime || '', bytes: arq.getSize() };
}

function acaoEnviarOrcamento_(p, u) {
  const o = exigirOrc_(p.id, u);
  if (!(pode_(u, 'orcamentos.elaborar') && (o.responsavelId === u.id || pode_(u, 'orcamentos.atribuir')))) throw new Error('Só o orçamentista responsável envia o orçamento.');
  if (['em_andamento', 'revisao'].indexOf(o.status) < 0) throw new Error('Este orçamento não está em elaboração.');
  const v = p.valores || {};
  const reg = { orcamentoId: o.id };
  let total = 0;
  GRUPOS_ORC_.forEach(g => { const n = Math.max(0, dec_(v[g[0]])); reg[g[0]] = n; total += n; });
  if (!total) throw new Error('Informe os valores do orçamento.');
  if (!(p.arquivos || []).length) throw new Error('Anexe pelo menos um documento do orçamento.');
  const versao = (Number(o.versaoAtual) || 0) + 1;
  Db.upsert('OrcRevisoes', Object.assign(reg, { id: o.id + '-v' + versao, versao: versao, valor: total, notas: p.notas || '', arquivos: JSON.stringify(p.arquivos), status: 'em_analise',
    enviadoPor: u.id, enviadoEm: agora_() }));
  Db.upsert('Orcamentos', { id: o.id, versaoAtual: String(versao), valor: total, status: 'em_aprovacao', atualizadoEm: agora_(),
    historico: historicoOrc_(o, 'em_aprovacao', 'Revisão v' + versao + ' enviada · ' + moeda_(total), u) });
  Db.all('Usuarios').filter(x => x.ativo !== 'nao' && x.id !== u.id && nivelDe_(x) <= NIVEIS_.diretoria && pode_(x, 'orcamentos.aprovar') &&
    (perfilDe_(x).escopo === 'tudo' || !o.empresaId || x.empresaId === o.empresaId))
    .slice(0, 10).forEach(g => avisarOrc_(g, 'Orçamento para aprovação', o, esc_(u.nome) + ' enviou a revisão v' + versao + ' do orçamento da <b>' + esc_((Db.find('Escolas', o.escolaId) || {}).nome) + '</b>: <b>' + moeda_(total) + '</b>.'));
  log_(u.id, 'orc_enviar', { orcamento: o.id, versao: versao, valor: total });
  return { ok: true, versao: versao };
}

function acaoDecidirOrcamento_(p, u) {
  exigir_(u, 'orcamentos.aprovar');
  const o = exigirOrc_(p.id, u);
  if (p.decisao === 'reabrir') {
    if (o.status !== 'finalizado') throw new Error('Só orçamentos finalizados podem ser reabertos.');
    if (!p.parecer) throw new Error('Explique o motivo da reabertura.');
    Db.upsert('Orcamentos', { id: o.id, status: 'revisao', atualizadoEm: agora_(), historico: historicoOrc_(o, 'revisao', 'Reaberto: ' + p.parecer, u) });
    avisarOrc_(Db.find('Usuarios', o.responsavelId), 'Orçamento reaberto', o, 'O orçamento foi reaberto para revisão: ' + esc_(p.parecer));
    return { ok: true };
  }
  if (o.status !== 'em_aprovacao') throw new Error('Este orçamento não está aguardando aprovação.');
  if (['aprovar', 'devolver'].indexOf(p.decisao) < 0) throw new Error('Decisão inválida.');
  if (p.decisao === 'devolver' && !p.parecer) throw new Error('Descreva o que precisa ser revisto.');
  const rev = Db.find('OrcRevisoes', o.id + '-v' + o.versaoAtual);
  if (rev) Db.upsert('OrcRevisoes', { id: rev.id, status: p.decisao === 'aprovar' ? 'aprovada' : 'devolvida', parecer: p.parecer || '', parecerPor: u.id, parecerEm: agora_() });
  const novo = p.decisao === 'aprovar' ? 'finalizado' : 'revisao';
  Db.upsert('Orcamentos', { id: o.id, status: novo, atualizadoEm: agora_(), aprovadoPor: novo === 'finalizado' ? u.id : '', aprovadoEm: novo === 'finalizado' ? agora_() : '',
    historico: historicoOrc_(o, novo, (novo === 'finalizado' ? 'Aprovado · v' : 'Devolvido para revisão · v') + o.versaoAtual + (p.parecer ? ' · ' + p.parecer : ''), u) });
  avisarOrc_(Db.find('Usuarios', o.responsavelId), novo === 'finalizado' ? 'Orçamento aprovado' : 'Orçamento devolvido para revisão', o,
    novo === 'finalizado' ? 'A revisão v' + o.versaoAtual + ' foi aprovada. Orçamento finalizado.' : 'A revisão v' + o.versaoAtual + ' foi devolvida: ' + esc_(p.parecer));
  log_(u.id, 'orc_decidir', { orcamento: o.id, decisao: p.decisao });
  return { ok: true, status: novo };
}

function avisarOrc_(dest, assunto, o, html) {
  if (!dest || !/@/.test(dest.email)) return;
  try {
    const url = ScriptApp.getService().getUrl() || '';
    MailApp.sendEmail({ to: dest.email, name: 'VistAR · ' + getConfig_().CONSORCIO, subject: '[VistAR] ' + assunto,
      htmlBody: '<div style="font-family:Arial,sans-serif;color:#0F1E36"><p>Olá, ' + esc_(dest.nome) + '.</p><p>' + html + '</p>' + (url ? '<p><a href="' + url + '">Abrir o VistAR</a> › Orçamentos</p>' : '') + '</div>' });
  } catch (e) { console.warn(e); }
}

function moeda_(n) { return 'R$ ' + fmtNum_(n, 2); }

/** Resumo para os painéis (contagem por status e valores). */
function resumoOrcamentos_(u, escolasIds) {
  if (!pode_(u, 'orcamentos.ver') && !pode_(u, 'orcamentos.elaborar')) return null;
  let l = orcamentosVisiveis_(u, false);
  if (escolasIds) l = l.filter(o => escolasIds[o.escolaId]);
  const cont = {};
  Object.keys(STATUS_ORC_).forEach(k => { cont[k] = 0; });
  l.forEach(o => { cont[o.status] = (cont[o.status] || 0) + 1; });
  const soma = st => l.filter(o => o.status === st).reduce((s, o) => s + (Number(o.valor) || 0), 0);
  return { total: l.length, cont: cont, nomes: STATUS_ORC_, valorFinalizado: soma('finalizado'), valorEmAprovacao: soma('em_aprovacao'),
    atrasados: l.filter(o => o.prazo && o.prazo < hoje_() && ['em_andamento', 'revisao'].indexOf(o.status) >= 0).length };
}

/** Situação do orçamento de uma vistoria (para o detalhe da vistoria), se o usuário puder vê-lo. */
function orcamentoDaVistoria_(vistoriaId, u) {
  try {
    const o = Db.where('Orcamentos', x => x.vistoriaId === vistoriaId)[0];
    if (!o || !podeVerOrc_(u, o)) return null;
    return { id: o.id, status: o.status, nome: STATUS_ORC_[o.status], valor: Number(o.valor) || 0, versao: Number(o.versaoAtual) || 0 };
  } catch (e) { return null; }
}


/* ════════════════════ DadosIniciais.gs ════════════════════ */

/**
 * VistAR · Carga inicial: 131 EMEFs priorizadas para climatização (4 DREs).
 * Fonte: listas SME (ilhas de calor) + Portal de Dados Abertos da Prefeitura de SP
 * (cadastro de escolas 2025 e ambientes das unidades 2026). Use o menu
 * VistAR › Carregar escolas iniciais (ou a função carregarEscolasIniciais).
 */

const DRES_INICIAIS_ = [{"sigla": "JT", "nome": "Jaçanã/Tremembé"}, {"sigla": "FB", "nome": "Freguesia/Brasilândia"}, {"sigla": "PJ", "nome": "Pirituba/Jaraguá"}, {"sigla": "BT", "nome": "Butantã"}];

const CAMPOS_ESCOLAS_INICIAIS_ = ["id", "dreSigla", "ordemSme", "eol", "tipo", "nome", "tempMax", "obsSme", "logradouro", "numero", "bairro", "cep", "distrito", "subprefeitura", "telefone", "telefone2", "salas", "areaSalas", "g1Qtd", "g1Area", "g2Qtd", "g2Area", "g3Qtd", "g3Area", "labs", "leitura", "auditorio", "ambientesPrevistos", "areaAmbientes", "padraoConstrutivo", "inep", "lat", "lng", "notas"];

const ESCOLAS_INICIAIS_ = [
  ["eol-94901", "JT", 1, "94901", "EMEF", "Edson Rodrigues", 32.29, "", "Rua Filadelfo Gouveia Neto", "131", "Vila Constanca", "02256-090", "Tucuruvi", "Santana/Tucuruvi", "(11) 2242-9022", "(11) 2240-7117", 14, 490, 17, 586, 2, 96, 5, 134, 1, 1, 0, 60, 2889, "Alvenaria", "35054422", -23.473217, -46.587131, ""],
  ["eol-94684", "JT", 2, "94684", "EMEF", "Marcos Melega", 32.19, "", "Rua Mont Blanc", "98", "Lauzane Paulista", "02440-010", "Mandaqui", "Santana/Tucuruvi", "(11) 2231-1020", "(11) 2233-7748", 14, 625, 17, 745, 2, 95, 4, 192, 1, 1, 0, 49, 4247, "Alvenaria", "35053752", -23.476427, -46.64674, ""],
  ["eol-19631", "JT", 3, "19631", "EMEF", "Nilce Cruz Figueiredo, Profa.", 32.12, "", "Avenida Coronel Manuel Py", "168", "Lauzane Paulista", "02442-090", "Mandaqui", "Santana/Tucuruvi", "(11) 2233-6379", "(11) 2232-6988", 15, 516, 17, 606, 2, 90, 4, 99, 1, 1, 0, 53, 2941, "Alvenaria", "35249750", -23.472888, -46.644878, ""],
  ["eol-94731", "JT", 4, "94731", "EMEF", "Esmeralda Salles Pereira Ramos, Profa.", 32.12, "", "Rua Maria Amalia Lopes Azevedo", "2167", "Jardim Yara", "02350-002", "Tremembe", "Jacana/Tremembe", "(11) 2204-6339", "(11) 2994-0997", 11, 385, 15, 500, 2, 82, 4, 113, 2, 1, 0, 50, 1413, "Alvenaria", "35054501", -23.457649, -46.604469, ""],
  ["eol-19727", "JT", 5, "19727", "EMEF", "Cassio da Costa Vidigal", 32.03, "", "Rua Muniz Ferreira", "121", "Jardim Joamar", "02321-170", "Tremembe", "Jacana/Tremembe", "", "", 10, 420, 10, 420, 0, 0, 0, 0, 0, 0, 0, 10, 420, "Alvenaria", "35010294", -23.448095, -46.589537, "Cadastro de ambientes incompleto no EOL (só salas de aula registradas); Sem telefone no cadastro SME 2025"],
  ["eol-94871", "JT", 6, "94871", "EMEF", "Julio Marcondes Salgado, Gen.", 32, "", "Avenida Edu Chaves", "1289", "Parque Edu Chaves", "02229-001", "Jacana", "Jacana/Tremembe", "(11) 2249-7219", "", 16, 666, 20, 865, 1, 51, 4, 127, 2, 1, 0, 53, 3257, "Alvenaria", "35054458", -23.47827, -46.567879, ""],
  ["eol-19046", "JT", 7, "19046", "EMEF", "Celia Regina Lekevicius Consolin, Profa.", 31.95, "", "Rua Giuseppe Marino", "S/N", "Parque Novo Mundo", "02181-190", "Vila Maria", "Vila Maria/Vila Guilherme", "(11) 2967-3221", "(11) 2955-7255", 22, 703, 24, 786, 2, 83, 4, 120, 2, 1, 0, 53, 6290, "Alvenaria", "35223165", -23.517426, -46.556937, ""],
  ["eol-94951", "JT", 8, "94951", "EMEF", "Shirley Guio, Profa.", 31.81, "", "Rua Cristóvão Lins", "611", "Vila Isolina Mazzei", "02083-000", "Vila Medeiros", "Vila Maria/Vila Guilherme", "(11) 2949-9251", "(11) 2201-9779", 12, 420, 15, 495, 2, 157, 5, 163, 1, 1, 1, 49, 2177, "Alvenaria", "35054768", -23.495171, -46.596514, ""],
  ["eol-94919", "JT", 9, "94919", "EMEF", "Lourenco Filho", 31.74, "", "Rua São Geraldino", "212", "Vila Constanca", "02258-220", "Jacana", "Jacana/Tremembe", "(11) 2240-5088", "(11) 2249-1149", 15, 485, 18, 555, 1, 60, 5, 150, 1, 1, 0, 48, 1993, "Alvenaria", "35054471", -23.475511, -46.581933, ""],
  ["eol-94676", "JT", 10, "94676", "EMEF", "Adolpho Otto de Laet, Prof.", 31.69, "", "Rua Isidoro de Laet", "165", "Água Fria", "02408-030", "Santana", "Santana/Tucuruvi", "(11) 2973-8586", "(11) 2978-6301", 12, 532, 15, 627, 2, 181, 5, 146, 1, 1, 0, 42, 2668, "Alvenaria", "35053764", -23.481582, -46.626592, ""],
  ["eol-94811", "JT", 11, "94811", "EMEF", "Romao Gomes, Cel.", 31.54, "", "Rua Soldado Jose Vicente de Paula", "140", "Parque Novo Mundo", "02180-020", "Vila Maria", "Vila Maria/Vila Guilherme", "(11) 2954-0551", "(11) 2954-6525", 16, 545, 18, 600, 1, 35, 5, 87, 1, 1, 0, 54, 3071, "Alvenaria", "35054732", -23.521168, -46.565964, ""],
  ["eol-94714", "JT", 12, "94714", "EMEF", "Noe Azevedo, Prof", 31.31, "", "Rua Sao Cleto", "165", "Jardim Denise", "02375-000", "Tremembe", "Jacana/Tremembe", "(11) 2203-9875", "(11) 2991-5068", 14, 714, 18, 844, 2, 102, 4, 141, 2, 1, 0, 49, 3847, "Alvenaria", "35054549", -23.457964, -46.62493, ""],
  ["eol-94838", "JT", 13, "94838", "EMEF", "Pedro I, D.", 31.28, "", "Praca Presidente Jânio da Silva Quadros", "420", "Jardim Japão", "02132-000", "Vila Maria", "Vila Maria/Vila Guilherme", "(11) 2201-7173", "(11) 2989-9769", 12, 558, 14, 650, 1, 48, 5, 123, 1, 1, 0, 39, 5171, "Alvenaria", "35054744", -23.500476, -46.583089, ""],
  ["eol-19745", "JT", 14, "19745", "EMEF", "Julio Maia", 31.24, "", "Rua Sobral Júnior", "234", "Vila Maria Alta", "02130-020", "Vila Maria", "Vila Maria/Vila Guilherme", "", "", 10, 444, 12, 491, 0, 0, 4, 80, 1, 0, 0, 33, 5591, "Alvenaria", "35010882", -23.506028, -46.586025, "Sem telefone no cadastro SME 2025"],
  ["eol-94820", "JT", 15, "94820", "EMEF", "Joao Domingues Sampaio", 31.24, "", "Rua Gastão Madeira", "386", "Vila Maria Alta", "02131-080", "Vila Maria", "Vila Maria/Vila Guilherme", "(11) 2954-0862", "(11) 2954-4822", 15, 505, 17, 561, 2, 163, 4, 120, 1, 1, 0, 58, 5524, "Alvenaria", "35054756", -23.506258, -46.584532, ""],
  ["eol-94790", "JT", 16, "94790", "EMEF", "Helena Lombardi Braga, Profa.", 31.05, "", "Rua Dirce", "106", "Vila Leonor", "02077-080", "Vila Guilherme", "Vila Maria/Vila Guilherme", "(11) 2901-6711", "(11) 2909-6687", 13, 440, 16, 526, 2, 81, 6, 144, 2, 1, 0, 49, 1887, "Alvenaria", "35054616", -23.502731, -46.598004, ""],
  ["eol-94765", "JT", 17, "94765", "EMEF", "Maximo de Moura Santos, Prof.", 30.95, "", "Rua Julia Lopes de Almeida", "275", "Vila Pauliceia", "02301-000", "Santana", "Santana/Tucuruvi", "(11) 2973-2776", "(11) 2973-7834", 12, 405, 15, 474, 2, 80, 5, 55, 1, 1, 0, 49, 5467, "Alvenaria", "35054525", -23.489517, -46.61371, ""],
  ["eol-94757", "JT", 18, "94757", "EMEF", "Rondon, Mal.", 30.91, "", "Rua do Buruí", "120", "Parque Casa de Pedra", "02320-170", "Tremembe", "Jacana/Tremembe", "(11) 2991-0823", "", 15, 525, 17, 605, 2, 87, 5, 99, 1, 1, 0, 46, 2551, "Alvenaria", "35054483", -23.447844, -46.595121, ""],
  ["eol-94889", "JT", 19, "94889", "EMEF", "Antonio Sant Ana Galvao, Frei", 30.91, "", "Rua General Jeronimo Furtado", "715", "Jardim Modelo", "02237-000", "Jacana", "Jacana/Tremembe", "(11) 2241-8945", "(11) 2241-7328", 12, 576, 15, 660, 2, 128, 4, 113, 2, 1, 0, 43, 3081, "Alvenaria", "35054446", -23.464322, -46.569547, ""],
  ["eol-94846", "JT", 20, "94846", "EMEF", "Tamandare, Alm.", 30.88, "", "Rua General Mendes", "46", "Vila Maria Alta", "02127-020", "Vila Maria", "Vila Maria/Vila Guilherme", "(11) 2954-4645", "(11) 2954-7977", 15, 497, 17, 600, 3, 94, 4, 140, 1, 1, 0, 44, 6829, "Alvenaria", "35054719", -23.500611, -46.591369, ""],
  ["eol-94722", "JT", 21, "94722", "EMEF", "Joao Ramos - Pernambuco - Abolicionista", 30.82, "", "Rua Joao Nicolau Chamma", "253", "Jardim Virginia Bianca", "02355-060", "Tremembe", "Jacana/Tremembe", "(11) 2953-4414", "(11) 2203-8575", 12, 622, 16, 750, 2, 134, 4, 115, 2, 1, 0, 54, 4315, "Alvenaria", "35054461", -23.454721, -46.610927, ""],
  ["eol-99091", "JT", 22, "99091", "EMEF", "Hipolito Jose da Costa", 30.73, "", "Rua Augusto Rodrigues", "272", "Jardim Fontalis", "02360-010", "Tremembe", "Jacana/Tremembe", "(11) 2992-8011", "(11) 2995-6693", 21, 940, 24, 1025, 1, 50, 4, 92, 1, 1, 0, 48, 2303, "Alvenaria", "35095606", -23.438007, -46.57732, ""],
  ["eol-19753", "JT", 23, "19753", "EMEF", "Luzia Godoy, Profa.", 30.72, "", "Rua Ausonia", "143", "Vila Mazzei", "02308-050", "Tucuruvi", "Santana/Tucuruvi", "", "", 10, 521, 14, 692, 1, 49, 6, 136, 1, 1, 0, 48, 2540, "Alvenaria", "35010888", -23.47656, -46.606392, "Sem telefone no cadastro SME 2025"],
  ["eol-94897", "JT", 24, "94897", "EMEF", "Octavio Pereira Lopes", 30.64, "", "Rua Alcy Borges dos Santos", "242", "Guapira", "02276-020", "Jacana", "Jacana/Tremembe", "(11) 2241-2815", "", 17, 595, 21, 710, 2, 126, 5, 178, 2, 1, 0, 51, 2923, "Alvenaria", "35054495", -23.461404, -46.584695, ""],
  ["eol-94706", "JT", 25, "94706", "EMEF", "Gastao Moutinho, Cte.", 30.36, "", "Rua Coronel Joao da Silva Feijo", "40", "Parque Mandaqui", "02422-200", "Mandaqui", "Santana/Tucuruvi", "(11) 2231-0074", "(11) 2231-3788", 15, 660, 18, 802, 2, 90, 5, 145, 1, 1, 0, 50, 2665, "Alvenaria", "35053739", -23.468686, -46.6394, ""],
  ["eol-19726", "JT", 26, "19726", "EMEF", "Maria Paula Marcondes Domingues, Profa.", 29.71, "", "Rua Manuel Morais Pontes", "395", "Vila Albertina", "02373-000", "Tremembe", "Jacana/Tremembe", "", "", 7, 282, 7, 282, 1, 33, 0, 0, 0, 1, 0, 8, 315, "Alvenaria", "35010293", -23.454104, -46.619791, "Sem telefone no cadastro SME 2025"],
  ["eol-19401", "JT", 27, "19401", "EMEF", "Jardim Fontalis", 29.17, "", "Rua Crisântemo", "100", "Jardim Flor de Maio", "02363-155", "Tremembe", "Jacana/Tremembe", "(11) 2206-8938", "(11) 2267-3052", 19, 619, 21, 649, 1, 30, 4, 65, 1, 1, 0, 39, 744, "Alvenaria", "35400087", -23.431835, -46.574576, ""],
  ["eol-94285", "JT", 28, "94285", "EMEF", "Raul de Leoni", 28.74, "", "Avenida Jose da Rocha Viana", "44", "Vila Pedra Branca", "02635-090", "Mandaqui", "Santana/Tucuruvi", "(11) 2231-9330", "", 16, 784, 20, 957, 2, 186, 6, 142, 2, 1, 1, 50, 3318, "Alvenaria", "35054884", -23.457708, -46.643396, ""],
  ["eol-302", "JT", 29, "302", "EMEF", "Helio Franco Chaves, Cel.", 27.67, "", "Rua Kotinda", "1343", "Jardim Corisco", "02365-010", "Tremembe", "Jacana/Tremembe", "(11) 2995-2513", "(11) 2992-7707", 13, 488, 16, 579, 1, 43, 5, 80, 1, 1, 0, 45, 2743, "Alvenaria", "35098371", -23.428244, -46.582907, ""],
  ["eol-94226", "FB", 1, "94226", "EMEF", "Raul Fernandes, Emb.", 32.03, "Consta na lista de ilhas de calor da SMS-COVISA", "Rua Nair Ramos Schuring", "158", "Vila Brasilandia", "02845-040", "Brasilandia", "Freguesia/Brasilandia", "(11) 3925-0507", "(11) 3921-1033", 17, 612, 20, 748, 1, 64, 5, 199, 2, 1, 0, 62, 3374, "Alvenaria", "35053077", -23.469221, -46.690582, ""],
  ["eol-94366", "FB", 2, "94366", "EMEF", "Garcia Davila, Cte.", 32.02, "Consta na lista de ilhas de calor da SMS-COVISA", "Rua Armando Coelho Silva", "859", "Parque Peruche", "02539-000", "Casa Verde", "Casa Verde/Cachoeirinha", "(11) 2239-1667", "(11) 2239-0065", 16, 712, 19, 810, 2, 112, 5, 122, 2, 1, 0, 45, 3003, "Alvenaria", "35053348", -23.491455, -46.654747, ""],
  ["eol-91804", "FB", 3, "91804", "EMEF", "Paulo Nogueira Filho", 31.86, "", "Rua Brazelisa Alves de Carvalho", "356", "Vila Baruel", "02510-030", "Casa Verde", "Casa Verde/Cachoeirinha", "(11) 3858-1892", "(11) 3966-4317", 13, 598, 16, 694, 2, 104, 4, 80, 1, 1, 0, 53, 2426, "Alvenaria", "35053375", -23.512318, -46.650367, ""],
  ["eol-94315", "FB", 4, "94315", "EMEF", "Pedro Americo", 31.85, "", "Rua Vicente Jorge", "100", "Vila Bancaria Munhoz", "02759-100", "Freguesia do o", "Freguesia/Brasilandia", "(11) 3923-4650", "", 15, 675, 19, 765, 2, 90, 4, 88, 2, 1, 0, 49, 2663, "Alvenaria", "35053582", -23.481727, -46.678149, ""],
  ["eol-94293", "FB", 5, "94293", "EMEF", "Osvaldo Quirino Simoes", 31.78, "", "Rua Camilo Pecanha 10", "10", "Vila Dionísia", "02670-030", "Cachoeirinha", "Casa Verde/Cachoeirinha", "(11) 3851-5329", "(11) 3859-4349", 16, 800, 20, 932, 3, 195, 5, 131, 2, 1, 1, 58, 4280, "Alvenaria", "35054896", -23.465628, -46.661843, ""],
  ["eol-94170", "FB", 6, "94170", "EMEF", "Plinio Ayrosa", 31.75, "", "Rua Tomás Ramos Jordão", "259", "Parque Monteiro Soares", "02736-000", "Freguesia do o", "Freguesia/Brasilandia", "(11) 3992-5917", "(11) 3975-3074", 17, 799, 19, 864, 2, 80, 5, 163, 1, 1, 0, 49, 2788, "Alvenaria", "35053120", -23.489544, -46.691644, ""],
  ["eol-94188", "FB", 7, "94188", "EMEF", "Joaninha Grassi Fagundes, Profa.", 31.73, "", "Rua Alberto Andaló", "36", "Parque São Luís", "02840-080", "Freguesia do o", "Freguesia/Brasilandia", "(11) 3924-0067", "(11) 3923-4464", 13, 635, 16, 754, 1, 70, 5, 118, 2, 1, 0, 49, 2730, "Alvenaria", "35053090", -23.48261, -46.687665, ""],
  ["eol-94331", "FB", 8, "94331", "EMEF", "Humberto Dantas", 31.7, "Consta na lista de ilhas de calor da SMS-COVISA", "Rua Manoel Dias do Campo", "464", "Casa Verde Alta", "02564-010", "Limao", "Casa Verde/Cachoeirinha", "(11) 3966-6947", "(11) 3857-2522", 14, 731, 18, 847, 2, 126, 5, 96, 2, 1, 0, 48, 4812, "Alvenaria", "35053363", -23.486114, -46.670905, ""],
  ["eol-19721", "FB", 9, "19721", "EMEF", "Jose Carlos Dias, Prof.", 31.67, "", "Rua Vichy", "488", "Vila Baruel", "02522-100", "Casa Verde", "Casa Verde/Cachoeirinha", "", "", 10, 520, 13, 612, 1, 67, 6, 88, 1, 1, 0, 36, 1945, "Alvenaria", "35010286", -23.50413, -46.660029, "Sem telefone no cadastro SME 2025"],
  ["eol-94251", "FB", 10, "94251", "EMEF", "Sebastiao Nogueira de Lima, Des.", 31.64, "Consta na lista de ilhas de calor da SMS-COVISA", "Rua Joaquina Maria dos Santos", "177", "Vila Rica", "02860-110", "Brasilandia", "Freguesia/Brasilandia", "(11) 3984-9509", "", 18, 913, 20, 990, 2, 103, 6, 108, 1, 1, 0, 62, 2895, "Alvenaria", "35053065", -23.471027, -46.673869, ""],
  ["eol-94382", "FB", 11, "94382", "EMEF", "Cecilia Moraes de Vasconcelos, Profa.", 31.58, "", "Rua Rômulo Naldi", "147", "Conjunto Promorar Estrada da Parada", "02873-250", "Brasilandia", "Freguesia/Brasilandia", "(11) 3851-4356", "(11) 3859-5482", 16, 817, 19, 911, 2, 94, 5, 94, 1, 1, 0, 54, 2602, "Alvenaria", "35090585", -23.45537, -46.684846, ""],
  ["eol-19350", "FB", 12, "19350", "EMEF", "Jose Herminio Rodrigues, Cel. Pm", 31.49, "", "Rua Pedro Pomar", "S/N", "Jardim Elisa Maria", "02875-020", "Brasilandia", "Freguesia/Brasilandia", "(11) 3983-3670", "(11) 3983-3836", 16, 613, 18, 702, 2, 91, 6, 142, 1, 1, 0, 63, 7935, "Alvenaria", "35354715", -23.461374, -46.681399, ""],
  ["eol-19458", "FB", 13, "19458", "EMEF", "Maria Aparecida Rodrigues Cintra, Profa.", 31.33, "", "Rua Arauazinho", "S/N", "Vila Marina", "02967-160", "Freguesia do o", "Freguesia/Brasilandia", "(11) 3978-7717", "", 13, 637, 16, 752, 3, 147, 5, 123, 1, 2, 0, 53, 2571, "Alvenaria", "35443219", -23.482719, -46.703477, ""],
  ["eol-94307", "FB", 14, "94307", "EMEF", "Frederico Gustavo dos Santos, Tte. Aviador", 31.24, "", "Avenida General Penha Brasil", "139", "Vila Angelica", "02673-000", "Cachoeirinha", "Casa Verde/Cachoeirinha", "(11) 3851-5820", "(11) 3851-5633", 15, 750, 19, 890, 1, 82, 4, 150, 2, 1, 0, 47, 4670, "Alvenaria", "35054902", -23.470039, -46.666729, ""],
  ["eol-19405", "FB", 15, "19405", "EMEF", "Gilberto Dupas, Prof", 31.2, "", "Avenida Deputado Emílio Carlos", "3871", "Limão", "02720-200", "Cachoeirinha", "Casa Verde/Cachoeirinha", "(11) 3983-1621", "(11) 3983-1611", 13, 624, 14, 676, 1, 52, 4, 100, 1, 1, 0, 49, 2447, "Alvenaria", "35419977", -23.475105, -46.668977, ""],
  ["eol-19394", "FB", 16, "19394", "EMEF", "Caira Alayde Alvarenga Medea, Profa", 31.2, "", "Rua Xavier da Silva Ferrão", "317", "Sítio Morro Grande", "02808-000", "Freguesia do o", "Freguesia/Brasilandia", "(11) 3993-1550", "(11) 3979-7980", 13, 600, 15, 684, 3, 133, 4, 107, 1, 2, 0, 55, 2394, "Alvenaria", "35399930", -23.469086, -46.700422, ""],
  ["eol-94234", "FB", 17, "94234", "EMEF", "Theo Dutra", 31.1, "Consta na lista de ilhas de calor da SMS-COVISA", "Avenida Guilherme de Almeida", "110", "Vila Penteado", "02866-040", "Brasilandia", "Freguesia/Brasilandia", "(11) 3851-8820", "", 18, 691, 22, 809, 1, 50, 4, 89, 1, 1, 0, 53, 2737, "Alvenaria", "35053119", -23.467061, -46.680765, ""],
  ["eol-94692", "FB", 18, "94692", "EMEF", "Marcilio Dias", 30.83, "", "Rua Ribeiro Junqueira", "259", "Vila Roque", "02473-010", "Cachoeirinha", "Casa Verde/Cachoeirinha", "(11) 3984-6967", "(11) 3981-3334", 15, 624, 18, 691, 1, 72, 4, 65, 1, 1, 0, 53, 2488, "Alvenaria", "35053740", -23.478987, -46.654063, ""],
  ["eol-19720", "FB", 19, "19720", "EMEF", "Osmar Bastos Conceicao, Prof.", 30.81, "", "Rua Pinheiro de Faria", "40", "Jardim Maristela", "02806-040", "Freguesia do o", "Freguesia/Brasilandia", "", "", 8, 392, 10, 499, 1, 62, 4, 65, 1, 1, 0, 33, 1425, "Alvenaria", "35010284", -23.474862, -46.700334, "Sem telefone no cadastro SME 2025"],
  ["eol-299", "FB", 20, "299", "EMEF", "Roberto Patricio, Prof.", 30.75, "", "Rua Antonio Domingues Freitas", "147", "Vila Amelia", "02615-020", "Cachoeirinha", "Casa Verde/Cachoeirinha", "(11) 2258-6078", "", 8, 403, 9, 467, 1, 15, 5, 86, 1, 1, 0, 38, 2249, "Alvenaria", "35098358", -23.471774, -46.654797, ""],
  ["eol-19341", "FB", 21, "19341", "EMEF", "Jardim Guarani - Jose Alfredo Apolinario, Prof.", 30.74, "Consta na lista de ilhas de calor da SMS-COVISA", "Rua Santana do Aracuai", "190", "Jardim Guarani", "02849-130", "Brasilandia", "Freguesia/Brasilandia", "(11) 3924-5136", "(11) 3924-5271", 17, 850, 19, 937, 2, 92, 4, 92, 1, 1, 0, 48, 1533, "Alvenaria", "35300317", -23.462583, -46.689754, ""],
  ["eol-94161", "FB", 22, "94161", "EMEF", "Nilo Pecanha, Pres.", 30.68, "", "Rua Eneias Luis Carlos Barbanti", "660", "Vila Arcádia", "02911-000", "Freguesia do o", "Freguesia/Brasilandia", "(11) 3931-6212", "(11) 3932-2970", 9, 348, 11, 433, 1, 75, 4, 112, 1, 1, 0, 46, 3143, "Alvenaria", "35053600", -23.503835, -46.700662, ""],
  ["eol-19742", "FB", 23, "19742", "EMEF", "Dalila de Andrade Costa, Profa.", 30.39, "", "Rua Arroio do Meio", "S/N", "Jardim Vista Alegre", "02878-120", "Brasilandia", "Freguesia/Brasilandia", "", "", 10, 480, 12, 544, 0, 0, 4, 107, 1, 0, 0, 26, 1020, "Alvenaria", "35010858", -23.4528, -46.685974, "Sem telefone no cadastro SME 2025"],
  ["eol-19704", "FB", 24, "19704", "EMEF", "Primo Pascoli Melare, Prof.", 30.16, "", "Avenida Inajar de Souza", "6975", "Jardim Peri", "02675-070", "Brasilandia", "Freguesia/Brasilandia", "(11) 3982-8396", "(11) 3984-2202", 17, 817, 19, 907, 1, 41, 5, 151, 1, 1, 0, 55, 4174, "Alvenaria", "35249749", -23.451203, -46.675307, ""],
  ["eol-19395", "FB", 25, "19395", "EMEF", "Neir Augusto Lopes, Prof", 30.03, "", "Rua Jornalista Octávio Ribeiro Pena Branca", "20", "Vila Bela Vista Zona Norte", "02617-140", "Cachoeirinha", "Casa Verde/Cachoeirinha", "(11) 2208-1011", "(11) 2208-0700", 16, 784, 18, 833, 2, 84, 4, 83, 2, 1, 0, 58, 1842, "Alvenaria", "35389389", -23.463462, -46.659823, ""],
  ["eol-19402", "FB", 26, "19402", "EMEF", "Zilka Salaberry de Carvalho", 29.68, "", "Rua Antônio da Franca e Horta", "35", "Jardim Peri", "02652-110", "Cachoeirinha", "Casa Verde/Cachoeirinha", "(11) 2235-5657", "(11) 2258-1001", 17, 806, 20, 895, 1, 49, 4, 134, 1, 1, 0, 54, 2055, "Alvenaria", "35242299", -23.457478, -46.658245, ""],
  ["eol-19349", "FB", 27, "19349", "EMEF", "Jardim Damasceno I - Professor Joao Antonio Fei", 29.33, "", "Avenida Deputado Cantídio Sampaio", "4798", "Vila Souza", "02860-001", "Brasilandia", "Freguesia/Brasilandia", "(11) 3974-2869", "", 11, 539, 13, 635, 2, 192, 4, 69, 1, 1, 1, 46, 1797, "Alvenaria", "35354685", -23.446499, -46.703941, "Nome truncado na lista original da SME"],
  ["eol-19462", "FB", 28, "19462", "EMEF", "Lilian Maso, Profa", null, "", "Rua Encruzilhada do Sul", "1005", "Jardim Paulistano Zona Norte", "02816-010", "Brasilandia", "Freguesia/Brasilandia", "(11) 3974-1365", "(11) 3974-1138", 14, 560, 17, 640, 2, 90, 4, 89, 1, 1, 0, 53, 2791, "Alvenaria", "35445526", -23.461634, -46.709548, "Temperatura \"NA\" na lista da SME"],
  ["eol-94421", "PJ", 1, "94421", "EMEF", "Liberato Bittencourt, Gen.", 31.62, "", "Rua Arnaldo Alvernaz Nunes", "320", "Jardim Sao Jose", "02969-100", "Pirituba", "Pirituba", "(11) 3975-4857", "", 18, 938, 19, 978, 1, 68, 5, 122, 1, 1, 0, 49, 6021, "Alvenaria", "35053673", -23.485386, -46.713093, ""],
  ["eol-92835", "PJ", 2, "92835", "EMEF", "Espiridiao Rosas, Mal.", 31.61, "", "Rua Guimarães Rosa", "115", "Vila Lageado", "05338-080", "Jaguare", "Lapa", "(11) 3768-2898", "", 14, 686, 17, 741, 1, 49, 5, 108, 1, 1, 0, 45, 2782, "Alvenaria", "35053247", -23.553271, -46.752882, ""],
  ["eol-19229", "PJ", 3, "19229", "EMEF", "Josue de Castro, Prof", 31.61, "", "Rua Jose Soeiro de Vaz", "362", "Jardim Marisa", "05108-130", "Jaguara", "Lapa", "(11) 3621-3737", "(11) 3622-8266", 15, 735, 18, 824, 2, 89, 5, 140, 1, 1, 0, 60, 3232, "Alvenaria", "35271032", -23.507711, -46.758754, ""],
  ["eol-94536", "PJ", 4, "94536", "EMEF", "Jairo Ramos", 31.56, "", "Rua General Lauro Cavalcanti de Farias", "438", "Jardim Mangalot", "05135-000", "Sao Domingos", "Pirituba", "(11) 3904-0863", "", 16, 732, 19, 815, 1, 65, 5, 174, 1, 1, 0, 41, 3095, "Alvenaria", "35054641", -23.490156, -46.746813, ""],
  ["eol-19215", "PJ", 5, "19215", "EMEF", "Remo Rinaldi Naddeo, Prof.", 31.32, "", "Rua Dionísio Bellante", "487", "Jardim Santa Fe Zona Oeste", "05271-150", "Anhanguera", "Perus", "(11) 3911-7746", "(11) 3911-7772", 15, 708, 16, 757, 1, 49, 5, 158, 1, 1, 0, 43, 2540, "Alvenaria", "35271019", -23.432489, -46.794255, ""],
  ["eol-94501", "PJ", 6, "94501", "EMEF", "Paulo Prado", 31.32, "", "Rua Pompeu Bertini", "80", "Jardim Santa Fe", "05271-110", "Anhanguera", "Perus", "(11) 3911-0639", "(11) 3916-6203", 12, 600, 13, 680, 1, 80, 5, 102, 1, 1, 0, 40, 2638, "Alvenaria", "35054653", -23.429883, -46.792823, ""],
  ["eol-94579", "PJ", 7, "94579", "EMEF", "Jose Ferraz de Campos, Prof.", 31.24, "", "Rua Pauva", "644", "Vila Jaguara", "05116-001", "Jaguara", "Lapa", "(11) 3621-2646", "(11) 3625-1792", 11, 517, 14, 625, 1, 76, 5, 97, 1, 1, 0, 49, 2056, "Alvenaria", "35054677", -23.513886, -46.746997, ""],
  ["eol-94412", "PJ", 8, "94412", "EMEF", "Gabriel Prestes, Prof.", 31.19, "", "Rua Carlos da Cunha Mattos", "134", "Chácara Inglesa", "05140-040", "Pirituba", "Pirituba", "(11) 3904-7571", "(11) 3903-6952", 11, 539, 13, 606, 3, 95, 4, 151, 1, 1, 0, 50, 2386, "Alvenaria", "35053727", -23.48915, -46.726234, ""],
  ["eol-19224", "PJ", 9, "19224", "EMEF", "Milena Benedicto, Profa", 30.92, "", "Avenida Felippo Sturba", "25", "Jardim Anhangüera", "05267-200", "Anhanguera", "Perus", "(11) 3911-2577", "(11) 3916-5364", 16, 784, 18, 858, 2, 104, 4, 91, 1, 1, 0, 49, 3872, "Alvenaria", "35233882", -23.438592, -46.78879, ""],
  ["eol-94595", "PJ", 10, "94595", "EMEF", "Silvio Portugal, Des.", 30.88, "", "Rua Francisco Saverio Orlandi", "141", "Jardim Libano", "05138-100", "Pirituba", "Pirituba", "(11) 3904-6039", "(11) 3904-8722", 13, 637, 16, 698, 1, 44, 5, 107, 1, 1, 0, 44, 1840, "Alvenaria", "35053661", -23.486465, -46.734005, ""],
  ["eol-19233", "PJ", 11, "19233", "EMEF", "Edgard Carone", 30.78, "", "Rua Elisa Dina", "293", "Jardim Britania", "05269-060", "Anhanguera", "Perus", "(11) 3911-1658", "(11) 3911-3068", 7, 294, 8, 336, 1, 42, 3, 53, 1, 1, 0, 23, 1691, "Alvenaria", "35275013", -23.433445, -46.790857, ""],
  ["eol-540", "PJ", 12, "540", "EMEF", "Raul Pompeia", 30.75, "", "Avenida Elias Antonio Lopes", "165", "Parque de Taipas", "02986-110", "Jaragua", "Pirituba", "(11) 3941-5771", "(11) 3941-5024", 12, 504, 15, 564, 1, 42, 5, 102, 1, 1, 0, 44, 2198, "Alvenaria", "35066266", -23.433769, -46.713867, ""],
  ["eol-94447", "PJ", 13, "94447", "EMEF", "Renato Antonio Checchia, Prof.", 30.75, "", "Rua Conde Monterone", "101", "Jardim Sydney", "02982-190", "Pirituba", "Pirituba", "(11) 3972-0345", "(11) 3979-3633", 15, 675, 19, 755, 1, 49, 4, 97, 2, 1, 0, 40, 3509, "Alvenaria", "35055529", -23.455217, -46.716877, ""],
  ["eol-93122", "PJ", 14, "93122", "EMEF", "Jose Maria Pinto Duarte, Tte.", 30.63, "", "Rua Atalaia", "100", "Sumare", "01251-060", "Perdizes", "Lapa", "(11) 3873-6283", "", 13, 521, 16, 576, 1, 70, 4, 58, 1, 1, 0, 41, 1262, "Alvenaria", "35053659", -23.546166, -46.676247, ""],
  ["eol-19414", "PJ", 15, "19414", "EMEF", "Moises Elias de Souza, Tte.", 30.62, "", "Avenida Deputado Cantídio Sampaio", "6590", "Vila Souza", "02860-001", "Jaragua", "Pirituba", "(11) 3942-0171", "(11) 3941-9300", 15, 750, 17, 750, 1, 0, 6, 0, 1, 1, 0, 42, 1350, "Alvenaria", "35433718", -23.43488, -46.716675, "Metragem zerada em parte dos ambientes no EOL"],
  ["eol-93106", "PJ", 16, "93106", "EMEF", "Dilermando Dias dos Santos", 30.56, "", "Rua Paulo Franco", "815", "Vila Leopoldina", "05305-031", "Vila Leopoldina", "Lapa", "(11) 3641-5258", "(11) 3835-4187", 14, 654, 17, 748, 1, 72, 4, 114, 1, 1, 0, 57, 2514, "Alvenaria", "35053521", -23.535874, -46.723799, ""],
  ["eol-94587", "PJ", 17, "94587", "EMEF", "Gabriel Sylvestre Teixeira de Carvalho, Prof.", 30.36, "", "Rua Coronel Albino Rego", "132", "Parque Maria Domitila", "05128-030", "Sao Domingos", "Pirituba", "(11) 3904-6042", "(11) 3904-9023", 13, 604, 16, 697, 1, 61, 4, 82, 1, 1, 0, 46, 2180, "Alvenaria", "35053697", -23.495793, -46.739098, ""],
  ["eol-94561", "PJ", 18, "94561", "EMEF", "Euclides Custodio da Silveira, Des.", 30.33, "", "Rua Jose de Morais", "191", "Parque Sao Domingos", "05121-060", "Sao Domingos", "Pirituba", "(11) 3832-2138", "", 13, 587, 16, 689, 1, 76, 4, 107, 1, 1, 0, 38, 2916, "Alvenaria", "35054636", -23.506663, -46.731357, ""],
  ["eol-19020", "PJ", 19, "19020", "EMEF", "Jairo de Almeida, Prof.", 30.28, "", "Rua Recanto dos Humildes", "S/N", "Conjunto Habitacional Recanto dos Humild", "05209-000", "Perus", "Perus", "(11) 3917-2538", "", 14, 660, 17, 728, 2, 218, 4, 106, 1, 1, 1, 50, 2605, "Alvenaria", "35223141", -23.409972, -46.750663, ""],
  ["eol-19487", "PJ", 20, "19487", "EMEF", "Chacara Turistica", 30.17, "", "Rua Agnes Fontoura", "87", "Conjunto Habitacional Turística", "05164-015", "Jaragua", "Pirituba", "(11) 3901-5870", "(11) 3902-2546", 14, 728, 18, 936, 1, 52, 5, 128, 2, 1, 0, 57, 2139, "Alvenaria", "35567048", -23.473434, -46.755221, ""],
  ["eol-94471", "PJ", 21, "94471", "EMEF", "Luiz David Sobrinho, Prof.", 30.1, "", "Rua Barra da Forquilha", "576", "Parque Panamericano", "02993-000", "Jaragua", "Pirituba", "(11) 3941-1994", "(11) 3941-0815", 17, 816, 20, 904, 1, 75, 6, 116, 1, 1, 0, 45, 2394, "Alvenaria", "35055517", -23.450993, -46.729542, ""],
  ["eol-94463", "PJ", 22, "94463", "EMEF", "Leonel Franca, Pe.", 30.08, "", "Rua Xavier dos Passaros", "39", "Jardim Rincao", "02991-100", "Jaragua", "Pirituba", "(11) 3941-3625", "(11) 3941-4831", 19, 922, 23, 1020, 2, 84, 5, 139, 2, 1, 0, 59, 3603, "Alvenaria", "35055542", -23.438699, -46.728156, ""],
  ["eol-94510", "PJ", 23, "94510", "EMEF", "Henrique Raymundo Dyott Fontenelle, Brig.", 29.9, "", "Rua Nossa Senhora da Conceicao", "384", "Jaragua", "05181-280", "Jaragua", "Pirituba", "(11) 3941-5033", "(11) 3941-2436", 12, 661, 16, 809, 1, 56, 4, 147, 2, 1, 0, 37, 2936, "Alvenaria", "35055499", -23.455974, -46.743286, ""],
  ["eol-19347", "PJ", 24, "19347", "EMEF", "Jardim da Conquista", 29.79, "", "Rua Recanto dos Humildes", "S/N", "Conjunto Habitacional Recanto dos Humild", "05209-000", "Perus", "Perus", "(11) 3917-3440", "", 8, 360, 10, 450, 1, 0, 4, 0, 1, 1, 0, 34, 450, "Alvenaria", "35346445", -23.41344, -46.75042, "Metragem zerada em parte dos ambientes no EOL"],
  ["eol-14249", "PJ", 25, "14249", "EMEF", "Ernesto de Moraes Leme, Prof.", 29.79, "", "Rua Vale das Flores", "120", "Jardim Santa Lucrecia", "05185-400", "Jaragua", "Pirituba", "(11) 3941-5020", "", 15, 735, 18, 806, 1, 68, 4, 150, 1, 1, 0, 47, 2857, "Alvenaria", "35062807", -23.444016, -46.746385, ""],
  ["eol-94498", "PJ", 26, "94498", "EMEF", "Candido Portinari", 29.78, "", "Rua Guilherme Correia de Melo", "408", "Perus", "05207-050", "Perus", "Perus", "(11) 3918-8761", "(11) 3917-0746", 11, 616, 15, 800, 2, 102, 4, 146, 2, 1, 0, 53, 3733, "Alvenaria", "35055530", -23.399614, -46.751673, ""],
  ["eol-16497", "PJ", 27, "16497", "EMEF", "Fernando Gracioso", 29.77, "", "Rua Silveirânia", "S/N", "Jardim Russo", "05211-060", "Perus", "Perus", "(11) 3917-1388", "(11) 3918-9191", 14, 680, 15, 728, 1, 50, 5, 134, 1, 1, 0, 42, 2700, "Alvenaria", "35201923", -23.409605, -46.760413, ""],
  ["eol-19757", "PJ", 28, "19757", "EMEF", "Felicia de Rinaldis Franco", 29.65, "", "Rua Campinorte", "58", "Jardim Sydney", "02981-040", "Pirituba", "Pirituba", "", "", 8, 406, 9, 406, 0, 0, 3, 67, 1, 0, 0, 22, 614, "Alvenaria", "35010865", -23.460773, -46.716215, "Sem telefone no cadastro SME 2025"],
  ["eol-19195", "PJ", 29, "19195", "EMEF", "Jose Kauffmann, Dr.", 29.53, "", "Rua Samuel Bovy", "23", "Jardim Rincao", "02998-120", "Jaragua", "Pirituba", "(11) 3944-1022", "(11) 3944-1024", 20, 915, 22, 984, 2, 199, 5, 196, 1, 1, 0, 56, 2470, "Alvenaria", "35249993", -23.439934, -46.732765, ""],
  ["eol-19732", "PJ", 30, "19732", "EMEF", "Reynaldo Porchat, Prof.", 29.49, "", "Rua dos Aliados", "540", "Alto da Lapa", "05082-000", "Lapa", "Lapa", "", "", 11, 528, 11, 528, 0, 0, 0, 0, 0, 0, 0, 11, 528, "Alvenaria", "35010300", -23.528385, -46.716334, "Cadastro de ambientes incompleto no EOL (só salas de aula registradas); Sem telefone no cadastro SME 2025"],
  ["eol-15431", "PJ", 31, "15431", "EMEF", "Ernani Silva Bruno", 29.32, "", "Rua Interativa", "100", "Vila Brasilândia", "02820-020", "Jaragua", "Pirituba", "(11) 3979-3351", "", 10, 339, 11, 388, 1, 49, 5, 106, 1, 1, 0, 35, 1567, "Alvenaria", "35200001", -23.446483, -46.709184, ""],
  ["eol-19607", "PJ", 32, "19607", "EMEF", "Antonio Rodrigues de Campos, Prof.", 29.28, "", "Rua Príncipe", "38", "Jardim Shangrila Zona Norte", "02990-120", "Jaragua", "Pirituba", "(11) 3942-4980", "(11) 3945-3885", 13, 616, 15, 657, 2, 87, 5, 120, 1, 1, 0, 37, 1829, "Alvenaria", "35248393", -23.428437, -46.728879, ""],
  ["eol-9326", "PJ", 33, "9326", "EMEF", "Irene Garcia Costa de Souza, Profa. Dra.", 29.21, "", "Rua Goncalo Aldana", "385", "Vila Homero", "05184-300", "Jaragua", "Pirituba", "(11) 3928-1920", "(11) 3941-1906", 7, 350, 8, 400, 1, 50, 6, 120, 1, 1, 0, 36, 1401, "Alvenaria", "35068639", -23.451038, -46.758412, ""],
  ["eol-10171", "PJ", 34, "10171", "EMEF", "Aldo Ribeiro Luz, Prof.", 29.14, "", "Rua Jean Coralli", "135", "Jardim Santa Lucrecia", "05183-000", "Jaragua", "Pirituba", "(11) 3941-5008", "(11) 3941-2335", 12, 626, 14, 714, 1, 46, 4, 86, 1, 1, 0, 38, 5845, "Alvenaria", "35068627", -23.451604, -46.75273, ""],
  ["eol-19463", "PJ", 35, "19463", "EMEF", "Estacao Jaragua", 29.07, "", "Rua João Aires", "S/N", "Jardim Bandeirantes Zona Norte", "02994-060", "Jaragua", "Pirituba", "(11) 3942-4200", "(11) 3942-5517", 12, 480, 16, 640, 2, 80, 5, 131, 2, 1, 0, 52, 3487, "Alvenaria", "35445502", -23.455955, -46.73763, ""],
  ["eol-19445", "PJ", 36, "19445", "EMEF", "Roge Ferreira, Dep.", 28.86, "", "Rua Philonilia Goncalves dos Santos", "S/N", "Jaragua", "02992-210", "Jaragua", "Pirituba", "(11) 3949-5366", "", 15, 630, 20, 794, 2, 84, 5, 138, 2, 1, 0, 49, 3297, "Alvenaria", "35243619", -23.445479, -46.731179, ""],
  ["eol-94552", "PJ", 37, "94552", "EMEF", "Amadeu Mendes, Prof.", 28.76, "", "Rua Tomas Lopes Ferreira", "110", "Parque Sao Domingos", "05125-090", "Sao Domingos", "Pirituba", "(11) 3904-4173", "", 12, 623, 14, 759, 2, 127, 4, 144, 2, 1, 0, 40, 2403, "Alvenaria", "35054665", -23.499952, -46.737975, ""],
  ["eol-19220", "PJ", 38, "19220", "EMEF", "Mario Lago", 28.58, "", "Rua Dourada", "S/N", "Cohab Jardim Paulistano", "02820-090", "Jaragua", "Pirituba", "(11) 3972-9229", "(11) 3972-5654", 14, 578, 16, 639, 2, 181, 6, 127, 1, 1, 1, 53, 1750, "Alvenaria", "35271073", -23.449415, -46.708067, ""],
  ["eol-19322", "PJ", 39, "19322", "EMEF", "City Jaragua IV", 28.48, "", "Rua Henrique Salvatori", "23", "Conjunto City Jaragua", "02998-260", "Jaragua", "Pirituba", "(11) 3941-0456", "(11) 3945-2033", 17, 833, 19, 930, 2, 96, 4, 91, 1, 1, 0, 50, 1750, "Alvenaria", "35286448", -23.437489, -46.736612, ""],
  ["eol-19412", "PJ", 40, "19412", "EMEF", "Badra", 28.4, "", "Rua Principal", "S/N", "Jardim da Conquista Zona Oeste", "05212-000", "Perus", "Perus", "(11) 3917-7437", "(11) 3917-8944", 19, 860, 22, 1009, 1, 70, 4, 81, 2, 1, 0, 53, 2685, "Alvenaria", "35419461", -23.420404, -46.749206, ""],
  ["eol-19217", "PJ", 41, "19217", "EMEF", "Recanto dos Humildes", 28.37, "", "Rua Argélia", "S/N", "Jardim da Conquista Zona Oeste", "05212-020", "Perus", "Perus", "(11) 3917-7804", "", 18, 756, 21, 838, 1, 35, 4, 67, 1, 1, 0, 42, 3667, "Alvenaria", "35271081", -23.417754, -46.748369, ""],
  ["eol-19733", "PJ", 42, "19733", "EMEF", "Virginia Valeria Aparecida de Almeida Freitas", 28.36, "", "Rua São Paulo", "184", "Residencial Sol Nascente", "05280-110", "Anhanguera", "Perus", "(11) 3945-0025", "", 10, 420, 10, 420, 0, 0, 0, 0, 0, 0, 0, 10, 420, "Alvenaria", "35010301", -23.436678, -46.774012, "Cadastro de ambientes incompleto no EOL (só salas de aula registradas)"],
  ["eol-94480", "PJ", 43, "94480", "EMEF", "Julio de Oliveira", 28.11, "", "Rua Julio de Oliveira", "160", "Vila Fanton", "05201-070", "Perus", "Perus", "(11) 3917-1328", "", 15, 764, 17, 876, 1, 64, 5, 104, 2, 1, 0, 46, 11355, "Alvenaria", "35055566", -23.402814, -46.73859, ""],
  ["eol-19218", "PJ", 44, "19218", "EMEF", "Jardim Monte Belo", 28.01, "", "Rua Palmeirópolis", "S/N", "Jardim Monte Belo", "05272-005", "Anhanguera", "Perus", "(11) 3911-7588", "", 10, 420, 11, 464, 1, 42, 5, 61, 1, 1, 0, 31, 1059, "Alvenaria", "35271020", -23.444254, -46.800671, ""],
  ["eol-19351", "PJ", 45, "19351", "EMEF", "Marili Dias, Profa", 27.71, "", "Rua Antonio Conselheiro", "1", "Vila dos Palmares", "05273-140", "Anhanguera", "Perus", "(11) 3916-3375", "(11) 3916-3376", 16, 775, 19, 830, 2, 98, 4, 134, 1, 1, 0, 51, 2529, "Alvenaria", "35355185", -23.440785, -46.807445, ""],
  ["eol-19314", "PJ", 46, "19314", "EMEF", "Philo Goncalves dos Santos, Profa", 27.05, "", "Rua Alagoa Nova", "S/N", "Perus", "05202-260", "Perus", "Perus", "(11) 3919-0442", "(11) 3919-0454", 16, 784, 20, 922, 1, 49, 5, 109, 2, 1, 0, 57, 2580, "Alvenaria", "35122063", -23.400839, -46.744995, ""],
  ["eol-92827", "BT", 1, "92827", "EMEF", "Alvaro Silva Braga, Gen.", 31.42, "", "Rua Padre Paulo Canelles", "611", "Vila Dalva", "05386-070", "Rio Pequeno", "Butanta", "(11) 3712-0676", "", 12, 672, 15, 791, 2, 96, 4, 137, 1, 1, 1, 39, 3326, "Alvenaria", "35053181", -23.564172, -46.764287, ""],
  ["eol-11924", "BT", 2, "11924", "EMEF", "Maria Alice Borges Ghion, Profa.", 31.41, "", "Rua Cachoeira Poraquê", "575", "Conjunto Promorar Raposo Tavares", "05574-450", "Raposo Tavares", "Butanta", "(11) 3782-9756", "", 13, 650, 18, 868, 2, 135, 5, 128, 3, 1, 0, 49, 3624, "Alvenaria", "35076181", -23.586959, -46.801039, ""],
  ["eol-92711", "BT", 3, "92711", "EMEF", "Deodoro da Fonseca, Mal.", 31.28, "", "Praca Imprensa Paulista", "30", "Caxingui", "05517-020", "Butanta", "Butanta", "(11) 3721-3843", "(11) 3722-4371", 16, 672, 20, 810, 1, 50, 6, 154, 2, 1, 0, 45, 2940, "Alvenaria", "35053235", -23.582733, -46.72403, ""],
  ["eol-99589", "BT", 4, "99589", "EMEF", "Pedro Nava", 31.26, "", "Rua Joaquina da Lapa", "453", "Jardim Ester Yolanda", "05374-070", "Rio Pequeno", "Butanta", "(11) 3782-8897", "", 9, 352, 13, 430, 2, 51, 4, 75, 1, 1, 0, 40, 1888, "Alvenaria", "35098486", -23.579398, -46.760101, ""],
  ["eol-99261", "BT", 5, "99261", "EMEF", "Teofilo Benedito Ottoni", 31.24, "", "Rua Inacio Cervantes", "490", "Parque Ype", "05572-000", "Raposo Tavares", "Butanta", "(11) 3782-8893", "", 11, 440, 14, 515, 1, 63, 5, 92, 1, 1, 0, 42, 2534, "Alvenaria", "35095709", -23.594518, -46.798045, ""],
  ["eol-19715", "BT", 6, "19715", "EMEF", "Adalgiza Segurado da Silveira, Profa.", 31.17, "", "Avenida Professor Gióia Martins", "686", "Jardim Monte Kemel", "05632-020", "Vila Sonia", "Butanta", "", "", 10, 420, 10, 420, 0, 0, 0, 0, 0, 0, 0, 10, 420, "Alvenaria", "35010230", -23.600898, -46.735345, "Cadastro de ambientes incompleto no EOL (só salas de aula registradas); Sem telefone no cadastro SME 2025"],
  ["eol-92720", "BT", 7, "92720", "EMEF", "Arthur Whitaker, Des.", 31.08, "", "Rua Andre Saraiva", "860", "Vila Sonia", "05626-000", "Vila Sonia", "Butanta", "(11) 3742-5772", "(11) 3771-5582", 11, 528, 14, 623, 1, 69, 5, 126, 1, 1, 0, 59, 4193, "Alvenaria", "35053156", -23.596402, -46.735918, ""],
  ["eol-19749", "BT", 8, "19749", "EMEF", "Adolfino de Arruda Castanho, Prof.", 31.07, "", "Rua Professora Ana Maria Lélis da Silva", "252", "Rio Pequeno", "05361-010", "Rio Pequeno", "Butanta", "", "", 12, 562, 14, 644, 2, 97, 6, 168, 1, 1, 0, 51, 2383, "Alvenaria", "35010854", -23.565815, -46.749124, "Sem telefone no cadastro SME 2025"],
  ["eol-99287", "BT", 9, "99287", "EMEF", "Vianna Moog", 30.95, "", "Rua Francisco Leite Esquerdo", "310", "Jardim Jaqueline", "05528-040", "Vila Sonia", "Butanta", "(11) 3751-1620", "(11) 3751-5579", 13, 594, 16, 739, 1, 60, 5, 91, 1, 1, 0, 61, 2172, "Alvenaria", "35098498", -23.594715, -46.754604, ""],
  ["eol-92746", "BT", 10, "92746", "EMEF", "Alipio Andrada Serpa, Tte.", 30.91, "", "Rua Nicolau Copérnico", "165", "Jardim Cláudia", "05546-110", "Raposo Tavares", "Butanta", "(11) 3782-4068", "", 13, 650, 16, 670, 1, 92, 7, 141, 1, 1, 0, 50, 1675, "Alvenaria", "35053284", -23.58834, -46.772909, ""],
  ["eol-92754", "BT", 11, "92754", "EMEF", "Alcides Goncalves Etchegoyen, Gen.", 30.85, "", "Rua Adherbal Stresser", "686", "Jardim Arpoador", "05566-000", "Raposo Tavares", "Butanta", "(11) 3782-1862", "(11) 3782-9744", 13, 728, 15, 793, 1, 40, 4, 98, 1, 1, 0, 44, 2515, "Alvenaria", "35053173", -23.594749, -46.791369, ""],
  ["eol-92771", "BT", 12, "92771", "EMEF", "Solano Trindade", 30.84, "", "Rua Gabriel de Carvalho", "60", "Jardim Boa Vista", "05583-080", "Raposo Tavares", "Butanta", "(11) 3781-1914", "(11) 3782-4889", 12, 588, 15, 727, 2, 90, 5, 84, 1, 1, 0, 50, 2938, "Alvenaria", "35083963", -23.584002, -46.79133, ""],
  ["eol-477", "BT", 13, "477", "EMEF", "Eda Terezinha Chica Medeiros, Profa.", 30.82, "", "Rua Engenheiro Hugo Takahashi", "333", "Raposo Tavares", "05563-120", "Raposo Tavares", "Butanta", "(11) 3782-0714", "", 11, 546, 14, 648, 1, 48, 5, 93, 1, 1, 0, 38, 2659, "Alvenaria", "35098474", -23.602076, -46.783825, ""],
  ["eol-191", "BT", 14, "191", "EMEF", "Alipio Correa Neto, Prof.", 30.72, "", "Avenida Joao Caiaffa", "140", "Jardim Taboao", "05742-100", "Vila Sonia", "Butanta", "(11) 5845-0121", "", 8, 464, 11, 539, 1, 58, 5, 72, 1, 1, 0, 35, 1321, "Alvenaria", "35098462", -23.612237, -46.749888, ""],
  ["eol-19417", "BT", 15, "19417", "EMEF", "Jardim Paulo VI", 30.71, "", "Rua Engenheiro Hugo Takahashi", "20", "Raposo Tavares", "05563-120", "Raposo Tavares", "Butanta", "", "", 16, 735, 19, 882, 1, 49, 5, 125, 2, 1, 0, 43, 2767, "Alvenaria", "35428848", -23.602771, -46.786377, "Sem telefone no cadastro SME 2025"],
  ["eol-19716", "BT", 16, "19716", "EMEF", "Luiz Cintra do Prado, Prof.", 30.26, "", "Rua Artur Ferreira de Abreu", "321", "Jardim Rosa Maria", "05547-150", "Raposo Tavares", "Butanta", "", "", 10, 420, 10, 420, 0, 0, 0, 0, 0, 0, 0, 10, 420, "Alvenaria", "35010231", -23.596185, -46.768729, "Cadastro de ambientes incompleto no EOL (só salas de aula registradas); Sem telefone no cadastro SME 2025"],
  ["eol-92738", "BT", 17, "92738", "EMEF", "Tarsila do Amaral", 30.22, "", "Rua Natal Pigassi", "787", "Jardim Celeste", "05527-000", "Vila Sonia", "Butanta", "(11) 3751-0223", "(11) 3751-5250", 12, 656, 15, 801, 2, 153, 6, 185, 1, 1, 0, 44, 2512, "Alvenaria", "35053272", -23.597878, -46.756771, ""],
  ["eol-19760", "BT", 18, "19760", "EMEF", "Maria Luisa Monteiro da Cunha, Bibliotecaria", 30.02, "", "Rua Inácio Manuel Álvares", "697", "Jardim Ester", "05372-111", "Rio Pequeno", "Butanta", "", "", 11, 516, 12, 541, 1, 26, 4, 95, 1, 1, 0, 38, 2617, "Alvenaria", "35010890", -23.580714, -46.765837, "Sem telefone no cadastro SME 2025"],
  ["eol-92851", "BT", 19, "92851", "EMEF", "Euclydes de Oliveira Figueiredo, Gen.", 29.58, "", "Rua Marechal Olimpio Mourao Filho", "187", "Cidade Sao Francisco", "05352-080", "Rio Pequeno", "Butanta", "(11) 3768-4542", "(11) 3766-4380", 14, 672, 17, 813, 2, 112, 6, 146, 1, 1, 0, 55, 4489, "Alvenaria", "35053193", -23.557431, -46.758491, ""],
  ["eol-92789", "BT", 20, "92789", "EMEF", "Luiz Eduardo Matarazzo, Cde.", 29.39, "", "Avenida Padre Tiago Alberione", "150", "Parque dos Príncipes", "05396-070", "Rio Pequeno", "Butanta", "(11) 3782-9747", "", 16, 640, 19, 800, 2, 96, 5, 137, 1, 1, 0, 47, 1656, "Alvenaria", "35053259", -23.573811, -46.774966, ""],
  ["eol-19466", "BT", 21, "19466", "EMEF", "Perimetral", 29.3, "", "Avenida Hebe Camargo", "299", "Paraisópolis", "05664-030", "Vila Andrade", "Campo Limpo", "(11) 3742-9505", "(11) 3742-3573", 19, 931, 21, 998, 1, 40, 4, 100, 1, 1, 0, 54, 4636, "Alvenaria", "35446865", -23.619631, -46.723326, ""],
  ["eol-92681", "BT", 22, "92681", "EMEF", "Jose de Alcantara Machado Filho", 29.28, "", "Rua Mattia Filizzola", "76", "Real Parque", "05685-060", "Morumbi", "Butanta", "(11) 3759-1520", "", 16, 681, 21, 863, 1, 67, 7, 75, 2, 1, 0, 70, 2625, "Alvenaria", "35053995", -23.607777, -46.705278, ""],
  ["eol-19160", "BT", 23, "19160", "EMEF", "Ileusa Caetano da Silva, Profa.", 29.05, "", "Rua D", "10", "Jardim Educandario", "05564-100", "Raposo Tavares", "Butanta", "(11) 3782-9767", "", 7, 248, 9, 311, 1, 38, 4, 63, 1, 1, 0, 32, 3299, "Alvenaria", "35224236", -23.59983, -46.776741, ""],
  ["eol-93131", "BT", 24, "93131", "EMEF", "Maria Antonieta D'alkimin Basto, Profa.", 28.99, "", "Rua Casa do Ator", "207", "Vila Olimpia", "04546-001", "Itaim Bibi", "Pinheiros", "(11) 3849-8729", "(11) 3846-4931", 11, 550, 13, 660, 1, 50, 5, 179, 1, 1, 0, 52, 2789, "Alvenaria", "35053512", -23.600579, -46.675819, ""],
  ["eol-19222", "BT", 25, "19222", "EMEF", "Veremundo Toth, Dom", 28.95, "", "Rua José Pedro de Carvalho Lima", "100", "Jardim Parque Morumbi", "05712-080", "Vila Andrade", "Campo Limpo", "(11) 3742-7124", "(11) 3742-9911", 16, 784, 18, 857, 2, 121, 5, 167, 1, 1, 0, 49, 4794, "Alvenaria", "35271226", -23.622482, -46.728606, ""],
  ["eol-92797", "BT", 26, "92797", "EMEF", "Julio Mesquita", 28.76, "", "Rua Jose Aires Neto", "25", "Jardim Bonfiglioli", "05594-040", "Butanta", "Butanta", "(11) 3735-4382", "", 14, 604, 17, 653, 2, 70, 7, 138, 1, 1, 0, 45, 2168, "Alvenaria", "35053223", -23.581353, -46.735794, ""],
  ["eol-93149", "BT", 27, "93149", "EMEF", "Olavo Pezzotti, Prof.", 28.48, "", "Rua Fradique Coutinho", "2200", "Vila Madalena", "05416-002", "Pinheiros", "Pinheiros", "(11) 3032-9908", "", 12, 588, 14, 698, 1, 60, 5, 89, 1, 1, 0, 41, 1342, "Alvenaria", "35054707", -23.550193, -46.693832, ""],
  ["eol-19275", "BT", 28, "19275", "EMEF", "Francisco Rebolo", 28.48, "", "Rua Catarinenses", "200", "Vila Andrade", "05728-050", "Vila Andrade", "Campo Limpo", "(11) 3744-2024", "(11) 3744-2714", 14, 612, 17, 694, 1, 50, 5, 126, 1, 1, 0, 48, 3091, "Alvenaria", "35233961", -23.632419, -46.741162, ""]
];
