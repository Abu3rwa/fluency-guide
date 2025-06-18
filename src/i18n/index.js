import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import arTranslation from "./locales/ar/translation.json";
import enTranslation from "./locales/en/translation.json";

// Get browser language
const getBrowserLanguage = () => {
  const lang = navigator.language || navigator.userLanguage;
  return lang.startsWith("ar") ? "ar" : "en";
};

// Set document direction based on language
const setDocumentDirection = (lang) => {
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
};

i18n
  .use(Backend)
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
      order: ["navigator", "htmlTag", "path", "subdomain"],
      caches: ["localStorage"],
    },
  });

// Set initial direction
setDocumentDirection(getBrowserLanguage());

// Listen for language changes
i18n.on("languageChanged", (lng) => {
  setDocumentDirection(lng);
});

export default i18n;
