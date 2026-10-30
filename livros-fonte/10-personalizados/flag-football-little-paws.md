# {NOME} e a grande jogada
## Tema personalizado de flag football com a turma Little Paws: história, cenas base e prompts de inserção do personagem

**Produto:** Meu Livrinho de Colorir · **Idioma do livro:** português do Brasil · **Idade:** 3 a 8 anos
**Formatos:** Livrinho Presente (20 páginas) e Lembrancinha (12 páginas), em A5 e A4
**Esporte:** flag football (sem contato: para parar quem corre, puxa-se uma fita do cinto)
**Livro de origem:** *Little Paws, Big Play* (`02-little-paws-big-play/`)
**Modelo e seções comuns:** `futebol-little-paws.md` e `README.md` desta pasta

---

## 1. A ideia em uma frase

Zuzu e os Stripes chamam a turma para um jogo de flag football, mas eles são seis e a turma só cinco. **{NOME}** pega uma fita amarela que voou com o vento e entra no time. O Bo, grandão, não consegue puxar as fitas com jeito; com a cesta de ovos da Vovó Ursa, ele e {NOME} descobrem que "patas grandes podem ser patas gentis". No último lance, o Bo para a Zuzu com um puxão gentil e o Pip lança a bola para {NOME} fazer o touchdown.

**A lição do livro de origem continua:** quem aprende a força gentil é o Bo. A criança é a companhia na hora triste e na cena dos ovos, e é quem recebe a bola no final.

**Explicar o esporte:** flag football é pouco conhecido no Brasil. As páginas 05 e 06 mostram a regra (puxar a fita, ninguém derruba ninguém) de um jeito que a criança entende sem saber o nome do jogo.

---

## 2. Como produzir

Igual ao modelo (seção 2 do `futebol-little-paws.md`). Na produção do tema:

1. Gerar e aprovar a **ficha do time no uniforme de flag football** (seção 4.3). Pode usar como referência de estilo a ficha aprovada do *Big Play* (versão colorida), redesenhada em contorno.
2. Gerar e aprovar a **ficha do cenário**: o campo do parque, cones laranja, árvore grande, banco, cooler e mesa de piquenique; e a cozinha da Vovó Ursa.
3. Gerar as **16 cenas base, a capa e o certificado**.
4. Testar a inserção com os 3 personagens fictícios e com os cinco superpoderes da página 13.

---

## 3. Variáveis específicas

| Variável | Valor |
|---|---|
| `{OUTFIT_TEAM}` | `the Little Paws flag football uniform: short-sleeve T-shirt with the outlined paw emblem, shorts, sneakers and a flag belt with two fabric flags hanging at the hips, plus the same glasses and hair accessories from the sheet` |
| `{OUTFIT_OWN_BELT}` | `{OUTFIT_OWN}` + `with a flag belt with two fabric flags at the hips` (páginas 04 a 08, quando a criança já joga, mas ainda sem a camisa) |

