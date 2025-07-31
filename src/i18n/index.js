import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import arTranslation from "./locales/ar/translation.json";
import enTranslation from "./locales/en/translation.json";

const setDocumentDirection = (lang) => {
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ar: {
        translation: arTranslation,
      },
    },
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag", "path", "subdomain"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

i18n.on("languageChanged", (lng) => {
  console.log("Language changed to:", lng);
  setDocumentDirection(lng);
});

// Set initial direction based on detected language after i18n is initialized
setDocumentDirection(i18n.language);

// Debug: Log current language and available resources
console.log("Current language:", i18n.language);
console.log("Available languages:", Object.keys(i18n.options.resources));
console.log(
  "Arabic translations available:",
  i18n.hasResourceBundle("ar", "translation")
);
console.log(
  "English translations available:",
  i18n.hasResourceBundle("en", "translation")
);
console.log(
  "Translation keys available:",
  Object.keys(i18n.store.data[i18n.language]?.translation || {})
);

export default i18n;
