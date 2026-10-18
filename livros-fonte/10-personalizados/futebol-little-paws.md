# {NOME} entra em campo!
## Tema personalizado de futebol com a turma Little Paws: história, cenas base e prompts de inserção do personagem

**Produto:** Meu Livrinho de Colorir · **Idioma do livro:** português do Brasil · **Idade:** 3 a 8 anos
**Formatos:** Livrinho Presente (20 páginas) e Lembrancinha (12 páginas), em A5 e A4
**Esporte:** futebol (soccer), num festival recreativo de bairro
**Base:** `00-produto/personalizacao-spec.md` (opções do personagem, login, fotos, banco de dados)

---

## 1. A ideia em uma frase

O time Little Paws precisa de **seis jogadores** para entrar no Festival de Futebol da Praça, mas só tem cinco. Alguém está espiando de trás da árvore: é **{NOME}**, o personagem criado por quem comprou. Essa criança completa o time, aprende a jogar junto e faz o gol do empate na final.

**Por que funciona para personalizar:**
- **O personagem "oculto" é o próprio enredo.** O time literalmente tem uma vaga aberta, e a criança é quem a preenche.
- **A criança aparece em todas as 16 páginas.** Nas páginas 1 e 2 ela está escondida, e o leitor brinca de achar.
- **O texto não tem pronome nem adjetivo com gênero** para a criança. Funciona com qualquer nome e com a opção "usar só o nome" (regras na seção 6).
- **O superpoder** escolhido no cadastro muda a página 13 e o certificado final.

---

## 2. Como produzir

### 2.1 Método recomendado: cena base + inserção

Cada página tem **dois prompts**:

| Prompt | Quando roda | O que faz |
|---|---|---|
| **A. Cena base** | **Uma vez só**, na produção do tema | Gera a página com o time Little Paws e o cenário, deixando uma **área livre** onde a criança vai entrar. Você revisa e aprova as 16 cenas e a capa. |
| **B. Inserção** | **A cada pedido** | Edita a cena base aprovada e adiciona a criança na área livre, usando a ficha do personagem aprovada pela família. |

**Por que não gerar a página inteira a cada pedido:** se o ChatGPT redesenhar tudo do zero, Pip, Bo, Luna, Dot e Milo saem um pouco diferentes em cada livro, e cada página precisaria de revisão completa. Com a cena base aprovada, só a criança é nova: o time e o cenário ficam idênticos em todos os livros, e a revisão foca em um ponto.

**Plano B:** as áreas livres também servem para colar por código uma pose recortada (o método de "vagas" da especificação). Use esse caminho para o personagem **animal** da biblioteca pronta ou quando a edição falhar duas vezes.

### 2.2 O que entra em cada geração do pedido

1. A **cena base** aprovada da página (imagem).
2. A **ficha do personagem** aprovada pela família (imagem, versão em contorno preto).
3. O **prompt de inserção** com as variáveis preenchidas.

> 🔒 **Na opção por foto, nunca anexe a foto da criança nas páginas.** Ela só é usada para criar a ficha. Daí em diante, a referência é sempre a ficha desenhada. Isso protege a privacidade, e o estilo fica igual ao das cenas.

### 2.3 Ordem de produção do tema (uma vez)

1. Gerar e aprovar a **ficha do time no uniforme de futebol** (seção 4.3).
2. Gerar e aprovar a **ficha do cenário**: praça, campinho, árvore, banco e traves.
3. Gerar as **16 cenas base + capa**, uma por vez.
4. **Testar a inserção com 3 personagens fictícios**, nunca com fotos de crianças reais:
   - menina de cabelo cacheado volumoso e óculos;
   - menino de cabelo liso curto;
   - um panda.

   Ajuste as áreas livres das páginas onde a inserção falhar.
5. Registrar as cenas aprovadas no modelo JSON (seção 9) e no armazenamento do app.

---

## 3. Variáveis

### 3.1 Texto (inseridas pelo script, nunca na imagem)

