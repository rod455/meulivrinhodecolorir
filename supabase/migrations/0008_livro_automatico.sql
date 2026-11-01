-- O livro sai sozinho (pedido do dono, 01/11/2026): quando o pedido vira "pago",
-- o banco avisa o site; o site confere de novo, dá um bilhete ao n8n, a OpenAI põe
-- a criança em cada cena, o site monta o PDF e manda para o dono revisar. Só depois
-- que o dono libera, o PDF vai para link_pdf (Meus livrinhos) e a família é avisada.

alter table public.pedidos
  add column if not exists livro_status text
    check (livro_status in ('gerando', 'montado', 'falhou', 'liberado')),
  -- bilhete do n8n enquanto gera (e para o aviso à família); morre ao terminar
  add column if not exists livro_token text,
  -- chave do link de revisão do dono (não expira, mas só serve para este pedido)
  add column if not exists livro_revisao text,
  -- o PDF montado, no bucket livros, antes de o dono liberar
  add column if not exists livro_pdf text,
  -- as páginas já desenhadas (bucket paginas), para refazer só as que faltam e apagar junto com a conta
  add column if not exists livro_paginas text[] not null default '{}',
  add column if not exists livro_erro text,
  add column if not exists livro_atualizado_em timestamptz;

-- as páginas com a criança desenhada, antes de virar PDF: privadas, apagadas ao liberar
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('paginas', 'paginas', false, 10485760, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create extension if not exists pg_net with schema extensions;

-- O aviso ao site leva só o id: o site relê o pedido e só começa se ele estiver pago,
-- com plano e sem livro em andamento. Avisar à toa não gasta nada.
create or replace function public.avisar_site_do_livro()
returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  if new.status = 'pago' and new.livro_status is null and new.plano is not null
     and (tg_op = 'INSERT' or old.status is distinct from 'pago' or old.livro_status is not null) then
    perform net.http_post(
      url := 'https://meulivrinhodecolorir.com.br/api/livro-auto/iniciar',
      body := jsonb_build_object('pedido_id', new.id),
      headers := '{"content-type": "application/json"}'::jsonb
    );
  end if;
  return new;
end;
$$;
revoke execute on function public.avisar_site_do_livro() from public, anon, authenticated;

drop trigger if exists pedido_pago_gera_livro on public.pedidos;
create trigger pedido_pago_gera_livro
  after insert or update of status, livro_status on public.pedidos
  for each row execute function public.avisar_site_do_livro();

-- a exclusão da conta leva também o PDF em revisão e as páginas desenhadas
create or replace function public.anonimizar_conta(uid uuid)
returns table (bucket text, caminho text)
language plpgsql security definer set search_path = public as $$
begin
  return query
    select 'fotos-criancas'::text, f.caminho from public.fotos f where f.user_id = uid and f.apagada_em is null
    union all
    select 'livros'::text, p.link_pdf from public.pedidos p where p.user_id = uid and p.link_pdf is not null
    union all
    select 'livros'::text, p.livro_pdf from public.pedidos p where p.user_id = uid and p.livro_pdf is not null
    union all
    select 'paginas'::text, unnest(p.livro_paginas) from public.pedidos p where p.user_id = uid
    union all
    select 'fichas'::text, fi.caminho_imagem from public.fichas fi where fi.user_id = uid and fi.caminho_imagem is not null;

  update public.fotos set apagada_em = coalesce(apagada_em, now()), user_id = null where user_id = uid;
  update public.consentimentos set user_id = null where user_id = uid;
  update public.pedidos
     set nome_crianca = '(apagado)', dedicatoria = null, data_festa = null, personagem = null, plano = null,
         responsavel = '(apagado)', email = '(apagado)', whatsapp = '(apagado)', link_pdf = null,
         livro_pdf = null, livro_paginas = '{}', livro_token = null, livro_revisao = null,
         aceita_novidades = false, aceita_lembrete = false, user_id = null
   where user_id = uid;
  delete from public.fichas where user_id = uid;
end;
$$;
revoke execute on function public.anonimizar_conta(uuid) from public, anon, authenticated;
grant execute on function public.anonimizar_conta(uuid) to service_role;
