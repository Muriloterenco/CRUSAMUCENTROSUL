-- =====================================================================
-- CORREÇÃO: número de controle das ocorrências
-- Execute este bloco no SQL Editor do Supabase (uma vez só)
-- =====================================================================

-- 1) Protege a tabela interna de contagem diária (ninguém acessa direto)
alter table controle_diario enable row level security;

drop policy if exists "bloquear tudo controle_diario" on controle_diario;
create policy "bloquear tudo controle_diario" on controle_diario
  for all using (false) with check (false);

-- 2) Faz o gatilho que gera o número de controle rodar com privilégio
--    elevado (ignorando a trava de segurança acima), já que ele é
--    interno ao sistema e não é chamado diretamente pelo aplicativo.
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

-- Fim da correção.
