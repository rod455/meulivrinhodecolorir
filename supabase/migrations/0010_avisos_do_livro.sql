-- A trava deixou de colar a área da criança sobre a cena original (as emendas cortavam
-- personagens: teste do Tito, 01/11/2026). A página fica inteira como a OpenAI devolveu, e o
-- site mede quanto a cena mudou fora do lugar da criança; o que passa do limite vira um aviso
-- para o dono olhar na revisão. As páginas chegam juntas, então o acréscimo é atômico.
alter table public.pedidos add column if not exists livro_avisos text[] not null default '{}';

create or replace function public.anotar_aviso_do_livro(pid uuid, aviso text)
returns void
language sql security definer set search_path = public as $$
  update public.pedidos set livro_avisos = array_append(livro_avisos, aviso) where id = pid;
$$;
revoke execute on function public.anotar_aviso_do_livro(uuid, text) from public, anon, authenticated;
grant execute on function public.anotar_aviso_do_livro(uuid, text) to service_role;
