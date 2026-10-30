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
