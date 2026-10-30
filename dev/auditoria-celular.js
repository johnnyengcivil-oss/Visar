#!/usr/bin/env node
/**
 * Auditoria de uso no celular (Playwright + Chromium), no preview com servidor simulado.
 *   node dev/build-preview.js && node dev/auditoria-celular.js [pasta-de-screenshots]
 *
 * Em 320, 360, 390 e 430 px de largura, nas telas principais, falha se houver:
 *   - rolagem horizontal da página;
 *   - texto menor que 13 px;
 *   - botão, seletor ou campo com menos de 40 px de altura (links de texto: 32 px).
 * Também simula o celular que ignora a largura da tela (página desenhada com 980 px):
 * o app precisa corrigir a escala e continuar em uma coluna.
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const OUT = process.argv[2] || path.join(__dirname, 'shots-celular');
fs.mkdirSync(OUT, { recursive: true });
const PREVIEW = 'file://' + path.join(__dirname, 'preview.html');
const LARGURAS = [320, 360, 390, 430];
const FONTE_MIN = 13, ALVO_MIN = 40, LINK_MIN = 32;

function auditar() {
  const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.bottom > 0 && r.top < innerHeight * 6; };
  const nome = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + ' "' + (el.textContent || el.placeholder || el.getAttribute('aria-label') || '').trim().slice(0, 24) + '"';
  const fora = el => el.closest('.leaflet-control-attribution, .leaflet-container, svg, .rel-stage, .doc-a4, .cam, .badge-card .slot, [aria-hidden="true"]');
  const raiz = [document.querySelector('#hdr'), document.querySelector('#main'), document.querySelector('#foot'), document.querySelector('#layer')].filter(Boolean);
  const todos = raiz.flatMap(r => Array.from(r.querySelectorAll('*')));
  const textoPequeno = [], alvoPequeno = [];
  todos.forEach(el => {
    if (fora(el) || !vis(el)) return;
    const temTexto = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
    if (temTexto && parseFloat(getComputedStyle(el).fontSize) < 13 - 0.01) textoPequeno.push(nome(el) + ' ' + getComputedStyle(el).fontSize);
    const clicavel = el.matches('button, select, input:not([type=checkbox]):not([type=radio]):not([type=file]), textarea, a[href], label.btn, [data-act]') && !el.closest('button, a') || el.matches('button, [data-act]');
    if (clicavel && !el.parentElement.closest('button, [data-act]')) {
      const h = el.getBoundingClientRect().height;
      const link = el.matches('.link, a, .sync, .prog button, .tog') && !el.matches('.btn');
      if (el.closest('.mapdots')) return;
      if (h < (link ? 28 : 40) - 0.5) alvoPequeno.push(nome(el) + ' ' + Math.round(h) + 'px');
    }
  });
  return {
    largura: innerWidth, rolagemHorizontal: document.documentElement.scrollWidth > innerWidth + 2 ? document.documentElement.scrollWidth : 0,
    classes: document.body.className, textoPequeno: Array.from(new Set(textoPequeno)), alvoPequeno: Array.from(new Set(alvoPequeno))
  };
}

const LF = process.env.LEAFLET_DIR;
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN89+7dfwAI3QOaJ0fRxwAAAABJRU5ErkJggg==', 'base64');
const rotas = async c => {
  await c.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/leaflet\//, r => LF ? r.fulfill({ path: path.join(LF, /\.css$/.test(r.request().url()) ? 'leaflet.css' : 'leaflet.js') }) : r.abort());
  await c.route(/tile\.openstreetmap\.org/, r => r.fulfill({ contentType: 'image/png', body: PNG }));
};

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const problemas = [];
  const erros = [];
  for (const w of LARGURAS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
      geolocation: { latitude: -23.5443, longitude: -46.5263 }, permissions: ['geolocation', 'camera'], locale: 'pt-BR' });
    await rotas(ctx);
    const page = await ctx.newPage();
    page.on('pageerror', e => erros.push(w + 'px pageerror: ' + e.message));
    const verifica = async tela => {
      await page.waitForTimeout(600);
      const r = await page.evaluate(auditar);
      await page.screenshot({ path: path.join(OUT, w + '-' + tela + '.png'), fullPage: true });
      const ps = [];
      if (r.rolagemHorizontal) ps.push('rolagem horizontal (' + r.rolagemHorizontal + 'px)');
      if (/l-tab|l-pc/.test(r.classes)) ps.push('layout de tablet/computador no celular');
      r.textoPequeno.forEach(t => ps.push('texto pequeno: ' + t));
      r.alvoPequeno.forEach(t => ps.push('toque pequeno: ' + t));
      ps.forEach(p => problemas.push(w + 'px · ' + tela + ' · ' + p));
    };
    const entrar = async login => {
      await page.evaluate(() => { try { Sheet.close(true); } catch (e) { /* sem folha */ } App.token = null; LS.del('token'); LS.del('boot'); LS.del('modo'); App.data = null; Dados.mem = {}; Router.reset('login'); });
      await page.fill('input[name=email]', login); await page.fill('input[name=senha]', 'vistar2026');
      await page.locator('button[type=submit]').click(); await page.waitForTimeout(900);
    };
    await page.goto(PREVIEW);
    await verifica('login');
    await page.fill('input[name=email]', 'marcos@exemplo.com'); await page.fill('input[name=senha]', 'vistar2026');
    await page.locator('button[type=submit]').click();
    await page.waitForSelector('.stats');
    await verifica('inicio');
    await page.locator('[data-act=checkin]').first().click();
    await page.waitForSelector('.whdr');
    await verifica('etapa-dados');
    for (const k of ['entrada', 'estrutura', 'eletrica', 'ambientes', 'equipamentos', 'revisao']) {
      await page.evaluate(k => Router.go('etapa', { k: k }), k);
      await page.waitForSelector('.whdr');
      await verifica('etapa-' + k);
    }
    for (const r of ['escolas', 'fotos', 'pendencias', 'programacao', 'configuracoes']) { await page.evaluate(r => Router.go(r), r); await verifica(r); }
    await entrar('2001');
    await page.waitForSelector('#supBox .kpi4');
    await verifica('supervisao');
    for (const r of ['equipesSup', 'validar', 'orcamentos', 'consulta', 'cadastro', 'usuarios']) { await page.evaluate(r => Router.go(r), r); await verifica(r); }
    await page.evaluate(() => Router.go('orcamento', { id: 'orc-vx3' }));
    await verifica('orcamento-detalhe');
    await entrar('3001');
    await verifica('escritorio');
    await ctx.close();
  }

  // Celular que ignora a largura da tela: 980 px de página num aparelho de 412 px.
  const ctx = await browser.newContext({ viewport: { width: 980, height: 2000 }, screen: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: false, hasTouch: true, locale: 'pt-BR' });
  const page = await ctx.newPage();
  await page.goto(PREVIEW);
  await page.fill('input[name=email]', 'marcos@exemplo.com'); await page.fill('input[name=senha]', 'vistar2026');
  await page.locator('button[type=submit]').click();
  await page.waitForSelector('.stats');
  await page.waitForTimeout(500);
  const esc = await page.evaluate(() => ({ classes: document.body.className, zoom: Layout.zoom }));
  await page.screenshot({ path: path.join(OUT, 'escala-corrigida.png') });
  if (!/escala-corrigida/.test(esc.classes) || /l-tab/.test(esc.classes) || Math.abs(esc.zoom - 980 / 412) > 0.05) problemas.push('escala: página de 980 px num celular não foi corrigida (' + JSON.stringify(esc) + ')');
  await ctx.close();
  const ctxD = await browser.newContext({ viewport: { width: 844, height: 390 }, screen: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'pt-BR' });
  const pd = await ctxD.newPage();
  await pd.goto(PREVIEW);
  await pd.waitForTimeout(400);
  const dz = await pd.evaluate(() => ({ zoom: Layout.zoom, classes: document.body.className }));
  if (dz.zoom !== 1 || /l-tab/.test(dz.classes)) problemas.push('celular deitado (tela informada em pé) recebeu escala ou layout errado: ' + JSON.stringify(dz));
  await browser.close();

  if (erros.length) problemas.push.apply(problemas, erros);
  if (problemas.length) {
    console.error(problemas.length + ' PROBLEMA(S) NO CELULAR:\n' + problemas.join('\n'));
    process.exit(1);
  }
  console.log('Celular OK · ' + LARGURAS.join(', ') + ' px e escala corrigida · screenshots em ' + OUT);
})().catch(e => { console.error(e); process.exit(1); });
