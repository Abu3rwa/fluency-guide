# Real Statistics Calculation Plan

## Overview

This plan outlines the implementation of real-time statistics calculation for the landing page, replacing static values with dynamic data calculated from actual application metrics.

## Current State Analysis

### Current Statistics Implementation

- ❌ Static/hardcoded values in landing page
- ❌ No real-time calculation
- ❌ No connection to actual application data

### Available Data Sources

Based on the codebase analysis, we have access to:

1. **Course Data** (`courseService.js`)

   - Total courses
   - Published courses
   - Course categories
   - Course levels

2. **Module Data** (`moduleService.js`)

   - Total modules per course
   - Module completion rates

3. **Lesson Data** (`lessonService.js`)

   - Total lessons
   - Lesson types (video, text, quiz)
   - Lesson completion rates

4. **Task Data** (`taskService.js`)

   - Total tasks
   - Task types (assignments, quizzes)
   - Task completion rates

5. **Student/Enrollment Data** (`enrollmentService.js`)

   - Total students
   - Active students
   - Student progress

6. **Payment Data** (`paymentService.js`)
   - Revenue metrics
   - Payment success rates

## Proposed Statistics Categories

### 1. Learning Content Statistics

```javascript
{
  "totalCourses": 25,
  "totalModules": 150,
  "totalLessons": 500,
  "totalTasks": 750,
  "totalQuizzes": 200,
  "totalVocabulary": 1500
}
```

### 2. Student Engagement Statistics

```javascript
{
  "totalStudents": 1200,
  "activeStudents": 850,
  "completedCourses": 45,
  "averageProgress": 78,
  "totalEnrollments": 1800
}
```

### 3. Learning Achievement Statistics

```javascript
{
  "totalQuizzesTaken": 3500,
  "averageQuizScore": 85,
  "vocabularyWordsLearned": 8500,
  "lessonsCompleted": 4200,
  "certificatesEarned": 120
}
```

### 4. Platform Performance Statistics

```javascript
{
  "totalStudyHours": 2500,
  "averageSessionTime": 45,
  "mobileUsage": 65,
  "satisfactionRate": 94
}
```

## Implementation Plan

### Phase 1: Data Collection Services

#### 1.1 Create Statistics Service

```javascript
// src/services/statisticsService.js
export const statisticsService = {
  // Learning Content Stats
  getLearningContentStats: async () => {
    // Calculate from courses, modules, lessons, tasks
  },

  // Student Engagement Stats
  getStudentEngagementStats: async () => {
    // Calculate from enrollments, student progress
  },

  // Achievement Stats
  getAchievementStats: async () => {
    // Calculate from quiz results, vocabulary progress
  },

  // Platform Performance Stats
  getPlatformPerformanceStats: async () => {
    // Calculate from usage analytics
  },
};
```

#### 1.2 Database Queries for Statistics

**Courses Statistics:**

```sql
-- Total courses
SELECT COUNT(*) as totalCourses FROM courses WHERE status = 'published';

-- Courses by category
SELECT category, COUNT(*) as count
FROM courses
WHERE status = 'published'
GROUP BY category;

-- Courses by level
SELECT level, COUNT(*) as count
FROM courses
WHERE status = 'published'
GROUP BY level;
```

**Modules Statistics:**

```sql
-- Total modules
SELECT COUNT(*) as totalModules FROM modules;

-- Modules per course
SELECT course_id, COUNT(*) as moduleCount
FROM modules
GROUP BY course_id;
```

**Lessons Statistics:**

```sql
-- Total lessons
SELECT COUNT(*) as totalLessons FROM lessons;

-- Lessons by type
SELECT type, COUNT(*) as count
FROM lessons
GROUP BY type;

-- Lessons per module
SELECT module_id, COUNT(*) as lessonCount
FROM lessons
GROUP BY module_id;
```

**Tasks Statistics:**

