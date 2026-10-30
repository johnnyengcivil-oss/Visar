# VistAR · Guia de implantação passo a passo

Este guia é para quem **nunca programou**. Você só vai copiar e colar arquivos, clicar em alguns botões do Google e preencher uma planilha. Reserve **cerca de 1 hora** na primeira vez.

> **Como ler este guia:** faça as etapas na ordem. Cada etapa termina com um ✅ **Confira**. Só avance quando o "Confira" estiver certo. Se algo der errado, vá à seção **13. Problemas comuns**.

---

## Sumário

1. O que você precisa
2. Entenda como o VistAR funciona (2 minutos)
3. Baixe os arquivos do projeto
4. Crie a planilha
5. Abra o editor de código (Apps Script)
6. Cole os 5 arquivos
7. Instale e autorize
8. Crie seu acesso de administrador
9. Publique o app (gerar o link)
10. Seu primeiro acesso e o teste completo
11. Cadastre os dados reais (escolas, equipes, usuários, roteiro)
12. Instale no celular das equipes (trabalho em equipe e itens com erro)
13. Problemas comuns
14. Como atualizar o app depois (sem mudar o link)
15. Limites do Google, backup e segurança
16. Mapa da planilha (o que é cada aba)

---

## 1. O que você precisa

| Item | Observação |
|---|---|
| **Uma conta Google** | De preferência a conta **corporativa** do consórcio (Google Workspace). Uma conta Gmail comum também funciona, mas com menos e-mails por dia (veja a seção 15). |
| **Um computador** com Chrome | A instalação é feita no computador. Depois as equipes usam no celular. |
| **Os arquivos do projeto** | Estão no GitHub, na pasta `dist/` (etapa 3). |
| **1 hora** | Só na primeira vez. |

**Importante:** use **sempre a mesma conta Google** do começo ao fim. Essa conta vai ser a "dona" do app: a planilha, as fotos e os PDFs ficam no Google Drive dela.

---

## 2. Entenda como o VistAR funciona (2 minutos)

```
 Celular da equipe  ──►  App VistAR (link do Google)  ──►  Planilha "VistAR · Banco de dados"
     (fotos, GPS,             (Apps Script: o código        (escolas, equipes, roteiro,
      assinaturas)              que você vai colar)           vistorias, usuários...)
                                        │
                                        └──►  Pasta "VistAR" no seu Google Drive
                                              (fotos, assinaturas e relatórios em PDF)
```

- **Planilha** = o banco de dados. Você cadastra escolas, equipes e o roteiro nela. O app também grava tudo nela.
- **Apps Script** = o "motor" do app. Ele fica *dentro* da planilha (menu Extensões).
- **Link do app** = o endereço que as equipes abrem no celular.
- **Pasta VistAR no Drive** = é criada sozinha. Ali ficam fotos e PDFs, organizados por DRE e por vistoria.

O app **funciona sem internet** em campo: tudo fica guardado no celular e é enviado quando o sinal volta.

---

## 3. Baixe os arquivos do projeto

1. Abra o repositório no GitHub: **github.com/johnnyengcivil-oss/Visar**
2. No canto superior esquerdo, onde aparece o nome da branch (`main`), escolha a branch **`ccr-4c658998-sgo3uh`** (ou a `main`, depois que ela for mesclada).
3. Clique no botão verde **Code** › **Download ZIP**.
4. No seu computador, abra o arquivo baixado (clique duas vezes) e entre na pasta **`dist`**.

Dentro de `dist` existem **5 arquivos**. São só eles que você vai usar:

| Arquivo | O que é |
|---|---|
| `appsscript.json` | Configurações do projeto |
| `Codigo.gs` | Todo o código do servidor |
| `Index.html` | Todo o app (telas) |
| `RelatorioVistoria.html` | Modelo do relatório de vistoria (folha SME) |
| `RelatorioCompleto.html` | Modelo do relatório técnico completo |

> **Dica:** para copiar o conteúdo de um arquivo, abra-o com o **Bloco de Notas** (Windows: botão direito › Abrir com › Bloco de notas; Mac: TextEdit). Depois use **Ctrl+A** (selecionar tudo) e **Ctrl+C** (copiar). No Mac, troque Ctrl por **Cmd**.

✅ **Confira:** você está vendo os 5 arquivos da pasta `dist`.

