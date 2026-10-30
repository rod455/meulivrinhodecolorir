# {NOME} entra na quadra!
## Tema personalizado de basquete com a turma Little Paws: história, cenas base e prompts de inserção do personagem

**Produto:** Meu Livrinho de Colorir · **Idioma do livro:** português do Brasil · **Idade:** 3 a 8 anos
**Formatos:** Livrinho Presente (20 páginas) e Lembrancinha (12 páginas), em A5 e A4
**Esporte:** basquete, no torneio da quadra da praça
**Livro de origem:** *Little Paws, Big Game* (`01-little-paws-big-game/`)
**Modelo e seções comuns:** `futebol-little-paws.md` e `README.md` desta pasta

---

## 1. A ideia em uma frase

O Pip quer fazer a cesta da vitória sozinho e não passa a bola para ninguém. **{NOME}** aparece na quadra, devolve uma bola com um passe certeiro e entra no time. Com o truque "quica, olha e passa", o time aprende a jogar junto, e no último lance o Pip passa para {NOME}, que arremessa a cesta da vitória.

**A lição do livro de origem continua:** quem aprende a jogar em equipe é o Pip. A criança é a parceira que ajuda, e é para ela que vai o passe decisivo.

**Diferença para o livro publicado:** no *Big Game* o time perde por um ponto. Aqui o time vence por um ponto, porque a cesta final é da criança; os Stripes comemoram junto.

---

## 2. Como produzir

Igual ao modelo (seção 2 do `futebol-little-paws.md`): cena base uma vez, inserção a cada pedido. Na produção do tema:

1. Gerar e aprovar a **ficha do time no uniforme de basquete** (seção 4.3).
2. Gerar e aprovar a **ficha do cenário**: quadra azul da praça, tabela com aro e rede, arquibancada de madeira, cerquinha e casinhas ao fundo.
3. Gerar as **16 cenas base, a capa e o certificado**, uma por vez.
4. Testar a inserção com os 3 personagens fictícios do modelo e com os cinco superpoderes da página 13.

---

## 3. Variáveis específicas

| Variável | Valor |
|---|---|
| `{OUTFIT_TEAM}` | `the Little Paws basketball uniform: sleeveless tank-top jersey with the outlined paw emblem, basketball shorts, ankle socks and high-top sneakers, plus the same glasses and hair accessories from the sheet` |

**Troca de roupa:**
- Páginas 1 a 9: `{OUTFIT_OWN}`.
- Páginas 10 a 16, capa e certificado: `{OUTFIT_TEAM}`.

---

## 4. Prompt mestre e fichas

### 4.1 Prompt mestre (vale para todas as cenas base)

```
Create ONE original children's coloring-book page for the requested scene only. Portrait 2:3 canvas, to be printed at A5 and A4. Highest available resolution.
Clean, confident, thick black outlines on a pure white background. Entirely uncolored interiors. No gray, shading, gradients, hatching, solid black fills, textures, watermarks, logos, borders, panels or collage. Hair and fur are outlines only; every enclosed area stays white for the child to color.
Large closed shapes, rounded friendly forms, readable facial expressions, simple backgrounds with generous open areas. No tiny patterns. One clear story action per page.
Keep important artwork inside 7% margins. Keep the bottom 22% of the canvas completely white: the story text will be typeset there later.
No text, letters, numbers, speech bubbles, signs with writing, jersey numbers or scoreboards. Posters contain simple pictures only.
Follow the approved Little Paws basketball reference sheet exactly: faces, markings, relative heights, uniforms and accessories.
Basketball: a round ball drawn with its curved seam lines only, never filled black. Hoop: a simple backboard with an outlined square, a ring and a net of a few large diamonds. The court is open and simple, with only a few outlined lines.
Leave the RESERVED AREA described in the scene completely empty (plain white background, no props, no characters, no court lines inside it): a new character will be added there later.
Do not draw the same character twice. Natural anatomy, believable basketball actions, no pushing, no rough contact, no injuries. Original characters only, no professional team branding.
```

**Variante para 2 a 4 anos:** acrescente `Extra-thick outlines, even bigger shapes, fewer background elements.`

### 4.2 Elenco fixo (character bible)

As mesmas regras visuais dos livros Little Paws (seção 4.2 do modelo): Pip, Bo, Luna, Dot e Milo, com as mesmas alturas e marcas.

