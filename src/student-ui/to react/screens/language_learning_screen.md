# Language Learning Screen UI Migration Plan

## Overview

Provides interactive language learning activities and exercises.

## Components

- ActivityList
- ActivityCard
- ProgressBar
- StartActivityButton

## Layout

- Top: ProgressBar
- Main: ActivityList (cards or steps)
- Bottom: StartActivityButton

## State Management

- Use React Context or Redux for activities and progress

## Data Fetching

- Fetch activities and progress on mount

## Interactivity

- Start/complete activities
- Track progress

## Accessibility

- ARIA roles for activities
- Keyboard navigation

## Mobile

- Stacked cards
- Large start button