---

## 4. Crie a planilha

1. Acesse **sheets.google.com** com a conta Google escolhida.
2. Clique em **+ Em branco** (planilha nova).
3. Clique no título "Planilha sem título" (canto superior esquerdo) e renomeie para **VistAR · Banco de dados**.

✅ **Confira:** a planilha está aberta e com o nome certo.

---

## 5. Abra o editor de código (Apps Script)

1. Na planilha, clique no menu **Extensões** › **Apps Script**.
2. Abre uma nova aba com o editor. Clique em **"Projeto sem título"** (no topo) e renomeie para **VistAR**.
3. À esquerda, você verá um arquivo chamado **Código.gs** (ou `Code.gs`) com um texto pequeno (`function myFunction() {...}`).

✅ **Confira:** você está no editor, com o projeto chamado VistAR.

---

## 6. Cole os 5 arquivos

### 6.1 · Arquivo de configurações (`appsscript.json`)

1. No editor, clique na **engrenagem ⚙ (Configurações do projeto)**, na barra da esquerda.
2. Marque a caixa **"Mostrar arquivo de manifesto 'appsscript.json' no editor"**.
3. Volte para o editor (ícone **< >** na barra da esquerda). Agora aparece o arquivo **appsscript.json**. Clique nele.
4. Apague **tudo** que está dentro dele (Ctrl+A, Delete).
5. Copie todo o conteúdo do seu arquivo `dist/appsscript.json` e cole aqui (Ctrl+V).
6. Ainda na engrenagem ⚙, confira se o **fuso horário** é **(GMT-03:00) São Paulo**.

### 6.2 · Código do servidor (`Codigo.gs`)

1. Clique no arquivo **Código.gs** (o que já existia).
2. Apague **tudo** que está dentro dele.
3. Copie todo o conteúdo de `dist/Codigo.gs` e cole aqui.
   *É um arquivo grande (cerca de 2.100 linhas). Isso é normal.*

### 6.3 · Os 3 arquivos HTML

Para **cada um** dos arquivos abaixo:

1. Clique no **+** ao lado de "Arquivos" › **HTML**.
2. Digite o nome **exatamente** como na tabela, **sem** o `.html` (o Google coloca sozinho).
3. Apague o conteúdo que o Google coloca no arquivo novo.
4. Cole o conteúdo do arquivo correspondente da pasta `dist`.

| Nome a digitar | Conteúdo a colar |
|---|---|
| `Index` | `dist/Index.html` |
| `RelatorioVistoria` | `dist/RelatorioVistoria.html` |
| `RelatorioCompleto` | `dist/RelatorioCompleto.html` |

> ⚠️ **Os nomes têm de ser idênticos**, com as letras maiúsculas iguais. `index` (minúsculo) ou `Index.html.html` **não funcionam**.

### 6.4 · Salve

Pressione **Ctrl+S** (ou clique no ícone de disquete 💾).

✅ **Confira:** à esquerda aparecem exatamente estes arquivos: `appsscript.json`, `Código.gs`, `Index.html`, `RelatorioCompleto.html` e `RelatorioVistoria.html`. Não há bolinha vermelha nem mensagem de erro no topo.

---

## 7. Instale e autorize

1. No topo do editor há uma caixa de seleção de função (ao lado do botão **▷ Executar** e de **Depurar**). Clique nela e escolha **`instalarVistAR`**.
2. Clique em **▷ Executar**.
3. Aparece **"Autorização necessária"**. Clique em **Revisar permissões** e escolha a sua conta.
4. Vai aparecer **"O Google não verificou este app"**. Isso é **normal**: o app é seu, não está publicado na loja do Google.
   - Clique em **Avançado** (link pequeno, embaixo à esquerda).
   - Clique em **Acessar VistAR (não seguro)**.
5. Leia a lista de permissões e clique em **Permitir**.

> **Por que tantas permissões?** O VistAR precisa ler e gravar na planilha, salvar fotos e PDFs no seu Drive, enviar e-mails com os relatórios, calcular rotas (Google Maps) e criar o lembrete diário. Tudo fica **na sua conta**; nenhum dado vai para terceiros.

6. Aguarde. No rodapé, o **Registro de execução** mostra *"Execução concluída"* e *"VistAR instalado"*.