**Troca de roupa:**
- Páginas 1 a 3: `{OUTFIT_OWN}`.
- Páginas 4 a 9: `{OUTFIT_OWN_BELT}` (na página 08, na cozinha da vovó, sem o cinto: `{OUTFIT_OWN}`).
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
Follow the approved Little Paws flag football reference sheet exactly: faces, markings, relative heights, uniforms, flag belts and accessories.
FLAG FOOTBALL RULES: safe, non-contact game. Nobody tackles, pushes, blocks or wears helmets or pads. Every player in uniform wears a flag belt with two flags, one on each hip. The ball is an American football drawn with outlined laces only, never filled black.
Leave the RESERVED AREA described in the scene completely empty (plain white background, no props, no characters, no grass lines inside it): a new character will be added there later.
Do not draw the same character twice. Natural anatomy, believable actions, no injuries. Original characters only, no professional team branding.
```

**Variante para 2 a 4 anos:** acrescente `Extra-thick outlines, even bigger shapes, fewer background elements.`

### 4.2 Elenco fixo (character bible)

As regras visuais do modelo (seção 4.2), com os papéis do *Big Play*:

| Personagem | Papel no time |
|---|---|
| **Bo** (urso) | O maior do time; patas grandes, gentil; aprende a puxar a fita com cuidado |
| **Pip** (coelho) | Quarterback, lança a bola |
| **Luna** (raposa) | Explica as regras e planeja; prancheta só com desenhos |
| **Dot** (tartaruga) | Calma, sábia |
| **Milo** (guaxinim) | Comediante; no *Big Play*, brinca que a cauda listrada é a "terceira fita" |

**Uniforme Little Paws de flag football:** camiseta de manga curta com o **emblema de patinha** contornado, shorts, tênis e **cinto com duas fitas**, uma em cada lado do quadril. Sem capacete, sem proteções, sem números.

**Vovó Ursa (páginas 08, 10 e 16):** avó do Bo, redonda e gentil, óculos redondos, vestido e avental florido.

**Adversários: Zuzu e os Stripes.** Zuzu (esquilo, capitã, rabo grande enrolado, muito rápida), castor, cervo **sem chifres**, lontra, texugo e mais um esquilinho (para serem seis). Camiseta com **listras horizontais**, cinto com duas fitas, nunca o emblema de patinha.

**Cenários:**
- o parque com campo de grama, **cones** marcando as pontas, árvore grande, banco, cooler e mesa de piquenique;
- a cozinha da Vovó Ursa (só na página 08).

### 4.3 Prompt da ficha do time (produção, não é página do livro)

```
Create one reference sheet on a white background showing Pip, Bo, Luna, Dot and Milo in their fixed Little Paws FLAG FOOTBALL uniforms (short-sleeve T-shirt with the outlined paw emblem, shorts, sneakers, and a flag belt with two fabric flags hanging at the hips), following the character bible exactly. For each character: front and three-quarter views, both flags clearly visible, consistent relative heights, neutral and happy expressions. Clean black coloring-book line art, no gray, no color, no labels. Characters separate and fully visible. This is a production asset, not a book page.
```

### 4.4 Prompt de inserção

O mesmo do modelo (seção 4.4 do `futebol-little-paws.md`).

---

## 5. A história, página a página

---

### Página 01: O desafio
**Texto:** Zuzu e os Stripes chamaram a turma para um jogo de flag football. Mas eles eram seis, e a turma só cinco! *(Psiu… tem alguém atrás do cooler!)*

**A. Cena base:**
```
Scene 01. In the park, Zuzu the squirrel holds out an American football toward Pip with a friendly challenge smile; five other Stripes players stand behind her. Pip counts on his fingers, puzzled. A cooler and a picnic table on the right side.
RESERVED AREA: right side, behind the cooler, about 25% of the page height. Leave it empty.
```
**B. Inserção:** `{ACTION}` = `peeking out from behind the cooler, only the head and hands visible, curious smile` · `{AREA}` = `the right side, behind the cooler` · `{OUTFIT}` = `{OUTFIT_OWN}`

---

### Página 02: Falta um!
**Texto:** "Falta um jogador!", disse Pip, contando nos dedos de novo. *(Atrás da mesa de piquenique, alguém espiava…)*

**A. Cena base:**
```
Scene 02. Pip faces Bo, Luna, Dot and Milo on the grass, holding up five fingers with a worried face. Bo scratches his head, Luna taps her chin, Dot listens, Milo twirls his striped tail. A wooden picnic table in the left background.
RESERVED AREA: behind the picnic table in the left background, small (about 20% of page height).
```
**B. Inserção:** `{ACTION}` = `crouching behind the picnic table, eyes and hair peeking over the tabletop` · `{AREA}` = `the left background, behind the picnic table` · `{OUTFIT}` = `{OUTFIT_OWN}`

---

### Página 03: A fita que voou
**Texto:** Nessa hora, uma fita amarela voou com o vento… e quem pegou foi {NOME}!

**A. Cena base:**
```
Scene 03. A small box of flag belts sits open on the grass; one long fabric flag is flying away to the left with wind lines. Pip, Bo, Luna, Dot and Milo turn to look toward the left side, surprised.
RESERVED AREA: left third of the page, full-body size, at the same ground level as the team.
```
**B. Inserção:** `{ACTION}` = `jumping to catch the flying fabric flag with one hand, joyful` · `{AREA}` = `the left third of the page` · `{OUTFIT}` = `{OUTFIT_OWN}`

**Lembrancinha:** {NOME} pegou a fita!

---

### Página 04: O convite
**Texto:** "Quer jogar com a gente?", perguntou Bo. {NOME} prendeu o cinto de fitas na hora.

**A. Cena base:**
```
Scene 04. Bo kneels down kindly and holds out a flag belt toward the right side with both big paws. Pip, Luna, Dot and Milo smile behind him. Simple park grass and two cones.
RESERVED AREA: right side, full-body size, facing Bo.
```
**B. Inserção:** `{ACTION}` = `fastening a flag belt around the waist, big excited smile` · `{AREA}` = `the right side, facing Bo` · `{OUTFIT}` = `{OUTFIT_OWN_BELT}`

**Lembrancinha:** Bo chamou {NOME} para o time.

---

### Página 05: Só as fitas
**Texto:** Luna explicou: "Aqui ninguém derruba ninguém. Para parar quem corre, é só puxar uma fita!"

**A. Cena base:**
```
Scene 05. Luna, like a little teacher, holds up a flag belt with two long flags and points at one flag. Pip runs past in the background with a flag streaming from his hip; Dot gently pulls it off. Bo watches, surprised, looking at his own big paws. Milo watches.
RESERVED AREA: lower left foreground, full-body size.
```
**B. Inserção:** `{ACTION}` = `listening carefully and practicing, holding one flag of their own belt` · `{AREA}` = `the lower left foreground` · `{OUTFIT}` = `{OUTFIT_OWN_BELT}`

---

### Página 06: Ops, Bo!
**Texto:** No treino, o Bo esticou os braços e, ops, levantou o Pip do chão em vez de puxar a fita!

**A. Cena base:**
```
Scene 06. Gentle comic moment, no injury: Bo has lifted Pip in a careful bear hug; Pip's feet dangle in the air while he still holds the football, startled but unhurt. Luna and Dot cover their mouths. Two cones on the grass.
RESERVED AREA: right side, full-body size.
```
**B. Inserção:** `{ACTION}` = `laughing with both hands on the cheeks` · `{AREA}` = `the right side` · `{OUTFIT}` = `{OUTFIT_OWN_BELT}`

**Lembrancinha:** Ops, Bo! Era só a fita!

---

### Página 07: Patas grandes demais
**Texto:** "Minhas patas são grandes demais", suspirou o Bo, sentado na grama. {NOME} sentou do lado dele.

**A. Cena base:**
```
Scene 07. Bo sits alone on the grass by the big tree, shoulders dropped and ears down, looking at his big paws. A yellow flag lies on the grass. Pip, Luna, Dot and Milo watch from a distance with kind, worried faces.
RESERVED AREA: right side, next to Bo, room for a sitting child.
```
**B. Inserção:** `{ACTION}` = `sitting on the grass right next to Bo, leaning in with a comforting look` · `{AREA}` = `the right side, next to Bo` · `{OUTFIT}` = `{OUTFIT_OWN_BELT}`

---

### Página 08: A cesta de ovos
**Texto:** Na casa da Vovó Ursa, Bo e {NOME} carregaram uma cesta de ovos sem quebrar nenhum. "Patas grandes podem ser patas gentis", disse a vovó.

**A. Cena base:**
```
Scene 08. A cozy kitchen. Grandma Bear smiles warmly, hands clasped. Bo carefully carries a big basket of eggs with both paws, walking on tiptoe with great concentration. A table with a few eggs in a bowl. The right side of the basket handle stays free.
RESERVED AREA: right side, full-body size, right next to Bo, as if helping to hold the basket.
```
**B. Inserção:** `{ACTION}` = `helping to carry the egg basket by the other side of the handle, very careful, tongue out in concentration` · `{AREA}` = `the right side, next to Bo` · `{OUTFIT}` = `{OUTFIT_OWN}`

**Lembrancinha:** Patas grandes, patas gentis!

---

### Página 09: A camisa
**Texto:** Depois do treino, o Bo trouxe uma camiseta do time, com a patinha no peito, do tamanho certinho de {NOME}.

**A. Cena base:**
```
Scene 09. Back in the park at late afternoon. Bo, smiling, has both open paws extended toward the right as if he has just handed something over. Pip, Luna, Dot and Milo clap happily around him. The bench behind them.
RESERVED AREA: right side, full-body size, close to Bo's hands.
```
**B. Inserção:** `{ACTION}` = `holding up a Little Paws T-shirt with the outlined paw emblem in both hands, delighted, eyes sparkling` · `{AREA}` = `the right side, close to Bo` · `{OUTFIT}` = `{OUTFIT_OWN_BELT}`

**Lembrancinha:** Uma camiseta só para {NOME}!

---

### Página 10: Dia do jogo
**Texto:** Chegou o dia do jogo! O campo estava cheio de cones e de torcida, e a Vovó Ursa acenava da primeira fila.

**A. Cena base:**
```
Scene 10. The Little Paws team walks onto the field in uniform with flag belts: Pip with the football, Bo, Luna, Dot and Milo. Cones mark the ends of the field. Grandma Bear waves from a picnic blanket in front of a few simple cheering animals.
RESERVED AREA: center of the walking group, between Bo and Luna, full-body size.
```
**B. Inserção:** `{ACTION}` = `walking proudly with the team, both flags swinging at the hips, waving to Grandma Bear` · `{AREA}` = `the center of the group, between Bo and Luna` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** Dia de jogo no parque!

---

### Página 11: Hut! Hut!
**Texto:** "Hut! Hut!", gritou o Pip. O jogo contra Zuzu e os Stripes começou.

**A. Cena base:**
```
Scene 11. Start of the game: Pip crouches behind the line with the football, calling the play. Bo, Luna, Dot and Milo are ready in a line. Facing them, Zuzu and the Stripes smile, ready. Generous spacing, no contact.
RESERVED AREA: left foreground, in the Little Paws line, full-body size.
```
**B. Inserção:** `{ACTION}` = `crouching in a ready position, focused and smiling` · `{AREA}` = `the left foreground, in the Little Paws line` · `{OUTFIT}` = `{OUTFIT_TEAM}`

---

### Página 12: Zum!
**Texto:** Zuzu corria tão rápido que ninguém conseguia pegar a fita dela. Os Stripes marcaram primeiro.

**A. Cena base:**
```
Scene 12. Zuzu zooms past with the football, speed lines behind her, both flags fluttering. Bo reaches for a flag and grabs only air, a surprised face. The Stripes cheer politely near the cones at the end of the field.
RESERVED AREA: right middle ground, full-body size.
```
**B. Inserção:** `{ACTION}` = `running after Zuzu, one hand reaching for the flag but too far away` · `{AREA}` = `the right middle ground` · `{OUTFIT}` = `{OUTFIT_TEAM}`

---

### Página 13: No intervalo (página do superpoder)
**Texto, primeira frase (fixa):** No intervalo, o time estava cabisbaixo.

**Texto, segunda frase (conforme `{SUPERPODER}`):**

| `{SUPERPODER}` | Texto | `{ACTION}` |
|---|---|---|
| `coragem` | Então {NOME} disse: "Eu também tô com frio na barriga… mas a gente pode tentar de novo!" | `standing tall in front of the team, one fist raised, determined smile` |
| `criatividade` | Então {NOME} pegou a prancheta da Luna e desenhou uma jogada em que o Bo abria o caminho para o Pip. | `holding Luna's clipboard and drawing on it with a pencil, excited idea face` |
| `gentileza` | Então {NOME} sentou ao lado do Bo: "Lembra dos ovos? Patas gentis!" | `sitting on the bench right next to Bo, a kind look, one hand gently on Bo's big paw` |
| `bom_humor` | Então {NOME} imitou uma galinha cuidando dos ovos. Até o Bo deu risada! | `flapping elbows like chicken wings, one foot up, silly face` |
| `curiosidade` | Então {NOME} contou uma descoberta: "A Zuzu sempre vira para a direita antes de correr!" | `pointing toward the field with one hand, the other hand by the mouth as if sharing a secret, curious eyes` |

