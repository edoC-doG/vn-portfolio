import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, JetBrains_Mono, Phudu } from 'next/font/google';
import { getDict, LOCALES } from '@/content';
import { SITE_URL } from '@/lib/utils';
import './globals.css';

const body = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600'], variable: '--nf-body', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin', 'vietnamese'], weight: ['400', '500'], variable: '--nf-mono', display: 'swap' });
const display = Phudu({ subsets: ['latin', 'vietnamese'], weight: ['600', '700'], variable: '--nf-display', display: 'swap' });

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const d = await getDict();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: d.meta.title, template: `%s · ${d.profile.name}` },
    description: d.meta.description,
    authors: [{ name: d.profile.name, url: d.profile.linkedin.url }],
    alternates: { canonical: `/${d.locale}`, languages: { vi: '/vi', en: '/en', 'x-default': '/' } },
    openGraph: {
      type: 'website',
      siteName: d.profile.name,
      title: d.meta.title,
      description: d.meta.description,
      locale: d.locale === 'vi' ? 'vi_VN' : 'en_US',
      images: [{ url: `/og-${d.locale}.jpg`, width: 1200, height: 630, alt: d.meta.ogAlt }], // made by scripts/og.mjs
    },
    twitter: { card: 'summary_large_image', title: d.meta.title, description: d.meta.description, images: [`/og-${d.locale}.jpg`] },
  };
}

export const viewport: Viewport = { themeColor: '#0a1418', viewportFit: 'cover', colorScheme: 'dark' };

export default async function RootLayout({ children }: LayoutProps<'/[lang]'>) {
  const d = await getDict();
  // data-lang tells the 3D engine that the route picks the language (the prototype switches it in place instead)
  return (
    <html lang={d.locale} data-lang={d.locale} className={`${body.variable} ${mono.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
