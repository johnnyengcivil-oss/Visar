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
const CAPACIDADES_BTU_ = [9000, 12000, 18000, 24000, 30000, 36000, 48000, 58000, 60000];

function capacidadeComercial_(btu) {
  for (let i = 0; i < CAPACIDADES_BTU_.length; i++) if (btu <= CAPACIDADES_BTU_[i]) return CAPACIDADES_BTU_[i];
  return Math.ceil(btu / 12000) * 12000;
}

function nomePav_(p) { return Number(p) === 0 ? 'Térreo' : p + 'º pav.'; }
function letraBloco_(b) { return String.fromCharCode(65 + Number(b || 0)); }
function cvParaW_(pot, un) { const n = dec_(pot); return un === 'CV' ? n * 735.5 : n; }

function preDimensionamento_(et, cfg) {
  const estr = et.estrutura || {};
  const blocos = estr.blocos || [];
  const itens = ((et.ambientes || {}).itens || []);
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
    const fator = a.externo ? 0 : FATOR_BTU_M2_[tipo];
    if (!fator || !areaUn) return;
    const bl = blocos[Number(a.bloco) || 0] || {};
    const ultimo = Number(a.pav) === (Number(bl.pav) || 1) - 1;
    const fach = a.fachadas || [];
    const sol = fach.indexOf('Norte') >= 0 || fach.indexOf('Oeste') >= 0;
    const mult = 1 + (sol ? 0.1 : 0) + (ultimo ? 0.1 : 0);
    const equipW = (a.tue || []).reduce((s, t) => s + (Number(t.qtd) || 0) * (POT_TUE_W_[t.nome] !== undefined ? POT_TUE_W_[t.nome] : 150), 0);
    const btuUn = areaUn * fator * mult + equipW * 3.412;
    const cap = capacidadeComercial_(btuUn);
    areaClim += areaUn * qtd;
    btu += cap * qtd;
    linhas.push({
      local: 'Bloco ' + letraBloco_(a.bloco) + ' · ' + nomePav_(a.pav), nome: a.nome || tipo, tipo: tipo, qtd: qtd,
      areaUn: areaUn, fator: fator, ajustes: [sol ? 'insolação N/O +10%' : '', ultimo ? 'último pav. +10%' : ''].filter(String).join(', '),
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
    const disj = dec_((en.cx2 || {}).disjuntor);
    kwEntrada = Math.sqrt(3) * vll * disj * 0.92 / 1000;
    const m = en.med || {};
    const imax = Math.max(dec_(m.ir), dec_(m.is), dec_(m.it));
    kwMedido = Math.sqrt(3) * vll * imax * 0.92 / 1000;
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
    fmt: fmtNum_, letra: letraBloco_, pav: nomePav_, cvParaW: cvParaW_
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
  exigirVistoria_(p.vistoriaId, u);
  const R = dadosRelatorio_(p.vistoriaId);
  const html = htmlRelatorio_(R, p.tipo, 'tela');
  return {
    html: html, assinado: R.assinado, codigo: R.v.codigo, geradoEm: R.geradoEm,
    paginas: (html.match(/class="pg/g) || []).length || 1
  };
}

function acaoPdf_(p, u) {
  exigirVistoria_(p.vistoriaId, u);
  const r = gerarPdf_(p.vistoriaId, p.tipo);
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
  MailApp.sendEmail({
    to: para, cc: cfg.EMAIL_COPIA_CONSORCIO || '', name: 'VistAR · ' + cfg.CONSORCIO,
    subject: 'Relatório de vistoria · ' + R.escola.nome + ' · ' + R.data, htmlBody: corpo, attachments: anexos
  });
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
  rotulo: function (e) { return rotuloEtapa_(e); }
};
