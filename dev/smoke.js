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
  const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    geolocation: { latitude: -23.5443, longitude: -46.5263 }, permissions: ['geolocation', 'camera'], locale: 'pt-BR'
  });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', e => erros.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') erros.push('console: ' + m.text()); });
  const shot = async n => { await page.waitForTimeout(450); await page.screenshot({ path: path.join(OUT, n + '.png'), fullPage: true }); };
  const clica = async (sel, opts) => { await page.locator(sel).first().click(opts); await page.waitForTimeout(200); };
  const confirma = async () => { await page.waitForSelector('#cfOk'); await page.click('#cfOk'); await page.waitForTimeout(300); };
  // Câmera própria (dispositivo falso do Chromium): abre, fotografa e fecha.
  let camShot = false;
  const foto = async slotSel => {
    await page.locator(slotSel).first().click();
    await page.waitForSelector('.cam-shot');
    await page.waitForFunction(() => { const v = document.querySelector('#camV'); return v && v.videoWidth > 0; });
    await page.click('.cam-shot');
    await page.waitForTimeout(700);
    if (!camShot) { camShot = true; await shot('02b-camera'); }
    await page.click('.cam-top [data-act=camFechar]');
    await page.waitForTimeout(300);
  };

  await page.goto('file://' + path.join(__dirname, 'preview.html'));
  await page.fill('input[name=email]', 'marcos@exemplo.com');
  await page.fill('input[name=senha]', 'vistar2026');
  await shot('00-login');
  await clica('button[type=submit]');
  await page.waitForSelector('.stats');
  await page.waitForSelector('[data-act=entrarVistoria]');
  await shot('01-home-iniciar');

  await clica('[data-act=checkin]');
  await page.waitForSelector('.whdr');
  await foto('[data-slot="dados.placa"]');
  await foto('[data-slot="dados.frontal"]');
  await shot('02-dados');
  // Mesclagem: o que veio do colega entra; o que ainda não foi enviado daqui é mantido.
  const mescla = await page.evaluate(() => {
    Form.set('dados.obs', 'digitado aqui');
    Vist.aplicarServidor('dados', Object.assign({}, App.V.d.dados, { obs: 'versão antiga do servidor', acesso: 'Portaria (colega)' }));
    return [App.V.d.dados.obs, App.V.d.dados.acesso];
  });
  if (mescla[0] !== 'digitado aqui' || mescla[1] !== 'Portaria (colega)') throw new Error('Mesclagem errada: ' + mescla);
  // Item recusado pelo servidor vai para "Itens com erro" (não é descartado).
  await page.evaluate(() => Sync.add('acaoQueNaoExiste', { teste: 1 }));
  await page.waitForFunction(() => Sync.nFalhas === 1, null, { timeout: 20000 });

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
  await page.fill('[data-k="@aberturas.0.larg"]', '2');
  await page.fill('[data-k="@aberturas.0.alt"]', '1,2');
  await page.fill('[data-k="@aberturas.0.qtd"]', '2');
  await clica('[data-k="@aberturas.0.fachada"][data-v="Oeste"]');
  await clica('[data-k="@aberturas.0.protecao"][data-v="Brise ou marquise"]');
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
    await clica('[data-to=assinatura][data-p*="' + k + '"]');
    await page.waitForSelector('#sigBig canvas');
    const box = await page.locator('#sigBig canvas').boundingBox();
    await page.mouse.move(box.x + 30, box.y + 120); await page.mouse.down();
    for (let i = 0; i < 14; i++) await page.mouse.move(box.x + 40 + i * 18, box.y + 90 + (i % 2) * 50);
    await page.mouse.up();
    if (k === 'revisao.assResp') await shot('12a-assinatura');
    await clica('[data-act=sigOk]');
    await page.waitForTimeout(400);
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

  await clica('[data-act=menu]');
  await shot('16a-menu');
  await clica('[data-act=menuIr][data-to=credencial]');
  await shot('16-credencial');
  await clica('[data-act=back]');
  await clica('[data-act=menu]');
  await clica('[data-act=menuIr][data-to=configuracoes]');
  await shot('16b-configuracoes');
  await clica('[data-act=back]');
  await clica('[data-act=go][data-to=programacao]');
  await page.waitForSelector('.tl, .empty');
  await shot('16c-prog-dia');
  await clica('[data-act=progIr]:has-text("Semana")');
  await page.waitForSelector('.wk-row');
  await shot('16d-prog-semana');
  await clica('[data-act=progIr]:has-text("Mês")');
  await page.waitForSelector('.cal-g');
  await shot('16e-prog-mes');
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

  // Itens com erro
  await page.evaluate(() => Router.go('falhas'));
  await page.waitForSelector('[data-act=falhaDescartar]');
  await shot('18a-itens-com-erro');
  await clica('[data-act=falhaDescartar]');
  await confirma();
  await clica('[data-act=back]');

  // Entrar na vistoria do colega (mesma equipe, outra escola)
  await clica('[data-act=entrarVistoria]');
  await page.waitForSelector('.whdr');
  const dir = await page.evaluate(() => App.V.d.dados.diretor);
  if (!/João/.test(dir)) throw new Error('Dados do colega não vieram: ' + dir);
  await shot('18b-vistoria-do-colega');
  await clica('[data-act=sairVistoria]');
  await confirma();
  await page.waitForSelector('.stats');

  await clica('[data-act=tab][data-to=escolas]');
  await page.waitForSelector('.prog-hero');
  await shot('19-escolas');
  await clica('#painel ~ .sch, .sch');
  await page.waitForSelector('#escBox .card');
  await shot('19a-escola');
  await clica('[data-act=go][data-to=vistoria]');
  await page.waitForSelector('#vdBox .card');
  await shot('19b-vistoria');
  await clica('[data-act=back]'); await clica('[data-act=back]');
  await clica('[data-act=tab][data-to=pendencias]');
  await page.waitForSelector('.pcard');
  await shot('20-pendencias');
  await clica('[data-act=reagendar]');
  await shot('20a-reagendar');
  await clica('#rgOk');
  await clica('[data-act=tab][data-to=fotos]');
  await page.waitForSelector('.gal3');
  await shot('21-fotos');
  await clica('.gal3 button');
  await page.waitForSelector('.pv-info');
  await shot('22-visor');
  await clica('.pv-top [data-act=sheetClose]');

  // Primeiro acesso
  await page.evaluate(() => { App.token = null; LS.del('token'); Router.reset('login'); });
  await clica('[data-act=primeiroAcesso]');
  await page.fill('[data-k="@login"]', '1002');
  await page.fill('[data-k="@codigo"]', '123456');
  await clica('[data-act=paCodigo]');
  await page.waitForSelector('#paSenha');
  await page.type('#paSenha', 'Vistar2026');
  await page.fill('#paRep', 'Vistar2026');
  await clica('[data-act=chk][data-k="@aceite"]');
  await shot('23-primeiro-acesso');
  await clica('[data-act=paSenha]');
  await page.waitForSelector('#paPerm');
  await shot('24-permissoes');
  await clica('[data-act=paFim]');

  // Supervisão
  await page.evaluate(() => { App.token = null; LS.del('token'); LS.del('boot'); App.data = null; Router.reset('login'); });
  await page.fill('input[name=email]', '2001');
  await page.fill('input[name=senha]', 'vistar2026');
  await shot('25-login');
  await clica('button[type=submit]');
  await page.waitForSelector('#supBox .kpi4');
  await page.waitForSelector('.prog-hero');
  await shot('26-sup-painel');
  await clica('[data-act=tab][data-to=equipesSup]');
  await page.waitForSelector('.eq-card');
  await shot('27-sup-equipes');
  await clica('[data-act=tab][data-to=validar]');
  await page.waitForSelector('#valBox .card');
  await shot('28-sup-validar');
  await clica('#valBox [data-to=vistoria]');
  await page.waitForSelector('#vdBox .card');
  await shot('29-sup-vistoria');
  await clica('[data-act=back]');
  await clica('[data-act=menu]');
  await clica('[data-act=menuIr][data-to=usuarios]');
  await page.waitForSelector('#uBox .sch');
  await clica('[data-act=usuarioNovo]');
  await page.fill('#usNome', 'Ana Teste');
  await page.fill('#usEmail', 'ana@x.com');
  await shot('30-sup-usuario');
  await clica('#usOk');
  await page.waitForSelector('[data-act=copiar]');
  await shot('31-sup-codigo');
  await clica('[data-act=sheetClose]');
  await clica('[data-act=back]');
  await clica('[data-act=tab][data-to=home]');
  await clica('[data-act=go][data-to=programacao]');
  await page.waitForSelector('.wk-row');
  await clica('[data-act=visitaNova]');
  await shot('32-sup-nova-visita');

  await browser.close();
  if (erros.length) { console.error('ERROS NO NAVEGADOR:\n' + erros.join('\n')); process.exit(1); }
  console.log('OK · screenshots em ' + OUT);
})().catch(e => { console.error(e); process.exit(1); });
