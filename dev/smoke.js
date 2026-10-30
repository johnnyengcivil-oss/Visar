#!/usr/bin/env node
/**
 * Teste de fumaça do fluxo completo no preview (Playwright + Chromium).
 *   node dev/build-preview.js && node dev/smoke.js [pasta-de-screenshots]
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const OUT = process.argv[2] || path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAIAAAAuKetIAAAAQklEQVR4nO3PQQ0AIBDAMMC/5+ECHi0Klg3P3rM6+wF2gAEGGGCAAQYYYIABBhhggAEGGGCAAQYYYIABBhhggAEGGF4WsATe8Q4+MQAAAABJRU5ErkJggg==', 'base64');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    geolocation: { latitude: -23.5443, longitude: -46.5263 }, permissions: ['geolocation'], locale: 'pt-BR'
  });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', e => erros.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') erros.push('console: ' + m.text()); });
  const shot = async n => { await page.waitForTimeout(450); await page.screenshot({ path: path.join(OUT, n + '.png'), fullPage: true }); };
  const clica = async (sel, opts) => { await page.locator(sel).first().click(opts); await page.waitForTimeout(200); };
  const confirma = async () => { await page.waitForSelector('#cfOk'); await page.click('#cfOk'); await page.waitForTimeout(300); };
  const foto = async slotSel => {
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator(slotSel).first().click()]);
    await chooser.setFiles({ name: 'f.png', mimeType: 'image/png', buffer: PNG });
    await page.waitForTimeout(500);
  };

  await page.goto('file://' + path.join(__dirname, 'preview.html'));
  await page.fill('input[name=email]', 'marcos@exemplo.com');
  await page.fill('input[name=senha]', 'vistar2026');
  await shot('00-login');
  await clica('button[type=submit]');
  await page.waitForSelector('.stats');
  await shot('01-home-iniciar');

  await clica('[data-act=checkin]');
  await page.waitForSelector('.whdr');
  await foto('[data-slot="dados.placa"]');
  await foto('[data-slot="dados.frontal"]');
  await shot('02-dados');

  await clica('[data-act=etapaProx]');
  await clica('[data-act=pick][data-v=BT]');
  await clica('[data-k="entrada.tipoEntrada"][data-v="Aérea"]');
  await clica('[data-k="entrada.tensao"][data-v="220 V"]');
  await clica('[data-k="entrada.cx1.tipo"][data-v="Tipo M"]');
  await page.fill('[data-k="entrada.cabos.fase"]', '6,7');
  await page.fill('[data-k="entrada.cx2.disjuntor"]', '100');
  await shot('03-entrada-bt');
  await clica('[data-act=pick][data-v=MT]');
  await shot('04-entrada-mt');
  await clica('[data-act=pick][data-v=BT]');

  await clica('[data-act=etapaProx]');
  await clica('[data-act=stp][data-k="estrutura.nBlocos"][data-d="1"]');
  await clica('[data-act=stp][data-k="estrutura.blocos.0.pav"][data-d="1"]');
  await clica('[data-act=stp][data-k="estrutura.blocos.0.pav"][data-d="1"]');
  await clica('[data-k="estrutura.setores"][data-v="Quadra coberta"]');
  await clica('[data-k="estrutura.blocos.0.cobTipo"][data-v="Laje"]');
  await clica('[data-act=girar]');
  await shot('05-estrutura');

  await clica('[data-act=etapaProx]');
  await clica('[data-k="eletrica.blocos.0.tipo"][data-v="QDC"]');
  await shot('06-eletrica');

  await clica('[data-act=etapaProx]');
  await shot('07-ambientes-vazio');
  await clica('[data-act=ambNovo]:not([data-ext])');
  await page.fill('[data-k="@nome"]', 'Sala 12 e Sala 13');
  await clica('[data-act=stp][data-k="@qtd"][data-d="1"]');
  await page.fill('[data-k="@c"]', '8');
  await page.fill('[data-k="@l"]', '7,25');
  await page.fill('[data-k="@pd"]', '3,2');
  await clica('[data-k="@fachadas"][data-v="Norte"]');
  await page.fill('[data-k="@lum.0.qtd"]', '5');
  await foto('[data-slot$=".vista"]');
  await shot('08-ambiente-form');
  await clica('[data-act=ambSalvar]');
  await clica('[data-act=ambNovo][data-ext]');
  await page.fill('[data-k="@c"]', '24');
  await page.fill('[data-k="@l"]', '20');
  await shot('09-area-externa');
  await clica('[data-act=ambSalvar]');
  await shot('10-ambientes');

  await clica('[data-act=etapaProx]');
  await page.fill('[data-k="equipamentos.itens.0.pot"]', '3');
  await clica('[data-act=chk][data-k="equipamentos.itens.1.desc"]');
  await shot('11-equipamentos');

  await clica('[data-act=etapaProx]');
  await page.fill('[data-k="revisao.respNome"]', 'Carla Mendes');
  await page.fill('[data-k="revisao.respEmail"]', 'carla.mendes@sme.prefeitura.sp.gov.br');
  for (const k of ['revisao.assResp', 'revisao.assEmpresa']) {
    await page.locator('[data-sig="' + k + '"] canvas').scrollIntoViewIfNeeded();
    const box = await page.locator('[data-sig="' + k + '"] canvas').boundingBox();
    await page.mouse.move(box.x + 30, box.y + 80); await page.mouse.down();
    for (let i = 0; i < 12; i++) await page.mouse.move(box.x + 40 + i * 18, box.y + 60 + (i % 2) * 40);
    await page.mouse.up();
    await page.waitForTimeout(1100);
  }
  await shot('12-revisao');

  await clica('[data-act=go][data-to=relatorio]');
  await page.waitForSelector('#relFrame', { timeout: 10000 });
  await shot('13-relatorio-completo');
  await clica('[data-act=back]');

  await clica('[data-act=finalizar]');
  await confirma();
  await page.waitForSelector('.done-h');
  await page.waitForTimeout(2500);
  await shot('14-finalizada');

  await clica('[data-act=tab][data-to=home]');
  await page.waitForTimeout(800);
  await shot('15-home-transito');

  await clica('[data-act=go][data-to=credencial]');
  await shot('16-credencial');
  await clica('[data-act=back]');

  // Check-in na próxima escola e cancelamento.
  await clica('[data-act=checkinEscola]');
  await confirma(); // GPS está na escola anterior: pede confirmação de distância
  await page.waitForSelector('.whdr');
  await clica('[data-act=go][data-to=cancelar]');
  await page.fill('[data-k="@quem"]', 'Diretora');
  await shot('17-cancelar');
  await clica('[data-act=cancelarConfirmar]');
  await confirma();
  await page.waitForSelector('.stats');
  await shot('18-home-apos-cancelar');

  await clica('[data-act=tab][data-to=escolas]');
  await shot('19-escolas');
  await clica('[data-act=tab][data-to=pendencias]');
  await shot('20-pendencias');

  await browser.close();
  if (erros.length) { console.error('ERROS NO NAVEGADOR:\n' + erros.join('\n')); process.exit(1); }
  console.log('OK · screenshots em ' + OUT);
})().catch(e => { console.error(e); process.exit(1); });
