-- =====================================================================
-- SAMU 192 Centro Sul — Central de Regulação
-- Script de criação do banco de dados no Supabase (Postgres)
-- Execute este arquivo inteiro em: Supabase > SQL Editor > New query > Run
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- TABELA: usuarios (funcionários / login)
-- ---------------------------------------------------------------------
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text,
  login text unique not null,
  senha_hash text not null,
  papel text not null check (papel in ('tarm','regulacao','frota','gestao','admin')),
  criado_em timestamptz default now()
);

-- ---------------------------------------------------------------------
-- TABELA: veiculos (frota)
-- ---------------------------------------------------------------------
create table if not exists veiculos (
  id text primary key,                 -- nomenclatura, ex: USB-01
  tipo text not null,
  base text,
  tripulantes text,
  status text not null default 'disponivel', -- disponivel | em_deslocamento | ocupado | manutencao
  atualizado_em timestamptz default now()
);

-- ---------------------------------------------------------------------
-- TABELA: ocorrencias
-- ---------------------------------------------------------------------
create table if not exists ocorrencias (
  id uuid primary key default gen_random_uuid(),
  numero_controle text,
  criado_em timestamptz not null default now(),
  tarm jsonb not null default '{}',
  status text not null default 'aguardando_regulacao',
  regulacao jsonb not null default '{}',
  despacho jsonb not null default '{}',
  obito text,
  justificativa_cancelamento text,
  motivo_cancelamento_tarm text,
  precisa_trocar_viatura boolean default false,
  historico jsonb not null default '[]'
);

create index if not exists idx_ocorrencias_status on ocorrencias(status);
create index if not exists idx_ocorrencias_criado_em on ocorrencias(criado_em);

-- ---------------------------------------------------------------------
-- Número de controle diário (reinicia sozinho a cada novo dia)
-- ---------------------------------------------------------------------
create table if not exists controle_diario (
  data_ref date primary key,
  seq int not null default 0
);
alter table controle_diario enable row level security;

create or replace function gerar_numero_controle() returns trigger as $$
declare
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  proximo int;
begin
  insert into controle_diario(data_ref, seq) values (hoje, 1)
    on conflict (data_ref) do update set seq = controle_diario.seq + 1
    returning seq into proximo;
  new.numero_controle := lpad(proximo::text, 3, '0') || '/' || to_char(hoje, 'DDMMYYYY');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_numero_controle on ocorrencias;
create trigger trg_numero_controle
before insert on ocorrencias
for each row execute function gerar_numero_controle();

drop policy if exists "bloquear tudo controle_diario" on controle_diario;
create policy "bloquear tudo controle_diario" on controle_diario for all using (false) with check (false);

-- ---------------------------------------------------------------------
-- Autenticação (a senha nunca é enviada ao navegador — comparação
-- acontece dentro do banco, via bcrypt/pgcrypto)
-- ---------------------------------------------------------------------
create or replace function autenticar_usuario(p_login text, p_senha text)
returns table(id uuid, nome text, papel text, cpf text) as $$
begin
  return query
    select u.id, u.nome, u.papel, u.cpf
    from usuarios u
    where u.login = p_login
      and u.senha_hash = crypt(p_senha, u.senha_hash);
end;
$$ language plpgsql security definer;

create or replace function cadastrar_funcionario(p_nome text, p_cpf text, p_login text, p_senha text, p_papel text)
returns uuid as $$
declare novo_id uuid;
begin
  insert into usuarios (nome, cpf, login, senha_hash, papel)
  values (p_nome, p_cpf, p_login, crypt(p_senha, gen_salt('bf')), p_papel)
  returning id into novo_id;
  return novo_id;
end;
$$ language plpgsql security definer;

create or replace function atualizar_funcionario(p_id uuid, p_nome text, p_cpf text, p_login text, p_senha text, p_papel text)
returns void as $$
begin
  if p_senha is null or length(trim(p_senha)) = 0 then
    update usuarios set nome = p_nome, cpf = p_cpf, login = p_login, papel = p_papel where id = p_id;
  else
    update usuarios set nome = p_nome, cpf = p_cpf, login = p_login, papel = p_papel,
      senha_hash = crypt(p_senha, gen_salt('bf')) where id = p_id;
  end if;
