import Link from 'next/link';
import { linkDoWhatsapp, SITE } from '@/lib/config';
import { Logo } from './Logo';

export function Rodape() {
  const whatsapp = linkDoWhatsapp('Oi! Tenho uma dúvida sobre o livrinho de colorir.');
  return (
    <footer className="rodape">
      <div className="miolo rodape-grade">
        <div>
          <Logo escuro />
          <p style={{ marginTop: 14 }}>Livrinhos de colorir com o nome da criança, prontos em minutos.</p>
          {(SITE.razaoSocial || SITE.cnpj) && (
            <p className="letra-miuda">
              {SITE.razaoSocial}
              {SITE.razaoSocial && SITE.cnpj && ' · '}
              {SITE.cnpj && `CNPJ ${SITE.cnpj}`}
            </p>
          )}
        </div>
        <div>
          <strong>Fale com a gente</strong>
          <ul style={{ marginTop: 8 }}>
            {whatsapp && (
              <li>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
            )}
            {SITE.email && (
              <li>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
            )}
            <li>
              <a href="/#duvidas">Perguntas frequentes</a>
            </li>
          </ul>
        </div>
        <div>
          <strong>Combinados</strong>
          <ul style={{ marginTop: 8 }}>
            <li>
              <Link href="/privacidade">Política de privacidade</Link>
            </li>
            <li>
              <Link href="/termos">Termos de uso e trocas</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="miolo">
        <p className="letra-miuda" style={{ marginTop: 28, marginBottom: 0 }}>
          © {new Date().getFullYear()} {SITE.nome}. Personagens e histórias próprios.
        </p>
      </div>
    </footer>
  );
}
