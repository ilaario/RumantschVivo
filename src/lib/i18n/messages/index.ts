import type { Locale } from '../config';
import { messages as it } from './it';
import { messages as en } from './en';
import { messages as de } from './de';
import { messages as fr } from './fr';

const all = { it, en, de, fr } as const;

export type Messages = (typeof all)[Locale];

export function getMessages(locale: Locale): Messages {
  return all[locale] ?? all.it;
}
