# Vocabulary Goal Setting Screen UI Migration Plan

## Overview

Allows users to set and track vocabulary learning goals.

## Components

- GoalInputForm
- CurrentGoalsList
- ProgressBar
- SaveButton

## Layout

- Top: GoalInputForm
- Main: CurrentGoalsList, ProgressBar
- Bottom: SaveButton

## State Management

- Use React Context or Redux for goals state

## Data Fetching

- Fetch current goals on mount
- Save new goals on submit

## Interactivity

- Add/edit/remove goals
- Save/cancel actions

## Accessibility

- Labeled inputs
- Keyboard navigation

## Mobile

- Stacked layout
- Floating save button