**A. Cena base:**
```
Scene 13. Half-time by the wooden bench next to the cooler. Bo sits at the LEFT end of the bench, looking at his paws. Luna stands holding her picture-only clipboard slightly out to the side. Pip, Dot and Milo stand around with drooping ears and worried faces.
RESERVED AREA: the right end of the bench and the space just in front of it, large enough for a standing OR sitting child.
```
**B. Inserção:** `{ACTION}` = conforme a tabela · `{AREA}` = `the right end of the bench / just in front of it` · `{OUTFIT}` = `{OUTFIT_TEAM}`

> ✔️ **Teste de produção:** gere esta página com os cinco superpoderes nos 3 personagens de teste antes de lançar o tema.

---

### Página 14: Patas gentis
**Texto:** No último lance, a Zuzu disparou. O Bo lembrou da cesta de ovos e puxou a fita dela com todo o cuidado!

**A. Cena base:**
```
Scene 14. Bo gently pulls one yellow flag from Zuzu's belt with a soft, careful paw, a proud smile; Zuzu stops, laughing, impressed. Nobody touches anybody else. Luna and Milo cheer in the background.
RESERVED AREA: right side, full-body size, cheering close to Bo.
```
**B. Inserção:** `{ACTION}` = `cheering for Bo with both arms up, mouth open in a happy shout` · `{AREA}` = `the right side, close to Bo` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** O Bo puxou a fita com cuidado, e {NOME} vibrou!