| Personagem | Papel no time |
|---|---|
| **Pip** (coelho) | Armador rapidinho; no começo quer arremessar tudo sozinho |
| **Bo** (urso) | Pivô, pega os rebotes, gentil |
| **Luna** (raposa) | Pensa as jogadas; às vezes carrega uma prancheta só com desenhos |
| **Dot** (tartaruga) | Repara em tudo |
| **Milo** (guaxinim) | Engraçado, faz piada até quando erra |

**Uniforme Little Paws de basquete:** regata com o **emblema de patinha** contornado, shorts, meia curta e tênis de cano alto. Nada de números ou textos.

**Adversários (páginas 10 a 16): Zuzu e os Stripes.** Zuzu (esquilo, capitã, rabo grande enrolado), castor, cervo **sem chifres**, lontra e texugo (listras do rosto só em contorno). Regata com **listras horizontais** e nunca o emblema de patinha. Rápidos e simpáticos.

**Vovó Ursa (páginas 10 e 16):** na torcida, de óculos redondos e avental florido.

**Cenário:**
- quadra da praça com uma tabela de cada lado;
- arquibancada de madeira de três degraus;
- árvore de copa redonda e cerquinha ao fundo;
- no dia do torneio: varal de **bandeirinhas** lisas.

### 4.3 Prompt da ficha do time (produção, não é página do livro)

```
Create one reference sheet on a white background showing Pip, Bo, Luna, Dot and Milo in their fixed Little Paws BASKETBALL uniforms (sleeveless tank-top jersey with the outlined paw emblem, shorts, ankle socks, high-top sneakers), following the character bible exactly. For each character: front and three-quarter views, consistent relative heights, neutral and happy expressions. Clean black coloring-book line art, no gray, no color, no labels. Characters separate and fully visible. This is a production asset, not a book page.
```

### 4.4 Prompt de inserção

O mesmo do modelo (seção 4.4 do `futebol-little-paws.md`). Em cada página abaixo, preencha `{ACTION}`, `{AREA}` e `{OUTFIT}`.

---

## 5. A história, página a página

> **Texto:** vai no rodapé, inserido pelo script.
> **Lembrancinha:** legenda curta usada quando a página entra na Lembrancinha.

---

### Página 01: O cartaz
**Texto:** O Torneio de Basquete da Praça ia começar! Pip já sonhava com a cesta da vitória. *(Psiu… quem está lá na arquibancada?)*

**A. Cena base:**
```
Scene 01. Pip stands on tiptoe next to the court fence, excitedly pointing at a notice board with a picture-only poster: a basketball, a hoop and a small trophy, no writing. Pip has a dreamy smile, imagining the winning shot. The wooden bleachers stand at the right side of the page.
RESERVED AREA: right side, on the top row of the bleachers, partly hidden behind the railing, about 25% of the page height. Leave it empty.
```
**B. Inserção:** `{ACTION}` = `sitting on the top row of the bleachers, peeking over the railing with a curious smile, holding their own basketball on the lap` · `{AREA}` = `the right side, top row of the bleachers` · `{OUTFIT}` = `{OUTFIT_OWN}`

---

### Página 02: Tudo sozinho
**Texto:** No treino, Pip quis arremessar todas as bolas. E errou quase todas! *(Da arquibancada, alguém ria baixinho…)*

**A. Cena base:**
```
Scene 02. On the court, Pip jumps and throws the basketball toward the hoop; the ball flies wide of the ring with motion lines. Bo, Luna, Dot and Milo stand with their arms open, all free to receive a pass, looking a little puzzled. The bleachers in the left background.
RESERVED AREA: the left background, on the bleachers, small (about 20% of page height).
```
**B. Inserção:** `{ACTION}` = `sitting on the bleachers, covering a giggle with one hand, eyes following the ball` · `{AREA}` = `the left background, on the bleachers` · `{OUTFIT}` = `{OUTFIT_OWN}`

---

### Página 03: O passe certeiro
**Texto:** Uma bola quicou para fora da quadra… e quem devolveu foi {NOME}, com um passe certeiro!

**A. Cena base:**
```
Scene 03. Luna stands at the edge of the court with both paws open, catching a basketball that arrives from the left side of the page with motion lines. Pip, Bo, Dot and Milo turn their heads toward the left, surprised and impressed.
RESERVED AREA: left third of the page, full-body size, at the same ground level as the team.
```
**B. Inserção:** `{ACTION}` = `having just thrown a two-handed chest pass, arms stretched forward, proud little smile` · `{AREA}` = `the left third of the page` · `{OUTFIT}` = `{OUTFIT_OWN}`

**Lembrancinha:** {NOME} chegou com um passe certeiro!

---

### Página 04: O convite
**Texto:** "Joga com a gente?", perguntou Luna. {NOME} topou antes de a Luna terminar a pergunta.

