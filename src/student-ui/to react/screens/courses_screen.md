# Courses Screen UI Migration Plan

## Overview

Displays a list of available courses, enrollment status, and navigation to course details.

## Components

- CourseList (cards or table)
- EnrollmentStatus
- SearchBar
- Filter/SortControls
- CourseCard (title, description, progress)

## Layout

- Top: SearchBar, Filter/SortControls
- Main: CourseList
- Side/Bottom: EnrollmentStatus

## State Management

- Use React Context or Redux for courses and enrollment data

## Data Fetching

- Fetch courses and enrollment status on mount

## Interactivity

- Clickable course cards for details
- Enroll/Unenroll actions

## Accessibility

- ARIA roles for list and cards
- Keyboard navigation

## Mobile

- Stacked cards
- Floating enroll button
