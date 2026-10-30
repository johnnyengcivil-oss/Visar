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

  // Relatórios em PDF no Drive.
  const docs = {};
  try { docs.vistoria = gerarPdf_(v.id, 'vistoria'); } catch (e) { console.error(e); docs.vistoria = { erro: String(e.message || e) }; }
  try { docs.completo = gerarPdf_(v.id, 'completo'); } catch (e) { console.error(e); docs.completo = { erro: String(e.message || e) }; }

  let copia = { enviada: false };
  const rev = ((lerEtapas_(v.id).revisao || {}).dados) || {};
  const para = rev.respEmail || escola.email;
  if (/^sim/i.test(cfg.ENVIO_AUTOMATICO_COPIA) && para && vf.assinadoEm && !vf.copiaEnviadaEm) {
    try { copia = acaoEnviarCopia_({ vistoriaId: v.id, para: para }, u); } catch (e) { copia = { enviada: false, erro: String(e.message || e) }; }
  } else if (vf.copiaEnviadaEm) {
    copia = { enviada: true, para: vf.copiaPara, em: vf.copiaEnviadaEm };
  }
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
