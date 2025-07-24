// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'EFG';

  @override
  String get selectLanguage => 'Select Language';

  @override
  String get todaysProgress => 'Today\'s Progress';

  @override
  String dayStreak(int days) {
    return '$days Day Streak!';
  }

  @override
  String get dayStreakLabel => 'Day Streak';

  @override
  String progressCompleted(int percent) {
    return '$percent% of daily goal completed';
  }

  @override
  String minutesCompleted(int completed, int total) {
    return '$completed/$total minutes';
  }

  @override
  String get minutesToday => 'Minutes Today';

  @override
  String get achievements => 'Achievements';

  @override
  String get xpPoints => 'XP Points';

  @override
  String get practiceNow => 'Practice Now';

  @override
  String get continueLesson => 'Continue Lesson';

  @override
  String get dailyQuiz => 'Daily Quiz';

  @override
  String get testKnowledge => 'Test your knowledge';

  @override
  String get recentAchievements => 'Recent Achievements';

  @override
  String get viewAll => 'View All';

  @override
  String get learningPath => 'Learning Path';

  @override
  String get seeAll => 'See All';

  @override
  String get welcome => 'Welcome';

  @override
  String get signIn => 'Sign In';

  @override
  String get signUp => 'Sign Up';

  @override
  String get email => 'Email';

  @override
  String get password => 'Password';

  @override
  String get forgotPassword => 'Forgot Password?';

  @override
  String get courses => 'Courses';

  @override
  String get enrollNow => 'Enroll Now';

  @override
  String get enrollmentPending => 'Enrollment Pending';

  @override
  String get startLearning => 'Start Learning';

  @override
  String get reapply => 'Reapply';

  @override
  String get alreadyEnrolled => 'You are already enrolled in this course';

  @override
  String get enrollmentPendingMessage =>
      'Your enrollment request is pending approval';

  @override
  String get enrollmentSuccess => 'Enrollment request sent successfully';

  @override
  String get enrollmentFailed => 'Failed to send enrollment request';

  @override
  String get signInRequired => 'Please sign in to enroll in courses';

  @override
  String get errorOccurred => 'An error occurred while processing your request';

  @override
  String get profile => 'Profile';

  @override
  String get settings => 'Settings';

  @override
  String get language => 'Language';

  @override
  String get theme => 'Theme';

  @override
  String get darkMode => 'Dark Mode';

  @override
  String get lightMode => 'Light Mode';

  @override
  String get overview => 'Overview';

  @override
  String get modules => 'Modules';

  @override
  String get students => 'Students';

  @override
  String get totalStudents => 'Total Students';

  @override
  String get completionRate => 'Completion Rate';

  @override
  String get averageScore => 'Average Score';

  @override
  String get totalTimeSpent => 'Total Time Spent';

  @override
  String get noModulesAvailable => 'No modules available for this course';

  @override
  String get refresh => 'Refresh';

  @override
  String get errorLoadingModules => 'Error loading modules';

  @override
  String get lessonDetails => 'Lesson Details';

  @override
  String get content => 'Content';

  @override
  String get learningObjectives => 'Learning Objectives';

  @override
  String get skillsYoullLearn => 'Skills You\'ll Learn';

  @override
  String get resources => 'Resources';

  @override
  String get assessment => 'Assessment';

  @override
  String get startAssessment => 'Start Assessment';

  @override
  String get quiz => 'Quiz';

  @override
  String get startQuiz => 'Start Quiz';

  @override
  String get lessonInformation => 'Lesson Information';

  @override
  String get tasks => 'Tasks';

  @override
  String get noTasksAvailable => 'No tasks available for this lesson';

  @override
  String get achievementDayStreak => '7 Day Streak';

  @override
  String get achievementSpeedLearner => 'Speed Learner';

  @override
  String get achievementPerfectScore => 'Perfect Score';

  @override
  String get courseBasicGrammar => 'Basic Grammar';

  @override
  String get courseVocabulary => 'Vocabulary';

  @override
  String get coursePronunciation => 'Pronunciation';

  @override
  String get courseListening => 'Listening';

  @override
  String get courseSpeaking => 'Speaking';

  @override
  String get courseConversation => 'Conversation';

  @override
  String get analytics => 'Analytics';

  @override
  String get retry => 'Retry';

  @override
  String get pleaseSignIn => 'Please sign in to view your profile';

  @override
  String get enrollmentPendingApproval =>
      'Your enrollment request is pending approval';

  @override
  String get enrollmentRequestSent => 'Enrollment request sent successfully';

  @override
  String get enrollmentRequestFailed => 'Failed to send enrollment request';

  @override
  String get searchCourses => 'Search courses...';

  @override
  String get filterCourses => 'Filter Courses';

  @override
  String get difficultyLevel => 'Difficulty Level';

  @override
  String get duration => 'Duration';

  @override
  String get price => 'Price';

  @override
  String get reset => 'Reset';

  @override
  String get apply => 'Apply';

  @override
  String get noCoursesAvailable => 'No courses available';

  @override
  String noCoursesInCategory(String category) {
    return 'No courses in $category category';
  }

  @override
  String get checkBackLater => 'Check back later for new courses';

  @override
  String get continueProgress => 'Continue Your Progress';

  @override
  String get resumeLastLesson => 'Resume your last lesson';

  @override
  String get beginJourney => 'Begin your language learning journey';

  @override
  String get browseCourses => 'Browse Courses';

  @override
  String get enrolled => 'Enrolled';

  @override
  String minutes(int minutes) {
    return '$minutes minutes';
  }

  @override
  String get featured => 'Featured';

  @override
  String get lessons => 'lessons';

  @override
  String get shortDuration => 'Short (< 1 hour)';

  @override
  String get mediumDuration => 'Medium (1-3 hours)';

  @override
  String get longDuration => 'Long (> 3 hours)';

  @override
  String get free => 'Free';

  @override
  String get paid => 'Paid';

  @override
  String get beginner => 'Beginner';

  @override
  String get intermediate => 'Intermediate';

  @override
  String get advanced => 'Advanced';

  @override
  String get business => 'Business';

  @override
  String get conversational => 'Conversational';

  @override
  String get grammar => 'Grammar';

  @override
  String get vocabulary => 'Vocabulary';

  @override
  String get settingsDataNotAvailable => 'Settings data not available';

  @override
  String get profileAndAccount => 'PROFILE & ACCOUNT';

  @override
  String get guestUser => 'Guest User';

  @override
  String get noEmail => 'No Email';

  @override
  String get fluencyLevel => 'Fluency Level';

  @override
  String get progressSync => 'Progress Sync';

  @override
  String get signOut => 'Sign Out';

  @override
  String get deleteAccount => 'Delete Account';

  @override
  String get exportData => 'Export Data';

  @override
  String get learningPreferences => 'Learning Preferences';

  @override
  String get dailyStudyGoal => 'Daily Study Goal';

  @override
  String get learningFocusAreas => 'Learning Focus Areas';

  @override
  String get noneSelected => 'None selected';

  @override
  String get preferredAccent => 'Preferred Accent';

  @override
  String get selectDailyStudyGoal => 'Select Daily Study Goal';

  @override
  String get selectDifficultyLevel => 'Select Difficulty Level';

  @override
  String get selectLearningFocusAreas => 'Select Learning Focus Areas';

  @override
  String get selectPreferredAccent => 'Select Preferred Accent';

  @override
  String get cancel => 'Cancel';

  @override
  String get ok => 'OK';

  @override
  String get americanAccent => 'American';

  @override
  String get britishAccent => 'British';

  @override
  String get australianAccent => 'Australian';

  @override
  String get pronunciation => 'Pronunciation';

  @override
  String get conversation => 'Conversation';

  @override
  String get all => 'All';

  @override
  String get navHome => 'Home';

  @override
  String get navCourses => 'Courses';

  @override
  String get navProgress => 'Progress';

  @override
  String get navProfile => 'Profile';

  @override
  String get learningStats => 'Learning Stats';

  @override
  String get currentStreak => 'Current Streak';

  @override
  String get longestStreak => 'Longest Streak';

  @override
  String get studyTime => 'Study Time';

  @override
  String get completedLessons => 'Completed Lessons';

  @override
  String get accountInformation => 'Account Information';

  @override
  String get appSettings => 'App Settings';

  @override
  String get accountActions => 'Account Actions';

  @override
  String get downloadLearningData => 'Download your learning data';

  @override
  String get deleteAccountDescription => 'Permanently delete your account';

  @override
  String get signOutDescription => 'Sign out of your account';

  @override
  String get notAvailable => 'Not available';

  @override
  String get memberSince => 'Member Since';

  @override
  String get lastLogin => 'Last Login';

  @override
  String get preferredLanguage => 'Preferred Language';

  @override
  String get phoneNumber => 'Phone Number';

  @override
  String get bio => 'Bio';

  @override
  String get notifications => 'Notifications';

  @override
  String get sound => 'Sound';

  @override
  String get enabled => 'Enabled';

  @override
  String get disabled => 'Disabled';

  @override
  String get editProfile => 'Edit Profile';

  @override
  String get editProfileComingSoon => 'Edit profile coming soon!';

  @override
  String errorSigningOut(String error) {
    return 'Error signing out: $error';
  }

  @override
  String get openSettings => 'Open Settings';

  @override
  String get enableNotificationsSteps =>
      'Please follow these steps to enable notifications:';

  @override
  String get openDeviceSettings => '1. Open your device Settings';

  @override
  String get findApps => '2. Find and tap on \"Apps\" or \"Applications\"';

  @override
  String get findEnglishFluency => '3. Find and tap on \"English Fluency\"';

  @override
  String get tapPermissions => '4. Tap on \"Permissions\"';

  @override
  String get enableNotifications => '5. Enable \"Notifications\"';

  @override
  String dailyReminderSet(String time) {
    return 'Daily reminder set for $time';
  }

  @override
  String get accountType => 'Account Type';

  @override
  String get admin => 'Admin';

  @override
  String get student => 'Student';

  @override
  String get days => 'days';

  @override
  String get administrator => 'Administrator';

  @override
  String get fifteenMinutes => '15 minutes';

  @override
  String get thirtyMinutes => '30 minutes';

  @override
  String get fortyFiveMinutes => '45 minutes';

  @override
  String get sixtyMinutes => '60 minutes';

  @override
  String get navMessages => 'Messages';

  @override
  String get resumeQuizTitle => 'Resume Quiz?';

  @override
  String get resumeQuizContent =>
      'You have a quiz in progress. Would you like to resume?';

  @override
  String get startOver => 'Start Over';

  @override
  String get resume => 'Resume';

  @override
  String get thirtySecondsWarning => '⚠️ 30 seconds remaining!';

  @override
  String get quizConfiguration => 'Quiz Configuration:';

  @override
  String get close => 'Close';

  @override
  String get soundEffects => 'Sound Effects';

  @override
  String get hapticFeedback => 'Haptic Feedback';

  @override
  String get previous => 'Previous';

  @override
  String get submitQuiz => 'Submit Quiz';

  @override
  String get next => 'Next';

  @override
  String get reviewAnswers => 'Review Answers';

  @override
  String get tryAgain => 'Try Again';

  @override
  String get finish => 'Finish';

  @override
  String get lessonDetailsError => 'Error';

  @override
  String get lessonNotFound => 'Lesson not found';

  @override
  String get loadingLesson => 'Loading lesson...';

  @override
  String errorLoadingTasks(String error) {
    return 'Error loading tasks: $error';
  }

  @override
  String questions(int count) {
    return '$count questions';
  }

  @override
  String resource(int number) {
    return 'Resource $number';
  }

  @override
  String get askQuestionAboutLesson => 'Ask a question about this lesson';

  @override
  String get typeYourQuestionHere => 'Type your question here...';

  @override
  String get sending => 'Sending...';

  @override
  String get send => 'Send';

  @override
  String get mustBeSignedInToAsk => 'You must be signed in to ask a question.';

  @override
  String get noAdminAvailable => 'No admin available to receive your question.';

  @override
  String get questionSentToAdmins =>
      'Your question has been sent to the admins!';

  @override
  String get created => 'Created';

  @override
  String get updated => 'Updated';

  @override
  String get author => 'Author';

  @override
  String get discussion => 'Discussion';

  @override
  String get task => 'Task';

  @override
  String get estimatedTime => 'Estimated time';

  @override
  String get incompleteTasks => 'Incomplete Tasks';

  @override
  String get noRecentActivities => 'No Recent Activities';

  @override
  String get noIncompleteTasks => 'No Incomplete Tasks';

  @override
  String get allTasksCompleted => 'All tasks completed! Great job!';

  @override
  String get startLearningToSeeActivities =>
      'Start learning to see your activities here';

  @override
  String get notificationSettings => 'Notification Settings';

  @override
  String get stayMotivated => 'Stay Motivated';

  @override
  String get notificationSettingsDescription =>
      'Configure notifications to keep your learning streak alive and stay updated with new content.';

  @override
  String get dailyLearningReminders => 'Daily Learning Reminders';

  @override
  String get dailyRemindersDescription => 'Get reminded to practice every day';

  @override
  String get reminderTime => 'Reminder Time';

  @override
  String get dailyChallenges => 'Daily Challenges';

  @override
  String get dailyChallengesDescription => 'Receive daily learning challenges';

  @override
  String get challengeTime => 'Challenge Time';

  @override
  String get achievementsAndStreaks => 'Achievements & Streaks';

  @override
  String get achievementsDescription => 'Celebrate your learning milestones';

  @override
  String get newContent => 'New Content';

  @override
  String get newContentDescription =>
      'Get notified about new words and lessons';

  @override
  String get streakReminders => 'Streak Reminders';

  @override
  String get streakRemindersDescription =>
      'Warnings when your streak is at risk';

  @override
  String get testNotifications => 'Test Notifications';

  @override
  String get testNotificationsDescription =>
      'Send test notifications to make sure everything is working correctly.';

  @override
  String get dailyReminder => 'Daily Reminder';

  @override
  String get achievement => 'Achievement';

  @override
  String get challenge => 'Challenge';

  @override
  String get manageAllNotifications => 'Manage All Notifications';

  @override
  String get dailyLearningReminderTitle => 'Daily Learning Reminder';

  @override
  String get dailyLearningReminderDescription =>
      'Time for your daily language practice! Keep your streak alive.';

  @override
  String get achievementUnlockedTitle => 'Achievement Unlocked! 🏆';

  @override
  String get achievementUnlockedDescription =>
      'Congratulations! You\'ve completed 7 days in a row. Streak Master badge earned!';

  @override
  String get newVocabularyTitle => 'New Vocabulary Available';

  @override
  String get newVocabularyDescription =>
      '25 new business English words have been added to your course.';

  @override
  String get dailyChallengeTitle => 'Daily Challenge Ready';

  @override
  String get dailyChallengeDescription =>
      'Today\'s challenge: Practice pronunciation for 10 minutes!';

  @override
  String get streakWarningTitle => 'Streak Warning ⚠️';

  @override
  String get streakWarningDescription =>
      'Don\'t lose your 5-day streak! You have 3 hours left to practice.';

  @override
  String get lessonCompletedTitle => 'Lesson Completed';

  @override
  String get lessonCompletedDescription =>
      'Great job! You\'ve completed \"Basic Conversations\" lesson.';

  @override
  String get weeklyProgressReportTitle => 'Weekly Progress Report';

  @override
  String get weeklyProgressReportDescription =>
      'You\'ve studied for 3.5 hours this week. Keep up the great work!';

  @override
  String get notificationDeleted => 'Notification deleted';

  @override
  String get allNotificationsMarkedAsRead => 'All notifications marked as read';

  @override
  String get clearAllNotificationsDialogTitle => 'Clear All Notifications';

  @override
  String get clearAllNotificationsDialogContent =>
      'Are you sure you want to delete all notifications? This action cannot be undone.';

  @override
  String get clearAllNotifications => 'All notifications cleared';

  @override
  String get clearAll => 'Clear All';

  @override
  String get markAllAsRead => 'Mark all as read';

  @override
  String get loadingNotifications => 'Loading notifications...';

  @override
  String get noNotifications => 'No Notifications';

  @override
  String get noNotificationsDescription =>
      'You\'re all caught up! Check back later for new updates and achievements.';

  @override
  String unreadNotifications(int count) {
    return '$count unread notifications';
  }

  @override
  String get justNow => 'Just now';

  @override
  String minutesAgo(int minutes) {
    return '${minutes}m ago';
  }

  @override
  String hoursAgo(int hours) {
    return '${hours}h ago';
  }

  @override
  String daysAgo(int days) {
    return '${days}d ago';
  }

  @override
  String get openingLessons => 'Opening lessons...';

  @override
  String get openingAchievements => 'Opening achievements...';

  @override
  String get openingNewContent => 'Opening new content...';

  @override
  String get openingChallenges => 'Opening challenges...';

  @override
  String get openingPractice => 'Opening practice...';

  @override
  String get openingProgress => 'Opening progress...';

  @override
  String get openingAnalytics => 'Opening analytics...';

  @override
  String get setVocabularyGoal => 'Set Vocabulary Goal';

  @override
  String get vocabularyGoalTitle => 'Set Your Daily Vocabulary Goal';

  @override
  String get vocabularyGoalDescription =>
      'Choose how many new words you want to learn each day. This will help you stay motivated and track your progress.';

  @override
  String get chooseGoalPreset => 'Choose a Goal Preset';

  @override
  String get customTarget => 'Custom Target';

  @override
  String get enterCustomTarget => 'Enter custom target';

  @override
  String get customTargetHint => 'e.g., 20';

  @override
  String get wordsPerDay => 'words/day';

  @override
  String get updateGoal => 'Update Goal';

  @override
  String get setGoal => 'Set Goal';

  @override
  String get deleteGoal => 'Delete Goal';

  @override
  String get currentGoal => 'Current Goal';

  @override
  String get dailyTarget => 'Daily Target';

  @override
  String get words => 'words';

  @override
  String get progress => 'Progress';

  @override
  String get goalCompleted => 'Goal completed for today! 🎉';

  @override
  String remainingWords(int count) {
    return '$count words remaining';
  }

  @override
  String get invalidTarget => 'Please enter a valid number greater than 0';

  @override
  String get goalSetSuccessfully => 'Vocabulary goal set successfully!';

  @override
  String get deleteGoalConfirmation =>
      'Are you sure you want to delete your vocabulary goal? This action cannot be undone.';

  @override
  String get delete => 'Delete';

  @override
  String get goalDeleted => 'Vocabulary goal deleted';

  @override
  String get loadingGoal => 'Loading goal...';

  @override
  String get noVocabularyGoal => 'No Vocabulary Goal Set';

  @override
  String get setGoalToTrackProgress =>
      'Set a daily vocabulary goal to track your learning progress and stay motivated.';

  @override
  String get dailyVocabularyGoal => 'Daily Vocabulary Goal';

  @override
  String get editGoal => 'Edit Goal';

  @override
  String get learnWords => 'Learn Words';

  @override
  String get addWords => 'Add Words';

  @override
  String get congratulationsGoalCompleted =>
      'Congratulations! You\'ve completed your daily vocabulary goal! 🎉';

  @override
  String get addWordsManually => 'Add Words Manually';

  @override
  String get howManyWordsLearned => 'How many words did you learn today?';

  @override
  String get numberOfWords => 'Number of words';

  @override
  String get add => 'Add';

  @override
  String get noVocabularyProgress => 'No vocabulary progress yet';

  @override
  String get startLearningWords =>
      'Start learning words to see your progress here';

  @override
  String get vocabularyProgress => 'Vocabulary Progress';

  @override
  String get totalWords => 'Total Words';

  @override
  String get accuracy => 'Accuracy';

  @override
  String get favorites => 'Favorites';

  @override
  String get noPronunciationPractice => 'No pronunciation practice yet';

  @override
  String get startPracticingPronunciation =>
      'Start practicing pronunciation to see your progress here';

  @override
  String get pronunciationProgress => 'Pronunciation Progress';

  @override
  String get totalAttempts => 'Total Attempts';

  @override
  String get successRate => 'Success Rate';

  @override
  String get avgAccuracy => 'Avg Accuracy';

  @override
  String get bestAccuracy => 'Best Accuracy';

  @override
  String get avgConfidence => 'Avg Confidence';

  @override
  String get wordsPracticed => 'Words Practiced';

  @override
  String get recentPractice => 'Recent Practice';

  @override
  String get recentActivity => 'Recent Activity';

  @override
  String get recentActivities => 'Recent Activities';

  @override
  String get needsPractice => 'Needs Practice';

  @override
  String get yourGoals => 'Your Goals';

  @override
  String get courseProgress => 'Course Progress';

  @override
  String get allTime => 'All Time';

  @override
  String get thisWeek => 'This Week';

  @override
  String get thisMonth => 'This Month';

  @override
  String get last30Days => 'Last 30 Days';

  @override
  String get pleaseSignInToViewProgress =>
      'Please sign in to view your progress';

  @override
  String get learningProgress => 'Learning Progress';

  @override
  String get vocabularyAndPronunciation => 'Vocabulary & Pronunciation';

  @override
  String get completed => 'Completed';

  @override
  String get dailyStudy => 'Daily Study';

  @override
  String get lessonsCompleted => 'Lessons Completed';

  @override
  String get firstLesson => 'First Lesson';

  @override
  String get completedFirstLesson => 'Completed your first lesson!';

  @override
  String get threeDayStreak => '3 Day Streak';

  @override
  String get studiedThreeDays => 'Studied 3 days in a row!';

  @override
  String get keepUpGreatWork =>
      'Keep up the great work! You\'re making excellent progress.';

  @override
  String get learningAnalytics => 'Learning Analytics';

  @override
  String get timeRange => 'Time Range';

  @override
  String get category => 'Category';

  @override
  String get vocabularyWords => 'Vocabulary Words';

  @override
  String get pronunciationAttempts => 'Pronunciation Attempts';

  @override
  String get vocabularyAccuracy => 'Vocabulary Accuracy';

  @override
  String get pronunciationAccuracy => 'Pronunciation Accuracy';

  @override
  String get progressTrends => 'Progress Trends';

  @override
  String get vocabVsPronunciation => 'Vocabulary vs Pronunciation Progress';

  @override
  String get firstAttempt => 'First Attempt';

  @override
  String get lastAttempt => 'Last Attempt';

  @override
  String get commonMistakes => 'Common Mistakes';

  @override
  String get wordFrequency => 'Word Frequency';

  @override
  String get good => 'Good';

  @override
  String get attempts => 'attempts';

  @override
  String get success => 'success';

  @override
  String get greatJob => 'Great Job!';

  @override
  String get youveBeenLearningForAnother10MinutesKeepItUp =>
      'You\'ve been learning for another 10 minutes! Keep it up! 🎉';

  @override
  String get thanks => 'Thanks!';

  @override
  String get goalAchieved => 'Goal Achieved!';

  @override
  String get congratulationsYouHaveReachedYourDailyVocabularyGoalWouldYouLikeToSetANewOne =>
      'Congratulations! You have reached your daily vocabulary goal. Would you like to set a new one?';

  @override
  String get notNow => 'Not Now';

  @override
  String get setNewGoal => 'Set New Goal';

  @override
  String get failedToUpdateFavoriteStatus => 'Failed to update favorite status';

  @override
  String get addedToFavorites => 'Added to favorites!';

  @override
  String get removedFromFavorites => 'Removed from favorites';

  @override
  String get progressTrackingTemporarilyUnavailable =>
      'Progress tracking temporarily unavailable';

  @override
  String get vocabularyProgressTestSuccessfulCheckConsoleForDetails =>
      'Vocabulary progress test successful! Check console for details.';

  @override
  String get vocabularyProgressTestFailed => 'Vocabulary progress test failed';

  @override
  String get wordPronunciationPractice => 'Word Pronunciation Practice';

  @override
  String get unableToLoadPronunciationPractice =>
      'Unable to load pronunciation practice';

  @override
  String get pleaseTryAgainLater => 'Please try again later.';

  @override
  String get noExampleSentenceAvailableForThisWord =>
      'No example sentence available for this word.';

  @override
  String get sentencePronunciationPractice => 'Sentence Pronunciation Practice';

  @override
  String get exampleSentenceFor => 'Example sentence for';

  @override
  String get unableToLoadSentencePronunciationPractice =>
      'Unable to load sentence pronunciation practice';

  @override
  String get awesome => 'Awesome! 🎉';

  @override
  String get greatPronunciationKeepPracticingAndYoullMasterThisWord =>
      'Great pronunciation! Keep practicing and you\'ll master this word.';

  @override
  String get yourBestAccuracy => 'Your Best Accuracy:';

  @override
  String get average => 'Average';

  @override
  String get nextWord => 'Next Word';

  @override
  String get excellent => 'Excellent! 🎊';

  @override
  String get greatSentencePronunciationKeepPracticingAndYoullSoundLikeANative =>
      'Great sentence pronunciation! Keep practicing and you\'ll sound like a native.';

  @override
  String get learningSessionInProgress => 'Learning Session in Progress 📚';

  @override
  String get currentWord => 'Current word';

  @override
  String get timeToPracticeYourVocabularyKeepYourLearningStreakAlive =>
      'Time to practice your vocabulary! Keep your learning streak alive.';

  @override
  String get learningSessionStartedCheckYourNotifications =>
      'Learning session started! Check your notifications.';

  @override
  String get vocabularyBuilder => 'Vocabulary Builder';

  @override
  String get testFirebaseConnection => 'Test Firebase Connection';

  @override
  String get search => 'Search';

  @override
  String get toggleFavorite => 'Toggle favorite';

  @override
  String get searchWordsOrMeanings => 'Search words or meanings...';

  @override
  String get setYourDailyVocabularyGoal => 'Set Your Daily Vocabulary Goal';

  @override
  String get trackYourProgressAndStayMotivatedBySettingADailyVocabularyGoal =>
      'Track your progress and stay motivated by setting a daily vocabulary goal.';

  @override
  String get todaysGoal => 'Today\'s Goal';

  @override
  String get practicePronunciation => 'Practice pronunciation';

  @override
  String get meaning => 'Meaning';

  @override
  String get wordPracticed => 'Word Practiced';

  @override
  String get practiceWord => 'Practice Word';

  @override
  String get example => 'Example';

  @override
  String get sentencePracticed => 'Sentence Practiced';

  @override
  String get practiceSentence => 'Practice Sentence';

  @override
  String get exampleMeaning => 'Example Meaning';

  @override
  String get usageFrequency => 'Usage Frequency';

  @override
  String get random => 'Random';

  @override
  String get hide => 'Hide';

  @override
  String get reveal => 'Reveal';

  @override
  String get veryCommonlyUsedInEverydayEnglish =>
      'Very commonly used in everyday English';

  @override
  String get frequentlyUsedInEnglish => 'Frequently used in English';

  @override
  String get moderatelyUsedInEnglish => 'Moderately used in English';

  @override
  String get occasionallyUsedInEnglish => 'Occasionally used in English';

  @override
  String get rarelyUsedInEnglish => 'Rarely used in English';

  @override
  String get yourProgress => 'Your Progress';

  @override
  String get views => 'Views';

  @override
  String get correct => 'Correct';

  @override
  String get common => 'Common';

  @override
  String get uncommon => 'Uncommon';

  @override
  String get veryCommon => 'Very Common';

  @override
  String get rare => 'Rare';

  @override
  String get viewed => 'Viewed';

  @override
  String get correctAnswers => 'Correct Answers';

  @override
  String get microphonePermissionRequired =>
      'Microphone permission is required for speech recognition.';

  @override
  String get speechRecognitionNotAvailable =>
      'Speech recognition not available. Please check microphone permissions.';

  @override
  String get failedToStartListening =>
      'Failed to start listening. Please try again.';

  @override
  String get errorStartingSpeechRecognition =>
      'Error starting speech recognition.';

  @override
  String get errorEvaluatingPronunciation =>
      'Error evaluating pronunciation. Please try again.';

  @override
  String get perfectSentencePronunciation =>
      'Perfect sentence pronunciation! Excellent fluency!';

  @override
  String get greatSentencePronunciation =>
      'Great sentence pronunciation! Very natural flow.';

  @override
  String get goodSentencePronunciation =>
      'Good sentence pronunciation! Keep practicing for better fluency.';

  @override
  String get notQuiteRight =>
      'Not quite right. Listen to the sentence again and practice the rhythm.';

  @override
  String get poor => 'Poor';

  @override
  String get veryHigh => 'Very High';

  @override
  String get high => 'High';

  @override
  String get medium => 'Medium';

  @override
  String get practiceThisSentence => 'Practice This Sentence';

  @override
  String get listening => 'Listening...';

  @override
  String get readyToListen => 'Ready to listen';

  @override
  String get youSaid => 'You said:';

  @override
  String get startSpeakingToSeeYourWordsHere =>
      'Start speaking to see your words here...';

  @override
  String get liveTranscription => 'Live transcription';

  @override
  String get stop => 'Stop';

  @override
  String get startSpeaking => 'Start Speaking';

  @override
  String get similarity => 'Similarity';

  @override
  String get confidence => 'Confidence';

  @override
  String get continueText => 'Continue';

  @override
  String get newWords => 'New words';

  @override
  String get goal => 'Goal';

  @override
  String get remaining => 'Remaining';
}
