import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/account/', '/orders/'],
    },
    sitemap: 'https://jerseyspot.com/sitemap.xml',
  };
}
