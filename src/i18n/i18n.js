import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import translationEN from "./locales/en/translation.json";
import translationAR from "./locales/ar/translation.json";
import translationFR from "./locales/fr/translation.json";
import studentCourseDetailsEN from "./locales/en/student-course-details.json";
import studentCourseDetailsAR from "./locales/ar/student-course-details.json";

const resources = {
  en: {
    translation: translationEN,
    "student-course-details": studentCourseDetailsEN,
  },
  ar: {
    translation: translationAR,
    "student-course-details": studentCourseDetailsAR,
  },
  fr: {
    translation: translationFR,
  },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    resources,
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false, // Not needed for react as it escapes by default
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    react: {
      useSuspense: false, // This is important for the language switcher to work
    },
  });

// Set initial document direction based on language
document.dir = i18n.language === "ar" ? "rtl" : "ltr";
document.documentElement.lang = i18n.language;

export default i18n;
