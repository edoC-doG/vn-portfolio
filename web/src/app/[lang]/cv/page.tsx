import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ArrowLeft, ExternalLink, Mail, MapPin } from 'lucide-react';
import { getDict, otherLocale, type Line } from '@/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PrintButton } from '@/components/print-button';

export async function generateMetadata(): Promise<Metadata> {
  const d = await getDict();
  return {
    title: { absolute: d.meta.cvTitle },
    description: d.meta.cvDescription,
    alternates: { canonical: `/${d.locale}/cv`, languages: { vi: '/vi/cv', en: '/en/cv' } },
  };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 break-inside-avoid-page">
      <h2 className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-gold">{title}</h2>
      {children}
    </section>
  );
}

function Lines({ items }: { items: Line[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((it) => (
        <li key={it.lead ?? it.text} className="flex gap-3 text-sm text-muted-foreground">
          <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-amber" />
          <span>
            {it.lead && <b className="font-semibold text-foreground">{it.lead}</b>} {it.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

// The quick CV: the same facts as the journey panels, laid out to scan in a minute and to print on two pages.
export default async function CvPage() {
  const d = await getDict();
  const other = otherLocale(d.locale);
  const jobs = [...d.jobs].reverse();
  const e = d.education;
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12 print:max-w-none print:gap-6 print:p-0">
      <nav className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <a href={`/${d.locale}`}>
            <ArrowLeft aria-hidden="true" />
            {d.ui.backToJourney}
          </a>
        </Button>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={`/${other}/cv`} hrefLang={other} lang={other} aria-label={d.ui.otherLangAria}>
              {d.ui.otherLang}
            </a>
          </Button>
          <PrintButton label={d.ui.print} />
        </div>
      </nav>

      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">{d.profile.name}</h1>
          <p className="text-lg font-medium">{d.profile.title}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" />
            {d.profile.location}
          </p>
        </div>
        <div className="flex flex-col gap-2 text-muted-foreground">
          {d.profile.summary.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <a href={`mailto:${d.profile.email}`}>
              <Mail aria-hidden="true" />
              {d.profile.email}
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={d.profile.linkedin.url} target="_blank" rel="noopener">
              <ExternalLink aria-hidden="true" />
              {d.profile.linkedin.label}
            </a>
          </Button>
        </div>
      </header>

      <Separator />

      <Section title={d.cv.experience}>
        <ol className="flex flex-col gap-6">
          {jobs.map((j) => (
            <li key={j.company} className="relative flex flex-col gap-1.5 border-l-2 border-primary/35 pl-4 first:border-primary break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="font-display text-xl font-semibold">{j.company}</h3>
                <Badge variant={j.current ? 'default' : 'outline'} className="font-mono">
                  {j.period}
                </Badge>
              </div>
              <p className="text-sm font-medium">
                {j.role} · <span className="text-muted-foreground">{j.type}</span>
              </p>
              <p className="text-sm text-muted-foreground">{j.summary}</p>
              {j.extra && (
                <div className="mt-1 flex flex-col gap-1">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{j.extra.label}</p>
                  {j.extra.lines.map((l) => (
                    <p key={l.lead ?? l.text} className="text-sm text-muted-foreground">
                      {l.lead && <b className="font-semibold text-foreground">{l.lead}</b>} {l.text}
                    </p>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section title={d.cv.projects}>
        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
          {d.projects.items.map((p) => (
            <Card key={p.title} className={p.hot ? 'gap-3 border-primary/40 bg-primary/5 py-4' : 'gap-3 py-4'}>
              <CardHeader className="px-4">
                <CardTitle className="text-sm">{p.title}</CardTitle>
                {p.stack && <CardDescription className="font-mono text-xs">{p.stack}</CardDescription>}
              </CardHeader>
              <CardContent className="px-4 text-sm text-muted-foreground">{p.desc}</CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title={d.cv.skills}>
        <dl className="flex flex-col gap-3">
          {d.skills.items.map((s) => (
            <div key={s.group} className="grid gap-1.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
              <dt className="font-mono text-xs uppercase tracking-wider text-amber sm:pt-1">{s.group}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {s.items.split(/,\s*(?![^()]*\))/).map((it) => (
                  <Badge key={it} variant="secondary">
                    {it}
                  </Badge>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title={d.cv.education}>
        <div className="flex flex-col gap-3 text-sm">
          <div>
            <p className="font-semibold">{e.school}</p>
            <p className="text-muted-foreground">
              {e.degree} · <span className="font-mono text-xs">{e.period}</span>
            </p>
          </div>
          {e.credentials.map((c) => (
            <div key={c.title}>
              <p className="font-semibold">{c.title}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {c.issuer} · {c.date}
              </p>
            </div>
          ))}
          <p className="text-muted-foreground">{e.languages}</p>
        </div>
      </Section>

      <div className="grid gap-10 sm:grid-cols-2 print:grid-cols-2 print:gap-6">
        <Section title={d.cv.ways}>
          <Lines items={d.ways.items} />
        </Section>
        <Section title={d.cv.looking}>
          <Lines items={d.looking.items} />
        </Section>
      </div>

      <Separator />

      <footer className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p>{d.contact.text}</p>
        <p className="font-medium text-foreground">
          {d.profile.email} · {d.profile.linkedin.label}
        </p>
      </footer>
    </main>
  );
}
