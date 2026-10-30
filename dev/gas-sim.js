#!/usr/bin/env node
/**
 * Teste do SERVIDOR (arquivos .gs) fora do Google: simula Planilha, Drive,
 * Cache, Propriedades, MailApp, HtmlService (templates <? ?>) e executa o fluxo
 * completo pela função api() — a mesma que o app chama.
 *   node dev/gas-sim.js          (testa src/)
 *   node dev/gas-sim.js --dist   (testa o pacote de instalação dist/)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const SRC = path.join(__dirname, '..', process.argv.includes('--dist') ? 'dist' : 'src');

/* ───── Planilha em memória ───── */
function fakeSheet(nome) {
  const rows = [];
  const sh = {
    nome, rows, maxCols: 26,
    getName: () => nome,
    getLastRow: () => { let n = rows.length; while (n && rows[n - 1].every(v => v === '' || v === undefined)) n--; return n; },
    getMaxRows: () => Math.max(1000, rows.length), getMaxColumns: () => sh.maxCols,
    insertColumnsAfter: (a, n) => { sh.maxCols += n; },
    setFrozenRows: () => {}, deleteRow: r => { rows.splice(r - 1, 1); },
    getRange: (r, c, nr, nc) => {
      if (typeof r === 'string') { r = 1; c = 1; nr = 1; nc = 1; }
      nr = nr || 1; nc = nc || 1;
      const rg = {
        getValues: () => Array.from({ length: nr }, (x, i) => Array.from({ length: nc }, (y, j) => { const row = rows[r - 1 + i] || []; const v = row[c - 1 + j]; return v === undefined ? '' : v; })),
        setValues: vals => { vals.forEach((linha, i) => { const k = r - 1 + i; while (rows.length <= k) rows.push([]); linha.forEach((v, j) => { let x = v; if (typeof x === 'string' && x[0] === "'") x = x.slice(1); rows[k][c - 1 + j] = x; }); }); return rg; },
        setNumberFormat: () => rg, setFontWeight: () => rg, setBackground: () => rg, setFontColor: () => rg,
        createTextFinder: txt => ({ matchEntireCell: () => ({ findNext: () => {
          for (let i = 0; i < nr; i++) { const row = rows[r - 1 + i]; if (row && String(row[c - 1]) === txt) return { getRow: () => r + i }; }
          return null;
        } }) })
      };
      return rg;
    }
  };
  return sh;
}
function fakeSS() {
  const sheets = {};
  const ss = {
    getId: () => 'ss1', getUrl: () => 'https://docs.google.com/spreadsheets/d/ss1',
    getSheetByName: n => sheets[n] || null, insertSheet: n => (sheets[n] = fakeSheet(n)),
    getSheets: () => Object.values(sheets), deleteSheet: s => { delete sheets[s.nome]; }, _sheets: sheets
  };
  return ss;
}

/* ───── Drive em memória ───── */
const drive = { files: {}, folders: {}, seq: 0 };
function fakeFolder(nome) {
  const id = 'fd' + (++drive.seq);
  const f = {
    id, nome, filhos: [], getId: () => id, getName: () => nome, isTrashed: () => false,
    getFoldersByName: n => { const l = f.filhos.filter(x => x.nome === n); let i = 0; return { hasNext: () => i < l.length, next: () => l[i++] }; },
    createFolder: n => { const x = fakeFolder(n); f.filhos.push(x); return x; },
    createFile: blob => {
      const fid = 'f' + (++drive.seq);
      const file = { getId: () => fid, getUrl: () => 'https://drive.google.com/file/d/' + fid, setDescription: () => file, setTrashed: () => {}, getSize: () => blob.getBytes().length,
        getBlob: () => blob, getThumbnail: () => blob, nome: blob.getName() };
      drive.files[fid] = file; return file;
    }
  };
  drive.folders[id] = f;
  return f;
}
function fakeBlob(bytes, tipo, nome) {
  let n = nome || 'blob';
  const b = { getBytes: () => bytes, getContentType: () => tipo, getName: () => n, setName: x => { n = x; return b; }, getDataAsString: () => Buffer.from(bytes).toString('utf8') };
  return b;
}

