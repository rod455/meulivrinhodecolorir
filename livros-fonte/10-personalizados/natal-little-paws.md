# O Natal de {NOME} com a turma
## Tema personalizado de Natal com a turma Little Paws: história, cenas base e prompts de inserção do personagem

**Produto:** Meu Livrinho de Colorir · **Idioma do livro:** português do Brasil · **Idade:** 3 a 8 anos
**Formatos:** Livrinho Presente (20 páginas) e Lembrancinha (12 páginas), em A5 e A4
**Tema:** Natal no parque nevado da turma
**Livro de origem:** *Little Paws, Big Christmas* (`03-little-paws-big-christmas/`)
**Modelo e seções comuns:** `futebol-little-paws.md` e `README.md` desta pasta

---

## 1. A ideia em uma frase

Na primeira neve do ano, o trenó da Dot para no meio do morro, e quem desce para dar um empurrãozinho é **{NOME}**. Os dois pintam juntos a estrela da árvore de Natal do parque. Na véspera, o vento leva a estrela; todo mundo corre rápido para todo lado e ninguém acha. A Dot, andando devagar ao lado de {NOME}, repara numa trilha de purpurina na neve, e a estrela volta para o topo da árvore a tempo da visita do Papai Noel.

**A lição do livro de origem continua:** quem descobre que ir devagar também é bom é a Dot. A criança é a amiga que pinta a estrela com ela, a consola e caminha ao lado dela na busca.

**Não é sobre esporte:** a "roupa do time" deste tema é o **suéter da turma** que a Vovó Ursa dá na página 09.

> **Decisão do dono:** o site já tem um tema "Natal mágico" sem a turma. Este pode substituir aquele ou entrar ao lado (veja o `README.md`).

---

## 2. Como produzir

Igual ao modelo (seção 2 do `futebol-little-paws.md`). Na produção do tema:

1. Gerar e aprovar a **ficha da turma na roupa de inverno** (seção 4.3).
2. Gerar e aprovar a **ficha do cenário**: o parque nevado, o morrinho de trenó, a árvore de Natal grande no centro, o banco e as casinhas com neve; e a sala da Vovó Ursa.
3. Gerar a **ficha da estrela** (a estrela da Dot, sempre igual) e do **cardeal**.
4. Gerar as **16 cenas base, a capa e o certificado**.
5. Testar a inserção com os 3 personagens fictícios e com os cinco superpoderes da página 13.

---

## 3. Variáveis específicas

| Variável | Valor |
|---|---|
| `{OUTFIT_OWN}` (neste tema) | `{OUTFIT_OWN}` + `with a warm winter coat, scarf and snow boots over it` (está nevando) |
| `{OUTFIT_TEAM}` | `the Little Paws winter sweater with the outlined paw emblem, warm pants and snow boots, plus a scarf, and the same glasses and hair accessories from the sheet` |

**Troca de roupa:**
- Páginas 1 a 8: `{OUTFIT_OWN}` com casaco (na página 08, dentro de casa, sem o casaco).
- Páginas 9 a 16, capa e certificado: `{OUTFIT_TEAM}` (o suéter chega na página 09 e a criança já aparece vestida com ele).

---

## 4. Prompt mestre e fichas

### 4.1 Prompt mestre (vale para todas as cenas base)

