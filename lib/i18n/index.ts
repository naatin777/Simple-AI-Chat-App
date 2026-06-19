"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./resources/en.json";
import ja from "./resources/ja.json";
import { defaultLocale } from "./settings";

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: defaultLocale,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (locale) => {
  if (typeof window === "undefined") {return;}
  window.localStorage.setItem("locale", locale);
  document.documentElement.lang = locale;
});

export default i18n;
