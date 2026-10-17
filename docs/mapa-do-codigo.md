# Mapa do código

| Quero mudar… | Vá em |
| --- | --- |
| preço, nome ou descrição de um produto | `lib/produtos.ts` (só com o dono; confira com `npm run conferir:pedido`) |
| um tema (nome, frases das páginas, começo da história) | `lib/temas.ts` |
| a arte colorida de um tema (capa e páginas de amostra) | arquivo em `public/artes/` + campo `artes` do tema em `lib/temas.ts`; originais em `docs/artes/referencias/` |
| o desenho de um tema sem arte | `components/desenho/temas.tsx`, lista de formas num quadro de 240 x 200 |
| o efeito "do contorno à cor" | `components/desenho/formas.tsx` |
| a capa do livrinho | `components/CapaLivrinho.tsx` (A5, viewBox 296 x 420) |
| as páginas de amostra | `components/PaginaAmostra.tsx` |
| regras do nome (limite, palavrão, maiúsculas, fonte da capa) | `lib/nome.ts` (confira com `npm run conferir:nome`) |
| validação do pedido | `lib/pedido.ts`, a mesma no navegador e na rota |
| textos e seções da LP | `app/page.tsx`; perguntas frequentes em `lib/faq.ts` |
| o fluxo de criação (produto, tema, nome, pagamento) | `app/criar/Criar.tsx` |
| para onde vai o pedido (Supabase, n8n, link de pagamento) | `lib/servidor/pedidos.ts` e `app/api/pedido/route.ts` |
| a tabela de pedidos | `supabase/migrations/0001_pedidos.sql` |
| eventos de medição (GA4, Meta Pixel) | `lib/analytics.ts` |
| UTM e QR code que acompanham o pedido | `components/GuardaOrigem.tsx` |
| WhatsApp, e-mail, CNPJ do rodapé | variáveis `NEXT_PUBLIC_*` (veja `.env.example`) |
| cores, fontes, botões | `app/globals.css` e `app/layout.tsx` |

## Como o pedido anda

1. A pessoa escolhe produto, tema e nome em `/criar`, vê a capa ao vivo e preenche contato.
2. `POST /api/pedido` valida de novo, recalcula o preço e grava no Supabase e/ou
   avisa o n8n (`N8N_WEBHOOK_PEDIDO`). Sem nenhum dos dois ligado, a rota recusa
   o pedido e manda a pessoa para o WhatsApp: pedido que não fica guardado é perdido.
3. Se existe `PAGAMENTO_LINK_<PRODUTO>_<PIX|CARTAO>`, a pessoa vai para o
   pagamento; senão, cai em `/obrigado` e o link segue pelo WhatsApp.
4. Do pagamento em diante (gerar o PDF pelo script Python, enviar por e-mail e
   WhatsApp, lembretes D+1, pós-festa e aniversário) é do n8n. O link de
   pagamento deve voltar para `/obrigado?status=pago`.

## O que ainda NÃO está aqui

- Geração do PDF: o script Python dos livros Little Paws mora fora deste repositório.
- Confirmação automática de pagamento (webhook do Mercado Pago ou Stripe).
- Artes de Natal e Fundo do mar: só o Futebol usa as artes da turma Little Paws;
  os outros dois ainda mostram o desenho em SVG. A arte do livrinho de verdade vem do script.
- Fotos de clientes, prova social e order bump das etiquetas (entram depois das primeiras vendas).