| Variável | Exemplo | Origem |
|---|---|---|
| `{NOME}` | Laura | Cadastro da criança |
| `{IDADE}` | 6 | Cadastro (capa da Lembrancinha e certificado) |
| `{SUPERPODER}` | `coragem` / `criatividade` / `gentileza` / `bom_humor` / `curiosidade` | Cadastro (escolha da variante da página 13) |
| `{SUPERPODER_NOME}` | Coragem | Certificado |
| `{DEDICATORIA}` | Texto livre de até 120 caracteres | Checkout do Presente |
| `{QUEM_PRESENTEIA}` | Vovó Marta | Checkout do Presente (opcional) |

### 3.2 Imagem (inseridas no prompt de inserção, em inglês)

| Variável | Exemplo |
|---|---|
| `{CHILD_SHORT}` | `a 6-year-old girl with big curly shoulder-length hair in two puffs and round glasses` · `a small panda cub wearing a cap` |
| `{CHILD_HEIGHT}` | `about 90% of Bo's height` (padrão). Use 82% se escolheram "mais baixinho(a)" e 98% se escolheram "mais alto(a)". |
| `{OUTFIT_OWN}` | `her favorite outfit from the character sheet: T-shirt, shorts and sneakers` |
| `{OUTFIT_TEAM}` | `the Little Paws soccer uniform: short-sleeve jersey with the outlined paw emblem, shorts, long socks and cleats, plus the same glasses and hair accessories from the sheet` |

O app monta `{CHILD_SHORT}` a partir das escolhas do formulário. Escreva sempre em inglês simples, curto, e só com o que se vê.

**Troca de roupa:**
- Páginas 1 a 9: `{OUTFIT_OWN}`.
- Páginas 10 a 16 e capa: `{OUTFIT_TEAM}`.

---

## 4. Prompt mestre e fichas

### 4.1 Prompt mestre (vale para todas as cenas base)

```
Create ONE original children's coloring-book page for the requested scene only. Portrait 2:3 canvas, to be printed at A5 and A4. Highest available resolution.
Clean, confident, thick black outlines on a pure white background. Entirely uncolored interiors. No gray, shading, gradients, hatching, solid black fills, textures, watermarks, logos, borders, panels or collage. Hair and fur are outlines only; every enclosed area stays white for the child to color.
Large closed shapes, rounded friendly forms, readable facial expressions, simple backgrounds with generous open areas. No tiny patterns. One clear story action per page.
Keep important artwork inside 7% margins. Keep the bottom 22% of the canvas completely white: the story text will be typeset there later.
No text, letters, numbers, speech bubbles, signs with writing, jersey numbers or scoreboards. Flags and posters contain simple pictures only.
Follow the approved Little Paws soccer reference sheet exactly: faces, markings, relative heights, uniforms and accessories.
Soccer ball: classic ball drawn with OUTLINED patches only, every patch white, never filled black. Goals: small youth goals with a simple net of a few large squares.
Leave the RESERVED AREA described in the scene completely empty (plain white background, no props, no characters, no grass lines inside it): a new character will be added there later.
Do not draw the same character twice. Natural anatomy, believable soccer actions, no rough contact, no injuries. Original characters only, no professional team branding.
```

**Variante para 2 a 4 anos:** acrescente `Extra-thick outlines, even bigger shapes, fewer background elements.`

### 4.2 Elenco fixo (character bible)

As mesmas regras visuais dos livros Little Paws: animais antropomórficos infantis, bípedes, arredondados, sem textura de pelo, sem garras ou dentes.

| Personagem | Aparência | Papel no time |
|---|---|---|
| **Pip** | Coelho pequeno, orelhas longas e retas com contorno interno, focinho redondo, rabinho fofo. Altura: 65% de Bo. Duas faixas nas meias. | Atacante rápido e empolgado |
| **Bo** | Urso grande e redondo, orelhinhas circulares, focinho oval, sobrancelhas gentis. É a referência de altura (100%). | **Goleiro**: luvas grandes e arredondadas |
| **Luna** | Raposa, orelhas triangulares, cauda volumosa com uma divisão contornada na ponta. Altura: 80% de Bo. Munhequeira no pulso esquerdo. | Meio-campo, organiza as jogadas; às vezes carrega uma prancheta só com desenhos |
| **Dot** | Tartaruga pequena, cabeça redonda, casco oval com cinco seções grandes contornadas. Altura: 60% de Bo. | Defensora observadora |
| **Milo** | Guaxinim jovem, máscara facial só em contorno, cauda com três anéis largos contornados. Altura: 75% de Bo. Faixa simples na cabeça. | Brincalhão e distraído no começo; aprende a marcar e desarmar |

