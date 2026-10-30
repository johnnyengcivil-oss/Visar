# VistAR · Vistorias de climatização (Google Apps Script)

App da Web para as equipes de campo do **Consórcio Climatiza São Paulo**: check-in na escola, levantamento em 6 etapas, fotos, assinaturas, relatórios em PDF e envio para a unidade. Tudo roda no Google Apps Script, com uma **planilha** como banco de dados e o **Drive** guardando fotos e PDFs.

## Telas e fluxo

1. **Início**: iniciar vistoria (escolha da escola + check-in com GPS), vistoria em andamento (contadores, tempo em campo, pendências, botão de foto rápida), equipe em trânsito (rota, chegada prevista, Google Maps/Waze), indicadores e roteiro do dia.
2. **Vistoria em 6 etapas + revisão**: Dados da escola · Entrada de energia (BT com caixas 1 e 2 / MT com transformador) · Estrutura (blocos, pavimentos, cobertura, orientação, VRF) · Elétrica (por bloco) · Ambientes (por bloco/pavimento + áreas externas) · Equipamentos com carga · Revisão (resumo, pendências, responsável, assinaturas, relatórios).
3. **Cancelar vistoria** com motivo, recusa e foto do registro.
4. **Relatório de vistoria** (folha única no formato SME) e **Relatório completo** (capa, resumo executivo, dados, entrada, estrutura, elétrica, ambientes, equipamentos, pré-dimensionamento de climatização, fotos, termo).
5. **Vistoria finalizada**: check-out, status da equipe, envio e documentos, rota para a próxima escola.
6. **Escolas** (painel do contrato: avanço, meta, evolução diária, DREs, equipes, mapa) › detalhe da escola › detalhe da vistoria (somente leitura, com resultado de carga e histórico de versões).
7. **Fotos** (galeria por escola com filtros, fila de envio e visualizador com legenda, local, autor, compartilhar) e **câmera própria** com guia, carimbo e atalhos dos itens da etapa.
8. **Pendências de retorno** por situação (retorno solicitado, não concluída, sem acesso, recusa, aguardando DRE) com progresso das etapas, Retomar (continua de onde parou, nova versão), Reagendar, Cobrar DRE e Ver registro.
9. **Programação** em dia, semana e mês. **Login** (e-mail ou matrícula, manter conectado, esqueci a senha), **Primeiro acesso** com código, **Configurações** (texto, tema escuro, qualidade das fotos, só Wi-Fi, notificações, permissões, biometria), **Credencial** e **assinatura em tela cheia**.
10. **Módulo de supervisão** (perfis supervisor, coordenação e admin): painel do dia com alertas, equipes ao vivo (status, posição, fila de envio), validação de vistorias (aprovar ou pedir correção), programação das equipes e usuários/códigos de acesso.

## Recursos do Google usados

| Recurso | Uso |
|---|---|
| `HtmlService` | App de página única, templates dos relatórios e conversão HTML → **PDF** |
| `SpreadsheetApp` | Banco de dados (abas Usuarios, Equipes, DREs, Escolas, Roteiro, Vistorias, Etapas, Fotos, Pendencias, Cancelamentos, Log, Config) |
| `DriveApp` + Drive API avançada | Pastas por DRE/vistoria, fotos, assinaturas, PDFs e miniaturas (`thumbnailLink` em lote com `UrlFetchApp.fetchAll`) |
| `Maps` | Rota, tempo e distância (`DirectionFinder`), mapa estático da rota (`StaticMap`) e geocodificação das escolas |
| `MailApp` | Cópia do relatório para a unidade (com cópia ao consórcio), aviso de cancelamento e resumo diário |
| `LockService` / `CacheService` / `PropertiesService` | Concorrência entre equipes, cache de rotas/miniaturas/config, sequência `VST-AAAA-NNNN` e segredo dos tokens |
| `ScriptApp` (gatilho) | Resumo diário às 18h para a coordenação |
| `google.script.history` | Botão "voltar" do celular funciona dentro do app |
| `Session` | Login automático (SSO) quando o e-mail Google está cadastrado |

## Fluidez e uso em campo

