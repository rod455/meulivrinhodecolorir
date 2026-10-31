import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();
  return ['', '/criar', '/privacidade', '/termos'].map((caminho) => ({
    url: `${SITE.url}${caminho}`,
    lastModified: agora,
    changeFrequency: caminho === '' ? 'weekly' : 'monthly',
    priority: caminho === '' ? 1 : 0.5,
  }));
}
