"use client";

import { useEffect } from "react";
import i18n from "@/lib/i18n";
import { defaultLocale, isLocale } from "@/lib/i18n/settings";

const LOCALE_STORAGE_KEY = "locale";

function resolveClientLocale(): string {
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && isLocale(stored)) return stored;

  const browserLanguage = window.navigator.language.split("-")[0];
  if (isLocale(browserLanguage)) return browserLanguage;

  return defaultLocale;
}

type I18nProviderProps = {
  children: React.ReactNode;
};

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    const locale = resolveClientLocale();

    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    } else {
      document.documentElement.lang = locale;
    }
  }, []);

  return children;
}