end;
$$ language plpgsql security definer;

create or replace function remover_funcionario(p_id uuid)
returns void as $$
begin
  delete from usuarios where id = p_id;
end;
$$ language plpgsql security definer;

-- ---------------------------------------------------------------------
-- RLS (Row Level Security)
-- ---------------------------------------------------------------------
alter table usuarios enable row level security;
alter table veiculos enable row level security;
alter table ocorrencias enable row level security;

-- usuarios: a tabela permite SELECT (política de linha), mas o acesso
-- de fato fica restrito às colunas não sensíveis via GRANT por coluna
-- logo abaixo — a senha (senha_hash) nunca é exposta pela API.
-- Cadastro/atualização/login só acontecem pelas funções acima
-- (que rodam com privilégio elevado via "security definer").
drop policy if exists "bloquear tudo usuarios" on usuarios;
create policy "usuarios leitura restrita a colunas seguras" on usuarios for select using (true);
create policy "usuarios sem insert direto" on usuarios for insert with check (false);
create policy "usuarios sem update direto" on usuarios for update using (false);
create policy "usuarios sem delete direto" on usuarios for delete using (false);

-- Para a tela "Atualização cadastral" (buscar/listar funcionários) sem
-- expor a senha, criamos uma view somente com colunas seguras. Ela roda
-- com os privilégios de quem consulta (security_invoker), não do dono,
-- evitando o aviso de segurança "Security Definer View":
create or replace view usuarios_publico as
  select id, nome, cpf, login, papel, criado_em from usuarios;
alter view usuarios_publico set (security_invoker = true);

revoke select on usuarios from anon, authenticated;
grant select (id, nome, cpf, login, papel, criado_em) on usuarios to anon, authenticated;
grant select on usuarios_publico to anon, authenticated;
grant execute on function autenticar_usuario(text, text) to anon, authenticated;
grant execute on function cadastrar_funcionario(text, text, text, text, text) to anon, authenticated;
grant execute on function atualizar_funcionario(uuid, text, text, text, text, text) to anon, authenticated;
grant execute on function remover_funcionario(uuid) to anon, authenticated;

-- veiculos e ocorrencias: liberado para leitura/escrita via chave
-- publicável (uso interno da equipe). Ver observação de segurança no README.
drop policy if exists "acesso veiculos" on veiculos;
create policy "acesso veiculos" on veiculos for all using (true) with check (true);

drop policy if exists "acesso ocorrencias" on ocorrencias;
create policy "acesso ocorrencias" on ocorrencias for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- Tempo real (para as telas sincronizarem sozinhas entre usuários)
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table ocorrencias;
alter publication supabase_realtime add table veiculos;

-- ---------------------------------------------------------------------
-- DADOS INICIAIS (seed)
-- Mantemos apenas UMA conta de administrador para o primeiro acesso.
-- Todas as demais contas (TARM, Regulação, Frota, Gestão) devem ser
-- criadas pela própria tela "Cadastrar Funcionário", já logado como
-- administrador. TROQUE A SENHA ABAIXO assim que possível.
-- ---------------------------------------------------------------------
insert into usuarios (nome, login, senha_hash, papel) values
  ('Administrador do Sistema', 'admin.samucs', crypt('admin.samucs@192', gen_salt('bf')), 'admin')
on conflict (login) do nothing;

insert into veiculos (id, tipo, base, tripulantes, status) values
  ('USB-01','USB','Base Centro','Cond. Marcos Silva, Téc. Enf. Renata Alves','disponivel'),
  ('USB-02','USB','Base Sul','Cond. Paulo Nunes, Téc. Enf. Camila Dias','disponivel'),
  ('USB-03','USB','Base Sul','','manutencao'),
  ('USA-01','USA','Base Centro','Cond. Rafael Gomes, Enf. Bianca Rocha, Méd. Dr. André Melo','disponivel'),
  ('VIR-01','VIR','Base Centro','Méd. Dra. Patrícia Souza, Enf. Diego Farias','disponivel'),
  ('MOTO-01','MOTOLANCIA','Base Sul','Cond. Eduardo Tavares','disponivel')
on conflict (id) do nothing;

-- Fim do script.
