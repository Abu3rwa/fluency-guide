# Sudanglish Production Readiness Remediation Prompts
Date: March 1, 2026

This file contains execution-ready prompts to finish incomplete features and remove production-blocking security risks.
Run prompts in order: `P0` -> `P1` -> `P2`.

---

## P0 - Critical Security Blockers (must complete before launch)

### P0.1 - Rebuild Firestore Security Rules with Least Privilege
Use this prompt:

```text
Harden Firestore rules for production with strict role-based access, field validation, and ownership checks.

Context:
- Current rules are too permissive in key collections:
  - blog_posts public read (firestore.rules:13-15)
  - aboutSections writable by any authenticated user (firestore.rules:56-58)
  - enrollments readable/updatable/deletable by any authenticated user (firestore.rules:63-67)
  - payments readable and writable by any authenticated user (firestore.rules:110-113)
  - users self-update currently allows privilege fields (firestore.rules:142+)
- Admin auth is based on users/{uid}.isAdmin and can be abused if self-updates are not restricted.

Files:
- firestore.rules
- firestore.indexes.json

Implement:
1) Add helper functions: isSignedIn, currentUserDoc, isAdmin, isInstructor, isSelf(userId), isCourseOwner(courseId), isEnrolled(courseId), hasOnlyAllowedKeys.
2) Restrict users/{userId} updates:
   - self can update only safe profile fields (name, phoneNumber, avatar, locale, updatedAt).
   - self cannot write role, isAdmin, uid, email verification flags.
   - only admin can update role/isAdmin.
3) Restrict enrollments:
   - create: authenticated user can create only if request.resource.data.userId == request.auth.uid OR admin/instructor function path.
   - read: student reads only own enrollments; instructor reads only enrollments for courses they own; admin reads all.
   - update: only instructor-owner/admin can update status/payment fields.
   - delete: admin only (or deny and use soft-delete).
4) Restrict payments:
   - create/update/delete: admin or owning instructor only.
   - read: admin, owning instructor, and the specific student only (if needed for student receipts).
5) Restrict blog_posts:
   - public read only published posts.
   - drafts readable only by admins/editors.
   - writes by admin/editor only.
6) Restrict course units/lessons reads:
   - allow only course instructor, enrolled confirmed student, or admin.
7) Add basic schema validation in rules for critical collections (required keys, type checks, min/max lengths).
8) Keep deny-all fallback as final rule.

Acceptance:
- Anonymous or unrelated authenticated users cannot read other students' enrollments/payments.
- Students cannot modify role/isAdmin in their user profile.
- Draft blog posts are not readable publicly.
- Authenticated but non-enrolled students cannot read units/lessons of courses they are not enrolled in.
```

---

### P0.2 - Fix Storage Rules Privilege Bypass
Use this prompt:

```text
Fix Firebase Storage rules to remove path bypass and enforce strict upload authorization.

Context:
- Current catch-all rule allows any authenticated write and overrides restricted paths (storage.rules:13-15).
- blog-images admin-only restriction is ineffective due to broad match.

Files:
- storage.rules

Implement:
1) Remove broad `match /{allPaths=**}` write permission.
2) Define explicit paths:
   - /blog-images/{imageId}: admin/editor write only.
   - /course-thumbnails/{imageId}: instructor owner/admin write.
   - /profile-images/{uid}/{imageId}: only that user or admin write.
   - /assignment-submissions/{courseId}/{uid}/{fileId}: only enrolled student for that course; instructor/admin read.
3) Add content constraints:
   - allow writes only for image MIME types where applicable.
   - max file size check (example <= 5 MB for images).
4) Keep read permissions explicit per path, not global true for all.

Acceptance:
- Authenticated non-admin cannot upload to /blog-images.
- Unauthorized writes to unknown paths are denied.
- Image uploads with invalid MIME or oversized files are denied.
```

---

### P0.3 - Move Privileged Mutations to Cloud Functions
Use this prompt:

```text
Introduce Firebase Cloud Functions for privileged operations and remove direct client writes for sensitive actions.

Context:
- Sensitive actions are currently done from client code:
  - user role updates in admin page (src/pages/admin/UserManagement.jsx:168)
  - enrollment status + payment creation (src/pages/InstructorDashboard.jsx:360+)
  - potential user deletion placeholder not implemented (src/pages/admin/UserManagement.jsx:505)

Files:
- create functions project (functions/)
- src/pages/admin/UserManagement.jsx
- src/pages/InstructorDashboard.jsx
- Firestore rules to permit only function service account where applicable

Implement callable functions:
1) adminUpdateUserRole({ targetUid, role }) with admin claim check and audit log.
2) adminDeleteUser({ targetUid, strategy }) to handle auth deletion + data anonymization/cascade.
3) instructorUpdateEnrollmentStatus({ enrollmentId, status, paymentAmount }) with ownership checks and transaction-safe payment write.
4) optional: instructorRestartCourseRound, instructorDeleteCourseCascade.
5) Enforce App Check and auth in all functions.

Acceptance:
- Client cannot directly change privileged fields/documents.
- All privileged mutations are validated server-side and audited.
- Admin delete action is fully implemented and removes placeholder path.
```