```sql
-- Total tasks
SELECT COUNT(*) as totalTasks FROM tasks;

-- Tasks by type
SELECT type, COUNT(*) as count
FROM tasks
GROUP BY type;

-- Quiz statistics
SELECT COUNT(*) as totalQuizzes FROM tasks WHERE type = 'quiz';
```

**Student Statistics:**

```sql
-- Total students
SELECT COUNT(DISTINCT user_id) as totalStudents FROM enrollments;

-- Active students (enrolled in last 30 days)
SELECT COUNT(DISTINCT user_id) as activeStudents
FROM enrollments
WHERE created_at >= NOW() - INTERVAL 30 DAY;

-- Student progress
SELECT
  user_id,
  AVG(progress_percentage) as averageProgress
FROM enrollments
GROUP BY user_id;
```

**Enrollment Statistics:**

```sql
-- Total enrollments
SELECT COUNT(*) as totalEnrollments FROM enrollments;

-- Enrollments by course
SELECT course_id, COUNT(*) as enrollmentCount
FROM enrollments
GROUP BY course_id;
```

### Phase 2: Real-time Calculation Engine

#### 2.1 Statistics Calculation Functions

```javascript
// Calculate learning content statistics
const calculateLearningContentStats = async () => {
  const [courses, modules, lessons, tasks] = await Promise.all([
    courseService.getAllCourses(),
    moduleService.getAllModules(),
    lessonService.getAllLessons(),
    taskService.getAllTasks(),
  ]);

  return {
    totalCourses: courses.filter((c) => c.status === "published").length,
    totalModules: modules.length,
    totalLessons: lessons.length,
    totalTasks: tasks.length,
    totalQuizzes: tasks.filter((t) => t.type === "quiz").length,
    totalVocabulary: calculateVocabularyCount(lessons),
  };
};

// Calculate student engagement statistics
const calculateStudentEngagementStats = async () => {
  const [enrollments, students] = await Promise.all([
    enrollmentService.getAllEnrollments(),
    userService.getAllStudents(),
  ]);

  const activeStudents = enrollments.filter(
    (e) =>
      new Date(e.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  return {
    totalStudents: students.length,
    activeStudents: activeStudents.length,
    totalEnrollments: enrollments.length,
    averageProgress: calculateAverageProgress(enrollments),
  };
};
```

#### 2.2 Caching Strategy

```javascript
// Cache statistics for performance
const STATISTICS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class StatisticsCache {
  constructor() {
    this.cache = new Map();
    this.cacheTimestamps = new Map();
  }

  async get(key, calculationFunction) {
    const now = Date.now();
    const cached = this.cache.get(key);
    const timestamp = this.cacheTimestamps.get(key);

    if (cached && timestamp && now - timestamp < STATISTICS_CACHE_DURATION) {
      return cached;
    }

    const freshData = await calculationFunction();
    this.cache.set(key, freshData);
    this.cacheTimestamps.set(key, now);
    return freshData;
  }

  invalidate(key) {
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
  }
}
```

### Phase 3: Integration with Landing Page

#### 3.1 Update LandingPageContext

```javascript
// Add statistics state and methods
const [realStatistics, setRealStatistics] = useState({
  learningContent: {},
  studentEngagement: {},
  achievements: {},
  platformPerformance: {},
});

const calculateRealStatistics = useCallback(async () => {
  try {
    const [
      learningContent,
      studentEngagement,
      achievements,
      platformPerformance,
    ] = await Promise.all([
      statisticsService.getLearningContentStats(),
      statisticsService.getStudentEngagementStats(),
      statisticsService.getAchievementStats(),
      statisticsService.getPlatformPerformanceStats(),
    ]);

    setRealStatistics({
      learningContent,
      studentEngagement,
      achievements,
      platformPerformance,
    });
  } catch (error) {
    console.error("Error calculating real statistics:", error);
  }
}, []);
```

#### 3.2 Update Statistics Panel