✅ **Confira:** volte para a aba da planilha e atualize a página (F5). Devem aparecer as abas **Config, Usuarios, Equipes, DREs, Escolas, Roteiro, Vistorias, Etapas, Fotos, Pendencias, Cancelamentos e Log**, e um menu novo **VistAR** no topo (ao lado de "Ajuda"). No seu Google Drive existe agora uma pasta **VistAR**.

---

## 8. Crie seu acesso de administrador

Você tem **dois caminhos**. Para conhecer o app, o caminho A é o melhor.

### Caminho A · Com dados de exemplo (recomendado para testar)

1. Na planilha, clique em **VistAR** › **Carregar dados de exemplo**.
2. Uma janela mostra os acessos criados. **Anote-os:**
   - **Você (coordenação):** seu e-mail Google · senha `vistar2026`
   - **Técnico de teste:** matrícula `1001` · senha `vistar2026`
   - **Supervisor de teste:** matrícula `2001` · senha `vistar2026`
   - **Primeiro acesso de teste:** matrícula `1002` com um código de 6 dígitos

> Os dados de exemplo são as escolas e equipes dos protótipos. Depois dos testes, apague essas linhas das abas (seção 11.6).

### Caminho B · Começar do zero

1. Na planilha, clique em **VistAR** › **Criar meu acesso de administrador**.
2. Uma janela mostra o seu **usuário** e um **código de 6 dígitos**. Anote (vale por 72 horas).
3. Você vai usar esse código na etapa 10, em **Primeiro acesso**.

✅ **Confira:** na aba **Usuarios** existe uma linha com o seu e-mail e `admin` na coluna *perfil*.

---

## 9. Publique o app (gerar o link)

1. Volte ao editor do Apps Script.
2. Clique no botão azul **Implantar** (canto superior direito) › **Nova implantação**.
3. Clique na **engrenagem ⚙** ao lado de "Selecionar tipo" › **App da Web**.
4. Preencha:
   - **Descrição:** `VistAR 1.1`
   - **Executar como:** **Eu** (seu e-mail). ⚠️ *Não* escolha "Usuário que acessa o app da Web".
   - **Quem pode acessar:** escolha conforme a tabela abaixo.
5. Clique em **Implantar**. Se pedir autorização de novo, repita o passo 7.4.
6. Copie o **URL do app da Web** (termina em `/exec`). **Este é o link do VistAR.** Guarde-o.

| Situação da sua equipe | Escolha em "Quem pode acessar" |
|---|---|
| Todos têm e-mail do consórcio (Google Workspace) | **Qualquer pessoa em [seu domínio]**. Os usuários do domínio também podem entrar direto, sem digitar senha. |
| Cada técnico tem uma conta Gmail | **Qualquer pessoa com Conta do Google** |
| Alguns técnicos não têm conta Google | **Qualquer pessoa**. O app continua protegido pelo login com senha do próprio VistAR. |

> **Atenção:** o link só muda se você criar uma **nova implantação**. Para atualizar o app depois **sem mudar o link**, siga a seção 14.

✅ **Confira:** abra o link numa aba anônima do Chrome. Deve aparecer a tela azul **VistAR · Entrar**.

---

## 10. Seu primeiro acesso e o teste completo

### 10.1 · Entrar

- **Caminho A:** na tela de login, digite seu e-mail e a senha `vistar2026`. Depois troque a senha em **☰ Menu › Configurações › Alterar senha**. A nova senha precisa de 8 caracteres, uma letra maiúscula e um número.
- **Caminho B:** toque em **Primeiro acesso**, informe seu e-mail e o código, crie sua senha e aceite os termos.

Como administrador, você entra no **módulo de supervisão** (abas Painel, Equipes, Validar e Pendências). Para fazer uma vistoria de teste, abra **☰ Menu › Ir para o modo campo**.

### 10.2 · Roteiro de teste (15 minutos, de preferência no celular)

Faça este roteiro **uma vez antes de liberar o app para as equipes**:

