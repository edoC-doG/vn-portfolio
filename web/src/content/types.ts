// One dictionary per language. The journey panels and the quick CV page both read from it, so the CV facts
// (jobs, projects, skills, education) are written once.

export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const hasLocale = (s: string): s is Locale => (LOCALES as readonly string[]).includes(s);

/** A paragraph with an optional bold lead-in ("Bridgestone Việt Nam: ..."). */
export type Line = { lead?: string; text: string };

export type Job = {
  company: string;
  role: string;
  /** Full-time, contract... */
  type: string;
  period: string;
  current?: boolean;
  summary: string;
  /** Clients or projects under this job, shown under a small label. */
  extra?: { label: string; lines: Line[] };
};

export type Project = { title: string; desc: string; stack?: string; hot?: boolean };
export type SkillGroup = { group: string; items: string };
export type Credential = { title: string; issuer: string; date: string };

/** What a journey panel shows. Each kind pulls its facts from the CV part of the dictionary. */
export type StopBody =
  | { kind: 'profile' }
  | { kind: 'job'; job: number; aside?: { label: string; text: string } }
  | { kind: 'projects' }
  | { kind: 'ways' }
  | { kind: 'skills' }
  | { kind: 'education' }
  | { kind: 'looking' }
  | { kind: 'contact' };

export type Stop = {
  /** Place name on the kicker, the rail and the map. */
  place: string;
  /** Extra kicker text after the place: a year, "Khởi hành"... */
  tag?: string;
  side: 'left' | 'right';
  /** The landmarks seen at this stop, shown at the foot of the panel. */
  seen: string;
  /** The stop of the present job. */
  now?: boolean;
  body: StopBody;
};

export type Dict = {
  locale: Locale;
  meta: { title: string; description: string; cvTitle: string; cvDescription: string; ogAlt: string };
  ui: {
    stop: string;
    rail: string;
    top: string;
    here: string;
    cv: string;
    cvPill: string;
    cvLong: string;
    play: string;
    light: string;
    fpsInit: string;
    timeReal: string;
    wxReal: string;
    skyTitle: string;
    wxTitle: string;
    copy: string;
    restart: string;
    goNow: string;
    start: string;
    hint: string;
    nogl: string;
    credits: string;
    creditsText: string;
    close: string;
    closeAria: string;
    otherLang: string;
    otherLangAria: string;
    email: string;
    linkedin: string;
    backToJourney: string;
    print: string;
  };
  profile: {
    name: string;
    title: string;
    summary: string[];
    email: string;
    linkedin: { url: string; label: string };
    location: string;
  };
  jobs: Job[];
  projects: { title: string; items: Project[] };
  ways: { title: string; items: Line[] };
  looking: { title: string; items: Line[] };
  skills: { title: string; items: SkillGroup[] };
  education: {
    title: string;
    school: string;
    degree: string;
    period: string;
    credentials: Credential[];
    languages: string;
  };
  contact: { title: string; text: string };
  intro: { kicker: string; title: [string, string]; lead: string };
  end: { kicker: string; title: string; text: string };
  stops: Stop[];
  cv: { experience: string; projects: string; skills: string; education: string; ways: string; looking: string; contact: string };
};
