import type { Locale } from '../config';
import { messages as it } from './it';
import { messages as en } from './en';

const all = { it, en } as const;

export type Messages = (typeof all)[Locale];

export function getMessages(locale: Locale): Messages {
  return all[locale] ?? all.it;
}