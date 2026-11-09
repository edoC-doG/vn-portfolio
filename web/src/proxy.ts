import { NextResponse, type NextRequest } from 'next/server';

const LOCALES = ['vi', 'en'] as const;

/** vi or en from the Accept-Language header, by the visitor's own preference order; English for anything else. */
function pickLocale(header: string | null): (typeof LOCALES)[number] {
  const prefs = (header ?? '')
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().toLowerCase().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { lang: tag.split('-')[0], q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .filter((p) => p.lang)
    .sort((a, b) => b.q - a.q);
  const hit = prefs.find((p) => (LOCALES as readonly string[]).includes(p.lang));
  return (hit?.lang as (typeof LOCALES)[number]) ?? 'en';
}

// Every page lives under /vi or /en: a path without one is sent to the visitor's language.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  const url = request.nextUrl.clone();
  url.pathname = `/${pickLocale(request.headers.get('accept-language'))}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // skip Next internals, the 3D assets and any file with an extension (icon, robots.txt, sitemap.xml...)
  matcher: ['/((?!_next|models|textures|.*\\..*).*)'],
};