/* ───── Template do HtmlService ───── */
function compilar(src) {
  let code = 'let __o="";with(__d){';
  let last = 0;
  src.replace(/<\?(!?=)?([\s\S]*?)\?>/g, (m, tipo, corpo, idx) => {
    code += '__o+=' + JSON.stringify(src.slice(last, idx)) + ';';
    const expr = corpo.trim().replace(/;+$/, '');
    if (tipo === '=') code += '__o+=__esc(' + expr + ');';
    else if (tipo === '!=') code += '__o+=String(' + expr + ');';
    else code += corpo + '\n';
    last = idx + m.length;
    return m;
  });
  code += '__o+=' + JSON.stringify(src.slice(last)) + ';}return __o;';
  return new Function('__d', '__esc', code);
}
const escHtml = v => String(v === null || v === undefined ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const ler = n => { const f = path.join(SRC, n + '.html'); if (!fs.existsSync(f)) throw new Error('No HTML file named ' + n); return fs.readFileSync(f, 'utf8'); };
/** Saída do HtmlService com as mesmas restrições do Google (meta tags permitidas). */
const META_OK = ['viewport', 'mobile-web-app-capable', 'apple-mobile-web-app-capable', 'apple-mobile-web-app-title', 'apple-mobile-web-app-status-bar-style', 'google-site-verification'];
function saida(html) {
  const o = {
    html, metas: [], getContent: () => html, setTitle: t => { o.titulo = t; return o; }, setXFrameOptionsMode: () => o, setFaviconUrl: () => o,
    addMetaTag: (n, v) => { if (META_OK.indexOf(n) < 0) throw new Error('A metatag especificada não é permitida neste contexto.'); o.metas.push(n); return o; },
    getAs: tipo => fakeBlob(Array.from(Buffer.from('%PDF ' + html.length)), tipo, 'x.pdf')
  };
  return o;
}

/* ───── Serviços ───── */
const props = {};
const cache = {};
const emails = [];
const ss = fakeSS();
const S = {
  console: { log: console.log, warn: () => {}, error: () => {} }, JSON, Math, Date, Object, Array, String, Number, Boolean, RegExp, Error, isNaN, parseInt, parseFloat, encodeURIComponent,
  SpreadsheetApp: { getActiveSpreadsheet: () => ss, openById: () => ss, create: () => ss, getUi: () => { throw new Error('sem UI'); } },
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] || null, setProperty: (k, v) => { props[k] = String(v); } }) },
  CacheService: { getScriptCache: () => ({ get: k => cache[k] || null, put: (k, v) => { cache[k] = v; }, remove: k => { delete cache[k]; } }) },
  LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
  Session: { getEffectiveUser: () => ({ getEmail: () => 'coord@exemplo.com' }), getActiveUser: () => ({ getEmail: () => '' }) },
  Utilities: {
    formatDate: (d, tz, f) => {
      const x = new Date(new Date(d).getTime() - 3 * 3600e3); const p = n => String(n).padStart(2, '0');
      return f.replace('yyyy', x.getUTCFullYear()).replace('yy', String(x.getUTCFullYear()).slice(2)).replace('MM', p(x.getUTCMonth() + 1)).replace('dd', p(x.getUTCDate()))
        .replace('HH', p(x.getUTCHours())).replace('mm', p(x.getUTCMinutes())).replace('ss', p(x.getUTCSeconds()));
    },
    getUuid: () => crypto.randomUUID(),
    DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
    computeDigest: (alg, s) => Array.from(crypto.createHash('sha256').update(s).digest()),
    computeHmacSha256Signature: (s, k) => Array.from(crypto.createHmac('sha256', k).update(s).digest()),
    base64Encode: b => Buffer.from(typeof b === 'string' ? b : Uint8Array.from(b.map(x => x & 255))).toString('base64'),
    base64EncodeWebSafe: b => Buffer.from(typeof b === 'string' ? b : Uint8Array.from(b.map(x => x & 255))).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
    base64DecodeWebSafe: s => Array.from(Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')),
    base64Decode: s => Array.from(Buffer.from(s, 'base64')),
    newBlob: (bytes, tipo, nome) => fakeBlob(typeof bytes === 'string' ? Array.from(Buffer.from(bytes)) : bytes, tipo, nome),
    sleep: () => {}
  },
  DriveApp: { createFolder: n => fakeFolder(n), getFolderById: id => { if (!drive.folders[id]) throw new Error('nf'); return drive.folders[id]; },
    getFileById: id => { if (!drive.files[id]) throw new Error('arquivo não encontrado'); return drive.files[id]; } },
  Drive: { Files: { get: () => { throw new Error('sem serviço avançado no simulador'); } } },
  UrlFetchApp: { fetchAll: () => [] },
  MailApp: { sendEmail: o => { if ('cc' in o && !o.cc) throw new Error('Endereço de e-mail inválido: '); emails.push(o); }, getRemainingDailyQuota: () => 100 },
  ScriptApp: { getOAuthToken: () => 't', getService: () => ({ getUrl: () => 'https://script.google.com/macros/s/X/exec' }), getProjectTriggers: () => [],
    newTrigger: () => { const t = { timeBased: () => t, atHour: () => t, everyDays: () => t, inTimezone: () => t, create: () => t }; return t; }, deleteTrigger: () => {} },
  Maps: { newDirectionFinder: () => { throw new Error('Maps indisponível no simulador'); }, DirectionFinder: { Mode: {} } },
  MimeType: { PDF: 'application/pdf' },
  HtmlService: {
    createTemplateFromFile: n => {
      ler(n);
      const t = { evaluate: () => { const html = compilar(ler(n))(Object.assign({ include: ctx.include }, t), escHtml); return saida(html); } };
      return t;
    },
    createHtmlOutput: html => saida(html),
    createHtmlOutputFromFile: n => saida(ler(n)),
    XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' }
  }
};
const ctx = vm.createContext(S);
fs.readdirSync(SRC).filter(f => f.endsWith('.gs')).sort().forEach(f => vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), ctx, { filename: f }));

