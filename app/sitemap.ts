import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/criar', '/privacidade', '/termos'].map((caminho) => ({
    url: `${SITE.url}${caminho}`,
    changeFrequency: caminho === '' ? 'weekly' : 'monthly',
    priority: caminho === '' ? 1 : 0.5,
  }));
}
