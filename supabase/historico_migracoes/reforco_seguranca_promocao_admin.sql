-- =====================================================================
-- REFORÇO DE SEGURANÇA: só um Administrador pode promover alguém a
-- Administrador (mesmo que a tentativa não passe pela tela do sistema)
-- Execute este bloco no SQL Editor do Supabase (uma vez só)
-- =====================================================================

create or replace function public.protege_promocao_admin()
returns trigger as $$
begin
  if new.papel = 'admin' and coalesce(old.papel, '') <> 'admin' then
    if not exists (select 1 from perfis p where p.id = auth.uid() and p.papel = 'admin') then
      raise exception 'Somente um administrador pode promover outro usuário a administrador.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_protege_promocao_admin on perfis;
create trigger trg_protege_promocao_admin
  before update on perfis
  for each row execute function public.protege_promocao_admin();

-- Fim da correção.
