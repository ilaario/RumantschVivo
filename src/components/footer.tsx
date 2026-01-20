'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/i18nprovider';
import { isLocale, type Locale } from '@/lib/i18n/config';

export default function Footer() {
  const year = new Date().getFullYear();
  const t = useI18n();
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const locale: Locale = isLocale(segments[0]) ? (segments[0] as Locale) : 'it';

  const href = (path: string) => `/${locale}${path}`;

  return (
    <footer className="rm-footer">
      <div className="rm-footer__inner">
        {/* Brand */}
        <div className="rm-footer__brand">
          <div className="rm-footer__brandTop">
            <img className="rm-footer__logo" src="/images/logo2.png" alt="RumantschVivo" />
            <div>
              <div className="rm-footer__name">RumantschVivo</div>
              <div className="rm-footer__tagline">{t.footer.tagline}</div>
            </div>
          </div>

          <p className="rm-footer__blurb">{t.footer.blurb}</p>

          <p className="rm-footer__quote">
            <span className="rm-footer__quoteRm">{t.footer.quote_rm}</span>
            <span className="rm-footer__quoteIt"> {t.footer.quote_it}</span>
          </p>
        </div>

        {/* Learn */}
        <div className="rm-footer__col">
          <div className="rm-footer__title">{t.footer.learn.title}</div>
          <ul className="rm-footer__links">
            <li>
              <Link href={href('/learn')}>{t.footer.learn.a0}</Link>
            </li>
            <li>
              <Link href={href('/learn')}>{t.footer.learn.a1}</Link>
            </li>
            <li>
              <Link href={href('/learn')}>{t.footer.learn.a2}</Link>
            </li>
            <li>
              <Link href={href('/wip')}>{t.footer.learn.phrases}</Link>
            </li>
          </ul>
        </div>

        {/* Language & culture */}
        <div className="rm-footer__col">
          <div className="rm-footer__title">{t.footer.language.title}</div>
          <ul className="rm-footer__links">
            <li>
              <Link href={href('/wip')}>{t.footer.language.vocab}</Link>
            </li>
            <li>
              <Link href={href('/wip')}>{t.footer.language.stories}</Link>
            </li>
            <li>
              <Link href={href('/wip')}>{t.footer.language.audio}</Link>
            </li>
            <li>
              <Link href={href('/wip')}>{t.footer.language.variants}</Link>
            </li>
          </ul>
        </div>

        {/* Contribute */}
        <div className="rm-footer__col">
          <div className="rm-footer__title">{t.footer.contrib.title}</div>
          <ul className="rm-footer__links">
            <li>
              <Link href={href('/methodology')}>{t.footer.contrib.word}</Link>
            </li>
            <li>
              <Link href={href('/contributors')}>{t.footer.contrib.audio}</Link>
            </li>
            <li>
              <Link href={href('/contribute')}>{t.footer.contrib.error}</Link>
            </li>
            <li>
              <Link href={href('/wip')}>{t.footer.contrib.sources}</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="rm-footer__bottom">
        <div className="rm-footer__copy">
          © {year} RumantschVivo. {t.footer.rights}
        </div>
        <div className="rm-footer__legal">
          <Link href={href('/wip')}>{t.footer.legal.privacy}</Link>
          <span>·</span>
          <Link href={href('/wip')}>{t.footer.legal.terms}</Link>
          <span>·</span>
          <Link href={href('/wip')}>{t.footer.legal.contacts}</Link>
        </div>
      </div>
    </footer>
  );
}
