/**
 * VistAR · Autenticação própria (e-mail + senha) com token assinado (HMAC).
 * Com a implantação em domínio Google Workspace, o login também é automático
 * pelo e-mail da conta Google (SSO) quando ele existe na aba Usuarios.
 */

function segredo_() {
  const p = PropertiesService.getScriptProperties();
  let s = p.getProperty('TOKEN_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('TOKEN_SECRET', s); }
  return s;
}

function hashSenha_(senha, salt) {
  let h = String(senha);
  for (let i = 0; i < 300; i++) {
    h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + h + salt, Utilities.Charset.UTF_8));
  }
  return h;
}

function criarUsuario_(dados, senha) {
  const atual = Db.find('Usuarios', dados.id);
  const u = Db.upsert('Usuarios', Object.assign({ ativo: 'sim', criadoEm: agora_(), tokenVersao: '1' }, atual || {}, dados));
  if (senha && (!atual || !atual.senhaHash)) definirSenha_(u, senha);
  return u;
}

function definirSenha_(u, senha) {
  if (String(senha || '').length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
  const salt = Utilities.getUuid();
  Db.upsert('Usuarios', { id: u.id, salt: salt, senhaHash: hashSenha_(senha, salt), tokenVersao: String((Number(u.tokenVersao) || 1) + 1) });
}

function emitirToken_(u) {
  const dias = Number(getConfig_().TOKEN_DIAS) || 30;
  const corpo = Utilities.base64EncodeWebSafe(JSON.stringify({ u: u.id, v: String(u.tokenVersao || '1'), e: Date.now() + dias * 864e5 }));
  const sig = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(corpo, segredo_()));
  return corpo + '.' + sig;
}

function erroAuth_(msg) { const e = new Error(msg || 'Sessão expirada. Entre novamente.'); e.code = 'AUTH'; return e; }

function validarToken_(token) {
  if (!token || String(token).indexOf('.') < 0) throw erroAuth_();
  const partes = String(token).split('.');
  const sig = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(partes[0], segredo_()));
  if (sig !== partes[1]) throw erroAuth_();
  const p = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(partes[0])).getDataAsString());
  if (!p.e || p.e < Date.now()) throw erroAuth_();
  const u = Db.find('Usuarios', p.u);
  if (!u || u.ativo === 'nao') throw erroAuth_('Usuário desativado.');
  if (String(u.tokenVersao || '1') !== String(p.v)) throw erroAuth_();
  return u;
}

function acaoLogin_(p) {
  const email = String(p.email || '').trim().toLowerCase();
  const cache = CacheService.getScriptCache();
  const chave = 'tent:' + email;
  const tentativas = Number(cache.get(chave) || 0);
  if (tentativas >= 6) throw new Error('Muitas tentativas. Aguarde 10 minutos.');
  const u = Db.all('Usuarios').find(x => String(x.email).toLowerCase() === email && x.ativo !== 'nao');
  if (!u || !u.senhaHash || hashSenha_(p.senha || '', u.salt) !== u.senhaHash) {
    cache.put(chave, String(tentativas + 1), 600);
    throw new Error('E-mail ou senha incorretos.');
  }
  cache.remove(chave);
  log_(u.id, 'login', '');
  return { token: emitirToken_(u), boot: montarBoot_(u) };
}

function acaoSenha_(p, u) {
  if (hashSenha_(p.atual || '', u.salt) !== u.senhaHash) throw new Error('Senha atual incorreta.');
  definirSenha_(u, p.nova);
  const atualizado = Db.find('Usuarios', u.id);
  log_(u.id, 'senha', 'alterada');
  return { token: emitirToken_(atualizado) };
}

function publicoUsuario_(u) {
  return {
    id: u.id, email: u.email, nome: u.nome, cargo: u.cargo, equipeId: u.equipeId, rg: u.rg,
    empresa: u.empresa, telefone: u.telefone, perfil: u.perfil, dres: lista_(u.dres), fotoId: u.fotoId,
    iniciais: String(u.nome || '?').split(/\s+/).filter(String).map(s => s[0]).slice(0, 2).join('').toUpperCase()
  };
}
