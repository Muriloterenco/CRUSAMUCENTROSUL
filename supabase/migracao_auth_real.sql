-- =====================================================================
-- MIGRAÇÃO: Supabase Auth real (login por e-mail + "esqueci minha senha")
-- Execute este bloco no SQL Editor do Supabase (uma vez só)
--
-- Este script NÃO apaga a tabela "usuarios" antiga (por segurança).
-- Ela fica guardada, sem uso, e pode ser removida depois, quando você
-- confirmar que a migração funcionou bem.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Tabela de perfis — dados de cada funcionário (nome, CPF, função),
--    ligada 1-para-1 com a conta de login do Supabase Auth.
-- ---------------------------------------------------------------------
create table if not exists perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  email text,
  cpf text,
  papel text not null default 'tarm' check (papel in ('tarm','regulacao','frota','gestao','admin','inativo')),
  criado_em timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 2) Gatilho: sempre que uma conta de login é criada (pelo painel do
--    Supabase), o perfil correspondente é criado automaticamente,
--    lendo nome/CPF/função dos "metadados" preenchidos na criação.
-- ---------------------------------------------------------------------
create or replace function public.criar_perfil_automatico()
returns trigger as $$
begin
  insert into public.perfis (id, nome, email, cpf, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    new.email,
    new.raw_user_meta_data ->> 'cpf',
    coalesce(new.raw_user_meta_data ->> 'papel', 'tarm')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.criar_perfil_automatico();

-- ---------------------------------------------------------------------
-- 3) Segurança (RLS) da tabela de perfis
-- ---------------------------------------------------------------------
alter table perfis enable row level security;

-- Qualquer funcionário logado pode LER a lista de perfis (necessário
-- para a tela "Atualização cadastral" e para o próprio app funcionar).
drop policy if exists "perfis leitura autenticados" on perfis;
create policy "perfis leitura autenticados" on perfis
  for select using (auth.role() = 'authenticated');

-- Só Administrador ou Gestão podem alterar dados de outros perfis
-- (nome, CPF, função, ativar/desativar).
drop policy if exists "perfis update por admin ou gestao" on perfis;
create policy "perfis update por admin ou gestao" on perfis
  for update using (
    exists (select 1 from perfis p where p.id = auth.uid() and p.papel in ('admin','gestao'))
  );

-- Ninguém insere ou apaga perfil diretamente (a criação acontece
-- sozinha, pelo gatilho, quando a conta é criada no painel do Supabase).
drop policy if exists "perfis sem insert direto" on perfis;
create policy "perfis sem insert direto" on perfis for insert with check (false);
drop policy if exists "perfis sem delete direto" on perfis;
create policy "perfis sem delete direto" on perfis for delete using (false);

grant select on perfis to authenticated;
grant update (nome, cpf, papel) on perfis to authenticated;

-- ---------------------------------------------------------------------
-- 4) Atualiza a segurança das ocorrências e viaturas: agora exige
--    login de verdade (não basta mais só ter a chave pública do site).
-- ---------------------------------------------------------------------
drop policy if exists "acesso ocorrencias" on ocorrencias;
create policy "acesso ocorrencias" on ocorrencias
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "acesso veiculos" on veiculos;
create policy "acesso veiculos" on veiculos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Fim da migração.
-- Próximo passo: crie o primeiro administrador pelo painel do Supabase
-- (Authentication > Users > Add user) — veja o passo a passo no README.
