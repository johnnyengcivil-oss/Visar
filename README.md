# VistAR · Vistorias de climatização (Google Apps Script)

App da Web para as equipes de campo do **Consórcio Climatiza São Paulo**: check-in na escola, levantamento em 6 etapas, fotos, assinaturas, relatórios em PDF e envio para a unidade. Tudo roda no Google Apps Script, com uma **planilha** como banco de dados e o **Drive** guardando fotos e PDFs.

## Telas e fluxo

1. **Início**: iniciar vistoria (escolha da escola + check-in com GPS), vistoria em andamento (contadores, tempo em campo, pendências, botão de foto rápida), equipe em trânsito (rota, chegada prevista, Google Maps/Waze), indicadores e roteiro do dia.
2. **Vistoria em 6 etapas + revisão**: Dados da escola · Entrada de energia (BT com caixas 1 e 2 / MT com transformador) · Estrutura (blocos, pavimentos, cobertura, orientação, VRF) · Elétrica (por bloco) · Ambientes (por bloco/pavimento + áreas externas) · Equipamentos com carga · Revisão (resumo, pendências, responsável, assinaturas, relatórios).
3. **Cancelar vistoria** com motivo, recusa e foto do registro.
4. **Relatório de vistoria** (folha única no formato SME) e **Relatório completo** (capa, resumo executivo, dados, entrada, estrutura, elétrica, ambientes, equipamentos, pré-dimensionamento de climatização, fotos, termo).
5. **Vistoria finalizada**: check-out, status da equipe, envio e documentos, rota para a próxima escola.
6. **Escolas**, **Fotos**, **Pendências** e **Credencial** (crachá com foto, supervisor, engenheiros das DREs, alterar senha, sair).

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

1. Crie um projeto em <https://script.google.com> (ou, para usar o menu, abra uma planilha nova › Extensões › Apps Script).
2. Copie os arquivos de `src/` para o projeto (mesmos nomes; `.gs` como Script e `.html` como HTML), incluindo `appsscript.json` (Configurações do projeto › mostrar o arquivo de manifesto).
   - Com o [clasp](https://github.com/google/clasp): `cp .clasp.json.example .clasp.json`, preencha o `scriptId` e rode `clasp push`.
3. No editor, execute **`instalarVistAR`** e autorize. Isso cria a planilha (ou usa a vinculada), as abas, a pasta `VistAR` no Drive e o gatilho diário.
4. Opcional: execute **`carregarExemplo`** para criar os dados dos protótipos. O login é o seu e-mail Google com a senha `vistar2026` (troque em Credencial › Alterar senha).
5. **Implantar › Nova implantação › App da Web**: executar como *Eu*; acesso *Qualquer pessoa com conta Google* (ou *Qualquer pessoa*, se os técnicos não tiverem conta Google; o login do app continua obrigatório).
6. Abra a URL no celular e use "Adicionar à tela inicial".

### Cadastro

- **Usuarios**: `id, email, nome, cargo, equipeId, rg, empresa, perfil, dres` (DREs separadas por vírgula). Para definir a senha, use o menu **VistAR › Definir senha de usuário** na planilha.
- **Equipes**, **DREs**, **Escolas** e **Roteiro** (uma linha por visita: `data` AAAA-MM-DD, `hora`, `equipeId`, `escolaId`, `status` = agendada/retorno/concluida).
- **Config**: nome do consórcio, contrato, responsável técnico, e-mails de cópia e da coordenação, raio de check-in, envio automático e a premissa kW/TR.
- **VistAR › Geocodificar escolas** preenche lat/lng pelo endereço (usado no check-in e nas rotas).

## Pré-dimensionamento (premissas)

Carga = área × fator do uso (ex.: sala de aula 650 BTU/h·m², informática 800), +10% para fachadas Norte/Oeste, +10% no último pavimento, mais equipamentos (W × 3,412). A capacidade é arredondada para o modelo comercial; a potência elétrica usa o fator kW/TR da Config. A capacidade da entrada é estimada pelo disjuntor geral (BT) ou pelo kVA do transformador (MT), com FP 0,92. Os fatores ficam em `src/Relatorios.gs`.

## Desenvolvimento local

```bash
node dev/build-preview.js   # gera dev/preview.html com servidor simulado (dev/mock.js)
node dev/smoke.js           # percorre o fluxo inteiro no Chromium e salva screenshots em dev/shots
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
  Views.html             telas
dev/                     preview local e teste de fumaça
```
