/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // as cenas, as fontes e a contracapa do livro automático moram em assets/ (não publicadas);
    // sem isto, a Vercel não leva os arquivos para as funções que montam o livro
    outputFileTracingIncludes: { '/api/livro-auto/**': ['./assets/**/*'] },
  },
};
export default nextConfig;
