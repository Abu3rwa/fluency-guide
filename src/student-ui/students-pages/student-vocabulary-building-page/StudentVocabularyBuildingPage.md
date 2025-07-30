# Student Vocabulary Building Page Implementation Plan

This document outlines the plan for migrating the vocabulary building functionality from the Flutter/Dart application to the React application. The implementation will follow the existing React patterns and maintain all functionality from the original application.

## Table of Contents

1. [Overview](#overview)
2. [Component Structure](#component-structure)
3. [Data Models](#data-models)
4. [State Management](#state-management)
5. [Services](#services)
6. [UI Components](#ui-components)
7. [Responsive Design](#responsive-design)
8. [Implementation Steps](#implementation-steps)

## Overview

The vocabulary building feature allows students to:

- Set vocabulary learning goals
- Track progress toward those goals
- Learn new vocabulary words with definitions, examples, and pronunciations
- Mark words as learned or difficult
- Review difficult words
- Receive motivational feedback and celebrate achievements

The React implementation will maintain all these features while following the project's React patterns and Material-UI styling approach.

## Component Structure

```
src/
└── student-ui/
    └── students-pages/
        └── student-vocabulary-building-page/
            ├── StudentVocabularyBuildingPage.jsx       # Main container component
            ├── components/
            │   ├── StudentVocabularyAppBar.jsx         # Custom app bar with title and actions
            │   ├── StudentVocabularyGoalSection.jsx    # Goal setting and display
            │   ├── StudentVocabularyProgressSection.jsx # Progress tracking visualization
            │   ├── StudentVocabularyWordCard.jsx       # Word display with definition, examples
            │   ├── StudentVocabularyNavigationControls.jsx # Next/previous word controls
            │   └── dialogs/
            │       ├── StudentGoalCompletedDialog.jsx  # Shown when goal is completed
            │       ├── StudentMotivationDialog.jsx     # Motivational messages
            │       └── StudentPronunciationDialog.jsx  # Word pronunciation feature
            ├── hooks/
            │   └── useVocabularyProgress.js            # Custom hook for progress tracking
            ├── utils/
            │   └── vocabularyHelpers.js                # Helper functions
            └── styles/
                └── vocabularyStyles.js                 # Styled components and theme
```

## Data Models

### VocabularyWord

```javascript
{
  id: string,
  word: string,
  definition: string,
  examples: string[],
  pronunciation: string,  // URL to audio file or phonetic spelling
  difficulty: number,     // 1-5 scale
  imageUrl: string,       // Optional
  category: string,       // e.g., "Nouns", "Verbs", etc.
  level: string,          // e.g., "Beginner", "Intermediate", "Advanced"
  frequency: string,      // e.g., "very_high", "high", "medium", "low", "very_low"
}
```

### VocabularyGoal

```javascript
{
  id: string,
  userId: string,
  dailyTarget: number,    // Number of words to learn per day
  currentProgress: number, // Current progress toward daily target
  lastUpdated: Date,      // Last time progress was updated
  createdAt: Date,
  updatedAt: Date,
  isActive: boolean,      // Whether the goal is active
}
```

### VocabularyProgress

```javascript
{
  userId: string,
  word: string,
  timesViewed: number,    // Number of times the word has been viewed
  timesCorrect: number,   // Number of times the word has been answered correctly
  timesIncorrect: number, // Number of times the word has been answered incorrectly
  lastViewed: Date,       // Last time the word was viewed
  isFavorite: boolean,    // Whether the word is marked as favorite
  createdAt: Date,
  updatedAt: Date,
}
```

## State Management

The vocabulary building feature will use React Context for state management, following the pattern used in other parts of the application:

1. Create a `StudentVocabularyContext.js` that provides:

   - Current vocabulary words list
   - Current word being viewed
   - User's vocabulary progress
   - User's vocabulary goals
   - Loading states
   - Error states

2. Create corresponding service files:
   - `studentVocabularyProgressService.js` - For tracking progress
   - `studentVocabularyService.js` - For vocabulary word CRUD operations
   - `studentVocabularyGoalService.js` - For goal management

## Services

### studentVocabularyService.js

```javascript
// Core functions
getVocabularyWords(filters); // Get vocabulary words with optional filtering
getVocabularyWordById(wordId); // Get a specific vocabulary word
searchVocabularyWords(query); // Search vocabulary words
```

### studentVocabularyProgressService.js

```javascript
// Core functions
getUserVocabularyProgress(userId); // Get user's progress for all words
getWordProgress(userId, wordId); // Get progress for a specific word
markWordAsLearned(userId, wordId); // Mark a word as learned
markWordAsDifficult(userId, wordId); // Mark a word as difficult
resetWordProgress(userId, wordId); // Reset progress for a word
getLearnedWordsCount(userId); // Get count of learned words
getDifficultWords(userId); // Get difficult words
toggleFavorite(userId, wordId, isFavorite); // Toggle favorite status
```

### studentVocabularyGoalService.js

```javascript
// Core functions
getUserVocabularyGoals(userId); // Get user's vocabulary goals
getActiveVocabularyGoal(userId); // Get user's active vocabulary goal
createVocabularyGoal(userId, goalData); // Create a new vocabulary goal
updateVocabularyGoal(goalId, goalData); // Update a vocabulary goal
updateGoalProgress(goalId, progress); // Update progress for a goal
completeVocabularyGoal(goalId); // Mark a goal as completed
deleteVocabularyGoal(goalId); // Delete a vocabulary goal
```

## UI Components

### StudentVocabularyBuildingPage

The main container component that:

- Fetches vocabulary data
- Manages overall state
- Renders child components
- Handles navigation between words

```jsx
import React, { useState, useEffect } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import { useStudentVocabulary } from "../../../contexts/studentVocabularyContext";
import { useAuth } from "../../../contexts/AuthContext";
import StudentVocabularyAppBar from "./components/StudentVocabularyAppBar";
import StudentVocabularyGoalSection from "./components/StudentVocabularyGoalSection";
import StudentVocabularyProgressSection from "./components/StudentVocabularyProgressSection";
import StudentVocabularyWordCard from "./components/StudentVocabularyWordCard";
import StudentVocabularyNavigationControls from "./components/StudentVocabularyNavigationControls";

const StudentVocabularyBuildingPage = () => {
  const { currentUser } = useAuth();
  const {
    vocabularyWords,
    currentWordIndex,
    setCurrentWordIndex,
    loading,
    error,
    fetchVocabularyWords,
    markWordAsLearned,
    markWordAsDifficult,
    toggleFavorite,
  } = useStudentVocabulary();

  // State for search and favorites
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchVocabularyWords();
    }
  }, [currentUser, fetchVocabularyWords]);

  // Handle navigation
  const handleNext = () => {
    if (currentWordIndex < vocabularyWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  // Handle toggle search
  const handleToggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  // Handle toggle favorites
  const handleToggleFavorites = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    // Refetch words with filter
    fetchVocabularyWords({ favoritesOnly: !showFavoritesOnly });
  };

  // Current word
  const currentWord = vocabularyWords[currentWordIndex] || null;

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <StudentVocabularyAppBar
        isSearchExpanded={isSearchExpanded}
        isFavorite={showFavoritesOnly}
        onToggleSearch={handleToggleSearch}
        onToggleFavorite={handleToggleFavorites}
      />

      <Container maxWidth="md" sx={{ flexGrow: 1, py: 2 }}>
        <StudentVocabularyGoalSection />

        {currentWord && (
          <>
            <StudentVocabularyProgressSection
              currentIndex={currentWordIndex}
              totalWords={vocabularyWords.length}
            />

            <StudentVocabularyWordCard
              word={currentWord}
              onMarkLearned={() => markWordAsLearned(currentWord.id)}
              onMarkDifficult={() => markWordAsDifficult(currentWord.id)}
              onToggleFavorite={() => toggleFavorite(currentWord.id)}
            />

            <StudentVocabularyNavigationControls
              onPrevious={handlePrevious}
              onNext={handleNext}
              hasPrevious={currentWordIndex > 0}
              hasNext={currentWordIndex < vocabularyWords.length - 1}
            />
          </>
        )}
      </Container>
    </Box>
  );
};

export default StudentVocabularyBuildingPage;
```

### StudentVocabularyAppBar

- Displays the page title
- Provides navigation back to previous screen
- Contains actions (search, favorites toggle)

```jsx
import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import {
  ArrowBack,
  Search,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const StudentVocabularyAppBar = ({
  isSearchExpanded,
  isFavorite,
  onToggleSearch,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => navigate(-1)}
          aria-label="back"
        >
          <ArrowBack />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
          Vocabulary Builder
        </Typography>

        <Box>
          <IconButton
            color="inherit"
            onClick={onToggleSearch}
            aria-label="search"
          >
            <Search />
          </IconButton>

          <IconButton
            color="inherit"
            onClick={onToggleFavorite}
            aria-label="toggle favorites"
          >
            {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default StudentVocabularyAppBar;
```

### StudentVocabularyGoalSection

- Displays current goal progress
- Allows setting new goals
- Shows motivational messages

```jsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Button,
  Icon,
} from "@mui/material";
import { Flag, CheckCircle } from "@mui/icons-material";
import { useStudentVocabulary } from "../../../../contexts/studentVocabularyContext";
import StudentGoalSettingDialog from "../dialogs/StudentGoalSettingDialog";

const StudentVocabularyGoalSection = () => {
  const {
    activeGoal,
    createVocabularyGoal,
    updateGoalProgress,
    progressPercentage,
    currentProgress,
    dailyTarget,
    isCompleted,
  } = useStudentVocabulary();

  const [openGoalDialog, setOpenGoalDialog] = useState(false);

  const handleSetGoal = (dailyTarget) => {
    createVocabularyGoal({ dailyTarget });
    setOpenGoalDialog(false);
  };

  if (!activeGoal) {
    return (
      <Card
        sx={{ mb: 2, bgcolor: "primary.light", color: "primary.contrastText" }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <Flag color="inherit" />
            <Typography variant="h6" sx={{ ml: 1 }}>
              Set Your Daily Vocabulary Goal
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ mb: 2 }}>
            Track your progress and stay motivated by setting a daily vocabulary
            goal.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<Icon>add</Icon>}
            onClick={() => setOpenGoalDialog(true)}
          >
            Set Goal
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="h6">Today's Goal</Typography>

            {isCompleted ? (
              <Box display="flex" alignItems="center">
                <Typography
                  variant="subtitle1"
                  color="primary.main"
                  fontWeight="bold"
                >
                  Goal Achieved!
                </Typography>
                <CheckCircle color="primary" sx={{ ml: 1 }} />
              </Box>
            ) : (
              <Typography
                variant="subtitle1"
                color="primary.main"
                fontWeight="bold"
              >
                {currentProgress} / {dailyTarget}
              </Typography>
            )}
          </Box>

          <LinearProgress
            variant="determinate"
            value={progressPercentage * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </CardContent>
      </Card>

      <StudentGoalSettingDialog
        open={openGoalDialog}
        onClose={() => setOpenGoalDialog(false)}
        onSetGoal={handleSetGoal}
      />
    </>
  );
};

export default StudentVocabularyGoalSection;
```

### StudentVocabularyProgressSection

- Visual representation of progress (progress bar)
- Statistics (words learned, remaining, etc.)

```jsx
import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";

const StudentVocabularyProgressSection = ({ currentIndex, totalWords }) => {
  const progress = totalWords > 0 ? ((currentIndex + 1) / totalWords) * 100 : 0;

  return (
    <Box sx={{ mb: 2 }}>
      <Box display="flex" justifyContent="space-between" mb={0.5}>
        <Typography variant="body2" color="text.secondary">
          Word {currentIndex + 1} of {totalWords}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {Math.round(progress)}%
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
};

export default StudentVocabularyProgressSection;
```

### StudentVocabularyWordCard

- Displays the current word
- Shows definition and examples
- Provides pronunciation button
- Contains buttons to mark as learned/difficult

```jsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Divider,
} from "@mui/material";
import {
  VolumeUp,
  CheckCircle,
  Warning,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import { useStudentVocabulary } from "../../../../contexts/studentVocabularyContext";
import {
  getDifficultyColor,
  getFrequencyDescription,
} from "../../utils/vocabularyHelpers";

const StudentVocabularyWordCard = ({
  word,
  onMarkLearned,
  onMarkDifficult,
  onToggleFavorite,
}) => {
  const { getWordProgress } = useStudentVocabulary();
  const progress = getWordProgress(word.id);
  const isFavorite = progress?.isFavorite || false;

  const handlePlayPronunciation = () => {
    // Play audio if available
    if (word.pronunciation) {
      const audio = new Audio(word.pronunciation);
      audio.play();
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h5" component="h2">
            {word.word}
          </Typography>

          <Box>
            <IconButton
              onClick={handlePlayPronunciation}
              aria-label="pronunciation"
            >
              <VolumeUp />
            </IconButton>

            <IconButton onClick={onToggleFavorite} aria-label="toggle favorite">
              {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
          </Box>
        </Box>

        <Box display="flex" gap={1} mb={2}>
          <Chip
            label={word.level}
            size="small"
            sx={{ bgcolor: getDifficultyColor(word.level) }}
          />

          <Chip label={word.category} size="small" variant="outlined" />
        </Box>

        <Typography variant="body1" paragraph>
          {word.definition}
        </Typography>

        {word.examples && word.examples.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Examples:
            </Typography>
            {word.examples.map((example, index) => (
              <Typography
                key={index}
                variant="body2"
                paragraph
                sx={{
                  pl: 2,
                  borderLeft: "2px solid",
                  borderColor: "primary.light",
                }}
              >
                {example}
              </Typography>
            ))}
          </Box>
        )}

        {word.frequency && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            {getFrequencyDescription(word.frequency)}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between" gap={2}>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={onMarkLearned}
            fullWidth
          >
            I Know This
          </Button>

          <Button
            variant="outlined"
            color="warning"
            startIcon={<Warning />}
            onClick={onMarkDifficult}
            fullWidth
          >
            Difficult
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StudentVocabularyWordCard;
```

### StudentVocabularyNavigationControls

- Next/previous word buttons
- Random word option

```jsx
import React from "react";
import { Box, Button, IconButton } from "@mui/material";
import { ArrowBack, ArrowForward, Shuffle } from "@mui/icons-material";
import { useStudentVocabulary } from "../../../../contexts/studentVocabularyContext";

const StudentVocabularyNavigationControls = ({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}) => {
  const { setRandomWord } = useStudentVocabulary();

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mt={2}
    >
      <Button
        startIcon={<ArrowBack />}
        onClick={onPrevious}
        disabled={!hasPrevious}
        variant="outlined"
      >
        Previous
      </Button>

      <IconButton onClick={setRandomWord} aria-label="random word">
        <Shuffle />
      </IconButton>

      <Button
        endIcon={<ArrowForward />}
        onClick={onNext}
        disabled={!hasNext}
        variant="contained"
      >
        Next
      </Button>
    </Box>
  );
};

export default StudentVocabularyNavigationControls;
```

### Dialog Components

#### StudentGoalCompletedDialog

```jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const StudentGoalCompletedDialog = ({ open, onClose, onSetNewGoal }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Goal Achieved!</DialogTitle>
      <DialogContent>
        <Typography>
          Congratulations! You have reached your daily vocabulary goal. Would
          you like to set a new one?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Not Now</Button>
        <Button onClick={onSetNewGoal} variant="contained" color="primary">
          Set New Goal
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentGoalCompletedDialog;
```

#### StudentMotivationDialog

```jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const StudentMotivationDialog = ({ open, onClose, message }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Great Job!</DialogTitle>
      <DialogContent>
        <Typography>
          {message ||
            "You've been learning for another 10 minutes. Keep it up!"}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Thanks!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentMotivationDialog;
```

#### StudentPronunciationDialog

```jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { VolumeUp, Mic, Check, Close } from "@mui/icons-material";

const StudentPronunciationDialog = ({
  open,
  onClose,
  word,
  pronunciationUrl,
  onSuccess,
  onRetry,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState(null);

  const handlePlayPronunciation = () => {
    if (pronunciationUrl) {
      const audio = new Audio(pronunciationUrl);
      audio.play();
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // In a real implementation, this would use the Web Speech API
    // or another speech recognition service

    // Simulate recording and result
    setTimeout(() => {
      setIsRecording(false);
      // For demo purposes, randomly succeed or fail
      const success = Math.random() > 0.5;
      setResult(success);
    }, 2000);
  };

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleRetry = () => {
    setResult(null);
    if (onRetry) onRetry();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Practice Pronunciation</DialogTitle>
      <DialogContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          py={2}
        >
          <Typography variant="h4">{word}</Typography>

          <IconButton
            onClick={handlePlayPronunciation}
            color="primary"
            sx={{ fontSize: "2rem" }}
          >
            <VolumeUp fontSize="inherit" />
          </IconButton>

          <Typography variant="body2" color="text.secondary">
            Listen to the pronunciation and try to repeat it
          </Typography>

          {result === null ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Mic />}
              onClick={handleStartRecording}
              disabled={isRecording}
            >
              {isRecording ? "Listening..." : "Record Your Voice"}
            </Button>
          ) : result ? (
            <Box display="flex" flexDirection="column" alignItems="center">
              <Check color="success" sx={{ fontSize: "3rem" }} />
              <Typography color="success.main">Great pronunciation!</Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center">
              <Close color="error" sx={{ fontSize: "3rem" }} />
              <Typography color="error">Try again</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {result === null ? (
          <Button onClick={onClose}>Cancel</Button>
        ) : result ? (
          <Button onClick={handleSuccess} variant="contained" color="primary">
            Continue
          </Button>
        ) : (
          <>
            <Button onClick={onClose}>Skip</Button>
            <Button onClick={handleRetry} variant="contained" color="primary">
              Try Again
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StudentPronunciationDialog;
```

## Responsive Design

The implementation will be fully responsive following Material-UI best practices:

1. Use Grid and Box components for layout
2. Implement breakpoints for different screen sizes:

   - xs (< 600px): Mobile-first design with stacked components
   - sm (600px+): Tablet layout with adjusted spacing
   - md (960px+): Desktop layout with optimal reading width
   - lg (1280px+): Enhanced desktop layout with additional features

3. Responsive typography using theme.typography variants
4. Touch-friendly UI elements for mobile users

### Mobile-First Approach

```jsx
// Example of responsive design in StudentVocabularyWordCard
<Card
  sx={{
    mb: { xs: 1, sm: 2 },
    mx: { xs: -1, sm: 0 },
    borderRadius: { xs: 0, sm: 1 },
  }}
>
  <CardContent
    sx={{
      p: { xs: 2, sm: 3 },
    }}
  >
    <Typography
      variant="h5"
      component="h2"
      sx={{
        fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
      }}
    >
      {word.word}
    </Typography>

    {/* Other content */}

    <Box
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      gap={{ xs: 1, sm: 2 }}
    >
      <Button
        variant="contained"
        color="success"
        startIcon={<CheckCircle />}
        onClick={onMarkLearned}
        fullWidth
      >
        I Know This
      </Button>

      <Button
        variant="outlined"
        color="warning"
        startIcon={<Warning />}
        onClick={onMarkDifficult}
        fullWidth
      >
        Difficult
      </Button>
    </Box>
  </CardContent>
</Card>
```

## Implementation Steps

1. **Set up folder structure and files**

   - Create all directories and files as outlined in the component structure

2. **Implement data services**

   - Create service files with Firebase integration
   - Implement CRUD operations for vocabulary data

3. **Create context provider**

   - Implement StudentVocabularyContext with state management
   - Connect to services for data operations

4. **Build UI components**

   - Start with the main container component
   - Implement child components
   - Create dialog components

5. **Add responsive styling**

   - Implement Material-UI styling
   - Ensure responsive behavior across devices

6. **Connect to routing**

   - Add the vocabulary building page to the application routes
   - Implement navigation to/from the page

7. **Testing and refinement**
   - Test all functionality
   - Ensure performance optimization
   - Verify responsive behavior
