import i18n from "./index";
import { type Locale } from "./settings";

export function getClientLocale(): Locale {
  const language = i18n.language;
  return language === "ja" || language === "en" ? language : "ja";
}

function mergeLocaleHeaders(extra?: HeadersInit): HeadersInit {
  const base: Record<string, string> = {
    "X-Locale": getClientLocale(),
  };

  if (!extra) {
    return base;
  }

  if (extra instanceof Headers) {
    for (const [key, value] of extra.entries()) {
      base[key] = value;
    }
    return base;
  }

  if (Array.isArray(extra)) {
    for (const [key, value] of extra) {
      base[key] = value;
    }
    return base;
  }

  return { ...base, ...extra };
}

export function localeHeaders(extra?: HeadersInit): HeadersInit {
  return mergeLocaleHeaders(extra);
}
