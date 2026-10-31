-- A história sob medida (decisão do dono, 31/10/2026): a IA escreve do zero,
-- no estilo da turma Little Paws, e a família aprova o texto antes de pagar.
-- Só com conta, até 3 histórias novas por conta em 24 horas, e até 2 ajustes
-- em cada uma.
--
-- O nome da criança não mora aqui: o briefing e o texto guardam {NOME}, e o
-- nome só entra na tela e no pedido. Como nas fichas, o n8n nunca recebe
-- chave: ganha um bilhete de uso único (token) por escrita.

create table if not exists public.historias (
  id uuid primary key,
  criada_em timestamptz not null default now(),
  -- quando a última escrita (a primeira ou um ajuste) foi pedida: base do tempo esgotado
  pedida_em timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  idade smallint not null check (idade between 1 and 10),
  superpoder text not null,
  -- só ids de lista e textos curtos já sem o nome da criança
  briefing jsonb not null,
  status text not null default 'escrevendo' check (status in ('escrevendo', 'pronta', 'falhou')),
  token text,
  texto jsonb,
  ajustes smallint not null default 0 check (ajustes between 0 and 2),
  pedido_de_ajuste text,
  erro text,
  aprovada_em timestamptz,
  pedido_id uuid references public.pedidos (id) on delete set null
);
create index if not exists historias_user_idx on public.historias (user_id, criada_em desc);
-- RLS ligada e sem política: só o servidor (chave de serviço) lê e escreve
alter table public.historias enable row level security;
