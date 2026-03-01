# Translation Refactoring TODO

> Replace inline `isArabic ? 'Arabic' : 'English'` translations with `t('key')` from i18n files.

## ✅ Completed
- [x] `src/pages/CourseDetails.jsx` - Using `courseDetails.*` keys
- [x] `src/pages/Login.jsx` - Using `auth.*` keys
- [x] `src/pages/Register.jsx` - Using `auth.*` keys
- [x] `src/pages/Blog.jsx` - Using `blog.*` keys
- [x] `src/pages/BlogPost.jsx` - Using `blog.*` keys
- [x] `src/pages/Courses.jsx` - Using `courses.*` keys
- [x] `src/pages/Contact.jsx` - Using `contact.*` keys
- [x] `src/pages/About.jsx` - Using `about.*` keys
- [x] `src/pages/MyCourses.jsx` - Using `myCourses.*` keys
- [x] `src/pages/BlogEditor.jsx` - Using `blog.*` keys
- [x] `src/i18n/locales/en.json` - Added all translation keys
- [x] `src/i18n/locales/ar.json` - Added all translation keys

---

## 🔴 High Priority (User-Facing Pages) - ✅ ALL COMPLETED!

### Authentication
- [x] `src/pages/Login.jsx` → Use `auth.*` keys ✅
- [x] `src/pages/Register.jsx` → Use `auth.*` keys ✅

### Courses
- [x] `src/pages/Courses.jsx` → Use `courses.*` keys ✅
- [x] `src/pages/MyCourses.jsx` → Use `myCourses.*` keys ✅
- [ ] `src/pages/CourseContentView.jsx` → Use `courseContent.*` keys (if exists)

### Blog
- [x] `src/pages/Blog.jsx` → Use `blog.*` keys ✅
- [x] `src/pages/BlogPost.jsx` → Use `blog.*` keys ✅
- [x] `src/pages/BlogEditor.jsx` → Use `blog.*` keys ✅

### Other Pages
- [x] `src/pages/About.jsx` → Use `about.*` keys ✅
- [x] `src/pages/Contact.jsx` → Use `contact.*` keys ✅

---

## 🟡 Medium Priority (Components)

### Common Components
- [x] `src/components/common/Header.jsx` → Use `navigation.*`, `auth.*` keys ✅
- [x] `src/components/common/Footer.jsx` → Use `footer.*` keys ✅
- [x] `src/components/common/CourseCard.jsx` → Use `courses.*` keys ✅
- [ ] `src/components/common/EnrollmentForm.jsx` → Use `enrollment.*` keys (partial)
- [ ] `src/components/common/LanguageSwitcher.jsx` → Use `common.*` keys
- [ ] `src/components/common/CourseStatusBadge.jsx` → Use `courses.*` keys
- [ ] `src/components/common/ErrorBoundary.jsx` → Use `errors.*` keys

### Blog Components
- [x] `src/components/blog/BlogCard.jsx` → Use `blog.*` keys ✅
- [x] `src/components/blog/ShareButtons.jsx` → Use `blog.*` keys ✅
- [ ] `src/components/blog/CategoryFilter.jsx` → Use `blog.*` keys
- [ ] `src/components/blog/AuthorBio.jsx` → Use `blog.*` keys

### Homepage Components
- [ ] `src/components/homepage/HeroSection.jsx` → Use `homepage.hero.*` keys
- [ ] `src/components/homepage/FeaturesSection.jsx` → Use `homepage.features.*` keys
- [ ] `src/components/homepage/FeaturedCourses.jsx` → Use `homepage.courses.*` keys
- [ ] `src/components/homepage/SocialProof.jsx` → Use `homepage.stats.*` keys
- [ ] `src/components/homepage/QuickEnrollment.jsx` → Use `homepage.enrollment.*` keys

---

## 🟢 Low Priority (Dashboard/Admin)

### Instructor Dashboard
- [ ] `src/pages/InstructorDashboard.jsx` → Use `dashboard.*` keys
- [ ] `src/pages/CourseContentBuilder.jsx` → Use `courseContent.*` keys
- [ ] `src/components/instructor/DashboardHeader.jsx` → Use `dashboard.*` keys
- [ ] `src/components/instructor/DashboardStats.jsx` → Use `dashboard.*` keys
- [ ] `src/components/instructor/EnrollmentsTable.jsx` → Use `dashboard.*` keys
- [ ] `src/components/instructor/CoursesTable.jsx` → Use `dashboard.*` keys
- [ ] `src/components/instructor/QuickActions.jsx` → Use `dashboard.*` keys

### Other
- [ ] `src/components/ProtectedRoute.jsx` → Use `errors.*` keys

---

## 📝 Refactoring Pattern

### Before:
```jsx
const { i18n } = useTranslation();
const isArabic = i18n.language === 'ar';

// In JSX:
{isArabic ? 'العودة للمدونة' : 'Back to Blog'}
```

### After:
```jsx
const { t } = useTranslation();

// In JSX:
{t('blog.backToBlog')}
```

---

## 📊 Progress Tracker

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Pages | 11 | 11 | 0 |
| Common Components | 7 | 3 | 4 |
| Blog Components | 4 | 2 | 2 |
| Homepage Components | 5 | 0 | 5 |
| Dashboard Components | 8 | 0 | 8 |
| **Total** | **35** | **16** | **19** |

---

## 🎯 Translation Keys Reference

| Section | Usage |
|---------|-------|
| `auth.*` | Login, Register, password, email |
| `courses.*` | Course listings, filters, levels |
| `courseDetails.*` | Single course page |
| `myCourses.*` | Student's enrolled courses |
| `enrollment.*` | Enrollment form |
| `courseContent.*` | Lesson viewer, units |
| `blog.*` | Blog posts, sharing |
| `about.*` | About page |
| `contact.*` | Contact form |
| `dashboard.*` | Instructor dashboard |
| `privateLessons.*` | Private lessons tracker |
| `homepage.*` | Hero, features, stats |
| `navigation.*` | Menu items |
| `common.*` | Buttons, actions, messages |
| `errors.*` | Error messages |
| `footer.*` | Footer elements |

---

*Last updated: 2026-01-10*
