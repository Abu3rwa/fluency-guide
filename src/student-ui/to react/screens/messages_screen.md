# Messages Screen UI Migration Plan

## Overview

Displays user messages, message threads, and allows sending/receiving messages.

## Components

- MessagesList
- MessageThread
- MessageInput
- SearchBar
- FilterControls

## Layout

- Top: SearchBar, FilterControls
- Main: MessagesList, MessageThread
- Bottom: MessageInput

## State Management

- Use React Context or Redux for messages state

## Data Fetching

- Fetch messages and threads on mount

## Interactivity

- Send/receive messages
- Search and filter threads
- Mark as read/unread

## Accessibility

- ARIA roles for list and input
- Keyboard navigation

## Mobile

- Stacked layout
- Floating message input