1. **Modo campo** › escolha uma escola › **Fazer check-in**. Permita a localização.
2. Na etapa **Dados**, toque em **Placa da escola** e tire uma foto. Permita a câmera.
3. Avance pelas etapas com **Salvar e continuar**. Marque algumas opções em cada etapa.
4. Em **Ambientes**, adicione uma sala com comprimento e largura.
5. Na **Revisão**, preencha o nome e o **seu** e-mail como responsável e assine as duas assinaturas.
6. Toque em **Visualizar relatório completo**. A prévia deve aparecer em alguns segundos.
7. Toque em **Finalizar vistoria**. A tela **Vistoria finalizada** deve mostrar os relatórios como **Gerado/Assinado**.
8. Confira:
   - na pasta **VistAR** do Drive: fotos, assinaturas e os 2 PDFs;
   - no seu e-mail: a cópia do relatório;
   - na planilha: as abas **Vistorias**, **Etapas** e **Fotos** com linhas novas.
9. **Teste sem internet:** ative o modo avião, tire uma foto e preencha um campo. Desligue o modo avião e veja o selo "na fila" sumir em alguns segundos.
10. **Teste em dupla (com dois celulares):** no celular A, faça check-in numa escola. No celular B, com outro técnico da **mesma equipe**, toque em **Entrar** no cartão "Sua equipe também está em". Preencha campos diferentes nos dois e cadastre um ambiente em cada um. Em até 1 minuto, os dois celulares mostram tudo.

✅ **Confira:** os 10 passos funcionaram. Se algum falhou, veja a seção 13.

---

## 11. Cadastre os dados reais

Você pode cadastrar **pela planilha** (mais rápido para muitos registros) ou **pelo app** (usuários e programação). Na planilha:

- **A linha 1 é o cabeçalho.** Nunca apague nem renomeie.
- **Cada linha é um registro.** A primeira coluna (`id`) é a identificação e **não pode se repetir**.
- Datas no formato **AAAA-MM-DD** (ex.: `2026-11-03`) e horas **HH:MM** (ex.: `08:30`).

### 11.1 · Config (configurações gerais)

Edite a coluna **valor**:

| chave | O que colocar |
|---|---|
| CONSORCIO | Nome exibido no app e nos relatórios |
| CONTRATO / LOTE | Ex.: `SME-SP 123/2026` / `Lote Penha` |
| EMPRESA | Empresa padrão dos técnicos |
| RESPONSAVEL_TECNICO / _CARGO | Quem assina pelo consórcio no relatório |
| EMAIL_COPIA_CONSORCIO | Recebe cópia de todo relatório enviado às escolas |
| EMAIL_COORDENACAO | Recebe o resumo diário às 18h e os avisos de cancelamento |
| META_INICIO / META_DATA | Início do contrato e data-alvo para concluir todas as escolas (linha de meta do painel) |
| RAIO_CHECKIN_M | Distância máxima da escola para o check-in sem aviso (padrão 400 m) |
| ENVIO_AUTOMATICO_COPIA | `sim` envia o relatório assinado para a escola ao finalizar |
| KW_POR_TR | Premissa de consumo do pré-dimensionamento (padrão 1,05) |
| FATORES_BTU_M2 | Opcional. Ajusta a carga por m² de cada tipo de ambiente, por exemplo: `{"Sala de aula": 700, "Biblioteca": 650}` |

### 11.2 · DREs

| id | nome | engenheiroNome | engenheiroCargo | engenheiroTel | engenheiroEmail |
|---|---|---|---|---|---|
| `Penha` | DRE Penha | Ana Paula Rocha | Engenheiro DRE | (11) 3000-0000 | ana@sme.prefeitura.sp.gov.br |

O **id** é o nome curto da DRE. Ele precisa ser **igual** ao usado nas abas Escolas e Usuarios. Com o e-mail do engenheiro preenchido, o botão **Cobrar** das pendências envia o e-mail automaticamente.

### 11.3 · Escolas

Colunas principais: **id** (ex.: `e-farialima`, sem espaços), **nome**, **cie**, **dre** (igual ao id da DRE), **etapaEnsino**, **logradouro**, **numero**, **cep**, **bairro**, **diretor**, **telefone**, **email**, **ambientesPrevistos**, **status** (`agendada`).

Depois de cadastrar, clique em **VistAR › Geocodificar escolas sem coordenadas**. Isso preenche **lat/lng** pelo endereço, o que é necessário para o check-in por GPS, as rotas e o mapa.

### 11.4 · Equipes

