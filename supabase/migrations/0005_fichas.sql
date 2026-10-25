-- A ficha do personagem, aprovada antes de pagar (decisão do dono, 25/10/2026):
-- só com conta, até 3 por pessoa em 24 horas sem pedido (a primeira e 2
-- ajustes). A família vê só uma prévia pequena com marca d'água; a imagem
-- limpa fica no bucket privado e só entra no livro pago.
--
-- O n8n nunca recebe chave: ganha um bilhete de uso único (token) por ficha,
-- busca o prompt no site com ele e devolve a imagem do mesmo jeito.

create table if not exists public.fichas (
  id uuid primary key,
  criada_em timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- as escolhas (só ids de lista) e a idade que geraram esta ficha
  personagem jsonb not null,
  idade smallint not null check (idade between 1 and 10),
  prompt text not null,
  caminho_foto text references public.fotos (caminho) on delete set null,
  status text not null default 'gerando' check (status in ('gerando', 'pronta', 'falhou')),
  token text,
  caminho_imagem text,
  erro text,
  aprovada_em timestamptz,
  pedido_id uuid references public.pedidos (id) on delete set null
);
create index if not exists fichas_user_idx on public.fichas (user_id, criada_em desc);
alter table public.fichas enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fichas', 'fichas', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- a ficha deriva do rosto da criança: sai junto com a conta
create or replace function public.anonimizar_conta(uid uuid)
returns table (bucket text, caminho text)
language plpgsql security definer set search_path = public as $$
begin
  return query
    select 'fotos-criancas'::text, f.caminho from public.fotos f where f.user_id = uid and f.apagada_em is null
    union all
    select 'livros'::text, p.link_pdf from public.pedidos p where p.user_id = uid and p.link_pdf is not null
    union all
    select 'fichas'::text, fi.caminho_imagem from public.fichas fi where fi.user_id = uid and fi.caminho_imagem is not null;

  update public.fotos set apagada_em = coalesce(apagada_em, now()), user_id = null where user_id = uid;
  update public.consentimentos set user_id = null where user_id = uid;
  update public.pedidos
     set nome_crianca = '(apagado)', dedicatoria = null, data_festa = null, personagem = null, plano = null,
         responsavel = '(apagado)', email = '(apagado)', whatsapp = '(apagado)', link_pdf = null,
         aceita_novidades = false, aceita_lembrete = false, user_id = null
   where user_id = uid;
  delete from public.fichas where user_id = uid;
end;
$$;
revoke execute on function public.anonimizar_conta(uuid) from public, anon, authenticated;
grant execute on function public.anonimizar_conta(uuid) to service_role;
