/* VistAR · servidor simulado para pré-visualização local (não vai para o Apps Script). */
(function () {
  const hoje = new Date();
  const dia = n => { const d = new Date(hoje.getTime() + n * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const E = (id, nome, cie, dre, log, num, cep, bairro, lat, lng, amb, status, nota) => ({ id, nome, cie, dre, etapaEnsino: 'Ensino Fundamental', logradouro: log, numero: num, cep, bairro, lat, lng, ambientesPrevistos: String(amb), status, nota: nota || '', imovel: 'Próprio', idadeAnos: '30', diretor: '', telefone: '(11) 2222-0000', email: '' });
  const db = {
    usuario: { id: 'u-marcos', email: 'marcos.silva@climatizasp.com.br', matricula: '1001', nome: 'Marcos Silva', cargo: 'Técnico de campo', equipeId: 'eq02', rg: '12.345.678-9', empresa: 'Almeida Sapata Engenharia e Construções Ltda.', perfil: 'tecnico', supervisor: false, dres: ['Penha', 'Itaquera', 'Ermelino Matarazzo'], fotoId: '', iniciais: 'MS' },
    sup: { id: 'u-roberto', email: 'roberto@exemplo.com', matricula: '2001', nome: 'Roberto Lima', cargo: 'Supervisor', equipeId: '', perfil: 'supervisor', supervisor: true, dres: ['Penha', 'Itaquera', 'Ermelino Matarazzo'], fotoId: '', iniciais: 'RL' },
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
    vistorias: {}, etapas: {}, fotos: {}, seq: 230
  };
  let quem = 'tec';
  const boot = () => {
    const usuario = quem === 'sup' ? db.sup : db.usuario;
    const ativa = Object.values(db.vistorias).find(v => v.status === 'em_andamento');
    return JSON.parse(JSON.stringify({
      usuario: usuario, equipe: db.equipe, cfg: db.cfg, empresa: db.empresa, dres: db.dres, escolas: db.escolas, roteiro: db.roteiro,
      stats: db.stats, pendencias: db.pendencias, hoje: dia(0), serverTime: new Date().toISOString(),
      vistoriaAtiva: ativa ? { id: ativa.id, codigo: ativa.codigo, escolaId: ativa.escolaId, status: ativa.status, checkin: ativa.checkin, etapas: db.etapas[ativa.id] || {}, fotos: Object.values(db.fotos).filter(f => f.vistoriaId === ativa.id) } : null
    }));
  };
  const relHtml = (tipo, v) => '<!DOCTYPE html><html><head><style>body{margin:0;font-family:Arial;background:transparent;' + (tipo === 'completo' ? 'white-space:nowrap;overflow-x:auto;padding:0 24px' : '') + '}.pg{display:inline-block;vertical-align:top;white-space:normal;width:794px;min-height:1123px;background:#fff;margin:0 14px 30px 0;box-shadow:0 10px 30px rgba(15,33,64,.18);padding:40px;box-sizing:border-box}.capa{background:#0F2140;color:#fff}</style></head><body>' +
    (tipo === 'completo' ? Array.from({ length: 12 }, (x, i) => '<div class="pg' + (i ? '' : ' capa') + '"><h1>' + (i ? 'Página ' + (i + 1) : 'Relatório Técnico de Vistoria e Pré-dimensionamento de Climatização') + '</h1><p>' + v.codigo + ' · prévia simulada</p></div>').join('')
      : '<div class="pg"><h2 style="text-align:center">RELATÓRIO DE VISTORIA</h2><p>Unidade: EMEF Brigadeiro Faria Lima</p><p>Prévia simulada (no Apps Script o layout oficial é gerado no servidor).</p></div>') + '</body></html>';
  const A = {
    login: p => { quem = /2001|roberto/.test(p.email) ? 'sup' : 'tec'; return p.senha === 'vistar2026' ? { token: 'tok', boot: boot() } : Promise.reject({ biz: 'Usuário ou senha incorretos.' }); },
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
        mapa: db.escolas.map((e, i) => ({ id: e.id, nome: e.nome, lat: e.lat, lng: e.lng, st: ['concluida', 'andamento', 'retorno', 'agendada', 'nao_iniciada'][i % 5] })) };
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
      validacao: { status: 'pendente' }, podeValidar: quem === 'sup' }),
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
    usuarios: () => ({ dres: ['Penha', 'Itaquera', 'Ermelino Matarazzo'], equipes: [{ id: 'eq01', nome: 'Equipe 01' }, { id: 'eq02', nome: 'Equipe 02' }, { id: 'eq03', nome: 'Equipe 03' }],
      usuarios: [{ id: 'u1', nome: 'Marcos Silva', email: 'marcos@x.com', matricula: '1001', perfil: 'tecnico', equipeId: 'eq02', ativo: true, ativado: true, ultimoAcesso: new Date().toISOString(), dres: 'Penha' },
        { id: 'u2', nome: 'João Souza', email: 'joao@x.com', matricula: '1002', perfil: 'tecnico', equipeId: 'eq02', ativo: true, ativado: false, codigoPendente: true, dres: 'Penha' },
        { id: 'u3', nome: 'Roberto Lima', email: 'roberto@x.com', matricula: '2001', perfil: 'supervisor', equipeId: '', ativo: true, ativado: true, dres: 'Penha, Itaquera' }] }),
    salvarUsuario: () => ({ id: 'u9', codigo: '482913' }), novoCodigo: () => ({ codigo: '774120' }),
    bootstrap: () => boot(),
    checkin: p => { db.vistorias[p.id] = { id: p.id, codigo: 'VST-2026-0' + (++db.seq), escolaId: p.escolaId, status: 'em_andamento', checkin: p.checkin }; db.equipe.status = 'em_campo'; return { id: p.id, codigo: db.vistorias[p.id].codigo }; },
    salvarEtapa: p => { (db.etapas[p.vistoriaId] = db.etapas[p.vistoriaId] || {})[p.etapa] = { dados: p.dados, ts: new Date().toISOString() }; return { ts: new Date().toISOString() }; },
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
        docs: { vistoria: { paginas: 1, tamanho: '0,8 MB' }, completo: { paginas: 12, tamanho: '2,4 MB' } },
        copia: ass && rev.respEmail ? { enviada: true, para: rev.respEmail, em: new Date().toISOString() } : { enviada: false }, equipeStatus: 'em_transito', proxima: { escolaId: 'e-infante', hora: '13:30' } };
    },
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
  window.MockApi = (acao, token, payload) => new Promise((res, rej) => setTimeout(() => {
    try {
      if (['login', 'validarCodigo', 'ativar', 'esqueciSenha'].indexOf(acao) < 0 && !token) return res({ ok: false, error: 'Sessão expirada', code: 'AUTH' });
      Promise.resolve(A[acao](payload)).then(d => res({ ok: true, data: d }), e => res({ ok: false, error: e.biz || String(e) }));
    } catch (e) { res({ ok: false, error: String(e) }); }
  }, 250));
  window.__MOCK_DB__ = db;
})();
