import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { landingPageService } from "../services/landingPageService";
import { statisticsService } from "../services/statisticsService";
import errorLoggingService from "../services/errorLoggingService";

const LandingPageContext = createContext();

export const useLandingPage = () => {
  const context = useContext(LandingPageContext);
  if (!context) {
    throw new Error("useLandingPage must be used within a LandingPageProvider");
  }
  return context;
};

export const LandingPageProvider = ({ children }) => {
  // Hero Section State
  const [heroContent, setHeroContent] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    imageUrl: "",
  });

  // Statistics Section State
  const [statistics, setStatistics] = useState([]);

  // Features Section State
  const [features, setFeatures] = useState([]);

  // Testimonials Section State
  const [testimonials, setTestimonials] = useState([]);

  // FAQ Section State
  const [faqs, setFaqs] = useState([]);

  // Contact Section State
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
    location: "",
    socialLinks: {
      facebook: "",
      twitter: "",
      linkedin: "",
      whatsapp: "",
      whatsappMessage: "",
      tiktok: "",
    },
  });

  // Showcase Section State
  const [showcaseContent, setShowcaseContent] = useState({
    title: "",
    overviewText: "",
    howItWorksText: "",
    benefits: [],
    isActive: true,
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real statistics state
  const [realStatistics, setRealStatistics] = useState({
    learningContent: {},
    studentEngagement: {},
    achievements: {},
    platformPerformance: {},
  });
  const [isCalculatingStats, setIsCalculatingStats] = useState(false);

  // Track if data has been fetched to prevent infinite loops
  const hasFetchedData = useRef(false);

  // Fetch initial data with improved error handling
  const fetchData = useCallback(async () => {
    if (hasFetchedData.current) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Add a small delay to ensure all modules are properly loaded
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try to get content with better error handling
      let content;
      try {
        content = await landingPageService.getAllContent();
      } catch (fetchError) {
        console.error("Failed to fetch landing page content:", fetchError);

        // Use fallback content instead of failing
        content = {
          hero: {
            title: "Master English with",
            titleHighlight: "Interactive Learning",
            subtitle: "Experience personalized English learning with AI-powered conversations.",
            backgroundImage: "/default-hero.jpg",
          },
          statistics: [],
          features: [],
          testimonials: [],
          faqs: [],
          contactInfo: {
            email: "contact@example.com",
            phone: "+1 (555) 123-4567",
            location: "Default Location",
            socialLinks: {},
          },
          showcase: {
            title: "Discover Our Learning Approach",
            overviewText: "Our comprehensive English learning platform combines modern technology with proven teaching methods.",
            benefits: [],
            howItWorksText: "Our platform uses advanced AI technology to provide personalized learning experiences.",
            isActive: true,
          },
        };
      }

      setHeroContent(
        content.hero || {
          title: "",
          subtitle: "",
          description: "",
          buttonText: "",
          buttonLink: "",
          imageUrl: "",
        }
      );
      setStatistics(content.statistics || []);
      setFeatures(content.features || []);
      setTestimonials(content.testimonials || []);
      setFaqs(content.faqs || []);
      setContactInfo(content.contactInfo);
      setShowcaseContent(
        content.showcase || {
          title: "",
          overviewText: "",
          howItWorksText: "",
          benefits: [],
          isActive: true,
        }
      );
      setError(null);

      // Calculate real statistics after loading landing page data
      try {
        setIsCalculatingStats(true);
        const allStats = await statisticsService.getAllStatistics();
        setRealStatistics(allStats);
      } catch (statsError) {
        console.error("Error calculating real statistics:", statsError);
        // Don't fail the entire initialization for stats errors
        errorLoggingService.logServiceError(
          statsError,
          "LandingPageContext",
          "calculateRealStatistics"
        );
      } finally {
        setIsCalculatingStats(false);
      }

      hasFetchedData.current = true;
    } catch (error) {
      console.error("Error fetching landing page data:", error);
      // Don't fail the entire app initialization

      // Set fallback data
      setHeroContent({
        title: "Master English with",
        titleHighlight: "Interactive Learning",
        subtitle: "Experience personalized English learning with AI-powered conversations.",
        backgroundImage: "/default-hero.jpg",
      });
      setStatistics([]);
      setFeatures([]);
      setTestimonials([]);
      setFaqs([]);
      setContactInfo({
        email: "contact@example.com",
        phone: "+1 (555) 123-4567",
        location: "Default Location",
        socialLinks: {},
      });
      setShowcaseContent({
        title: "Discover Our Learning Approach",
        overviewText: "Our comprehensive English learning platform combines modern technology with proven teaching methods.",
        benefits: [],
        howItWorksText: "Our platform uses advanced AI technology to provide personalized learning experiences.",
        isActive: true,
      });

      errorLoggingService.logServiceError(
        error,
        "LandingPageContext",
        "fetchData"
      );
      setError("Using offline content due to connection issues");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Save Hero Content
  const saveHeroContent = useCallback(async (content) => {
    try {
      const result = await landingPageService.updateHeroContent(content);
      setHeroContent(result);
      return { success: true };
    } catch (error) {
      console.error("Context: Error saving hero content:", error);
      errorLoggingService.logServiceError(
        error,
        "LandingPageContext",
        "saveHeroContent"
      );
      return { success: false, error };
    }
  }, []);

  // Save Statistics
  const saveStatistics = useCallback(async (stats) => {
    try {
      const result = await landingPageService.updateStatistics(stats);
      setStatistics(result);
      return { success: true };
    } catch (error) {
      console.error("Context: Error saving statistics:", error);
      errorLoggingService.logServiceError(
        error,
        "LandingPageContext",
        "saveStatistics"
      );
      return { success: false, error };
    }
  }, []);

  // Save Features
  const saveFeatures = useCallback(async (features) => {
    try {
      const result = await landingPageService.updateFeatures(features);
      setFeatures(result);
      return { success: true };
    } catch (error) {
      console.error("Context: Error saving features:", error);
      errorLoggingService.logServiceError(
        error,
        "LandingPageContext",
        "saveFeatures"
      );
      return { success: false, error };
    }
  }, []);

  // Save Testimonials
  const saveTestimonials = useCallback(async (testimonials) => {
    try {
      const result = await landingPageService.updateTestimonials(testimonials);
      setTestimonials(result);
      return { success: true };
    } catch (error) {
      console.error("Context: Error saving testimonials:", error);
      errorLoggingService.logServiceError(
        error,
        "LandingPageContext",
        "saveTestimonials"
      );
      return { success: false, error };
    }
  }, []);

  // Save FAQs
  const saveFaqs = useCallback(async (faqs) => {
    try {
      const result = await landingPageService.updateFaqs(faqs);
      setFaqs(result);
      return { success: true };
    } catch (error) {
      console.error("Context: Error saving FAQs:", error);
      errorLoggingService.logServiceError(
        error,
        "LandingPageContext",
        "saveFaqs"
      );
      return { success: false, error };
    }
  }, []);

  // Save Contact Info
  const saveContactInfo = useCallback(async (contactInfo) => {
    try {
      const result = await landingPageService.updateContactInfo(contactInfo);
      setContactInfo(result);
      return { success: true };
    } catch (error) {
      console.error("Context: Error saving contact info:", error);
      errorLoggingService.logServiceError(
        error,
        "LandingPageContext",
        "saveContactInfo"
      );
      return { success: false, error };
    }
  }, []);

  const saveShowcaseContent = useCallback(async (content) => {
    try {
      const result = await landingPageService.updateShowcaseContent(content);
      setShowcaseContent(result);
      return { success: true };
    } catch (error) {
      console.error("Context: Error saving showcase content:", error);
      errorLoggingService.logServiceError(
        error,
        "LandingPageContext",
        "saveShowcaseContent"
      );
      return { success: false, error };
    }
  }, []);

  // Get landing page statistics
  const getLandingPageStats = useCallback(async () => {
    try {
      return await statisticsService.getLandingPageStats();
    } catch (error) {
      console.error("Error getting landing page stats:", error);
      errorLoggingService.logServiceError(
        error,
        "LandingPageContext",
        "getLandingPageStats"
      );
      return [];
    }
  }, []);

  // File Upload Helper
  const uploadFile = useCallback(async (file, folder = "landing-page") => {
    try {
      console.log("🔄 LandingPageContext: Starting file upload", {
        fileName: file.name,
        fileSize: file.size,
        folder
      });
      
      const result = await landingPageService.uploadFile(file, folder);
      
      console.log("🔄 LandingPageContext: Upload service result", result);
      
      if (result && result.success) {
        return {
          success: true,
          url: result.url,
          path: result.path
        };
      } else {
        console.error("🔄 LandingPageContext: Upload failed", result);
        return {
          success: false,
          error: result.error || "Upload failed"
        };
      }
    } catch (error) {
      console.error("🔄 LandingPageContext: Error uploading file:", error);
      errorLoggingService.logServiceError(
        error,
        "LandingPageContext",
        "uploadFile"
      );
      return {
        success: false,
        error: error.message || "Upload failed"
      };
    }
  }, []);

  // Reorder Items Helper
  const reorderItems = useCallback((items, index, direction) => {
    const newItems = [...items];
    if (direction === "up" && index > 0) {
      [newItems[index], newItems[index - 1]] = [
        newItems[index - 1],
        newItems[index],
      ];
    } else if (direction === "down" && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [
        newItems[index + 1],
        newItems[index],
      ];
    }
    return newItems;
  }, []);

  const value = {
    // State
    heroContent,
    statistics,
    features,
    testimonials,
    faqs,
    contactInfo,
    showcaseContent,
    realStatistics,
    loading: isLoading, // Alias for ContactSection compatibility
    isLoading,
    error,
    isCalculatingStats,

    // Setters
    setHeroContent,
    setStatistics,
    setFeatures,
    setTestimonials,
    setFaqs,
    setContactInfo,
    setShowcaseContent,

    // Helpers
    reorderItems,
    uploadFile,

    // API Functions
    saveHeroContent,
    saveStatistics,
    saveFeatures,
    saveTestimonials,
    saveFaqs,
    saveContactInfo,
    saveShowcaseContent,
    getLandingPageStats,
  };

  return (
    <LandingPageContext.Provider value={value}>
      {children}
    </LandingPageContext.Provider>
  );
};
