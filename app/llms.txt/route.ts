import { SITE } from '@/lib/config';
import { PERGUNTAS } from '@/lib/faq';
import { LIVROS_PUBLICADOS, linksNaAmazon } from '@/lib/livros-publicados';
import { TURMA } from '@/lib/turma';

// /llms.txt (padrão llmstxt.org): o resumo do site para as IAs (ChatGPT,
// Claude, Perplexity, Gemini) entenderem o que é, como funciona e onde ler
// mais. Montado a partir dos mesmos dados das páginas, para nunca ficar
// diferente do site. Sem preço de propósito (dono, 31/10/2026).

export const dynamic = 'force-static';

export function GET() {
  const u = (caminho: string) => `${SITE.url}${caminho}`;
  const linhas = [
    `# ${SITE.nome}`,
    '',
    '> Livros de colorir personalizados para crianças de 2 a 8 anos, no Brasil. A criança entra na história da turma Little Paws, uma série original de livros infantis, ou ganha uma história 100% personalizada, escrita do zero no estilo da turma. A família monta o personagem e aprova o desenho (e, na história personalizada, o texto) antes de pagar. O arquivo chega para imprimir e colorir.',
    '',
    'Site em português do Brasil. Os personagens são originais, sem relação com personagens licenciados.',
    '',
    '## Os dois jeitos de colocar a criança na história',
    '',
    `- [Faça parte da história](${u('/#fazer-parte')}): a criança entra no time da turma Little Paws e vive a aventura com eles. A família escolhe cabelo, tom de pele, roupa e superpoder, ou envia uma foto, e aprova o desenho do personagem. Aventura disponível hoje: a grande final de futebol; basquete, flag football e Natal em breve.`,
    `- [Crie a sua própria história](${u('/#propria')}): uma história de 16 páginas para colorir escrita do zero para a criança, a partir do lugar onde acontece, da lição que ensina, do que a criança gosta e até do bichinho de estimação. Antes de pagar, a família vê o começo da história, pode pedir até 2 ajustes e aprova.`,
    `- [Começar a criar](${u('/criar')}): o passo a passo no site.`,
    '',
    '## Como funciona',
    '',
    '- A família escolhe o caminho, digita o primeiro nome e a idade da criança e monta o personagem.',
    '- O personagem é desenhado no traço da turma Little Paws e aparece em todas as páginas; a família aprova antes de pagar.',
    '- Os livros têm desenhos de traço grosso, fáceis de pintar, com a criança e o nome dela no texto.',
    '- O arquivo chega por e-mail e WhatsApp, para imprimir em casa ou na gráfica quantas vezes quiser (uso pessoal).',
    '',
    '## Privacidade',
    '',
    '- Da criança, o site guarda só o primeiro nome, a idade e o personagem. Não pede sobrenome nem escola.',
    '- O nome da criança nunca vai para a inteligência artificial que desenha e escreve.',
    '- A foto é opcional, serve só para desenhar o personagem e é apagada em 7 dias.',
    `- [Política de privacidade](${u('/privacidade')})`,
    '',
    '## A turma Little Paws',
    '',
    ...TURMA.map((a) => `- ${a.nome} (${a.bicho}): ${a.jeito}`),
    '',
    '## Livros publicados da série',
    '',
    ...LIVROS_PUBLICADOS.map((l) => {
      const idioma = l.idioma === 'pt' ? 'em português' : 'em inglês';
      const amazon = linksNaAmazon(l).map((x) => `[${x.rotulo}](${x.href})`).join(', ');
      return `- ${l.titulo} (${idioma}), de Rodrigo Moraes e Luana David: ${l.historia}${amazon ? ` Na Amazon: ${amazon}.` : ''}`;
    }),
    '',
    '## Perguntas frequentes',
    '',
    ...PERGUNTAS.flatMap((p) => [`### ${p.pergunta}`, '', p.resposta, '']),
    '## Optional',
    '',
    `- [Termos de uso e trocas](${u('/termos')})`,
  ];
  return new Response(linhas.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
