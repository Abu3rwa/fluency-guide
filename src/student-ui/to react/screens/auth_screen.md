# Auth Screen UI Migration Plan

## Overview

Handles user authentication: login, registration, password reset.

## Components

- LoginForm
- RegisterForm
- PasswordResetForm
- SocialLoginButtons
- ErrorMessages

## Layout

- Tabbed or switchable forms (login/register/reset)
- Centered card or modal

## State Management

- Local state for form fields
- Context/Redux for auth state

## Data Fetching

- Call auth service on submit

## Interactivity

- Form validation
- Show/hide password
- Error handling

## Accessibility

- Labeled inputs
- Keyboard navigation

## Mobile

- Fullscreen forms
- Large buttons
