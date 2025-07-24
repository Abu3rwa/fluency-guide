# Admin Screens UI Migration Plan

## Overview

Admin screens allow management of vocabulary uploads and enrollment requests.

## Screens

- VocabularyUploadScreen
- EnrollmentRequestsScreen

## Components

- UploadForm
- UploadProgress
- RequestsList
- ApproveRejectButtons

## Layout

- Top: UploadForm or RequestsList
- Main: UploadProgress or RequestsList
- Side/Bottom: Approve/Reject actions

## State Management

- Use React Context or Redux for admin data

## Data Fetching

- Fetch uploads and requests on mount

## Interactivity

- Upload vocabulary files
- Approve/reject enrollment requests

## Accessibility

- Labeled inputs and buttons
- Keyboard navigation

## Mobile

- Stacked layout
- Floating action buttons