**Uniforme Little Paws de futebol:**
- camisa de manga curta com o **emblema de patinha** contornado;
- calção, meião e chuteiras;
- nada de números ou textos.

**Adversários (só nas páginas 11 a 16): Time da Lagoa.** São seis: castor, cervo (sem chifres), esquilo, lontra, texugo (listras do rosto só em contorno, nunca preenchidas) e um sapinho goleiro. Todos usam camisa lisa com **uma faixa horizontal** e nunca o emblema de patinha.

**Cenário:**
- praça de bairro com um campinho de grama;
- duas traves infantis com rede simples;
- uma **árvore grande** de copa redonda ao lado do campo;
- banco de madeira e cerquinha baixa;
- no dia do festival: varal de **bandeirinhas** lisas.

### 4.3 Prompt da ficha do time (produção, não é página do livro)

```
Create one reference sheet on a white background showing Pip, Bo, Luna, Dot and Milo in their fixed Little Paws SOCCER uniforms, following the character bible exactly. Bo wears big rounded goalkeeper gloves. For each character: front and three-quarter views, consistent relative heights, neutral and happy expressions. Clean black coloring-book line art, no gray, no color, no labels. Characters separate and fully visible. This is a production asset, not a book page.
```

### 4.4 Prompt de inserção (modelo usado em todas as páginas)

```
Edit the attached base scene. Add exactly ONE new character: the child from the attached approved character sheet — {CHILD_SHORT} — {ACTION}, placed in the empty area at {AREA}. Height: {CHILD_HEIGHT}.
Outfit on this page: {OUTFIT}.
Match the child's face, hair, accessories and proportions to the character sheet exactly. Match the scene's style: same thick black outlines, white interiors, no gray, no shading, no color.
Do NOT change, move, redraw or remove anything else in the scene. Keep the bottom 22% of the page completely white. No text.
```

Em cada página abaixo, preencha `{ACTION}`, `{AREA}` e `{OUTFIT}`.

---

## 5. A história, página a página

> **Texto:** vai no rodapé, inserido pelo script.
> **Lembrancinha:** legenda curta usada quando a página entra na Lembrancinha (seção 7).

---

### Página 01: O cartaz
**Texto:** O Festival de Futebol da Praça seria no sábado! Cada time precisava de seis jogadores. *(Psiu… tem alguém atrás da árvore!)*

**A. Cena base:**
```
Scene 01. Pip stands on tiptoe in a small neighborhood square, excitedly pointing at a notice board with a picture-only poster: a soccer ball and six small paw prints, no writing. The big round-crowned tree stands at the right side of the page. Pip alone in the foreground.
RESERVED AREA: right side, partly behind the tree trunk, about 30% of the page height. Leave it empty.
```
**B. Inserção:** `{ACTION}` = `peeking out from behind the tree trunk, only half of the body visible, curious smile, holding their own soccer ball` · `{AREA}` = `the right side, behind the tree trunk` · `{OUTFIT}` = `{OUTFIT_OWN}`

---

### Página 02: Falta um!
**Texto:** Pip contou os amigos: um, dois, três, quatro, cinco. "Falta um!" *(De trás do banco, alguém espiava…)*

**A. Cena base:**
```
Scene 02. Pip faces Bo, Luna, Dot and Milo on the park grass, holding up five fingers with a puzzled face. Bo scratches his head, Luna looks thoughtful, Dot attentive, Milo balancing a leaf on his nose. A wooden bench in the left background.
RESERVED AREA: behind the bench in the left background, small (about 20% of page height).
```
**B. Inserção:** `{ACTION}` = `crouching behind the bench, eyes and hair peeking over the backrest, both hands holding the bench top` · `{AREA}` = `the left background, behind the bench` · `{OUTFIT}` = `{OUTFIT_OWN}`

