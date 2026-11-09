// Everything around the panels: the top bar, the HUD (frame rate, clock, time and weather chips, light mode),
// the stop rail and the credits overlay. Ids and classes are the ones the engine looks up.
import { otherLocale, type Dict } from '@/content';

export function TopBar({ d }: { d: Dict }) {
  const other = otherLocale(d.locale);
  return (
    <header className="top">
      <a className="mark" href="#top" aria-label={d.ui.top}>
        L<span>N</span>M
      </a>
      <div className="actions">
        {/* a real link: the other language is its own page; the engine keeps the place in the journey across it */}
        <a className="pill" id="lang" href={`/${other}`} hrefLang={other} lang={other} aria-label={d.ui.otherLangAria}>
          {d.ui.otherLang}
        </a>
        <button className="pill" id="play" type="button" aria-pressed="false">
          <svg className="i-play" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 1.5v9l7.5-4.5z" fill="currentColor" />
          </svg>
          <svg className="i-pause" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" fill="currentColor" />
          </svg>
          <span className="lbl">{d.ui.play}</span>
        </button>
        <a className="pill" href={`/${d.locale}/cv`} target="_blank" rel="noopener">
          {d.ui.cvPill}
        </a>
      </div>
    </header>
  );
}

export function Hud({ d }: { d: Dict }) {
  return (
    <div className="hud">
      <span id="fps">{d.ui.fpsInit}</span>
      <span id="clock" aria-live="off" />
      <button className="chip" id="sky" type="button" title={d.ui.skyTitle}>
        {d.ui.timeReal}
      </button>
      <button className="chip" id="wx" type="button" title={d.ui.wxTitle}>
        {d.ui.wxReal}
      </button>
      <label className="sw">
        <input type="checkbox" id="light" /> <span>{d.ui.light}</span>
      </label>
      <span id="loading" hidden />
    </div>
  );
}

export function Rail({ d }: { d: Dict }) {
  return (
    <nav className="rail" aria-label={d.ui.rail}>
      <span className="fill" />
      {d.stops.map((s, i) => (
        <button className="dot" type="button" aria-label={`${d.ui.stop} ${i + 1}, ${s.place}`} key={s.place}>
          <i />
        </button>
      ))}
      <span className="now" />
    </nav>
  );
}

export function Credits({ d }: { d: Dict }) {
  // the engine fills the list with the Sketchfab authors of the models in use
  return (
    <div id="credits" hidden>
      <div className="credits-box">
        <button className="link-btn close" type="button" data-act="credits" aria-label={d.ui.closeAria}>
          {d.ui.close}
        </button>
        <h2 className="display" style={{ fontSize: 22 }}>
          {d.ui.credits}
        </h2>
        <p className="txt">{d.ui.creditsText}</p>
        <ul />
      </div>
    </div>
  );
}