```
Create ONE original children's coloring-book page for the requested scene only. Portrait 2:3 canvas, to be printed at A5 and A4. Highest available resolution.
Clean, confident, thick black outlines on a pure white background. Entirely uncolored interiors. No gray, shading, gradients, hatching, solid black fills, textures, watermarks, logos, borders, panels or collage. Hair and fur are outlines only; every enclosed area stays white for the child to color. Snow is shown with a few outlined snowdrifts and simple outlined snowflakes, never with gray.
Large closed shapes, rounded friendly forms, readable facial expressions, simple backgrounds with generous open areas. No tiny patterns. One clear story action per page.
Keep important artwork inside 7% margins. Keep the bottom 22% of the canvas completely white: the story text will be typeset there later.
No text, letters, numbers, speech bubbles or signs with writing. Letters to Santa show only wavy lines and little pictures.
Follow the approved Little Paws winter reference sheet exactly: faces, markings, relative heights, winter clothes and accessories. Dot's star always looks the same.
SAFETY: sledding on a gentle, open hill with no obstacles. No crashes, no injuries, no frozen ponds. Fire only inside a fireplace behind a screen.
Leave the RESERVED AREA described in the scene completely empty (plain white background, no props, no characters, no snow lines inside it): a new character will be added there later.
Do not draw the same character twice. Natural anatomy, believable actions. Original characters only. Santa Claus is the classic, round and friendly one, with no brand.
```

**Variante para 2 a 4 anos:** acrescente `Extra-thick outlines, even bigger shapes, fewer background elements.`

### 4.2 Elenco fixo (character bible)

As regras visuais do modelo (seção 4.2), com as roupas e os acessórios do *Big Christmas*:

| Personagem | Neste tema |
|---|---|
| **Dot** (tartaruga) | A mais devagar; pinta com capricho; **gorro com uma estrelinha** |
| **Pip** (coelho) | Rapidinho; gorro com pompom, orelhas saindo por cima |
| **Bo** (urso) | Protetor de orelha; carrega a escada; patas gentis |
| **Luna** (raposa) | Cachecol listrado; organiza as luzes |
| **Milo** (guaxinim) | Gorro com a faixa por cima; come os biscoitos |
| **Vovó Ursa** | Páginas 08, 09 e 16; xale sobre o vestido |
| **Papai Noel** | Só na página 16 |
| **Cardeal** | Passarinho pequeno de topete; só na página 15 |

**Roupa de inverno da turma:** suéter com o **emblema de patinha** contornado, calça, botas de neve e o acessório de cada um.

**A estrela da Dot:** cinco pontas, grande (do tamanho do casco da Dot), com uma borda contornada e cinco bolinhas desenhadas dentro. **Sempre igual.**

**Cenários:**
- o parque coberto de neve, com o morrinho de trenó, pinheiros, banco, postes de luz e casinhas com neve no telhado;
- a **árvore de Natal grande** no centro do parque;
- a sala da Vovó Ursa, com lareira atrás da grade (só na página 08).

### 4.3 Prompt da ficha da turma (produção, não é página do livro)

```
Create one reference sheet on a white background showing Pip, Bo, Luna, Dot and Milo in their fixed Little Paws WINTER clothes (sweater with the outlined paw emblem, warm pants, snow boots) with their signature accessories: Dot's beanie with a little star, Pip's pom-pom hat with his ears through it, Bo's earmuffs, Luna's striped scarf, Milo's beanie with his headband over it. For each character: front and three-quarter views, consistent relative heights, neutral and happy expressions. Also show Dot's big five-pointed Christmas star (outlined border and five little dots inside) on its own. Clean black coloring-book line art, no gray, no color, no labels. This is a production asset, not a book page.
```

### 4.4 Prompt de inserção

O mesmo do modelo (seção 4.4 do `futebol-little-paws.md`).

---

## 5. A história, página a página

---

### Página 01: A primeira neve
**Texto:** A primeira neve cobriu o parque, e a turma correu para brincar! *(Psiu… quem está atrás do boneco de neve?)*

**A. Cena base:**
```
Scene 01. The snowy park: Pip, Luna and Milo run and throw soft snowballs, laughing; Bo builds a snow fort; Dot catches a snowflake on her tongue. A big snowman with a scarf stands at the right side.
RESERVED AREA: right side, partly behind the snowman, about 25% of the page height. Leave it empty.
```
**B. Inserção:** `{ACTION}` = `peeking out from behind the snowman, curious smile, holding a small snowball` · `{AREA}` = `the right side, behind the snowman` · `{OUTFIT}` = `{OUTFIT_OWN}`

