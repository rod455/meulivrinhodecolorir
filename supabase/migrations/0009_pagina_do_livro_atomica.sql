-- O n8n devolve as páginas do livro ao mesmo tempo (execução 9402, 01/11/2026): as 17
-- chegaram e foram guardadas, mas a lista livro_paginas ficou com 3, porque o site lia a
-- lista, acrescentava e regravava, e uma escrita apagava a outra. Agora o acréscimo é uma
-- operação só no banco.
create or replace function public.anotar_pagina_do_livro(pid uuid, caminho text)
returns void
language sql security definer set search_path = public as $$
  update public.pedidos
     set livro_paginas = array_append(livro_paginas, caminho), livro_atualizado_em = now()
   where id = pid and not (caminho = any (livro_paginas));
$$;
revoke execute on function public.anotar_pagina_do_livro(uuid, text) from public, anon, authenticated;
grant execute on function public.anotar_pagina_do_livro(uuid, text) to service_role;
