// i18n core types + locale registry. Lightweight client-side i18n (no next-intl,
// no [locale] routing) — the app is client-heavy so we switch language in place
// via a context + localStorage, and set <html lang/dir> on change.

export type Locale = "id" | "en" | "es" | "zh" | "ar";

/** Every supported locale, in menu order. Indonesian first (original/default). */
export const LOCALES: Locale[] = ["id", "en", "es", "zh", "ar"];

/** Native display name for the language switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  id: "Bahasa Indonesia",
  en: "English",
  es: "Español",
  zh: "中文",
  ar: "العربية",
};

/** Right-to-left locales — flips <html dir="rtl"> and mirrors the layout. */
export const RTL_LOCALES: Locale[] = ["ar"];

/** A flat message catalog: dotted key → translated string. */
export type Dict = Record<string, string>;
