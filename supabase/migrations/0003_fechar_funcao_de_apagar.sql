-- O verificador de segurança do Supabase (18/10/2026) apontou que
-- apagar_personalizacao_vencida(), sendo SECURITY DEFINER no schema public,
-- podia ser chamada por qualquer um em /rest/v1/rpc. Só quem roda a limpeza
-- (chave de serviço, n8n ou pg_cron) pode chamar.
revoke execute on function public.apagar_personalizacao_vencida() from public, anon, authenticated;
grant execute on function public.apagar_personalizacao_vencida() to service_role;
