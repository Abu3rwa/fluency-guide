import React from "react";
import { VocabularyWordsProvider } from "../../../contexts/vocabularyWordsContext";
import { VocabularyProgressProvider } from "../../../contexts/vocabularyProgressContext";
import { VocabularyGoalsProvider } from "../../../contexts/vocabularyGoalsContext";

const VocabularyProviders = ({ children }) => {
  return (
    <VocabularyWordsProvider>
      <VocabularyProgressProvider>
        <VocabularyGoalsProvider>{children}</VocabularyGoalsProvider>
      </VocabularyProgressProvider>
    </VocabularyWordsProvider>
  );
};

export default VocabularyProviders;