---

### Página 03: A bola que rolou
**Texto:** Nessa hora, uma bola rolou até os pés de Pip. Logo atrás dela vinha {NOME}!

**A. Cena base:**
```
Scene 03. A soccer ball rolls to stop at Pip's feet. Pip looks down at it, surprised. Bo, Luna, Dot and Milo stand behind Pip, all turning their heads toward the left side of the page.
RESERVED AREA: left third of the page, full-body size, at the same ground level as the team.
```
**B. Inserção:** `{ACTION}` = `walking in shyly, giving a small wave, a little embarrassed smile` · `{AREA}` = `the left third of the page` · `{OUTFIT}` = `{OUTFIT_OWN}`

**Lembrancinha:** {NOME} chegou para jogar!

---

### Página 04: O convite
**Texto:** "Quer jogar com a gente?", perguntou Pip. {NOME} deu um sorriso do tamanho do campo.

**A. Cena base:**
```
Scene 04. Pip holds the soccer ball out with both paws toward the right side, inviting. Behind him, Bo, Luna, Dot and Milo smile warmly. Simple park grass and one bush.
RESERVED AREA: right side, full-body size, facing Pip.
```
**B. Inserção:** `{ACTION}` = `standing facing Pip, a huge happy smile, hands clasped in excitement` · `{AREA}` = `the right side, facing Pip` · `{OUTFIT}` = `{OUTFIT_OWN}`

**Lembrancinha:** Pip convidou {NOME} para o time.

---

### Página 05: Este é o time
**Texto:** Pip apresentou todo mundo. Bo era o goleiro, Luna organizava as jogadas, Dot reparava em tudo… e Milo estava correndo atrás de uma borboleta.

**A. Cena base:**
```
Scene 05. A friendly line-up on the grass: Bo in goalkeeper gloves waves, Luna holds a picture-only clipboard, Dot looks around attentively, and Milo runs off to the side after one butterfly. Pip gestures proudly toward his friends.
RESERVED AREA: lower left foreground, full-body size.
```
**B. Inserção:** `{ACTION}` = `laughing and pointing at Milo chasing the butterfly` · `{AREA}` = `the lower left foreground` · `{OUTFIT}` = `{OUTFIT_OWN}`

---

### Página 06: Chute forte demais
**Texto:** No primeiro treino, {NOME} chutou com tanta vontade que a bola foi parar em cima da árvore!

**A. Cena base:**
```
Scene 06. The soccer ball is stuck among the leaves near the top of the big round tree. Pip, Luna and Dot look up with open mouths; Milo covers his eyes, peeking through his fingers. Bo is off-frame.
RESERVED AREA: center-left foreground, full-body size.
```
**B. Inserção:** `{ACTION}` = `standing on one leg, the kicking leg still up after a big kick, both hands on the cheeks in comic surprise, looking up at the tree` · `{AREA}` = `the center-left foreground` · `{OUTFIT}` = `{OUTFIT_OWN}`

**Lembrancinha:** Opa! A bola foi parar na árvore!

---

### Página 07: Plof!
**Texto:** Bo esticou os braços, Luna pulou, Dot apontou o galho certo… e a bola caiu bem na cabeça do Milo. Plof!

**A. Cena base:**
```
Scene 07. Comic moment, no injury: the soccer ball bounces softly off the top of Milo's head with small motion lines; Milo has a silly dazed smile. Bo, with arms raised, has just shaken a LOW branch; Dot points at it; Luna lands from a small hop. The big tree behind them.
RESERVED AREA: right foreground, full-body size.
```
**B. Inserção:** `{ACTION}` = `laughing with both hands over the mouth` · `{AREA}` = `the right foreground` · `{OUTFIT}` = `{OUTFIT_OWN}`

---

### Página 08: A bola vai, a bola volta
**Texto:** Luna ensinou o segredo do time: "A bola vai, a bola volta. Ninguém joga sozinho."

