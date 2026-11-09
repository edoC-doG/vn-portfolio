import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number) => ({
    url: `${SITE_URL}/vi${path}`,
    changeFrequency: 'monthly' as const,
    priority,
    alternates: { languages: { vi: `${SITE_URL}/vi${path}`, en: `${SITE_URL}/en${path}` } },
  });
  return [page('', 1), page('/cv', 0.8)];
}