---

### Página 15: O lançamento
**Texto:** O Pip lançou a bola bem alto… e {NOME} pegou, correndo para os cones!

**A. Cena base:**
```
Scene 15. Pip has just thrown the football high toward the right with a long curved motion line. Bo, Luna, Dot and Milo watch the ball's path with hopeful faces. The orange cones of the end zone are at the right side. Do NOT draw the ball at the end of its path.
RESERVED AREA: right side, near the cones, full-body size, room for a running catch.
```
**B. Inserção:** `{ACTION}` = `catching the football while running, both hands up, flags flying at the hips` · `{AREA}` = `the right side, near the cones` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** {NOME} pegou a bola!

---

### Página 16: Touchdown!
**Texto:** TOUCHDOWN! O jogo terminou empatado, e os dois times comemoraram juntos com laranjas no piquenique.

**A. Cena base:**
```
Scene 16. Joyful celebration by the picnic table under the big tree: Pip, Bo, Luna, Dot and Milo jump with arms up in a loose circle; Zuzu and the Stripes share a bowl of orange slices nearby, laughing; Grandma Bear claps. The football rests on the grass. No scoreboard.
RESERVED AREA: the center of the circle, full-body size, slightly raised as if jumping.
```
**B. Inserção:** `{ACTION}` = `jumping with the football held high in both hands, huge smile` · `{AREA}` = `the center of the circle` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** Touchdown! Valeu por vir à minha festa!

