import { BotaoAjuda } from '@/components/BotaoAjuda';
import type { Metadata, Viewport } from 'next';
import { Baloo_2, Nunito_Sans } from 'next/font/google';
import Script from 'next/script';
import { GuardaOrigem } from '@/components/GuardaOrigem';
import { SITE } from '@/lib/config';
import './globals.css';

const titulo = Baloo_2({ subsets: ['latin'], weight: ['700', '800'], variable: '--fonte-titulo', display: 'swap' });
const texto = Nunito_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--fonte-texto', display: 'swap', adjustFontFallback: false });

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: 'Livro de colorir personalizado: seu filho na história | Little Paws',
  description:
    'Livro infantil personalizado para colorir: coloque seu filho no time da turma Little Paws ou peça uma história escrita só para ele. Você aprova o desenho e o texto.',
  applicationName: SITE.nome,
  authors: [{ name: 'Rodrigo Moraes' }, { name: 'Luana David' }],
  creator: SITE.nome,
  keywords: [
    'livro personalizado infantil',
    'livro de colorir personalizado',
    'livro personalizado com nome da criança',
    'história personalizada para criança',
    'livro com a criança como personagem',
    'presente de aniversário infantil',
    'Little Paws',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE.nome,
    url: SITE.url,
    title: 'Seu filho dentro da história da turma Little Paws',
    description: 'Livro de colorir personalizado: seu filho no time da turma Little Paws ou numa história escrita só para ele. Você aprova antes.',
  },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: '#FFF8EE' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${texto.variable}`}>
      <body>
        <GuardaOrigem />
        {children}
        <BotaoAjuda />
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        {PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
          </Script>
        )}
      </body>
    </html>
  );
}
