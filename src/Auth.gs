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

function emitirToken_(u, curto) {
  const dias = curto ? 1 : (Number(getConfig_().TOKEN_DIAS) || 30);
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

/** Encontra o usuário pelo e-mail ou pela matrícula. */
function acharUsuario_(login) {
  const l = String(login || '').trim().toLowerCase();
  if (!l) return null;
  return Db.all('Usuarios').find(x => x.ativo !== 'nao' && (String(x.email).toLowerCase() === l || (x.matricula && String(x.matricula).toLowerCase() === l))) || null;
}

function limiteTentativas_(chave) {
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get(chave) || 0);
  if (n >= 6) throw new Error('Muitas tentativas. Aguarde 10 minutos.');
  return () => cache.put(chave, String(n + 1), 600);
}

function acaoLogin_(p) {
  const chave = 'tent:' + String(p.email || '').trim().toLowerCase();
  const falhou = limiteTentativas_(chave);
  const u = acharUsuario_(p.email);
  if (u && !u.senhaHash && u.codigoAtivacao) throw new Error('Este acesso ainda não foi ativado. Toque em "Primeiro acesso".');
  if (!u || !u.senhaHash || hashSenha_(p.senha || '', u.salt) !== u.senhaHash) { falhou(); throw new Error('Usuário ou senha incorretos.'); }
  CacheService.getScriptCache().remove(chave);
  Db.upsert('Usuarios', { id: u.id, ultimoAcesso: agora_() });
  log_(u.id, 'login', '');
  return { token: emitirToken_(u, p.manter === false), boot: montarBoot_(u) };
}

/** Código de 6 dígitos, válido por 72 h, para primeiro acesso ou nova senha. */
function gerarCodigo_(u) {
  const cod = String(Math.floor(100000 + Math.random() * 900000));
  Db.upsert('Usuarios', { id: u.id, codigoAtivacao: cod, codigoExpira: new Date(Date.now() + 72 * 3600e3).toISOString() });
  return cod;
}

function conferirCodigo_(p) {
  const falhou = limiteTentativas_('cod:' + String(p.login || '').toLowerCase());
  const u = acharUsuario_(p.login);
  const ok = u && u.codigoAtivacao && String(u.codigoAtivacao) === String(p.codigo || '').trim() && new Date(u.codigoExpira) > new Date();
  if (!ok) { falhou(); throw new Error('Código inválido ou vencido. Peça um novo ao administrador.'); }
  return u;
}

function acaoValidarCodigo_(p) {
  const u = conferirCodigo_(p);
  const eq = Db.find('Equipes', u.equipeId) || {};
  return { nome: u.nome, cargo: u.cargo, equipe: eq.nome || '', iniciais: publicoUsuario_(u).iniciais };
}

function senhaForte_(s) {
  s = String(s || '');
  if (s.length < 8 || !/[A-Z]/.test(s) || !/\d/.test(s)) throw new Error('A senha precisa de 8 caracteres, uma letra maiúscula e um número.');
}

function acaoAtivar_(p) {
  const u = conferirCodigo_(p);
  if (!p.aceite) throw new Error('É preciso aceitar os termos de uso.');
  senhaForte_(p.senha);
  definirSenha_(u, p.senha);
  Db.upsert('Usuarios', { id: u.id, codigoAtivacao: '', codigoExpira: '', ultimoAcesso: agora_() });
  const atual = Db.find('Usuarios', u.id);
  log_(u.id, 'ativacao', '');
  return { token: emitirToken_(atual), boot: montarBoot_(atual) };
}

/** Envia um código de redefinição para o e-mail do usuário (resposta sempre genérica). */
function acaoEsqueciSenha_(p) {
  limiteTentativas_('esq:' + String(p.login || '').toLowerCase())();
  const u = acharUsuario_(p.login);
  if (u && /@/.test(u.email)) {
    const cod = gerarCodigo_(u);
    const cfg = getConfig_();
    try {
      MailApp.sendEmail({
        to: u.email, name: 'VistAR · ' + cfg.CONSORCIO, subject: 'Seu código de acesso ao VistAR',
        htmlBody: '<div style="font-family:Arial,sans-serif"><p>Olá, ' + esc_(u.nome) + '.</p><p>Use o código abaixo em <b>Primeiro acesso</b> para criar uma nova senha. Ele vale por 72 horas.</p>' +
          '<p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#0F2140">' + cod + '</p><p style="color:#5B6B82">Se não foi você, ignore este e-mail.</p></div>'
      });
    } catch (e) { console.warn(e); }
    log_(u.id, 'esqueci', '');
  }
  return { ok: true };
}

function acaoSenha_(p, u) {
  if (hashSenha_(p.atual || '', u.salt) !== u.senhaHash) throw new Error('Senha atual incorreta.');
  senhaForte_(p.nova);
  definirSenha_(u, p.nova);
  const atualizado = Db.find('Usuarios', u.id);
  log_(u.id, 'senha', 'alterada');
  return { token: emitirToken_(atualizado) };
}

function publicoUsuario_(u) {
  return {
    id: u.id, email: u.email, nome: u.nome, cargo: u.cargo, equipeId: u.equipeId, rg: u.rg,
    empresa: u.empresa, telefone: u.telefone, perfil: u.perfil || 'tecnico', dres: lista_(u.dres), fotoId: u.fotoId, matricula: u.matricula,
    supervisor: ['supervisor', 'admin', 'coordenacao'].indexOf(u.perfil) >= 0,
    iniciais: String(u.nome || '?').split(/\s+/).filter(String).map(s => s[0]).slice(0, 2).join('').toUpperCase()
  };
}
