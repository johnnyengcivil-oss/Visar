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
