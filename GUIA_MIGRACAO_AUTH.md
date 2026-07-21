# Guia: Migração para login real (Supabase Auth)
### Passo a passo simples — leia com calma, na ordem

## O que vai mudar, em resumo

- **Antes:** você entrava com um "login" tipo `tarm1` e uma senha simples.
- **Depois:** você entra com um **e-mail de verdade** e uma senha —
  e se esquecer a senha, existe um botão **"Esqueci minha senha"**
  que manda um e-mail de verdade para você redefinir sozinho, sem
  precisar pedir para o administrador.
- **Criar um novo funcionário** passa a ser feito com alguns cliques
  direto no painel do Supabase (por segurança). Editar dados de quem
  já tem conta, e ativar/desativar acesso, continua podendo ser feito
  dentro do próprio sistema, normalmente.

As contas antigas (`tarm1`, `admin.samucs` etc.) **deixam de
funcionar** depois dessa migração — você vai recriar os acessos reais
seguindo o Passo 3 abaixo.

---

## Passo 1 — Rodar o script de migração do banco

1. Abra o **Supabase → SQL Editor → New query**.
2. Copie todo o conteúdo do arquivo `supabase/migracao_auth_real.sql`
   (está na pasta do projeto) e cole ali.
3. Clique em **Run**.
4. Pronto — isso prepara o banco para o novo tipo de login, sem apagar
   nada do que já existe (ocorrências e viaturas continuam intactas).

## Passo 2 — Conferir as configurações de e-mail do Supabase

1. No painel do Supabase, vá em **Authentication → URL Configuration**.
2. No campo **Site URL**, coloque o endereço do seu site publicado
   (ex.: `https://seu-projeto.vercel.app`). Isso garante que o link do
   e-mail de "esqueci minha senha" leve a pessoa para o lugar certo.
3. Em **Redirect URLs**, adicione esse mesmo endereço.

> 💡 O Supabase já vem com um serviço de e-mail básico configurado
> para testes (funciona, mas com limite baixo de envios por hora). Se
> o SAMU for usar isso oficialmente, mais adiante vale configurar um
> serviço de e-mail próprio (Authentication → Email Templates → SMTP
> Settings) — mas para testar agora, não precisa mexer nisso.

## Passo 3 — Criar o primeiro administrador (você)

1. No painel do Supabase, vá em **Authentication → Users**.
2. Clique em **Add user** e escolha a opção **"Create new user"**
   (não escolha "Send invitation" — essa manda só um convite por
   e-mail, sem senha).
3. Preencha:
   - **Email**: seu e-mail real.
   - **Password**: uma senha segura que só você vai saber.
   - Marque a opção **"Auto Confirm User"** (assim você já consegue
     entrar direto, sem precisar confirmar o e-mail primeiro).
4. Clique em **Create user**.

> 💡 Não se preocupe se não aparecer nenhum campo de "User Metadata"
> nessa tela — isso varia de versão para versão do painel do
> Supabase. Vamos definir a função de administrador por um comando
> simples, no próximo passo, que funciona sempre.

5. Ainda no painel do Supabase, vá em **SQL Editor → New query**,
   cole o comando abaixo (troque pelo e-mail e nome que você usou) e
   clique em **Run**:
   ```sql
   update perfis set papel = 'admin', nome = 'Seu Nome Completo'
   where email = 'seuemail@exemplo.com';
   ```

Pronto — essa é a sua nova conta de administrador.

## Passo 4 — Testar o login

1. Baixe e abra o projeto atualizado (`npm install` se for pasta
   nova, depois `npm run dev`, ou acesse o site publicado).
2. Entre com o e-mail e a senha que você acabou de criar.
3. Deve funcionar normalmente, como antes — só que agora com e-mail.

## Passo 5 — Publicar a função que permite cadastrar pelo sistema

Por padrão, criar um login novo exige a "chave mestra" do banco, que
nunca pode ficar dentro do site (é perigoso). Por isso, esse cadastro
passa por um pequeno programa protegido que já preparei
(`supabase/functions/criar-funcionario`) e que roda no próprio
Supabase — você só precisa publicá-lo **uma vez**, com estes comandos,
dentro da pasta do projeto:

```bash
npx supabase login
npx supabase init
npx supabase link --project-ref dnowwydvxtdnvbwotqrg
npx supabase functions deploy criar-funcionario
```

Explicando cada linha:
1. `npx supabase login` — abre o navegador para você autorizar o
   acesso à sua conta Supabase (só precisa fazer uma vez no
   computador).
2. `npx supabase init` — prepara a pasta do projeto (cria um arquivo
   de configuração; não mexe no que já existe).
3. `npx supabase link --project-ref ...` — conecta esta pasta ao seu
   projeto Supabase (o código `dnowwydvxtdnvbwotqrg` já é o do seu
   projeto).
4. `npx supabase functions deploy criar-funcionario` — publica a
   função de cadastro.

Pronto! A partir de agora, o botão **"Cadastrar e liberar acesso"**
dentro do sistema (tela Gestão → Cadastrar Funcionário) volta a
funcionar normalmente — sem precisar abrir o painel do Supabase.
Só quem está logado como **Gestão** ou **Administrador** consegue
usar esse cadastro (a função verifica isso automaticamente); e apenas
um Administrador pode cadastrar outro Administrador.

> 💡 Se preferir, o cadastro pelo painel do Supabase (explicado no
> Passo 3) continua funcionando também — os dois caminhos coexistem,
> use o que for mais prático em cada momento.

## Passo 6 — Cadastrar os demais funcionários

Dentro do sistema, logado como administrador ou gestão, vá em
**Gestão → Cadastrar Funcionário**, preencha nome, CPF, e-mail, uma
senha provisória e a função (`tarm`, `regulacao`, `frota`, `gestao`
ou `admin`) e clique em **Cadastrar e liberar acesso**.

O funcionário já aparece na busca logo abaixo — e pode ser editado
(nome, CPF, função) ou ter o acesso desativado por ali, a qualquer
momento.

## Passo 7 — Avisar a equipe sobre a troca de senha

Assim que cada funcionário receber o e-mail e a senha provisória,
oriente-o a:
1. Entrar uma vez com a senha provisória, **ou**
2. Clicar direto em **"Esqueci minha senha"** na tela de login e
   definir a própria senha, sem precisar de ninguém.

---

## Perguntas frequentes

**As contas antigas (tarm1, gestor1 etc.) somem?**
Elas deixam de conseguir entrar (o sistema de login mudou), mas os
dados antigos (a tabela `usuarios`) continuam guardados no banco, sem
uso, só por segurança/histórico. Depois de confirmar que está tudo
funcionando, você pode removê-la — me avise quando quiser fazer isso.

**Perdi o e-mail de redefinição de senha, e agora?**
Confira a caixa de spam. Se mesmo assim não chegar, o administrador
pode entrar em **Supabase → Authentication → Users**, clicar nos três
pontinhos ao lado do funcionário e escolher **"Send password reset"**
manualmente.

**Posso ter mais de um administrador?**
Sim — repita o Passo 3 quantas vezes precisar, sempre com
`"papel": "admin"` nos metadados.
