export const SUPPORTED_LOCALES = ['it', 'en', 'fr', 'de'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABEL: Record<SupportedLocale, string> = {
  it: 'Italiano',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
};