- **Offline-first**: tudo é salvo no aparelho na hora (localStorage + IndexedDB) e enviado por uma **fila de sincronização** com nova tentativa automática. Sem internet, a equipe continua trabalhando; o selo no topo mostra quantos itens estão na fila.
- **Abertura instantânea**: a última carga fica em cache e a tela abre antes da resposta do servidor.
- **Fotos** comprimidas no aparelho (até 1600 px), com **carimbo de data/hora e escola**, miniaturas locais e envio em segundo plano direto para a pasta da vistoria no Drive.
- **Foto rápida** (botão flutuante) que já envia a foto para a etapa certa.
- **Cálculos ao vivo**: seção do cabo pelo diâmetro (π·(Ø/2)²), áreas por unidade e por tipo, pontos de iluminação, potência em kW.
- **Pendências automáticas** por etapa, com selos "Pendente/OK" e contagem de fotos nos cartões.
- **Check-in com GPS**, com aviso quando o técnico está longe da escola.
- Assinatura na tela (canvas), vibração ao tocar, telas de esqueleto no carregamento, animações suaves.

## Instalação

**Guia completo para leigos:** [`docs/GUIA_DE_IMPLANTACAO.md`](docs/GUIA_DE_IMPLANTACAO.md) (também em PDF: `docs/Guia_de_Implantacao_VistAR.pdf`).

Resumo: crie uma planilha › Extensões › Apps Script › cole os **5 arquivos da pasta `dist/`** (`appsscript.json`, `Codigo.gs`, `Index`, `RelatorioVistoria`, `RelatorioCompleto`) › execute `instalarVistAR` › execute `criarAdministrador` (ou `carregarExemplo`) › Implantar › App da Web (executar como *Eu*).

Com o [clasp](https://github.com/google/clasp), dá para usar `src/` direto: `cp .clasp.json.example .clasp.json`, preencha o `scriptId` e rode `clasp push`.

### Cadastro

- **Usuarios**: `id, email, nome, cargo, equipeId, rg, empresa, perfil, dres` (DREs separadas por vírgula). Para definir a senha, use o menu **VistAR › Definir senha de usuário** na planilha.
- **Equipes**, **DREs**, **Escolas** e **Roteiro** (uma linha por visita: `data` AAAA-MM-DD, `hora`, `equipeId`, `escolaId`, `status` = agendada/retorno/concluida).
- **Config**: nome do consórcio, contrato, responsável técnico, e-mails de cópia e da coordenação, raio de check-in, envio automático e a premissa kW/TR.
- **VistAR › Geocodificar escolas** preenche lat/lng pelo endereço (usado no check-in e nas rotas).

## Pré-dimensionamento (premissas)

Carga = área × fator do uso (ex.: sala de aula 650 BTU/h·m², informática 800), +10% para fachadas Norte/Oeste, +10% no último pavimento, mais equipamentos (W × 3,412). A capacidade é arredondada para o modelo comercial; a potência elétrica usa o fator kW/TR da Config. A capacidade da entrada é estimada pelo disjuntor geral (BT) ou pelo kVA do transformador (MT), com FP 0,92. Os fatores ficam em `src/Relatorios.gs`.

## Desenvolvimento local

```bash
node dev/gas-sim.js          # testa o servidor (.gs) com Planilha/Drive/e-mail simulados
node dev/build-preview.js    # gera dev/preview.html com servidor simulado (dev/mock.js)
node dev/smoke.js            # percorre todas as telas no Chromium e salva screenshots em dev/shots
node dev/build-dist.js       # gera dist/ (5 arquivos para colar no Apps Script)
node dev/gas-sim.js --dist   # testa o pacote dist/
python3 dev/build-guia.py    # gera o PDF do guia de implantação
```

## Estrutura

```
src/
  appsscript.json        manifesto (V8, Drive API v3, App da Web)
  Code.gs                doGet, include e roteador da API (google.script.run.api)
  Config.gs              configuração, esquema, instalação, dados de exemplo, menu
  Db.gs                  camada de dados sobre o Sheets + utilitários
  Auth.gs                login, senha com hash, token HMAC, SSO
  Api.gs                 check-in, etapas, fotos, cancelamento, finalização, rotas, Drive
  Relatorios.gs          pré-dimensionamento, PDFs, e-mail, resumo diário
  RelatorioVistoria.html modelo SME (folha única)
  RelatorioCompleto.html relatório técnico completo
  Index.html             casca do app
  Styles.html            visual
  App.html               núcleo: estado, fila offline, câmera, GPS, roteador
  Vistoria.html          formulários e regras das 6 etapas
  Views.html             telas principais
  Telas.html             login, primeiro acesso, configurações, programação, painel, galeria, detalhes
  Supervisao.html        módulo de supervisão (cliente)
  Supervisao.gs          painel, equipes, validação, programação, pendências, galeria, usuários
dist/                    pacote de instalação (5 arquivos)
docs/                    guia de implantação (Markdown e PDF)
dev/                     preview local e teste de fumaça
```
