# Progress Screen UI Migration Plan

## Overview

The Progress Screen visualizes user progress in pronunciation, achievements, recent activities, course bars, goals, and trends.

## Components

- PronunciationProgressSection
- AchievementsProgressSection
- RecentActivitiesSection
- CourseProgressBars
- GoalsSection
- TrendChart

## Layout

- Use tabs or accordions for each progress type
- Main area: Pronunciation and Course Progress
- Side/Bottom: Achievements, Recent Activities, Goals, Trend Chart

## State Management

- Use React Context or Redux for progress data

## Data Fetching

- Fetch all progress data on mount

## Interactivity

- Clickable charts and bars for details
- Filter by date or course

## Accessibility

- Descriptive chart labels
- Keyboard navigation

## Mobile

- Scrollable sections
- Collapsible panels
