-- =====================================================================
-- CORREÇÃO: remover funcionário + eliminar contas de demonstração
-- Execute este bloco no SQL Editor do Supabase (uma vez só)
-- =====================================================================

-- 1) Função que permite remover funcionário (contorna o bloqueio de
--    DELETE direto que protege a tabela "usuarios")
create or replace function remover_funcionario(p_id uuid)
returns void as $$
begin
  delete from usuarios where id = p_id;
end;
$$ language plpgsql security definer;

grant execute on function remover_funcionario(uuid) to anon, authenticated;

-- =====================================================================
-- 2) Eliminar as contas de demonstração
--
-- ⚠️ IMPORTANTE — leia antes de rodar esta parte:
-- Confirme que você já tem pelo menos UMA conta de administrador
-- própria (diferente de "admin.samucs") ou que já trocou a senha do
-- "admin.samucs" pela tela "Atualização cadastral". Sem isso, ao
-- apagar todas as contas de demonstração você pode ficar sem acesso
-- ao sistema.
-- =====================================================================

-- Remove as contas de demonstração de TARM, Regulação, Frota e Gestão:
delete from usuarios where login in ('tarm1', 'regulador1', 'frota1', 'gestor1');

-- Só remova a linha abaixo (tire o "--" do início) depois de confirmar
-- que você já trocou a senha do administrador padrão ou já tem outro
-- administrador cadastrado:
-- delete from usuarios where login = 'admin.samucs';

-- Fim da correção.
