-- Os livros publicados da turma Little Paws, vendidos no site (pedido do dono,
-- 26/10/2026): impresso sob medida (R$ 79,90) e PDF para imprimir em casa
-- (R$ 29,90). O Kindle vai direto para a Amazon e não passa por aqui.
-- O preço é sempre o do servidor (lib/livros-publicados.ts), nunca o do navegador.
-- Endereço só no impresso. Ao excluir a conta, nome, contato e endereço somem
-- (a rota /api/conta/excluir faz isso); a venda fica.

create table if not exists public.pedidos_turma (
  id uuid primary key,
  criado_em timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  edicao text not null,
  formato text not null check (formato in ('impresso', 'pdf')),
  preco_centavos integer not null check (preco_centavos > 0),
  responsavel text not null,
  email text not null,
  whatsapp text not null,
  endereco jsonb,
  status text not null default 'aguardando_pagamento' check (status in ('aguardando_pagamento', 'pago', 'enviado', 'entregue', 'cancelado'))
);
create index if not exists pedidos_turma_user_idx on public.pedidos_turma (user_id, criado_em desc);
alter table public.pedidos_turma enable row level security;

-- cada conta lê só os seus; escrever, só o servidor (chave de serviço)
drop policy if exists "conta le os proprios pedidos da turma" on public.pedidos_turma;
create policy "conta le os proprios pedidos da turma" on public.pedidos_turma for select to authenticated using (user_id = (select auth.uid()));
