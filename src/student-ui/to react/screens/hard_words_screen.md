# Hard Words Screen UI Migration Plan

## Overview

Displays a list of words the user finds difficult, with options to review and practice.

## Components

- HardWordsList
- WordCard
- PracticeButton
- RemoveButton

## Layout

- Top: Title and PracticeButton
- Main: HardWordsList (WordCards)
- Side/Bottom: RemoveButton

## State Management

- Use React Context or Redux for hard words state

## Data Fetching

- Fetch hard words on mount

## Interactivity

- Practice word, remove from list

## Accessibility

- ARIA roles for list and cards
- Keyboard navigation

## Mobile

- Stacked cards
- Swipe to remove