---

### P0.4 - Eliminate Blog XSS Risk
Use this prompt:

```text
Sanitize rich text blog content on write and render to prevent stored XSS.

Context:
- Blog post content is rendered with dangerouslySetInnerHTML (src/pages/BlogPost.jsx:399).
- Content is authored via ReactQuill without sanitization.

Files:
- src/pages/BlogEditor.jsx
- src/pages/BlogPost.jsx
- package.json (add sanitization dependency, e.g. DOMPurify + isomorphic support)

Implement:
1) Sanitize HTML before saving post content.
2) Sanitize again before rendering (defense in depth).
3) Forbid script/style/iframe/event-handler attributes and javascript: URLs.
4) Add link rel protections for external links where relevant.
5) Add tests for malicious payloads (script tags, onerror, javascript URLs).

Acceptance:
- Injected script payloads render as inert text or removed markup.
- Published content still preserves allowed formatting (headers, lists, links, bold/italic).
```

---

### P0.5 - Enforce Enrollment Authorization Before Course Content Access
Use this prompt:

```text
Require confirmed enrollment (or instructor/admin ownership) before allowing access to course content view and API reads.

Context:
- Course content route is protected by auth only, not enrollment:
  - route exists at src/App.jsx:99
  - CourseContentView fetches units directly with no enrollment check (src/pages/CourseContentView.jsx).
- This can expose paid/private content to any logged-in user.

Files:
- src/pages/CourseContentView.jsx
- firestore.rules
- src/App.jsx (if role guards need tightening)

Implement:
1) In CourseContentView, verify user access first:
   - admin -> allow
   - instructor owner -> allow
   - student must have enrollment status confirmed/active for courseId.
2) If unauthorized, show blocked state and navigate to course details.
3) Mirror the same rule in Firestore security rules for units/lessons and related resources.
4) Query by userId, not email.

Acceptance:
- Logged-in student without enrollment cannot open /student/course/:courseId.
- Confirmed student can access content normally.
- Instructor owner can preview own course content.
```

---

### P0.6 - Block Client-Side Privilege Escalation in Profile Updates
Use this prompt:

```text
Refactor profile update flow so users can only update safe profile fields and cannot escalate privileges.

Context:
- updateUserProfile merges arbitrary updates from client (src/store/slices/authSlice.js:40).
- Combined with permissive user update rules, this allows privilege escalation risk.

Files:
- src/store/slices/authSlice.js
- firestore.rules
- any profile edit UI files that call updateUserProfile

Implement:
1) Add a strict allowlist for client profile updates (name, phoneNumber, avatar, locale).
2) Reject or strip role/isAdmin/uid/email writes client-side.
3) Enforce the same deny rules in Firestore.
4) Add regression tests to prove role/isAdmin cannot be changed by self.

Acceptance:
- Calls attempting to set isAdmin/role from client fail.
- Normal profile updates still work.
```

---

### P0.7 - Fix Payment Identity and PII Access
Use this prompt:

```text
Correct payment student identity mapping and lock down PII read access.

Context:
- Payment record uses enrollment doc id as studentId (src/pages/InstructorDashboard.jsx:362), which is incorrect.
- payments/enrollments are currently broad-read in rules.

Files:
- src/pages/InstructorDashboard.jsx
- firestore.rules
- migration script if existing data must be corrected

Implement:
1) Use selectedEnrollment.userId as payment studentId.
2) Store immutable references: enrollmentId, courseId, instructorId, studentId.
3) Add server timestamp fields consistently.
4) Restrict reads to necessary actors only (student own, instructor own, admin).
5) Backfill existing wrong payment documents where studentId equals enrollmentId.

Acceptance:
- Payment studentId always equals Firebase Auth uid for student.
- Unauthorized users cannot read payment or enrollment PII.
```

---

## P1 - Incomplete Features and Production Flow Gaps

### P1.1 - Fix Broken Course Navigation Route
Use this prompt:

