/* VistAR · servidor simulado para pré-visualização local (não vai para o Apps Script). */
(function () {
  const hoje = new Date();
  const dia = n => { const d = new Date(hoje.getTime() + n * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const E = (id, nome, cie, dre, log, num, cep, bairro, lat, lng, amb, status, nota) => ({ id, nome, cie, dre, etapaEnsino: 'Ensino Fundamental', logradouro: log, numero: num, cep, bairro, lat, lng, ambientesPrevistos: String(amb), status, nota: nota || '', imovel: 'Próprio', idadeAnos: '30', diretor: '', telefone: '(11) 2222-0000', email: '' });
  const db = {
    orcs: [
      { id: 'orc-vx9', vistoriaId: 'vx9', codigo: 'VST-2026-0231', escolaId: 'e-farialima', escola: 'EMEF Brigadeiro Faria Lima', dre: 'Penha', empresa: 'Almeida Sapata Engenharia', status: 'aguardando', responsavelId: '', responsavel: '', prazo: '', valor: 0, versao: 0,
        vistoriaEm: new Date().toISOString(), atualizadoEm: new Date().toISOString(), atrasado: false, revisoes: [], historico: [{ em: new Date().toISOString(), status: 'aguardando', nota: 'Vistoria finalizada · disponível para orçamento' }] },
      { id: 'orc-vx2', vistoriaId: 'vx2', codigo: 'VST-2026-0229', escolaId: 'e-x2', escola: 'EMEF Santos Dumont', dre: 'Penha', empresa: 'Almeida Sapata Engenharia', status: 'em_andamento', responsavelId: 'u-orc', responsavel: 'Paula Orçamentos', prazo: '2026-01-05', valor: 0, versao: 0,
        vistoriaEm: new Date().toISOString(), atualizadoEm: new Date().toISOString(), atrasado: true, revisoes: [], historico: [{ em: new Date().toISOString(), status: 'em_andamento', nota: 'Atribuído a Paula Orçamentos', por: 'Roberto Lima' }] },
      { id: 'orc-vx3', vistoriaId: 'vx3', codigo: 'VST-2026-0227', escolaId: 'e-x1', escola: 'EMEF Jardim Helena', dre: 'Penha', empresa: 'Almeida Sapata Engenharia', status: 'finalizado', responsavelId: 'u-orc', responsavel: 'Paula Orçamentos', prazo: '', valor: 412350.9, versao: 2,
        aprovadoPor: 'Roberto Lima', aprovadoEm: new Date().toISOString(), vistoriaEm: new Date().toISOString(), atualizadoEm: new Date().toISOString(), atrasado: false,
        revisoes: [{ versao: 2, status: 'aprovada', valor: 412350.9, grupos: [['Climatização', 298000], ['Adequação elétrica', 84350.9], ['Obras civis', 30000], ['Outros', 0]], notas: 'Inclui subestação.', arquivos: [{ nome: 'Orcamento_JdHelena_v2.xlsx', url: '#' }], enviadoPor: 'Paula Orçamentos', enviadoEm: new Date().toISOString(), parecer: 'Ok', parecerPor: 'Roberto Lima' },
          { versao: 1, status: 'devolvida', valor: 398000, grupos: [['Climatização', 298000], ['Adequação elétrica', 100000], ['Obras civis', 0], ['Outros', 0]], notas: '', arquivos: [{ nome: 'Orcamento_v1.pdf', url: '#' }], enviadoPor: 'Paula Orçamentos', enviadoEm: new Date().toISOString(), parecer: 'Faltou obra civil', parecerPor: 'Roberto Lima' }],
        historico: [{ em: new Date().toISOString(), status: 'finalizado', nota: 'Aprovado · v2', por: 'Roberto Lima' }] }
    ],
    usuario: { id: 'u-marcos', email: 'marcos.silva@climatizasp.com.br', matricula: '1001', nome: 'Marcos Silva', cargo: 'Técnico de campo', equipeId: 'eq02', rg: '12.345.678-9', empresa: 'Almeida Sapata Engenharia e Construções Ltda.', perfil: 'tecnico', perfilNome: 'Vistoriador', nivel: 'vistoriador', escopo: 'equipe', perms: ['campo.vistoriar','escolas.ver','programacao.ver','fotos.ver'], supervisor: false, dres: ['Penha', 'Itaquera', 'Ermelino Matarazzo'], fotoId: '', iniciais: 'MS' },
    adm: { id: 'u-admin', email: 'johnny@exemplo.com', matricula: '1000', nome: 'Johnny Admin', cargo: 'Coordenação técnica', equipeId: 'eq02', perfil: 'admin', perfilNome: 'Administrador', nivel: 'admin', escopo: 'tudo', supervisor: true, dres: [], iniciais: 'JA', perms: ['campo.vistoriar','escolas.ver','escolas.editar','dres.editar','programacao.ver','programacao.editar','supervisao.painel','vistorias.consultar','vistorias.validar','vistorias.reabrir','pendencias.gerir','fotos.ver','extracao.usar','equipes.editar','usuarios.gerenciar','perfis.gerenciar','empresas.gerenciar','config.editar','orcamentos.ver','orcamentos.elaborar','orcamentos.atribuir','orcamentos.aprovar'] },
    orc: { id: 'u-orc', email: 'orc@exemplo.com', matricula: '3001', nome: 'Paula Orçamentos', cargo: 'Orçamentista', equipeId: '', perfil: 'orcamento', perfilNome: 'Orçamentos', nivel: 'orcamento', escopo: 'empresa', supervisor: false, dres: [], iniciais: 'PO', perms: ['escolas.ver','programacao.ver','vistorias.consultar','fotos.ver','extracao.usar','orcamentos.elaborar'] },
    sup: { id: 'u-roberto', email: 'roberto@exemplo.com', matricula: '2001', nome: 'Roberto Lima', cargo: 'Supervisor', equipeId: '', perfil: 'supervisor', perfilNome: 'Gestão da empresa', nivel: 'gestor', escopo: 'empresa', perms: ['campo.vistoriar','escolas.ver','programacao.ver','programacao.editar','supervisao.painel','vistorias.consultar','vistorias.validar','vistorias.reabrir','pendencias.gerir','fotos.ver','extracao.usar','equipes.editar','usuarios.gerenciar','orcamentos.ver','orcamentos.atribuir','orcamentos.aprovar'], supervisor: true, dres: ['Penha', 'Itaquera', 'Ermelino Matarazzo'], fotoId: '', iniciais: 'RL' },
    equipe: { id: 'eq02', nome: 'Equipe 02', membros: ['Marcos Silva', 'João Souza'], parceiro: 'João Souza', status: 'disponivel', supervisorNome: 'Roberto Lima', supervisorTel: '(11) 99000-0000' },
    cfg: { consorcio: 'Consórcio Climatiza São Paulo', contrato: 'SME-SP 000/2026', raioCheckin: 400, versao: '1.0.0' },
    empresa: 'Almeida Sapata Engenharia e Construções Ltda.',
    dres: [
      { id: 'Penha', engenheiroNome: 'Ana Paula Rocha', engenheiroCargo: 'Engenheiro DRE', engenheiroTel: '(11) 3000-0000' },
      { id: 'Itaquera', engenheiroNome: 'Carlos Mendes', engenheiroCargo: 'Engenheiro DRE', engenheiroTel: '(11) 3000-1111' },
      { id: 'Ermelino Matarazzo', engenheiroNome: 'Fernanda Dias', engenheiroCargo: 'Engenheiro DRE', engenheiroTel: '(11) 3000-2222' }
    ],
    escolas: [
      E('e-farialima', 'EMEF Brigadeiro Faria Lima', '10183472', 'Penha', 'Rua Heloísa Helena', '29', '03660-000', 'Vila Antonieta', -23.5442, -46.5262, 13, 'agendada'),
      E('e-infante', 'EMEF Infante Dom Henrique', '10183510', 'Penha', 'Rua Heloísa Helena', '290', '03660-010', 'Vila Antonieta', -23.5372, -46.518, 13, 'agendada'),
      E('e-deodoro', 'EMEF Marechal Deodoro', '10183600', 'Penha', 'Rua Pecrateria', '110', '03640-000', 'Penha', -23.529, -46.54, 11, 'retorno', 'Falta QDC e medição'),
      E('e-portinari', 'EMEF Cândido Portinari', '10184001', 'Itaquera', 'Av. Itaquera', '1950', '08210-000', 'Itaquera', -23.54, -46.47, 0, 'agendada'),
      E('e-alencar', 'EMEF José de Alencar', '10184120', 'Itaquera', 'Rua Gregório Ramalho', '300', '08210-430', 'Itaquera', -23.545, -46.46, 9, 'agendada')
    ],
    roteiro: [
      { id: 'r1', data: dia(0), hora: '08:30', equipeId: 'eq02', escolaId: 'e-farialima', status: 'agendada' },
      { id: 'r2', data: dia(0), hora: '13:30', equipeId: 'eq02', escolaId: 'e-infante', status: 'agendada' },
      { id: 'r3', data: dia(-2), hora: '', equipeId: 'eq02', escolaId: 'e-deodoro', status: 'retorno', nota: 'Falta QDC e medição' },
      { id: 'r4', data: dia(4), hora: '08:30', equipeId: 'eq02', escolaId: 'e-portinari', status: 'agendada' },
      { id: 'r5', data: dia(5), hora: '08:30', equipeId: 'eq02', escolaId: 'e-alencar', status: 'agendada' }
    ],
    stats: { concluidas: 6, aguardando: 3, pendentes: 2 },
    pendencias: [{ id: 'p1', escolaId: 'e-deodoro', etapa: 'eletrica', descricao: 'Fotos e medição do QDC', status: 'aberta', criadoEm: new Date().toISOString() }],
    vistorias: { 'v-joao': { id: 'v-joao', codigo: 'VST-2026-0229', escolaId: 'e-alencar', status: 'em_andamento', checkin: new Date(Date.now() - 50 * 60000).toISOString(), participantes: ['João Souza'] } },
    etapas: { 'v-joao': { dados: { dados: { nome: 'EMEF José de Alencar', diretor: 'Paula (preenchido pelo João)' }, ts: '' } } }, fotos: {}, seq: 230
  };
  let quem = 'tec';
  const boot = () => {
    const usuario = ({ sup: db.sup, adm: db.adm, orc: db.orc })[quem] || db.usuario;
    const ativa = Object.values(db.vistorias).find(v => v.status === 'em_andamento' && v.id !== 'v-joao');
    return JSON.parse(JSON.stringify({
      usuario: usuario, equipe: db.equipe, cfg: db.cfg, empresa: db.empresa, dres: db.dres, escolas: db.escolas, roteiro: db.roteiro,
      stats: db.stats, pendencias: db.pendencias, hoje: dia(0), serverTime: new Date().toISOString(),
      emAndamento: Object.values(db.vistorias).filter(v => v.status === 'em_andamento').map(v => ({ id: v.id, codigo: v.codigo, escolaId: v.escolaId, checkin: v.checkin, participantes: v.participantes || ['Marcos Silva'] })),
      vistoriaAtiva: ativa ? { id: ativa.id, codigo: ativa.codigo, escolaId: ativa.escolaId, status: ativa.status, checkin: ativa.checkin, etapas: db.etapas[ativa.id] || {}, fotos: Object.values(db.fotos).filter(f => f.vistoriaId === ativa.id) } : null
    }));
  };
  const relHtml = (tipo, v) => '<!DOCTYPE html><html><head><style>body{margin:0;font-family:Arial;background:transparent;' + (tipo === 'completo' ? 'white-space:nowrap;overflow-x:auto;padding:0 24px' : '') + '}.pg{display:inline-block;vertical-align:top;white-space:normal;width:794px;min-height:1123px;background:#fff;margin:0 14px 30px 0;box-shadow:0 10px 30px rgba(15,33,64,.18);padding:40px;box-sizing:border-box}.capa{background:#0F2140;color:#fff}</style></head><body>' +
    (tipo === 'completo' ? Array.from({ length: 12 }, (x, i) => '<div class="pg' + (i ? '' : ' capa') + '"><h1>' + (i ? 'Página ' + (i + 1) : 'Relatório Técnico de Vistoria e Pré-dimensionamento de Climatização') + '</h1><p>' + v.codigo + ' · prévia simulada</p></div>').join('')
      : '<div class="pg"><h2 style="text-align:center">RELATÓRIO DE VISTORIA</h2><p>Unidade: EMEF Brigadeiro Faria Lima</p><p>Prévia simulada (no Apps Script o layout oficial é gerado no servidor).</p></div>') + '</body></html>';
  const A = {
    login: p => { quem = /2001|roberto/.test(p.email) ? 'sup' : /^1000$|johnny/.test(p.email) ? 'adm' : /3001|orc/.test(p.email) ? 'orc' : 'tec'; return p.senha === 'vistar2026' ? { token: 'tok', boot: boot() } : Promise.reject({ biz: 'Usuário ou senha incorretos.' }); },
    validarCodigo: p => p.codigo === '123456' ? { nome: 'João Souza', cargo: 'Técnico de campo', equipe: 'Equipe 02', iniciais: 'JS' } : Promise.reject({ biz: 'Código inválido ou vencido.' }),
    ativar: () => { quem = 'tec'; return { token: 'tok', boot: boot() }; },
    esqueciSenha: () => ({ ok: true }),
    ping: () => ({ ok: true }),
    painel: p => {
      const serie = Array.from({ length: 14 }, (x, i) => ({ d: dia(i - 13), n: [1, 0, 0, 2, 1, 2, 0, 1, 1, 0, 2, 1, 1, 2][i], pct: 0.05 + i * 0.025, meta: 0.04 + i * 0.019 }));
      return { periodo: p.periodo, total: 36, cont: { concluida: 14, andamento: 2, agendada: 9, retorno: 5, nao_iniciada: 6 }, pct: 0.39, ritmo: 1.4, previsao: dia(21), metaData: dia(31), metaHoje: 0.3, deltaMeta: 0.09,
        serie, kpis: { ambientes: 612, ambientesVar: 18, fotos: 1248, fotosVar: 22, assinados: 14, assinadosPct: 1 },
        porDre: [{ dre: 'Penha', total: 13, concluidas: 7 }, { dre: 'Itaquera', total: 10, concluidas: 4 }, { dre: 'Ermelino Matarazzo', total: 7, concluidas: 2 }, { dre: 'Mooca', total: 6, concluidas: 1 }],
        porEquipe: [{ nome: 'Equipe 01', n: 6, pct: .43 }, { nome: 'Equipe 02', n: 5, pct: .36 }, { nome: 'Equipe 03', n: 3, pct: .21 }],
        mapa: db.escolas.map((e, i) => ({ id: e.id, nome: e.nome, lat: e.lat, lng: e.lng, st: ['concluida', 'andamento', 'retorno', 'agendada', 'nao_iniciada'][i % 5] })),
        orcamentos: quem === 'tec' ? null : orcResumo() };
    },
    equipes: () => ({ aValidar: 3, alertas: [{ tipo: 'fila', texto: 'Equipe 03 com 14 itens na fila de envio' }, { tipo: 'cancelada', texto: 'Cancelada hoje: EMEF José de Alencar · Escola fechada ou sem acesso', escolaId: 'e-alencar' }],
      equipes: [
        { id: 'eq01', nome: 'Equipe 01', membros: ['Paulo Reis', 'Ana Lopes'], status: 'em_campo', lat: -23.53, lng: -46.50, vistoEm: new Date(Date.now() - 4 * 60000).toISOString(), fila: 2, atual: { id: 'vx1', escola: 'EMEF Cândido Portinari', escolaId: 'e-portinari', checkin: new Date(Date.now() - 95 * 60000).toISOString(), fotos: 21 }, hoje: { total: 2, concluidas: 0 } },
        { id: 'eq02', nome: 'Equipe 02', membros: ['Marcos Silva', 'João Souza'], status: 'em_transito', lat: -23.54, lng: -46.52, vistoEm: new Date(Date.now() - 60000).toISOString(), fila: 0, destino: 'EMEF Infante Dom Henrique', eta: new Date(Date.now() + 12 * 60000).toISOString(), hoje: { total: 2, concluidas: 1 } },
        { id: 'eq03', nome: 'Equipe 03', membros: ['Lucas Prado', 'Rita Alves'], status: 'disponivel', lat: -23.50, lng: -46.48, vistoEm: new Date(Date.now() - 50 * 60000).toISOString(), fila: 14, hoje: { total: 1, concluidas: 1 } }] }),
    validacoes: () => [{ id: 'vx2', codigo: 'VST-2026-0229', escola: 'EMEF Santos Dumont', equipe: 'Equipe 02', checkout: dia(-2) + 'T15:00:00Z', assinado: true, resumo: { ambientes: 24, fotos: 41, pendencias: 1 }, validacao: 'pendente' },
      { id: 'vx3', codigo: 'VST-2026-0227', escola: 'EMEF Jardim Helena', equipe: 'Equipe 01', checkout: dia(-4) + 'T15:00:00Z', assinado: false, resumo: { ambientes: 19, fotos: 33, pendencias: 3 }, validacao: 'pendente' }],
    validar: () => ({ ok: true }),
    vistoriaDetalhe: p => ({ id: p.vistoriaId, codigo: 'VST-2026-0231', status: 'finalizada', escola: { id: 'e-farialima', nome: 'EMEF Brigadeiro Faria Lima', dre: 'Penha' }, data: dia(0) + 'T11:30:00Z',
      checkin: dia(0) + 'T11:30:00Z', checkout: dia(0) + 'T14:40:00Z', duracao: '3h10', equipe: 'Equipe 02', membros: ['Marcos Silva', 'João Souza'], respTecnico: 'Johnny',
      resultado: { instalada: 64.2, demanda: 23.8, prevista: 91.6, padrao: 57.2, pct: 1.6, disjuntor: '150' },
      etapas: [{ t: 'Dados da escola', s: 'Identificação, endereço, 3 fotos', pend: 0 }, { t: 'Entrada de energia', s: 'BT aérea · 2 caixas · aterramento 18 Ω', pend: 0 }, { t: 'Estrutura', s: '2 blocos · laje técnica', pend: 0 }, { t: 'Elétrica', s: '5 quadros · 2 vagas livres', pend: 0 }, { t: 'Ambientes', s: '21 climatizáveis · 8 de apoio · 5 externas', pend: 0 }, { t: 'Equipamentos com carga', s: '4 itens · 1 inacessível', pend: 1 }],
      fotos: [1, 2, 3, 4].map(i => ({ id: 'fx' + i, fileId: 'ffx' + i, legenda: 'Foto ' + i })), totalFotos: 48,
      pendencias: [{ etapa: 'equipamentos', descricao: 'Potência do elevador · casa de máquinas fechada' }, { etapa: 'ambientes', descricao: 'Fotos do forro das salas 09 e 10' }],
      assinaturas: [{ nome: 'Johnny · Coordenação técnica', em: dia(0) + 'T14:52:00Z', ok: true }, { nome: 'Carla Mendes · Diretora', em: dia(0) + 'T14:48:00Z', ok: true }],
      copia: { para: 'carla@sme.sp.gov.br', em: dia(0) + 'T14:55:00Z' }, respEmail: 'carla@sme.sp.gov.br', historico: [{ v: 1, em: dia(0) + 'T14:52:00Z', nota: 'gerada' }],
      validacao: { status: 'pendente' }, podeValidar: quem === 'sup', orcamento: quem === 'tec' ? null : { id: 'orc-vx9', status: db.orcs[0].status, valor: db.orcs[0].valor, versao: db.orcs[0].versao } }),
    reabrir: () => ({ ok: true }),
    pendenciasPainel: () => ({ kpis: { pendentes: 5, total: 36, comRetorno: 2, proximo: dia(4), reagendar: 1, decisaoDre: 2 }, itens: [
      { escolaId: 'e-deodoro', escola: 'EMEF Marechal Deodoro', dre: 'Penha', equipe: 'Equipe 02', situacao: 'retorno_solicitado', descricao: 'A diretora pediu para voltar outro dia por causa da reforma do pátio em andamento. Parte do levantamento já foi feita.', etapas: ['ok', 'ok', 'ok', 'parcial', 'vazio'], retorno: { data: dia(4), hora: '09:00', confirmado: true } },
      { escolaId: 'e-portinari', escola: 'EMEF Cândido Portinari', dre: 'Itaquera', equipe: 'Equipe 01', situacao: 'nao_concluida', descricao: 'Não houve tempo para finalizar. A equipe parou na etapa Elétrica.', etapas: ['ok', 'ok', 'ok', 'parcial', 'vazio'], retorno: { data: dia(5), hora: '08:30' } },
      { escolaId: 'e-alencar', escola: 'EMEF José de Alencar', dre: 'Itaquera', equipe: 'Equipe 03', situacao: 'sem_acesso', descricao: 'Escola fechada na data. A portaria não tinha autorização.', etapas: ['vazio', 'vazio', 'vazio', 'vazio', 'vazio'] },
      { escolaId: 'e-infante', escola: 'EMEF Carlos Drummond', dre: 'Ermelino Matarazzo', equipe: 'Equipe 03', situacao: 'recusa', descricao: 'A direção recusou a vistoria. Registro e foto do ofício anexados.', etapas: ['ok', 'vazio', 'vazio', 'vazio', 'vazio'], registroEm: dia(-2) },
      { escolaId: 'e-farialima', escola: 'EMEF Anita Garibaldi', dre: 'Mooca', equipe: 'Equipe 01', situacao: 'aguardando_autorizacao', descricao: 'Falta autorização da DRE para acesso à cobertura. A equipe concluiu o que foi possível.', etapas: ['ok', 'ok', 'parcial', 'vazio', 'vazio'], registroEm: dia(-1) }] }),
    reagendar: () => ({ ok: true }), cobrarDre: () => ({ enviado: true, nome: 'Carlos Mendes' }),
    registro: () => ({ motivo: 'Recusa da direção', quem: 'Diretora', descricao: 'Não autorizou sem ofício da DRE.', em: new Date().toISOString(), por: 'Marcos Silva', foto: '' }),
    retomarDados: p => ({ id: 'vold', codigo: 'VST-2026-0200', versao: 1, etapas: { dados: { dados: { nome: 'EMEF Marechal Deodoro', diretor: 'Paula' }, ts: '' } }, fotos: [] }),
    programacao: p => ({ equipes: quem === 'sup' ? [{ id: 'eq01', nome: 'Equipe 01' }, { id: 'eq02', nome: 'Equipe 02' }, { id: 'eq03', nome: 'Equipe 03' }] : null, itens: [
      { id: 'pa', data: dia(-4), hora: '08:30', horaFim: '11:30', escolaId: 'e-farialima', escola: 'EMEF Jardim Helena', dre: 'Penha', status: 'concluida', tipo: 'visita' },
      { id: 'pb', data: dia(-3), hora: '09:00', escolaId: 'e-deodoro', escola: 'EMEF Marechal Deodoro', dre: 'Penha', status: 'retorno', tipo: 'retorno', nota: 'retorno solicitado pela unidade' },
      { id: 'pc', data: dia(-1), hora: '08:00', escolaId: '', escola: '', status: 'agendada', tipo: 'escritorio' },
      { id: 'pd', data: dia(0), hora: '08:30', horaFim: '11:40', escolaId: 'e-farialima', escola: 'EMEF Brigadeiro Faria Lima', dre: 'Penha', endereco: 'R. Heloísa Helena, 29', status: 'concluida', tipo: 'visita', vistoria: { checkin: dia(0) + 'T11:30:00Z', checkout: dia(0) + 'T14:40:00Z', resumo: { ambientes: 29, fotos: 48 } } },
      { id: 'pe', data: dia(0), hora: '13:30', horaFim: '16:30', escolaId: 'e-infante', escola: 'EMEF Infante Dom Henrique', dre: 'Penha', endereco: 'R. Heloísa Helena, 290', ambientes: 13, responsavel: 'diretora Carla Mendes', confirmado: true, status: 'agendada', tipo: 'visita' },
      { id: 'pf', data: dia(4), hora: '09:00', escolaId: 'e-deodoro', escola: 'EMEF Marechal Deodoro', dre: 'Penha', status: 'retorno', tipo: 'retorno', confirmado: true },
      { id: 'pg', data: dia(6), hora: '08:30', escolaId: 'e-portinari', escola: 'EMEF Parque Savoy', dre: 'Itaquera', status: 'agendada', tipo: 'visita' }].filter(i => i.data >= p.inicio && i.data <= p.fim) }),
    salvarVisita: () => ({ id: 'x' }), excluirVisita: () => ({ ok: true }),
    galeria: p => ({ total: 1244, escolasComFotos: 36, autores: { 'u-marcos': 'Marcos Silva' }, grupos: [
      { escolaId: 'e-farialima', escola: 'EMEF Brigadeiro Faria Lima', dre: 'Penha', data: dia(0), total: 48, fotos: ['Fachada', 'Placa', 'Padrão', 'Medidor', 'Seccionadora', 'Aterramento', 'QGBT', 'QDC-A1', 'Sala 03'].map((r, i) => ({ id: 'g1' + i, fileId: 'fg1' + i, rotulo: r, etapa: 'entrada', criadoEm: dia(0) + 'T12:41:00Z', lat: -23.5412, lng: -46.5071, autor: 'u-marcos' })) },
      { escolaId: 'e-portinari', escola: 'EMEF Cândido Portinari', dre: 'Itaquera', data: dia(-1), total: 6, fotos: ['Sala 03', 'Lab. info', 'Cobertura', 'Área técnica', 'QGBT', 'Medidor'].map((r, i) => ({ id: 'g2' + i, fileId: 'fg2' + i, rotulo: r, etapa: 'ambientes', criadoEm: dia(-1) + 'T12:00:00Z' })) }] }),
    legenda: () => ({ ok: true }),
    cadastroEscolas: () => ({ podeEditar: quem === 'adm', podeDres: quem === 'adm', empresas: [{ id: 'emp1', nome: 'Almeida Sapata Engenharia' }, { id: 'emp2', nome: 'Construtora Norte' }],
      dres: [{ id: 'Penha', nome: 'DRE Penha', sigla: 'PE', empresaId: 'emp1', empresa: 'Almeida Sapata Engenharia', engenheiroNome: 'Ana Paula Rocha', engenheiroTel: '(11) 3000-0000' }, { id: 'Itaquera', nome: 'DRE Itaquera', sigla: 'IQ', empresaId: 'emp1', empresa: 'Almeida Sapata Engenharia' }],
      escolas: db.escolas.map((e, i) => Object.assign({}, e, { situacao: ['agendada', 'retorno', 'concluida', 'nao_iniciada', 'andamento'][i % 5], ativo: i !== 3, tempMax: 30 + i / 3, motivoInativacao: i === 3 ? 'Fora do escopo' : '' })) }),
    salvarEscola: () => ({ id: 'x' }), ativarEscola: () => ({ ok: true }), geocodificar: () => ({ lat: -23.5, lng: -46.5 }),
    importarEscolas: p => ({ criadas: p.linhas.length, atualizadas: 0, dresCriadas: 0, erros: [] }), salvarDre: () => ({ id: 'x' }),
    empresas: () => [{ id: 'emp1', nome: 'Almeida Sapata Engenharia', sigla: 'ASE', cnpj: '00.000.000/0001-00', dres: ['Penha', 'Itaquera'], usuarios: 6, pastaUrl: '#' }, { id: 'emp2', nome: 'Construtora Norte', sigla: 'CN', dres: ['Ermelino Matarazzo'], usuarios: 3 }],
    salvarEmpresa: () => ({ id: 'x' }), compartilharPastaEmpresa: () => ({ compartilhados: 2 }),
    equipesCad: () => ({ empresas: [{ id: 'emp1', nome: 'Almeida Sapata Engenharia' }, { id: 'emp2', nome: 'Construtora Norte' }], dres: ['Penha', 'Itaquera'],
      usuarios: [{ id: 'u1', nome: 'Marcos Silva', equipeId: 'eq02', nivel: 'vistoriador' }, { id: 'u2', nome: 'João Souza', equipeId: 'eq02', nivel: 'vistoriador' }, { id: 'u5', nome: 'Lia Costa', equipeId: '', nivel: 'vistoriador' }],
      equipes: [{ id: 'eq02', nome: 'Equipe 02', empresaId: 'emp1', empresa: 'Almeida Sapata Engenharia', supervisorNome: 'Roberto Lima', dres: 'Penha, Itaquera', baseNome: 'Escritório Penha', ativo: true, pessoas: [{ id: 'u1', nome: 'Marcos Silva', perfil: 'Vistoriador' }, { id: 'u2', nome: 'João Souza', perfil: 'Vistoriador' }] }] }),
    salvarEquipe: () => ({ id: 'x' }),
    perfis: () => ({ niveis: { admin: 'Administrador', diretoria: 'Diretoria / Coordenação geral', gestor: 'Gestão da empresa', orcamento: 'Orçamentos', vistoriador: 'Vistoriador' },
      escopos: { tudo: 'Tudo (todas as empresas)', empresa: 'Empresa do usuário', dres: 'DREs atribuídas ao usuário', equipe: 'Somente a própria equipe' },
      caps: [['campo.vistoriar', 'Campo', 'Fazer vistorias (check-in, etapas, fotos, finalizar)'], ['escolas.ver', 'Escolas', 'Consultar escolas, localização e dados'], ['escolas.editar', 'Escolas', 'Cadastrar, editar, importar, inativar e reativar escolas'], ['extracao.usar', 'Dados', 'Extrair dados (CSV, Excel, Planilha Google)'], ['usuarios.gerenciar', 'Gestão', 'Cadastrar usuários e enviar códigos de acesso']],
      perfis: [{ id: 'admin', nome: 'Administrador', nivel: 'admin', escopo: 'tudo', permissoes: ['campo.vistoriar', 'escolas.ver', 'escolas.editar', 'extracao.usar', 'usuarios.gerenciar'], padrao: true, descricao: 'Acesso total.', usuarios: 1 },
        { id: 'orcamento', nome: 'Orçamentos', nivel: 'orcamento', escopo: 'empresa', permissoes: ['escolas.ver', 'extracao.usar'], padrao: true, descricao: 'Escritório.', usuarios: 2 },
        { id: 'p-x', nome: 'Orçamentos · só Penha', nivel: 'orcamento', escopo: 'dres', permissoes: ['escolas.ver'], padrao: false, descricao: 'Personalizado.', usuarios: 0 }] }),
    salvarPerfil: () => ({ id: 'x' }), excluirPerfil: () => ({ ok: true }), restaurarPerfil: () => ({ ok: true }),
    configAdmin: () => ({ logo: '', fatores: { 'Sala de aula': 650, 'Biblioteca': 600 }, valores: [{ chave: 'CONSORCIO', valor: 'Consórcio Climatiza São Paulo', descricao: 'Nome exibido no app e nos relatórios' }, { chave: 'CONTRATO', valor: 'SME-SP 000/2026', descricao: 'Número do contrato' }, { chave: 'META_DATA', valor: '2026-11-30', descricao: 'Data para concluir todas as escolas' }] }),
    salvarConfig: () => ({ ok: true }), manual: () => ({ nome: 'Manual.pdf', base64: btoa('%PDF') }),
    consultaVistorias: () => [{ id: 'vx9', codigo: 'VST-2026-0231', escola: 'EMEF Brigadeiro Faria Lima', dre: 'Penha', equipe: 'Equipe 02', status: 'finalizada', checkin: dia(0) + 'T11:30:00Z', checkout: dia(0) + 'T14:40:00Z', validacao: 'pendente', resumo: { ambientes: 29, fotos: 48 }, versao: '1',
      orcamento: { id: 'orc-vx9', status: db.orcs[0].status, nome: '', valor: db.orcs[0].valor } },
      { id: 'vx8', codigo: 'VST-2026-0200', escola: 'EMEF Marechal Deodoro', dre: 'Penha', equipe: 'Equipe 02', status: 'cancelada', checkin: dia(-3) + 'T11:30:00Z', validacao: 'pendente', resumo: {}, versao: '1' }],
    extrair: p => p.planilha ? { url: '#', linhas: 12 } : { titulo: 'Ambientes (um por linha)', total: 3, colunas: ['Vistoria', 'Escola', 'Local', 'Tipo', 'Quantidade', 'Área total (m²)'],
      linhas: [['VST-2026-0231', 'EMEF Brigadeiro Faria Lima', 'Bloco A · 1º pav.', 'Sala de aula', 4, 232], ['VST-2026-0231', 'EMEF Brigadeiro Faria Lima', 'Bloco A · Térreo', 'Biblioteca', 1, 80.5], ['VST-2026-0231', 'EMEF Brigadeiro Faria Lima', 'Área externa', 'Quadra coberta', 1, 480]] },
    candidatos: () => ({ equipes: [{ id: 'eq02', nome: 'Equipe 02', base: { nome: 'Escritório Penha', lat: -23.53, lng: -46.53 } }, { id: 'eq01', nome: 'Equipe 01', base: null }],
      escolas: db.escolas.concat([E('e-x1', 'EMEF Jardim Helena', '1', 'Penha', 'Rua A', '1', '', 'Jd Helena', -23.50, -46.42, 18, 'nao_iniciada'), E('e-x2', 'EMEF Santos Dumont', '2', 'Penha', 'Rua B', '2', '', 'Penha', -23.52, -46.55, 22, 'nao_iniciada')])
        .map((e, i) => ({ id: e.id, nome: e.nome, dre: e.dre, bairro: e.bairro, lat: e.lat, lng: e.lng, situacao: e.status, ambientes: Number(e.ambientesPrevistos) || 12, tempMax: 30 + i / 4, ordemSme: i + 1, programada: i === 1 ? { data: dia(2), equipe: 'Equipe 01' } : null })) }),
    salvarRoteiro: () => ({ ok: true }),
    orcamentos: () => {
      const cont = { aguardando: 0, em_andamento: 0, em_aprovacao: 0, revisao: 0, finalizado: 0, cancelado: 0 };
      const vis = db.orcs.filter(o => quem !== 'orc' || o.responsavelId === 'u-orc');
      vis.forEach(o => cont[o.status]++);
      const soma = st => vis.filter(o => o.status === st).reduce((s, o) => s + o.valor, 0);
      return { itens: vis.map(o => Object.assign({}, o, { revisoes: undefined })), contagem: cont, totais: { finalizado: soma('finalizado'), emAprovacao: soma('em_aprovacao') },
        podeAtribuir: quem !== 'orc', podeAprovar: quem !== 'orc', podeElaborar: quem === 'orc' || quem === 'adm' };
    },
    orcamento: p => {
      const o = db.orcs.find(x => x.id === p.id);
      const resp = o.responsavelId === 'u-orc';
      return Object.assign({}, o, { historico: o.historico.slice().reverse(), grupos: [['valorAc', 'Climatização (equipamentos e instalação)'], ['valorEletrica', 'Adequação elétrica'], ['valorCivil', 'Obras civis e complementares'], ['valorOutros', 'Outros']],
        tecnico: { area: 2480, areaClim: 1178, tr: 61.5, kwAc: 74.2, ambientes: 29, externos: 2, kwEntrada: 75, suporta: false, padrao: 'Média tensão' },
        pode: { atribuir: quem !== 'orc' && ['aguardando', 'em_andamento', 'revisao'].indexOf(o.status) >= 0, elaborar: (quem === 'orc' && resp || quem === 'adm') && ['em_andamento', 'revisao'].indexOf(o.status) >= 0,
          aprovar: quem !== 'orc' && o.status === 'em_aprovacao', reabrir: quem !== 'orc' && o.status === 'finalizado' },
        orcamentistas: quem !== 'orc' ? [{ id: 'u-orc', nome: 'Paula Orçamentos' }] : [] });
    },
    atribuirOrcamento: p => { const o = db.orcs.find(x => x.id === p.id); o.responsavelId = p.responsavelId; o.responsavel = 'Paula Orçamentos'; o.prazo = p.prazo; if (o.status === 'aguardando') o.status = 'em_andamento'; o.historico.push({ em: new Date().toISOString(), status: o.status, nota: 'Atribuído a Paula Orçamentos', por: 'Roberto Lima' }); return { ok: true }; },
    uploadDocOrcamento: p => ({ fileId: 'doc' + Math.random().toString(36).slice(2, 6), nome: p.nome, url: '#', bytes: 1000 }),
    enviarOrcamento: p => {
      const o = db.orcs.find(x => x.id === p.id); o.versao++; const g = p.valores; const tot = g.valorAc + g.valorEletrica + g.valorCivil + g.valorOutros;
      o.valor = tot; o.status = 'em_aprovacao';
      o.revisoes.unshift({ versao: o.versao, status: 'em_analise', valor: tot, grupos: [['Climatização', g.valorAc], ['Adequação elétrica', g.valorEletrica], ['Obras civis', g.valorCivil], ['Outros', g.valorOutros]], notas: p.notas, arquivos: p.arquivos, enviadoPor: 'Paula Orçamentos', enviadoEm: new Date().toISOString() });
      o.historico.push({ em: new Date().toISOString(), status: 'em_aprovacao', nota: 'Revisão v' + o.versao + ' enviada', por: 'Paula Orçamentos' });
      return { ok: true, versao: o.versao };
    },
    decidirOrcamento: p => {
      const o = db.orcs.find(x => x.id === p.id), r = o.revisoes[0];
      if (p.decisao === 'aprovar') { o.status = 'finalizado'; r.status = 'aprovada'; o.aprovadoPor = 'Roberto Lima'; o.aprovadoEm = new Date().toISOString(); }
      else { o.status = 'revisao'; if (p.decisao === 'devolver') r.status = 'devolvida'; }
      r.parecer = p.parecer; r.parecerPor = 'Roberto Lima';
      o.historico.push({ em: new Date().toISOString(), status: o.status, nota: p.decisao, por: 'Roberto Lima' });
      return { ok: true, status: o.status };
    },
    usuarios: () => ({ dres: [{ id: 'Penha', empresaId: 'emp1' }, { id: 'Itaquera', empresaId: 'emp1' }, { id: 'Ermelino Matarazzo', empresaId: 'emp2' }],
      equipes: [{ id: 'eq01', nome: 'Equipe 01', empresaId: 'emp1' }, { id: 'eq02', nome: 'Equipe 02', empresaId: 'emp1' }, { id: 'eq03', nome: 'Equipe 03', empresaId: 'emp2' }],
      perfis: [{ id: 'admin', nome: 'Administrador', nivel: 'admin', escopo: 'tudo' }, { id: 'diretoria', nome: 'Diretoria / Coordenação geral', nivel: 'diretoria', escopo: 'tudo' }, { id: 'gestor', nome: 'Gestão da empresa', nivel: 'gestor', escopo: 'empresa' }, { id: 'orcamento', nome: 'Orçamentos', nivel: 'orcamento', escopo: 'empresa' }, { id: 'vistoriador', nome: 'Vistoriador', nivel: 'vistoriador', escopo: 'equipe' }],
      empresas: [{ id: 'emp1', nome: 'Almeida Sapata Engenharia' }, { id: 'emp2', nome: 'Construtora Norte' }], escopoTudo: quem === 'adm', minhaEmpresa: 'emp1',
      usuarios: [{ id: 'u1', nome: 'Marcos Silva', email: 'marcos@x.com', matricula: '1001', perfilId: 'vistoriador', perfilNome: 'Vistoriador', equipeId: 'eq02', empresaId: 'emp1', ativo: true, ativado: true, ultimoAcesso: new Date().toISOString(), dres: 'Penha' },
        { id: 'u2', nome: 'João Souza', email: 'joao@x.com', matricula: '1002', perfilId: 'vistoriador', perfilNome: 'Vistoriador', equipeId: 'eq02', empresaId: 'emp1', ativo: true, ativado: false, codigoPendente: true, dres: 'Penha' },
        { id: 'u3', nome: 'Roberto Lima', email: 'roberto@x.com', matricula: '2001', perfilId: 'gestor', perfilNome: 'Gestão da empresa', equipeId: '', empresaId: 'emp1', ativo: true, ativado: true, dres: '' },
        { id: 'u4', nome: 'Paula Orçamentos', email: 'orc@x.com', matricula: '3001', perfilId: 'orcamento', perfilNome: 'Orçamentos', equipeId: '', empresaId: 'emp1', ativo: true, ativado: true, dres: '' }] }),
    salvarUsuario: () => ({ id: 'u9', codigo: '482913' }), novoCodigo: () => ({ codigo: '774120' }),
    bootstrap: () => boot(),
    checkin: p => { db.vistorias[p.id] = { id: p.id, codigo: 'VST-2026-0' + (++db.seq), escolaId: p.escolaId, status: 'em_andamento', checkin: p.checkin, participantes: ['Marcos Silva'] }; db.equipe.status = 'em_campo'; return { id: p.id, codigo: db.vistorias[p.id].codigo }; },
    salvarEtapa: p => {
      const et = (db.etapas[p.vistoriaId] = db.etapas[p.vistoriaId] || {});
      const d = (et[p.etapa] = et[p.etapa] || { dados: {} }).dados;
      (p.ops || []).forEach(o => {
        if (o.init) { Object.keys(o.v || {}).forEach(k => { if (d[k] === undefined) d[k] = o.v[k]; }); return; }
        const rel = o.p.slice(p.etapa.length + 1);
        if (rel.indexOf('#') >= 0) { const col = rel.split('#')[0], id = rel.split('#')[1]; const arr = d[col.split('.').pop()] = d[col.split('.').pop()] || []; const i = arr.findIndex(r => r.id === id); if (o.v === null) { if (i >= 0) arr.splice(i, 1); } else if (i >= 0) arr[i] = o.v; else arr.push(o.v); return; }
        const ks = rel.split('.'); let x = d; ks.slice(0, -1).forEach(k => { x = x[k] = x[k] && typeof x[k] === 'object' ? x[k] : {}; }); x[ks[ks.length - 1]] = o.v;
      });
      et[p.etapa].ts = new Date().toISOString();
      return { ts: et[p.etapa].ts, etapa: p.etapa, vistoriaId: p.vistoriaId, dados: JSON.parse(JSON.stringify(d)) };
    },
    puxarVistoria: p => { const v = db.vistorias[p.vistoriaId]; return { id: v.id, codigo: v.codigo, escolaId: v.escolaId, status: v.status, checkin: v.checkin, participantes: v.participantes || [], etapas: db.etapas[v.id] || {}, fotos: Object.values(db.fotos).filter(f => f.vistoriaId === v.id) }; },
    entrarVistoria: p => { const v = db.vistorias[p.vistoriaId]; v.participantes = (v.participantes || []).concat('Marcos Silva'); return A.puxarVistoria(p); },
    sairVistoria: () => ({ ok: true }),
    guardarFalha: () => ({ fileId: 'falha1' }),
    uploadFoto: p => { db.fotos[p.id] = { id: p.id, vistoriaId: p.vistoriaId, etapa: p.etapa, slot: p.slot, ref: p.ref, fileId: 'f' + p.id, criadoEm: p.criadoEm }; return { id: p.id, fileId: 'f' + p.id }; },
    removerFoto: p => { delete db.fotos[p.id]; return { removida: true }; },
    cancelar: p => { db.vistorias[p.vistoriaId].status = 'cancelada'; db.equipe.status = 'disponivel'; return { ok: true }; },
    finalizar: p => {
      const v = db.vistorias[p.vistoriaId]; v.status = 'finalizada'; v.checkout = p.checkout;
      db.stats.concluidas++; db.stats.aguardando--; db.equipe.status = 'em_transito'; db.equipe.destinoEscolaId = 'e-infante'; db.equipe.statusDesde = new Date().toISOString();
      db.roteiro.find(r => r.escolaId === v.escolaId).status = 'concluida';
      const rev = ((db.etapas[v.id] || {}).revisao || {}).dados || {};
      const ass = !!(rev.assResp && rev.assEmpresa);
      return { id: v.id, codigo: v.codigo, escolaId: v.escolaId, checkin: v.checkin, checkout: v.checkout, assinado: ass, assinantes: ['Johnny', rev.respNome || ''], resumo: p.resumo,
        docs: p.docsDepois ? { pendente: true } : { vistoria: { paginas: 1, tamanho: '0,8 MB' }, completo: { paginas: 12, tamanho: '2,4 MB' } },
        copia: p.docsDepois ? { pendente: true } : ass && rev.respEmail ? { enviada: true, para: rev.respEmail, em: new Date().toISOString() } : { enviada: false }, equipeStatus: 'em_transito', proxima: { escolaId: 'e-infante', hora: '13:30' } };
    },
    documentos: p => ({ id: p.vistoriaId, docs: { vistoria: { paginas: 1, tamanho: '0,8 MB' }, completo: { paginas: 12, tamanho: '2,4 MB' } }, copia: { enviada: false }, assinado: true, assinantes: ['Johnny'] }),
    relatorio: p => ({ html: relHtml(p.tipo, db.vistorias[p.vistoriaId]), assinado: true, codigo: db.vistorias[p.vistoriaId].codigo, geradoEm: new Date().toLocaleString('pt-BR').slice(0, 17), paginas: p.tipo === 'completo' ? 12 : 1 }),
    pdf: p => ({ base64: btoa('%PDF-1.4 simulado'), nome: 'Relatorio_' + p.tipo + '.pdf', url: '#', tamanho: '0,8 MB' }),
    enviarCopia: p => ({ enviada: true, para: p.para, em: new Date().toISOString(), cc: 'consorcio@exemplo.com' }),
    rota: () => ({ min: 12, km: 4.2, chegada: new Date(Date.now() + 12 * 60000).toISOString(), mapa: null }),
    escola: p => ({ escola: Object.assign({ etapaEnsino: 'Ensino Fundamental' }, db.escolas.find(e => e.id === p.escolaId)), status: 'concluida',
      contato: { nome: 'Carla Mendes', cargo: 'Diretora', rf: '845.221.7', tel: '(11) 3000-0000', email: 'carla.mendes@sme.prefeitura.sp.gov.br' }, resumo: { blocos: 2, ambientes: 29, m2clim: 1178 },
      historico: [{ id: 'vx9', codigo: 'VST-2026-0231', status: 'finalizada', checkin: dia(0) + 'T11:30:00Z', checkout: dia(0) + 'T14:40:00Z', equipe: 'Equipe 02', fotos: 48, assinado: true }],
      retorno: { data: '', hora: '' }, pendencias: [1, 2, 3].map(i => ({ id: 'pp' + i, descricao: 'x' })), documentos: { vistoriaId: 'vx9', vistoria: { url: '#', bytes: 800000 }, completo: { url: '#', bytes: 2500000 }, assinadoEm: dia(0) + 'T14:52:00Z' },
      fotos: [1, 2, 3, 4].map(i => ({ id: 'ef' + i, fileId: 'fef' + i, legenda: 'Foto ' + i, etapa: 'dados' })), totalFotos: 48,
      cfg: { contrato: 'SME-SP 000/2026', lote: 'Lote Penha', consorcio: 'Consórcio Climatiza São Paulo' }, equipe: { nome: 'Equipe 02', membros: 'Marcos Silva, João Souza' } }),
    thumbs: p => {
      const out = {};
      (p.ids || []).forEach((id, i) => {
        const h = [200, 30, 160, 260, 0, 120][(id.length + i) % 6];
        out[id] = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="hsl(' + h + ',25%,70%)"/><rect x="60" y="80" width="180" height="140" fill="hsl(' + h + ',20%,90%)" stroke="#334" stroke-width="6"/><rect x="100" y="120" width="100" height="30" fill="#c33"/></svg>');
      });
      return out;
    },
    resolverPendencia: p => { db.pendencias = db.pendencias.filter(x => x.id !== p.id); return { ok: true }; },
    senha: () => ({ token: 'tok' }),
    fotoPerfil: () => ({ fotoId: 'perfil1' }),
    statusEquipe: p => ({ status: p.status })
  };
  function orcResumo() {
    const cont = { aguardando: 0, em_andamento: 0, em_aprovacao: 0, revisao: 0, finalizado: 0, cancelado: 0 };
    db.orcs.forEach(o => cont[o.status]++);
    const soma = st => db.orcs.filter(o => o.status === st).reduce((s, o) => s + o.valor, 0);
    return { total: db.orcs.length, cont, valorFinalizado: soma('finalizado'), valorEmAprovacao: soma('em_aprovacao'), atrasados: 1 };
  }
  window.MockApi = (acao, token, payload) => new Promise((res, rej) => setTimeout(() => {
    try {
      if (['login', 'validarCodigo', 'ativar', 'esqueciSenha'].indexOf(acao) < 0 && !token) return res({ ok: false, error: 'Sessão expirada', code: 'AUTH' });
      Promise.resolve(A[acao](payload)).then(d => res({ ok: true, data: d }), e => res({ ok: false, error: e.biz || String(e) }));
    } catch (e) { res({ ok: false, error: String(e) }); }
  }, 250));
  window.__MOCK_DB__ = db;
})();
