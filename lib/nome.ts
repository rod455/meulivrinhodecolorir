// Regras do nome da criança (seção 4.3 e 4.4 do documento de produto).
// Puro, sem React: conferido por `npm run conferir:nome`.

/** Até 14 caracteres para caber na capa. */
export const LIMITE_DO_NOME = 14;

/** Abaixo deste tamanho de fonte (no viewBox da capa) o nome fica ilegível: pede apelido. */
export const FONTE_MINIMA = 30;
const FONTE_MAXIMA = 68;
/** Largura útil da faixa do nome na capa, no viewBox de 296 de largura. */
const LARGURA_UTIL = 250;
/** Largura média de uma letra da Baloo 2 ExtraBold, em fração do tamanho da fonte. */
const LARGURA_MEDIA_DA_LETRA = 0.56;

// Lista simples, como pede o documento. Comparada sem acento e em minúsculas,
// palavra por palavra, para não barrar nome de verdade que contenha um pedaço.
const PALAVRAS_BLOQUEADAS = new Set([
  'bosta', 'buceta', 'caralho', 'cacete', 'cu', 'cuzao', 'foda', 'fodase', 'merda',
  'porra', 'puta', 'puto', 'pinto', 'piroca', 'rola', 'viado', 'arrombado', 'babaca',
  'otario', 'idiota', 'imbecil', 'retardado', 'corno', 'vagabunda', 'vagabundo',
  'xoxota', 'punheta', 'safada', 'safado', 'bunda', 'peido',
].map(semAcento));

const PARTICULAS = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);

export function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Tira espaços sobrando e capitaliza: "joão  pedro" vira "João Pedro". */
export function arrumarNome(bruto: string): string {
  const limpo = bruto.normalize('NFC').replace(/\s+/g, ' ').trim();
  return limpo
    .split(' ')
    .map((palavra, i) => {
      const minuscula = palavra.toLocaleLowerCase('pt-BR');
      if (i > 0 && PARTICULAS.has(minuscula)) return minuscula;
      return minuscula
        .split('-')
        .map((pedaco) => pedaco.charAt(0).toLocaleUpperCase('pt-BR') + pedaco.slice(1))
        .join('-');
    })
    .join(' ');
}

export type ProblemaDoNome = 'vazio' | 'longo' | 'caractere' | 'bloqueado';

export const MENSAGEM_DO_PROBLEMA: Record<ProblemaDoNome, string> = {
  vazio: 'Digite o nome da criança.',
  longo: `O nome pode ter até ${LIMITE_DO_NOME} letras para caber na capa. Que tal um apelido?`,
  caractere: 'Use só letras, espaço, hífen ou apóstrofo.',
  bloqueado: 'Esse nome não pode ir para a capa. Tente outro?',
};

export function problemaDoNome(bruto: string): ProblemaDoNome | null {
  const nome = arrumarNome(bruto);
  if (!nome) return 'vazio';
  if ([...nome].length > LIMITE_DO_NOME) return 'longo';
  if (!/^[\p{L}][\p{L}' -]*$/u.test(nome)) return 'caractere';
  const palavras = semAcento(nome).split(/[\s'-]+/);
  if (palavras.some((p) => PALAVRAS_BLOQUEADAS.has(p))) return 'bloqueado';
  return null;
}

/**
 * Tamanho da fonte do nome na capa: diminui conforme o nome cresce, até o
 * mínimo legível. Devolve null quando nem o mínimo cabe (aí a tela pede apelido).
 */
export function fonteDoNome(nome: string): number | null {
  const letras = Math.max([...nome].length, 1);
  const tamanho = Math.min(FONTE_MAXIMA, LARGURA_UTIL / (letras * LARGURA_MEDIA_DA_LETRA));
  if (tamanho < FONTE_MINIMA) return null;
  return Math.round(tamanho);
}
