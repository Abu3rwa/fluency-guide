// src/services/student-services/studentDictionaryApiService.js
// Core service for Dictionary API integration with caching and fallbacks

const API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en";
const AUDIO_BASE = "https://api.dictionaryapi.dev/media/pronunciations/en";

class StudentDictionaryApiService {
  constructor() {
    this.cacheTTL = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
  }

  // Fetch word data from API with caching
  async fetchWordData(word) {
    try {
      // Check cache first
      const cached = await this.getCachedData(word);
      if (cached) {
        console.log(`📚 Using cached data for word: ${word}`);
        return cached;
      }

      console.log(`🌐 Fetching data from Dictionary API for word: ${word}`);
      const response = await fetch(`${API_BASE}/${encodeURIComponent(word)}`);

      if (!response.ok) {
        throw new Error(`Word not found: ${word}`);
      }

      const data = await response.json();
      const result = this.processApiResponse(data, word);

      // Cache the result
      await this.setCachedData(word, result);
      console.log(`✅ Successfully fetched and cached data for word: ${word}`);

      return result;
    } catch (error) {
      console.error("❌ Dictionary API error:", error);
      const fallbackData = this.getFallbackData(word);
      console.log(`🔄 Using fallback data for word: ${word}`);
      return fallbackData;
    }
  }

  // Process API response and extract all relevant data
  processApiResponse(data, word) {
    if (!data || !data[0]) {
      console.warn(`⚠️ No data found for word: ${word}`);
      return null;
    }

    return {
      word: data[0].word,
      phonetic: data[0].phonetic,
      pronunciations: this.getPronunciations(data),
      definitions: this.getDefinitions(data),
      synonyms: this.getAllSynonyms(data),
      antonyms: this.getAllAntonyms(data),
      origin: data[0].origin,
      license: data[0].license,
      timestamp: Date.now(),
    };
  }

  // Get available pronunciations with fallback URL generation
  getPronunciations(wordData) {
    if (!wordData || !wordData[0]) return [];

    const pronunciations = [];
    const word = wordData[0].word;

    // Extract from phonetics array (API-provided)
    wordData[0].phonetics?.forEach((phonetic) => {
      if (phonetic.audio) {
        pronunciations.push({
          text: phonetic.text,
          audio: phonetic.audio,
          type: this.detectPronunciationType(phonetic.audio, word),
          source: "api",
          verified: true,
        });
      }
    });

    // Generate additional pronunciation URLs as fallbacks
    const additionalPronunciations = this.generatePronunciationUrls(word);
    pronunciations.push(...additionalPronunciations);

    console.log(
      `🔊 Found ${pronunciations.length} pronunciations for word: ${word}`
    );
    return pronunciations;
  }

  // Detect pronunciation type from audio URL
  detectPronunciationType(audioUrl, word) {
    if (audioUrl.includes("-uk.mp3")) return "UK";
    if (audioUrl.includes("-us.mp3")) return "US";
    if (audioUrl.includes("-au.mp3")) return "AU";
    return "Default";
  }

  // Generate additional pronunciation URLs
  generatePronunciationUrls(word) {
    const pronunciations = [];
    const patterns = [
      { suffix: "-uk.mp3", type: "UK" },
      { suffix: "-us.mp3", type: "US" },
      { suffix: "-au.mp3", type: "AU" },
      { suffix: "-1-uk.mp3", type: "UK-Alt" },
    ];

    patterns.forEach((pattern) => {
      const audioUrl = `${AUDIO_BASE}/${word}${pattern.suffix}`;
      pronunciations.push({
        text: `/${word}/`,
        audio: audioUrl,
        type: pattern.type,
        source: "pattern",
        generated: true,
        verified: false,
      });
    });

    return pronunciations;
  }

  // Extract definitions and examples
  getDefinitions(wordData) {
    if (!wordData || !wordData[0]) return [];

    return (
      wordData[0].meanings?.map((meaning) => ({
        partOfSpeech: meaning.partOfSpeech,
        definitions: meaning.definitions.map((def) => ({
          definition: def.definition,
          example: def.example,
          synonyms: def.synonyms || [],
          antonyms: def.antonyms || [],
        })),
      })) || []
    );
  }

  // Get all synonyms and antonyms
  getAllSynonyms(wordData) {
    if (!wordData || !wordData[0]) return [];

    const synonyms = new Set();
    wordData[0].meanings?.forEach((meaning) => {
      meaning.definitions?.forEach((def) => {
        def.synonyms?.forEach((synonym) => synonyms.add(synonym));
      });
      meaning.synonyms?.forEach((synonym) => synonyms.add(synonym));
    });

    return Array.from(synonyms);
  }

  getAllAntonyms(wordData) {
    if (!wordData || !wordData[0]) return [];

    const antonyms = new Set();
    wordData[0].meanings?.forEach((meaning) => {
      meaning.definitions?.forEach((def) => {
        def.antonyms?.forEach((antonym) => antonyms.add(antonym));
      });
      meaning.antonyms?.forEach((antonym) => antonyms.add(antonym));
    });

    return Array.from(antonyms);
  }

  // Cache management
  async getCachedData(word) {
    try {
      const key = `dict_${word.toLowerCase()}`;
      const cached = localStorage.getItem(key);
      const expiry = localStorage.getItem(`${key}_expiry`);

      if (cached && expiry && Date.now() < parseInt(expiry)) {
        return JSON.parse(cached);
      }

      return null;
    } catch (error) {
      console.error("❌ Cache read error:", error);
      return null;
    }
  }

  async setCachedData(word, data) {
    try {
      const key = `dict_${word.toLowerCase()}`;
      const expiry = Date.now() + this.cacheTTL;

      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(`${key}_expiry`, expiry.toString());

      console.log(`💾 Cached data for word: ${word}`);
    } catch (error) {
      console.error("❌ Cache write error:", error);
    }
  }

  // Get fallback data when API fails
  getFallbackData(word) {
    return {
      word,
      phonetic: `/${word}/`,
      pronunciations: this.generatePronunciationUrls(word),
      definitions: [],
      synonyms: [],
      antonyms: [],
      timestamp: Date.now(),
      fallback: true,
    };
  }

  // Clear cache for a specific word
  async clearCache(word) {
    try {
      const key = `dict_${word.toLowerCase()}`;
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_expiry`);
      console.log(`🗑️ Cleared cache for word: ${word}`);
    } catch (error) {
      console.error("❌ Cache clear error:", error);
    }
  }

  // Clear all cached data
  async clearAllCache() {
    try {
      const keys = Object.keys(localStorage);
      const dictKeys = keys.filter((key) => key.startsWith("dict_"));

      dictKeys.forEach((key) => {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_expiry`);
      });

      console.log(
        `🗑️ Cleared all dictionary cache (${dictKeys.length} entries)`
      );
    } catch (error) {
      console.error("❌ Clear all cache error:", error);
    }
  }

  // Get cache statistics
  getCacheStats() {
    try {
      const keys = Object.keys(localStorage);
      const dictKeys = keys.filter((key) => key.startsWith("dict_"));
      const validEntries = dictKeys.filter((key) => {
        const expiry = localStorage.getItem(`${key}_expiry`);
        return expiry && Date.now() < parseInt(expiry);
      });

      return {
        totalEntries: dictKeys.length,
        validEntries: validEntries.length,
        expiredEntries: dictKeys.length - validEntries.length,
      };
    } catch (error) {
      console.error("❌ Cache stats error:", error);
      return { totalEntries: 0, validEntries: 0, expiredEntries: 0 };
    }
  }
}

export default new StudentDictionaryApiService();
