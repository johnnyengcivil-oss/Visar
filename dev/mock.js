/* VistAR · servidor simulado para pré-visualização local (não vai para o Apps Script). */
(function () {
  const hoje = new Date();
  const dia = n => { const d = new Date(hoje.getTime() + n * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const E = (id, nome, cie, dre, log, num, cep, bairro, lat, lng, amb, status, nota) => ({ id, nome, cie, dre, etapaEnsino: 'Ensino Fundamental', logradouro: log, numero: num, cep, bairro, lat, lng, ambientesPrevistos: String(amb), status, nota: nota || '', imovel: 'Próprio', idadeAnos: '30', diretor: '', telefone: '(11) 2222-0000', email: '' });
  const db = {
    usuario: { id: 'u-marcos', email: 'marcos@exemplo.com', nome: 'Marcos Silva', cargo: 'Técnico de campo', equipeId: 'eq02', rg: '12.345.678-9', empresa: 'Almeida Sapata Engenharia e Construções Ltda.', perfil: 'admin', dres: ['Penha', 'Itaquera', 'Ermelino Matarazzo'], fotoId: '', iniciais: 'MS' },
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
  const boot = () => {
    const ativa = Object.values(db.vistorias).find(v => v.status === 'em_andamento');
    return JSON.parse(JSON.stringify({
      usuario: db.usuario, equipe: db.equipe, cfg: db.cfg, empresa: db.empresa, dres: db.dres, escolas: db.escolas, roteiro: db.roteiro,
      stats: db.stats, pendencias: db.pendencias, hoje: dia(0), serverTime: new Date().toISOString(),
      vistoriaAtiva: ativa ? { id: ativa.id, codigo: ativa.codigo, escolaId: ativa.escolaId, status: ativa.status, checkin: ativa.checkin, etapas: db.etapas[ativa.id] || {}, fotos: Object.values(db.fotos).filter(f => f.vistoriaId === ativa.id) } : null
    }));
  };
  const relHtml = (tipo, v) => '<!DOCTYPE html><html><head><style>body{margin:0;font-family:Arial;background:transparent;' + (tipo === 'completo' ? 'white-space:nowrap;overflow-x:auto;padding:0 24px' : '') + '}.pg{display:inline-block;vertical-align:top;white-space:normal;width:794px;min-height:1123px;background:#fff;margin:0 14px 30px 0;box-shadow:0 10px 30px rgba(15,33,64,.18);padding:40px;box-sizing:border-box}.capa{background:#0F2140;color:#fff}</style></head><body>' +
    (tipo === 'completo' ? Array.from({ length: 12 }, (x, i) => '<div class="pg' + (i ? '' : ' capa') + '"><h1>' + (i ? 'Página ' + (i + 1) : 'Relatório Técnico de Vistoria e Pré-dimensionamento de Climatização') + '</h1><p>' + v.codigo + ' · prévia simulada</p></div>').join('')
      : '<div class="pg"><h2 style="text-align:center">RELATÓRIO DE VISTORIA</h2><p>Unidade: EMEF Brigadeiro Faria Lima</p><p>Prévia simulada (no Apps Script o layout oficial é gerado no servidor).</p></div>') + '</body></html>';
  const A = {
    login: p => p.senha === 'vistar2026' ? { token: 'tok', boot: boot() } : Promise.reject({ biz: 'E-mail ou senha incorretos.' }),
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
    escola: p => ({ escola: db.escolas.find(e => e.id === p.escolaId), historico: [], pendencias: db.pendencias.filter(x => x.escolaId === p.escolaId) }),
    thumbs: () => ({}),
    resolverPendencia: p => { db.pendencias = db.pendencias.filter(x => x.id !== p.id); return { ok: true }; },
    senha: () => ({ token: 'tok' }),
    fotoPerfil: () => ({ fotoId: 'perfil1' }),
    statusEquipe: p => ({ status: p.status })
  };
  window.MockApi = (acao, token, payload) => new Promise((res, rej) => setTimeout(() => {
    try {
      if (acao !== 'login' && !token) return res({ ok: false, error: 'Sessão expirada', code: 'AUTH' });
      Promise.resolve(A[acao](payload)).then(d => res({ ok: true, data: d }), e => res({ ok: false, error: e.biz || String(e) }));
    } catch (e) { res({ ok: false, error: String(e) }); }
  }, 250));
  window.__MOCK_DB__ = db;
})();