**A. Cena base:**
```
Scene 08. Side view on the grass. Luna has just passed the soccer ball with the inside of her foot; the ball rolls toward the right with simple motion lines. Pip and Dot watch from the background next to two small cones.
RESERVED AREA: right side, full-body size, about where the ball is going.
```
**B. Inserção:** `{ACTION}` = `getting ready to receive the pass, one foot lifted slightly to stop the ball, concentrated face` · `{AREA}` = `the right side, in the ball's path` · `{OUTFIT}` = `{OUTFIT_OWN}`

**Lembrancinha:** A bola vai, a bola volta.

---

### Página 09: A camisa
**Texto:** No fim do treino, Bo trouxe uma surpresa: uma camisa com a patinha do time, do tamanho certinho de {NOME}.

**A. Cena base:**
```
Scene 09. Bo, smiling, has both open paws extended toward the right as if he has just handed something over. Pip, Luna, Dot and Milo clap happily around him. Late-afternoon park, the bench behind them.
RESERVED AREA: right side, full-body size, close to Bo's hands.
```
**B. Inserção:** `{ACTION}` = `holding up a Little Paws soccer jersey with the outlined paw emblem in both hands, delighted, eyes sparkling` · `{AREA}` = `the right side, close to Bo` · `{OUTFIT}` = `{OUTFIT_OWN}` *(ainda com a própria roupa: a camisa está nas mãos)*

**Lembrancinha:** Uma camisa só para {NOME}!

---

### Página 10: Dia de festival
**Texto:** Chegou o sábado! A praça estava cheia de bandeirinhas, pipoca e torcida.

**A. Cena base:**
```
Scene 10. The Little Paws team walks onto the festival field in uniform: Pip bouncing ahead, Bo with his goalkeeper gloves, Luna, Dot and Milo. Above, one string of plain pennant flags; at the edge, a simple popcorn cart (no writing) and a few cheering background animals drawn simply.
RESERVED AREA: center of the walking group, between Pip and Luna, full-body size.
```
**B. Inserção:** `{ACTION}` = `walking proudly with the team, chest out, big smile` · `{AREA}` = `the center of the group, between Pip and Luna` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** Dia de festival na praça!

---

### Página 11: O Time da Lagoa
**Texto:** O outro time era o Time da Lagoa. Antes de começar, todo mundo se cumprimentou.

**A. Cena base:**
```
Scene 11. Medium shot at the center of the field. Pip shakes paws with the beaver captain of the Lagoon Team. Behind the beaver: deer (no antlers), squirrel, otter, badger and a little frog goalkeeper, in plain jerseys with one horizontal stripe. Behind Pip: Bo, Luna, Dot and Milo. Generous spacing, no crowding.
RESERVED AREA: left foreground, in front of the Little Paws group, full-body size.
```
**B. Inserção:** `{ACTION}` = `waving hello to the little frog goalkeeper with a friendly smile` · `{AREA}` = `the left foreground` · `{OUTFIT}` = `{OUTFIT_TEAM}`

---

### Página 12: Gol da Lagoa
**Texto:** Apito! Logo no começo, a lontra chutou e… gol do Time da Lagoa. Bo ficou olhando a bola na rede.

**A. Cena base:**
```
Scene 12. Bo sits on the grass in front of his goal after a dive, looking back at the soccer ball resting inside the net, a little sad but okay. The otter celebrates politely in the background with arms up. Dot and Luna stand nearby, surprised.
RESERVED AREA: right middle ground, full-body size.
```
**B. Inserção:** `{ACTION}` = `standing with both hands on the head, surprised and a little worried` · `{AREA}` = `the right middle ground` · `{OUTFIT}` = `{OUTFIT_TEAM}`

---

### Página 13: No intervalo (página do superpoder)
**Texto, primeira frase (fixa):** No intervalo, o time estava cabisbaixo.
**Texto, segunda frase (conforme `{SUPERPODER}`):**

