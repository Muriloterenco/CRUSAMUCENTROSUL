-- =====================================================================
-- CORREÇÃO: lista de funcionários não aparece na Atualização cadastral
-- Execute este bloco no SQL Editor do Supabase (uma vez só)
-- =====================================================================

-- Garante que a "visão pública" de funcionários (sem a senha) possa
-- ser lida pelo aplicativo. Em alguns projetos Supabase, views criadas
-- pelo SQL Editor não herdam automaticamente a permissão de leitura
-- para o papel usado pela chave publicável (anon/authenticated).
create or replace view usuarios_publico as
  select id, nome, cpf, login, papel, criado_em from usuarios;

grant select on usuarios_publico to anon, authenticated;

-- Reforça também a permissão de execução das funções de cadastro,
-- atualização e login (caso o projeto não tenha herdado por padrão).
grant execute on function autenticar_usuario(text, text) to anon, authenticated;
grant execute on function cadastrar_funcionario(text, text, text, text, text) to anon, authenticated;
grant execute on function atualizar_funcionario(uuid, text, text, text, text, text) to anon, authenticated;

-- Fim da correção.
