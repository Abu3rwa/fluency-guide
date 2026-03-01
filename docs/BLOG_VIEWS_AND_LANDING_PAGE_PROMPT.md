# Blog Views & Landing Page Visits – Full Implementation Prompt

Use this prompt to implement **blog view tracking** and **landing page visit tracking** in the Sudanglish React/Firebase app. Copy and paste it into an AI coding assistant (e.g. Cursor in Agent mode) to implement the feature.

---

## Goal

1. **Blog views**: When a user opens a blog post, record the view in two places:
   - **Firestore**: Increment a `viewCount` field on the post document so the admin dashboard can show total views and top posts.
   - **Firebase Analytics (GA4)**: Send a `blog_post_viewed` event so you can see blog readers and their behavior (including geography) in Google Analytics.

2. **Landing page visits**: Clearly track when users hit the homepage (landing page) so you can see landing page traffic and, in GA4, segment by geography and other dimensions.
   - **Firebase Analytics**: Send a `landing_page_viewed` event when the user views the root path `/` (in addition to the existing `page_view`).

---

## Tech Context

- **Firebase**: Use `db` and `logEvent` from `src/firebase.js`. Firestore collection for posts is **`blog_posts`** (not `blogs`). Documents have `id`, `slug`, `title` (object with `en`/`ar`), `category` (object with `en`/`ar`), `publishedAt`, `author`, etc.
- **Blog post page**: `src/pages/BlogPost.jsx` – uses `useParams()` for `slug`, Redux `selectCurrentPost` / `fetchPostBySlug`, and `currentPost` from the blog slice.
- **Page view tracker**: `src/components/analytics/PageViewTracker.jsx` – uses `useLocation()` and calls `logPageView(pathname, document?.title)` on route change. Use `logEvent` from `src/firebase.js` for the extra landing-page event.

---

## Implementation Steps

### Part 1: Blog view tracking

#### Step 1.1 – Firestore: increment `viewCount` on blog post view

1. Open **`src/pages/BlogPost.jsx`**.
2. Import from Firestore: `doc`, `updateDoc`, `increment` from `firebase/firestore`, and `db` from `../firebase` (or the correct path to your firebase module).
3. Add a **`useEffect`** that runs when the post is successfully loaded (when `currentPost` is set and has an `id`). Inside the effect:
   - **Anti-spam**: Use `sessionStorage` to allow only **one count per session per post**. For example: `const key = 'blog_view_' + currentPost.id`. If `sessionStorage.getItem(key)` is already set, skip the increment. Otherwise, after incrementing, set `sessionStorage.setItem(key, '1')`.
   - **Increment in Firestore**: Update the document `blog_posts/{currentPost.id}` with `updateDoc(doc(db, 'blog_posts', currentPost.id), { viewCount: increment(1) })`. If your Firestore security rules do not allow clients to update `viewCount`, you must add a rule that allows authenticated or unauthenticated users to update only the `viewCount` field on `blog_posts` documents (read your existing `firestore.rules` and extend them accordingly).
   - Call the Firestore update inside the effect only when the session check passes. Do not block the UI; run it in the background (no need to await in a way that holds the user).
4. Ensure the effect does not run when `currentPost` is null or when the user is in a loading/error state (guard with `if (!currentPost?.id) return;`).

#### Step 1.2 – Firebase Analytics: send `blog_post_viewed` event

1. In **`src/pages/BlogPost.jsx`**, import `logEvent` from your firebase module (e.g. `../firebase`).
2. In the **same `useEffect`** where you increment `viewCount` (or in a separate effect that also depends on `currentPost`), call:
   ```js
   logEvent('blog_post_viewed', {
     post_id: currentPost.id,
     post_slug: currentPost.slug,
     post_title: currentPost.title?.en || currentPost.title?.ar || '',
     category: currentPost.category?.en || currentPost.category?.ar || '',
   });
   ```
   Do this when the post is loaded and visible to the user (e.g. after you’ve decided to count the view). You can send this every time the page is viewed in the session; GA4 will still give you unique users and event counts. Optionally, you can send it only when you actually increment the view count (once per session per post) so Firestore and Analytics stay aligned.

#### Step 1.3 – Firestore rules for `viewCount`