---

### Página 02: O trenó que parou
**Texto:** Na corrida de trenó, Pip, Luna e Milo zuniram morro abaixo. O trenó da Dot parou no meio do caminho. *(Lá no alto do morro, alguém acenava…)*

**A. Cena base:**
```
Scene 02. A gentle, open sledding hill. Pip, Luna and Milo zoom down at the bottom on their sleds with speed lines, laughing. Halfway up, Dot sits on her small sled, stopped in the snow, looking a little sad. The top of the hill is on the left side.
RESERVED AREA: the top of the hill in the left background, small (about 20% of page height).
```
**B. Inserção:** `{ACTION}` = `standing at the top of the hill, waving with one arm` · `{AREA}` = `the top of the hill, left background` · `{OUTFIT}` = `{OUTFIT_OWN}`

---

### Página 03: Um empurrãozinho
**Texto:** {NOME} desceu devagarinho e deu um empurrãozinho no trenó da Dot. Lá foi a Dot, rindo morro abaixo!

**A. Cena base:**
```
Scene 03. On the gentle hill, Dot slides down on her sled with small motion lines and a big happy laugh. Behind her sled, on the slope, there is empty space. At the bottom, Pip, Bo, Luna and Milo cheer.
RESERVED AREA: on the slope right behind Dot's sled, full-body size, at the same ground level as the sled.
```
**B. Inserção:** `{ACTION}` = `giving the sled a gentle push with both hands, happy smile` · `{AREA}` = `on the slope, right behind Dot's sled` · `{OUTFIT}` = `{OUTFIT_OWN}`

**Lembrancinha:** {NOME} chegou na neve!

---

### Página 04: O convite
**Texto:** "Quer enfeitar a árvore de Natal com a gente?", perguntou a Dot. {NOME} disse sim antes de a Dot terminar.

**A. Cena base:**
```
Scene 04. At the foot of the big undecorated pine tree in the center of the park, Dot holds out a shiny ball ornament toward the right side, inviting. Pip, Bo, Luna and Milo smile behind her with boxes of decorations.
RESERVED AREA: right side, full-body size, facing Dot.
```
**B. Inserção:** `{ACTION}` = `reaching out with both hands to take the ornament, big excited smile` · `{AREA}` = `the right side, facing Dot` · `{OUTFIT}` = `{OUTFIT_OWN}`

**Lembrancinha:** A Dot chamou {NOME} para enfeitar a árvore.

---

### Página 05: Cada um do seu jeito
**Texto:** Pip pendurava as bolas, Bo segurava a escada, Luna arrumava as luzes e Milo comia os biscoitos. E a Dot pintava, devagarinho.

**A. Cena base:**
```
Scene 05. Decorating the big pine tree: Pip on tiptoe hangs ball ornaments, Bo holds a wooden ladder steady, Luna untangles a string of lights, Milo sneaks a cookie from a plate. In the right foreground, Dot sits at a small table painting a large five-pointed star, slow and careful.
RESERVED AREA: right foreground, full-body size, next to Dot's little table.
```
**B. Inserção:** `{ACTION}` = `leaning over the table, watching Dot paint with admiration` · `{AREA}` = `the right foreground, next to Dot's table` · `{OUTFIT}` = `{OUTFIT_OWN}`

---

### Página 06: A estrela
**Texto:** {NOME} e a Dot pintaram juntos a estrela da árvore, com bolinhas de todas as cores.

**A. Cena base:**
```
Scene 06. Close view at the small table: Dot paints the big star with a brush, adding the little dots, tongue out in concentration. Paint pots on the table. The other friends are not in this scene.
RESERVED AREA: the left side of the table, full-body size from the waist up, sitting.
```
**B. Inserção:** `{ACTION}` = `painting one of the star's points with a brush, proud and focused` · `{AREA}` = `the left side of the table` · `{OUTFIT}` = `{OUTFIT_OWN}`

