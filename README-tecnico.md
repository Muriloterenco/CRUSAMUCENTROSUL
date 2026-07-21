# Central de Regulação SAMU 192 Centro Sul

Sistema real (multiusuário, com sincronização em tempo real) para
TARM, Regulação Médica, Operação de Frota e Gestão, usando
**Supabase** (Postgres + Realtime) como backend.

## O que mudou em relação ao protótipo

- Todos os dados (ocorrências, viaturas, funcionários) agora ficam em
  um banco Postgres no Supabase, não mais na memória do navegador.
- Todas as telas assinam mudanças em tempo real: quando o TARM
  registra uma ocorrência, ela aparece **automaticamente** na tela da
  Regulação em outro computador, sem precisar recarregar a página —
  o mesmo vale para Regulação → Frota.
- Login autentica contra o banco (senha com hash bcrypt, nunca
  trafega nem fica salva em texto puro).
- Número de controle é gerado pelo próprio banco (à prova de conflito
  entre usuários simultâneos) e reinicia sozinho à meia-noite.

## 1. Configurar o banco no Supabase

1. Acesse o projeto em https://supabase.com/dashboard (projeto já
   criado: `dnowwydvxtdnvbwotqrg`).
2. Vá em **SQL Editor > New query**.
3. Cole todo o conteúdo do arquivo `supabase/schema.sql` deste
   projeto e clique em **Run**. Isso cria as tabelas, as regras de
   segurança (RLS), as funções de login/cadastro e já insere os
   usuários e viaturas de demonstração.
4. Confirme em **Table editor** que as tabelas `usuarios`,
   `veiculos`, `ocorrencias` e `controle_diario` foram criadas.
5. Em **Database > Replication**, confirme que `ocorrencias` e
   `veiculos` estão marcadas para Realtime (o script já faz isso,
   mas vale conferir).

## 2. Rodar o projeto localmente

Pré-requisito: [Node.js](https://nodejs.org) instalado (versão 18 ou
superior).

```bash
npm install
cp .env.example .env
npm run dev
```

Abra o endereço mostrado no terminal (geralmente
`http://localhost:5173`). As credenciais de teste já vêm cadastradas
pelo script SQL:

| Perfil | Login | Senha |
|---|---|---|
| TARM | `tarm1` | `123` |
| Regulação | `regulador1` | `123` |
| Frota | `frota1` | `123` |
| Gestão | `gestor1` | `123` |
| Administrador (acesso total) | `admin.samucs` | `admin.samucs@192` |

**Importante:** troque essas senhas antes de qualquer uso real (pela
própria tela "Cadastrar Funcionário > Atualização cadastral", logado
como administrador).

## 3. Publicar na internet

O front-end é um site estático (gerado pelo Vite) e pode ser
publicado em qualquer um destes serviços gratuitos:

### Opção recomendada: Vercel
```bash
npm run build
npx vercel --prod
```
Ou, mais simples: crie conta em vercel.com, clique em "Add New
Project", importe este repositório do GitHub, e a Vercel detecta
sozinha que é um projeto Vite. Configure as variáveis de ambiente
`VITE_SUPABASE_URL` e `VITE_SUPABASE_KEY` no painel do projeto (Settings
> Environment Variables) com os mesmos valores do `.env.example`.

### Alternativas
- **Netlify** — mesmo fluxo (build command: `npm run build`, publish
  directory: `dist`).
- **Cloudflare Pages** — idem.

## 4. Avisos importantes de segurança (leia antes de usar com pacientes reais)

- A chave usada (`sb_publishable_...`) é a chave pública do Supabase —
  ela é feita para ficar exposta no código do navegador, mas isso só é
  seguro porque o acesso real é controlado pelas políticas de **Row
  Level Security (RLS)** do banco.
- Neste script, as tabelas `ocorrencias` e `veiculos` estão liberadas
  para leitura/escrita por qualquer pessoa que tenha a chave pública
  (necessário hoje porque o login não usa o sistema de autenticação
  nativo do Supabase, e sim uma tabela própria). Isso é adequado para
  uso interno da equipe, mas **não é uma segurança de nível
  hospitalar**. Antes de operar com dados reais de pacientes,
  recomenda-se migrar para o Supabase Auth (JWT) e políticas de RLS
  por perfil (`auth.jwt() ->> 'papel'`), o que impede qualquer acesso
  direto à API fora do aplicativo.
- Este sistema trata dados sensíveis de saúde (LGPD). Antes de operar
  oficialmente, valide com o setor jurídico/TI do SAMU: política de
  backup, retenção de dados, log de auditoria e termo de
  responsabilidade dos usuários.
- Recomenda-se manter a região do projeto Supabase em **São Paulo
  (sa-east-1)** para reduzir latência e manter os dados no Brasil.

## 5. Estrutura do projeto

```
samu-central-regulacao/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── src/
│   ├── main.jsx           # ponto de entrada React
│   ├── App.jsx             # todo o sistema (telas + lógica)
│   └── supabaseClient.js   # conexão com o Supabase
└── supabase/
    └── schema.sql          # script de criação do banco (rodar 1x)
```
