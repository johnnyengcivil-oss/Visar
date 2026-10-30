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
