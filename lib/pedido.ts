// O pedido como chega do formulário, validado do mesmo jeito no navegador e na rota.
// Puro: conferido por `npm run conferir:pedido`.

import { arrumarNome, MENSAGEM_DO_PROBLEMA, problemaDoNome } from './nome.ts';
import { ehProduto, PRODUTOS, totalDoPedido, type FormaDePagamento, type ProdutoId } from './produtos.ts';
import { ehUuid } from './ficha.ts';
import { lerPersonagem, type Personagem } from './personagem.ts';
import { ehTema, TEMAS, type TemaId } from './temas.ts';

export const LIMITE_DA_DEDICATORIA = 120;

export const DEDICATORIAS_PRONTAS = [
  'Para você colorir o mundo do seu jeito. Com amor, vovó.',
  'Feliz aniversário! Que a sua imaginação nunca pare de crescer.',
  'Uma história só sua, para pintar e sonhar. Com carinho.',
];

export type Pedido = {
  produto: ProdutoId;
  tema: TemaId;
  nome: string;
  idade: number;
  dataDaFesta: string | null;
  dedicatoria: string | null;
  responsavel: string;
  email: string;
  whatsapp: string;
  pagamento: FormaDePagamento;
  aceitaNovidades: boolean;
  aceitaLembrete: boolean;
  /** só nos temas com personagem (futebol); null nos outros */
  personagem: Personagem | null;
  /** a ficha que a família aprovou; obrigatória nos temas com personagem */
  fichaId: string | null;
  /** a história escrita pela IA que a família aprovou; obrigatória na sob medida */
  historiaId: string | null;
  total: number;
};

export type ErrosDoPedido = Partial<Record<keyof Pedido, string>>;

export function soDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

/** WhatsApp brasileiro: DDD + 8 ou 9 dígitos, com ou sem 55 na frente. Devolve só os dígitos com 55. */
export function arrumarWhatsapp(bruto: string): string | null {
  let d = soDigitos(bruto);
  if (d.length === 12 || d.length === 13) {
    if (!d.startsWith('55')) return null;
    d = d.slice(2);
  }
  if (d.length !== 10 && d.length !== 11) return null;
  if (d.startsWith('0')) return null;
  return `55${d}`;
}

function ehEmail(texto: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto);
}

function ehData(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const d = new Date(`${texto}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
}

/**
 * Valida e normaliza o que veio do formulário. O total é SEMPRE recalculado
 * aqui: o preço nunca vem do navegador.
 */
export function lerPedido(entrada: Record<string, unknown>):
  | { ok: true; pedido: Pedido }
  | { ok: false; erros: ErrosDoPedido } {
  const erros: ErrosDoPedido = {};
  const texto = (k: string) => (typeof entrada[k] === 'string' ? (entrada[k] as string).trim() : '');

  const produto = entrada.produto;
  if (!ehProduto(produto)) erros.produto = 'Escolha um produto.';
  const tema = entrada.tema;
  if (!ehTema(tema)) erros.tema = 'Escolha um tema.';

  const problema = problemaDoNome(texto('nome'));
  if (problema) erros.nome = MENSAGEM_DO_PROBLEMA[problema];

  const idade = Number(entrada.idade);
  if (!Number.isInteger(idade) || idade < 1 || idade > 10) erros.idade = 'Escolha a idade de 1 a 10.';

  const dataBruta = texto('dataDaFesta');
  if (dataBruta && !ehData(dataBruta)) erros.dataDaFesta = 'Data inválida.';

  let dedicatoria: string | null = null;
  if (ehProduto(produto) && PRODUTOS[produto].temDedicatoria) {
    dedicatoria = texto('dedicatoria').replace(/\s+/g, ' ') || null;
    if (dedicatoria && [...dedicatoria].length > LIMITE_DA_DEDICATORIA) {
      erros.dedicatoria = `A dedicatória pode ter até ${LIMITE_DA_DEDICATORIA} caracteres.`;
    }
  }

  const responsavel = texto('responsavel').replace(/\s+/g, ' ');
  if (responsavel.length < 2) erros.responsavel = 'Digite seu nome.';
  const email = texto('email').toLowerCase();
  if (!ehEmail(email)) erros.email = 'Confira o e-mail.';
  const whatsapp = arrumarWhatsapp(texto('whatsapp'));
  if (!whatsapp) erros.whatsapp = 'Confira o WhatsApp, com DDD.';

  let personagem: Personagem | null = null;
  let fichaId: string | null = null;
  if (ehTema(tema) && TEMAS[tema].comPersonagem) {
    const lido = lerPersonagem(entrada.personagem);
    if (lido.ok) personagem = lido.personagem;
    else erros.personagem = lido.erro;
    if (ehUuid(entrada.fichaId)) fichaId = entrada.fichaId;
    else erros.personagem ??= 'Aprove o desenho do personagem antes de pagar.';
  }

  // a sob medida é um produto de um tema só, e o tema só tem esse produto
  let historiaId: string | null = null;
  const sobMedida = ehTema(tema) && TEMAS[tema].sobMedida === true;
  if (ehProduto(produto) && ehTema(tema) && (produto === 'sob-medida') !== sobMedida) erros.produto = 'Escolha o livrinho de novo.';
  if (sobMedida) {
    if (ehUuid(entrada.historiaId)) historiaId = entrada.historiaId;
    else erros.historiaId = 'Aprove o texto da história antes de pagar.';
  }

  const pagamento = entrada.pagamento === 'cartao' ? 'cartao' : 'pix';

  if (Object.keys(erros).length > 0 || !ehProduto(produto) || !ehTema(tema) || !whatsapp) {
    return { ok: false, erros };
  }

  return {
    ok: true,
    pedido: {
      produto,
      tema,
      nome: arrumarNome(texto('nome')),
      idade,
      dataDaFesta: dataBruta || null,
      dedicatoria,
      responsavel,
      email,
      whatsapp,
      pagamento,
      aceitaNovidades: entrada.aceitaNovidades === true,
      // o lembrete de aniversário só faz sentido com a data da festa
      aceitaLembrete: entrada.aceitaLembrete === true && Boolean(dataBruta),
      personagem,
      fichaId,
      historiaId,
      total: totalDoPedido(produto, pagamento),
    },
  };
}