```javascript
// src/screens/settings/panels/StatisticsPanel.jsx
const StatisticsPanel = () => {
  const { realStatistics, calculateRealStatistics } = useLandingPage();
  const [isCalculating, setIsCalculating] = useState(false);

  const handleRefreshStatistics = async () => {
    setIsCalculating(true);
    await calculateRealStatistics();
    setIsCalculating(false);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6">Real-time Statistics</Typography>
        <Button
          onClick={handleRefreshStatistics}
          disabled={isCalculating}
          startIcon={
            isCalculating ? <CircularProgress size={20} /> : <RefreshIcon />
          }
        >
          Refresh Statistics
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Learning Content Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Learning Content
              </Typography>
              <StatisticsItem
                label="Total Courses"
                value={realStatistics.learningContent.totalCourses}
              />
              <StatisticsItem
                label="Total Modules"
                value={realStatistics.learningContent.totalModules}
              />
              <StatisticsItem
                label="Total Lessons"
                value={realStatistics.learningContent.totalLessons}
              />
              <StatisticsItem
                label="Total Tasks"
                value={realStatistics.learningContent.totalTasks}
              />
              <StatisticsItem
                label="Total Quizzes"
                value={realStatistics.learningContent.totalQuizzes}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Student Engagement Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Student Engagement
              </Typography>
              <StatisticsItem
                label="Total Students"
                value={realStatistics.studentEngagement.totalStudents}
              />
              <StatisticsItem
                label="Active Students"
                value={realStatistics.studentEngagement.activeStudents}
              />
              <StatisticsItem
                label="Total Enrollments"
                value={realStatistics.studentEngagement.totalEnrollments}
              />
              <StatisticsItem
                label="Average Progress"
                value={`${realStatistics.studentEngagement.averageProgress}%`}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
```

### Phase 4: Advanced Analytics

#### 4.1 Quiz Performance Analytics

```javascript
const calculateQuizStatistics = async () => {
  const quizzes = await taskService.getQuizzes();
  const quizResults = await taskService.getQuizResults();

  const quizStats = quizzes.map((quiz) => {
    const results = quizResults.filter((r) => r.quizId === quiz.id);
    const averageScore =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.score, 0) / results.length
        : 0;

    return {
      quizId: quiz.id,
      totalAttempts: results.length,
      averageScore,
      completionRate: (results.length / quiz.totalStudents) * 100,
    };
  });

  return {
    totalQuizzes: quizzes.length,
    totalQuizAttempts: quizResults.length,
    averageQuizScore:
      quizStats.reduce((sum, s) => sum + s.averageScore, 0) / quizStats.length,
    averageCompletionRate:
      quizStats.reduce((sum, s) => sum + s.completionRate, 0) /
      quizStats.length,
  };
};
```

#### 4.2 Vocabulary Learning Analytics

```javascript
const calculateVocabularyStatistics = async () => {
  const vocabularyLessons = await lessonService.getVocabularyLessons();
  const vocabularyProgress = await studentService.getVocabularyProgress();

  const vocabularyStats = vocabularyLessons.map((lesson) => {
    const progress = vocabularyProgress.filter((p) => p.lessonId === lesson.id);
    const masteredWords = progress.filter((p) => p.masteryLevel >= 0.8).length;
    const totalWords = lesson.vocabularyWords.length;

    return {
      lessonId: lesson.id,
      totalWords,
      masteredWords,
      masteryRate: (masteredWords / totalWords) * 100,
    };
  });

  return {
    totalVocabularyWords: vocabularyStats.reduce(
      (sum, s) => sum + s.totalWords,
      0
    ),
    masteredWords: vocabularyStats.reduce((sum, s) => sum + s.masteredWords, 0),
    averageMasteryRate:
      vocabularyStats.reduce((sum, s) => sum + s.masteryRate, 0) /
      vocabularyStats.length,
  };
};
```

#### 4.3 Student Progress Analytics

