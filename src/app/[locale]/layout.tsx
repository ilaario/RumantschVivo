// src/app/[locale]/layout.tsx
import '../globals.css'; // se serve, tienilo qui o nel root, ma una volta sola

import AppShell from '../appshell';
import Footer from '@/components/footer';

import { I18nProvider } from '@/lib/i18n/i18nprovider';
import { getMessages } from '@/lib/i18n/messages';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;

  const messages = getMessages(locale);

  return (
    <I18nProvider locale={locale} messages={messages}>
      <div className="app-shell">
        <AppShell>
          <main className="app-main">{children}</main>
        </AppShell>
        <Footer />
      </div>
    </I18nProvider>
  );
}