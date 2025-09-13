import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Alert,
  Button,
  Tabs,
  Tab,
  Badge,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useAuth } from "../../../contexts/AuthContext";
import VocabularyProviders from "./VocabularyProviders";
import StudentVocabularyBuildingPage from "./StudentVocabularyBuildingPage";
import StudentLessonVocabularyIntegration from "./components/StudentLessonVocabularyIntegration";
import VocabularyErrorBoundary from "./components/VocabularyErrorBoundary";
import { useTranslation } from "react-i18next";

/**
 * Enhanced vocabulary page that combines the existing comprehensive vocabulary
 * system with lesson completion integration. This page provides:
 * 
 * 1. Regular vocabulary learning (existing system)
 * 2. Lesson-specific vocabulary tracking
 * 3. Lesson completion monitoring
 * 4. Integrated progress tracking
 */
const StudentEnhancedVocabularyPage = ({ 
  // Lesson integration props (can be passed from routing or context)
  lessonId = null,
  lessonTitle = null,
  showLessonIntegration = true,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  
  // State for tab management
  const [currentTab, setCurrentTab] = useState(0);
  const [lessonVocabularyCount, setLessonVocabularyCount] = useState(0);
  
  // Handle lesson vocabulary updates
  const handleLessonVocabularyUpdate = useCallback((vocabularyData) => {
    if (vocabularyData.wordsFound) {
      setLessonVocabularyCount(vocabularyData.wordsFound.length);
    }
  }, []);

  // Handle lesson completion
  const handleLessonComplete = useCallback((result) => {
    console.log('Lesson completed in vocabulary page:', result);
    // Could trigger notifications, refresh data, etc.
  }, []);

  // Tab change handler
  const handleTabChange = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  // Determine if lesson integration should be shown
  const shouldShowLessonIntegration = useMemo(() => {
    return showLessonIntegration && lessonId && currentUser?.uid;
  }, [showLessonIntegration, lessonId, currentUser?.uid]);

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          {t('common.pleaseLogin')}
        </Alert>
      </Container>
    );
  }

  return (
    <VocabularyErrorBoundary>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Page Header */}
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
            {t('vocabulary.title')}
          </Typography>

          {/* Navigation Tabs */}
          {shouldShowLessonIntegration && (
            <Box sx={{ mb: 3 }}>
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange}
                variant={isMobile ? "fullWidth" : "standard"}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab 
                  label={t('vocabulary.title')}
                  sx={{ textTransform: 'none' }}
                />
                <Tab 
                  label={
                    <Badge badgeContent={lessonVocabularyCount} color="secondary" max={999}>
                      {lessonTitle || t('student.dashboard.vocabulary.lessonVocabulary')}
                    </Badge>
                  }
                  sx={{ textTransform: 'none' }}
                />
              </Tabs>
            </Box>
          )}

          {/* Tab Content */}
          <Box>
            {/* Regular Vocabulary Tab */}
            {(!shouldShowLessonIntegration || currentTab === 0) && (
              <VocabularyProviders>
                <StudentVocabularyBuildingPage
                  lessonId={shouldShowLessonIntegration ? lessonId : null}
                  lessonTitle={lessonTitle}
                  showLessonIntegration={shouldShowLessonIntegration && currentTab === 0}
                />
              </VocabularyProviders>
            )}

            {/* Lesson Integration Tab */}
            {shouldShowLessonIntegration && currentTab === 1 && (
              <VocabularyProviders>
                <StudentLessonVocabularyIntegration
                  lessonId={lessonId}
                  lessonTitle={lessonTitle}
                  showLessonCompletion={true}
                  showVocabularyWords={true}
                  onLessonComplete={handleLessonComplete}
                  onVocabularyUpdate={handleLessonVocabularyUpdate}
                  compact={false}
                />
              </VocabularyProviders>
            )}
          </Box>

          {/* Additional Information */}
          {shouldShowLessonIntegration && (
            <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('vocabulary.lessonIntegration.title', 'Lesson Integration')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('vocabulary.lessonIntegration.description', 
                  'This page integrates your vocabulary learning with lesson completion tracking. ' +
                  'Complete lesson tasks to unlock vocabulary progress and track your learning journey.'
                )}
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </VocabularyErrorBoundary>
  );
};

export default StudentEnhancedVocabularyPage;