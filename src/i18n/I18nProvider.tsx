"use client";
// I18nProvider — client-side language state. SSR renders Indonesian (matches
// <html lang="id"> from the root layout, so hydration is clean); on mount it
// reads the saved/ detected locale and, if different, re-renders in place. No
// page reload, no URL locale segment. Also stamps <html lang/dir> and mirrors
// the active locale into the non-React runtime (tr()).
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LOCALES, RTL_LOCALES, type Locale } from "./types";
import { MESSAGES } from "./messages";
import { interpolate, setActiveLocale } from "./runtime";

const KEY = "cag.lang";

type TFn = (key: string, vars?: Record<string, string | number>) => string;
interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TFn;
}

const I18nContext = createContext<I18nValue | null>(null);

/** First-visit guess from the browser. Non-Indonesian visitors default to English. */
function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "id";
  const n = (navigator.language || "en").toLowerCase();
  if (n.startsWith("id") || n.startsWith("in")) return "id";
  if (n.startsWith("es")) return "es";
  if (n.startsWith("zh")) return "zh";
  if (n.startsWith("ar")) return "ar";
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // SSR default = "id" so the server HTML matches <html lang="id"> and the first
  // client render (before the effect) hydrates without a mismatch.
  const [locale, setLocaleState] = useState<Locale>("id");

  useEffect(() => {
    let next: Locale | null = null;
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && (LOCALES as string[]).includes(saved)) next = saved as Locale;
    } catch {
      /* private mode */
    }
    setLocaleState(next ?? detectLocale());
  }, []);

  useEffect(() => {
    setActiveLocale(locale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* private mode */
    }
  }, []);

  const t = useCallback<TFn>(
    (key, vars) => {
      const raw = MESSAGES[locale][key] ?? MESSAGES.id[key] ?? key;
      return vars ? interpolate(raw, vars) : raw;
    },
    [locale]
  );

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useT(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within I18nProvider");
  return ctx;
}

/** Convenience: just the current locale (e.g. for Intl date/number formatting). */
export function useLocale(): Locale {
  return useT().locale;
}
