#!/usr/bin/env node
/**
 * Gera a pasta dist/ com o MÍNIMO de arquivos para colar no editor do Apps Script:
 *   Codigo.gs, Index.html, RelatorioVistoria.html, RelatorioCompleto.html, Manual.html, appsscript.json
 *   node dev/build-dist.js
 */
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'src');
const dist = path.join(__dirname, '..', 'dist');
fs.mkdirSync(dist, { recursive: true });
fs.readdirSync(dist).forEach(f => fs.unlinkSync(path.join(dist, f)));

const ordem = ['Config', 'Db', 'Acesso', 'Auth', 'Code', 'Api', 'Relatorios', 'Supervisao', 'Cadastros', 'Extracao', 'Orcamentos', 'DadosIniciais'];
const gs = fs.readdirSync(src).filter(f => f.endsWith('.gs')).map(f => f.replace('.gs', ''));
const faltando = gs.filter(f => ordem.indexOf(f) < 0);
if (faltando.length) throw new Error('Adicione à ordem: ' + faltando.join(', '));
const versao = /const VERSAO = '([^']+)'/.exec(fs.readFileSync(path.join(src, 'Config.gs'), 'utf8'))[1];
fs.writeFileSync(path.join(dist, 'Codigo.gs'),
  '/**\n * VistAR ' + versao + ' · servidor completo em um arquivo (gerado por dev/build-dist.js).\n' +
  ' * Não edite aqui: edite src/ e gere de novo. Para instalar, veja docs/GUIA_DE_IMPLANTACAO.md.\n */\n\n' +
  ordem.map(f => '/* ════════════════════ ' + f + '.gs ════════════════════ */\n\n' + fs.readFileSync(path.join(src, f + '.gs'), 'utf8')).join('\n\n'));

let index = fs.readFileSync(path.join(src, 'Index.html'), 'utf8')
  .replace(/<\?!=\s*include\('(\w+)'\);?\s*\?>/g, (m, f) => fs.readFileSync(path.join(src, f + '.html'), 'utf8'));
const scriptlets = index.match(/<\?/g) || [];
if (scriptlets.length !== 1 || !/<\?!= boot \?>/.test(index)) throw new Error('Index.html deveria ter só o scriptlet do boot (achei ' + scriptlets.length + ')');
fs.writeFileSync(path.join(dist, 'Index.html'), index);
['RelatorioVistoria.html', 'RelatorioCompleto.html', 'Manual.html', 'appsscript.json'].forEach(f => fs.copyFileSync(path.join(src, f), path.join(dist, f)));
fs.readdirSync(dist).forEach(f => console.log('dist/' + f + ' · ' + Math.round(fs.statSync(path.join(dist, f)).size / 1024) + ' KB'));
