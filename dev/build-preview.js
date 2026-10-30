#!/usr/bin/env node
/**
 * Monta dev/preview.html a partir de src/Index.html (resolve include() e boot)
 * com o servidor simulado, para abrir no navegador sem o Apps Script.
 *   node dev/build-preview.js && abra dev/preview.html
 */
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'src');
let html = fs.readFileSync(path.join(src, 'Index.html'), 'utf8');
html = html.replace(/<\?!=\s*include\('(\w+)'\);?\s*\?>/g, (m, f) => fs.readFileSync(path.join(src, f + '.html'), 'utf8'));
const boot = { cfg: { consorcio: 'Consórcio Climatiza São Paulo', contrato: 'SME-SP 000/2026', raioCheckin: 400, versao: '1.0.0' }, sso: null, params: {} };
html = html.replace('<?!= boot ?>', JSON.stringify(boot));
html = html.replace('<base target="_top">', '<base target="_top"><meta name="viewport" content="width=device-width, initial-scale=1"><script>' + fs.readFileSync(path.join(__dirname, 'mock.js'), 'utf8') + '</script>');
if (/<\?/.test(html)) throw new Error('Scriptlet não resolvido no preview');
fs.writeFileSync(path.join(__dirname, 'preview.html'), html);
console.log('dev/preview.html gerado');
