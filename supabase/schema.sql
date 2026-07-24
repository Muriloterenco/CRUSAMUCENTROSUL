-- =====================================================================
-- SAMU 192 Centro Sul — Central de Regulação
-- Script ÚNICO de criação do banco de dados no Supabase (Postgres)
--
-- Este arquivo substitui todos os scripts avulsos que existiam antes
-- (schema.sql antigo + migracao_auth_real.sql + correcao_*.sql +
-- paginacao_pesquisa_indicadores.sql + reforco_seguranca_promocao_admin.sql
-- + adiciona_motivo_encerramento.sql). Eles continuam guardados, só por
-- histórico, em supabase/historico_migracoes/ — mas não precisam mais
-- ser executados: este arquivo já reflete o resultado final de todos.
--
-- Para um banco novo (do zero): rode este arquivo inteiro, uma vez, em
-- Supabase > SQL Editor > New query > Run. Depois, siga o
-- GUIA_MIGRACAO_AUTH.md para criar o primeiro administrador.
--
-- Para um banco que já existe (já rodou os scripts antigos, um por
-- um): NÃO precisa rodar este arquivo — ele é equivalente ao que você
-- já tem. Guarde-o só como referência do estado atual do banco.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- TABELA: veiculos (frota)
-- ---------------------------------------------------------------------
create table if not exists veiculos (
  id text primary key,                 -- nomenclatura, ex: USB-01
  tipo text not null,
  base text,
  tripulantes text,
  status text not null default 'disponivel', -- disponivel(QRV) | em_deslocamento | ocupado | manutencao(FA)
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
  motivo_encerramento text,
  justificativa_cancelamento text,
  motivo_cancelamento_tarm text,
  precisa_trocar_viatura boolean default false,
  historico jsonb not null default '[]'
);

create index if not exists idx_ocorrencias_status on ocorrencias(status);
create index if not exists idx_ocorrencias_criado_em on ocorrencias(criado_em);

-- Índices GIN: aceleram as buscas por campos dentro do JSON (queixa,
-- endereço, município, classificação etc.), usadas pela função de
-- pesquisa paginada. Sem isso, cada busca faz uma varredura completa
-- da tabela — funciona igual com poucos dados, mas fica lento à
-- medida que o histórico de ocorrências cresce.
create index if not exists idx_ocorrencias_tarm_gin on ocorrencias using gin (tarm);
create index if not exists idx_ocorrencias_regulacao_gin on ocorrencias using gin (regulacao);

-- ---------------------------------------------------------------------
-- Número de controle diário (reinicia sozinho a cada novo dia)
-- ---------------------------------------------------------------------
create table if not exists controle_diario (
  data_ref date primary key,
  seq int not null default 0
);
alter table controle_diario enable row level security;

drop policy if exists "bloquear tudo controle_diario" on controle_diario;
create policy "bloquear tudo controle_diario" on controle_diario
  for all using (false) with check (false);

-- Roda com privilégio elevado (ignora a trava acima), pois é interno
-- ao sistema — nunca é chamado direto pelo aplicativo.
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

-- ---------------------------------------------------------------------
-- TABELA: perfis — dados de cada funcionário (nome, CPF, função),
-- ligada 1-para-1 com a conta de login do Supabase Auth (e-mail/senha).
-- ---------------------------------------------------------------------
create table if not exists perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  email text,
  cpf text,
  papel text not null default 'tarm' check (papel in ('tarm','regulacao','frota','gestao','admin','inativo')),
  criado_em timestamptz default now()
);

-- Gatilho: toda vez que uma conta de login é criada (pelo painel do
-- Supabase ou pela Edge Function "criar-funcionario"), o perfil
-- correspondente é criado automaticamente, lendo nome/CPF/função dos
-- metadados preenchidos na criação.
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

-- Reforço de segurança: só um Administrador pode promover outro
-- usuário a Administrador (mesmo em tentativas que não passem pela
-- tela do sistema, direto pela API).
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

-- ---------------------------------------------------------------------
-- Segurança (RLS)
-- ---------------------------------------------------------------------
alter table perfis enable row level security;

drop policy if exists "perfis leitura autenticados" on perfis;
create policy "perfis leitura autenticados" on perfis
  for select using (auth.role() = 'authenticated');

