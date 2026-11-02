-- A versão do livro (dono, 02/11/2026): o de colorir, a história ilustrada
-- (colorida) ou as duas (combo, mais barato). Os pedidos de antes eram todos
-- de colorir. O preço continua recalculado no site (lib/produtos.ts).
alter table public.pedidos
  add column if not exists versao text not null default 'colorir'
  check (versao in ('colorir', 'ilustrada', 'combo'));
