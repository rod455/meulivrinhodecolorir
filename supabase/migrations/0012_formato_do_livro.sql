-- O formato do livro personalizado (dono, 09/11/2026): o PDF para imprimir em
-- casa ou o livro impresso, que chega pelo correio (frete à parte). Os pedidos
-- de antes eram todos PDF. O endereço só existe no impresso.
alter table public.pedidos
  add column if not exists formato text not null default 'pdf'
  check (formato in ('pdf', 'impresso'));
alter table public.pedidos
  add column if not exists endereco jsonb;

-- A exclusão de conta apaga também o endereço: o do impresso personalizado
-- (coluna nova acima) e o dos livros publicados da turma (pedidos_turma), que
-- a função não apagava. Igual à da 0008, com essas duas mudanças.
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
         aceita_novidades = false, aceita_lembrete = false, endereco = null, user_id = null
   where user_id = uid;
  -- os livros publicados da turma também guardam nome, WhatsApp e endereço (estava faltando até 09/11/2026)
  update public.pedidos_turma
     set responsavel = '(apagado)', whatsapp = '(apagado)', endereco = null, user_id = null
   where user_id = uid;
  delete from public.fichas where user_id = uid;
end;
$$;
revoke execute on function public.anonimizar_conta(uuid) from public, anon, authenticated;
grant execute on function public.anonimizar_conta(uuid) to service_role;
