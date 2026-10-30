# Livros personalizados da turma Little Paws
## A receita para transformar um livro da série num tema em que a criança entra na história

Cada livro publicado da turma (Big Game, Big Play, Big Christmas, A Grande Final de Futebol) pode virar um **tema personalizado** do Meu Livrinho de Colorir: a mesma turma, o mesmo cenário e uma história parecida, com **uma vaga** para o personagem da criança, desenhado a partir da ficha que a família aprovou.

| Tema | Arquivo | Livro de origem | Situação |
|---|---|---|---|
| Futebol | `futebol-little-paws.md` | (anterior aos livros; deu origem ao *A Grande Final de Futebol*) | No site, falta gerar as cenas base |
| Basquete | `basquete-little-paws.md` | *Little Paws, Big Game* | Pronto para gerar as cenas base |
| Flag football | `flag-football-little-paws.md` | *Little Paws, Big Play* | Pronto para gerar as cenas base |
| Natal | `natal-little-paws.md` | *Little Paws, Big Christmas* | Pronto para gerar as cenas base |

O `futebol-little-paws.md` é o **modelo completo**: as seções comuns (como produzir, regras de texto, estrutura dos produtos, checagem, custos) valem para todos e não se repetem nos outros arquivos. Cada arquivo novo traz só o que muda: a história, as cenas, as roupas, a página do superpoder, a capa e o certificado.

---

## 1. A receita, em 8 passos

1. **Ache a vaga.** A história precisa de um motivo para alguém novo entrar na turma: falta um jogador, uma fita voou, um trenó parou. A criança aparece escondida nas páginas 1 e 2 (o leitor brinca de achar) e entra de verdade na 3.
2. **Mantenha a lição do livro de origem**, mas com a criança ajudando a chegar nela, sem tirar o protagonismo do personagem da turma. No basquete, o Pip aprende a passar a bola, e é para a criança que ele passa.
3. **16 páginas, com a criança em todas.** No máximo duas frases por página. Página 13: o **momento do superpoder**, sempre num ponto em que o time está triste ou travado.
4. **Troca de roupa:** a criança começa com a própria roupa e ganha a roupa do time na página 9 (camisa, suéter). Da página 10 em diante, de uniforme.
5. **Texto neutro para a criança:** sem "ele/ela", sem adjetivo com gênero ("animado/animada", "sozinho/sozinha", "nervoso/nervosa"). Sempre `{NOME}` e construções neutras.
6. **Final feliz e com o adversário junto.** Os Stripes jogam limpo, cumprimentam e comemoram junto. Ninguém se machuca, ninguém derruba ninguém.
7. **Lembrancinha:** escolha 9 páginas em que a criança aparece fazendo algo, na ordem da história, e escreva uma legenda curta para cada.
8. **Prova antes de vender:** gere a ficha do time, as 16 cenas base e a capa; teste a inserção com 3 personagens fictícios (nunca com fotos de crianças reais) e com os cinco superpoderes da página 13.

---

## 2. O que vale para todos os temas

- **Método:** cena base (uma vez) + inserção (a cada pedido). Seção 2 do `futebol-little-paws.md`.
- **Variáveis de texto:** `{NOME}`, `{IDADE}`, `{SUPERPODER}`, `{SUPERPODER_NOME}`, `{DEDICATORIA}`, `{QUEM_PRESENTEIA}`. Seção 3.1 do modelo.
- **Variáveis de imagem:** `{CHILD_SHORT}`, `{CHILD_HEIGHT}`, `{OUTFIT_OWN}`; cada tema define o seu `{OUTFIT_TEAM}`.
- **Prompt de inserção:** o mesmo em todos os temas (seção 4.4 do modelo).
- **Estrutura dos produtos:** Presente com 20 páginas (capa, dedicatória, 16 de história, certificado, contracapa) e Lembrancinha com 12 (capa, "este livrinho é de", 9 páginas, contracapa). Seção 7 do modelo.
- **Checagem de cada pedido e custos:** seções 8 e 10 do modelo.
- **Privacidade:** a foto da criança, quando existe, entra **só na ficha**. As páginas usam sempre a ficha desenhada. O nome da criança **nunca** vai para o prompt de imagem (`npm run conferir:personagem` grita).
- **Personagens próprios:** nada parecido com personagem licenciado, nem time ou marca real.

### Os cinco superpoderes

O texto da página 13 de cada tema tem uma frase fixa e uma segunda frase que muda com o superpoder escolhido no cadastro. A ação da criança na imagem muda junto.

| `{SUPERPODER}` | Nome no certificado | O que a criança faz na história |
|---|---|---|
| `coragem` | Coragem | Encoraja o time a tentar de novo, admitindo o próprio medo |
| `criatividade` | Criatividade | Inventa uma jogada ou um plano novo |
| `gentileza` | Gentileza | Consola quem está triste |
| `bom_humor` | Bom humor | Faz todo mundo rir |
| `curiosidade` | Curiosidade | Repara num detalhe que resolve o problema |

---

## 3. Para ligar um tema novo no site

Quando as cenas base estiverem aprovadas:

1. Criar `lib/historias/<tema>.ts` no formato de `lib/historias/futebol.ts` (as 16 páginas, a capa, a página da troca de roupa e as variantes da página 13), com o texto **igual** ao do `.md`.
2. Marcar o tema com `comPersonagem: true` em `lib/temas.ts`, com a vitrine e as amostras.
3. Ligar o tema em `lib/geracao.ts` (hoje o plano do livro só conhece o futebol).
4. Acrescentar os casos do tema em `scripts/verifica-personagem.ts`: nenhum texto com gênero para a criança, o nome fora dos prompts de imagem, a troca de roupa na página certa.
5. Conferir com `npm run conferir` e a suíte de navegador.

> **Decisão do dono antes do Natal:** o site já tem um tema "Natal mágico" sem a turma (árvore, presentes, a estrela que caiu no quintal). O `natal-little-paws.md` pode substituir esse tema ou entrar ao lado dele.