```text
Fix incorrect navigation path after enrollment confirmation.

Context:
- Existing student course content route: src/App.jsx:99 -> /student/course/:courseId
- CourseDetails navigates to non-existent route: /courses/${courseId}/content (src/pages/CourseDetails.jsx:450)

Files:
- src/pages/CourseDetails.jsx
- optional: src/App.jsx (add redirect alias if backward compatibility needed)

Implement:
1) Replace navigation target with /student/course/${courseId}.
2) Optionally add route alias /courses/:courseId/content -> redirect to /student/course/:courseId for legacy links.
3) Add test for confirmed enrollment "Go to course" button.

Acceptance:
- Confirmed students can open course content from CourseDetails without 404.
```

---

### P1.2 - Normalize Enrollment Identity (uid-first)
Use this prompt:

```text
Standardize enrollment queries and schema around userId instead of email to avoid mismatch and privacy bugs.

Context:
- MyCourses and CourseCard query enrollments by email:
  - src/pages/MyCourses.jsx:53
  - src/components/common/CourseCard.jsx:39
- CourseDetails checks by userId (src/pages/CourseDetails.jsx:93), causing inconsistent behavior.
- EnrollmentForm currently does not require/store authenticated userId for logged-in users.

Files:
- src/components/common/EnrollmentForm.jsx
- src/pages/MyCourses.jsx
- src/components/common/CourseCard.jsx
- src/pages/CourseDetails.jsx
- firestore.rules
- migration script for historical docs

Implement:
1) Ensure enrollment documents always include userId when user is authenticated.
2) Update all enrollment status checks/queries to use userId.
3) Keep email as optional contact field only.
4) Backfill old enrollment docs by matching email -> uid where possible.
5) Add uniqueness guard: one active enrollment per (userId, courseId, roundId).

Acceptance:
- Enrollment status is consistent across CourseCard, CourseDetails, MyCourses.
- No query depends on email for identity.
```

---

### P1.3 - Implement Real User Deletion Workflow
Use this prompt:

```text
Implement admin user deletion end-to-end and remove placeholder from UI.

Context:
- Delete action is a placeholder (src/pages/admin/UserManagement.jsx:505).

Files:
- src/pages/admin/UserManagement.jsx
- functions/src/* (adminDeleteUser callable function)
- firestore.rules

Implement:
1) Add delete button with confirmation modal, irreversible warning, and reason capture.
2) Call secure function that:
   - verifies admin caller,
   - deletes Firebase Auth account,
   - anonymizes or deletes related Firestore data safely,
   - writes audit log.
3) Update UI table after deletion.
4) Block deleting own currently logged-in admin account unless super-admin flow exists.

Acceptance:
- Admin can delete users safely.
- No orphaned auth/document references remain.
```

---

### P1.4 - Implement Observability and Error Tracking
Use this prompt:

```text
Add production-grade error monitoring and remove TODO placeholder.

Context:
- ErrorBoundary still has TODO for tracking integration (src/components/common/ErrorBoundary.jsx:30).
- Many pages use console.error with no reporting pipeline.

Files:
- src/components/common/ErrorBoundary.jsx
- app bootstrap file(s)
- logging utility module

Implement:
1) Integrate Sentry (or equivalent) with environment-based DSN.
2) Send caught errors with route/user context and release tag.
3) Replace noisy console logs in production paths with structured logger.
4) Add global unhandled rejection and window error handlers.

Acceptance:
- Runtime errors are visible in monitoring dashboard with actionable metadata.
- Production build has no sensitive debug logs.
```

---

### P1.5 - Fix Attendance Technical Debt and Indexing
Use this prompt:

```text
Stabilize attendance flows, remove redundant fetches, and add missing indexes.

Context:
- attendance slice has TODO for composite index (src/store/slices/attendanceSlice.js:153).
- LessonAttendance redundantly dispatches fetchCourseContent and includes heavy debug logs.

Files:
- src/store/slices/attendanceSlice.js
- src/pages/instructor/LessonAttendance.jsx
- firestore.indexes.json

Implement:
1) Add required composite indexes and re-enable efficient orderBy queries.
2) Remove duplicate course-content fetch in LessonAttendance.
3) Remove verbose debug logs and replace with user-safe error feedback.
4) Ensure attendance writes are idempotent and race-safe.

Acceptance:
- Attendance pages load without index errors.
- No duplicate reads for same lesson load.
```

---

### P1.6 - Add Safe External Link Handling
Use this prompt:

