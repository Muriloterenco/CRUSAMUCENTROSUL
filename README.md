# Central de Regulação SAMU 192 Centro Sul
### Guia simples — para quem não é da área de tecnologia

Este documento explica, com calma e sem "juridiquês técnico", o que
é este sistema e o que fazer para colocá-lo para funcionar.

---

## O que é este sistema, em palavras simples

É um programa que roda dentro do navegador (Chrome, Edge etc.) e
ajuda a Central de Regulação a organizar o trabalho de quatro tipos
de funcionário:

- **TARM** — quem atende a ligação e registra a ocorrência.
- **Regulação médica** — o médico que avalia e decide a conduta.
- **Frota** — quem despacha e acompanha as viaturas.
- **Gestão** — quem acompanha os números e relatórios.

A grande novidade desta versão: **agora é um sistema de verdade**.
Antes, cada computador "esquecia" tudo ao recarregar a página e não
conversava com os outros computadores. Agora, tudo fica guardado em
um "cofre" na internet (chamado banco de dados) e as telas se
atualizam sozinhas — se o TARM registra uma ocorrência, ela já
aparece automaticamente na tela do médico, em outro computador, sem
precisar apertar nada.

---

## Palavras estranhas que você vai ver (dicionário rápido)

| Termo | O que significa, em bom português |
|---|---|
| **Supabase** | O serviço que guarda os dados do sistema na internet (como um "arquivo" gigante e seguro, sempre disponível) |
| **Banco de dados** | O "cofre" onde ficam salvas as ocorrências, viaturas e usuários |
| **Node.js** | Um programa que seu computador precisa ter instalado para conseguir "montar" o site antes de publicá-lo |
| **npm install** | Um comando que baixa as "peças" que o sistema precisa para funcionar |
| **npm run dev** | Um comando que liga o sistema no seu computador, só para você testar |
| **Deploy / publicar** | Colocar o site no ar, com um endereço que qualquer pessoa pode acessar pela internet |
| **Vercel / Netlify** | Serviços gratuitos que "hospedam" (guardam e exibem) o site na internet |
| **Login / senha de teste** | Usuários já criados só para você experimentar o sistema antes de criar os de verdade |

---

## Passo 1 — Criar o "cofre" de dados (uma vez só)

1. Entre no site do Supabase (o serviço que guarda os dados) e abra o
   projeto já criado.
2. Procure o menu **"SQL Editor"** e clique em **"New query"** (nova
   consulta).
3. Abra o arquivo `supabase/schema.sql` que está dentro da pasta
   deste projeto, copie **todo o conteúdo** dele e cole nessa tela.
4. Clique no botão **"Run"** (executar).
5. Pronto — isso cria automaticamente todas as "gavetas" necessárias
   (ocorrências, viaturas, usuários) e já deixa alguns usuários de
   teste prontos para uso.

Você só precisa fazer isso **uma única vez**.

---

## Passo 2 — Testar o sistema no seu computador

Pré-requisito: peça para alguém de TI instalar o **Node.js** no
computador (é um programa gratuito, baixado em nodejs.org). Depois
disso, é só seguir:

1. Baixe e extraia (descompacte) a pasta deste projeto.
2. Abra o "Prompt de Comando" (Windows) ou "Terminal" (Mac) dentro
   dessa pasta.
3. Digite `npm install` e aperte Enter — isso baixa as peças que o
   sistema precisa (pode demorar um minuto).
4. Digite `npm run dev` e aperte Enter.
5. Aparecerá um endereço parecido com `http://localhost:5173` —
   copie e cole no navegador.

Pronto! O sistema vai abrir. Por padrão, só vem uma conta pronta —
a de administrador, que pode entrar em qualquer painel e cadastrar
todos os demais funcionários pela tela "Cadastrar Funcionário":

| Setor | Login | Senha |
|---|---|---|
| Administrador (vê tudo, cadastra os demais) | `admin.samucs` | `admin.samucs@192` |

> ⚠️ **Troque essa senha assim que possível** (pela própria tela
> "Cadastrar Funcionário > Atualização cadastral") e cadastre as
> contas reais de TARM, Regulação, Frota e Gestão por ali.

**Dica para testar a sincronização:** cadastre duas contas de teste
(por exemplo, uma de TARM e uma de Regulação), abra o sistema em duas
abas do navegador (ou em dois computadores) e registre uma ocorrência
na aba do TARM — ela vai aparecer sozinha na aba da Regulação, sem
precisar recarregar a página. É essa a mágica da sincronização em
tempo real.

> ⚠️ **Troque essas senhas de teste** antes de usar o sistema de
> verdade. Isso se faz dentro do próprio sistema, na tela "Cadastrar
> Funcionário", entrando como Administrador.

---

## Passo 3 — Colocar o sistema no ar, com endereço na internet

Aqui é onde o sistema deixa de existir só no seu computador e passa
a ter um endereço que qualquer pessoa autorizada pode acessar, de
qualquer lugar.

**Caminho mais simples:**

1. Crie uma conta gratuita em **vercel.com**.
2. Clique em **"Add New Project"** (adicionar novo projeto).
3. Escolha a opção de enviar a pasta deste projeto (ou conectar com
   o GitHub, se você já tiver o código lá).
4. Antes de finalizar, procure por **"Environment Variables"**
   (variáveis de ambiente) e adicione estas duas informações — elas
   estão no arquivo `.env.example` desta pasta:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
5. Clique em **"Deploy"** (publicar).

Em poucos minutos, a Vercel te entrega um endereço (tipo
`https://central-regulacao.vercel.app`) que já funciona de verdade,
para qualquer computador com internet.

---

## Um alerta importante, com carinho

Este sistema lida com **dados de saúde de pacientes** — isso é uma
informação delicada e protegida por lei (LGPD). Antes de usar com
pacientes de verdade (não só para teste), é importante:

- Trocar todas as senhas de demonstração.
- Conversar com o setor de TI/jurídico do SAMU sobre segurança,
  backup e responsabilidade pelo uso dos dados.
- Entender que a versão atual é segura para uso **interno da
  equipe**, mas ainda pode receber melhorias de segurança antes de
  virar o sistema oficial definitivo (isso está detalhado, em
  linguagem mais técnica, no arquivo `README-tecnico.md`).

Se tiver qualquer dúvida durante esses passos, não tem problema —
pode pedir ajuda a qualquer momento.