```javascript
const calculateStudentProgressStatistics = async () => {
  const enrollments = await enrollmentService.getAllEnrollments();
  const studentProgress = await studentService.getAllStudentProgress();

  const progressStats = enrollments.map((enrollment) => {
    const progress = studentProgress.find(
      (p) => p.enrollmentId === enrollment.id
    );
    const completedLessons = progress?.completedLessons || 0;
    const totalLessons = progress?.totalLessons || 1;

    return {
      enrollmentId: enrollment.id,
      progressPercentage: (completedLessons / totalLessons) * 100,
      completedLessons,
      totalLessons,
    };
  });

  return {
    averageProgress:
      progressStats.reduce((sum, p) => sum + p.progressPercentage, 0) /
      progressStats.length,
    totalCompletedLessons: progressStats.reduce(
      (sum, p) => sum + p.completedLessons,
      0
    ),
    totalLessons: progressStats.reduce((sum, p) => sum + p.totalLessons, 0),
  };
};
```

## Additional Statistics Ideas

### 5. Learning Analytics

- **Study Time Tracking**: Total hours spent learning
- **Session Analytics**: Average session duration, peak usage times
- **Device Usage**: Mobile vs desktop usage statistics
- **Language Preferences**: Most popular languages/courses

### 6. Achievement Analytics

- **Certificates Earned**: Total certificates issued
- **Streak Statistics**: Longest learning streaks
- **Milestone Achievements**: Course completion milestones
- **Skill Progression**: Skill level improvements

### 7. Engagement Analytics

- **Retention Rates**: Student retention over time
- **Engagement Scores**: Based on activity frequency
- **Social Features**: Discussion participation, peer interactions
- **Content Preferences**: Most popular lesson types

### 8. Business Analytics

- **Revenue Metrics**: Monthly recurring revenue, average revenue per user
- **Conversion Rates**: Free to paid conversion
- **Customer Satisfaction**: Ratings and reviews
- **Growth Metrics**: Month-over-month growth rates

## Implementation Timeline

### Week 1: Foundation

- [ ] Create `statisticsService.js`
- [ ] Implement basic data collection functions
- [ ] Set up caching mechanism
- [ ] Create database queries for core statistics

### Week 2: Core Statistics

- [ ] Implement learning content statistics
- [ ] Implement student engagement statistics
- [ ] Update `LandingPageContext` with real statistics
- [ ] Update `StatisticsPanel` to display real data

### Week 3: Advanced Analytics

- [ ] Implement quiz performance analytics
- [ ] Implement vocabulary learning analytics
- [ ] Implement student progress analytics
- [ ] Add achievement tracking

### Week 4: Integration & Testing

- [ ] Integrate with landing page display
- [ ] Add real-time updates
- [ ] Performance optimization
- [ ] Testing and bug fixes

## File Structure Changes

### New Files

```
src/
├── services/
│   └── statisticsService.js
├── utils/
│   └── statisticsCalculator.js
└── components/
    └── statistics/
        ├── StatisticsItem.jsx
        ├── StatisticsCard.jsx
        └── StatisticsChart.jsx
```

### Modified Files

```
src/
├── contexts/
│   └── LandingPageContext.jsx
├── screens/
│   └── settings/
│       └── panels/
│           └── StatisticsPanel.jsx
└── services/
    ├── courseService.js
    ├── moduleService.js
    ├── lessonService.js
    ├── taskService.js
    ├── enrollmentService.js
    └── userService.js
```

## Success Criteria

### Functional Requirements

- ✅ Real-time statistics calculation from actual data
- ✅ Automatic updates when data changes
- ✅ Performance optimized with caching
- ✅ Comprehensive analytics across all data types

### Non-Functional Requirements

- ✅ Statistics calculation < 2 seconds
- ✅ Cache invalidation on data changes
- ✅ Error handling for missing data
- ✅ Responsive design for statistics display

## Next Steps

1. **Review and approve this plan**
2. **Start with Phase 1 (Data Collection Services)**
3. **Implement core statistics calculation**
4. **Integrate with existing landing page**
5. **Add advanced analytics features**