---

## 6. Regras de texto

As do modelo (seção 6 do `futebol-little-paws.md`). Neste tema:
- "sentado" (página 07) se refere ao Bo, não à criança.
- "Hut! Hut!" e "touchdown" ficam em inglês: são os gritos do jogo, como no *Big Play*.

---

## 7. Estrutura dos produtos

Igual ao modelo (seção 7). O que muda:

- **Capa do Presente:** "{NOME} e a grande jogada" + "Uma aventura de flag football com a turma Little Paws".
- **Lembrancinha (9 páginas):** **03, 04, 06, 08, 09, 10, 14, 15 e 16**.
- **Certificado:** "**Certificado oficial:** {NOME} faz parte do Time Little Paws de flag football! Superpoder: **{SUPERPODER_NOME}**."

```
Certificate page base. Portrait 2:3. A large outlined paw-emblem shield at the top center, with two crossed fabric flags behind it. Below it, a big empty rounded rectangle frame (left completely white inside, for the child to draw). Pip, Bo, Luna, Dot and Milo peek around the edges of the frame in flag football uniforms, waving. Thick black outlines, white interiors. Leave the top 25% under the shield white for text. No text.
```

### Capa

```
Cover base. Portrait 2:3. Pip, Bo, Luna, Dot and Milo in Little Paws flag football uniforms with flag belts pose happily on the park field, Bo holding up one flag gently, cones and the big tree behind them. Leave the top 30% empty for the title (typeset later).
RESERVED AREA: front and center, full-body size, the biggest figure focus of the composition.
[Line version:] thick black outlines, white interiors, no gray.
[Color version:] soft crayon-like flat colors, warm and cheerful; same composition and outlines.
```

**B. Inserção:** `{ACTION}` = `standing proudly in front center holding the football under one arm, the other hand on the hip, big confident smile` · `{OUTFIT}` = `{OUTFIT_TEAM}`.

---

## 8. Checagem específica do tema

Além da checagem do modelo (seção 8):
- [ ] Ninguém derruba, empurra ou agarra outro jogador (a página 06 é o único "erro cômico", com o Pip no colo, sem machucar).
- [ ] Cada jogador de uniforme tem **as duas fitas** no cinto.
- [ ] Bola de futebol americano só com o contorno e os cadarços, nunca preenchida.
- [ ] Página 08 na cozinha, sem cinto de fitas na criança.

---

## 9. Modelo para o app (JSON)

```json
{
  "template_id": "flag-football-little-paws-v1",
  "language": "pt-BR",
  "title": "{NOME} e a grande jogada",
  "subtitle": "Uma aventura de flag football com a turma Little Paws",
  "outfit_switch_page": 10,
  "lembrancinha_pages": [3, 4, 6, 8, 9, 10, 14, 15, 16]
}
```
