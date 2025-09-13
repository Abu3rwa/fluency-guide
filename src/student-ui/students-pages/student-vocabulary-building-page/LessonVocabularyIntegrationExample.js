import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StudentEnhancedVocabularyPage from './StudentEnhancedVocabularyPage';
import StudentLessonVocabularyIntegration from './components/StudentLessonVocabularyIntegration';

/**
 * Example implementation showing how to use the lesson completion
 * and vocabulary integration system
 * 
 * This example demonstrates:
 * 1. Basic lesson integration
 * 2. Enhanced vocabulary page usage
 * 3. Real-time progress tracking
 * 4. Lesson completion workflow
 */
const LessonVocabularyIntegrationExample = () => {
  const { t } = useTranslation();
  
  // Example lesson data - in real implementation, this would come from routing or context
  const [currentLesson] = useState({
    id: 'lesson_123',
    title: 'Introduction to Business English',
    vocabulary: ['meeting', 'presentation', 'deadline', 'proposal', 'negotiate']
  });
  
  // State for tracking integration results
  const [integrationResults, setIntegrationResults] = useState(null);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  
  // Handle lesson completion
  const handleLessonComplete = (result) => {
    console.log('Lesson completion result:', result);
    setIntegrationResults(result);
    setIsLessonComplete(result.success);
    
    if (result.success) {
      // In real implementation, you might:
      // - Show congratulations dialog
      // - Navigate to next lesson
      // - Update user progress
      // - Send analytics events
      console.log('Lesson completed successfully!');
    }
  };
  
  // Handle vocabulary updates
  const handleVocabularyUpdate = (vocabularyData) => {
    console.log('Vocabulary data updated:', vocabularyData);
    // In real implementation, you might:
    // - Update vocabulary context
    // - Refresh dashboard stats
    // - Show vocabulary progress notifications
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Lesson Completion & Vocabulary Integration Example
      </Typography>
      
      <Typography variant="body1" paragraph sx={{ mb: 4 }}>
        This example demonstrates the integration between lesson completion monitoring
        and vocabulary learning. Complete the lesson tasks to see the vocabulary integration in action.
      </Typography>
      
      {/* Integration Results Display */}
      {integrationResults && (
        <Alert 
          severity={isLessonComplete ? 'success' : 'info'} 
          sx={{ mb: 3 }}
        >
          <Typography variant="h6">
            {isLessonComplete ? 'Lesson Completed!' : 'Lesson Progress Updated'}
          </Typography>
          <Typography variant="body2">
            Tasks: {integrationResults.taskCompletion?.tasksPassed}/{integrationResults.taskCompletion?.tasksRequired} passed
          </Typography>
          <Typography variant="body2">
            Vocabulary: {integrationResults.vocabularyProcessing?.wordsFound?.length || 0} words processed
          </Typography>
        </Alert>
      )}
      
      {/* Example 1: Basic Lesson Integration Component */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Example 1: Basic Lesson Integration
        </Typography>
        <Typography variant="body2" paragraph>
          This shows lesson completion monitoring with vocabulary processing:
        </Typography>
        
        <StudentLessonVocabularyIntegration
          lessonId={currentLesson.id}
          lessonTitle={currentLesson.title}
          showLessonCompletion={true}
          showVocabularyWords={false} // Focus on lesson completion
          onLessonComplete={handleLessonComplete}
          onVocabularyUpdate={handleVocabularyUpdate}
          compact={false}
        />
      </Box>
      
      {/* Example 2: Enhanced Vocabulary Page */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Example 2: Enhanced Vocabulary Page
        </Typography>
        <Typography variant="body2" paragraph>
          This shows the full vocabulary system with lesson integration:
        </Typography>
        
        <Button 
          variant="outlined" 
          onClick={() => {
            // In real implementation, this would navigate to the vocabulary page
            console.log('Navigate to enhanced vocabulary page');
          }}
          sx={{ mb: 2 }}
        >
          Open Enhanced Vocabulary Page
        </Button>
        
        {/* Commented out to avoid loading the full page in this example */}
        {/*
        <StudentEnhancedVocabularyPage
          lessonId={currentLesson.id}
          lessonTitle={currentLesson.title}
          showLessonIntegration={true}
        />
        */}
      </Box>
      
      {/* Example 3: Integration with Dashboard Widget */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Example 3: Dashboard Widget Integration
        </Typography>
        <Typography variant="body2" paragraph>
          The vocabulary widget in the dashboard can show lesson progress:
        </Typography>
        
        <Alert severity="info">
          <Typography variant="body2">
            The StudentVocabularyWidget component in the dashboard will automatically
            show lesson progress when you pass currentLessonId and currentLessonTitle props.
          </Typography>
        </Alert>
      </Box>
      
      {/* Usage Instructions */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          How to Use This Integration
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>1. Set up lesson data:</strong> Ensure your lesson documents include a vocabulary array
          and that tasks are properly configured with passing scores.
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>2. Add to your routing:</strong> Use StudentEnhancedVocabularyPage as your vocabulary route
          and pass lessonId/lessonTitle from your current lesson context.
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>3. Update dashboard:</strong> Enhance your dashboard's vocabulary widget with lesson integration
          by passing currentLessonId and showLessonIntegration=true.
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>4. Handle events:</strong> Implement onLessonComplete and onVocabularyUpdate callbacks
          to handle lesson completion and vocabulary progress updates.
        </Typography>
        
        <Typography variant="body2">
          <strong>5. Test workflow:</strong> Verify that lesson tasks must be completed and passed
          before lessons are marked as complete, and that vocabulary is properly processed.
        </Typography>
      </Box>
    </Container>
  );
};

export default LessonVocabularyIntegrationExample;