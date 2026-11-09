import { notFound } from 'next/navigation';
import { lang } from 'next/root-params';
import en from './en';
import vi from './vi';
import { hasLocale, type Dict, type Locale } from './types';

const DICTS: Record<Locale, Dict> = { vi, en };

/** The dictionary of the current route's language (/vi or /en); unknown languages are a 404. */
export async function getDict(): Promise<Dict> {
  const l = await lang();
  if (!hasLocale(l)) notFound();
  return DICTS[l];
}

export const otherLocale = (l: Locale): Locale => (l === 'vi' ? 'en' : 'vi');
export { hasLocale, LOCALES } from './types';
export type { Dict, Job, Line, Locale, Stop } from './types';