**A. Cena base:**
```
Scene 04. Luna holds a basketball out with both paws toward the right side, inviting. Behind her, Pip, Bo, Dot and Milo smile and wave. Simple court and the hoop in the background.
RESERVED AREA: right side, full-body size, facing Luna.
```
**B. Inserção:** `{ACTION}` = `stepping forward with both hands out to take the ball, big excited smile` · `{AREA}` = `the right side, facing Luna` · `{OUTFIT}` = `{OUTFIT_OWN}`

**Lembrancinha:** Luna chamou {NOME} para o time.

---

### Página 05: Este é o time
**Texto:** Bo pegava os rebotes, Luna pensava nas jogadas, Dot reparava em tudo e Milo fazia piada. E o Pip só queria a bola.

**A. Cena base:**
```
Scene 05. A friendly line-up on the court: Bo jumps for a rebound under the hoop, Luna holds a picture-only clipboard, Dot looks around attentively, Milo pulls a funny face, and Pip hugs the basketball tightly to his chest with a stubborn little frown.
RESERVED AREA: lower left foreground, full-body size.
```
**B. Inserção:** `{ACTION}` = `watching Pip with a gentle, amused smile, hands on knees` · `{AREA}` = `the lower left foreground` · `{OUTFIT}` = `{OUTFIT_OWN}`

---

### Página 06: Livre, livre, livre
**Texto:** No jogo-treino, {NOME} ficou livre, livre, livre. Mas o Pip arremessou sozinho de novo.

**A. Cena base:**
```
Scene 06. Pip shoots the basketball from far away, eyes only on the hoop. Luna points toward the right side of the court as if saying 'pass!'. Bo and Dot shrug. Milo covers his eyes.
RESERVED AREA: right side, near the hoop, full-body size, with open space around it.
```
**B. Inserção:** `{ACTION}` = `standing completely open near the hoop, both arms raised and waving to ask for the ball` · `{AREA}` = `the right side, near the hoop` · `{OUTFIT}` = `{OUTFIT_OWN}`

**Lembrancinha:** {NOME} ficou livre!

---

### Página 07: Tóin!
**Texto:** A bola bateu no aro, tóin!, quicou na cabeça do Bo e caiu no colo do Milo. Todo mundo riu, menos o Pip.

**A. Cena base:**
```
Scene 07. Comic moment, no injury: the basketball bounces softly off Bo's head (small motion lines, Bo with a silly surprised face) toward Milo, who sits on the court and catches it in his lap, laughing. Luna and Dot laugh. Pip crosses his arms with a frown under the hoop.
RESERVED AREA: left foreground, full-body size.
```
**B. Inserção:** `{ACTION}` = `laughing with both hands on the belly` · `{AREA}` = `the left foreground` · `{OUTFIT}` = `{OUTFIT_OWN}`

---

### Página 08: Quica, olha e passa
**Texto:** {NOME} ensinou um truque: "Quica, olha e passa!" Luna desenhou na prancheta um lugar para cada um do time.

**A. Cena base:**
```
Scene 08. Side view on the court. Luna holds up a picture-only clipboard showing five small circles and arrows. Pip, Bo, Dot and Milo lean in to look. A basketball rests on the court near the right side.
RESERVED AREA: right side, full-body size, next to the ball.
```
**B. Inserção:** `{ACTION}` = `dribbling the basketball with one hand while looking up at the team, the other hand pointing forward as if passing` · `{AREA}` = `the right side, next to the ball` · `{OUTFIT}` = `{OUTFIT_OWN}`

**Lembrancinha:** Quica, olha e passa!

---

### Página 09: A camisa
**Texto:** No fim do treino, Bo trouxe uma surpresa: uma regata com a patinha do time, do tamanho certinho de {NOME}.

**A. Cena base:**
```
Scene 09. Bo, smiling, has both open paws extended toward the right as if he has just handed something over. Pip, Luna, Dot and Milo clap happily around him. Late-afternoon court, the bleachers behind them.
RESERVED AREA: right side, full-body size, close to Bo's hands.
```
**B. Inserção:** `{ACTION}` = `holding up a Little Paws basketball tank-top jersey with the outlined paw emblem in both hands, delighted, eyes sparkling` · `{AREA}` = `the right side, close to Bo` · `{OUTFIT}` = `{OUTFIT_OWN}` *(ainda com a própria roupa: a regata está nas mãos)*

**Lembrancinha:** Uma regata só para {NOME}!

---

