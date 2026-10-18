-- O personagem da criança e a foto (decisão do dono, 18/10/2026).
-- A foto mora num bucket privado, sem metadados, e some em 7 dias pela rota
-- /api/limpeza-fotos (Vercel Cron, todo dia). Ninguém de fora lê nada daqui:
-- RLS ligado e nenhuma política pública, igual a `pedidos`.

-- o pedido guarda as escolhas (só ids de lista) e o plano que o n8n executa
alter table public.pedidos
  add column if not exists modelo text,
  add column if not exists personagem jsonb,
  add column if not exists plano jsonb;

-- bucket privado: sem leitura pública, só JPEG, até 10 MB
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-criancas', 'fotos-criancas', false, 10485760, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.fotos (
  caminho text primary key check (caminho ~ '^fotos/[0-9a-f-]{36}\.jpg$'),
  enviada_em timestamptz not null default now(),
  apagar_em timestamptz not null default now() + interval '7 days',
  apagada_em timestamptz,
  -- preenchido quando o pedido que usa a foto é gravado
  pedido_id uuid references public.pedidos (id) on delete set null
);
create index if not exists fotos_a_apagar_idx on public.fotos (apagar_em) where apagada_em is null;
alter table public.fotos enable row level security;

-- o aceite do responsável, com a versão do texto que ele leu
create table if not exists public.consentimentos (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('foto_crianca')),
  versao text not null,
  aceito_em timestamptz not null default now(),
  caminho text references public.fotos (caminho) on delete set null,
  -- só o prefixo da rede (/24), para provar o aceite sem guardar o endereço inteiro
  rede text
);
alter table public.consentimentos enable row level security;