1. Open **`firestore.rules`**.
2. Ensure that the `blog_posts` collection allows clients to **update** documents with at least the `viewCount` field. For example, if you use a rule like:
   - `allow read: if ...; allow create, update: if request.auth != null && ...;`
   you can add a separate rule that allows **update** only for the `viewCount` field (e.g. allow update if the only changed field is `viewCount` and it is a number). Adjust to your existing rules so that unauthenticated or authenticated users can increment `viewCount` without being able to change other fields. Document the rule change in a short comment in the rules file.

---

### Part 2: Landing page visit tracking

#### Step 2.1 – Send `landing_page_viewed` when user views `/`

1. Open **`src/components/analytics/PageViewTracker.jsx`**.
2. Import `logEvent` from your firebase module (e.g. `../../firebase`).
3. In the existing `useEffect` that runs on `pathname` change, after calling `logPageView(pathname, document?.title || pathname)`:
   - If `pathname === '/'` (root path = landing page), also call:
     ```js
     logEvent('landing_page_viewed', {
       page_path: '/',
       page_title: document?.title || 'Home',
     });
     ```
   This way every landing page visit is recorded as both a generic `page_view` and a specific `landing_page_viewed` event, so you can filter “landing page visits” and see their count and geography in GA4.

---

## What you get after implementation

- **Blog views**
  - **Firestore**: Each `blog_posts` document can have a `viewCount` field that increments once per session per post. Your admin dashboard can sum these and list “top posts by views.”
  - **GA4**: Events → `blog_post_viewed` with parameters `post_id`, `post_slug`, `post_title`, `category`. You can see number of blog readers, which posts are read, and in GA4’s Geography report, where those readers are from.

- **Landing page visits**
  - **GA4**: Events → `landing_page_viewed` (and existing `page_view` for `/`). In GA4 you can segment by “landing page” and see visitor count and geography (Reports → User attributes → Demographic details / Geography).

---

## Acceptance criteria

- [ ] When a user opens a blog post, `viewCount` on that post in `blog_posts` increments **once per session** (sessionStorage prevents repeated increments on refresh).
- [ ] When a user opens a blog post, a `blog_post_viewed` event is sent to Firebase Analytics with `post_id`, `post_slug`, `post_title`, `category`.
- [ ] When a user visits the homepage (path `/`), a `landing_page_viewed` event is sent to Firebase Analytics with `page_path: '/'` and `page_title`.
- [ ] Firestore rules allow updating `viewCount` on `blog_posts` (and no other fields if you restricted the rule) for the chosen client role.
- [ ] No console errors; existing blog and homepage behavior unchanged.

---

## Analytics domain structure (required for dashboard / blog analytics)

All **analytics-related pages** (admin dashboard, blog analytics, overview, etc.) must live under the **domain folder** `src/pages/admin/analytics/` and be **modular**:

- **Location**: `src/pages/admin/analytics/` (under admin, so routes are naturally `/admin/analytics`, `/admin/analytics/blog`, etc.).
- **Structure**:
  - Use an **index file** (e.g. `index.js` or `index.jsx`) as a barrel that exports the main dashboard and any public pages from this domain.
  - Place each main view in its own module, e.g. `AnalyticsDashboard.jsx` (overview + summary cards), `BlogAnalytics.jsx` (blog views and top posts table). Optionally use a `sections/` or `components/` subfolder for reusable pieces (e.g. overview cards, blog table).
- **Routing**: Register routes (e.g. `/admin/analytics`, `/admin/analytics/blog`) so they load from this domain (e.g. `import from './pages/admin/analytics'` or lazy `import('./pages/admin/analytics')`).
- **Consistency**: Match the same patterns as the rest of `src/pages/admin/`: admin-only access via `ProtectedRoute requiredRole="admin"`, use of `useAuth`, Firestore `db` from `src/firebase.js`, and existing MUI/styling conventions.

When you implement the Admin Analytics Dashboard or Blog Analytics UI, create it under `src/pages/admin/analytics/` with this modular structure.

---

## Optional follow-up

- Build the **Admin Analytics** dashboard under **`src/pages/admin/analytics/`** (modular, as above): a main dashboard that reads from Firestore `blog_posts`, sums `viewCount`, and shows total blog views plus a table of top posts by views. Add route(s) and an admin nav link to this domain (see `docs/BLOG_VIEW_TRACKING_PROMPT.md` for blog-specific behavior; blog analytics is a main feature, not optional).

---

*End of prompt.*
