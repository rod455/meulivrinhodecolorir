-- Conta do adulto responsável (decisão do dono, 18/10/2026): monta o livro
-- sem cadastro; para comprar e baixar, entra com e-mail e senha, link por
-- e-mail ou Google (Supabase Auth). A criança nunca tem login.

alter table public.pedidos add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table public.fotos add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table public.consentimentos add column if not exists user_id uuid references auth.users (id) on delete set null;
create index if not exists pedidos_user_idx on public.pedidos (user_id, criado_em desc);
create index if not exists fotos_user_idx on public.fotos (user_id) where apagada_em is null;

-- cada conta lê só o que é dela; escrever continua só pelo servidor (chave de serviço)
drop policy if exists "conta le os proprios pedidos" on public.pedidos;
create policy "conta le os proprios pedidos" on public.pedidos for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "conta le as proprias fotos" on public.fotos;
create policy "conta le as proprias fotos" on public.fotos for select to authenticated using (user_id = (select auth.uid()));

-- os PDFs entregues: privados, baixados só por link assinado gerado para o dono do pedido
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('livros', 'livros', false, 52428800, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- "Excluir minha conta e todos os dados": a venda fica para a contabilidade
-- (produto, valor, datas, status); tudo o que identifica a família e a criança
-- some. Devolve os arquivos que a rota ainda precisa tirar do Storage.
create or replace function public.anonimizar_conta(uid uuid)
returns table (bucket text, caminho text)
language plpgsql security definer set search_path = public as $$
begin
  return query
    select 'fotos-criancas'::text, f.caminho from public.fotos f where f.user_id = uid and f.apagada_em is null
    union all
    select 'livros'::text, p.link_pdf from public.pedidos p where p.user_id = uid and p.link_pdf is not null;

  update public.fotos set apagada_em = coalesce(apagada_em, now()), user_id = null where user_id = uid;
  update public.consentimentos set user_id = null where user_id = uid;
  update public.pedidos
     set nome_crianca = '(apagado)', dedicatoria = null, data_festa = null, personagem = null, plano = null,
         responsavel = '(apagado)', email = '(apagado)', whatsapp = '(apagado)', link_pdf = null,
         aceita_novidades = false, aceita_lembrete = false, user_id = null
   where user_id = uid;
end;
$$;
revoke execute on function public.anonimizar_conta(uuid) from public, anon, authenticated;
grant execute on function public.anonimizar_conta(uuid) to service_role;
