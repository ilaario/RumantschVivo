import type { Locale } from '@/lib/i18n/config';

export function resolveLocalizedString(value: any, locale: Locale): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    return value[locale] ?? value.it ?? value.en ?? null;
  }

  return String(value);
}

export function resolveLocalizedBlocks(value: any, locale: Locale): any[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  // tipico: { _type: 'localizedBlockContent', it: [...], en: [...] }
  if (typeof value === 'object') {
    const blocks = value[locale] ?? value.it ?? value.en ?? [];
    return Array.isArray(blocks) ? blocks : [];
  }

  return [];
}

