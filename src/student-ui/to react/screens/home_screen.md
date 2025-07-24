# Home Screen UI Migration Plan

## Overview

The Home Screen is the main dashboard for users, providing access to statistics, learning paths, achievements, progress overview, quick actions, and greetings.

## Components

- StatisticsSection
- LearningPathSection
- AchievementsSection
- ProgressOverview
- QuickActionsSection
- GreetingSection

## Layout

- Use a responsive grid or flex layout.
- Top: GreetingSection
- Main: Statistics, Learning Path, Achievements, Progress Overview
- Side/Bottom: Quick Actions

## Navigation

- Links to Profile, Progress, Courses, Lessons, Vocabulary, Achievements, Settings

## State Management

- Use React Context or Redux for user data and progress.

## Data Fetching

- Fetch user stats, achievements, and progress from services on mount.

## Interactivity

- Clickable cards for navigation
- Real-time updates for progress and achievements

## Accessibility

- Keyboard navigable
- ARIA labels for sections

## Mobile

- Collapsible sections