drop policy if exists "perfis update por admin ou gestao" on perfis;
create policy "perfis update por admin ou gestao" on perfis
  for update using (
    exists (select 1 from perfis p where p.id = auth.uid() and p.papel in ('admin','gestao'))
  );

drop policy if exists "perfis sem insert direto" on perfis;
create policy "perfis sem insert direto" on perfis for insert with check (false);
drop policy if exists "perfis sem delete direto" on perfis;
create policy "perfis sem delete direto" on perfis for delete using (false);

grant select on perfis to authenticated;
grant update (nome, cpf, papel) on perfis to authenticated;

-- Ocorrências e viaturas: exigem login de verdade (Supabase Auth) —
-- não basta mais só ter a chave pública do site.
alter table ocorrencias enable row level security;
drop policy if exists "acesso ocorrencias" on ocorrencias;
create policy "acesso ocorrencias" on ocorrencias
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table veiculos enable row level security;
drop policy if exists "acesso veiculos" on veiculos;
create policy "acesso veiculos" on veiculos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- Funções de pesquisa (usadas pelas telas de Pesquisa/Indicadores)
-- ---------------------------------------------------------------------

-- Busca por período (Visão Geral / Indicadores): todas as ocorrências
-- de um dia/mês/ano — cada parâmetro é opcional, combine como quiser.
create or replace function buscar_ocorrencias_por_periodo(
  p_dia int default null, p_mes int default null, p_ano int default null
)
returns setof ocorrencias as $$
  select * from ocorrencias o
  where (p_dia is null or extract(day from (o.criado_em at time zone 'America/Sao_Paulo')) = p_dia)
    and (p_mes is null or extract(month from (o.criado_em at time zone 'America/Sao_Paulo')) = p_mes)
    and (p_ano is null or extract(year from (o.criado_em at time zone 'America/Sao_Paulo')) = p_ano)
  order by o.criado_em desc;
$$ language sql stable security definer set search_path = public;

grant execute on function buscar_ocorrencias_por_periodo(int, int, int) to authenticated;

-- Busca paginada com todos os filtros (aba "Pesquisa de Ocorrências",
-- usada por Regulação, Frota e Gestão). Devolve só a página pedida +
-- o total de resultados encontrados.
create or replace function buscar_ocorrencias_paginado(
  p_pagina int default 1,
  p_tamanho int default 30,
  p_prioridade text default null,
  p_dia int default null,
  p_mes int default null,
  p_ano int default null,
  p_origem text default null,
  p_destino text default null,
  p_municipio text default null,
  p_origem_ligacao text default null,
  p_tipo_viatura text default null,
  p_viatura text default null,
  p_tipo_classificacao text default null,
  p_motivo_classificacao text default null,
  p_categoria text default null,
  p_hora_inicio text default null,
  p_hora_fim text default null,
  p_busca text default null
)
returns table(
  id uuid, numero_controle text, criado_em timestamptz, tarm jsonb, status text,
  regulacao jsonb, despacho jsonb, obito text, motivo_encerramento text, justificativa_cancelamento text,
  motivo_cancelamento_tarm text, precisa_trocar_viatura boolean, historico jsonb,
  total_count bigint
) as $$
declare
  v_offset int := greatest(0, (p_pagina - 1) * p_tamanho);
