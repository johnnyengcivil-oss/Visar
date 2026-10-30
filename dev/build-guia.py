#!/usr/bin/env python3
"""Gera docs/Guia_de_Implantacao_VistAR.pdf a partir do Markdown (requer: pip install markdown; Chromium do Playwright)."""
import markdown, pathlib, subprocess, sys
raiz = pathlib.Path(__file__).resolve().parent.parent
md = (raiz / 'docs' / 'GUIA_DE_IMPLANTACAO.md').read_text(encoding='utf-8')
corpo = markdown.markdown(md, extensions=['tables', 'fenced_code'])
html = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>VistAR · Guia de implantação</title>
<style>
@page {{ size: A4; margin: 16mm 15mm; }}
body {{ font-family: Inter, Arial, sans-serif; color: #0F1E36; font-size: 10.5pt; line-height: 1.5; }}
h1 {{ background: #0F2140; color: #fff; padding: 18px 20px; border-radius: 10px; font-size: 20pt; margin: 0 0 18px; }}
h2 {{ color: #0F2140; border-bottom: 3px solid #1F8F86; padding-bottom: 4px; margin-top: 26px; page-break-after: avoid; }}
h3 {{ color: #1F8F86; margin-top: 18px; page-break-after: avoid; }}
table {{ border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 9.5pt; page-break-inside: avoid; }}
th {{ background: #E3F4F2; text-align: left; }} th, td {{ border: 1px solid #D5DCE5; padding: 6px 8px; vertical-align: top; }}
code {{ background: #F1F4F8; padding: 1px 5px; border-radius: 4px; font-size: 9.5pt; }}
pre {{ background: #F1F4F8; padding: 12px; border-radius: 8px; font-size: 8.5pt; overflow: hidden; }}
pre code {{ background: none; }}
blockquote {{ background: #FFF1DB; border-left: 4px solid #E08A00; margin: 12px 0; padding: 8px 14px; border-radius: 6px; }}
li {{ margin: 3px 0; }} hr {{ border: 0; border-top: 1px solid #E3E8EF; margin: 20px 0; }}
</style></head><body>{corpo}</body></html>"""
saida_html = raiz / 'docs' / '.guia.html'
saida_html.write_text(html, encoding='utf-8')
js = f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://{saida_html}');
await p.pdf({{path:'{raiz / 'docs' / 'Guia_de_Implantacao_VistAR.pdf'}',format:'A4',printBackground:true,displayHeaderFooter:true,headerTemplate:'<span></span>',
footerTemplate:'<div style="font-size:8px;width:100%;text-align:center;color:#6B7A90">VistAR · Guia de implantação · página <span class=pageNumber></span> de <span class=totalPages></span></div>',margin:{{top:'16mm',bottom:'18mm',left:'15mm',right:'15mm'}}}});await b.close();}})();"""
subprocess.run(['node', '-e', js], check=True)
saida_html.unlink()
print('docs/Guia_de_Implantacao_VistAR.pdf gerado')
