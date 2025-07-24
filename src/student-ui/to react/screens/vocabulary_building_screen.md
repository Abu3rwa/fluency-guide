# Vocabulary Building Screen UI Migration Plan

## Overview

Facilitates vocabulary learning with cards, quizzes, goals, and progress tracking.

## Components

- WordCard
- GoalProgressSection
- ProgressSection
- GoalPromptSection
- NavigationControls
- VocabularyAppBar
- GoalWidgets
- VocabularyControls

## Layout

- Top: VocabularyAppBar
- Main: WordCard, ProgressSection, GoalProgressSection
- Bottom: NavigationControls, GoalPromptSection

## State Management

- Use React Context or Redux for vocabulary, goals, and progress

## Data Fetching

- Fetch vocabulary, goals, and progress on mount

## Interactivity

- Flip cards, mark as learned, set goals
- Navigation between words

## Accessibility

- ARIA roles for cards and controls
- Keyboard navigation

## Mobile

- Swipeable cards
- Sticky navigation controls