| id | nome | membros | supervisorNome | supervisorTel |
|---|---|---|---|---|
| `eq01` | Equipe 01 | Paulo Reis, Ana Lopes | Roberto Lima | (11) 99000-0000 |

### 11.5 · Usuários (pelo app, recomendado)

No app, abra **☰ Menu › Usuários e acessos › Novo usuário** e preencha nome, matrícula, e-mail, perfil, equipe e DREs.

- O usuário recebe **por e-mail** um código de 6 dígitos (válido por 72 h). O código também aparece na tela, para você repassar pessoalmente.
- Ele abre o link › **Primeiro acesso** › informa a matrícula (ou e-mail) e o código › cria a própria senha.

**Perfis:**

| Perfil | O que vê |
|---|---|
| `tecnico` | Faz vistorias com a sua equipe |
| `supervisor` | Módulo de supervisão (painel, equipes ao vivo, validação, programação, usuários) e também o modo campo |
| `coordenacao` | Igual ao supervisor |
| `admin` | Tudo, inclusive criar outros administradores |

Se alguém esquecer a senha: **Usuários › tocar no nome › Redefinir acesso**. Ou a própria pessoa usa **Esqueci a senha** na tela de login.

### 11.6 · Roteiro (programação)

No app (perfil de supervisão), abra **Programação › + Nova visita**: escolha a escola, a equipe, a data e o horário. Pela planilha, aba **Roteiro**: `id` (único, ex.: `r1`), `data`, `hora`, `equipeId`, `escolaId`, `status` = `agendada`, `tipo` = `visita`.

**Para apagar os dados de exemplo:** nas abas Usuarios, Equipes, DREs, Escolas, Roteiro, Vistorias, Etapas, Fotos, Pendencias e Cancelamentos, selecione da **linha 2 para baixo** › botão direito › **Excluir linhas**. **Não apague a linha 1** nem a aba Config. Antes de apagar os usuários de exemplo, confira se você já tem o seu acesso de administrador (Caminho B da etapa 8).

---

## 12. Instale no celular das equipes

Envie o **link do app** por WhatsApp ou e-mail para cada técnico.

**Android (Chrome):**
1. Abra o link e faça o **Primeiro acesso**.
2. Toque nos **⋮ três pontinhos** › **Adicionar à tela inicial** › **Adicionar**.
3. Permita **Localização** e **Câmera** quando o app pedir.

**iPhone (Safari):**
1. Abra o link no **Safari** (não no app do Gmail ou do WhatsApp).
2. Toque no ícone **Compartilhar** (quadrado com seta) › **Adicionar à Tela de Início**.

**Orientações para as equipes:**
- Abra o app **antes** de chegar à escola, ainda com internet. Assim a programação do dia fica salva no celular.
- Sem sinal na escola? Pode continuar normalmente: o selo laranja mostra quantos itens estão "na fila".
- **Não feche o app** antes do selo da fila sumir no fim do dia. Se precisar, use **Fotos › Enviar agora**.
- Se a câmera do app não abrir, use **☰ › Configurações › Câmera › Sistema**.

### 12.1 · Trabalho em equipe

**A dupla pode se dividir em duas escolas ao mesmo tempo.** Cada técnico faz o check-in na sua escola. A equipe aparece "em campo" para a supervisão enquanto houver alguma escola aberta, e cada técnico aparece no mapa com a escola em que está.

**Ou os dois podem trabalhar juntos na mesma escola:**
- Quem chega primeiro faz o check-in. O colega abre o app e toca em **Entrar** no cartão **"Sua equipe também está em"**. Se ele tentar fazer check-in na mesma escola, o app oferece entrar na vistoria do colega.
- Cada um preenche o que quiser, inclusive a mesma etapa: o app junta **campo por campo** e **ambiente por ambiente**. Se os dois mudarem o **mesmo campo**, vale a alteração mais recente.
- O que o colega faz aparece no seu celular em até **1 minuto** (com internet).
- **Os dois sem sinal?** Se ambos fizerem check-in na mesma escola sem internet, o servidor junta as duas vistorias numa só quando o sinal voltar. Nada se perde.
- **Para ir a outra escola** sem encerrar a vistoria, use **Sair desta vistoria**, no fim de qualquer etapa. Ela continua aberta para quem ficou, e quem ficar finaliza.
- Quando um dos dois **finaliza ou cancela**, o celular do outro avisa e volta para o início.