```text
Harden external URL handling in course content and quick actions.

Context:
- External links open directly via window.open in several places:
  - src/pages/CourseContentView.jsx:230, :287
  - src/components/instructor/QuickActions.jsx:125

Files:
- src/pages/CourseContentView.jsx
- src/components/instructor/QuickActions.jsx
- shared URL utility module

Implement:
1) Validate URLs with allowlist protocols (https only).
2) Normalize WhatsApp numbers and encode messages safely.
3) For invalid URLs, show user-facing error and do not open.
4) Add noopener/noreferrer where applicable.

Acceptance:
- Unsafe or malformed links are blocked.
- Valid links still open correctly.
```

---

### P1.7 - Implement Course Lifecycle Cleanup
Use this prompt:

```text
Add safe course delete/restart lifecycle with dependent data handling.

Context:
- deleteCourse currently removes only the course document, not subcollections/dependent data.
- restart/create round logic is split and can drift without transaction boundaries.

Files:
- src/store/slices/courseSlice.js
- functions/src/* (course delete/restart callable)
- firestore.rules

Implement:
1) Replace client-side direct delete with callable function:
   - soft-delete course (status=archived, isDeleted=true),
   - archive or delete units/lessons, enrollments, attendance, rounds with audit log.
2) Make restart round transactional and consistent for counts/status.
3) Prevent deleting active course with enrolled students unless explicit force + confirmation.

Acceptance:
- No orphaned round/unit/attendance documents after delete.
- Restarted rounds have consistent counters and timestamps.
```

---

## P2 - Production Quality, Testing, and Ops

### P2.1 - Add Minimum Required Test Suite and CI Gates
Use this prompt:

```text
Build a production baseline test suite and CI quality gate.

Context:
- No meaningful test coverage exists for critical auth/enrollment/authorization flows.

Files:
- add tests under src/**/__tests__ or *.test.jsx
- add emulator rule tests for firestore/storage
- CI config (GitHub Actions or existing CI)

Implement:
1) Unit tests:
   - auth slice reducers/thunks,
   - enrollment and attendance reducers.
2) Integration tests:
   - register -> enrollment -> my-courses flow,
   - unauthorized user blocked from course content,
   - admin role update via function.
3) Rule tests:
   - users cannot self-elevate,
   - unauthorized read/write denied for enrollments/payments/storage.
4) CI gates:
   - run tests,
   - lint/type check,
   - fail on test or rule regression.

Acceptance:
- CI blocks merges on failing tests/rules.
- Critical security flows are covered with automated tests.
```

---

### P2.2 - Dependency and Build Hygiene
Use this prompt:

```text
Clean dependency graph and remove risky/unused packages.

Context:
- package.json includes suspicious/unused runtime dependencies (e.g., uninstall).
- Browserslist warning indicates stale caniuse-lite data from build output.

Files:
- package.json
- package-lock.json

Implement:
1) Remove unused dependencies from runtime bundle.
2) Move build-only dependencies to devDependencies where appropriate.
3) Run dependency audit and patch high/critical vulnerabilities.
4) Update browserslist database as part of maintenance.

Acceptance:
- Dependency tree is minimal and justified.
- No known high/critical vulnerabilities remain untracked.
```

---

### P2.3 - Deployment Header Hardening and App Check
Use this prompt:

```text
Add baseline hosting security headers and enforce Firebase App Check in production.

Context:
- firebase.json currently defines cache headers but no CSP/security headers.

Files:
- firebase.json
- app bootstrap for App Check initialization

Implement:
1) Add strict headers for hosting:
   - Content-Security-Policy
   - X-Content-Type-Options
   - Referrer-Policy
   - X-Frame-Options
   - Permissions-Policy
2) Initialize and enforce Firebase App Check for Firestore/Storage/Functions.
3) Verify third-party assets are compatible with CSP policy.

Acceptance:
- Security headers present in production responses.
- Requests without valid App Check token are rejected in production.
```

---

## Quick Evidence Map (review sources)

- `firestore.rules:13-15, 56-58, 63-67, 110-113, 142+`
- `storage.rules:6-15`
- `src/App.jsx:99, 117`
- `src/pages/CourseDetails.jsx:450`
- `src/pages/MyCourses.jsx:53`
- `src/components/common/CourseCard.jsx:39`
- `src/pages/BlogPost.jsx:399`
- `src/store/slices/authSlice.js:40`
- `src/pages/InstructorDashboard.jsx:362`
- `src/components/common/ErrorBoundary.jsx:30`
- `src/pages/admin/UserManagement.jsx:505`
- `src/store/slices/attendanceSlice.js:153`

---

## Execution Order (strict)

1) `P0.1` -> `P0.7`
2) `P1.1` -> `P1.7`
3) `P2.1` -> `P2.3`

Do not release to production until all `P0` items are complete and validated in emulators/staging.
