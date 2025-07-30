# Dictionary API Integration Plan

## 📚 Overview

This document outlines the comprehensive plan for integrating the [Free Dictionary API](https://dictionaryapi.dev/) into the vocabulary building application. The integration will enhance pronunciation practice, provide rich word definitions, and improve the overall learning experience while maintaining backward compatibility with existing data structures.

## 🎯 Objectives

1. **Enhanced Pronunciation Practice** - Multiple audio pronunciations (UK, US, AU)
2. **Rich Word Data** - Comprehensive definitions, examples, synonyms, antonyms
3. **Improved Learning Experience** - Audio-visual learning with context
4. **Vocabulary Expansion** - Synonyms and antonyms for better word understanding
5. **Flexible Integration** - Works across lessons, tasks, and quizzes
6. **Hybrid Integration** - Enhance existing vocabulary words while preserving current data structure
7. **Caching Strategy** - Implement 24-48 hour caching to balance performance and data freshness
8. **Fallback System** - Ensure graceful degradation when audio is unavailable

## 🔗 API Endpoints & Data Structure

### Base API Endpoint

```
https://api.dictionaryapi.dev/api/v2/entries/en/{word}
```

### Audio URL Patterns

The API provides multiple pronunciation variants with different URL patterns:

| Pattern           | Description              | Example            |
| ----------------- | ------------------------ | ------------------ |
| `{word}-uk.mp3`   | British pronunciation    | `fight-uk.mp3`     |
| `{word}-us.mp3`   | American pronunciation   | `fight-us.mp3`     |
| `{word}-au.mp3`   | Australian pronunciation | `subscribe-au.mp3` |
| `{word}.mp3`      | Default pronunciation    | `cry.mp3`          |
| `{word}-1-uk.mp3` | Alternative UK variant   | `word-1-uk.mp3`    |

### API Response Structure

```javascript
[
  {
    word: "subscribe",
    phonetic: "/səbˈskɹaɪb/",
    phonetics: [
      {
        text: "/səbˈskɹaɪb/",
        audio:
          "https://api.dictionaryapi.dev/media/pronunciations/en/subscribe-us.mp3",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=2454321",
        license: {
          name: "BY-SA 3.0",
          url: "https://creativecommons.org/licenses/by-sa/3.0",
        },
      },
    ],
    meanings: [
      {
        partOfSpeech: "verb",
        definitions: [
          {
            definition: "To sign up to have copies of a publication...",
            example: "Would you like to subscribe or subscribe a friend...",
            synonyms: [],
            antonyms: [],
          },
        ],
        synonyms: [],
        antonyms: [],
      },
    ],
    license: {
      name: "CC BY-SA 3.0",
      url: "https://creativecommons.org/licenses/by-sa/3.0",
    },
    sourceUrls: ["https://en.wiktionary.org/wiki/subscribe"],
  },
];
```

## 🏗️ Implementation Architecture

### 1. Service Layer Enhancement

#### New Service: `studentDictionaryApiService.js`

```javascript
// src/services/student-services/studentDictionaryApiService.js

const API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en";
const AUDIO_BASE = "https://api.dictionaryapi.dev/media/pronunciations/en";

class StudentDictionaryApiService {
  constructor() {
    this.cacheTTL = 48 * 60 * 60 * 1000; // 48 hours
  }

  // Fetch word data from API with caching
  async fetchWordData(word) {
    try {
      // Check cache first
      const cached = await this.getCachedData(word);
      if (cached) return cached;

      const response = await fetch(`${API_BASE}/${encodeURIComponent(word)}`);
      if (!response.ok) {
        throw new Error(`Word not found: ${word}`);
      }

      const data = await response.json();
      const result = this.processApiResponse(data, word);

      // Cache the result
      await this.setCachedData(word, result);
      return result;
    } catch (error) {
      console.error("Dictionary API error:", error);
      return this.getFallbackData(word);
    }
  }

  // Process API response and extract all relevant data
  processApiResponse(data, word) {
    if (!data || !data[0]) return null;

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

    // Extract from phonetics array
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
    const key = `dict_${word.toLowerCase()}`;
    const cached = localStorage.getItem(key);
    const expiry = localStorage.getItem(`${key}_expiry`);

    if (cached && expiry && Date.now() < parseInt(expiry)) {
      return JSON.parse(cached);
    }

    return null;
  }

  async setCachedData(word, data) {
    const key = `dict_${word.toLowerCase()}`;
    const expiry = Date.now() + this.cacheTTL;

    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`${key}_expiry`, expiry.toString());
  }

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
}

export default new StudentDictionaryApiService();
```

### 2. Enhanced Audio Service

#### New Service: `studentAudioService.js`

```javascript
// src/services/student-services/studentAudioService.js

import studentDictionaryApiService from "./studentDictionaryApiService";

class StudentAudioService {
  constructor() {
    this.dictionaryApi = studentDictionaryApiService;
    this.preferences = this.loadPreferences();
  }

  // Get best available audio URL for word
  async getAudioUrl(word, options = {}) {
    const sources = await this.getPriorityAudioSources(word, options);

    for (const source of sources) {
      if (await this.isAudioAvailable(source.audio)) {
        return source;
      }
    }

    // Fallback to TTS or existing static audio
    return this.getFallbackAudio(word, options);
  }

  // Get priority audio sources
  async getPriorityAudioSources(word, options = {}) {
    const sources = [];

    // 1. Dictionary API sources (highest priority)
    const dictionaryData = await this.dictionaryApi.fetchWordData(word);
    if (dictionaryData?.pronunciations) {
      const sortedUrls = this.sortByAccentPreference(
        dictionaryData.pronunciations,
        options.preferredAccent || this.preferences.accent
      );
      sources.push(...sortedUrls);
    }

    // 2. Existing static audio (medium priority)
    if (options.staticAudioUrl) {
      sources.push({
        text: `/${word}/`,
        audio: options.staticAudioUrl,
        type: "Static",
        source: "static",
        verified: false,
      });
    }

    // 3. TTS fallback (lowest priority)
    sources.push({
      text: `/${word}/`,
      audio: null, // Will be generated by TTS
      type: "TTS",
      source: "tts",
      verified: false,
    });

    return sources;
  }

  // Sort pronunciations by user preference
  sortByAccentPreference(pronunciations, preferredAccent = "US") {
    const priority = {
      [preferredAccent.toUpperCase()]: 1,
      US: 2,
      UK: 3,
      AU: 4,
      Default: 5,
      "UK-Alt": 6,
    };

    return pronunciations.sort((a, b) => {
      const aPriority = priority[a.type] || 999;
      const bPriority = priority[b.type] || 999;
      return aPriority - bPriority;
    });
  }

  // Check if audio URL is available
  async isAudioAvailable(audioUrl) {
    if (!audioUrl) return false;

    try {
      const response = await fetch(audioUrl, { method: "HEAD" });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Load user preferences
  loadPreferences() {
    const stored = localStorage.getItem("pronunciation_preferences");
    return stored
      ? JSON.parse(stored)
      : {
          preferredAccent: "US",
          autoPlay: false,
          playbackSpeed: 1.0,
          showPhonetics: true,
          cacheAudio: true,
        };
  }

  // Save user preferences
  savePreferences(preferences) {
    this.preferences = { ...this.preferences, ...preferences };
    localStorage.setItem(
      "pronunciation_preferences",
      JSON.stringify(this.preferences)
    );
  }
}

export default new StudentAudioService();
```

### 3. Enhanced Vocabulary Progress Structure

#### Updated Vocabulary Progress Model

```javascript
// Enhanced vocabulary progress with API data
{
  // Existing fields
  userId: "a3mvtyHHrSX4e2PiEpNG9w031vJ3",
  wordId: "word-document-id",
  word: "subscribe",
  status: "new|learned|difficult",
  isFavorite: false,
  createdAt: "2025-06-30T12:45:21.000Z",
  updatedAt: "2025-06-30T12:45:23.000Z",
  lastViewed: "2025-06-30T12:45:23.000Z",
  timesCorrect: 2,
  timesIncorrect: 0,
  timesViewed: 4,

  // New API-enhanced fields
  apiData: {
    phonetic: "/səbˈskɹaɪb/",
    pronunciations: [
      {
        text: "/səbˈskɹaɪb/",
        audio: "https://api.dictionaryapi.dev/media/pronunciations/en/subscribe-us.mp3",
        type: "US",
        source: "api",
        verified: true
      },
      {
        text: "/səbˈskɹaɪb/",
        audio: "https://api.dictionaryapi.dev/media/pronunciations/en/subscribe-uk.mp3",
        type: "UK",
        source: "api",
        verified: true
      },
      {
        text: "/səbˈskɹaɪb/",
        audio: "https://api.dictionaryapi.dev/media/pronunciations/en/subscribe-au.mp3",
        type: "AU",
        source: "pattern",
        verified: false
      }
    ],
    definitions: [
      {
        partOfSpeech: "verb",
        definitions: [
          {
            definition: "To sign up to have copies of a publication...",
            example: "Would you like to subscribe or subscribe a friend...",
            synonyms: ["enroll", "register"],
            antonyms: ["unsubscribe"]
          }
        ]
      }
    ],
    synonyms: ["enroll", "register", "sign up"],
    antonyms: ["unsubscribe", "cancel"],
    origin: "early 19th century: variant of earlier hollo...",
    license: {
      name: "CC BY-SA 3.0",
      url: "https://creativecommons.org/licenses/by-sa/3.0"
    }
  }
}
```

## 📋 Implementation Phases

### Phase 1: Core Services Development (Week 1-2)

- [ ] Create `studentDictionaryApiService.js`
- [ ] Create `studentAudioService.js`
- [ ] Implement caching infrastructure
- [ ] Test API integration and fallbacks

### Phase 2: Enhanced Vocabulary Service (Week 3)

- [ ] Update `studentVocabularyService.js`
- [ ] Add API data to vocabulary progress
- [ ] Implement enhanced word fetching
- [ ] Test with existing vocabulary data

### Phase 3: Enhanced Pronunciation Practice (Week 4)

- [ ] Update speech recognition service
- [ ] Add multiple pronunciation support
- [ ] Enhance pronunciation dialog
- [ ] Test pronunciation features

### Phase 4: UI Integration (Week 5-6)

- [ ] Update vocabulary cards
- [ ] Add pronunciation selection
- [ ] Enhance learning materials
- [ ] Test across lessons and tasks

### Phase 5: Advanced Features (Week 7-8)

- [ ] Add synonyms/antonyms display
- [ ] Implement definition expansion
- [ ] Add audio caching and preloading
- [ ] Performance optimization

## 🚀 Benefits

1. **Enhanced Learning Experience** - Multiple pronunciations and rich definitions
2. **Improved Pronunciation Practice** - UK, US, and AU accents
3. **Vocabulary Expansion** - Synonyms and antonyms
4. **Contextual Learning** - Usage examples and definitions
5. **Flexible Integration** - Works across all app features
6. **Reliable Fallbacks** - Graceful degradation when API is unavailable
7. **Performance Optimized** - Caching and preloading strategies
8. **User Preferences** - Customizable accent preferences

## 📈 Success Metrics

### Technical Metrics

- **Cache Hit Rate** - >80% for frequently accessed words
- **Audio Load Time** - <2 seconds average
- **API Success Rate** - >95% uptime

### User Experience Metrics

- **Pronunciation Usage** - Increase in audio playback events
- **User Retention** - Improved engagement with vocabulary features
- **Error Rate** - <1% audio loading failures

### Educational Metrics

- **Pronunciation Accuracy** - Improved speech recognition scores
- **Learning Outcomes** - Better vocabulary retention
- **Feature Adoption** - Usage across all vocabulary features

---

This comprehensive implementation plan provides a robust foundation for integrating the Dictionary API while maintaining backward compatibility and ensuring a robust, user-friendly experience across all vocabulary building features. The hybrid approach enhances existing functionality while providing significant improvements to the pronunciation learning experience.
