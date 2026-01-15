// src/lib/i18n/path.ts
export function withLocale(locale: string, path: string) {
    // normalizza il path: "learn" -> "/learn"
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
    // risultato: "/it/learn", "/en/login", ecc.
    return `/${locale}${cleanPath}`;
  }