/* ───── Roteiro de teste ───── */
let falhas = 0;
const ok = (c, msg) => { if (!c) { falhas++; console.error('  ✗ ' + msg); } else console.log('  ✓ ' + msg); };
const api = (acao, token, p) => { const r = ctx.api(acao, token, p || {}); if (!r.ok) console.log('    (' + acao + ' → ' + r.error + ')'); return r; };
const png = 'data:image/jpeg;base64,' + Buffer.from('fake-jpeg').toString('base64');

console.log('Instalação e dados de exemplo');
const msg = ctx.carregarExemplo();
ok(/Primeiro acesso de teste/.test(msg), 'carregarExemplo devolve as credenciais');
ok(ss.getSheetByName('Usuarios').getLastRow() >= 5, 'usuários criados');

console.log('Abrir o app (doGet)');
const pg = ctx.doGet({ parameter: {} }); if (pg.titulo === 'VistAR · erro') console.log('    ' + pg.html.replace(/<[^>]+>/g, ' ').slice(0, 400));
ok(/window.__BOOT__ = \{/.test(pg.html) && pg.metas.indexOf('viewport') >= 0 && !/<\?/.test(pg.html), 'página do app abre com as meta tags permitidas pelo Google');
ok(/App\.start\(\)/.test(pg.html) && pg.html.length > 100000, 'app completo dentro da página (' + Math.round(pg.html.length / 1024) + ' KB)');

console.log('Login');
ok(!api('login', '', { email: '1001', senha: 'errada' }).ok, 'senha errada é recusada');
const lg = api('login', '', { email: '1001', senha: 'vistar2026' });
ok(lg.ok && lg.data.token, 'técnico entra pela matrícula');
const T = lg.data.token;
ok(lg.data.boot.roteiro.length >= 10 && lg.data.boot.stats.concluidas === 6, 'bootstrap traz roteiro e indicadores (6 concluídas)');
ok(!api('bootstrap', 'lixo').ok && api('bootstrap', 'lixo').code === 'AUTH', 'token inválido gera AUTH');

console.log('Primeiro acesso');
const cod = /código (\d{6})/.exec(msg)[1];
ok(api('validarCodigo', '', { login: '1002', codigo: cod }).ok, 'código de ativação válido');
ok(!api('ativar', '', { login: '1002', codigo: cod, senha: 'fraca', aceite: true }).ok, 'senha fraca recusada');
const at = api('ativar', '', { login: '1002', codigo: cod, senha: 'Vistar2026', aceite: true });
ok(at.ok && at.data.token, 'conta ativada e já logada');
ok(!api('validarCodigo', '', { login: '1002', codigo: cod }).ok, 'código não pode ser reutilizado');
ok(api('esqueciSenha', '', { login: 'joao.souza@exemplo.com' }).ok && emails.length === 1, 'esqueci a senha envia e-mail');

console.log('Vistoria completa');
const vid = 'v-teste-1';
const ck = api('checkin', T, { id: vid, escolaId: 'e-farialima', checkin: new Date().toISOString(), lat: -23.54, lng: -46.52 });
ok(ck.ok && /^VST-\d{4}-0001$/.test(ck.data.codigo), 'check-in gera código ' + (ck.data && ck.data.codigo));
ok(api('checkin', T, { id: vid, escolaId: 'e-farialima' }).ok, 'check-in repetido é idempotente');
const TJ = at.data.token; // João, da mesma equipe
ok(api('checkin', TJ, { id: 'v-par', escolaId: 'e-alencar', checkin: new Date().toISOString() }).ok, 'colega da mesma equipe abre outra escola ao mesmo tempo');
ok(api('bootstrap', T).data.emAndamento.length === 2, 'a equipe vê as duas vistorias abertas');
ok(api('bootstrap', T).data.vistoriaAtiva.id === vid && api('bootstrap', TJ).data.vistoriaAtiva.id === 'v-par', 'cada técnico continua na sua vistoria');
const etapas = {
  dados: { nome: 'EMEF Brigadeiro Faria Lima', diretor: 'Carla Mendes', imovel: 'Próprio', idadeAnos: '30', obs: 'Sem restrições' },
  entrada: { padrao: 'BT', tipoEntrada: 'Aérea', tensao: '220 V', cx1: { tipo: 'Tipo M', medidor: '10492338' }, cx2: { tipo: 'Tipo T', protecao: 'Chave seccionadora', disjuntor: '150' },
    aterr: 'Haste', resist: '18', caboModo: 'diametro', cabos: { fase: '6,7', neutro: '6,7', terra: '4,5' }, med: { rs: '220', st: '221', tr: '219', ir: '45', is: '52', it: '48' }, cons: { tampa: 'Boa', fundo: 'Ruim' } },
  estrutura: { nBlocos: 2, blocos: [{ pav: 2, cobTipo: 'Laje', fachadas: { N: 'Com sala' } }, { pav: 1, cobTipo: 'Telha metálica' }], setores: ['Quadra coberta'], vrfLocal: ['Laje técnica'] },
  eletrica: { blocos: [{ quadros: 3, tipo: 'QGBT', vagas: 2, estado: 'Boa' }, { quadros: 2, tipo: 'QDC' }] },
  ambientes: { itens: [
    { id: 'a1', bloco: 0, pav: 1, tipo: 'Sala de aula', qtd: 4, c: '8', l: '7,25', pd: '3,2', fachadas: ['Norte'], tug: 4, lum: [{ nome: 'LED tubular 18 W', lamp: 2, qtd: 5 }], tue: [{ nome: 'Computador', qtd: 1 }, { nome: 'Projetor', qtd: 1 }] },
    { id: 'a2', bloco: 0, pav: 0, tipo: 'Corredor', qtd: 1, c: '20', l: '3' },
    { id: 'a3', externo: true, tipo: 'Quadra coberta', qtd: 1, c: '24', l: '20', lum: [{ nome: 'Refletor LED 100 W', lamp: 1, qtd: 6 }] }] },
  equipamentos: { itens: [{ nome: 'Bomba de recalque', qtd: 2, pot: '3', un: 'CV' }, { nome: 'Elevador', qtd: 1, desc: true }] },
  revisao: { respNome: 'Carla Mendes', respCargo: 'Diretora', respEmail: 'carla@sme.sp.gov.br', assResp: png, assEmpresa: png, assRespEm: new Date().toISOString(), prioridades: 'Ar-condicionado nas salas 1 e 2\nRevisão do QGBT' }
};
Object.keys(etapas).forEach(k => ok(api('salvarEtapa', T, { vistoriaId: vid, etapa: k, dados: etapas[k] }).ok, 'etapa salva: ' + k));
ok(!api('salvarEtapa', T, { vistoriaId: vid, etapa: 'hack', dados: {} }).ok, 'etapa desconhecida recusada');
const up = api('uploadFoto', T, { id: 'foto1', vistoriaId: vid, etapa: 'dados', slot: 'dados.frontal', legenda: 'Fachada frontal', data: png, criadoEm: new Date().toISOString() });
ok(up.ok && up.data.fileId, 'foto vai para o Drive');
ok(api('uploadFoto', T, { id: 'foto1', vistoriaId: vid, data: png }).data.fileId === up.data.fileId, 'reenvio da mesma foto não duplica');
api('uploadFoto', T, { id: 'foto2', vistoriaId: vid, etapa: 'entrada', slot: 'entrada.medidor', data: png });
ok(api('legenda', T, { id: 'foto2', legenda: 'Medidor nº 10492338' }).ok, 'legenda editada');
const rel = api('relatorio', T, { vistoriaId: vid, tipo: 'completo' });
ok(rel.ok && /Pré-dimensionamento/.test(rel.data.html) && rel.data.paginas >= 11, 'relatório completo renderiza (' + (rel.data && rel.data.paginas) + ' páginas)');
const rv = api('relatorio', T, { vistoriaId: vid, tipo: 'vistoria' });
ok(rv.ok && /Ar-condicionado nas salas 1 e 2/.test(rv.data.html) && /PRÓPRIO \( X \)/.test(rv.data.html), 'relatório SME com prioridades e imóvel');
const fin = api('finalizar', T, { vistoriaId: vid, checkout: new Date().toISOString(), pendencias: [{ etapa: 'equipamentos', descricao: 'potência inacessível: Elevador' }], resumo: { ambientes: 6, fotos: 2, pendencias: 1 } });
ok(fin.ok && fin.data.assinado && fin.data.docs.completo.fileId, 'finalização gera PDFs no Drive');
ok(fin.data.copia.enviada && emails.some(e => e.to === 'carla@sme.sp.gov.br' && e.attachments.length), 'cópia enviada para a unidade com anexo');
ok(fin.data.equipeStatus === 'em_campo' && fin.data.proxima.escolaId === 'e-infante', 'equipe continua em campo (colega ainda na outra escola)');
ok(api('finalizar', T, { vistoriaId: vid }).ok, 'finalizar de novo (reenvio da fila) não quebra');
const b2 = api('bootstrap', T).data;
ok(b2.stats.concluidas === 7 && !b2.vistoriaAtiva, 'indicadores atualizados (7 concluídas)');

console.log('Colaboração: dois técnicos na mesma escola');
// Marcos chega à escola do João sem sinal e faz check-in: as duas vistorias viram uma só.
const dup = api('checkin', T, { id: 'v-dup', escolaId: 'e-alencar', checkin: new Date().toISOString() });
ok(dup.ok && dup.data.mescladaEm === 'v-par', 'check-in duplicado na mesma escola é mesclado na vistoria do colega');
const t0 = '2030-01-01T10:00:00.000Z000', t1 = '2030-01-01T10:05:00.000Z000', t2 = '2030-01-01T10:09:00.000Z000';
api('salvarEtapa', TJ, { vistoriaId: 'v-par', etapa: 'dados', ops: [{ p: 'dados.diretor', v: 'Paula', ts: t1 }, { p: 'dados.acesso', v: 'Portaria', ts: t1 }] });
api('salvarEtapa', T, { vistoriaId: 'v-dup', etapa: 'dados', ops: [{ p: 'dados.obs', v: 'Obra no pátio', ts: t1 }, { p: 'dados.diretor', v: 'Paula Lima', ts: t2 }] });
const offline = api('salvarEtapa', TJ, { vistoriaId: 'v-par', etapa: 'dados', ops: [{ p: 'dados.diretor', v: 'P.', ts: t0 }] }).data.dados;
ok(offline.acesso === 'Portaria' && offline.obs === 'Obra no pátio', 'campos diferentes dos dois técnicos são mantidos');
ok(offline.diretor === 'Paula Lima', 'mesmo campo: vence a alteração mais recente (a antiga, enviada depois, é ignorada)');
api('salvarEtapa', TJ, { vistoriaId: 'v-par', etapa: 'ambientes', ops: [{ p: 'ambientes.itens#s1', v: { id: 's1', tipo: 'Sala de aula', c: '8', l: '7' }, ts: t1 }] });
api('salvarEtapa', T, { vistoriaId: 'v-dup', etapa: 'ambientes', ops: [{ p: 'ambientes.itens#s2', v: { id: 's2', tipo: 'Biblioteca', c: '10', l: '8' }, ts: t1 }] });
let amb = api('puxarVistoria', T, { vistoriaId: 'v-dup' }).data.etapas.ambientes.dados.itens;
ok(amb.length === 2, 'ambientes cadastrados ao mesmo tempo pelos dois aparecem juntos');
api('salvarEtapa', T, { vistoriaId: 'v-dup', etapa: 'ambientes', ops: [{ p: 'ambientes.itens#s1', v: null, ts: t2 }] });
api('salvarEtapa', TJ, { vistoriaId: 'v-par', etapa: 'ambientes', ops: [{ p: 'ambientes.itens#s1', v: { id: 's1', tipo: 'Sala de aula', c: '9', l: '7' }, ts: t1 }] });
amb = api('puxarVistoria', TJ, { vistoriaId: 'v-par' }).data.etapas.ambientes.dados.itens;
ok(amb.length === 1 && amb[0].id === 's2', 'exclusão mais recente não é desfeita por edição antiga');
const pv = api('puxarVistoria', T, { vistoriaId: 'v-dup' }).data;
ok(pv.participantes.length === 2 && pv.id === 'v-par', 'a vistoria mostra os dois participantes');
api('uploadFoto', T, { id: 'foto-dup', vistoriaId: 'v-dup', etapa: 'dados', slot: 'dados.placa', data: png });
ok(api('puxarVistoria', TJ, { vistoriaId: 'v-par' }).data.fotos.some(f => f.id === 'foto-dup'), 'foto do colega chega para o outro');
ok(api('sairVistoria', T, { vistoriaId: 'v-dup' }).ok && api('puxarVistoria', TJ, { vistoriaId: 'v-par' }).data.participantes.length === 1, 'sair da vistoria sem encerrá-la');
ok(api('entrarVistoria', T, { vistoriaId: 'v-par' }).data.participantes.length === 2, 'entrar de novo na vistoria do colega');
ok(api('cancelar', T, { vistoriaId: 'v-dup', motivo: 'Problema da equipe' }).ok && api('puxarVistoria', TJ, { vistoriaId: 'v-par' }).data.status === 'cancelada', 'encerrar pelo id mesclado encerra a vistoria real');

console.log('Permissões');
const supT = api('login', '', { email: '2001', senha: 'vistar2026' }).data.token;
const nUser = api('salvarUsuario', supT, { nome: 'Lia', email: 'lia@x.com', matricula: '4001', perfil: 'tecnico', equipeId: 'eq03', dres: ['Itaquera'] }).data;
const TL = api('ativar', '', { login: '4001', codigo: nUser.codigo, senha: 'Lia12345', aceite: true }).data.token;
ok(!api('escola', TL, { escolaId: 'e-farialima' }).ok, 'escola fora das DREs do usuário é bloqueada');
ok(api('escola', TL, { escolaId: 'e-portinari' }).ok, 'escola da própria DRE é liberada');
ok(!api('retomarDados', TL, { escolaId: 'e-infante' }).ok, 'retomar vistoria de escola fora das DREs é bloqueado');
ok(!api('legenda', TL, { id: 'foto2', legenda: 'x' }).ok, 'legenda de foto de outra equipe é bloqueada');
ok(!api('vistoriaDetalhe', TL, { vistoriaId: vid }).ok, 'detalhe de vistoria de outra equipe é bloqueado');
ok(Object.keys(api('thumbs', TL, { ids: [up.data.fileId] }).data).length === 0, 'miniaturas de fotos fora do escopo não são entregues');
ok(!api('checkin', TL, { id: 'v-l', escolaId: 'e-farialima' }).ok, 'check-in em escola fora das DREs é bloqueado');
ok(api('guardarFalha', T, { acao: 'uploadFoto', erro: 'teste', payload: { id: 'x' } }).data.fileId, 'envio recusado ganha cópia de segurança no Drive');

console.log('Consultas');
const vd = api('vistoriaDetalhe', T, { vistoriaId: vid }).data;
ok(vd && vd.resultado.pct > 0 && vd.etapas.length === 6, 'detalhe da vistoria: demanda prevista ' + (vd && Math.round(vd.resultado.pct * 100)) + '% do padrão');
const esc = api('escola', T, { escolaId: 'e-farialima' }).data;
ok(esc && esc.resumo.blocos === 2 && esc.contato.nome === 'Carla Mendes', 'detalhe da escola com resumo e contato');
const pnl = api('painel', T, { periodo: 'mes' }).data;
ok(pnl && pnl.cont.concluida === 7 && pnl.serie.length === 14 && pnl.metaHoje !== null, 'painel: 7 concluídas, série de 14 dias e meta');
const prog = api('programacao', T, { inicio: new Date(Date.now() - 20 * 864e5).toISOString().slice(0, 10), fim: new Date(Date.now() + 20 * 864e5).toISOString().slice(0, 10) }).data;
ok(prog && prog.itens.length >= 10, 'programação da equipe (' + (prog && prog.itens.length) + ' itens)');
const gal = api('galeria', T, {}).data;
ok(gal && gal.total === 3 && gal.grupos.some(g => g.fotos.some(f => f.rotulo === 'Medidor nº 10492338')), 'galeria agrupada com legendas');
const pend = api('pendenciasPainel', T, {}).data;
ok(pend && pend.itens.some(i => i.situacao === 'aguardando_autorizacao') && pend.itens.some(i => i.situacao === 'retorno_solicitado'), 'pendências com situação por escola');
ok(api('reagendar', T, { escolaId: 'e-deodoro', data: '2030-01-10', hora: '09:00', confirmado: true }).ok, 'retorno reagendado');
ok(api('pendenciasPainel', T, {}).data.itens.find(i => i.escolaId === 'e-deodoro').retorno.data === '2030-01-10', 'data do retorno aparece na pendência');

console.log('Cancelamento e retomada');
const v2 = 'v-teste-2';
ok(api('checkin', T, { id: v2, escolaId: 'e-infante' }).ok, 'check-in na próxima escola');
api('salvarEtapa', T, { vistoriaId: v2, etapa: 'dados', dados: { nome: 'EMEF Infante Dom Henrique', diretor: 'X', logradouro: 'R', numero: '1', cep: '0', bairro: 'B', imovel: 'Próprio' } });
api('uploadFoto', T, { id: 'foto3', vistoriaId: v2, etapa: 'dados', slot: 'dados.placa', data: png });
ok(api('cancelar', T, { vistoriaId: v2, motivo: 'Não houve tempo para finalizar', descricao: 'Parou na elétrica.', retornoData: '2030-02-01' }).ok, 'vistoria cancelada');
const pi = api('pendenciasPainel', T, {}).data.itens.find(i => i.escolaId === 'e-infante');
ok(pi && pi.situacao === 'nao_concluida' && pi.etapas[0] === 'ok', 'situação "não concluída" e etapa Dados concluída');
const base = api('retomarDados', T, { escolaId: 'e-infante' }).data;
ok(base && base.etapas.dados && base.fotos.length === 1, 'dados para retomar vêm do servidor');
const v3 = api('checkin', T, { id: 'v-teste-3', escolaId: 'e-infante', retomarDe: base.id, fotosCopiar: [{ id: 'foto3b', de: 'foto3' }] });
ok(v3.ok && /-R2$/.test(v3.data.codigo), 'retomada cria nova versão (' + (v3.data && v3.data.codigo) + ')');
ok(vm.runInContext("Db.find(" + JSON.stringify('Fotos') + "," + JSON.stringify('foto3b') + ")", ctx).vistoriaId === 'v-teste-3', 'fotos anteriores valem na nova versão');

console.log('Supervisão');
const sup = api('login', '', { email: 'roberto.lima@exemplo.com', senha: 'vistar2026' }).data.token;
ok(!api('equipes', T).ok, 'técnico não acessa a supervisão');
const eqs = api('equipes', sup).data;
ok(eqs && eqs.equipes.length === 3 && eqs.aValidar >= 1, 'equipes ao vivo e vistorias a validar');
api('ping', T, { lat: -23.5, lng: -46.5, fila: 3 });
ok(api('equipes', sup).data.equipes.find(e => e.id === 'eq02').fila === 3, 'ping atualiza posição e fila da equipe');
const vl = api('validacoes', sup, {}).data;
ok(vl.some(v => v.id === vid), 'vistoria finalizada aparece para validar');
ok(!api('validar', sup, { vistoriaId: vid, decisao: 'correcao' }).ok, 'correção exige descrição');
ok(api('validar', sup, { vistoriaId: vid, decisao: 'aprovada' }).ok && vm.runInContext("Db.find('Vistorias','" + vid + "')", ctx).validacao === 'aprovada', 'vistoria aprovada');
const nv = api('salvarVisita', sup, { tipo: 'visita', escolaId: 'e-alencar', equipeId: 'eq01', data: '2030-03-03', hora: '08:30' });
ok(nv.ok, 'supervisor programa visita');
ok(api('excluirVisita', sup, { id: nv.data.id }).ok, 'e exclui');
const nu = api('salvarUsuario', sup, { nome: 'Ana Teste', email: 'ana@x.com', matricula: '3001', perfil: 'tecnico', equipeId: 'eq03', dres: ['Penha'] });
ok(nu.ok && /^\d{6}$/.test(nu.data.codigo) && emails.some(e => e.to === 'ana@x.com'), 'novo usuário recebe código por e-mail');
ok(!api('salvarUsuario', sup, { nome: 'Dup', email: 'ana@x.com' }).ok, 'e-mail duplicado é recusado');
ok(!api('salvarUsuario', sup, { nome: 'Chefe', email: 'c@x.com', perfil: 'admin' }).ok, 'supervisor não cria administrador');
ok(api('usuarios', sup).data.usuarios.length >= 5, 'lista de usuários');
ok(api('cobrarDre', sup, { escolaId: 'e-bilac' }).ok, 'cobrar DRE (sem e-mail: devolve telefone)');
ok(api('reabrir', sup, { vistoriaId: vid, motivo: 'medir QDC do bloco B' }).ok, 'reabrir vistoria para retorno');
ok(api('rota', T, { escolaId: 'e-infante', lat: -23.54, lng: -46.52 }).data.km > 0, 'rota cai na estimativa quando o Maps falha');

console.log('Tratamento de erros');
ok(api('acaoQueNaoExiste', T).error.indexOf('desatualizado') > 0, 'ação desconhecida pede para recarregar o app');
ok(vm.runInContext('erroTemporario_("Serviço invocado muitas vezes: Service invoked too many times")', ctx) && !vm.runInContext('erroTemporario_("Escola não encontrada.")', ctx), 'falhas passageiras do Google são marcadas para repetir');
ok(api('logErro', T, { msg: 'TypeError: x', tela: 'home' }).ok, 'erros de tela ficam registrados na aba Log');
const err = vm.runInContext('paginaErro_(new Error("Planilha não configurada. Execute instalarVistAR() no editor."))', ctx);
ok(/instalarVistAR/.test(err.html), 'página de erro amigável explica o que fazer');

console.log('Pré-dimensionamento');
const calc = vm.runInContext('preDimensionamento_', ctx)({
  entrada: { padrao: 'BT', tensao: '220 V', fases: 'Monofásico', cx2: { disjuntor: '100' } },
  estrutura: { blocos: [{ pav: 2, nome: 'Prédio principal' }] },
  ambientes: { itens: [{ tipo: 'Sala de aula', qtd: 1, c: '8', l: '7', bloco: 0, pav: 0, aberturas: [{ tipo: 'Janela', larg: '2', alt: '1,2', qtd: 2, fachada: 'Oeste', protecao: 'Brise ou marquise' }] }] }
}, { KW_POR_TR: '1.05', FATORES_BTU_M2: '{"Sala de aula": 700}' });
ok(calc.linhas[0].fator === 700, 'fator por m² ajustável na aba Config');
ok(/vidro \+1\.680/.test(calc.linhas[0].ajustes), 'ganho solar pelas janelas medidas (4,8 m² a Oeste com brise)');
ok(Math.abs(calc.kwEntrada - 127.0171 * 100 * 0.92 / 1000) < 0.1, 'entrada monofásica calculada por fase-neutro');
ok(calc.linhas[0].local.indexOf('Prédio principal') === 0, 'nome do bloco/setor aparece no relatório');

console.log('Administrador');
const adm = vm.runInContext('criarAdministrador()', ctx);
const codAdm = /Código: (\d{6})/.exec(adm)[1];
ok(api('ativar', '', { login: 'coord@exemplo.com', codigo: codAdm, senha: 'Admin2026', aceite: true }).ok, 'criarAdministrador gera código e o admin ativa a conta');

console.log('\n' + (falhas ? falhas + ' FALHA(S)' : 'Servidor OK · todos os testes passaram'));
process.exit(falhas ? 1 : 0);
