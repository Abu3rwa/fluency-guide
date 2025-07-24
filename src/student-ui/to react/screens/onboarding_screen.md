# Onboarding Screen UI Migration Plan

## Overview

Guides new users through app features and initial setup.

## Components

- WelcomeMessage
- FeatureHighlights (carousel or steps)
- AccountSetupForm
- ProgressIndicator
- GetStartedButton

## Layout

- Stepper or carousel for feature highlights
- Form for account setup
- Progress indicator at the top or bottom

## State Management

- Local state for onboarding steps
- Context/Redux for account setup

## Data Fetching

- None (except for account creation)

## Interactivity

- Next/Back navigation
- Form validation

## Accessibility

- ARIA roles for steps
- Keyboard navigation

## Mobile

- Fullscreen stepper
- Large buttons