### Página 10: Dia do torneio
**Texto:** Chegou o dia do torneio! A quadra estava cheia de bandeirinhas e de torcida, e a Vovó Ursa acenava da primeira fila.

**A. Cena base:**
```
Scene 10. The Little Paws team walks onto the court in uniform: Pip bouncing ahead with the ball, Bo, Luna, Dot and Milo. One string of plain pennant flags above. On the bleachers, Grandma Bear waves from the front row among a few simple cheering animals.
RESERVED AREA: center of the walking group, between Pip and Luna, full-body size.
```
**B. Inserção:** `{ACTION}` = `walking proudly with the team, waving to the crowd` · `{AREA}` = `the center of the group, between Pip and Luna` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** Dia de torneio na praça!

---

### Página 11: Os Stripes
**Texto:** Do outro lado estavam Zuzu e os Stripes, rapidinhos que só. Antes de começar, todo mundo se cumprimentou.

**A. Cena base:**
```
Scene 11. Medium shot at the center of the court. Pip shakes paws with Zuzu the squirrel captain. Behind Zuzu: beaver, deer (no antlers), otter and badger in striped tank tops. Behind Pip: Bo, Luna, Dot and Milo. Generous spacing, everyone smiling.
RESERVED AREA: left foreground, in front of the Little Paws group, full-body size.
```
**B. Inserção:** `{ACTION}` = `giving a friendly high five to the otter of the other team` · `{AREA}` = `the left foreground` · `{OUTFIT}` = `{OUTFIT_TEAM}`

---

### Página 12: Os Stripes na frente
**Texto:** Zuzu fazia cesta, cesta e mais cesta. No intervalo, os Stripes estavam na frente.

**A. Cena base:**
```
Scene 12. Zuzu leaps toward the hoop and the basketball drops through the net. The Stripes cheer politely in the background. Pip stands still with drooping ears, Bo and Dot look worried.
RESERVED AREA: right middle ground, full-body size.
```
**B. Inserção:** `{ACTION}` = `watching the ball go in, a little worried but determined, fists closed` · `{AREA}` = `the right middle ground` · `{OUTFIT}` = `{OUTFIT_TEAM}`

---

### Página 13: No intervalo (página do superpoder)
**Texto, primeira frase (fixa):** No intervalo, o time estava cabisbaixo.

**Texto, segunda frase (conforme `{SUPERPODER}`):**

| `{SUPERPODER}` | Texto | `{ACTION}` |
|---|---|---|
| `coragem` | Então {NOME} disse: "Eu também tô com frio na barriga… mas a gente consegue virar!" | `standing tall in front of the team, one fist raised, determined smile` |
| `criatividade` | Então {NOME} pegou a prancheta da Luna e desenhou uma jogada em que todo mundo tocava na bola. | `holding Luna's clipboard and drawing on it with a pencil, excited idea face` |
| `gentileza` | Então {NOME} sentou ao lado do Pip: "Ninguém joga sozinho. E ninguém fica sozinho também." | `sitting on the bench right next to Pip, a kind look, one hand gently on Pip's shoulder` |
| `bom_humor` | Então {NOME} fez a dança do quica-quica. Até o Pip deu risada! | `doing a silly bouncing dance, pretending to dribble an invisible ball, tongue out playfully` |
| `curiosidade` | Então {NOME} contou uma descoberta: "A Zuzu sempre dribla para a esquerda!" | `pointing toward the court with one hand, the other hand by the mouth as if sharing a secret, curious eyes` |

**A. Cena base:**
```
Scene 13. Half-time by the wooden bench at the side of the court. Pip sits at the LEFT end of the bench, looking down. Luna stands holding her picture-only clipboard slightly out to the side. Bo, Dot and Milo stand around with drooping ears and worried faces.
RESERVED AREA: the right end of the bench and the space just in front of it, large enough for a standing OR sitting child.
```
**B. Inserção:** `{ACTION}` = conforme a tabela · `{AREA}` = `the right end of the bench / just in front of it` · `{OUTFIT}` = `{OUTFIT_TEAM}`

> ✔️ **Teste de produção:** gere esta página com os cinco superpoderes nos 3 personagens de teste antes de lançar o tema.

---

### Página 14: O passe do Pip
**Texto:** No último minuto, o Pip estava com a bola. Ele olhou para o aro… e passou para {NOME}!

**A. Cena base:**
```
Scene 14. Pip, mid-court, has just passed the basketball toward the right with a two-handed pass and motion lines, a big generous smile on his face. Zuzu reaches out but too late (no contact). Luna and Milo cheer in the background.
RESERVED AREA: right side, full-body size, in the ball's path, near the hoop.
```
**B. Inserção:** `{ACTION}` = `catching the basketball with both hands, surprised and happy` · `{AREA}` = `the right side, near the hoop` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** Pip passou para {NOME}!

