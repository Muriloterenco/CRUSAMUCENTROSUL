# Resumo Digital (Hash) do Software
## Central de Regulação SAMU 192 Centro Sul

Este documento contém o resumo digital (hash criptográfico) dos
arquivos que compõem o programa de computador, gerado para fins de
comprovação de autoria e integridade (ex.: registro de programa de
computador junto ao INPI).

- **Algoritmo utilizado:** SHA-256 (padrão atual recomendado; produz
  um resumo de 256 bits/64 caracteres hexadecimais, computacionalmente
  inviável de forgear ou reproduzir a partir de outro conteúdo)
- **Data/hora de geração (UTC):** 2026-07-19T01:23:36Z
- **Escopo:** todos os arquivos de código-fonte e configuração do
  projeto (não inclui `node_modules`, `dist` nem `.git`, por serem
  gerados/baixados automaticamente e não fazerem parte da autoria)

---

## 1. Hash consolidado do conjunto de arquivos (código-fonte)

Calculado a partir da lista ordenada de hashes individuais de cada
arquivo (abaixo), recombinados e resumidos novamente — funciona como
uma "assinatura única" de todo o conjunto de código-fonte nesta
versão exata do projeto:

```
SHA-256: c829cf6477abc7cf21cab4a576169ada51a801edea068212eb40821acb18bc9f
```

Qualquer alteração em qualquer arquivo do projeto (mesmo de um único
caractere) muda completamente este valor — por isso ele serve como
prova de integridade da versão registrada.

## 2. Hash do arquivo principal do programa (`src/App.jsx`)

Arquivo com a lógica e as telas do sistema (1.881 linhas / 143.030
bytes):

```
SHA-256: 1741c13478c40fa8d23b9b0f492de6b1f9b1be03383da73a2eaad0c9e4891d32
```

## 3. Hash do pacote de distribuição (.zip entregue)

```
Arquivo: samu-central-regulacao.zip
SHA-256: 24d0b38f4ab32ecadc8b2c53eab8e9c29841a4f207a1cc9b659f850fd70b5bd3
MD5:     fbfbccfda5393e5fc4b3630e4292e5d1
```
(MD5 incluído apenas por compatibilidade com formulários antigos que
ainda o solicitem — para fins de segurança/integridade, use o SHA-256)

> ⚠️ **Nota importante sobre o hash do .zip:** arquivos `.zip` guardam
> metadados internos (como data/hora de cada arquivo) além do
> conteúdo — por isso, se esta mesma pasta for compactada novamente
> (mesmo sem alterar nenhum código), o hash do `.zip` resultante pode
> ser diferente deste valor, mesmo que o **conteúdo** seja idêntico.
> Por isso, para comprovar a autoria do software em si (e não apenas
> deste arquivo específico), o mais confiável é usar os hashes dos
> arquivos de código-fonte individuais (seções 1 e 2 abaixo/acima),
> que dependem apenas do conteúdo do código, não da forma como ele foi
> compactado.

## 4. Hash individual de cada arquivo do projeto

| Arquivo | SHA-256 |
|---|---|
| `.env.example` | `1459481f6aa169c713f9df73688ce7f2872715838931c8ec8d596c11bc49fbe4` |
| `.gitignore` | `8b3cc6ff28dc3e87a28b5f119b853ad6e7adb8187256878c8365bfde223bd607` |
| `.vercelignore` | `a63a0ec41781295c6a39e73aad1d8fd384919acd58986aa8c108553643b8870a` |
| `README-tecnico.md` | `3e79cac67e116766a67bf5b933ccf21ce9a8683bd23ddbf975a49ef5d2a8d43e` |
| `README.md` | `a1507ac20d8d42ea37cdeca52918ae03e26695d7eb3cf79b3c359a43f1fe7b66` |
| `index.html` | `a05285a458c21c8c4d70e86bb4f14eaa94c83a5ff92b0654a1a399b0c55eda66` |
| `package.json` | `1a75c021901fe5823bb35364090df3fe1794013614da307dcfb2b1f9463b3f59` |
| `src/App.jsx` | `1741c13478c40fa8d23b9b0f492de6b1f9b1be03383da73a2eaad0c9e4891d32` |
| `src/main.jsx` | `d23cfbb031f9db286f8d61beba85dbbb8aeca96ac6ab8f9d3b3358fdea22600f` |
| `src/supabaseClient.js` | `134af2a8fd7c5b615f7ac8d8322a98b674033f0948f7da4c09b889a790ef6dd7` |
| `supabase/correcao_lista_funcionarios.sql` | `9925dfae34986162337adb749c1995abc2426062b4197234dfcd786b9216db7c` |
| `supabase/correcao_numero_controle.sql` | `ade809fe151a0561d91903e7923838eb639dcd88b0e7cb159acb09da78e60a21` |
| `supabase/correcao_remover_e_limpar_demo.sql` | `0807b4bea947de370cf66cc9d4d8308f7c660659bd68a7cb4a800f2b06f1a5c5` |
| `supabase/correcao_security_definer_view.sql` | `2883ee4674fd1f936842d9118e3aa2e2c96176d1e5eb19d95c950df36f902eaf` |
| `supabase/schema.sql` | `7d77f31fe0802b88b45e5caf7357391a76802cb040da46adf73ab06061ee81ef` |
| `vercel.json` | `e19865e202f6e02f52317cd197b0b64e2fb312a3f1d789d2df9b2df895fad9d3` |
| `vite.config.js` | `eca485c281977125366d4800553256e419f364984e615f75a2d2bae54f7857fd` |

## 5. Como qualquer pessoa pode conferir estes valores

Em um computador com Linux/Mac (ou Windows com Git Bash/WSL), dentro
da pasta do projeto:

```bash
sha256sum src/App.jsx
```

No Windows (PowerShell):
```powershell
Get-FileHash src/App.jsx -Algorithm SHA256
```

O valor exibido deve ser idêntico ao listado neste documento — isso
comprova que o arquivo não foi alterado desde a geração deste resumo.

---

### Observação importante

Este documento apenas **calcula e apresenta** os resumos digitais dos
arquivos — ele não constitui, por si só, o registro do software. Para
o **Registro de Programa de Computador** junto ao INPI (Instituto
Nacional da Propriedade Industrial), é necessário reunir também: os
dados do titular/autor(es), a documentação técnica exigida pelo
formulário do INPI, e o próprio código-fonte (ou trechos
representativos, conforme a modalidade escolhida). Recomenda-se
apoio de um advogado especializado em propriedade intelectual para
conduzir o processo de registro em si.
