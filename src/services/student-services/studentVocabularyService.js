import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const COLLECTION_NAME = "commonWords";

const studentVocabularyService = {
  // Get vocabulary words with optional filtering
  async getVocabularyWords(filters = {}) {
    try {
      const {
        level,
        category,
        limit: resultLimit,
        favoritesOnly,
        userId,
      } = filters;
      
      console.log("🔍 getVocabularyWords called with filters:", filters);
      
      // Ensure db is available
      if (!db) {
        console.error("❌ Firebase database is not initialized");
        throw new Error("Firebase database is not initialized");
      }
      
      let vocabularyQuery = collection(db, COLLECTION_NAME);
      console.log("📚 Collection name:", COLLECTION_NAME);

      // Build query with filters
      const conditions = [];
      if (level) conditions.push(where("difficulty_level", "==", level));
      if (category) conditions.push(where("category", "==", category));

      console.log("🔧 Query conditions:", conditions);

      // Apply conditions and ordering
      let queryParams = [
        vocabularyQuery,
        ...conditions
      ];
      
      // Order by difficulty_level (which exists in your documents)
      queryParams.push(orderBy("difficulty_level", "asc"));
      
      // Add limit if specified
      if (resultLimit) {
        queryParams.push(limit(resultLimit));
      }
      
      vocabularyQuery = query(...queryParams);
      console.log("📋 Query params:", queryParams.length);

      const snapshot = await getDocs(vocabularyQuery);
      console.log("📊 Snapshot size:", snapshot.docs.length);
      
      let words = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          word: data.word,
          definition: data.meaning_arabic, // Map to expected field
          level: data.difficulty_level, // Map to expected field
          category: data.category,
          frequency: data.frequency,
          partOfSpeech: data.part_of_speech,
          pronunciation: data.pronunciation,
          example: data.example,
          exampleMeaning: data.example_meaning_arabic,
          // Keep original fields for backward compatibility
          ...data,
        };
      });

      console.log("📝 Found words:", words.length);
      if (words.length > 0) {
        console.log("📖 Sample word:", words[0]);
        console.log("📋 Sample word fields:", Object.keys(words[0]));
      } else {
        console.log("❌ No words found. Let's check the raw documents:");
        snapshot.docs.forEach((doc, index) => {
          console.log(`📄 Document ${index}:`, doc.id, doc.data());
        });
      }

      // If favoritesOnly is true and userId is provided, filter for favorites
      if (favoritesOnly && userId) {
        console.log("⭐ Filtering for favorites for user:", userId);
        // Get user's favorite words
        const progressRef = collection(db, "vocabularyProgress");
        const favoritesQuery = query(
          progressRef,
          where("userId", "==", userId),
          where("isFavorite", "==", true)
        );
        const favoritesSnapshot = await getDocs(favoritesQuery);
        const favoriteWordIds = favoritesSnapshot.docs.map(
          (doc) => doc.data().wordId
        );

        console.log("💖 Favorite word IDs:", favoriteWordIds);

        // Filter words to only include favorites
        words = words.filter((word) => favoriteWordIds.includes(word.id));
        console.log("📝 Words after favorite filter:", words.length);
      }

      console.log("✅ Returning words:", words.length);
      return words;
    } catch (error) {
      console.error("❌ Error fetching vocabulary words:", error);
      // Return empty array instead of throwing to prevent crashes
      return [];
    }
  },

  // Get a single vocabulary word by ID
  async getVocabularyWordById(wordId) {
    try {
      const wordRef = doc(db, COLLECTION_NAME, wordId);
      const wordDoc = await getDoc(wordRef);

      if (!wordDoc.exists()) {
        throw new Error("Vocabulary word not found");
      }

      return {
        id: wordDoc.id,
        ...wordDoc.data(),
      };
    } catch (error) {
      console.error("Error fetching vocabulary word:", error);
      throw error;
    }
  },

  // Search vocabulary words
  async searchVocabularyWords(searchTerm) {
    try {
      // Firestore doesn't support native text search, so we'll fetch and filter
      // In a production app, consider using Algolia or another search service
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const words = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Simple client-side search
      return words.filter(
        (word) =>
          word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          word.definition.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching vocabulary words:", error);
      throw error;
    }
  },

  // Add a new vocabulary word (admin function)
  async addVocabularyWord(wordData) {
    try {
      const newWord = {
        ...wordData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), newWord);
      return {
        id: docRef.id,
        ...newWord,
      };
    } catch (error) {
      console.error("Error adding vocabulary word:", error);
      throw error;
    }
  },

  // Update a vocabulary word (admin function)
  async updateVocabularyWord(wordId, wordData) {
    try {
      const wordRef = doc(db, COLLECTION_NAME, wordId);
      const updateData = {
        ...wordData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(wordRef, updateData);
      return {
        id: wordId,
        ...updateData,
      };
    } catch (error) {
      console.error("Error updating vocabulary word:", error);
      throw error;
    }
  },
};

export default studentVocabularyService;
