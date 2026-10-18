// Para onde voltar depois de entrar. Só caminho do próprio site: um "next"
// apontando para fora viraria um redirecionador aberto para golpe.
export function destinoSeguro(bruto: string | null | undefined, padrao = '/conta'): string {
  if (!bruto || !bruto.startsWith('/') || bruto.startsWith('//') || bruto.includes('\\')) return padrao;
  return bruto;
}
