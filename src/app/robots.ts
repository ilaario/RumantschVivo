// src/app/robots.ts
import type { MetadataRoute } from 'next';

const SITE_URL = 'https://rumantschvivo.it' as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // pagine di auth / account non indicizzabili
          '/*/login',
          '/*/forgot-password',
          '/*/reset-password',
          '/*/account',
          // area di lavoro
          '/wip',
          '/studio'
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}