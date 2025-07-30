## Feature Plan: Personalized Review System

### 1. Overview

To significantly enhance learning effectiveness and user retention, we will implement a Personalized Review System. This system will use a Spaced Repetition System (SRS) algorithm to create optimized review schedules for students based on their performance across different learning activities (vocabulary, grammar, pronunciation, etc.).

This feature directly addresses a core need in online learning: reinforcing knowledge to ensure long-term retention. It leverages our existing detailed progress-tracking services to provide a highly personalized and effective learning experience.

### 2. Core Components

#### A. Spaced Repetition Algorithm

- We will implement a well-known SRS algorithm, such as a variant of SM-2 or FSRS (Free Spaced Repetition Scheduler).
- The algorithm will determine the optimal time to review a learning item (e.g., a vocabulary word) based on the student's recall performance during a review session.
- Key parameters to track for each item will include:
  - `easeFactor`: A number representing how easy the item is for the student.
  - `interval`: The number of days until the next review.
  - `repetitions`: The number of times the item has been successfully recalled.

#### B. Data Models (Firestore)

We will introduce a new collection for each user to manage their review items.

- **`users/{userId}/reviewItems/{itemId}`**:
  - `itemId`: A unique identifier for the learning item (e.g., `vocab_word_id`, `grammar_rule_id`).
  - `itemType`: (e.g., 'vocabulary', 'grammar', 'pronunciation').
  - `contentRef`: A reference to the actual content (e.g., a document in the `vocabulary` collection).
  - `nextReviewDate`: `Timestamp` - The next scheduled review date.
  - `lastReviewedDate`: `Timestamp` - The date of the last review.
  - `easeFactor`: `number` - The SRS ease factor.
  - `interval`: `number` - The current review interval in days.
  - `repetitions`: `number` - The number of consecutive successful reviews.
  - `lapses`: `number` - The number of times the user has forgotten the item.

#### C. Backend Services (`reviewService.js`)

A new service will be created to manage the review logic.

- `getReviewQueue(userId)`: Fetches all items where `nextReviewDate` is in the past, ordered by `nextReviewDate`. This forms the student's daily review queue.
- `updateReviewItem(userId, itemId, performance)`: Updates an item's SRS parameters based on the student's performance in a review session (e.g., 'correct', 'incorrect'). This will calculate and set the new `nextReviewDate`, `interval`, and `easeFactor`.
- `createReviewItem(userId, itemRef, itemType)`: Creates a new review item for a piece of content the user has just learned, scheduling its first review.

#### D. UI Components

- **Dashboard Widget**: A new card on the `StudentDashboardPage` that shows the number of items due for review and a "Start Review" button.
- **Review Page**: A dedicated page (`/review`) that displays the review queue.
- **Review Session Component**: An interactive, flashcard-like component that presents one item at a time. It will have options for the user to rate their recall (e.g., "Forgot", "Hard", "Good", "Easy"), which will feed into the `updateReviewItem` service call.

### 3. Implementation Roadmap

#### Phase 1: Backend and Data Model

1.  **Schema Design**: Finalize and document the Firestore schema for the `reviewItems` collection.
2.  **Service Layer**: Implement `reviewService.js` with the core SRS logic.
    - Implement `getReviewQueue`.
    - Implement `updateReviewItem` with the chosen SRS algorithm.
    - Implement `createReviewItem`.
3.  **Initial Seeding**: Write a script or integrate into existing services (`lessonProgressService`, `vocabularyProgressService`) to create initial `reviewItems` when a user learns new material. For example, after a vocabulary quiz, all new words are added to the review queue.

#### Phase 2: Frontend Implementation

1.  **Dashboard Integration**: Create the dashboard widget to display the number of pending reviews and link to the review page.
2.  **Review Page**: Build the `/review` page. This page will fetch the review queue using `reviewService.getReviewQueue()` and display the items.
3.  **Review Session UI**: Develop the interactive flashcard component. This component will handle user input for performance and call `reviewService.updateReviewItem()` after each item.
4.  **State Management**: Use a state management solution (like React Context or a dedicated state library) to manage the state of the review session.

#### Phase 3: Refinement and Expansion

1.  **Analytics**: Track review session completion rates and the impact on skill-based progress metrics (e.g., vocabulary accuracy).
2.  **Expand Item Types**: Extend the system to handle other types of content, such as grammar rules or pronunciation exercises, by creating corresponding flashcard templates.
3.  **Notifications**: Implement a notification system to remind users when they have items due for review.

### 4. Success Metrics

- **Engagement**: Increase in Daily Active Users (DAU) and average session length.
- **Learning Outcomes**: Improvement in skill-based progress metrics like `vocabulary.accuracyRate` and `grammar.accuracyRate` over time.
- **User Feedback**: Positive feedback from users regarding the effectiveness of the review feature.
- **Feature Adoption**: High percentage of active users engaging with the review feature daily or weekly.
