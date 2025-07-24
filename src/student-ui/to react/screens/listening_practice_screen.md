# Listening Practice Screen UI Migration Plan

## Overview

Provides listening exercises and tracks user progress.

## Components

- ListeningExerciseList
- AudioPlayer
- ProgressBar
- StartExerciseButton

## Layout

- Top: ProgressBar
- Main: ListeningExerciseList, AudioPlayer
- Bottom: StartExerciseButton

## State Management

- Use React Context or Redux for listening exercises and progress

## Data Fetching

- Fetch exercises and progress on mount

## Interactivity

- Play/pause audio
- Start/complete exercises

## Accessibility

- ARIA roles for audio controls
- Keyboard navigation

## Mobile

- Stacked exercises
- Large play button