---

### Página 15: Quica, olha e arremessa
**Texto:** {NOME} quicou, olhou e arremessou bem alto, com o time inteiro torcendo.

**A. Cena base:**
```
Scene 15. Under the hoop, seen slightly from below. Pip, Bo, Luna, Dot and Milo watch upward with hopeful faces, paws together. The ring and net are at the top right. Do NOT draw any ball.
RESERVED AREA: left foreground, full-body size, room for a jumping shot with arms raised.
```
**B. Inserção:** `{ACTION}` = `jumping and releasing a high shot toward the hoop, the basketball just leaving the fingertips with motion lines` · `{AREA}` = `the left foreground` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** {NOME} arremessou bem alto!

---

### Página 16: Chuá!
**Texto:** Chuá! O time venceu por um ponto, e o Pip abraçou {NOME}: "Jogar em time é bem melhor!"

**A. Cena base:**
```
Scene 16. Joyful celebration on the court: the basketball drops through the net in the background. Pip, Bo, Luna, Dot and Milo jump with arms up in a loose circle. Zuzu and the Stripes clap kindly at the side; Grandma Bear cheers on the bleachers. Pennant flags above. No scoreboard.
RESERVED AREA: the center of the circle, full-body size, slightly raised as if jumping.
```
**B. Inserção:** `{ACTION}` = `jumping with both arms up in the middle of the team, being hugged by Pip, huge smile` · `{AREA}` = `the center of the circle` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** Cesta! Valeu por vir à minha festa!

---

## 6. Regras de texto

As do modelo (seção 6 do `futebol-little-paws.md`). Neste tema, cuidado com "livre" (neutro, ok), "nervoso" (evitado: a página 13 usa "frio na barriga") e "sozinho" (só aplicado ao Pip ou como regra geral, "ninguém fica sozinho").

---

## 7. Estrutura dos produtos

Igual ao modelo (seção 7). O que muda:

- **Capa do Presente:** "{NOME} entra na quadra!" + "Uma aventura de basquete com a turma Little Paws".
- **Lembrancinha (9 páginas):** **03, 04, 06, 08, 09, 10, 14, 15 e 16**.
- **Certificado:** "**Certificado oficial:** {NOME} faz parte do Time Little Paws de basquete! Superpoder: **{SUPERPODER_NOME}**."

```
Certificate page base. Portrait 2:3. A large outlined paw-emblem shield at the top center, with a small basketball and hoop drawn beside it. Below it, a big empty rounded rectangle frame (left completely white inside, for the child to draw). Pip, Bo, Luna, Dot and Milo peek around the edges of the frame in basketball uniforms, waving. Thick black outlines, white interiors. Leave the top 25% under the shield white for text. No text.
```

### Capa

```
Cover base. Portrait 2:3. Pip, Bo, Luna, Dot and Milo in Little Paws basketball uniforms pose happily on the court around a basketball, the hoop behind them and pennant flags above. Leave the top 30% empty for the title (typeset later).
RESERVED AREA: front and center, standing right behind the ball, full-body size, the biggest figure focus of the composition.
[Line version:] thick black outlines, white interiors, no gray.
[Color version:] soft crayon-like flat colors, warm and cheerful; same composition and outlines.
```

**B. Inserção:** `{ACTION}` = `standing proudly in front center, spinning the basketball on one finger, big confident smile` · `{OUTFIT}` = `{OUTFIT_TEAM}`. Na versão colorida, a frase de cor do modelo.

---

## 8. Checagem específica do tema

Além da checagem do modelo (seção 8):
- [ ] Bola de basquete só com as linhas de costura, nunca preenchida de preto.
- [ ] Nenhum número em regata, placar ou tabela.
- [ ] Os Stripes de regata listrada, sem patinha; nunca um segundo guaxinim.
- [ ] Nas páginas 14 a 16, a bola está com a criança ou no aro, nunca duas bolas.

---

## 9. Modelo para o app (JSON)

Mesmo formato do modelo, com:

```json
{
  "template_id": "basquete-little-paws-v1",
  "language": "pt-BR",
  "title": "{NOME} entra na quadra!",
  "subtitle": "Uma aventura de basquete com a turma Little Paws",
  "outfit_switch_page": 10,
  "lembrancinha_pages": [3, 4, 6, 8, 9, 10, 14, 15, 16]
}
```
