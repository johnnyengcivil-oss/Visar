# VistAR 2.0 · Proposta de arquitetura e migração (web + Android + iOS)

Este documento responde a três perguntas: por que o app ficou ruim no celular, se React resolve, e como migrar para um app Android/iOS **sem perder nada** do que já existe.

---

## 1. O que aconteceu na versão 1.2 (diagnóstico)

| Sintoma | Causa real | Situação |
|---|---|---|
| No celular, a página aparecia "de computador", minúscula, com cartões lado a lado | O servidor enviava a configuração de largura de tela (`viewport`) num formato que o Google descartou sem avisar. Sem ela, o celular desenha a página com ~980 px e encolhe tudo ~2,4 vezes. As grades de tablet/computador entravam no celular. | **Corrigido na 1.2.1** (formato documentado pelo Google + correção automática de escala, caso o navegador ainda ignore) |
| Textos e botões pequenos | Tamanhos de 10,5 a 12,5 px e botões de 32 a 38 px | **Corrigido na 1.2.1**: texto mínimo de 13 px, campo e botão principal de 48 a 52 px, toque mínimo de 40 a 44 px; auditoria automática em 320, 360, 390 e 430 px |
| Mapas "não funcionam" | Os mapas de pontos eram um desenho ilustrativo, não um mapa real | **Corrigido na 1.2.1**: mapa real e interativo (OpenStreetMap), com a linha da rota do Google |
| Finalização demorada e "Gerando…" | Os 2 PDFs e o e-mail eram gerados **segurando a trava do servidor** (20 s a 1 min). Nesse tempo, todas as outras equipes esperavam para salvar dados e fotos. | **Corrigido na 1.2.1**: a vistoria é gravada na hora; os relatórios saem numa segunda etapa da fila, sem travar ninguém |
| Lentidão geral | Cada ação vai ao Google Apps Script (1 a 3 s por chamada) e lê a Planilha inteira | **Limite da plataforma**. Melhora com cache, mas só se resolve com outro banco de dados (seção 3) |
| Sincronização | Já funciona em Wi-Fi **ou** dados móveis. Só espera o Wi-Fi se a opção "Enviar fotos só no Wi-Fi" for ligada em Configurações (vem desligada). | Sem mudança |

---

## 2. React resolve?

**Em parte.** É importante separar as duas coisas:

- **Organização e fluidez da tela:** sim. React (com TypeScript) organiza o app em componentes reutilizáveis, atualiza só o pedaço da tela que mudou (hoje várias ações redesenham a tela inteira) e é a base natural para o app de celular.
- **Velocidade de salvar e carregar dados:** não. O tempo de resposta vem do **servidor** (Apps Script + Planilha), e não da biblioteca de tela. Um app em React falando com o mesmo Apps Script continuaria com 1 a 3 s por ação.

Para ficar rápido de verdade em campo, a troca precisa ser nas **duas pontas**: tela em React **e** banco de dados feito para app com sincronização offline.

---

## 3. Arquitetura proposta (VistAR 2.0)

```
               ┌───────────────────────── mesmo código ─────────────────────────┐
  Celular      │  App VistAR (React + TypeScript)                               │
  Android/iOS  │   • Capacitor: câmera nativa, GPS, arquivos, envio em 2º plano │
  Navegador    │   • PWA: instalável e offline também pelo navegador           │
               └───────────────┬────────────────────────────────────────────────┘
                               │ sincronização automática (Wi-Fi ou dados móveis)
               ┌───────────────▼────────────────────────────────────────────────┐
  Google       │ Firebase                                                       │
  Cloud        │  • Firestore: banco com cache offline e sincronização por campo│
               │  • Storage: fotos e documentos (envio retomável)               │
               │  • Authentication: login, códigos de acesso, perfis            │
               │  • Cloud Functions: PDFs, e-mails, extrações, orçamentos       │
               └───────────────┬────────────────────────────────────────────────┘
                               │ exportação automática
               ┌───────────────▼────────────────────────────────────────────────┐
               │ Google Planilhas e Drive (espelho para consulta e relatórios)  │
               └────────────────────────────────────────────────────────────────┘
```

**Por que Firebase:**
- É do Google, como o resto do consórcio.
- Foi feito para apps de campo: o celular grava localmente e sincroniza sozinho quando há sinal (Wi-Fi ou 4G/5G), resolvendo conflitos entre colegas na mesma vistoria.
- Responde em milissegundos (não em segundos).
- Tem bibliotecas oficiais para Android e iOS.

**Organização do código** (pensada para reaproveitar e testar):

| Pasta | Conteúdo |
|---|---|
| `packages/core` | Regras puras em TypeScript: pré-dimensionamento, cargas, permissões e perfis, estados da vistoria e do orçamento, validações. Testadas isoladamente. |
| `packages/ui` | Componentes de tela: botões, seletores, cartões, câmera, mapa, assinatura. Pensados primeiro para o celular. |
| `apps/campo` | App do vistoriador (Android, iOS e navegador) |
| `apps/gestao` | Painéis, cadastros, orçamentos e extração (computador e tablet) |
| `functions` | Servidor: PDFs, e-mails, extrações, integrações |

---

## 4. Migração sem perder o que já foi feito

O que é **reaproveitado**:

| Item | Como |
|---|---|
| Regras de cálculo (pré-dimensionamento, cargas, entrada de energia) | Convertidas para `packages/core`, com os mesmos testes de hoje como garantia |
| Perfis, permissões, hierarquia e empresas | Mesma lógica, em `packages/core` |
| Fluxos e telas (vistoria em 6 etapas, supervisão, orçamentos, cadastros, assistente de roteiro) | Mesmos fluxos, redesenhados em componentes |
| Modelos dos relatórios (SME e completo) e manual | Mesmos modelos, gerados nas Cloud Functions |
| Dados: escolas, usuários, vistorias, fotos, orçamentos | Script de migração Planilha → Firestore e Drive → Storage, com conferência linha a linha |
| Testes automáticos (servidor, telas, auditoria de celular) | Viram a especificação da nova versão |

**Fases**, com o app atual funcionando até a troca:

1. **Base:** projeto Firebase, `packages/core` com as regras portadas e testadas, migração de dados em ambiente de teste.
2. **App de campo:** check-in, 6 etapas, câmera, fotos, sincronização offline, finalização. Piloto com 1 equipe em paralelo à versão atual.
3. **Gestão:** painéis, supervisão, validação, programação e assistente, cadastros, orçamentos, extração.
4. **Lojas:** publicação na Google Play e na App Store.
5. **Troca:** migração final dos dados e desligamento do Apps Script (a Planilha continua como espelho).

---

## 5. Decisões que dependem de você

1. **Aprovar o Firebase.**
   - É preciso criar um projeto no Google Cloud com o plano **Blaze** (pago por uso, com cota gratuita mensal), que é exigido para Storage e Cloud Functions.
   - O custo depende principalmente do volume de fotos; dá para pôr um limite de gasto e um alerta.
2. **Contas de desenvolvedor**, quando for publicar nas lojas:
   - Google Play: taxa única de US$ 25;
   - Apple: US$ 99 por ano.
   - Até lá, o app roda pelo navegador, instalado como PWA, e por instalação direta no Android.
3. **Prioridade:** a sugestão é começar pelo **app de campo no Android**, que é onde está o maior ganho.
