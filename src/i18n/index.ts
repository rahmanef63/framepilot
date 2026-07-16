// Public i18n barrel. Components: `import { useT } from "@/i18n"` → const { t } = useT().
// Plain .ts logic: `import { tr } from "@/i18n"` → tr("some.key").
export { I18nProvider, useT } from "./I18nProvider";
export { tr, setActiveLocale } from "./runtime";
export { LOCALES, LOCALE_NAMES, RTL_LOCALES } from "./types";
export type { Locale, Dict } from "./types";