| `{SUPERPODER}` | Texto | `{ACTION}` |
|---|---|---|
| `coragem` | Então {NOME} disse: "Eu também tô com medo… mas a gente pode tentar de novo!" | `standing tall in front of the team, one fist raised, determined smile` |
| `criatividade` | Então {NOME} pegou a prancheta da Luna e desenhou uma jogada novinha. | `holding Luna's clipboard and drawing on it with a pencil, excited idea face` |
| `gentileza` | Então {NOME} sentou ao lado do Bo: "Aquele gol não foi culpa sua. Goleiro também tem time." | `sitting on the bench right next to Bo, a kind look, one hand gently on Bo's arm` |
| `bom_humor` | Então {NOME} fez a dança mais engraçada do mundo. Até o Bo deu risada! | `doing a silly dance on one foot, arms wiggling, tongue out playfully` |
| `curiosidade` | Então {NOME} contou uma descoberta: "O Time da Lagoa sempre chuta para o mesmo lado!" | `pointing toward the field with one hand, the other hand by the mouth as if sharing a secret, curious eyes` |

**A. Cena base (uma só para os cinco superpoderes):**
```
Scene 13. Half-time by the wooden bench. Bo sits at the LEFT end of the bench, looking down. Luna stands holding her picture-only clipboard slightly out to the side. Pip, Dot and Milo stand around with drooping ears and worried faces.
RESERVED AREA: the right end of the bench and the space just in front of it, large enough for a standing OR sitting child.
```
**B. Inserção:** `{ACTION}` = conforme a tabela acima · `{AREA}` = `the right end of the bench / just in front of it` · `{OUTFIT}` = `{OUTFIT_TEAM}`

> ✔️ **Teste de produção:** gere esta página com os cinco superpoderes nos 3 personagens de teste antes de lançar o tema.

---

### Página 14: Milo presta atenção
**Texto:** No segundo tempo, Milo não olhou para nenhuma borboleta. Ele tirou a bola do castor e tocou para {NOME}.

**A. Cena base:**
```
Scene 14. Milo, focused, has just won the soccer ball cleanly from the beaver (no foul, no contact) and passes it toward the right with motion lines. The beaver looks surprised. One butterfly flies by, ignored by Milo.
RESERVED AREA: right side, full-body size, running position, in the ball's path.
```
**B. Inserção:** `{ACTION}` = `running forward to receive the pass, arms swinging, focused eyes` · `{AREA}` = `the right side, in the ball's path` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** Milo tocou para {NOME}.

---

### Página 15: A jogada do time
**Texto:** {NOME} tocou para Luna, Luna tocou para Pip, Pip devolveu… e {NOME} chutou com toda a força!

**A. Cena base:**
```
Scene 15. In front of the Lagoon Team's goal. The little frog goalkeeper crouches, ready. Pip, just off-center, has just passed back toward the left (motion lines on the grass, NO ball drawn). Luna cheers in the background.
RESERVED AREA: left foreground, full-body size, room for a kicking leg and a ball in front of it.
```
**B. Inserção:** `{ACTION}` = `kicking the soccer ball toward the goal in a strong, balanced kick, ball just leaving the foot with motion lines (the ball has outlined white patches)` · `{AREA}` = `the left foreground` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** {NOME} chutou com toda a força!

---

### Página 16: Gooool!
**Texto:** GOOOL! O jogo terminou empatado, mas o time comemorou como se fosse final de copa. Afinal, eles tinham ganhado uma amizade nova: {NOME}!

**A. Cena base:**
```
Scene 16. Joyful celebration on the field: Pip, Bo, Luna, Dot and Milo jump with arms up in a loose circle; the soccer ball rests in the goal net in the background. The Lagoon Team claps kindly at the side. Pennant flags above. No scoreboard.
RESERVED AREA: the center of the circle, full-body size, slightly raised as if jumping.
```
**B. Inserção:** `{ACTION}` = `jumping in the air at the center, both arms raised, the happiest face` · `{AREA}` = `the center of the circle` · `{OUTFIT}` = `{OUTFIT_TEAM}`

**Lembrancinha:** Gooool! Valeu por vir à minha festa!

---

## 6. Regras de texto (para funcionar com qualquer criança)

