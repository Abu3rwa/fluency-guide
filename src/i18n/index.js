import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import arTranslation from "./locales/ar/translation.json";
import enTranslation from "./locales/en/translation.json";
import arSessions from "./locales/ar/sessions.json";
import enSessions from "./locales/en/sessions.json";
import arAuth from "./locales/ar/auth.json";
import enAuth from "./locales/en/auth.json";
import arCourses from "./locales/ar/courses.json";
import enCourses from "./locales/en/courses.json";
import arAdmin from "./locales/ar/admin.json";
import enAdmin from "./locales/en/admin.json";
import arInstructorDashboard from "./locales/ar/instructorDashboard.json";
import enInstructorDashboard from "./locales/en/instructorDashboard.json";

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
        sessions: enSessions,
        auth: enAuth,
        courses: enCourses,
        admin: enAdmin,
        instructorDashboard: enInstructorDashboard,
      },
      ar: {
        translation: arTranslation,
        sessions: arSessions,
        auth: arAuth,
        courses: arCourses,
        admin: arAdmin,
        instructorDashboard: arInstructorDashboard,
      },
    },
    fallbackLng: "ar",
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

 
 
 

export default i18n;
