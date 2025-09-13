// contexts/index.js - Central export for all context providers

export { useAuth, AuthProvider } from './AuthContext';
export { useTheme, ThemeProvider } from './ThemeContext';
export { useUser, UserProvider } from './UserContext';
export { useStudyTime, StudyTimeProvider } from './StudyTimeContext';
export { useFormPersistence, FormPersistenceProvider } from './FormPersistenceContext';
export { useLandingPage, LandingPageProvider } from './LandingPageContext';

// Student contexts
export { useStudentTask, StudentTaskProvider } from './studentTaskContext';
export { useStudentVocabulary, StudentVocabularyProvider } from './studentVocabularyContext';
export { useStudentSpeechRecognition, StudentSpeechRecognitionProvider } from './studentSpeechRecognitionContext';
export { useVocabularyGoals, VocabularyGoalsProvider } from './vocabularyGoalsContext';
export { useVocabularyProgress, VocabularyProgressProvider } from './vocabularyProgressContext';
export { useVocabularyWords, VocabularyWordsProvider } from './vocabularyWordsContext';

// Combined provider
export { default as CombinedProvider } from './CombinedProvider';