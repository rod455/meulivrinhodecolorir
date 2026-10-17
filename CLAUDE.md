# Meu Livrinho de Colorir, guia de trabalho

Site de venda de livrinhos de colorir personalizados: Next.js 14 na Vercel.
Uma pessoa só decide (o dono, Rodrigo); o trabalho vai direto para a `main`
(regra do dono, 17/10/2026: "coloque tudo na main, sempre").

**Antes de qualquer coisa**: leia `docs/mapa-do-codigo.md` (onde cada coisa mora)
e, para qualquer decisão de produto, texto ou visual, `docs/produto-e-marca.md`.

## Regras que valem aqui

- **Texto visível**: português natural, SEM travessão. `npm run conferir:travessao` grita.
- **Nunca sem o dono**: preço e planos, cobrança e links de pagamento, mensagem a
  cliente, apagar dados, gasto novo, chaves e segredos.
- **Preço nunca vem do navegador**: a rota recalcula com `lib/produtos.ts`.
- **LGPD**: da criança, só o primeiro nome e a idade. Sem foto, sobrenome nem escola.
- **Personagens próprios**: nada parecido com personagem licenciado.
- **Marca**: paleta e tipografia de `docs/produto-e-marca.md` seção 6; botão
  Laranja Giz com texto Grafite (nunca texto branco sobre laranja ou amarelo).
- Commits em português: título curto com o porquê, corpo explicando a decisão.

## Conferência

`npm run conferir` (rápido) + `npm run conferir:navegador` quando mexer no fluxo
do pedido ou na LP. Prove que a conferência morde antes de confiar no verde:
plante o defeito e veja se ela grita.
