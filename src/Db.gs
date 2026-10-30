/**
 * VistAR · Camada de dados sobre o Google Sheets.
 * Cada aba é uma tabela; a primeira coluna é a chave. Todos os valores são texto.
 */
const Db = (function () {
  let ss_ = null;
  const cacheAbas_ = {};

  function ss() {
    if (ss_) return ss_;
    const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    ss_ = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
    if (!ss_) throw new Error('Planilha não configurada. Execute instalarVistAR() no editor.');
    return ss_;
  }

  function aba(nome) {
    if (cacheAbas_[nome]) return cacheAbas_[nome];
    const sh = ss().getSheetByName(nome);
    if (!sh) throw new Error('Aba "' + nome + '" não encontrada. Execute instalarVistAR().');
    return (cacheAbas_[nome] = sh);
  }

  function paraObjeto_(cols, linha) {
    const o = {};
    cols.forEach((k, i) => {
      let v = linha[i];
      if (v instanceof Date) v = v.toISOString();
      o[k] = v === null || v === undefined ? '' : (typeof v === 'number' ? String(v) : v);
    });
    return o;
  }

  function paraCelula_(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') v = JSON.stringify(v);
    v = String(v);
    return /^[=+@]/.test(v) ? "'" + v : v; // nunca vira fórmula
  }

  /** Lê a aba inteira (memoizado por execução). */
  const memo_ = {};
  function all(nome) {
    if (memo_[nome]) return memo_[nome].map(o => Object.assign({}, o));
    const sh = aba(nome);
    const cols = SCHEMA[nome];
    const n = sh.getLastRow();
    const lista = n < 2 ? [] : sh.getRange(2, 1, n - 1, cols.length).getValues()
      .filter(r => r[0] !== '' && r[0] !== null)
      .map(r => paraObjeto_(cols, r));
    memo_[nome] = lista;
    return lista.map(o => Object.assign({}, o));
  }

  function linhaDe_(nome, id) {
    const sh = aba(nome);
    const n = sh.getLastRow();
    if (n < 2) return 0;
    const cel = sh.getRange(2, 1, n - 1, 1).createTextFinder(String(id)).matchEntireCell(true).findNext();
    return cel ? cel.getRow() : 0;
  }

  function find(nome, id) {
    if (id === '' || id === null || id === undefined) return null;
    if (memo_[nome]) {
      const hit = memo_[nome].find(o => String(o[SCHEMA[nome][0]]) === String(id));
      return hit ? Object.assign({}, hit) : null;
    }
    const row = linhaDe_(nome, id);
    if (!row) return null;
    const cols = SCHEMA[nome];
    return paraObjeto_(cols, aba(nome).getRange(row, 1, 1, cols.length).getValues()[0]);
  }

  /** Insere ou mescla campos no registro com a mesma chave. */
  function upsert(nome, obj) {
    const cols = SCHEMA[nome];
    const sh = aba(nome);
    const id = obj[cols[0]];
    const row = id === undefined || id === '' ? 0 : linhaDe_(nome, id);
    let atual = {};
    if (row) atual = paraObjeto_(cols, sh.getRange(row, 1, 1, cols.length).getValues()[0]);
    const novo = Object.assign({}, atual, obj);
    const valores = [cols.map(k => paraCelula_(novo[k]))];
    if (row) sh.getRange(row, 1, 1, cols.length).setValues(valores);
    else sh.getRange(sh.getLastRow() + 1, 1, 1, cols.length).setNumberFormat('@').setValues(valores);
    delete memo_[nome];
    return novo;
  }

  function remove(nome, id) {
    const row = linhaDe_(nome, id);
    if (row) aba(nome).deleteRow(row);
    delete memo_[nome];
    return !!row;
  }

  function where(nome, fn) { return all(nome).filter(fn); }

  return { ss: ss, aba: aba, all: all, find: find, upsert: upsert, remove: remove, where: where };
})();

/* ───────────── Etapas da vistoria (JSON fatiado em até 6 células) ───────────── */

const FATIA_ = 45000;

function salvarEtapaDb_(vistoriaId, etapa, dados, autor) {
  const json = JSON.stringify(dados || {});
  if (json.length > FATIA_ * 6) throw new Error('Os dados da etapa ' + etapa + ' ficaram grandes demais.');
  const reg = { id: vistoriaId + ':' + etapa, vistoriaId: vistoriaId, etapa: etapa, atualizadoEm: agora_(), autor: autor || '' };
  for (let i = 0; i < 6; i++) {
    const parte = json.substr(i * FATIA_, FATIA_);
    reg['p' + (i + 1)] = parte ? '~' + parte : '';
  }
  return Db.upsert('Etapas', reg);
}

function lerEtapas_(vistoriaId) {
  const out = {};
  Db.where('Etapas', r => r.vistoriaId === vistoriaId).forEach(r => {
    let json = '';
    for (let i = 1; i <= 6; i++) json += String(r['p' + i] || '').replace(/^~/, '');
    try { out[r.etapa] = { dados: JSON.parse(json || '{}'), ts: r.atualizadoEm }; } catch (e) { out[r.etapa] = { dados: {}, ts: '' }; }
  });
  return out;
}

/* ───────────── Utilitários ───────────── */

function agora_() { return new Date().toISOString(); }
function hoje_() { return Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd'); }
function fmtData_(iso, padrao) {
  if (!iso) return '';
  return Utilities.formatDate(new Date(iso), 'America/Sao_Paulo', padrao || 'dd/MM/yyyy');
}
function lista_(s) { return String(s || '').split(',').map(x => x.trim()).filter(String); }
function num_(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace(/\./g, '').replace(',', '.'));
  return isNaN(n) ? Number(String(v).replace(',', '.')) || 0 : n;
}
function dec_(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}
function uid_() { return Utilities.getUuid().replace(/-/g, '').slice(0, 16); }

function log_(usuario, acao, detalhe) {
  try { Db.upsert('Log', { ts: agora_() + '·' + uid_().slice(0, 4), usuario: usuario || '', acao: acao, detalhe: typeof detalhe === 'string' ? detalhe : JSON.stringify(detalhe || '') }); } catch (e) { console.warn(e); }
}

function comLock_(fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw new Error('Servidor ocupado, tente novamente.');
  try { return fn(); } finally { lock.releaseLock(); }
}
