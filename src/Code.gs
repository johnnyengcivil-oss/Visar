/**
 * VistAR · Ponto de entrada do App da Web.
 */

/** Meta tags que o Google aceita em App da Web (qualquer outra derruba a página). */
const META_PERMITIDAS_ = ['viewport', 'mobile-web-app-capable', 'apple-mobile-web-app-capable', 'apple-mobile-web-app-title', 'apple-mobile-web-app-status-bar-style'];

function doGet(e) {
  try {
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

    const out = t.evaluate().setTitle('VistAR · ' + cfg.CONSORCIO).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    [['viewport', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover'], ['mobile-web-app-capable', 'yes'],
      ['apple-mobile-web-app-capable', 'yes'], ['apple-mobile-web-app-title', 'VistAR'], ['apple-mobile-web-app-status-bar-style', 'black-translucent']]
      .forEach(m => { try { out.addMetaTag(m[0], m[1]); } catch (err) { console.warn('meta ' + m[0], err); } });
    return out;
  } catch (err) {
    console.error('[doGet]', err && err.stack ? err.stack : err);
    return paginaErro_(err);
  }
}

/** Página amigável quando o app não consegue abrir (com a causa mais provável). */
function paginaErro_(err) {
  const msg = String((err && err.message) || err);
  let dica = 'Tente recarregar a página. Se continuar, avise o administrador do sistema com a mensagem abaixo.';
  if (/Planilha não configurada|Aba ".*" não encontrada/.test(msg)) dica = 'O administrador precisa executar a função <b>instalarVistAR</b> no editor do Apps Script.';
  else if (/Arquivo HTML|No HTML file|não encontrado.*HTML|Index/i.test(msg)) dica = 'Falta um arquivo HTML no projeto. Confira se existem <b>Index</b>, <b>RelatorioVistoria</b> e <b>RelatorioCompleto</b>, com esses nomes exatos.';
  else if (/autoriza|authoriz|permission|permiss/i.test(msg)) dica = 'O administrador precisa abrir o editor do Apps Script, executar <b>instalarVistAR</b> e autorizar as permissões.';
  return HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;max-width:520px;margin:40px auto;padding:24px;border-radius:16px;background:#F1F4F8;color:#0F1E36">' +
    '<div style="font-size:28px;font-weight:800">Vist<span style="color:#1F8F86">AR</span></div>' +
    '<h2 style="margin:18px 0 8px">Não foi possível abrir o app</h2><p>' + dica + '</p>' +
    '<p style="background:#fff;border-radius:10px;padding:10px 12px;font-family:monospace;font-size:13px;color:#A62626">' + esc_(msg) + '</p>' +
    '<p><a href="" target="_top" style="color:#1F8F86;font-weight:bold">Tentar de novo</a></p></div>')
    .setTitle('VistAR · erro').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Inclui um arquivo HTML (CSS/JS) dentro do template. */
function include(nome) {
  try { return HtmlService.createHtmlOutputFromFile(nome).getContent(); }
  catch (err) { throw new Error('Arquivo HTML "' + nome + '" não encontrado no projeto (' + err.message + ').'); }
}

/** Erros passageiros do Google (cota, servidor ocupado, tempo): o app tenta de novo, sem contar como recusa. */
function erroTemporario_(msg) {
  return /Servidor ocupado|too many|Limite|quota|cota|Service invoked|Service unavailable|temporarily|temporariamente|timed out|tempo limite|Tempo máximo|Exceeded maximum execution|lock|Address unavailable|Ocorreu um erro do servidor|server error|Internal error|erro interno/i.test(msg);
}

/**
 * Ponto único chamado pelo cliente via google.script.run.api(acao, token, payload).
 * Sempre devolve { ok, data } ou { ok:false, error, code } — nunca lança exceção:
 *   code "AUTH" → entrar de novo; "TEMP" → falha passageira do Google (repetir);
 *   sem código → recusa de negócio (não repetir sem corrigir).
 */
function api(acao, token, payload) {
  const inicio = Date.now();
  let u = null;
  try {
    const def = acoes_()[acao];
    if (!def) throw new Error('Ação desconhecida: ' + acao + '. O app pode estar desatualizado: recarregue a página.');
    u = def.publico ? null : validarToken_(token);
    const exec = () => def.fn(payload || {}, u);
    const data = def.lock ? comLock_(exec) : exec();
    return { ok: true, data: data === undefined ? null : data, ms: Date.now() - inicio };
  } catch (err) {
    const msg = String((err && err.message) || err);
    const code = (err && err.code) || (erroTemporario_(msg) ? 'TEMP' : '');
    console.error('[api:' + acao + ']', err && err.stack ? err.stack : err);
    if (code !== 'AUTH') { try { log_(u ? u.id : '', 'erro', { acao: acao, erro: msg.slice(0, 300) }); } catch (x) { /* planilha indisponível */ } }
    return { ok: false, error: msg, code: code };
  }
}

/** Erros de tela (JavaScript no celular) registrados na aba Log para diagnóstico. */
function acaoLogErro_(p, u) {
  log_(u ? u.id : '', 'erro_app', { msg: String(p.msg || '').slice(0, 300), onde: String(p.onde || '').slice(0, 200), tela: p.tela || '', versao: p.versao || '' });
  return { ok: true };
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
    novoCodigo: { fn: acaoNovoCodigo_, lock: true },
    entrarVistoria: { fn: acaoEntrarVistoria_, lock: true },
    sairVistoria: { fn: acaoSairVistoria_, lock: true },
    puxarVistoria: { fn: acaoPuxarVistoria_ },
    guardarFalha: { fn: acaoGuardarFalha_, lock: true },
    logErro: { fn: acaoLogErro_ },
    perfis: { fn: acaoPerfis_ },
    salvarPerfil: { fn: acaoSalvarPerfil_, lock: true },
    excluirPerfil: { fn: acaoExcluirPerfil_, lock: true },
    restaurarPerfil: { fn: acaoRestaurarPerfil_, lock: true },
    cadastroEscolas: { fn: acaoCadastroEscolas_ },
    salvarEscola: { fn: acaoSalvarEscola_, lock: true },
    ativarEscola: { fn: acaoAtivarEscola_, lock: true },
    geocodificar: { fn: acaoGeocodificar_ },
    importarEscolas: { fn: acaoImportarEscolas_, lock: true },
    salvarDre: { fn: acaoSalvarDre_, lock: true },
    empresas: { fn: acaoEmpresas_ },
    salvarEmpresa: { fn: acaoSalvarEmpresa_, lock: true },
    compartilharPastaEmpresa: { fn: acaoCompartilharPastaEmpresa_, lock: true },
    equipesCad: { fn: acaoEquipesCad_ },
    salvarEquipe: { fn: acaoSalvarEquipe_, lock: true },
    configAdmin: { fn: acaoConfigAdmin_ },
    salvarConfig: { fn: acaoSalvarConfig_, lock: true },
    manual: { fn: acaoManual_ },
    consultaVistorias: { fn: acaoConsultaVistorias_ },
    extrair: { fn: acaoExtrair_ },
    candidatos: { fn: acaoCandidatos_ },
    salvarRoteiro: { fn: acaoSalvarRoteiro_, lock: true },
    orcamentos: { fn: acaoOrcamentos_, lock: true },
    orcamento: { fn: acaoOrcamento_, lock: true },
    atribuirOrcamento: { fn: acaoAtribuirOrcamento_, lock: true },
    uploadDocOrcamento: { fn: acaoUploadDocOrcamento_ },
    enviarOrcamento: { fn: acaoEnviarOrcamento_, lock: true },
    decidirOrcamento: { fn: acaoDecidirOrcamento_, lock: true }
  };
}