- **Sem pronome e sem adjetivo com gênero para a criança.** Não usar "ele", "ela", "pronto/pronta", "animado/animada", "sozinho/sozinha" nem "o novo amigo / a nova amiga". O texto usa sempre `{NOME}` e construções neutras ("deu um sorriso", "uma amizade nova").
- **Sem rima ou trocadilho que dependa do nome.**
- **Nomes longos:** testar a diagramação com "Maria Eduarda" e "Pedro Henrique" (até 16 caracteres). Acima disso, o app sugere usar o apelido.
- **Tamanho:** no máximo duas frases por página, para caber nos 22% de rodapé em A5 com fonte de 14 pt.
- A palavra "jogadores" (página 1) é um plural genérico sobre os times e não se refere à criança.

---

## 7. Estrutura dos produtos

### 7.1 Livrinho Presente (20 páginas)

| Página | Conteúdo |
|---|---|
| 1 | **Capa:** "{NOME} entra em campo!" + subtítulo "Uma aventura de futebol com a turma Little Paws" |
| 2 | **Dedicatória:** "Para {NOME}, com carinho de {QUEM_PRESENTEIA}." + `{DEDICATORIA}`, numa moldura de bandeirinhas para colorir |
| 3 a 18 | **História**, páginas 01 a 16 |
| 19 | **Certificado do time** (7.3) |
| 20 | **Contracapa:** "Feito com carinho por meulivrinhodecolorir.com.br" + QR code discreto |

**Impressão:** A5 em livreto (5 folhas A4 frente e verso, dobrar e grampear) ou A4 página a página.

### 7.2 Lembrancinha (12 páginas)

| Página | Conteúdo |
|---|---|
| 1 | **Capa:** "Aniversário de {NOME} · {IDADE} anos", com a arte da capa |
| 2 | "Este livrinho é de: ______" + "Valeu por vir à minha festa! 💛" |
| 3 a 11 | Nove páginas com a legenda curta: **03, 04, 06, 08, 09, 10, 14, 15 e 16** |
| 12 | Contracapa com QR code |

> Nas páginas 10 a 16 a criança já está de uniforme, e nas anteriores com a própria roupa. A seleção da Lembrancinha mantém essa ordem, então a troca de roupa faz sentido.

### 7.3 Certificado do time (página 19 do Presente)

- **Texto (script):** "**Certificado oficial:** {NOME} faz parte do Time Little Paws! Superpoder: **{SUPERPODER_NOME}**."
- **Arte:**
  - um escudo grande de patinha no topo;
  - Pip, Bo, Luna, Dot e Milo em volta de uma **moldura vazia** com a instrução "Desenhe você com o time aqui!".

  A arte não muda entre pedidos.

```
Certificate page base. Portrait 2:3. A large outlined paw-emblem shield at the top center. Below it, a big empty rounded rectangle frame (left completely white inside, for the child to draw). Pip, Bo, Luna, Dot and Milo peek around the edges of the frame, waving. Thick black outlines, white interiors. Leave the top 25% under the shield white for text. No text.
```

### 7.4 Capa

**A. Cena base, em duas versões:**
- contorno (Lembrancinha e versão para colorir);
- colorida (Presente).

```
Cover base. Portrait 2:3. Pip, Bo (goalkeeper gloves), Luna, Dot and Milo in Little Paws soccer uniforms pose happily on the grass around a soccer ball, with pennant flags above. Leave the top 30% empty for the title (typeset later).
RESERVED AREA: front and center, standing right behind the ball, full-body size, the biggest figure focus of the composition.
[Line version:] thick black outlines, white interiors, no gray.
[Color version:] soft crayon-like flat colors, warm and cheerful; same composition and outlines.
```

**B. Inserção:**
- `{ACTION}` = `standing proudly in front center with one foot on the soccer ball, hands on hips, big confident smile`
- `{OUTFIT}` = `{OUTFIT_TEAM}`
- Na **versão colorida**, acrescentar: `Color the child exactly as in the color version of the character sheet (skin, hair, eyes); the jersey uses the team colors of the cover.`

---

## 8. Checagem de cada pedido

**Automática** (a cada página gerada):
- Não há cinza nem grandes manchas pretas: a imagem está em preto e branco puro e a proporção de pixels pretos está dentro do limite.
- O rodapé está branco, para receber o texto.
- A imagem tem o tamanho e a proporção esperados.

