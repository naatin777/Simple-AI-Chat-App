import en from "./resources/en.json";
import ja from "./resources/ja.json";
import { locales, type Locale, resolveLocale } from "./settings";

const resources = {
  en,
  ja,
} as const;

type TranslationKey =
  | "conversation.defaultTitle"
  | "conversation.copySuffix";

function getNestedValue(
  object: Record<string, unknown>,
  path: string,
): string | undefined {
  const value = path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object" || !(key in current)) {
      return undefined;
    }

    return Reflect.get(current, key);
  }, object);

  return typeof value === "string" ? value : undefined;
}

export function getTranslation(
  locale: string | null | undefined,
  key: TranslationKey,
): string {
  const resolvedLocale = resolveLocale(locale);
  return (
    getNestedValue(resources[resolvedLocale], key) ??
    getNestedValue(resources.en, key) ??
    key
  );
}

export function getDefaultConversationTitles(): string[] {
  return locales.map((locale) =>
    getTranslation(locale, "conversation.defaultTitle"),
  );
}

export function isDefaultConversationTitle(title: string): boolean {
  return getDefaultConversationTitles().includes(title);
}

export function getDuplicateTitle(
  sourceTitle: string,
  locale: string | null | undefined,
): string {
  const suffix = getTranslation(locale, "conversation.copySuffix");
  return `${sourceTitle} (${suffix})`;
}

export function getRequestLocale(req: Request): Locale {
  return resolveLocale(req.headers.get("X-Locale"));
}