**Lembrancinha:** Que estrela linda!

---

### Página 07: Rápida como o Pip
**Texto:** "Eu queria ser rápida como o Pip", suspirou a Dot. {NOME} sorriu: "Mas ninguém pinta como você!"

**A. Cena base:**
```
Scene 07. Dot sits on a park bench, head a little tucked into her shell, watching Pip zoom by on a sled in the background. The painted star rests on the bench beside her.
RESERVED AREA: the free end of the bench, room for a sitting child.
```
**B. Inserção:** `{ACTION}` = `sitting next to Dot, pointing at the painted star with a warm smile` · `{AREA}` = `the free end of the bench` · `{OUTFIT}` = `{OUTFIT_OWN}`

---

### Página 08: Cartas para o Papai Noel
**Texto:** Na casa da Vovó Ursa, todo mundo escreveu uma carta para o Papai Noel. {NOME} desenhou a turma inteira na sua.

**A. Cena base:**
```
Scene 08. Grandma Bear's cozy living room: a fireplace behind a screen, a plate of cookies, mugs of hot chocolate. Pip, Bo, Luna, Dot and Milo sit around a low table writing letters (only wavy lines and little doodles on the paper). Grandma Bear smiles in an armchair.
RESERVED AREA: one side of the low table, room for a sitting child.
```
**B. Inserção:** `{ACTION}` = `drawing on a letter with crayons, the drawing shows five little animal shapes` · `{AREA}` = `one side of the low table` · `{OUTFIT}` = `{OUTFIT_OWN}` *(dentro de casa, sem o casaco)*

**Lembrancinha:** Uma carta para o Papai Noel!

---

### Página 09: O suéter
**Texto:** A Vovó Ursa deu a {NOME} um suéter com a patinha da turma, quentinho e do tamanho certinho.

**A. Cena base:**
```
Scene 09. Grandma Bear, smiling, has both open paws extended toward the right as if she has just handed over a gift. Pip, Bo, Luna, Dot and Milo clap happily around her. An open gift box with tissue paper at her feet.
RESERVED AREA: right side, full-body size, close to Grandma Bear's hands.
```
**B. Inserção:** `{ACTION}` = `already wearing the new sweater, hugging oneself with joy, eyes closed, big smile` · `{AREA}` = `the right side, close to Grandma Bear` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** Um suéter só para {NOME}!

---

### Página 10: Véspera de Natal
**Texto:** Na véspera de Natal, o parque brilhava, e a estrela da Dot já estava no topo da árvore.

**A. Cena base:**
```
Scene 10. Night in the snowy park, lamp posts glowing (outlined rays). The big pine tree is fully decorated, with Dot's star on top. Pip, Bo, Luna, Dot and Milo stand in front of it admiring, a few simple animal families behind them.
RESERVED AREA: center of the group, between Dot and Luna, full-body size.
```
**B. Inserção:** `{ACTION}` = `holding Dot's hand and looking up at the star in wonder` · `{AREA}` = `the center of the group, between Dot and Luna` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** Véspera de Natal no parque!

---

### Página 11: Uuuuh!
**Texto:** De repente, uuuuh! Um vento forte arrancou a estrela do topo da árvore e levou para longe.

**A. Cena base:**
```
Scene 11. Big wind lines sweep across the park; the star flies away high to the upper right, spinning. Hats and scarves flap. Pip, Bo, Luna, Dot and Milo look up with open mouths, holding on to their hats.
RESERVED AREA: left middle ground, full-body size.
```
**B. Inserção:** `{ACTION}` = `holding the scarf against the wind with one hand and pointing at the flying star with the other, surprised` · `{AREA}` = `the left middle ground` · `{OUTFIT}` = `{OUTFIT_TEAM}`

