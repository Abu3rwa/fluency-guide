# Lesson Screens UI Migration Plan

## Overview

Lesson-related screens include lesson details, lesson content, and lesson progress. These screens provide users with access to lesson objectives, content, progress tracking, and actions.

## Main Screens

- LessonDetailsScreen
- LessonContent (sections, media, exercises)
- LessonProgressBar

## Shared Components

- LessonHeader
- ProgressBar
- ActionButtons
- RelatedLessons

## Layout Principles

- Consistent header and navigation
- Responsive design for desktop and mobile
- Sticky action bar for lesson actions

## State Management

- Use React Context or Redux for lesson and progress state

## Data Fetching

- Fetch lesson data and progress on mount

## Interactivity

- Start/Continue/Complete lesson actions
- Expand/collapse content sections

## Accessibility

- Semantic HTML for lesson content
- Keyboard accessible actions

## Mobile

- Collapsible content
- Sticky action bar
