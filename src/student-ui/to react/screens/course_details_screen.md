# Course Details Screen UI Migration Plan

## Overview

Shows detailed information about a selected course, including modules, lessons, progress, and enrollment actions.

## Components

- CourseHeader (title, description, instructor)
- ModuleList
- LessonList
- ProgressBar
- EnrollmentActions

## Layout

- Top: CourseHeader
- Main: ModuleList, LessonList
- Bottom: ProgressBar, EnrollmentActions

## State Management

- Use React Context or Redux for course, module, and lesson data

## Data Fetching

- Fetch course details, modules, and lessons on mount

## Interactivity

- Enroll/Unenroll actions
- Expand/collapse modules
- Start lesson action

## Accessibility

- Semantic HTML for lists
- Keyboard accessible actions

## Mobile

- Collapsible modules
- Sticky enroll button