begin
  return query
  with filtrado as (
    select o.*
    from ocorrencias o
    where
      (p_prioridade is null or o.regulacao ->> 'classificacao' = p_prioridade)
      and (p_dia is null or extract(day from (o.criado_em at time zone 'America/Sao_Paulo')) = p_dia)
      and (p_mes is null or extract(month from (o.criado_em at time zone 'America/Sao_Paulo')) = p_mes)
      and (p_ano is null or extract(year from (o.criado_em at time zone 'America/Sao_Paulo')) = p_ano)
      and (p_origem is null or o.tarm ->> 'origem' = p_origem)
      and (p_destino is null or o.tarm ->> 'destino' = p_destino or o.regulacao ->> 'unidadeDestino' = p_destino)
      and (p_municipio is null or o.tarm ->> 'municipio' = p_municipio)
      and (p_origem_ligacao is null or o.tarm ->> 'origemLigacao' = p_origem_ligacao)
      and (p_tipo_viatura is null or exists (select 1 from veiculos v where v.id = (o.despacho ->> 'veiculoId') and v.tipo = p_tipo_viatura))
      and (p_viatura is null or o.despacho ->> 'veiculoId' = p_viatura or (o.despacho -> 'veiculosExtras') ? p_viatura)
      and (p_tipo_classificacao is null or o.regulacao ->> 'tipoClassificacao' = p_tipo_classificacao)
      and (p_motivo_classificacao is null or o.regulacao ->> 'motivoClassificacao' = p_motivo_classificacao)
      and (
        p_categoria is null or p_categoria = ''
        or (p_categoria = 'Óbito SVO' and o.obito = 'SVO')
        or (p_categoria = 'Óbito IML' and o.obito = 'IML')
        or (p_categoria = 'TROTE' and o.motivo_cancelamento_tarm = 'TROTE')
        or (p_categoria = 'Orientação Médica' and o.status = 'orientacao_dada')
        or (p_categoria = 'Ocorrências Canceladas' and o.status = 'cancelado')
        or (p_categoria = 'Masculino' and o.tarm ->> 'sexo' = 'Masculino')
        or (p_categoria = 'Feminino' and o.tarm ->> 'sexo' = 'Feminino')
      )
      and (p_hora_inicio is null or p_hora_inicio = '' or to_char(o.criado_em at time zone 'America/Sao_Paulo', 'HH24:MI') >= p_hora_inicio)
      and (p_hora_fim is null or p_hora_fim = '' or to_char(o.criado_em at time zone 'America/Sao_Paulo', 'HH24:MI') <= p_hora_fim)
      and (
        p_busca is null or p_busca = ''
        or o.numero_controle ilike '%' || p_busca || '%'
        or (o.tarm ->> 'queixa') ilike '%' || p_busca || '%'
        or (o.tarm ->> 'endereco') ilike '%' || p_busca || '%'
        or (o.tarm ->> 'bairro') ilike '%' || p_busca || '%'
        or (o.tarm ->> 'municipio') ilike '%' || p_busca || '%'
      )
  )
  select f.id, f.numero_controle, f.criado_em, f.tarm, f.status, f.regulacao, f.despacho,
         f.obito, f.motivo_encerramento, f.justificativa_cancelamento, f.motivo_cancelamento_tarm, f.precisa_trocar_viatura, f.historico,
         (select count(*) from filtrado) as total_count
  from filtrado f
  order by f.criado_em desc
  limit p_tamanho offset v_offset;
end;
$$ language plpgsql stable security definer set search_path = public;

grant execute on function buscar_ocorrencias_paginado(
  int, int, text, int, int, int, text, text, text, text, text, text, text, text, text, text, text, text
) to authenticated;

-- ---------------------------------------------------------------------
-- Tempo real (para as telas sincronizarem sozinhas entre usuários)
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table ocorrencias;
alter publication supabase_realtime add table veiculos;

-- ---------------------------------------------------------------------
-- DADOS INICIAIS (seed) — só a frota. Funcionários (perfis) não são
-- semeados aqui porque dependem de uma conta de login já existir;
-- crie o primeiro administrador pelo painel do Supabase, seguindo o
-- GUIA_MIGRACAO_AUTH.md.
-- ---------------------------------------------------------------------
insert into veiculos (id, tipo, base, tripulantes, status) values
  ('USB-01','USB','Base Centro','Cond. Marcos Silva, Téc. Enf. Renata Alves','disponivel'),
  ('USB-02','USB','Base Sul','Cond. Paulo Nunes, Téc. Enf. Camila Dias','disponivel'),
  ('USB-03','USB','Base Sul','','manutencao'),
  ('USA-01','USA','Base Centro','Cond. Rafael Gomes, Enf. Bianca Rocha, Méd. Dr. André Melo','disponivel'),
  ('VIR-01','VIR','Base Centro','Méd. Dra. Patrícia Souza, Enf. Diego Farias','disponivel'),
  ('MOTO-01','MOTOLANCIA','Base Sul','Cond. Eduardo Tavares','disponivel')
on conflict (id) do nothing;

-- Fim do script.
