/**
 * VistAR · Ponto de entrada do App da Web.
 */

function doGet(e) {
  const t = HtmlService.createTemplateFromFile('Index');
  const cfg = getConfig_();
  let sso = null;
  try {
    const email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
    if (email) {
      const u = Db.all('Usuarios').find(x => String(x.email).toLowerCase() === email && x.ativo !== 'nao');
      if (u) sso = { token: emitirToken_(u), email: email };
    }
  } catch (err) { /* sem e-mail disponível para esta implantação */ }

  t.boot = JSON.stringify({ cfg: configPublica_(cfg), sso: sso, params: (e && e.parameter) || {} })
    .replace(/</g, '\\u003c');

  return t.evaluate()
    .setTitle('VistAR · ' + cfg.CONSORCIO)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover')
    .addMetaTag('mobile-web-app-capable', 'yes')
    .addMetaTag('apple-mobile-web-app-capable', 'yes')
    .addMetaTag('theme-color', '#0F2140')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Inclui um arquivo HTML (CSS/JS) dentro do template. */
function include(nome) {
  return HtmlService.createHtmlOutputFromFile(nome).getContent();
}

/**
 * Ponto único chamado pelo cliente via google.script.run.api(acao, token, payload).
 * Sempre devolve { ok, data } ou { ok:false, error, code } — nunca lança exceção,
 * para o cliente diferenciar erro de negócio (não repetir) de falha de rede (repetir).
 */
function api(acao, token, payload) {
  const inicio = Date.now();
  try {
    const def = acoes_()[acao];
    if (!def) throw new Error('Ação desconhecida: ' + acao);
    const u = def.publico ? null : validarToken_(token);
    const exec = () => def.fn(payload || {}, u);
    const data = def.lock ? comLock_(exec) : exec();
    return { ok: true, data: data === undefined ? null : data, ms: Date.now() - inicio };
  } catch (err) {
    console.error('[api:' + acao + ']', err && err.stack ? err.stack : err);
    return { ok: false, error: String((err && err.message) || err), code: (err && err.code) || '' };
  }
}

/** Montado sob demanda: evita depender da ordem de carga dos arquivos .gs. */
function acoes_() {
  return {
    login: { fn: acaoLogin_, publico: true },
    bootstrap: { fn: (p, u) => montarBoot_(u) },
    senha: { fn: acaoSenha_, lock: true },
    fotoPerfil: { fn: acaoFotoPerfil_, lock: true },
    checkin: { fn: acaoCheckin_, lock: true },
    salvarEtapa: { fn: acaoSalvarEtapa_, lock: true },
    uploadFoto: { fn: acaoUploadFoto_, lock: true },
    removerFoto: { fn: acaoRemoverFoto_, lock: true },
    cancelar: { fn: acaoCancelar_, lock: true },
    finalizar: { fn: acaoFinalizar_, lock: true },
    relatorio: { fn: acaoRelatorio_ },
    pdf: { fn: acaoPdf_ },
    enviarCopia: { fn: acaoEnviarCopia_ },
    rota: { fn: acaoRota_ },
    escola: { fn: acaoEscola_ },
    thumbs: { fn: acaoThumbs_ },
    resolverPendencia: { fn: acaoResolverPendencia_, lock: true },
    statusEquipe: { fn: acaoStatusEquipe_, lock: true },
    validarCodigo: { fn: acaoValidarCodigo_, publico: true },
    ativar: { fn: acaoAtivar_, publico: true, lock: true },
    esqueciSenha: { fn: acaoEsqueciSenha_, publico: true, lock: true },
    ping: { fn: acaoPing_, lock: true },
    painel: { fn: acaoPainel_ },
    equipes: { fn: acaoEquipes_ },
    validacoes: { fn: acaoValidacoes_ },
    validar: { fn: acaoValidar_, lock: true },
    vistoriaDetalhe: { fn: acaoVistoriaDetalhe_ },
    reabrir: { fn: acaoReabrir_, lock: true },
    pendenciasPainel: { fn: acaoPendenciasPainel_ },
    reagendar: { fn: acaoReagendar_, lock: true },
    cobrarDre: { fn: acaoCobrarDre_, lock: true },
    registro: { fn: acaoRegistro_ },
    retomarDados: { fn: acaoRetomarDados_ },
    programacao: { fn: acaoProgramacao_ },
    salvarVisita: { fn: acaoSalvarVisita_, lock: true },
    excluirVisita: { fn: acaoExcluirVisita_, lock: true },
    galeria: { fn: acaoGaleria_ },
    legenda: { fn: acaoLegenda_, lock: true },
    usuarios: { fn: acaoUsuarios_ },
    salvarUsuario: { fn: acaoSalvarUsuario_, lock: true },
    novoCodigo: { fn: acaoNovoCodigo_, lock: true }
  };
}
