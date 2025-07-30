import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import StudentVocabularyBuildingPage from "../StudentVocabularyBuildingPage";
import VocabularyReviewIntegration from "../../../../shared/components/VocabularyReviewIntegration";

// Mock the contexts and services
jest.mock("../../../../../contexts/AuthContext", () => ({
  useAuth: () => ({
    currentUser: { uid: "test-user-id" },
  }),
}));

jest.mock("../../../../../contexts/vocabularyWordsContext", () => ({
  useVocabularyWords: () => ({
    vocabularyWords: [
      {
        id: "word1",
        word: "test",
        definition: "A test word",
        level: "beginner",
        category: "general",
      },
    ],
    currentWord: {
      id: "word1",
      word: "test",
      definition: "A test word",
      level: "beginner",
      category: "general",
    },
    currentWordIndex: 0,
    navigationState: {
      canGoNext: false,
      canGoPrevious: false,
      totalWords: 1,
    },
    fetchVocabularyWords: jest.fn(),
    goToNextWord: jest.fn(),
    goToPreviousWord: jest.fn(),
    goToFirstWord: jest.fn(),
    goToLastWord: jest.fn(),
    setRandomWord: jest.fn(),
    loading: { words: false },
    error: { words: null },
  }),
}));

jest.mock("../../../../../contexts/vocabularyProgressContext", () => ({
  useVocabularyProgress: () => ({
    getWordProgress: jest.fn(() => ({ status: "new" })),
    markWordAsLearned: jest.fn(),
    markWordAsDifficult: jest.fn(),
    toggleFavorite: jest.fn(),
    loading: { progress: false },
    error: { progress: null },
  }),
}));

jest.mock("../../../../../contexts/vocabularyGoalsContext", () => ({
  useVocabularyGoals: () => ({
    activeGoal: null,
    goalCompleted: false,
    updateGoalProgress: jest.fn(),
    loading: { goals: false },
    error: { goals: null },
  }),
}));

jest.mock("../../../../../services/student-services/vocabularyReviewIntegrationService", () => ({
  __esModule: true,
  default: {
    getVocabularyReviewQueue: jest.fn(() => Promise.resolve([])),
    getVocabularyLearningAnalytics: jest.fn(() => Promise.resolve({
      learnedWords: 5,
      totalWords: 10,
      difficultWords: 2,
      wordsDueForReview: 3,
      averageAccuracy: 85,
      learningProgress: 50,
    })),
    createVocabularyTaskFromReviews: jest.fn(),
  },
}));

