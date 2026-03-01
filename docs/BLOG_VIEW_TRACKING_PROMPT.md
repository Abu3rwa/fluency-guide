# Blog Analytics & Tracking Implementation Prompt

Use the following prompt to implement the Blog View Tracking feature along with an Admin Analytics Dashboard in the React/Firebase application. You can copy and paste this into an AI coding assistant (like Cursor, GitHub Copilot, or Gemini).

---

## 🎯 The Goal
We need to track how many people are reading our blog posts and provide an Admin UI dashboard to visualize these metrics. 

We will use a **Hybrid Approach**: 
1. **Firestore `viewCount`**: A real-time counter in our database to easily display the view counts on our frontend and in our custom admin dashboard.
2. **Firebase Analytics**: Logging specific `blog_post_viewed` events for deeper, long-term marketing insights in the Google Analytics console.

## 📋 Implementation Steps

### Step 1: Initialize Firebase Analytics
1. Open `src/firebase.js`.
2. Import `getAnalytics` and `logEvent` from `"firebase/analytics"`.
3. Initialize analytics (`const analytics = getAnalytics(app);`) after the Firebase app is initialized.
4. Export both `analytics` and `logEvent` so they can be used across the app.

### Step 2: Implement View Tracking on the Blog Post Page
1. Open `src/pages/BlogPost.jsx`.
2. **Firestore Counter**: Import `doc` and `increment` and `updateDoc` from `firebase/firestore`.
3. Create a `useEffect` hook that runs once when the component mounts (or when `id` changes).
   - In the hook, write logic to update the current blog post document in Firestore, incrementing a field called `viewCount` by `1`.
   - *Anti-spam protection*: Check `sessionStorage` or `localStorage` to ensure we only increment the view count **once per session** per blog post ID (e.g., `sessionStorage.getItem('viewed_' + postId)`).
4. **Firebase Analytics**: In the same `useEffect`, call `logEvent(analytics, 'blog_post_viewed', { post_id: id, post_title: post.title, category: post.category })`.

### Step 3: Create the Admin Blog Analytics Dashboard UI (admin/analytics domain, modular)
1. **Domain folder**: All analytics pages must live under **`src/pages/admin/analytics/`**. Use a **modular** structure:
   - Add a barrel file `src/pages/admin/analytics/index.js` (or `index.jsx`) that exports the dashboard and any analytics pages.
   - Create the blog analytics view at `src/pages/admin/analytics/BlogAnalytics.jsx` (or compose it inside a main `AnalyticsDashboard.jsx` that lives in the same folder). Optionally use a `sections/` or `components/` subfolder for reusable pieces (e.g. overview cards, top-posts table).
2. Restrict the page to users with the `admin` role (using the existing `<ProtectedRoute requiredRole="admin">` wrapper).
3. The UI should display:
   - **Total Views Across All Posts** (an aggregate sum of all `viewCount` fields).
   - **Top Performing Posts**: A table or list showing the blog posts, sorted by `viewCount` in descending order.
   - For each post in the list, display: `Title`, `Author`, `Publish Date`, and the `Total Views`.
   - *Design Note*: Use the existing UI components and styling conventions (e.g. MUI, as in `UserManagement.jsx`).
4. **Data Fetching**: Fetch documents from the **`blog_posts`** collection in Firestore (not `blogs`), map over them, and use the `viewCount` field (default to 0 if missing).

### Step 4: Add the admin/analytics route and navigation
1. Open `src/App.jsx`.
2. Import the analytics dashboard or blog analytics from **`src/pages/admin/analytics`** (e.g. lazy load `import('./pages/admin/analytics')` for `AnalyticsDashboard` or `BlogAnalytics`).
3. Add a route that points to this domain, e.g. `<Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AnalyticsDashboard /></ProtectedRoute>} />` or `/admin/analytics/blog` for a dedicated blog analytics page.
4. Add a navigation link to the analytics dashboard in the admin area (header or sidebar), next to the existing link to User Management.

## ✅ Acceptance Criteria
- When a user views a blog post, its `viewCount` goes up by 1 in Firestore (only once per session).
- A `blog_post_viewed` event is successfully sent to Firebase Analytics.
- An admin can navigate to the analytics dashboard (e.g. `/admin/analytics` or `/admin/analytics/blog`) and see a real-time table of their most popular blog posts.
- The UI matches the existing application's aesthetic.