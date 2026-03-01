# Google Analytics (GA4) with Firebase

Your app uses **Firebase Analytics**, which is the same as **Google Analytics 4 (GA4)** once you link the two in the Firebase Console.

## 1. Link Firebase to Google Analytics 4

1. Open [Firebase Console](https://console.firebase.google.com/) and select your project.
2. Go to **Project settings** (gear) → **Integrations**.
3. Find **Google Analytics** and click **Link** (or **Manage** if already linked).
4. Create or select a GA4 property and complete the link.

After this, events sent from your app appear in the [Google Analytics](https://analytics.google.com/) report for that property.

## 2. What’s already implemented

- **Firebase Analytics** is initialized in `src/firebase.js` (same config as your existing Firebase app).
- **Automatic page views**: `PageViewTracker` in `App.jsx` logs a `page_view` event whenever the route changes (path + title).
- **Helpers** from `src/firebase.js`:
  - `logEvent(eventName, params)` – custom events
  - `logPageView(path, title)` – page views (used by the tracker)

No extra env vars are needed; Analytics uses your existing Firebase project.

## 3. Logging custom events

Import and call `logEvent` from your Firebase module:

```javascript
import { logEvent } from '../firebase';  // adjust path as needed

// Example: when a user views a blog post
logEvent('blog_post_viewed', {
  post_id: id,
  post_title: post.title,
  category: post.category,
});

// Example: course enrollment
logEvent('course_enrolled', { course_id: courseId, course_name: course.title });

// Example: button click or CTA
logEvent('cta_clicked', { cta_name: 'hero_signup', page: 'home' });
```

Event names and parameters will show up in GA4 under **Reports → Engagement → Events** (and in DebugView if you use the GA4 debug mode).

## 4. Viewing data in GA4

- **Realtime**: GA4 → **Reports → Realtime**.
- **Events**: **Reports → Engagement → Events**.
- **Pages**: **Reports → Engagement → Pages and screens** (driven by `page_view` and your custom events).

For local testing, you can enable [GA4 DebugView](https://support.google.com/analytics/answer/7201382) so events appear in real time without waiting for standard reporting.

## 5. Optional: Standalone GA4 (gtag.js)

If you prefer the global site tag instead of (or in addition to) Firebase Analytics:

1. In GA4, go to **Admin → Data Streams** → your web stream → copy the **Measurement ID** (e.g. `G-XXXXXXXXXX`).
2. Add the gtag script in `public/index.html` (in `<head>`):

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

3. Put your Measurement ID in `.env` as `REACT_APP_GA_MEASUREMENT_ID` and use `%REACT_APP_GA_MEASUREMENT_ID%` in the script if you want to keep it out of the repo.

For this project, using **Firebase Analytics only** (as set up above) is enough; it feeds the same GA4 property once linked.
