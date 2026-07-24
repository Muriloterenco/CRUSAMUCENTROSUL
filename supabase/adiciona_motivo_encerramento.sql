-- =====================================================================
-- NOVO: comando "Encerrar Ocorrência" na Frota
-- Execute este bloco no SQL Editor do Supabase (uma vez só)
-- =====================================================================

alter table ocorrencias add column if not exists motivo_encerramento text;

-- A função de busca paginada precisa ser recriada (o Postgres exige isso
-- quando a lista de colunas retornadas muda), agora incluindo o novo campo.
drop function if exists buscar_ocorrencias_paginado(
  int, int, text, int, int, int, text, text, text, text, text, text, text, text, text, text, text, text
);

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

-- Fim.

