import React from "react";
import { QueryClientProvider } from "react-query";
import { AuthProvider } from "./AuthContext";
import { UserProvider } from "./UserContext";
import { ThemeProvider } from "./ThemeContext";
import { queryClient } from "../config/queryClient";
import { StudentCourseProvider } from "./studentCourseContext";
import { StudentLessonProvider } from "./studentLessonContext";
import { StudentModuleProvider } from "./studentModuleContext";
import { StudentTaskProvider } from "./studentTaskContext";
import { StudentMessageProvider } from "./studentMessageContext";
import { StudentNotificationProvider } from "./studentNotificationContext";
import { StudentRecentActivityProvider } from "./studentRecentActivityContext";
import { StudentAchievementProvider } from "./studentAchievementContext";
import { StudentPronunciationProgressProvider } from "./studentPronunciationProgressContext";
import { StudentVocabularyProgressProvider } from "./studentVocabularyProgressContext";
import { StudentVocabularyUploadProvider } from "./studentVocabularyUploadContext";
import { StudentSpeechRecognitionProvider } from "./studentSpeechRecognitionContext";
import { StudentElevenlabsProvider } from "./studentElevenlabsContext";
import { StudentVocabularyProvider } from "./studentVocabularyContext";
import { VocabularyWordsProvider } from "./vocabularyWordsContext";
import { VocabularyProgressProvider } from "./vocabularyProgressContext";
import { VocabularyGoalsProvider } from "./vocabularyGoalsContext";
import { StudyTimeProvider } from "./StudyTimeContext";

// Core providers that are always needed
const CoreProviders = ({ children }) => (
  <AuthProvider>
    <UserProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </UserProvider>
  </AuthProvider>
);

// Student-related providers grouped together
const StudentProviders = ({ children }) => (
  <StudentCourseProvider>
    <StudentLessonProvider>
      <StudentModuleProvider>
        <StudentTaskProvider>
          <StudentMessageProvider>
            <StudentNotificationProvider>
              <StudentRecentActivityProvider>
                <StudentAchievementProvider>
                  {children}
                </StudentAchievementProvider>
              </StudentRecentActivityProvider>
            </StudentNotificationProvider>
          </StudentMessageProvider>
        </StudentTaskProvider>
      </StudentModuleProvider>
    </StudentLessonProvider>
  </StudentCourseProvider>
);

// Vocabulary-related providers grouped together
const VocabularyProviders = ({ children }) => (
  <StudentPronunciationProgressProvider>
    <StudentVocabularyProgressProvider>
      <StudentVocabularyUploadProvider>
        <StudentSpeechRecognitionProvider>
          <StudentElevenlabsProvider>
            <StudentVocabularyProvider>
              <VocabularyProgressProvider>
                <VocabularyGoalsProvider>
                  <VocabularyWordsProvider>{children}</VocabularyWordsProvider>
                </VocabularyGoalsProvider>
              </VocabularyProgressProvider>
            </StudentVocabularyProvider>
          </StudentElevenlabsProvider>
        </StudentSpeechRecognitionProvider>
      </StudentVocabularyUploadProvider>
    </StudentVocabularyProgressProvider>
  </StudentPronunciationProgressProvider>
);

// Combined provider that reduces nesting depth
const CombinedProvider = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <CoreProviders>
      <StudentProviders>
        <VocabularyProviders>
          <StudyTimeProvider>{children}</StudyTimeProvider>
        </VocabularyProviders>
      </StudentProviders>
    </CoreProviders>
  </QueryClientProvider>
);

export default CombinedProvider;
