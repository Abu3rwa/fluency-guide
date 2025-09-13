import { landingPageFirebaseService } from "./landingPageFirebaseService";
import errorLoggingService from "./errorLoggingService";
import { uploadToStorage } from "../utils/firebaseStorage";

export const landingPageService = {
  // Hero Section
  getHeroContent: async () => {
    try {
      const landingPage =
        await landingPageFirebaseService.getActiveLandingPage();
      return landingPage.hero;
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "getHeroContent"
      );
      throw error;
    }
  },

  updateHeroContent: async (content) => {
    try {
      return await landingPageFirebaseService.updateHero(content);
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "updateHeroContent"
      );
      throw error;
    }
  },

  // Statistics
  getStatistics: async () => {
    try {
      const landingPage =
        await landingPageFirebaseService.getActiveLandingPage();
      return landingPage.statistics;
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "getStatistics"
      );
      throw error;
    }
  },

  updateStatistics: async (statistics) => {
    try {
      return await landingPageFirebaseService.updateStatistics(statistics);
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "updateStatistics"
      );
      throw error;
    }
  },

  // Features
  getFeatures: async () => {
    try {
      const landingPage =
        await landingPageFirebaseService.getActiveLandingPage();
      return landingPage.features;
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "getFeatures"
      );
      throw error;
    }
  },

  updateFeatures: async (features) => {
    try {
      return await landingPageFirebaseService.updateFeatures(features);
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "updateFeatures"
      );
      throw error;
    }
  },

  // Testimonials
  getTestimonials: async () => {
    try {
      const landingPage =
        await landingPageFirebaseService.getActiveLandingPage();
      return landingPage.testimonials;
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "getTestimonials"
      );
      throw error;
    }
  },

  updateTestimonials: async (testimonials) => {
    try {
      return await landingPageFirebaseService.updateTestimonials(testimonials);
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "updateTestimonials"
      );
      throw error;
    }
  },

  // FAQs
  getFaqs: async () => {
    try {
      const landingPage =
        await landingPageFirebaseService.getActiveLandingPage();
      return landingPage.faqs;
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "getFaqs"
      );
      throw error;
    }
  },

  updateFaqs: async (faqs) => {
    try {
      return await landingPageFirebaseService.updateFaqs(faqs);
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "updateFaqs"
      );
      throw error;
    }
  },

  // Contact Info
  getContactInfo: async () => {
    try {
      const landingPage =
        await landingPageFirebaseService.getActiveLandingPage();
      return landingPage.contactInfo;
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "getContactInfo"
      );
      throw error;
    }
  },

  updateContactInfo: async (contactInfo) => {
    try {
      return await landingPageFirebaseService.updateContactInfo(contactInfo);
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "updateContactInfo"
      );
      throw error;
    }
  },

  // File Upload
  uploadFile: async (file, section) => {
    try {
      const result = await uploadToStorage(file, section);
      return {
        success: true,
        url: result.url,
        path: result.path,
      };
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "uploadFile"
      );
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get all content
  getAllContent: async () => {
    try {
      return await landingPageFirebaseService.getActiveLandingPage();
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "getAllContent"
      );

      // If the error is related to being offline, provide default content
      if (
        error.message &&
        (error.message.includes("offline") ||
          error.message.includes("network") ||
          !navigator.onLine)
      ) {
        console.warn("Using fallback content due to connectivity issues");

        // Return default content so the app can still function
        return {
          hero: {
            title: "Master English with",
            titleHighlight: "Interactive Learning",
            subtitle:
              "Experience personalized English learning with AI-powered conversations.",
            backgroundImage: "/images/default-hero.jpg",
          },
          statistics: [
            { id: 1, label: "Students", value: 1000 },
            { id: 2, label: "Courses", value: 50 },
            { id: 3, label: "Success Rate", value: 95 },
          ],
          features: [
            {
              id: 1,
              title: "Interactive Learning",
              description: "Learn through conversation and practice",
              icon: "School",
            },
            {
              id: 2,
              title: "Personalized Approach",
              description: "Content tailored to your needs",
              icon: "Person",
            },
          ],
          testimonials: [],
          faqs: [],
          contactInfo: {
            email: "contact@example.com",
            phone: "+1 (555) 123-4567",
          },
        };
      }

      // For other errors, rethrow
      throw error;
    }
  },

  // Showcase Section
  getShowcaseContent: async () => {
    try {
      const landingPage =
        await landingPageFirebaseService.getActiveLandingPage();
      return landingPage.showcase || null;
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "getShowcaseContent"
      );
      throw error;
    }
  },

  updateShowcaseContent: async (content) => {
    try {
      return await landingPageFirebaseService.updateShowcase(content);
    } catch (error) {
      errorLoggingService.logServiceError(
        error,
        "landingPageService",
        "updateShowcaseContent"
      );
      throw error;
    }
  },
};
