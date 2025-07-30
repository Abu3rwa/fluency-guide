import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../../../i18n";
import StudentVocabularyBuildingPage from "../StudentVocabularyBuildingPage";

// Mock the context providers
jest.mock("../../../../../contexts/AuthContext", () => ({
  useAuth: () => ({
    currentUser: { uid: "test-user-id" },
  }),
}));

jest.mock("../../../../../contexts/studentVocabularyContext", () => ({
  useStudentVocabulary: () => ({
    vocabularyWords: [
      {
        id: "1",
        word: "example",
        definition: "A thing characteristic of its kind",
        examples: ["This is an example sentence."],
        level: "A1",
        category: "Nouns",
        frequency: "high",
      },
    ],
    currentWordIndex: 0,
    setCurrentWordIndex: jest.fn(),
    loading: { words: false, progress: false, goals: false },
    error: { words: null, progress: null, goals: null },
    fetchVocabularyWords: jest.fn(),
    markWordAsLearned: jest.fn(),
    markWordAsDifficult: jest.fn(),
    toggleFavorite: jest.fn(),
    activeGoal: null,
    goalCompleted: false,
  }),
}));

const theme = createTheme();

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>{component}</I18nextProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe("StudentVocabularyBuildingPage", () => {
  test("renders vocabulary building page", () => {
    renderWithProviders(<StudentVocabularyBuildingPage />);

    expect(screen.getByText(/vocabulary building/i)).toBeInTheDocument();
  });

  test("displays vocabulary word", () => {
    renderWithProviders(<StudentVocabularyBuildingPage />);

    expect(screen.getByText("example")).toBeInTheDocument();
    expect(
      screen.getByText("A thing characteristic of its kind")
    ).toBeInTheDocument();
  });

  test("shows word level and category", () => {
    renderWithProviders(<StudentVocabularyBuildingPage />);

    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("Nouns")).toBeInTheDocument();
  });

  test("displays example sentences", () => {
    renderWithProviders(<StudentVocabularyBuildingPage />);

    expect(
      screen.getByText("This is an example sentence.")
    ).toBeInTheDocument();
  });

  test("shows navigation controls", () => {
    renderWithProviders(<StudentVocabularyBuildingPage />);

    expect(screen.getByText(/word 1 of 1/i)).toBeInTheDocument();
  });

  test("shows progress section", () => {
    renderWithProviders(<StudentVocabularyBuildingPage />);

    expect(screen.getByText(/learning progress/i)).toBeInTheDocument();
  });

  test("shows goal section", () => {
    renderWithProviders(<StudentVocabularyBuildingPage />);

    expect(screen.getByText(/daily learning goal/i)).toBeInTheDocument();
  });
});