---

### Página 12: Rápido, rápido, rápido
**Texto:** Todo mundo correu rápido, rápido, rápido, para todo lado. E ninguém achou a estrela.

**A. Cena base:**
```
Scene 12. Funny chaos: Pip, Luna and Milo run in different directions with speed lines, looking behind trees and benches; Bo lifts a snowdrift. Dot stands still in the middle, thinking. No star anywhere.
RESERVED AREA: right foreground, full-body size.
```
**B. Inserção:** `{ACTION}` = `looking inside a bush with both hands, puzzled` · `{AREA}` = `the right foreground` · `{OUTFIT}` = `{OUTFIT_TEAM}`

---

### Página 13: Sem estrela (página do superpoder)
**Texto, primeira frase (fixa):** A turma ficou tristinha perto da árvore sem estrela.

**Texto, segunda frase (conforme `{SUPERPODER}`):**

| `{SUPERPODER}` | Texto | `{ACTION}` |
|---|---|---|
| `coragem` | Então {NOME} disse: "Tá escuro e frio… mas a gente procura juntos!" | `standing tall in front of the friends, one fist raised, determined smile` |
| `criatividade` | Então {NOME} desenhou na neve um mapa do parque para a busca. | `crouching and drawing a simple map in the snow with a stick, excited idea face` |
| `gentileza` | Então {NOME} deu a mão para a Dot: "A gente vai achar a sua estrela." | `holding Dot's hand with a kind, comforting look` |
| `bom_humor` | Então {NOME} fez um anjo de neve tão engraçado que todo mundo riu. | `lying in the snow making a snow angel with a silly face, arms and legs spread` |
| `curiosidade` | Então {NOME} apontou para o chão: "Olhem, tem purpurina na neve!" | `kneeling and pointing at small sparkles on the snow, curious wide eyes` |

**A. Cena base:**
```
Scene 13. At night, the big pine tree with an empty top. Dot sits on the bench at the LEFT, head tucked into her shell, sad. Pip, Bo, Luna and Milo stand around with drooping ears.
RESERVED AREA: the right end of the bench and the snowy space just in front of it, large enough for a standing, sitting or lying child.
```
**B. Inserção:** `{ACTION}` = conforme a tabela · `{AREA}` = `the right end of the bench / the snow in front of it` · `{OUTFIT}` = `{OUTFIT_TEAM}`

> ✔️ **Teste de produção:** gere esta página com os cinco superpoderes nos 3 personagens de teste antes de lançar o tema.

---

### Página 14: Devagarinho
**Texto:** A Dot andou devagarinho e viu uma trilha de purpurina na neve. {NOME} foi do lado, olhando também.

**A. Cena base:**
```
Scene 14. Dot walks slowly, bent forward, following a trail of small sparkles (outlined tiny stars and dots) on the snow toward a group of pine trees on the right. The other friends follow behind in a quiet line.
RESERVED AREA: right next to Dot, full-body size, walking.
```
**B. Inserção:** `{ACTION}` = `walking slowly next to Dot, bent forward, looking at the sparkle trail` · `{AREA}` = `right next to Dot` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** {NOME} e a Dot seguiram a trilha!

---

### Página 15: Achamos!
**Texto:** A estrela estava presa num galho, com um passarinho vermelho em cima! Bo e {NOME} pegaram com todo o cuidado.

**A. Cena base:**
```
Scene 15. Dot's star is caught on a low pine branch; a tiny cardinal with a pointy crest sits on top of it. Bo reaches up gently with one big paw. Dot claps, Pip, Luna and Milo cheer.
RESERVED AREA: right side, full-body size, reaching up next to Bo.
```
**B. Inserção:** `{ACTION}` = `reaching up with both hands to help hold the star, careful and happy` · `{AREA}` = `the right side, next to Bo` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** Achamos a estrela!

---

