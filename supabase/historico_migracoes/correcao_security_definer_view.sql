-- =====================================================================
-- CORREÇÃO: aviso "Security Definer View" (usuarios_publico)
-- Faz a view rodar com os privilégios de quem consulta (não do dono),
-- e ajusta a tabela "usuarios" para permitir a leitura apenas das
-- colunas não sensíveis (nunca a senha).
-- Execute este bloco no SQL Editor do Supabase (uma vez só)
-- =====================================================================

-- 1) View passa a respeitar as permissões/RLS de quem consulta
alter view usuarios_publico set (security_invoker = true);

-- 2) Ajusta a política de leitura da tabela "usuarios":
--    permite SELECT (a política de linha), mas o acesso às colunas
--    continua restrito pelos GRANTs abaixo — a senha nunca é liberada.
drop policy if exists "bloquear tudo usuarios" on usuarios;
create policy "usuarios leitura restrita a colunas seguras" on usuarios
  for select using (true);
create policy "usuarios sem insert direto" on usuarios
  for insert with check (false);
create policy "usuarios sem update direto" on usuarios
  for update using (false);
create policy "usuarios sem delete direto" on usuarios
  for delete using (false);

-- 3) Remove qualquer permissão ampla e libera só as colunas seguras
revoke select on usuarios from anon, authenticated;
grant select (id, nome, cpf, login, papel, criado_em) on usuarios to anon, authenticated;

-- A view "usuarios_publico" já seleciona só essas mesmas colunas,
-- então continua funcionando normalmente para a tela de funcionários —
-- mas agora sem depender do "bypass" que gerava o aviso de segurança,
-- e com a senha (senha_hash) definitivamente inacessível pela API.
