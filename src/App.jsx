import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppRoutes from "./routes";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { StudentCourseProvider } from "./contexts/studentCourseContext";
import { StudentLessonProvider } from "./contexts/studentLessonContext";
import { StudentModuleProvider } from "./contexts/studentModuleContext";
import { StudentTaskProvider } from "./contexts/studentTaskContext";
import { StudentMessageProvider } from "./contexts/studentMessageContext";
import { StudentNotificationProvider } from "./contexts/studentNotificationContext";
import { StudentRecentActivityProvider } from "./contexts/studentRecentActivityContext";
import { StudentAchievementProvider } from "./contexts/studentAchievementContext";
import { StudentPronunciationProgressProvider } from "./contexts/studentPronunciationProgressContext";
import { StudentVocabularyProgressProvider } from "./contexts/studentVocabularyProgressContext";
import { StudentVocabularyUploadProvider } from "./contexts/studentVocabularyUploadContext";
import { StudentSpeechRecognitionProvider } from "./contexts/studentSpeechRecognitionContext";
import { StudentElevenlabsProvider } from "./contexts/studentElevenlabsContext";
import "./index.css";

const router = createBrowserRouter(
  [
    {
      path: "/*",
      element: <AppRoutes />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserProvider>
          <ThemeProvider>
            <StudentCourseProvider>
              <StudentLessonProvider>
                <StudentModuleProvider>
                  <StudentTaskProvider>
                    <StudentMessageProvider>
                      <StudentNotificationProvider>
                        <StudentRecentActivityProvider>
                          <StudentAchievementProvider>
                            <StudentPronunciationProgressProvider>
                              <StudentVocabularyProgressProvider>
                                <StudentVocabularyUploadProvider>
                                  <StudentSpeechRecognitionProvider>
                                    <StudentElevenlabsProvider>
                                      <RouterProvider router={router} />
                                    </StudentElevenlabsProvider>
                                  </StudentSpeechRecognitionProvider>
                                </StudentVocabularyUploadProvider>
                              </StudentVocabularyProgressProvider>
                            </StudentPronunciationProgressProvider>
                          </StudentAchievementProvider>
                        </StudentRecentActivityProvider>
                      </StudentNotificationProvider>
                    </StudentMessageProvider>
                  </StudentTaskProvider>
                </StudentModuleProvider>
              </StudentLessonProvider>
            </StudentCourseProvider>
          </ThemeProvider>
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