**Regras:** uma escola só pode ter uma vistoria aberta por vez, e uma equipe não pode abrir uma escola que outra equipe está vistoriando.

### 12.2 · Itens com erro

Se o servidor recusar um envio 3 vezes (por exemplo, a escola foi retirada das DREs do técnico), o item **não é apagado**. Ele vai para **☰ Menu › Itens com erro**, e o selo do topo fica vermelho ("N com erro"). Ali dá para:
- **Reenviar**, depois de corrigir a causa;
- **Baixar** o item (arquivo .json, com a foto, se houver);
- **Descartar**, se não precisar mais.

Uma cópia de cada item recusado vai também para a pasta **VistAR › Falhas de sincronização** do Drive, para o administrador recuperar o dado se o celular se perder.

---

## 13. Problemas comuns

| O que aparece | O que fazer |
|---|---|
| **"Planilha não configurada. Execute instalarVistAR()"** | Volte à etapa 7 e execute `instalarVistAR` de novo. |
| **"Aba X não encontrada"** | Alguém apagou ou renomeou uma aba. Execute `instalarVistAR`: ele recria o que falta, sem apagar dados. |
| **"Autorização necessária"** ao executar | Normal na primeira vez ou depois de atualizar o código. Repita a etapa 7.3 a 7.5. |
| **Tela branca** ou "Não foi possível abrir o arquivo" | Confira os nomes dos arquivos HTML (etapa 6.3). Precisam ser exatamente `Index`, `RelatorioVistoria` e `RelatorioCompleto`. |
| **"Usuário ou senha incorretos"** | Confira a matrícula/e-mail na aba Usuarios. Para resolver: **Usuários › Redefinir acesso** (no app, gera um código novo) ou **VistAR › Definir senha de usuário** (na planilha, define uma senha provisória). |
| **"Este acesso ainda não foi ativado"** | O usuário precisa usar **Primeiro acesso** com o código recebido. |
| **"Código inválido ou vencido"** | O código vale 72 h e só pode ser usado uma vez. Gere outro em **Usuários › Reenviar código**. |
| **"Muitas tentativas"** | Proteção contra senha errada. Aguarde 10 minutos. |
| **Selo vermelho "N com erro"** | Abra **☰ › Itens com erro** e veja a mensagem de cada item. Corrija a causa e toque em **Reenviar** (seção 12.2). |
| **"Esta escola não pertence às suas DREs autorizadas"** | Em **Usuários**, inclua a DRE da escola no cadastro do técnico. Depois, reenvie os itens com erro. |
| **"Outra equipe já está vistoriando esta escola"** | Só uma equipe por escola de cada vez. Combine com a supervisão, ou peça para a outra equipe finalizar ou sair. |
| **O que o colega preencheu não aparece** | As alterações chegam em até 1 minuto, com internet nos dois celulares. Feche e abra o app para forçar a atualização. |
| **"Sessão expirada"** | Faça login de novo. **Nada do que foi coletado se perde**: a fila continua guardada no celular. |
| **A câmera não abre** | Permita a câmera nas configurações do navegador. Ou use **Configurações › Câmera › Sistema**. |
| **"Você está longe da escola"** no check-in | O GPS acha que você está fora da escola. Confira se a escola tem lat/lng corretos (seção 11.3). Você pode confirmar e seguir mesmo assim. |
| **"Localização indisponível"** | Ative o GPS do celular e permita a localização para o navegador. |
| **O e-mail da cópia não chegou** | Olhe a caixa de spam. Confira o e-mail do responsável na Revisão. Veja a cota diária de e-mails (seção 15). |
| **O relatório não aparece ("Prévia indisponível")** | A prévia precisa de internet e da fila vazia. Aguarde o selo "na fila" sumir e toque em "Tentar de novo". |
| **O mapa aparece como "Mapa ilustrativo"** | Sem GPS ou o serviço de mapas do Google atingiu a cota do dia. As rotas continuam funcionando pelos botões Google Maps/Waze. |
| **Mudei o código e o app não mudou** | Você precisa publicar uma **nova versão** (seção 14). Salvar o código não basta. |
| **Fotos "na fila" que nunca saem** | Veja se **Enviar fotos só no Wi-Fi** está ligado em Configurações. Toque em **Fotos › Enviar agora**. |
| **O painel mostra poucos dados** | Os números vêm das vistorias finalizadas. Preencha META_INICIO/META_DATA na aba Config para ver a linha de meta. |