### Página 16: Feliz Natal!
**Texto:** Com a estrela no topo, a árvore acendeu inteirinha, e o Papai Noel apareceu para abraçar a turma. Feliz Natal, {NOME}!

**A. Cena base:**
```
Scene 16. The big pine tree fully lit (outlined light rays) with Dot's star on top. A round, friendly Santa Claus opens his arms wide, hugging Pip, Bo, Luna, Dot and Milo in a loose group. Grandma Bear smiles behind. Gentle snowflakes.
RESERVED AREA: the center of the group, inside Santa's hug, full-body size.
```
**B. Inserção:** `{ACTION}` = `being hugged by Santa together with the friends, huge joyful smile` · `{AREA}` = `the center of the group` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** Feliz Natal! Valeu por vir à minha festa!

---

## 6. Regras de texto

As do modelo (seção 6 do `futebol-little-paws.md`). Neste tema:
- "rápida", "tristinha" e "ela" se referem à Dot ou à turma, nunca à criança.
- Página 08: "na sua" (a carta), neutro.
- O Papai Noel não fala nem promete presentes: aparece só para o abraço.

---

## 7. Estrutura dos produtos

Igual ao modelo (seção 7). O que muda:

- **Capa do Presente:** "O Natal de {NOME} com a turma" + "Uma aventura de Natal com a turma Little Paws".
- **Lembrancinha (9 páginas):** **03, 04, 06, 08, 09, 10, 14, 15 e 16**. A Lembrancinha deste tema serve também como **lembrancinha de Natal da escola**, não só de aniversário: a página 16 pode trocar "Valeu por vir à minha festa!" por "Feliz Natal!" (escolha no pedido).
- **Certificado:** "**Certificado oficial:** {NOME} ajudou a salvar o Natal da turma Little Paws! Superpoder: **{SUPERPODER_NOME}**."

```
Certificate page base. Portrait 2:3. Dot's big five-pointed star at the top center inside a large outlined paw-emblem shield. Below it, a big empty rounded rectangle frame (left completely white inside, for the child to draw). Pip, Bo, Luna, Dot and Milo in winter clothes peek around the edges of the frame, waving, a few snowflakes around. Thick black outlines, white interiors. Leave the top 25% under the shield white for text. No text.
```

### Capa

```
Cover base. Portrait 2:3. At night in the snowy park, Pip, Bo, Luna, Dot and Milo in winter clothes gather happily around the big lit Christmas tree with Dot's star on top, a tiny cardinal on a branch. Leave the top 30% empty for the title (typeset later).
RESERVED AREA: front and center, full-body size, the biggest figure focus of the composition.
[Line version:] thick black outlines, white interiors, no gray.
[Color version:] soft crayon-like flat colors, warm and cozy night light; same composition and outlines.
```

**B. Inserção:** `{ACTION}` = `standing in front center holding Dot's star up with both hands, big joyful smile` · `{OUTFIT}` = `{OUTFIT_TEAM}`.

---

## 8. Checagem específica do tema

Além da checagem do modelo (seção 8):
- [ ] A estrela da Dot igual em todas as páginas (cinco pontas, borda, cinco bolinhas).
- [ ] Neve só em contorno, sem cinza; nada de lago congelado.
- [ ] Trenó só no morrinho aberto, sem batida.
- [ ] Papai Noel só na página 16 e na versão clássica, sem marca.
- [ ] A criança de casaco nas páginas 1 a 7, sem casaco na 08 e de suéter da turma da 09 em diante.

---

## 9. Modelo para o app (JSON)

```json
{
  "template_id": "natal-little-paws-v1",
  "language": "pt-BR",
  "title": "O Natal de {NOME} com a turma",
  "subtitle": "Uma aventura de Natal com a turma Little Paws",
  "outfit_switch_page": 9,
  "lembrancinha_pages": [3, 4, 6, 8, 9, 10, 14, 15, 16]
}
```
