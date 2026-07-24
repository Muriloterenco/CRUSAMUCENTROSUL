-- =====================================================================
-- MELHORIA DE PERFORMANCE: índices para as buscas por texto
-- Execute este bloco no SQL Editor do Supabase (uma vez só)
--
-- Isso é só a parte NOVA — o restante do banco (perfis, RLS, funções
-- de pesquisa etc.) já está aplicado no seu projeto, não precisa
-- reaplicar. O arquivo schema.sql, na raiz da pasta supabase/, foi
-- consolidado e passa a ser a referência única para instalações
-- novas — os scripts antigos foram movidos para
-- supabase/historico_migracoes/, só por registro.
-- =====================================================================

create index if not exists idx_ocorrencias_tarm_gin on ocorrencias using gin (tarm);
create index if not exists idx_ocorrencias_regulacao_gin on ocorrencias using gin (regulacao);

-- Fim.
