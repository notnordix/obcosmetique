// Remove the server-only import
import type { Locale } from "./i18n-config"

// We enumerate all dictionaries here for better linting and typescript support
// We also get the default import for cleaner types
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  fr: () => import("./dictionaries/fr.json").then((module) => module.default),
  ar: () => import("./dictionaries/ar.json").then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
  try {
    // Try to get the requested dictionary
    return (await dictionaries[locale]?.()) ?? (await dictionaries.en())
  } catch (error) {
    console.error(`Error loading dictionary for locale: ${locale}`, error)
    // Fallback to English if there's an error
    return dictionaries.en()
  }
}