**Para ver erros detalhados:** no editor do Apps Script, abra o menu da esquerda › **Execuções**. Ali aparecem as chamadas do app com eventuais mensagens de erro. Copie a mensagem ao pedir ajuda.

---

## 14. Como atualizar o app depois (sem mudar o link)

Quando receber uma versão nova dos arquivos:

1. Repita a **etapa 6**, colando os arquivos novos por cima dos antigos (apague tudo e cole).
2. Salve (**Ctrl+S**).
3. Execute **`instalarVistAR`** uma vez. Ele cria colunas novas, se houver, **sem apagar dados**.
4. Clique em **Implantar › Gerenciar implantações**.
5. Selecione a implantação ativa e clique no **lápis ✏️ (Editar)**.
6. Em **Versão**, escolha **Nova versão** e clique em **Implantar**.

O link continua o mesmo. Nos celulares, basta fechar e abrir o app.

> ⚠️ **Não use "Nova implantação" para atualizar:** isso gera um link diferente e as equipes ficam no link antigo.

---

## 15. Limites do Google, backup e segurança

### Limites diários do Google

| Recurso | Conta Gmail comum | Google Workspace |
|---|---|---|
| E-mails enviados pelo app | 100 por dia | 1.500 por dia |
| Tempo máximo por ação | 6 minutos | 6 minutos |
| Espaço no Drive (fotos e PDFs) | 15 GB (gratuito) | Conforme o plano |

Cada vistoria ocupa em média **15 a 30 MB** (fotos + PDFs). Com 15 GB, cabem cerca de **500 vistorias**. Para economizar espaço, deixe **Configurações › Qualidade das fotos › Média**.

### Backup

- A planilha guarda o histórico de versões: **Arquivo › Histórico de versões**.
- Uma vez por mês, faça uma cópia: **Arquivo › Fazer uma cópia**.
- A pasta **VistAR** do Drive pode ser baixada inteira (botão direito › Fazer download).

### Segurança e LGPD

- **Não compartilhe a planilha** com os técnicos. Eles usam só o app. Compartilhe a planilha só com a coordenação.
- Os técnicos **não têm acesso** à pasta do Drive. Os PDFs chegam por e-mail e pelo próprio app.
- As senhas ficam **criptografadas** na planilha. Nem o administrador consegue vê-las.
- Usuário que saiu da empresa: **Usuários › tocar no nome › desmarcar "Acesso ativo"**. O acesso é bloqueado na hora.
- O app registra a **localização** no check-in, no check-out e a cada 5 minutos com o app aberto, para a supervisão acompanhar as equipes. Isso consta nos Termos de uso, que cada usuário aceita no primeiro acesso.
- Oriente as equipes a **não fotografar alunos** nem documentos pessoais.

---

## 16. Mapa da planilha (o que é cada aba)

| Aba | Para que serve | Quem preenche |
|---|---|---|
| **Config** | Configurações gerais (seção 11.1) | Você |
| **Usuarios** | Pessoas com acesso, perfil, equipe e DREs | App (Usuários) ou você |
| **Equipes** | Equipes, membros, status ao vivo e posição | Você + app |
| **DREs** | Diretorias regionais e engenheiros de contato | Você |
| **Escolas** | Cadastro das unidades | Você (o app atualiza correções de campo) |
| **Roteiro** | Programação das visitas | App (Programação) ou você |
| **Vistorias** | Uma linha por vistoria: horários, status, PDFs, validação | App |
| **Etapas** | Dados de cada etapa da vistoria (formato técnico, não edite) | App |
| **Fotos** | Uma linha por foto, com o link do arquivo no Drive | App |
| **Pendencias** | Pendências abertas e resolvidas por escola | App |
| **Cancelamentos** | Motivos, recusas e registros | App |
| **Log** | Histórico de ações (login, check-in, envio etc.) | App |

> **Regra de ouro:** nas abas preenchidas pelo app, **não edite** as colunas `id`, `p1` a `p6` nem os códigos. Se precisar corrigir algo, prefira fazer pelo próprio app.

---

*VistAR · Consórcio Climatiza São Paulo · guia da versão 1.1*
