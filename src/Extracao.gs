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
