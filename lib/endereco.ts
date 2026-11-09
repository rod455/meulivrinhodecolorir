// O endereço de entrega dos livros impressos: o mesmo nos livros publicados da
// turma e nos livros personalizados (dono, 09/11/2026). O frete é à parte.
// Puro: conferido por `npm run conferir:turma` e `npm run conferir:pedido`.

export type Endereco = { cep: string; rua: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string };
export type ErrosDoEndereco = Partial<Record<keyof Endereco, string>>;

export const UFS_DO_BRASIL = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '');

/** Lê e confere o endereço que veio do navegador. */
export function lerEndereco(bruto: unknown): { endereco: Endereco; erros: ErrosDoEndereco } {
  const d = (bruto && typeof bruto === 'object' ? bruto : {}) as Record<string, unknown>;
  const endereco: Endereco = {
    cep: typeof d.cep === 'string' ? d.cep.replace(/\D/g, '') : '',
    rua: texto(d.rua, 120),
    numero: texto(d.numero, 12),
    complemento: texto(d.complemento, 60),
    bairro: texto(d.bairro, 60),
    cidade: texto(d.cidade, 60),
    uf: texto(d.uf, 2).toUpperCase(),
  };
  const erros: ErrosDoEndereco = {};
  if (!/^\d{8}$/.test(endereco.cep)) erros.cep = 'O CEP tem 8 números.';
  if (!endereco.rua) erros.rua = 'Digite a rua.';
  if (!endereco.numero) erros.numero = 'Digite o número (ou "s/n").';
  if (!endereco.bairro) erros.bairro = 'Digite o bairro.';
  if (!endereco.cidade) erros.cidade = 'Digite a cidade.';
  if (!UFS_DO_BRASIL.includes(endereco.uf)) erros.uf = 'Escolha o estado.';
  return { endereco, erros };
}