const theme = createTheme();

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe("Vocabulary-Dashboard Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("VocabularyReviewIntegration component renders correctly", async () => {
    renderWithProviders(<VocabularyReviewIntegration />);
    
    await waitFor(() => {
      expect(screen.getByText("Vocabulary Review")).toBeInTheDocument();
    });
  });

  test("Vocabulary building page renders with review integration", async () => {
    renderWithProviders(<StudentVocabularyBuildingPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Vocabulary Review")).toBeInTheDocument();
    });
  });

  test("Vocabulary actions work correctly", async () => {
    const mockMarkAsLearned = jest.fn();
    const mockMarkAsDifficult = jest.fn();
    const mockToggleFavorite = jest.fn();

    // Mock the context to return our mock functions
    jest.doMock("../../../../../contexts/vocabularyProgressContext", () => ({
      useVocabularyProgress: () => ({
        getWordProgress: jest.fn(() => ({ status: "new" })),
        markWordAsLearned: mockMarkAsLearned,
        markWordAsDifficult: mockMarkAsDifficult,
        toggleFavorite: mockToggleFavorite,
        loading: { progress: false },
        error: { progress: null },
      }),
    }));

    renderWithProviders(<StudentVocabularyBuildingPage />);
    
    await waitFor(() => {
      expect(screen.getByText("test")).toBeInTheDocument();
    });
  });

  test("Error handling works correctly", async () => {
    // Mock an error in the vocabulary words context
    jest.doMock("../../../../../contexts/vocabularyWordsContext", () => ({
      useVocabularyWords: () => ({
        vocabularyWords: [],
        currentWord: null,
        currentWordIndex: 0,
        navigationState: {
          canGoNext: false,
          canGoPrevious: false,
          totalWords: 0,
        },
        fetchVocabularyWords: jest.fn(),
        goToNextWord: jest.fn(),
        goToPreviousWord: jest.fn(),
        goToFirstWord: jest.fn(),
        goToLastWord: jest.fn(),
        setRandomWord: jest.fn(),
        loading: { words: false },
        error: { words: "Failed to load vocabulary words" },
      }),
    }));

    renderWithProviders(<StudentVocabularyBuildingPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });
  });

  test("Loading states work correctly", async () => {
    // Mock loading state
    jest.doMock("../../../../../contexts/vocabularyWordsContext", () => ({
      useVocabularyWords: () => ({
        vocabularyWords: [],
        currentWord: null,
        currentWordIndex: 0,
        navigationState: {
          canGoNext: false,
          canGoPrevious: false,
          totalWords: 0,
        },
        fetchVocabularyWords: jest.fn(),
        goToNextWord: jest.fn(),
        goToPreviousWord: jest.fn(),
        goToFirstWord: jest.fn(),
        goToLastWord: jest.fn(),
        setRandomWord: jest.fn(),
        loading: { words: true },
        error: { words: null },
      }),
    }));

    renderWithProviders(<StudentVocabularyBuildingPage />);
    
    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  test("Keyboard navigation works correctly", async () => {
    const mockGoToNextWord = jest.fn();
    const mockGoToPreviousWord = jest.fn();
    const mockSetRandomWord = jest.fn();

    jest.doMock("../../../../../contexts/vocabularyWordsContext", () => ({
      useVocabularyWords: () => ({
        vocabularyWords: [
          {
            id: "word1",
            word: "test",
            definition: "A test word",
            level: "beginner",
            category: "general",
          },
        ],
        currentWord: {
          id: "word1",
          word: "test",
          definition: "A test word",
          level: "beginner",
          category: "general",
        },
        currentWordIndex: 0,
        navigationState: {
          canGoNext: true,
          canGoPrevious: false,
          totalWords: 1,
        },
        fetchVocabularyWords: jest.fn(),
        goToNextWord: mockGoToNextWord,
        goToPreviousWord: mockGoToPreviousWord,
        goToFirstWord: jest.fn(),
        goToLastWord: jest.fn(),
        setRandomWord: mockSetRandomWord,
        loading: { words: false },
        error: { words: null },
      }),
    }));

    renderWithProviders(<StudentVocabularyBuildingPage />);
    
    await waitFor(() => {
      expect(screen.getByText("test")).toBeInTheDocument();
    });

    // Test keyboard navigation
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(mockGoToNextWord).toHaveBeenCalled();

    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(mockGoToPreviousWord).toHaveBeenCalled();
  });

  test("Vocabulary review integration handles errors gracefully", async () => {
    // Mock an error in the vocabulary review integration service
    jest.doMock("../../../../../services/student-services/vocabularyReviewIntegrationService", () => ({
      __esModule: true,
      default: {
        getVocabularyReviewQueue: jest.fn(() => Promise.reject(new Error("API Error"))),
        getVocabularyLearningAnalytics: jest.fn(() => Promise.reject(new Error("API Error"))),
        createVocabularyTaskFromReviews: jest.fn(),
      },
    }));

    renderWithProviders(<VocabularyReviewIntegration />);
    
    await waitFor(() => {
      expect(screen.getByText("Failed to load vocabulary review data")).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });
  });

  test("Vocabulary review integration shows loading state", async () => {
    // Mock a slow API response
    jest.doMock("../../../../../services/student-services/vocabularyReviewIntegrationService", () => ({
      __esModule: true,
      default: {
        getVocabularyReviewQueue: jest.fn(() => new Promise(resolve => setTimeout(() => resolve([]), 100))),
        getVocabularyLearningAnalytics: jest.fn(() => new Promise(resolve => setTimeout(() => resolve({}), 100))),
        createVocabularyTaskFromReviews: jest.fn(),
      },
    }));

    renderWithProviders(<VocabularyReviewIntegration />);
    
    // Should show loading state initially
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
}); 