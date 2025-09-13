import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { uploadToStorage, deleteFromStorage } from "../utils/firebaseStorage";

const COLLECTION_NAME = "landingPage";
const SINGLE_DOC_ID = "main"; // Use a fixed document ID

export const landingPageFirebaseService = {
  // Debug function to list all documents in collection
  listAllDocuments: async () => {
    try {
      console.log("Listing all documents in", COLLECTION_NAME, "collection...");
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      console.log("Found", querySnapshot.size, "documents:");
      querySnapshot.forEach((doc) => {
        console.log("Document ID:", doc.id);
        console.log("Document data:", doc.data());
      });
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error listing documents:", error);
      return [];
    }
  },

  // Get the single landing page document
  getActiveLandingPage: async () => {
    try {
      if (!db) {
        console.error("Firestore instance is not initialized!");
        throw new Error("Firestore is not initialized");
      }

      // Check network status first
      if (!navigator.onLine) {
        console.error("Browser is offline, cannot fetch from Firestore");
        throw new Error(
          "Failed to get document because the client is offline. Please check your internet connection and try again."
        );
      }

      let docSnap;
      const docRef = doc(db, COLLECTION_NAME, SINGLE_DOC_ID);

      try {
        // Create a promise that rejects after 10 seconds
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Firestore query timed out")),
            10000
          );
        });

        // Race between the document fetch and the timeout
        docSnap = await Promise.race([getDoc(docRef), timeoutPromise]);
      } catch (fetchError) {
        console.error("Error fetching document:", fetchError);
        throw new Error(`Failed to fetch document: ${fetchError.message}`);
      }

      if (!docSnap.exists()) {
        console.log("Document does not exist! Available collections and documents:");
        console.log("Collection name:", COLLECTION_NAME);
        console.log("Document ID:", SINGLE_DOC_ID);
        console.log("Full document path:", `${COLLECTION_NAME}/${SINGLE_DOC_ID}`);
        
        // Try to find any existing documents in the collection
        console.log("Searching for existing documents in collection...");
        const allDocs = await this.listAllDocuments();
        if (allDocs.length > 0) {
          console.log("Found existing document, using:", allDocs[0].id);
          return allDocs[0];
        }
        
        console.log("Creating default landing page content...");
        // Create the single landing page document if it doesn't exist
        const defaultContent = {
          hero: {
            title: "Master English with",
            titleHighlight: "Interactive Learning",
            subtitle:
              "Experience personalized English learning with AI-powered conversations.",
            backgroundImage: "/default-hero.jpg",
            backgroundImagePath: null,
            demoVideoId: "default",
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
            overviewText:
              "Our comprehensive English learning platform combines modern technology with proven teaching methods to deliver an exceptional learning experience.",
            benefits: [
              {
                id: 1,
                label: "Flexible",
                color: "primary",
                orderIndex: 0,
              },
              {
                id: 2,
                label: "Accessible",
                color: "secondary",
                orderIndex: 1,
              },
              {
                id: 3,
                label: "Engaging",
                color: "success",
                orderIndex: 2,
              },
              {
                id: 4,
                label: "Personalized",
                color: "info",
                orderIndex: 3,
              },
            ],
            howItWorksText:
              "Our platform uses advanced AI technology to provide personalized learning experiences. Start with a quick assessment, and our intelligent system will create a custom learning path that adapts to your progress and preferences.",
            isActive: true,
          },
          version: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(docRef, defaultContent);
        return { id: SINGLE_DOC_ID, ...defaultContent };
      }

      const result = {
        id: docSnap.id,
        ...docSnap.data(),
      };
      
      return result;
    } catch (error) {
      console.error("Error getting landing page:", error);
      throw error;
    }
  },

  // Update hero section
  updateHero: async (content) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, SINGLE_DOC_ID);
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.data();

      let backgroundImageUrl = content.backgroundImage;
      let backgroundImagePath = content.backgroundImagePath;

      if (
        typeof content.backgroundImage === "string" &&
        content.backgroundImage.startsWith("data:")
      ) {
        // Delete old image if exists
        if (currentData?.hero?.backgroundImagePath) {
          await deleteFromStorage(currentData.hero.backgroundImagePath);
        }

        // Upload new image
        const uploadResult = await uploadToStorage(
          content.backgroundImage,
          "hero-backgrounds"
        );
        backgroundImageUrl = uploadResult.url;
        backgroundImagePath = uploadResult.path;
      }

      await updateDoc(docRef, {
        hero: {
          ...content,
          backgroundImage: backgroundImageUrl,
          backgroundImagePath: backgroundImagePath,
        },
        updatedAt: serverTimestamp(),
        version: (currentData?.version || 0) + 1,
      });

      return {
        ...content,
        backgroundImage: backgroundImageUrl,
        backgroundImagePath: backgroundImagePath,
      };
    } catch (error) {
      console.error("Error updating hero section:", error);
      throw error;
    }
  },

  // Update statistics
  updateStatistics: async (statistics) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, SINGLE_DOC_ID);
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.data();

      // Validate statistics data
      if (!Array.isArray(statistics)) {
        console.error(
          "Statistics must be an array, received:",
          typeof statistics
        );
        throw new Error("Statistics must be an array");
      }

      // Process and validate statistics
      const validStatistics = statistics
        .map((stat, index) => {
          // Validate statistic structure
          if (!stat || typeof stat !== "object") {
            console.warn("Invalid statistic:", stat);
            return null;
          }

          const processedStat = {
            id: stat.id || Date.now() + index,
            label: stat.label || "",
            value: typeof stat.value === "number" ? stat.value : 0,
          };

          return processedStat;
        })
        .filter((s) => s !== null);

      await updateDoc(docRef, {
        statistics: validStatistics.map((stat, index) => ({
          ...stat,
          displayOrder: index,
        })),
        updatedAt: serverTimestamp(),
        version: (currentData?.version || 0) + 1,
      });

      return validStatistics;
    } catch (error) {
      console.error("Error updating statistics:", error);
      throw error;
    }
  },

  // Update features
  updateFeatures: async (features) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, SINGLE_DOC_ID);
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.data();

      // Validate features data
      if (!Array.isArray(features)) {
        console.error("Features must be an array, received:", typeof features);
        throw new Error("Features must be an array");
      }

      // Process and validate features
      const validFeatures = features
        .map((feature, index) => {
          console.log(`Processing feature ${index}:`, feature);

          // Validate feature structure
          if (!feature || typeof feature !== "object") {
            console.warn("Invalid feature:", feature);
            return null;
          }

          const processedFeature = {
            id: feature.id || Date.now() + index,
            title: feature.title || "",
            description: feature.description || "",
            icon: feature.icon || "School",
            benefits: Array.isArray(feature.benefits)
              ? feature.benefits
              : ["", "", ""],
          };

          console.log(`Processed feature ${index}:`, processedFeature);
          return processedFeature;
        })
        .filter((f) => f !== null);

      console.log("Valid features to save:", validFeatures);

      await updateDoc(docRef, {
        features: validFeatures.map((feature, index) => ({
          ...feature,
          displayOrder: index,
        })),
        updatedAt: serverTimestamp(),
        version: (currentData?.version || 0) + 1,
      });

      console.log("Features saved successfully to Firebase");
      return validFeatures;
    } catch (error) {
      console.error("Error updating features:", error);
      throw error;
    }
  },

  // Update testimonials
  updateTestimonials: async (testimonials) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, SINGLE_DOC_ID);
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.data();

      // Validate testimonials data
      if (!Array.isArray(testimonials)) {
        console.error(
          "Testimonials must be an array, received:",
          typeof testimonials
        );
        throw new Error("Testimonials must be an array");
      }

      // Handle avatar uploads
      const updatedTestimonials = await Promise.all(
        testimonials.map(async (testimonial, index) => {
          console.log(`Processing testimonial ${index}:`, testimonial);

          // Validate testimonial structure
          if (!testimonial || typeof testimonial !== "object") {
            console.warn("Invalid testimonial:", testimonial);
            return null;
          }

          let avatarUrl = testimonial.avatar || "";
          let avatarPath = testimonial.avatarPath || "";

          if (
            typeof testimonial.avatar === "string" &&
            testimonial.avatar.startsWith("data:")
          ) {
            // Delete old avatar if exists
            const oldTestimonial = currentData?.testimonials?.find(
              (t) => t.id === testimonial.id
            );
            if (oldTestimonial?.avatarPath) {
              await deleteFromStorage(oldTestimonial.avatarPath);
            }

            // Upload new avatar
            const uploadResult = await uploadToStorage(
              testimonial.avatar,
              "testimonial-avatars"
            );
            avatarUrl = uploadResult.url;
            avatarPath = uploadResult.path;
          }

          const processedTestimonial = {
            id: testimonial.id || Date.now() + index,
            name: testimonial.name || "",
            role: testimonial.role || "",
            quote: testimonial.quote || "",
            avatar: avatarUrl,
            avatarPath: avatarPath,
            rating: testimonial.rating || 5,
          };

          console.log(`Processed testimonial ${index}:`, processedTestimonial);
          return processedTestimonial;
        })
      );

      // Filter out null values
      const validTestimonials = updatedTestimonials.filter((t) => t !== null);
      console.log("Valid testimonials to save:", validTestimonials);

      // Save to Firebase
      await updateDoc(docRef, {
        testimonials: validTestimonials.map((testimonial, index) => ({
          ...testimonial,
          displayOrder: index,
        })),
        updatedAt: serverTimestamp(),
        version: (currentData?.version || 0) + 1,
      });

      console.log("Testimonials saved successfully to Firebase");
      return validTestimonials;
    } catch (error) {
      console.error("Error updating testimonials:", error);
      throw error;
    }
  },

  // Update FAQs
  updateFaqs: async (faqs) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, SINGLE_DOC_ID);
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.data();

      // Validate FAQs data
      if (!Array.isArray(faqs)) {
        console.error("FAQs must be an array, received:", typeof faqs);
        throw new Error("FAQs must be an array");
      }

      // Process and validate FAQs
      const validFaqs = faqs
        .map((faq, index) => {
          console.log(`Processing FAQ ${index}:`, faq);

          // Validate FAQ structure
          if (!faq || typeof faq !== "object") {
            console.warn("Invalid FAQ:", faq);
            return null;
          }

          const processedFaq = {
            id: faq.id || Date.now() + index,
            question: faq.question || "",
            answer: faq.answer || "",
          };

          console.log(`Processed FAQ ${index}:`, processedFaq);
          return processedFaq;
        })
        .filter((f) => f !== null);

      console.log("Valid FAQs to save:", validFaqs);

      await updateDoc(docRef, {
        faqs: validFaqs.map((faq, index) => ({
          ...faq,
          displayOrder: index,
        })),
        updatedAt: serverTimestamp(),
        version: (currentData?.version || 0) + 1,
      });

      console.log("FAQs saved successfully to Firebase");
      return validFaqs;
    } catch (error) {
      console.error("Error updating FAQs:", error);
      throw error;
    }
  },

  // Update contact info
  updateContactInfo: async (contactInfo) => {
    try {
      console.log("Firebase: Updating contact info:", contactInfo);
      const docRef = doc(db, COLLECTION_NAME, SINGLE_DOC_ID);
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.data();

      const updateData = {
        contactInfo,
        updatedAt: serverTimestamp(),
        version: (currentData?.version || 0) + 1,
      };

      console.log("Firebase: Update data:", updateData);
      await updateDoc(docRef, updateData);

      console.log("Firebase: Contact info saved successfully");
      return contactInfo;
    } catch (error) {
      console.error("Error updating contact info:", error);
      throw error;
    }
  },

  // Update showcase content
  updateShowcase: async (showcase) => {
    try {
      console.log("Firebase: Updating showcase content:", showcase);
      const docRef = doc(db, COLLECTION_NAME, SINGLE_DOC_ID);
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.data();

      // Validate showcase data
      if (!showcase || typeof showcase !== "object") {
        console.error("Showcase must be an object, received:", typeof showcase);
        throw new Error("Showcase must be an object");
      }

      // Process and validate showcase content
      const validShowcase = {
        title: showcase.title || "Discover Our Learning Approach",
        overviewText: showcase.overviewText || "",
        benefits: Array.isArray(showcase.benefits)
          ? showcase.benefits.map((benefit, index) => ({
              id: benefit.id || Date.now() + index,
              label: benefit.label || "",
              color: benefit.color || "primary",
              orderIndex: index,
            }))
          : [],
        howItWorksText: showcase.howItWorksText || "",
        isActive: showcase.isActive !== undefined ? showcase.isActive : true,
      };

      console.log("Valid showcase to save:", validShowcase);

      const updateData = {
        showcase: validShowcase,
        updatedAt: serverTimestamp(),
        version: (currentData?.version || 0) + 1,
      };

      console.log("Firebase: Update data:", updateData);
      await updateDoc(docRef, updateData);

      console.log("Firebase: Showcase content saved successfully");
      return validShowcase;
    } catch (error) {
      console.error("Error updating showcase content:", error);
      throw error;
    }
  },
};
