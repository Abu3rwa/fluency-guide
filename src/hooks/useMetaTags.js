import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const useMetaTags = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const updateMetaTags = () => {
      const lang = i18n.language;

      // Language-specific content
      const content = {
        en: {
          title: "Sudanglish - Master English with Real Conversations",
          description:
            "Learn English through interactive videos, quizzes, and real conversations with other learners. Practice speaking with actual people and improve your English skills naturally.",
          ogDescription:
            "Learn English through interactive videos, quizzes, and real conversations with other learners. Practice speaking with actual people and improve your English skills naturally.",
          twitterDescription:
            "Learn English through interactive videos, quizzes, and real conversations with other learners. Practice speaking with actual people and improve your English skills naturally.",
        },
        ar: {
          title: "سودانجليش - أتقن اللغة الإنجليزية بالمحادثات الحقيقية",
          description:
            "تعلم اللغة الإنجليزية من خلال الفيديوهات التفاعلية والاختبارات والمحادثات الحقيقية مع متعلمين آخرين. تدرب على التحدث مع أشخاص حقيقيين وحسن مهاراتك في اللغة الإنجليزية بشكل طبيعي.",
          ogDescription:
            "تعلم اللغة الإنجليزية من خلال الفيديوهات التفاعلية والاختبارات والمحادثات الحقيقية مع متعلمين آخرين. تدرب على التحدث مع أشخاص حقيقيين وحسن مهاراتك في اللغة الإنجليزية بشكل طبيعي.",
          twitterDescription:
            "تعلم اللغة الإنجليزية من خلال الفيديوهات التفاعلية والاختبارات والمحادثات الحقيقية مع متعلمين آخرين. تدرب على التحدث مع أشخاص حقيقيين وحسن مهاراتك في اللغة الإنجليزية بشكل طبيعي.",
        },
      };

      const langContent = content[lang] || content.ar;

      // Update title
      document.title = langContent.title;

      // Update description
      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) descMeta.setAttribute("content", langContent.description);

      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", langContent.title);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", langContent.ogDescription);

      // Update Twitter Card tags
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute("content", langContent.title);

      const twitterDesc = document.querySelector(
        'meta[name="twitter:description"]'
      );
      if (twitterDesc)
        twitterDesc.setAttribute("content", langContent.twitterDescription);

      // Update HTML lang attribute
      document.documentElement.lang = lang;

      // Update og:locale
      const ogLocale = lang === "ar" ? "ar_SA" : "en_US";
      const ogLocaleMeta = document.querySelector('meta[property="og:locale"]');
      if (ogLocaleMeta) ogLocaleMeta.setAttribute("content", ogLocale);

      // Call the global function if it exists
      if (window.updatePageMetaTags) {
        window.updatePageMetaTags();
      }
    };

    // Update meta tags when language changes
    updateMetaTags();

    // Listen for language changes
    i18n.on("languageChanged", updateMetaTags);

    return () => {
      i18n.off("languageChanged", updateMetaTags);
    };
  }, [i18n]);
};