**Visual** (por pessoa nos primeiros 50 pedidos, depois por amostragem):
- [ ] A criança está igual à ficha aprovada: cabelo, óculos, acessórios.
- [ ] A roupa está certa para a página: própria até a 9, uniforme a partir da 10.
- [ ] O time e o cenário não foram alterados pela edição.
- [ ] Mãos, pés e olhos estão corretos. Não há personagem duplicado.
- [ ] A bola é única e tem os gomos brancos.
- [ ] A página 13 corresponde ao superpoder escolhido.
- [ ] O texto foi aplicado com o nome correto e sem cortar.

**Se uma página falhar duas vezes:** use o plano B (pose recortada colada na área livre) ou mande para ajuste manual antes de liberar o PDF.

---

## 9. Modelo para o app (JSON)

```json
{
  "template_id": "futebol-little-paws-v1",
  "language": "pt-BR",
  "title": "{NOME} entra em campo!",
  "subtitle": "Uma aventura de futebol com a turma Little Paws",
  "outfit_switch_page": 10,
  "pages": [
    {
      "page": 1,
      "base_image": "temas/futebol/base/p01.png",
      "reserved_area": { "x": 0.66, "y": 0.30, "w": 0.30, "h": 0.42 },
      "insert": {
        "action": "peeking out from behind the tree trunk, only half of the body visible, curious smile, holding their own soccer ball",
        "area": "the right side, behind the tree trunk",
        "outfit": "own"
      },
      "text": "O Festival de Futebol da Praça seria no sábado! Cada time precisava de seis jogadores. (Psiu… tem alguém atrás da árvore!)",
      "lembrancinha": null
    },
    {
      "page": 13,
      "base_image": "temas/futebol/base/p13.png",
      "reserved_area": { "x": 0.58, "y": 0.34, "w": 0.36, "h": 0.42 },
      "insert": { "area": "the right end of the bench / just in front of it", "outfit": "team" },
      "variants_by_superpoder": {
        "coragem":      { "action": "standing tall in front of the team, one fist raised, determined smile", "text": "No intervalo, o time estava cabisbaixo. Então {NOME} disse: \"Eu também tô com medo… mas a gente pode tentar de novo!\"" },
        "criatividade": { "action": "holding Luna's clipboard and drawing on it with a pencil, excited idea face", "text": "No intervalo, o time estava cabisbaixo. Então {NOME} pegou a prancheta da Luna e desenhou uma jogada novinha." },
        "gentileza":    { "action": "sitting on the bench right next to Bo, a kind look, one hand gently on Bo's arm", "text": "No intervalo, o time estava cabisbaixo. Então {NOME} sentou ao lado do Bo: \"Aquele gol não foi culpa sua. Goleiro também tem time.\"" },
        "bom_humor":    { "action": "doing a silly dance on one foot, arms wiggling, tongue out playfully", "text": "No intervalo, o time estava cabisbaixo. Então {NOME} fez a dança mais engraçada do mundo. Até o Bo deu risada!" },
        "curiosidade":  { "action": "pointing toward the field with one hand, the other hand by the mouth as if sharing a secret, curious eyes", "text": "No intervalo, o time estava cabisbaixo. Então {NOME} contou uma descoberta: \"O Time da Lagoa sempre chuta para o mesmo lado!\"" }
      },
      "lembrancinha": null
    }
  ]
}
```

Repita o formato para as 16 páginas. As coordenadas de `reserved_area` são proporções da página (0 a 1) e devem ser medidas nas cenas base aprovadas. Elas servem para a checagem de que a criança ficou na área certa e para o plano B de colagem.

---

## 10. Custos e tempo (hipóteses a medir)

| Item | Imagens por pedido |
|---|---|
| Ficha da criança (opções humano por formulário e por foto) | 1 a 2 |
| 16 páginas + capa (inserção) | 17 |
| Regerações (estimativa de 15%) | ~3 |
| **Total** | **~21** (Presente) · **~13** (Lembrancinha: 9 páginas + capa + ficha + regerações) |

Antes de fixar o preço, medir com a API escolhida: o custo real por imagem editada, o tempo total do pedido (meta: menos de 15 minutos) e a taxa de páginas reprovadas na checagem.
