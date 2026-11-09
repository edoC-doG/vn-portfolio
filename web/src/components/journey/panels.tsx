// The floating panels of the 3D journey: the intro, one per stop, the end. Markup and class names match
// prototype/fly/page.html, because the engine drives the panels by these classes and data attributes
// (data-k, data-side, data-go, data-act).
import type { CSSProperties } from 'react';
import type { Dict, Line, Stop } from '@/content';

const cvHref = (d: Dict) => `/${d.locale}/cv`;
const pad = (n: number) => String(n).padStart(2, '0');

function Txt({ line }: { line: Line }) {
  return (
    <p className="txt">
      {line.lead && <b className="lead">{line.lead}</b>} {line.text}
    </p>
  );
}

function CvLink({ d, long }: { d: Dict; long?: boolean }) {
  return (
    <a className="btn ghost" href={cvHref(d)} target="_blank" rel="noopener">
      {long ? d.ui.cvLong : d.ui.cv}
    </a>
  );
}

function List({ items }: { items: Line[] }) {
  return (
    <ul className="ways">
      {items.map((it) => (
        <li key={it.lead ?? it.text}>
          <span>
            <b>{it.lead}</b> {it.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Body({ d, stop }: { d: Dict; stop: Stop }) {
  const b = stop.body;
  switch (b.kind) {
    case 'profile':
      return (
        <>
          <h2 className="display name">{d.profile.name}</h2>
          <p className="role">{d.profile.title}</p>
          {d.profile.summary.map((p) => (
            <p className="txt" key={p}>
              {p}
            </p>
          ))}
          <div className="row">
            <button className="btn primary" type="button" data-go={d.stops.findIndex((s) => s.now)}>
              {d.ui.goNow}
            </button>
            <CvLink d={d} />
          </div>
        </>
      );
    case 'job': {
      const j = d.jobs[b.job];
      return (
        <>
          <h2 className="display">{j.company}</h2>
          <p className="role">
            {j.role} · {j.type}
          </p>
          <p className="mono" style={j.current ? { color: 'var(--coral)' } : undefined}>
            {j.period}
          </p>
          <p className="txt">{j.summary}</p>
          {(b.aside || j.extra) && <div className="rule" />}
          {b.aside && (
            <>
              <p className="label">{b.aside.label}</p>
              <p className="txt">{b.aside.text}</p>
            </>
          )}
          {j.extra && (
            <>
              <p className="label">{j.extra.label}</p>
              {j.extra.lines.map((l) => (
                <Txt line={l} key={l.lead ?? l.text} />
              ))}
            </>
          )}
        </>
      );
    }
    case 'projects':
      return (
        <>
          <h2 className="display">{d.projects.title}</h2>
          <ul className="proj">
            {d.projects.items.map((p, i) => (
              <li key={p.title}>
                <span className="lt" style={i % 2 ? ({ '--l': '#ffb347' } as CSSProperties) : undefined} />
                <span>
                  <b>{p.title}</b>
                  <span className="ds">{p.desc}</span>
                  {p.stack && <span className="st">{p.stack}</span>}
                </span>
              </li>
            ))}
          </ul>
        </>
      );
    case 'ways':
      return (
        <>
          <h2 className="display">{d.ways.title}</h2>
          <List items={d.ways.items} />
        </>
      );
    case 'looking':
      return (
        <>
          <h2 className="display">{d.looking.title}</h2>
          <List items={d.looking.items} />
        </>
      );
    case 'skills':
      return (
        <>
          <h2 className="display">{d.skills.title}</h2>
          <dl className="skills">
            {d.skills.items.map((s) => (
              <div key={s.group}>
                <dt>{s.group}</dt>
                <dd>{s.items}</dd>
              </div>
            ))}
          </dl>
        </>
      );
    case 'education': {
      const e = d.education;
      return (
        <>
          <h2 className="display">{e.title}</h2>
          <div>
            <p style={{ fontWeight: 600 }}>{e.school}</p>
            <p className="txt">{e.degree}</p>
            <p className="mono">{e.period}</p>
          </div>
          <div className="rule" />
          {e.credentials.map((c) => (
            <div key={c.title}>
              <p style={{ fontWeight: 600 }}>{c.title}</p>
              <p className="mono">
                {c.issuer} · {c.date}
              </p>
            </div>
          ))}
          <p className="txt">{e.languages}</p>
        </>
      );
    }
    case 'contact':
      return (
        <>
          <h2 className="display">{d.contact.title}</h2>
          <p className="txt">{d.contact.text}</p>
          <div>
            <p className="label">{d.ui.email}</p>
            <p className="email">{d.profile.email}</p>
          </div>
          <div>
            <p className="label">{d.ui.linkedin}</p>
            <a className="link" href={d.profile.linkedin.url} target="_blank" rel="noopener">
              {d.profile.linkedin.label}
            </a>
          </div>
          <div className="row">
            <button className="btn primary" type="button" data-act="copy">
              {d.ui.copy}
            </button>
            <CvLink d={d} long />
          </div>
        </>
      );
  }
}

export function Panels({ d }: { d: Dict }) {
  const total = pad(d.stops.length);
  return (
    <>
      <section className="panel intro" data-k="intro" data-side="left" id="top">
        <p className="kicker">{d.intro.kicker}</p>
        <h1 className="display">
          {d.intro.title[0]}
          <br />
          {d.intro.title[1]}
        </h1>
        <p className="lead">{d.intro.lead}</p>
        <div className="row">
          <button className="btn primary" type="button" data-act="play">
            {d.ui.start}
          </button>
          <CvLink d={d} long />
        </div>
        <p className="hint">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <path d="M3 5l4 4 4-4" />
          </svg>
          {d.ui.hint}
        </p>
        <p className="nogl-msg">{d.ui.nogl}</p>
      </section>

      {d.stops.map((s, k) => (
        <section className={s.now ? 'panel now' : 'panel'} data-k={k} data-side={s.side} key={s.place}>
          <p className="kicker">
            {d.ui.stop} {pad(k + 1)} / {total} · {s.place}
            {s.tag && ` · ${s.tag}`}
            {s.now && (
              <>
                {' · '}
                <span className="here">{d.ui.here}</span>
              </>
            )}
          </p>
          <Body d={d} stop={s} />
          <p className="seen">{s.seen}</p>
        </section>
      ))}

      <section className="panel" data-k="end" data-side="left">
        <p className="kicker">{d.end.kicker}</p>
        <h2 className="display">{d.end.title}</h2>
        <p className="txt">{d.end.text}</p>
        <p className="email">{d.profile.email}</p>
        <div className="row">
          <button className="btn primary" type="button" data-act="copy">
            {d.ui.copy}
          </button>
          <button className="btn ghost" type="button" data-act="restart">
            {d.ui.restart}
          </button>
        </div>
        <p className="mono">
          <button className="link-btn" type="button" data-act="credits">
            {d.ui.credits}
          </button>
        </p>
      </section>
    </>
  );
}
