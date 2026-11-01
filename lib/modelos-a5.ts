// Os modelos A5 do Livrinho Presente, um por tema, com as medidas tiradas dos PDFs do
// dono (o script Python dele, com ReportLab): basquete-presente-base-A5.pdf e
// futebol-guia-insercao-A5.pdf, 01/11/2026. Posições em pontos, origem embaixo à esquerda.
// Conferidos contra os PDFs dele por `npm run conferir:livro` (montando com os marcadores).

import type { ModeloA5 } from './livro-pdf.ts';
import type { TemaId } from './temas.ts';

const AZUL_DO_BASQUETE: [number, number, number] = [0.098039, 0.211765, 0.294118];
const VERDE_DO_FUTEBOL: [number, number, number] = [0.094118, 0.294118, 0.313725];

const BASQUETE: ModeloA5 = {
  fontes: { titulo: 'livro/fontes/Baloo2-Bold.woff', texto: 'livro/fontes/NunitoSans-Regular.woff' },
  paginasFixas: 'temas/basquete/modelo.pdf',
  capa: {
    arte: { x: 39.118, y: 0, largura: 341.291, altura: 511.937 },
    blocos: [
      { texto: '{NOME}', fonte: 'titulo', tamanho: 30, base: 526.58, cor: AZUL_DO_BASQUETE, encolher: 344 },
      { texto: 'entra na quadra!', fonte: 'titulo', tamanho: 30, base: 492.08, cor: AZUL_DO_BASQUETE },
      { texto: 'Uma aventura de basquete com a turma Little Paws', fonte: 'texto', tamanho: 11, base: 459.27, cor: AZUL_DO_BASQUETE },
      { texto: 'Rodrigo Moraes & Luana David', fonte: 'texto', tamanho: 8, base: 12.83, cor: AZUL_DO_BASQUETE },
    ],
  },
  dedicatoria: {
    blocos: [
      { texto: 'Para {NOME}, com carinho de {QUEM_PRESENTEIA}.', fonte: 'titulo', tamanho: 18, entrelinha: 24.84, base: 398.69, largura: 310 },
      { texto: '{DEDICATORIA}', fonte: 'texto', tamanho: 14, entrelinha: 19.32, base: 277.69, largura: 285 },
    ],
  },
  historia: {
    arte: { x: 27.213, y: 47.622, largura: 365.102, altura: 547.654 },
    // a 13 ganhou margem na revisão 3 do dono
    artePorPagina: { 13: { x: 39.685, y: 85.039, largura: 340.158, altura: 510.236 } },
    texto: { fonte: 'texto', tamanho: 14, entrelinha: 18.62, primeiraBase: 109.22, x: 37.757, largura: 344.01, parenteseNovaLinha: true },
    numero: { fonte: 'texto', tamanho: 8, base: 20.835, doisDigitos: false },
  },
  certificado: {
    arte: { x: 11.339, y: 0, largura: 396.85, altura: 595.276 },
    blocos: [
      { texto: 'Certificado oficial', fonte: 'titulo', tamanho: 16, base: 469.15 },
      { texto: '{NOME} faz parte do Time Little Paws de basquete!', fonte: 'texto', tamanho: 13, entrelinha: 17.94, base: 433.46, largura: 201.37 },
      { texto: 'Superpoder: {SUPERPODER_NOME}.', fonte: 'titulo', tamanho: 10, base: 17.76, abaixoDoAnterior: true },
      { texto: 'Desenhe você com o time aqui!', fonte: 'texto', tamanho: 10, base: 305.5 },
    ],
  },
};

const FUTEBOL: ModeloA5 = {
  fontes: { titulo: 'livro/fontes/Fredoka-Bold.woff', texto: 'livro/fontes/Fredoka-Medium.woff' },
  paginasFixas: 'temas/futebol/modelo.pdf',
  capa: {
    arte: { x: 31.1811, y: 26.7874, largura: 357.1654, altura: 535.748 },
    blocos: [
      { texto: 'MEU LIVRINHO DE COLORIR', fonte: 'texto', tamanho: 8, base: 572.39, cor: VERDE_DO_FUTEBOL },
      { texto: '{NOME}', fonte: 'titulo', tamanho: 29, base: 523.42, cor: VERDE_DO_FUTEBOL, encolher: 360 },
      { texto: 'entra em campo!', fonte: 'titulo', tamanho: 29, base: 488.29, cor: VERDE_DO_FUTEBOL },
      { texto: 'Uma aventura de futebol\ncom a turma Little Paws', fonte: 'texto', tamanho: 10.7, entrelinha: 13.375, base: 470.28, cor: VERDE_DO_FUTEBOL },
    ],
  },
  dedicatoria: {
    blocos: [
      { texto: 'Esta aventura é para você!', fonte: 'titulo', tamanho: 21, base: 523.68 },
      { texto: 'Para {NOME},\ncom carinho de\n{QUEM_PRESENTEIA}.', fonte: 'texto', tamanho: 18, entrelinha: 22.5, base: 368.93 },
      { texto: '{DEDICATORIA}', fonte: 'texto', tamanho: 14, entrelinha: 17.5, base: 244.94, largura: 285.28 },
    ],
  },
  historia: {
    arte: { x: 31.1811, y: 29.76378, largura: 357.1654, altura: 535.748 },
    artePorPagina: {},
    texto: { fonte: 'texto', tamanho: 14, entrelinha: 17.5, primeiraBase: 122.91, x: 29.367, largura: 360.79, parenteseNovaLinha: false },
    numero: { fonte: 'texto', tamanho: 7.3, base: 14.13, doisDigitos: true },
  },
  certificado: {
    arte: { x: 66.89764, y: 20.83465, largura: 285.7323, altura: 428.5984 },
    blocos: [
      { texto: 'Certificado oficial', fonte: 'titulo', tamanho: 24, base: 541.51 },
      { texto: '{NOME}', fonte: 'titulo', tamanho: 24, base: 505.2, encolher: 340 },
      { texto: 'faz parte do Time Little Paws!', fonte: 'texto', tamanho: 14, base: 483.06 },
      { texto: 'Superpoder: {SUPERPODER_NOME}', fonte: 'titulo', tamanho: 14, base: 457.46 },
      { texto: 'Desenhe você com\no time aqui!', fonte: 'texto', tamanho: 9.5, entrelinha: 11.875, base: 240.63 },
    ],
  },
};

export const MODELOS_A5: Partial<Record<TemaId, ModeloA5>> = { basquete: BASQUETE, futebol: FUTEBOL };
