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
import studentDictionaryApiService from './studentDictionaryApiService';
import studentAudioService from './studentAudioService';

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
      let queryParams = [vocabularyQuery, ...conditions];

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
          audioUrl: data.audio_url,
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
        const favoriteWordIds = favoritesSnapshot.docs.map((doc) => doc.data().wordId);

        // Filter words to only include favorites
        words = words.filter((word) => favoriteWordIds.includes(word.id));
        console.log("⭐ Filtered to favorites:", words.length);
      }

      return words;
    } catch (error) {
      console.error("❌ Error in getVocabularyWords:", error);
      throw error;
    }
  },

  // Enhanced word fetching with API data
  async getVocabularyWordWithApiData(wordId) {
    try {
      // Get basic word data
      const wordData = await this.getVocabularyWordById(wordId);
      if (!wordData) {
        console.warn(`⚠️ No word data found for ID: ${wordId}`);
        return null;
      }

      console.log(`🔍 Enhancing word data for: ${wordData.word}`);

      // Fetch API data
      const apiData = await studentDictionaryApiService.fetchWordData(wordData.word);
      if (!apiData) {
        console.warn(`⚠️ No API data available for word: ${wordData.word}`);
        return wordData;
      }

      // Enhance with API data
      const enhancedWord = {
        ...wordData,
        apiData: {
          phonetic: apiData.phonetic,
          pronunciations: apiData.pronunciations,
          definitions: apiData.definitions,
          synonyms: apiData.synonyms,
          antonyms: apiData.antonyms,
          origin: apiData.origin,
          license: apiData.license
        }
      };

      console.log(`✅ Enhanced word data for: ${wordData.word}`);
      return enhancedWord;
    } catch (error) {
      console.error('❌ Error fetching enhanced word data:', error);
      return null;
    }
  },

  // Get multiple words with API data
  async getVocabularyWordsWithApiData(filters = {}) {
    try {
      console.log("🔍 Getting vocabulary words with API data...");
      const words = await this.getVocabularyWords(filters);
      
      console.log(`📚 Enhancing ${words.length} words with API data...`);
      
      // Enhance each word with API data
      const enhancedWords = await Promise.all(
        words.map(async (word) => {
          try {
            const apiData = await studentDictionaryApiService.fetchWordData(word.word);
            if (!apiData) return word;

            return {
              ...word,
              apiData: {
                phonetic: apiData.phonetic,
                pronunciations: apiData.pronunciations,
                definitions: apiData.definitions,
                synonyms: apiData.synonyms,
                antonyms: apiData.antonyms,
                origin: apiData.origin,
                license: apiData.license
              }
            };
          } catch (error) {
            console.warn(`⚠️ Failed to enhance word: ${word.word}`, error);
            return word;
          }
        })
      );

      console.log(`✅ Successfully enhanced ${enhancedWords.length} words`);
      return enhancedWords;
    } catch (error) {
      console.error('❌ Error fetching enhanced vocabulary words:', error);
      return [];
    }
  },

  // Get audio sources for a word
  async getWordAudioSources(word, options = {}) {
    try {
      console.log(`🔊 Getting audio sources for word: ${word}`);
      return await studentAudioService.getPriorityAudioSources(word, options);
    } catch (error) {
      console.error('❌ Error getting audio sources:', error);
      return [];
    }
  },

  // Get enhanced word with audio sources
  async getWordWithAudioSources(wordId) {
    try {
      const wordData = await this.getVocabularyWordById(wordId);
      if (!wordData) return null;

      const audioSources = await this.getWordAudioSources(wordData.word, {
        staticAudioUrl: wordData.audioUrl
      });

      return {
        ...wordData,
        audioSources
      };
    } catch (error) {
      console.error('❌ Error getting word with audio sources:', error);
      return null;
    }
  },

  // Get vocabulary word by ID
  async getVocabularyWordById(wordId) {
    try {
      const docRef = doc(db, COLLECTION_NAME, wordId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          word: data.word,
          definition: data.meaning_arabic,
          level: data.difficulty_level,
          category: data.category,
          frequency: data.frequency,
          partOfSpeech: data.part_of_speech,
          pronunciation: data.pronunciation,
          example: data.example,
          exampleMeaning: data.example_meaning_arabic,
          audioUrl: data.audio_url,
          ...data,
        };
      } else {
        console.log("❌ No such word!");
        return null;
      }
    } catch (error) {
      console.error("❌ Error getting vocabulary word by ID:", error);
      throw error;
    }
  },

  // Search vocabulary words
  async searchVocabularyWords(searchTerm) {
    try {
      console.log("🔍 Searching for:", searchTerm);

      const vocabularyQuery = query(
        collection(db, COLLECTION_NAME),
        where("word", ">=", searchTerm),
        where("word", "<=", searchTerm + "\uf8ff")
      );

      const snapshot = await getDocs(vocabularyQuery);
      const words = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          word: data.word,
          definition: data.meaning_arabic,
          level: data.difficulty_level,
          category: data.category,
          frequency: data.frequency,
          partOfSpeech: data.part_of_speech,
          pronunciation: data.pronunciation,
          example: data.example,
          exampleMeaning: data.example_meaning_arabic,
          audioUrl: data.audio_url,
          ...data,
        };
      });

      console.log("📝 Search results:", words.length);
      return words;
    } catch (error) {
      console.error("❌ Error searching vocabulary words:", error);
      throw error;
    }
  },

  // Add new vocabulary word
  async addVocabularyWord(wordData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...wordData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("✅ Vocabulary word added with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Error adding vocabulary word:", error);
      throw error;
    }
  },

  // Update vocabulary word
  async updateVocabularyWord(wordId, wordData) {
    try {
      const docRef = doc(db, COLLECTION_NAME, wordId);
      await updateDoc(docRef, {
        ...wordData,
        updatedAt: serverTimestamp(),
      });
      console.log("✅ Vocabulary word updated:", wordId);
    } catch (error) {
      console.error("❌ Error updating vocabulary word:", error);
      throw error;
    }
  },
};

export default studentVocabularyService;
