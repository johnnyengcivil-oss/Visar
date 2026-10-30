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
