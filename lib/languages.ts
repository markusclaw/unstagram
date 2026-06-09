export const LANGS: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "tl", label: "Tagalog" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "th", label: "ไทย" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
  { code: "hi", label: "हिन्दी" },
  { code: "ar", label: "العربية" },
  { code: "he", label: "עברית" },
  { code: "tr", label: "Türkçe" },
  { code: "ru", label: "Русский" },
  { code: "uk", label: "Українська" },
  { code: "pl", label: "Polski" },
  { code: "nl", label: "Nederlands" },
  { code: "sv", label: "Svenska" },
];

const NAMES: Record<string, string> = {
  en: "English", es: "Spanish", fr: "French", de: "German", it: "Italian", pt: "Portuguese",
  tl: "Tagalog", id: "Indonesian", vi: "Vietnamese", th: "Thai", ja: "Japanese", ko: "Korean",
  zh: "Chinese", hi: "Hindi", ar: "Arabic", he: "Hebrew", tr: "Turkish", ru: "Russian",
  uk: "Ukrainian", pl: "Polish", nl: "Dutch", sv: "Swedish",
};

export function languageName(code: string): string {
  return NAMES[code] ?? "English";
}
export function normalizeLang(input?: string | null): string {
  if (!input) return "en";
  const code = input.toLowerCase().split("-")[0];
  return LANGS.some((l) => l.code === code) ? code : "en";
}
