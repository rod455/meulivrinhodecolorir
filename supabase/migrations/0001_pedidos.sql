-- Pedidos do Meu Livrinho de Colorir (seção 9 do documento de produto).
-- A rota /api/pedido grava aqui com a chave de serviço; o n8n lê e atualiza o status.
-- Ninguém de fora lê esta tabela: RLS ligado e nenhuma política pública.

create table if not exists public.pedidos (
  id uuid primary key,
  criado_em timestamptz not null default now(),
  produto text not null check (produto in ('lembrancinha', 'presente', 'combo')),
  tema text not null,
  -- LGPD (seção 4.4): só o primeiro nome e a idade da criança
  nome_crianca text not null check (char_length(nome_crianca) <= 14),
  idade smallint not null check (idade between 1 and 10),
  data_festa date,
  dedicatoria text check (char_length(dedicatoria) <= 120),
  responsavel text not null,
  email text not null,
  whatsapp text not null,
  forma_pagamento text not null check (forma_pagamento in ('pix', 'cartao')),
  total_centavos integer not null check (total_centavos > 0),
  aceita_novidades boolean not null default false,
  aceita_lembrete boolean not null default false,
  status text not null default 'aguardando_pagamento'
    check (status in ('aguardando_pagamento', 'pago', 'pdf_gerado', 'entregue', 'reembolsado', 'cancelado')),
  pago_em timestamptz,
  entregue_em timestamptz,
  link_pdf text,
  -- de onde a pessoa veio: utm_*, ref do QR code, referrer
  origem jsonb not null default '{}'::jsonb
);

create index if not exists pedidos_email_idx on public.pedidos (email);
create index if not exists pedidos_status_idx on public.pedidos (status, criado_em desc);
-- o lembrete de aniversário (10 meses depois) procura por aqui
create index if not exists pedidos_lembrete_idx on public.pedidos (data_festa) where aceita_lembrete;

alter table public.pedidos enable row level security;

-- Seção 4.4: apagar os dados de personalização em 12 meses, salvo quem aceitou
-- o lembrete. Rodar mensalmente (pg_cron ou n8n). Mantém a venda para a
-- contabilidade, apaga o que identifica a criança.
create or replace function public.apagar_personalizacao_vencida() returns integer
language sql security definer set search_path = public as $$
  with apagados as (
    update public.pedidos
       set nome_crianca = '(apagado)', dedicatoria = null, data_festa = null
     where criado_em < now() - interval '12 months'
       and not aceita_lembrete
       and nome_crianca <> '(apagado)'
    returning 1
  )
  select count(*)::integer from apagados;
$$;
