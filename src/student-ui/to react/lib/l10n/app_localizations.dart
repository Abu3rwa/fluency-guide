import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en')
  ];

  /// The title of the application
  ///
  /// In en, this message translates to:
  /// **'EFG'**
  String get appTitle;

  /// Title for language selection dialog
  ///
  /// In en, this message translates to:
  /// **'Select Language'**
  String get selectLanguage;

  /// Title for today's progress section
  ///
  /// In en, this message translates to:
  /// **'Today\'s Progress'**
  String get todaysProgress;

  /// Day streak message
  ///
  /// In en, this message translates to:
  /// **'{days} Day Streak!'**
  String dayStreak(int days);

  /// Label for day streak stat
  ///
  /// In en, this message translates to:
  /// **'Day Streak'**
  String get dayStreakLabel;

  /// Progress completion message
  ///
  /// In en, this message translates to:
  /// **'{percent}% of daily goal completed'**
  String progressCompleted(int percent);

  /// Minutes completed message
  ///
  /// In en, this message translates to:
  /// **'{completed}/{total} minutes'**
  String minutesCompleted(int completed, int total);

  /// Minutes today label
  ///
  /// In en, this message translates to:
  /// **'Minutes Today'**
  String get minutesToday;

  /// Achievements label
  ///
  /// In en, this message translates to:
  /// **'Achievements'**
  String get achievements;

  /// XP points label
  ///
  /// In en, this message translates to:
  /// **'XP Points'**
  String get xpPoints;

  /// Practice now section title
  ///
  /// In en, this message translates to:
  /// **'Practice Now'**
  String get practiceNow;

  /// Continue lesson button text
  ///
  /// In en, this message translates to:
  /// **'Continue Lesson'**
  String get continueLesson;

  /// Daily quiz button text
  ///
  /// In en, this message translates to:
  /// **'Daily Quiz'**
  String get dailyQuiz;

  /// Test knowledge subtitle
  ///
  /// In en, this message translates to:
  /// **'Test your knowledge'**
  String get testKnowledge;

  /// Recent achievements section title
  ///
  /// In en, this message translates to:
  /// **'Recent Achievements'**
  String get recentAchievements;

  /// View all button text
  ///
  /// In en, this message translates to:
  /// **'View All'**
  String get viewAll;

  /// Learning path section title
  ///
  /// In en, this message translates to:
  /// **'Learning Path'**
  String get learningPath;

  /// See all button text
  ///
  /// In en, this message translates to:
  /// **'See All'**
  String get seeAll;

  /// Welcome message
  ///
  /// In en, this message translates to:
  /// **'Welcome'**
  String get welcome;

  /// Sign in button text
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get signIn;

  /// Sign up button text
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get signUp;

  /// Email field label
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get email;

  /// Password field label
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// Forgot password link text
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get forgotPassword;

  /// Courses screen title
  ///
  /// In en, this message translates to:
  /// **'Courses'**
  String get courses;

  /// Enroll button text
  ///
  /// In en, this message translates to:
  /// **'Enroll Now'**
  String get enrollNow;

  /// Enrollment pending status
  ///
  /// In en, this message translates to:
  /// **'Enrollment Pending'**
  String get enrollmentPending;

  /// Start learning button text
  ///
  /// In en, this message translates to:
  /// **'Start Learning'**
  String get startLearning;

  /// Reapply button text
  ///
  /// In en, this message translates to:
  /// **'Reapply'**
  String get reapply;

  /// Message shown when user is already enrolled
  ///
  /// In en, this message translates to:
  /// **'You are already enrolled in this course'**
  String get alreadyEnrolled;

  /// Message shown when enrollment is pending
  ///
  /// In en, this message translates to:
  /// **'Your enrollment request is pending approval'**
  String get enrollmentPendingMessage;

  /// Message shown when enrollment request is successful
  ///
  /// In en, this message translates to:
  /// **'Enrollment request sent successfully'**
  String get enrollmentSuccess;

  /// Message shown when enrollment request fails
  ///
  /// In en, this message translates to:
  /// **'Failed to send enrollment request'**
  String get enrollmentFailed;

  /// Message shown when user needs to sign in
  ///
  /// In en, this message translates to:
  /// **'Please sign in to enroll in courses'**
  String get signInRequired;

  /// Generic error message
  ///
  /// In en, this message translates to:
  /// **'An error occurred while processing your request'**
  String get errorOccurred;

  /// Title for profile screen
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// Settings section title
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// Language setting label
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// Theme setting label
  ///
  /// In en, this message translates to:
  /// **'Theme'**
  String get theme;

  /// Dark mode setting label
  ///
  /// In en, this message translates to:
  /// **'Dark Mode'**
  String get darkMode;

  /// Light mode setting label
  ///
  /// In en, this message translates to:
  /// **'Light Mode'**
  String get lightMode;

  /// Overview tab title
  ///
  /// In en, this message translates to:
  /// **'Overview'**
  String get overview;

  /// Modules tab title
  ///
  /// In en, this message translates to:
  /// **'Modules'**
  String get modules;

  /// Students tab title
  ///
  /// In en, this message translates to:
  /// **'Students'**
  String get students;

  /// Total students label
  ///
  /// In en, this message translates to:
  /// **'Total Students'**
  String get totalStudents;

  /// Completion rate label
  ///
  /// In en, this message translates to:
  /// **'Completion Rate'**
  String get completionRate;

  /// Average score label
  ///
  /// In en, this message translates to:
  /// **'Average Score'**
  String get averageScore;

  /// Total time spent label
  ///
  /// In en, this message translates to:
  /// **'Total Time Spent'**
  String get totalTimeSpent;

  /// Message shown when no modules are available
  ///
  /// In en, this message translates to:
  /// **'No modules available for this course'**
  String get noModulesAvailable;

  /// Refresh button text
  ///
  /// In en, this message translates to:
  /// **'Refresh'**
  String get refresh;

  /// Error message when modules fail to load
  ///
  /// In en, this message translates to:
  /// **'Error loading modules'**
  String get errorLoadingModules;

  /// Lesson details title
  ///
  /// In en, this message translates to:
  /// **'Lesson Details'**
  String get lessonDetails;

  /// Content section title
  ///
  /// In en, this message translates to:
  /// **'Content'**
  String get content;

  /// Learning objectives section title
  ///
  /// In en, this message translates to:
  /// **'Learning Objectives'**
  String get learningObjectives;

  /// Skills section title
  ///
  /// In en, this message translates to:
  /// **'Skills You\'ll Learn'**
  String get skillsYoullLearn;

  /// Resources section title
  ///
  /// In en, this message translates to:
  /// **'Resources'**
  String get resources;

  /// Assessment section title
  ///
  /// In en, this message translates to:
  /// **'Assessment'**
  String get assessment;

  /// Start assessment button text
  ///
  /// In en, this message translates to:
  /// **'Start Assessment'**
  String get startAssessment;

  /// Quiz section title
  ///
  /// In en, this message translates to:
  /// **'Quiz'**
  String get quiz;

  /// Start quiz button text
  ///
  /// In en, this message translates to:
  /// **'Start Quiz'**
  String get startQuiz;

  /// Lesson information section title
  ///
  /// In en, this message translates to:
  /// **'Lesson Information'**
  String get lessonInformation;

  /// Tasks section title
  ///
  /// In en, this message translates to:
  /// **'Tasks'**
  String get tasks;

  /// Message shown when no tasks are available
  ///
  /// In en, this message translates to:
  /// **'No tasks available for this lesson'**
  String get noTasksAvailable;

  /// Achievement badge for day streak
  ///
  /// In en, this message translates to:
  /// **'7 Day Streak'**
  String get achievementDayStreak;

  /// Achievement badge for speed learning
  ///
  /// In en, this message translates to:
  /// **'Speed Learner'**
  String get achievementSpeedLearner;

  /// Achievement badge for perfect score
  ///
  /// In en, this message translates to:
  /// **'Perfect Score'**
  String get achievementPerfectScore;

  /// Basic grammar course title
  ///
  /// In en, this message translates to:
  /// **'Basic Grammar'**
  String get courseBasicGrammar;

  /// Vocabulary course title
  ///
  /// In en, this message translates to:
  /// **'Vocabulary'**
  String get courseVocabulary;

  /// Pronunciation course title
  ///
  /// In en, this message translates to:
  /// **'Pronunciation'**
  String get coursePronunciation;

  /// Listening course title
  ///
  /// In en, this message translates to:
  /// **'Listening'**
  String get courseListening;

  /// Speaking course title
  ///
  /// In en, this message translates to:
  /// **'Speaking'**
  String get courseSpeaking;

  /// Conversation course title
  ///
  /// In en, this message translates to:
  /// **'Conversation'**
  String get courseConversation;

  /// Analytics section title
  ///
  /// In en, this message translates to:
  /// **'Analytics'**
  String get analytics;

  /// Retry button text
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// Message shown when user needs to sign in
  ///
  /// In en, this message translates to:
  /// **'Please sign in to view your profile'**
  String get pleaseSignIn;

  /// Message shown when enrollment is pending
  ///
  /// In en, this message translates to:
  /// **'Your enrollment request is pending approval'**
  String get enrollmentPendingApproval;

  /// Message shown when enrollment request is successful
  ///
  /// In en, this message translates to:
  /// **'Enrollment request sent successfully'**
  String get enrollmentRequestSent;

  /// Message shown when enrollment request fails
  ///
  /// In en, this message translates to:
  /// **'Failed to send enrollment request'**
  String get enrollmentRequestFailed;

  /// Search courses input placeholder
  ///
  /// In en, this message translates to:
  /// **'Search courses...'**
  String get searchCourses;

  /// Filter courses button text
  ///
  /// In en, this message translates to:
  /// **'Filter Courses'**
  String get filterCourses;

  /// Label for difficulty level setting
  ///
  /// In en, this message translates to:
  /// **'Difficulty Level'**
  String get difficultyLevel;

  /// Duration label
  ///
  /// In en, this message translates to:
  /// **'Duration'**
  String get duration;

  /// Price label
  ///
  /// In en, this message translates to:
  /// **'Price'**
  String get price;

  /// Reset button text
  ///
  /// In en, this message translates to:
  /// **'Reset'**
  String get reset;

  /// Apply button text
  ///
  /// In en, this message translates to:
  /// **'Apply'**
  String get apply;

  /// Message shown when no courses are available
  ///
  /// In en, this message translates to:
  /// **'No courses available'**
  String get noCoursesAvailable;

  /// Message shown when no courses are available in a category
  ///
  /// In en, this message translates to:
  /// **'No courses in {category} category'**
  String noCoursesInCategory(String category);

  /// Message shown when no courses are available
  ///
  /// In en, this message translates to:
  /// **'Check back later for new courses'**
  String get checkBackLater;

  /// Continue progress message
  ///
  /// In en, this message translates to:
  /// **'Continue Your Progress'**
  String get continueProgress;

  /// Resume last lesson message
  ///
  /// In en, this message translates to:
  /// **'Resume your last lesson'**
  String get resumeLastLesson;

  /// Begin journey message
  ///
  /// In en, this message translates to:
  /// **'Begin your language learning journey'**
  String get beginJourney;

  /// Browse courses button text
  ///
  /// In en, this message translates to:
  /// **'Browse Courses'**
  String get browseCourses;

  /// Enrolled status label
  ///
  /// In en, this message translates to:
  /// **'Enrolled'**
  String get enrolled;

  /// Format for minutes
  ///
  /// In en, this message translates to:
  /// **'{minutes} minutes'**
  String minutes(int minutes);

  /// Featured label
  ///
  /// In en, this message translates to:
  /// **'Featured'**
  String get featured;

  /// Lessons label
  ///
  /// In en, this message translates to:
  /// **'lessons'**
  String get lessons;

  /// Short duration filter option
  ///
  /// In en, this message translates to:
  /// **'Short (< 1 hour)'**
  String get shortDuration;

  /// Medium duration filter option
  ///
  /// In en, this message translates to:
  /// **'Medium (1-3 hours)'**
  String get mediumDuration;

  /// Long duration filter option
  ///
  /// In en, this message translates to:
  /// **'Long (> 3 hours)'**
  String get longDuration;

  /// Free price filter option
  ///
  /// In en, this message translates to:
  /// **'Free'**
  String get free;

  /// Paid price filter option
  ///
  /// In en, this message translates to:
  /// **'Paid'**
  String get paid;

  /// Beginner difficulty level
  ///
  /// In en, this message translates to:
  /// **'Beginner'**
  String get beginner;

  /// Intermediate difficulty level
  ///
  /// In en, this message translates to:
  /// **'Intermediate'**
  String get intermediate;

  /// Advanced difficulty level
  ///
  /// In en, this message translates to:
  /// **'Advanced'**
  String get advanced;

  /// Business category
  ///
  /// In en, this message translates to:
  /// **'Business'**
  String get business;

  /// Conversational category
  ///
  /// In en, this message translates to:
  /// **'Conversational'**
  String get conversational;

  /// Grammar category
  ///
  /// In en, this message translates to:
  /// **'Grammar'**
  String get grammar;

  /// Vocabulary category
  ///
  /// In en, this message translates to:
  /// **'Vocabulary'**
  String get vocabulary;

  /// Message shown when settings data is not available
  ///
  /// In en, this message translates to:
  /// **'Settings data not available'**
  String get settingsDataNotAvailable;

  /// Title for profile and account section
  ///
  /// In en, this message translates to:
  /// **'PROFILE & ACCOUNT'**
  String get profileAndAccount;

  /// Label for guest user
  ///
  /// In en, this message translates to:
  /// **'Guest User'**
  String get guestUser;

  /// Label when no email is available
  ///
  /// In en, this message translates to:
  /// **'No Email'**
  String get noEmail;

  /// Label for fluency level
  ///
  /// In en, this message translates to:
  /// **'Fluency Level'**
  String get fluencyLevel;

  /// Label for progress sync option
  ///
  /// In en, this message translates to:
  /// **'Progress Sync'**
  String get progressSync;

  /// Label for sign out button
  ///
  /// In en, this message translates to:
  /// **'Sign Out'**
  String get signOut;

  /// Label for delete account option
  ///
  /// In en, this message translates to:
  /// **'Delete Account'**
  String get deleteAccount;

  /// Label for export data option
  ///
  /// In en, this message translates to:
  /// **'Export Data'**
  String get exportData;

  /// Title for learning preferences section
  ///
  /// In en, this message translates to:
  /// **'Learning Preferences'**
  String get learningPreferences;

  /// Label for daily study goal setting
  ///
  /// In en, this message translates to:
  /// **'Daily Study Goal'**
  String get dailyStudyGoal;

  /// Label for learning focus areas setting
  ///
  /// In en, this message translates to:
  /// **'Learning Focus Areas'**
  String get learningFocusAreas;

  /// Label when no items are selected
  ///
  /// In en, this message translates to:
  /// **'None selected'**
  String get noneSelected;

  /// Label for preferred accent setting
  ///
  /// In en, this message translates to:
  /// **'Preferred Accent'**
  String get preferredAccent;

  /// Title for daily study goal selection dialog
  ///
  /// In en, this message translates to:
  /// **'Select Daily Study Goal'**
  String get selectDailyStudyGoal;

  /// Title for difficulty level selection dialog
  ///
  /// In en, this message translates to:
  /// **'Select Difficulty Level'**
  String get selectDifficultyLevel;

  /// Title for learning focus areas selection dialog
  ///
  /// In en, this message translates to:
  /// **'Select Learning Focus Areas'**
  String get selectLearningFocusAreas;

  /// Title for preferred accent selection dialog
  ///
  /// In en, this message translates to:
  /// **'Select Preferred Accent'**
  String get selectPreferredAccent;

  /// Label for cancel button
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// Label for OK button
  ///
  /// In en, this message translates to:
  /// **'OK'**
  String get ok;

  /// Label for American accent
  ///
  /// In en, this message translates to:
  /// **'American'**
  String get americanAccent;

  /// Label for British accent
  ///
  /// In en, this message translates to:
  /// **'British'**
  String get britishAccent;

  /// Label for Australian accent
  ///
  /// In en, this message translates to:
  /// **'Australian'**
  String get australianAccent;

  /// Label for pronunciation
  ///
  /// In en, this message translates to:
  /// **'Pronunciation'**
  String get pronunciation;

  /// Label for conversation
  ///
  /// In en, this message translates to:
  /// **'Conversation'**
  String get conversation;

  /// Label for all
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get all;

  /// Navigation label for home
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// Navigation label for courses
  ///
  /// In en, this message translates to:
  /// **'Courses'**
  String get navCourses;

  /// Navigation label for progress
  ///
  /// In en, this message translates to:
  /// **'Progress'**
  String get navProgress;

  /// Navigation label for profile
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get navProfile;

  /// Title for learning statistics section
  ///
  /// In en, this message translates to:
  /// **'Learning Stats'**
  String get learningStats;

  /// Label for current streak stat
  ///
  /// In en, this message translates to:
  /// **'Current Streak'**
  String get currentStreak;

  /// Label for longest streak stat
  ///
  /// In en, this message translates to:
  /// **'Longest Streak'**
  String get longestStreak;

  /// Label for study time stat
  ///
  /// In en, this message translates to:
  /// **'Study Time'**
  String get studyTime;

  /// Label for completed lessons stat
  ///
  /// In en, this message translates to:
  /// **'Completed Lessons'**
  String get completedLessons;

  /// Title for account information section
  ///
  /// In en, this message translates to:
  /// **'Account Information'**
  String get accountInformation;

  /// Title for app settings section
  ///
  /// In en, this message translates to:
  /// **'App Settings'**
  String get appSettings;

  /// Title for account actions section
  ///
  /// In en, this message translates to:
  /// **'Account Actions'**
  String get accountActions;

  /// Description for export data action
  ///
  /// In en, this message translates to:
  /// **'Download your learning data'**
  String get downloadLearningData;

  /// Description for delete account action
  ///
  /// In en, this message translates to:
  /// **'Permanently delete your account'**
  String get deleteAccountDescription;

  /// Description for sign out action
  ///
  /// In en, this message translates to:
  /// **'Sign out of your account'**
  String get signOutDescription;

  /// Text shown when data is not available
  ///
  /// In en, this message translates to:
  /// **'Not available'**
  String get notAvailable;

  /// Label for member since date
  ///
  /// In en, this message translates to:
  /// **'Member Since'**
  String get memberSince;

  /// Label for last login date
  ///
  /// In en, this message translates to:
  /// **'Last Login'**
  String get lastLogin;

  /// Label for preferred language setting
  ///
  /// In en, this message translates to:
  /// **'Preferred Language'**
  String get preferredLanguage;

  /// Label for phone number
  ///
  /// In en, this message translates to:
  /// **'Phone Number'**
  String get phoneNumber;

  /// Label for user bio
  ///
  /// In en, this message translates to:
  /// **'Bio'**
  String get bio;

  /// Title for notifications screen
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// Label for sound setting
  ///
  /// In en, this message translates to:
  /// **'Sound'**
  String get sound;

  /// Text for enabled state
  ///
  /// In en, this message translates to:
  /// **'Enabled'**
  String get enabled;

  /// Text for disabled state
  ///
  /// In en, this message translates to:
  /// **'Disabled'**
  String get disabled;

  /// Label for edit profile action
  ///
  /// In en, this message translates to:
  /// **'Edit Profile'**
  String get editProfile;

  /// Message shown when edit profile is not yet available
  ///
  /// In en, this message translates to:
  /// **'Edit profile coming soon!'**
  String get editProfileComingSoon;

  /// Error message when signing out fails
  ///
  /// In en, this message translates to:
  /// **'Error signing out: {error}'**
  String errorSigningOut(String error);

  /// Title for settings dialog
  ///
  /// In en, this message translates to:
  /// **'Open Settings'**
  String get openSettings;

  /// Instructions for enabling notifications
  ///
  /// In en, this message translates to:
  /// **'Please follow these steps to enable notifications:'**
  String get enableNotificationsSteps;

  /// Step 1 for enabling notifications
  ///
  /// In en, this message translates to:
  /// **'1. Open your device Settings'**
  String get openDeviceSettings;

  /// Step 2 for enabling notifications
  ///
  /// In en, this message translates to:
  /// **'2. Find and tap on \"Apps\" or \"Applications\"'**
  String get findApps;

  /// Step 3 for enabling notifications
  ///
  /// In en, this message translates to:
  /// **'3. Find and tap on \"English Fluency\"'**
  String get findEnglishFluency;

  /// Step 4 for enabling notifications
  ///
  /// In en, this message translates to:
  /// **'4. Tap on \"Permissions\"'**
  String get tapPermissions;

  /// Step 5 for enabling notifications
  ///
  /// In en, this message translates to:
  /// **'5. Enable \"Notifications\"'**
  String get enableNotifications;

  /// Message shown when daily reminder is set
  ///
  /// In en, this message translates to:
  /// **'Daily reminder set for {time}'**
  String dailyReminderSet(String time);

  /// Label for account type
  ///
  /// In en, this message translates to:
  /// **'Account Type'**
  String get accountType;

  /// Label for admin user type
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get admin;

  /// Label for student user type
  ///
  /// In en, this message translates to:
  /// **'Student'**
  String get student;

  /// Label for days unit
  ///
  /// In en, this message translates to:
  /// **'days'**
  String get days;

  /// Label for administrator user type
  ///
  /// In en, this message translates to:
  /// **'Administrator'**
  String get administrator;

  /// 15 minutes option for daily study goal
  ///
  /// In en, this message translates to:
  /// **'15 minutes'**
  String get fifteenMinutes;

  /// 30 minutes option for daily study goal
  ///
  /// In en, this message translates to:
  /// **'30 minutes'**
  String get thirtyMinutes;

  /// 45 minutes option for daily study goal
  ///
  /// In en, this message translates to:
  /// **'45 minutes'**
  String get fortyFiveMinutes;

  /// 60 minutes option for daily study goal
  ///
  /// In en, this message translates to:
  /// **'60 minutes'**
  String get sixtyMinutes;

  /// Navigation label for messages tab
  ///
  /// In en, this message translates to:
  /// **'Messages'**
  String get navMessages;

  /// Dialog title for resuming a quiz
  ///
  /// In en, this message translates to:
  /// **'Resume Quiz?'**
  String get resumeQuizTitle;

  /// Dialog content for resuming a quiz
  ///
  /// In en, this message translates to:
  /// **'You have a quiz in progress. Would you like to resume?'**
  String get resumeQuizContent;

  /// Button to start quiz over
  ///
  /// In en, this message translates to:
  /// **'Start Over'**
  String get startOver;

  /// Button to resume quiz
  ///
  /// In en, this message translates to:
  /// **'Resume'**
  String get resume;

  /// Warning when 30 seconds left in quiz timer
  ///
  /// In en, this message translates to:
  /// **'⚠️ 30 seconds remaining!'**
  String get thirtySecondsWarning;

  /// Section title for quiz configuration details
  ///
  /// In en, this message translates to:
  /// **'Quiz Configuration:'**
  String get quizConfiguration;

  /// Button to close dialog
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// Sound effects toggle label
  ///
  /// In en, this message translates to:
  /// **'Sound Effects'**
  String get soundEffects;

  /// Haptic feedback toggle label
  ///
  /// In en, this message translates to:
  /// **'Haptic Feedback'**
  String get hapticFeedback;

  /// Previous question button label
  ///
  /// In en, this message translates to:
  /// **'Previous'**
  String get previous;

  /// Submit quiz button label
  ///
  /// In en, this message translates to:
  /// **'Submit Quiz'**
  String get submitQuiz;

  /// Next question button label
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// Review answers button label
  ///
  /// In en, this message translates to:
  /// **'Review Answers'**
  String get reviewAnswers;

  /// Try again button label
  ///
  /// In en, this message translates to:
  /// **'Try Again'**
  String get tryAgain;

  /// Finish button label
  ///
  /// In en, this message translates to:
  /// **'Finish'**
  String get finish;

  /// Error screen title
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get lessonDetailsError;

  /// Message when lesson is not found
  ///
  /// In en, this message translates to:
  /// **'Lesson not found'**
  String get lessonNotFound;

  /// Loading message for lesson
  ///
  /// In en, this message translates to:
  /// **'Loading lesson...'**
  String get loadingLesson;

  /// Error message when loading tasks fails
  ///
  /// In en, this message translates to:
  /// **'Error loading tasks: {error}'**
  String errorLoadingTasks(String error);

  /// Number of questions
  ///
  /// In en, this message translates to:
  /// **'{count} questions'**
  String questions(int count);

  /// Default resource title
  ///
  /// In en, this message translates to:
  /// **'Resource {number}'**
  String resource(int number);

  /// Question dialog title
  ///
  /// In en, this message translates to:
  /// **'Ask a question about this lesson'**
  String get askQuestionAboutLesson;

  /// Question input hint text
  ///
  /// In en, this message translates to:
  /// **'Type your question here...'**
  String get typeYourQuestionHere;

  /// Sending message text
  ///
  /// In en, this message translates to:
  /// **'Sending...'**
  String get sending;

  /// Send button label
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get send;

  /// Message when user needs to sign in to ask question
  ///
  /// In en, this message translates to:
  /// **'You must be signed in to ask a question.'**
  String get mustBeSignedInToAsk;

  /// Message when no admin is available
  ///
  /// In en, this message translates to:
  /// **'No admin available to receive your question.'**
  String get noAdminAvailable;

  /// Success message when question is sent
  ///
  /// In en, this message translates to:
  /// **'Your question has been sent to the admins!'**
  String get questionSentToAdmins;

  /// Created label
  ///
  /// In en, this message translates to:
  /// **'Created'**
  String get created;

  /// Updated label
  ///
  /// In en, this message translates to:
  /// **'Updated'**
  String get updated;

  /// Author label
  ///
  /// In en, this message translates to:
  /// **'Author'**
  String get author;

  /// Discussion label
  ///
  /// In en, this message translates to:
  /// **'Discussion'**
  String get discussion;

  /// Task label
  ///
  /// In en, this message translates to:
  /// **'Task'**
  String get task;

  /// Estimated time label
  ///
  /// In en, this message translates to:
  /// **'Estimated time'**
  String get estimatedTime;

  /// Incomplete tasks section title
  ///
  /// In en, this message translates to:
  /// **'Incomplete Tasks'**
  String get incompleteTasks;

  /// Message shown when there are no recent activities
  ///
  /// In en, this message translates to:
  /// **'No Recent Activities'**
  String get noRecentActivities;

  /// Message shown when there are no incomplete tasks
  ///
  /// In en, this message translates to:
  /// **'No Incomplete Tasks'**
  String get noIncompleteTasks;

  /// Message shown when all tasks are completed
  ///
  /// In en, this message translates to:
  /// **'All tasks completed! Great job!'**
  String get allTasksCompleted;

  /// Message shown when user hasn't started learning yet
  ///
  /// In en, this message translates to:
  /// **'Start learning to see your activities here'**
  String get startLearningToSeeActivities;

  /// Title for notification settings screen
  ///
  /// In en, this message translates to:
  /// **'Notification Settings'**
  String get notificationSettings;

  /// Header title for notification settings
  ///
  /// In en, this message translates to:
  /// **'Stay Motivated'**
  String get stayMotivated;

  /// Description for notification settings
  ///
  /// In en, this message translates to:
  /// **'Configure notifications to keep your learning streak alive and stay updated with new content.'**
  String get notificationSettingsDescription;

  /// Title for daily learning reminders section
  ///
  /// In en, this message translates to:
  /// **'Daily Learning Reminders'**
  String get dailyLearningReminders;

  /// Description for daily reminders
  ///
  /// In en, this message translates to:
  /// **'Get reminded to practice every day'**
  String get dailyRemindersDescription;

  /// Label for reminder time selector
  ///
  /// In en, this message translates to:
  /// **'Reminder Time'**
  String get reminderTime;

  /// Title for daily challenges section
  ///
  /// In en, this message translates to:
  /// **'Daily Challenges'**
  String get dailyChallenges;

  /// Description for daily challenges
  ///
  /// In en, this message translates to:
  /// **'Receive daily learning challenges'**
  String get dailyChallengesDescription;

  /// Label for challenge time selector
  ///
  /// In en, this message translates to:
  /// **'Challenge Time'**
  String get challengeTime;

  /// Title for achievements section
  ///
  /// In en, this message translates to:
  /// **'Achievements & Streaks'**
  String get achievementsAndStreaks;

  /// Description for achievements
  ///
  /// In en, this message translates to:
  /// **'Celebrate your learning milestones'**
  String get achievementsDescription;

  /// Title for new content section
  ///
  /// In en, this message translates to:
  /// **'New Content'**
  String get newContent;

  /// Description for new content
  ///
  /// In en, this message translates to:
  /// **'Get notified about new words and lessons'**
  String get newContentDescription;

  /// Title for streak reminders section
  ///
  /// In en, this message translates to:
  /// **'Streak Reminders'**
  String get streakReminders;

  /// Description for streak reminders
  ///
  /// In en, this message translates to:
  /// **'Warnings when your streak is at risk'**
  String get streakRemindersDescription;

  /// Title for test notifications section
  ///
  /// In en, this message translates to:
  /// **'Test Notifications'**
  String get testNotifications;

  /// Description for test notifications
  ///
  /// In en, this message translates to:
  /// **'Send test notifications to make sure everything is working correctly.'**
  String get testNotificationsDescription;

  /// Label for daily reminder test button
  ///
  /// In en, this message translates to:
  /// **'Daily Reminder'**
  String get dailyReminder;

  /// Label for achievement test button
  ///
  /// In en, this message translates to:
  /// **'Achievement'**
  String get achievement;

  /// Label for challenge test button
  ///
  /// In en, this message translates to:
  /// **'Challenge'**
  String get challenge;

  /// Label for manage all notifications button
  ///
  /// In en, this message translates to:
  /// **'Manage All Notifications'**
  String get manageAllNotifications;

  /// Title for daily learning reminder notification
  ///
  /// In en, this message translates to:
  /// **'Daily Learning Reminder'**
  String get dailyLearningReminderTitle;

  /// Description for daily learning reminder notification
  ///
  /// In en, this message translates to:
  /// **'Time for your daily language practice! Keep your streak alive.'**
  String get dailyLearningReminderDescription;

  /// Title for achievement unlocked notification
  ///
  /// In en, this message translates to:
  /// **'Achievement Unlocked! 🏆'**
  String get achievementUnlockedTitle;

  /// Description for achievement unlocked notification
  ///
  /// In en, this message translates to:
  /// **'Congratulations! You\'ve completed 7 days in a row. Streak Master badge earned!'**
  String get achievementUnlockedDescription;

  /// Title for new vocabulary notification
  ///
  /// In en, this message translates to:
  /// **'New Vocabulary Available'**
  String get newVocabularyTitle;

  /// Description for new vocabulary notification
  ///
  /// In en, this message translates to:
  /// **'25 new business English words have been added to your course.'**
  String get newVocabularyDescription;

  /// Title for daily challenge notification
  ///
  /// In en, this message translates to:
  /// **'Daily Challenge Ready'**
  String get dailyChallengeTitle;

  /// Description for daily challenge notification
  ///
  /// In en, this message translates to:
  /// **'Today\'s challenge: Practice pronunciation for 10 minutes!'**
  String get dailyChallengeDescription;

  /// Title for streak warning notification
  ///
  /// In en, this message translates to:
  /// **'Streak Warning ⚠️'**
  String get streakWarningTitle;

  /// Description for streak warning notification
  ///
  /// In en, this message translates to:
  /// **'Don\'t lose your 5-day streak! You have 3 hours left to practice.'**
  String get streakWarningDescription;

  /// Title for lesson completed notification
  ///
  /// In en, this message translates to:
  /// **'Lesson Completed'**
  String get lessonCompletedTitle;

  /// Description for lesson completed notification
  ///
  /// In en, this message translates to:
  /// **'Great job! You\'ve completed \"Basic Conversations\" lesson.'**
  String get lessonCompletedDescription;

  /// Title for weekly progress report notification
  ///
  /// In en, this message translates to:
  /// **'Weekly Progress Report'**
  String get weeklyProgressReportTitle;

  /// Description for weekly progress report notification
  ///
  /// In en, this message translates to:
  /// **'You\'ve studied for 3.5 hours this week. Keep up the great work!'**
  String get weeklyProgressReportDescription;

  /// Message shown when notification is deleted
  ///
  /// In en, this message translates to:
  /// **'Notification deleted'**
  String get notificationDeleted;

  /// Message shown when all notifications are marked as read
  ///
  /// In en, this message translates to:
  /// **'All notifications marked as read'**
  String get allNotificationsMarkedAsRead;

  /// Title for clear all notifications dialog
  ///
  /// In en, this message translates to:
  /// **'Clear All Notifications'**
  String get clearAllNotificationsDialogTitle;

  /// Content for clear all notifications dialog
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete all notifications? This action cannot be undone.'**
  String get clearAllNotificationsDialogContent;

  /// Message shown when all notifications are cleared
  ///
  /// In en, this message translates to:
  /// **'All notifications cleared'**
  String get clearAllNotifications;

  /// Label for clear all button
  ///
  /// In en, this message translates to:
  /// **'Clear All'**
  String get clearAll;

  /// Tooltip for mark all as read button
  ///
  /// In en, this message translates to:
  /// **'Mark all as read'**
  String get markAllAsRead;

  /// Text shown while loading notifications
  ///
  /// In en, this message translates to:
  /// **'Loading notifications...'**
  String get loadingNotifications;

  /// Title shown when there are no notifications
  ///
  /// In en, this message translates to:
  /// **'No Notifications'**
  String get noNotifications;

  /// Description shown when there are no notifications
  ///
  /// In en, this message translates to:
  /// **'You\'re all caught up! Check back later for new updates and achievements.'**
  String get noNotificationsDescription;

  /// Text showing unread notification count
  ///
  /// In en, this message translates to:
  /// **'{count} unread notifications'**
  String unreadNotifications(int count);

  /// Text for very recent timestamp
  ///
  /// In en, this message translates to:
  /// **'Just now'**
  String get justNow;

  /// Text for minutes ago timestamp
  ///
  /// In en, this message translates to:
  /// **'{minutes}m ago'**
  String minutesAgo(int minutes);

  /// Text for hours ago timestamp
  ///
  /// In en, this message translates to:
  /// **'{hours}h ago'**
  String hoursAgo(int hours);

  /// Text for days ago timestamp
  ///
  /// In en, this message translates to:
  /// **'{days}d ago'**
  String daysAgo(int days);

  /// Message shown when opening lessons from notification
  ///
  /// In en, this message translates to:
  /// **'Opening lessons...'**
  String get openingLessons;

  /// Message shown when opening achievements from notification
  ///
  /// In en, this message translates to:
  /// **'Opening achievements...'**
  String get openingAchievements;

  /// Message shown when opening new content from notification
  ///
  /// In en, this message translates to:
  /// **'Opening new content...'**
  String get openingNewContent;

  /// Message shown when opening challenges from notification
  ///
  /// In en, this message translates to:
  /// **'Opening challenges...'**
  String get openingChallenges;

  /// Message shown when opening practice from notification
  ///
  /// In en, this message translates to:
  /// **'Opening practice...'**
  String get openingPractice;

  /// Message shown when opening progress from notification
  ///
  /// In en, this message translates to:
  /// **'Opening progress...'**
  String get openingProgress;

  /// Message shown when opening analytics from notification
  ///
  /// In en, this message translates to:
  /// **'Opening analytics...'**
  String get openingAnalytics;

  /// Title for vocabulary goal setting screen
  ///
  /// In en, this message translates to:
  /// **'Set Vocabulary Goal'**
  String get setVocabularyGoal;

  /// Title for vocabulary goal section
  ///
  /// In en, this message translates to:
  /// **'Set Your Daily Vocabulary Goal'**
  String get vocabularyGoalTitle;

  /// Description for vocabulary goal setting
  ///
  /// In en, this message translates to:
  /// **'Choose how many new words you want to learn each day. This will help you stay motivated and track your progress.'**
  String get vocabularyGoalDescription;

  /// Title for goal preset selection
  ///
  /// In en, this message translates to:
  /// **'Choose a Goal Preset'**
  String get chooseGoalPreset;

  /// Label for custom target option
  ///
  /// In en, this message translates to:
  /// **'Custom Target'**
  String get customTarget;

  /// Label for custom target input field
  ///
  /// In en, this message translates to:
  /// **'Enter custom target'**
  String get enterCustomTarget;

  /// Hint for custom target input
  ///
  /// In en, this message translates to:
  /// **'e.g., 20'**
  String get customTargetHint;

  /// Label for words per day
  ///
  /// In en, this message translates to:
  /// **'words/day'**
  String get wordsPerDay;

  /// Button text for updating goal
  ///
  /// In en, this message translates to:
  /// **'Update Goal'**
  String get updateGoal;

  /// Button text for setting goal
  ///
  /// In en, this message translates to:
  /// **'Set Goal'**
  String get setGoal;

  /// Button text for deleting goal
  ///
  /// In en, this message translates to:
  /// **'Delete Goal'**
  String get deleteGoal;

  /// Label for current goal section
  ///
  /// In en, this message translates to:
  /// **'Current Goal'**
  String get currentGoal;

  /// Label for daily target
  ///
  /// In en, this message translates to:
  /// **'Daily Target'**
  String get dailyTarget;

  /// Label for words
  ///
  /// In en, this message translates to:
  /// **'words'**
  String get words;

  /// Label for progress
  ///
  /// In en, this message translates to:
  /// **'Progress'**
  String get progress;

  /// Message when goal is completed
  ///
  /// In en, this message translates to:
  /// **'Goal completed for today! 🎉'**
  String get goalCompleted;

  /// Text showing remaining words
  ///
  /// In en, this message translates to:
  /// **'{count} words remaining'**
  String remainingWords(int count);

  /// Error message for invalid target
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid number greater than 0'**
  String get invalidTarget;

  /// Success message when goal is set
  ///
  /// In en, this message translates to:
  /// **'Vocabulary goal set successfully!'**
  String get goalSetSuccessfully;

  /// Confirmation message for deleting goal
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete your vocabulary goal? This action cannot be undone.'**
  String get deleteGoalConfirmation;

  /// Button text for delete
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// Message when goal is deleted
  ///
  /// In en, this message translates to:
  /// **'Vocabulary goal deleted'**
  String get goalDeleted;

  /// Text shown while loading vocabulary goal
  ///
  /// In en, this message translates to:
  /// **'Loading goal...'**
  String get loadingGoal;

  /// Title when no vocabulary goal is set
  ///
  /// In en, this message translates to:
  /// **'No Vocabulary Goal Set'**
  String get noVocabularyGoal;

  /// Description for setting vocabulary goal
  ///
  /// In en, this message translates to:
  /// **'Set a daily vocabulary goal to track your learning progress and stay motivated.'**
  String get setGoalToTrackProgress;

  /// Title for daily vocabulary goal
  ///
  /// In en, this message translates to:
  /// **'Daily Vocabulary Goal'**
  String get dailyVocabularyGoal;

  /// Tooltip for edit goal button
  ///
  /// In en, this message translates to:
  /// **'Edit Goal'**
  String get editGoal;

  /// Button text for learning words
  ///
  /// In en, this message translates to:
  /// **'Learn Words'**
  String get learnWords;

  /// Button text for adding words
  ///
  /// In en, this message translates to:
  /// **'Add Words'**
  String get addWords;

  /// Congratulations message when goal is completed
  ///
  /// In en, this message translates to:
  /// **'Congratulations! You\'ve completed your daily vocabulary goal! 🎉'**
  String get congratulationsGoalCompleted;

  /// Title for manual word addition dialog
  ///
  /// In en, this message translates to:
  /// **'Add Words Manually'**
  String get addWordsManually;

  /// Question for manual word addition
  ///
  /// In en, this message translates to:
  /// **'How many words did you learn today?'**
  String get howManyWordsLearned;

  /// Label for number of words input
  ///
  /// In en, this message translates to:
  /// **'Number of words'**
  String get numberOfWords;

  /// Button text for add action
  ///
  /// In en, this message translates to:
  /// **'Add'**
  String get add;

  /// Shown when there is no vocabulary progress
  ///
  /// In en, this message translates to:
  /// **'No vocabulary progress yet'**
  String get noVocabularyProgress;

  /// Prompt to start learning words for progress
  ///
  /// In en, this message translates to:
  /// **'Start learning words to see your progress here'**
  String get startLearningWords;

  /// Section title for vocabulary progress
  ///
  /// In en, this message translates to:
  /// **'Vocabulary Progress'**
  String get vocabularyProgress;

  /// Total words stat label
  ///
  /// In en, this message translates to:
  /// **'Total Words'**
  String get totalWords;

  /// Accuracy stat label
  ///
  /// In en, this message translates to:
  /// **'Accuracy'**
  String get accuracy;

  /// Favorites stat label
  ///
  /// In en, this message translates to:
  /// **'Favorites'**
  String get favorites;

  /// Shown when there is no pronunciation practice
  ///
  /// In en, this message translates to:
  /// **'No pronunciation practice yet'**
  String get noPronunciationPractice;

  /// Prompt to start practicing pronunciation for progress
  ///
  /// In en, this message translates to:
  /// **'Start practicing pronunciation to see your progress here'**
  String get startPracticingPronunciation;

  /// Section title for pronunciation progress
  ///
  /// In en, this message translates to:
  /// **'Pronunciation Progress'**
  String get pronunciationProgress;

  /// Total attempts stat label
  ///
  /// In en, this message translates to:
  /// **'Total Attempts'**
  String get totalAttempts;

  /// Success rate stat label
  ///
  /// In en, this message translates to:
  /// **'Success Rate'**
  String get successRate;

  /// Average accuracy stat label
  ///
  /// In en, this message translates to:
  /// **'Avg Accuracy'**
  String get avgAccuracy;

  /// Best accuracy stat label
  ///
  /// In en, this message translates to:
  /// **'Best Accuracy'**
  String get bestAccuracy;

  /// Average confidence stat label
  ///
  /// In en, this message translates to:
  /// **'Avg Confidence'**
  String get avgConfidence;

  /// Words practiced stat label
  ///
  /// In en, this message translates to:
  /// **'Words Practiced'**
  String get wordsPracticed;

  /// Recent practice section title
  ///
  /// In en, this message translates to:
  /// **'Recent Practice'**
  String get recentPractice;

  /// Recent activity section title
  ///
  /// In en, this message translates to:
  /// **'Recent Activity'**
  String get recentActivity;

  /// Recent activities section title
  ///
  /// In en, this message translates to:
  /// **'Recent Activities'**
  String get recentActivities;

  /// Label for needs practice pronunciation accuracy
  ///
  /// In en, this message translates to:
  /// **'Needs Practice'**
  String get needsPractice;

  /// Section title for user goals
  ///
  /// In en, this message translates to:
  /// **'Your Goals'**
  String get yourGoals;

  /// Section title for course progress
  ///
  /// In en, this message translates to:
  /// **'Course Progress'**
  String get courseProgress;

  /// All time filter label
  ///
  /// In en, this message translates to:
  /// **'All Time'**
  String get allTime;

  /// This week filter label
  ///
  /// In en, this message translates to:
  /// **'This Week'**
  String get thisWeek;

  /// This month filter label
  ///
  /// In en, this message translates to:
  /// **'This Month'**
  String get thisMonth;

  /// Last 30 days filter label
  ///
  /// In en, this message translates to:
  /// **'Last 30 Days'**
  String get last30Days;

  /// Prompt to sign in to view progress
  ///
  /// In en, this message translates to:
  /// **'Please sign in to view your progress'**
  String get pleaseSignInToViewProgress;

  /// Learning progress section title
  ///
  /// In en, this message translates to:
  /// **'Learning Progress'**
  String get learningProgress;

  /// Tab title for vocabulary and pronunciation
  ///
  /// In en, this message translates to:
  /// **'Vocabulary & Pronunciation'**
  String get vocabularyAndPronunciation;

  /// Completed stat label
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get completed;

  /// Daily study stat label
  ///
  /// In en, this message translates to:
  /// **'Daily Study'**
  String get dailyStudy;

  /// Lessons completed stat label
  ///
  /// In en, this message translates to:
  /// **'Lessons Completed'**
  String get lessonsCompleted;

  /// First lesson achievement title
  ///
  /// In en, this message translates to:
  /// **'First Lesson'**
  String get firstLesson;

  /// Achievement description for first lesson
  ///
  /// In en, this message translates to:
  /// **'Completed your first lesson!'**
  String get completedFirstLesson;

  /// Three day streak achievement title
  ///
  /// In en, this message translates to:
  /// **'3 Day Streak'**
  String get threeDayStreak;

  /// Achievement description for three day streak
  ///
  /// In en, this message translates to:
  /// **'Studied 3 days in a row!'**
  String get studiedThreeDays;

  /// Encouragement message for progress
  ///
  /// In en, this message translates to:
  /// **'Keep up the great work! You\'re making excellent progress.'**
  String get keepUpGreatWork;

  /// Learning analytics section title
  ///
  /// In en, this message translates to:
  /// **'Learning Analytics'**
  String get learningAnalytics;

  /// Time range filter label
  ///
  /// In en, this message translates to:
  /// **'Time Range'**
  String get timeRange;

  /// Category filter label
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get category;

  /// Vocabulary words stat label
  ///
  /// In en, this message translates to:
  /// **'Vocabulary Words'**
  String get vocabularyWords;

  /// Pronunciation attempts stat label
  ///
  /// In en, this message translates to:
  /// **'Pronunciation Attempts'**
  String get pronunciationAttempts;

  /// Vocabulary accuracy stat label
  ///
  /// In en, this message translates to:
  /// **'Vocabulary Accuracy'**
  String get vocabularyAccuracy;

  /// Pronunciation accuracy stat label
  ///
  /// In en, this message translates to:
  /// **'Pronunciation Accuracy'**
  String get pronunciationAccuracy;

  /// Progress trends section title
  ///
  /// In en, this message translates to:
  /// **'Progress Trends'**
  String get progressTrends;

  /// Section title for vocabulary vs pronunciation progress
  ///
  /// In en, this message translates to:
  /// **'Vocabulary vs Pronunciation Progress'**
  String get vocabVsPronunciation;

  /// Label for the first attempt date in pronunciation progress
  ///
  /// In en, this message translates to:
  /// **'First Attempt'**
  String get firstAttempt;

  /// Label for the last attempt date in pronunciation progress
  ///
  /// In en, this message translates to:
  /// **'Last Attempt'**
  String get lastAttempt;

  /// Label for common mistakes in pronunciation progress
  ///
  /// In en, this message translates to:
  /// **'Common Mistakes'**
  String get commonMistakes;

  /// Label for word frequency in pronunciation progress
  ///
  /// In en, this message translates to:
  /// **'Word Frequency'**
  String get wordFrequency;

  /// Label for good pronunciation accuracy
  ///
  /// In en, this message translates to:
  /// **'Good'**
  String get good;

  /// Label for number of attempts in pronunciation progress
  ///
  /// In en, this message translates to:
  /// **'attempts'**
  String get attempts;

  /// Label for success rate in pronunciation progress
  ///
  /// In en, this message translates to:
  /// **'success'**
  String get success;

  /// Label for great job
  ///
  /// In en, this message translates to:
  /// **'Great Job!'**
  String get greatJob;

  /// Label for you've been learning for another 10 minutes keep it up
  ///
  /// In en, this message translates to:
  /// **'You\'ve been learning for another 10 minutes! Keep it up! 🎉'**
  String get youveBeenLearningForAnother10MinutesKeepItUp;

  /// Label for thanks
  ///
  /// In en, this message translates to:
  /// **'Thanks!'**
  String get thanks;

  /// Label for goal achieved
  ///
  /// In en, this message translates to:
  /// **'Goal Achieved!'**
  String get goalAchieved;

  /// Label for congratulations you have reached your daily vocabulary goal would you like to set a new one
  ///
  /// In en, this message translates to:
  /// **'Congratulations! You have reached your daily vocabulary goal. Would you like to set a new one?'**
  String
      get congratulationsYouHaveReachedYourDailyVocabularyGoalWouldYouLikeToSetANewOne;

  /// Label for not now
  ///
  /// In en, this message translates to:
  /// **'Not Now'**
  String get notNow;

  /// Label for set new goal
  ///
  /// In en, this message translates to:
  /// **'Set New Goal'**
  String get setNewGoal;

  /// Snackbar message for failed favorite update
  ///
  /// In en, this message translates to:
  /// **'Failed to update favorite status'**
  String get failedToUpdateFavoriteStatus;

  /// Snackbar message for adding to favorites
  ///
  /// In en, this message translates to:
  /// **'Added to favorites!'**
  String get addedToFavorites;

  /// Snackbar message for removing from favorites
  ///
  /// In en, this message translates to:
  /// **'Removed from favorites'**
  String get removedFromFavorites;

  /// Snackbar message for progress tracking unavailable
  ///
  /// In en, this message translates to:
  /// **'Progress tracking temporarily unavailable'**
  String get progressTrackingTemporarilyUnavailable;

  /// Snackbar message for successful vocabulary progress test
  ///
  /// In en, this message translates to:
  /// **'Vocabulary progress test successful! Check console for details.'**
  String get vocabularyProgressTestSuccessfulCheckConsoleForDetails;

  /// Snackbar message for failed vocabulary progress test
  ///
  /// In en, this message translates to:
  /// **'Vocabulary progress test failed'**
  String get vocabularyProgressTestFailed;

  /// Dialog title for word pronunciation practice
  ///
  /// In en, this message translates to:
  /// **'Word Pronunciation Practice'**
  String get wordPronunciationPractice;

  /// Error message for loading pronunciation practice
  ///
  /// In en, this message translates to:
  /// **'Unable to load pronunciation practice'**
  String get unableToLoadPronunciationPractice;

  /// Generic error message for retry
  ///
  /// In en, this message translates to:
  /// **'Please try again later.'**
  String get pleaseTryAgainLater;

  /// Snackbar message for missing example sentence
  ///
  /// In en, this message translates to:
  /// **'No example sentence available for this word.'**
  String get noExampleSentenceAvailableForThisWord;

  /// Dialog title for sentence pronunciation practice
  ///
  /// In en, this message translates to:
  /// **'Sentence Pronunciation Practice'**
  String get sentencePronunciationPractice;

  /// Label for example sentence context
  ///
  /// In en, this message translates to:
  /// **'Example sentence for'**
  String get exampleSentenceFor;

  /// Error message for loading sentence pronunciation practice
  ///
  /// In en, this message translates to:
  /// **'Unable to load sentence pronunciation practice'**
  String get unableToLoadSentencePronunciationPractice;

  /// Dialog congratulation message for word pronunciation
  ///
  /// In en, this message translates to:
  /// **'Awesome! 🎉'**
  String get awesome;

  /// Encouragement message after correct word pronunciation
  ///
  /// In en, this message translates to:
  /// **'Great pronunciation! Keep practicing and you\'ll master this word.'**
  String get greatPronunciationKeepPracticingAndYoullMasterThisWord;

  /// Label for best pronunciation accuracy
  ///
  /// In en, this message translates to:
  /// **'Your Best Accuracy:'**
  String get yourBestAccuracy;

  /// Label for average value
  ///
  /// In en, this message translates to:
  /// **'Average'**
  String get average;

  /// Button label for next word
  ///
  /// In en, this message translates to:
  /// **'Next Word'**
  String get nextWord;

  /// Dialog congratulation message for sentence pronunciation
  ///
  /// In en, this message translates to:
  /// **'Excellent! 🎊'**
  String get excellent;

  /// Encouragement message after correct sentence pronunciation
  ///
  /// In en, this message translates to:
  /// **'Great sentence pronunciation! Keep practicing and you\'ll sound like a native.'**
  String get greatSentencePronunciationKeepPracticingAndYoullSoundLikeANative;

  /// Notification title for learning session
  ///
  /// In en, this message translates to:
  /// **'Learning Session in Progress 📚'**
  String get learningSessionInProgress;

  /// Label for current word in notification
  ///
  /// In en, this message translates to:
  /// **'Current word'**
  String get currentWord;

  /// Notification message for study reminder
  ///
  /// In en, this message translates to:
  /// **'Time to practice your vocabulary! Keep your learning streak alive.'**
  String get timeToPracticeYourVocabularyKeepYourLearningStreakAlive;

  /// Snackbar message for session start
  ///
  /// In en, this message translates to:
  /// **'Learning session started! Check your notifications.'**
  String get learningSessionStartedCheckYourNotifications;

  /// Screen title for vocabulary builder
  ///
  /// In en, this message translates to:
  /// **'Vocabulary Builder'**
  String get vocabularyBuilder;

  /// Tooltip for test firebase connection button
  ///
  /// In en, this message translates to:
  /// **'Test Firebase Connection'**
  String get testFirebaseConnection;

  /// Tooltip for search button
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get search;

  /// Tooltip for favorite toggle button
  ///
  /// In en, this message translates to:
  /// **'Toggle favorite'**
  String get toggleFavorite;

  /// Hint text for search bar
  ///
  /// In en, this message translates to:
  /// **'Search words or meanings...'**
  String get searchWordsOrMeanings;

  /// Prompt to set daily vocabulary goal
  ///
  /// In en, this message translates to:
  /// **'Set Your Daily Vocabulary Goal'**
  String get setYourDailyVocabularyGoal;

  /// Description for daily goal prompt
  ///
  /// In en, this message translates to:
  /// **'Track your progress and stay motivated by setting a daily vocabulary goal.'**
  String get trackYourProgressAndStayMotivatedBySettingADailyVocabularyGoal;

  /// Label for today's goal
  ///
  /// In en, this message translates to:
  /// **'Today\'s Goal'**
  String get todaysGoal;

  /// Tooltip for pronunciation button
  ///
  /// In en, this message translates to:
  /// **'Practice pronunciation'**
  String get practicePronunciation;

  /// Label for meaning section
  ///
  /// In en, this message translates to:
  /// **'Meaning'**
  String get meaning;

  /// Button label for practiced word
  ///
  /// In en, this message translates to:
  /// **'Word Practiced'**
  String get wordPracticed;

  /// Button label for practicing word
  ///
  /// In en, this message translates to:
  /// **'Practice Word'**
  String get practiceWord;

  /// Label for example section
  ///
  /// In en, this message translates to:
  /// **'Example'**
  String get example;

  /// Button label for practiced sentence
  ///
  /// In en, this message translates to:
  /// **'Sentence Practiced'**
  String get sentencePracticed;

  /// Button label for practicing sentence
  ///
  /// In en, this message translates to:
  /// **'Practice Sentence'**
  String get practiceSentence;

  /// Label for example meaning section
  ///
  /// In en, this message translates to:
  /// **'Example Meaning'**
  String get exampleMeaning;

  /// Label for usage frequency section
  ///
  /// In en, this message translates to:
  /// **'Usage Frequency'**
  String get usageFrequency;

  /// Button label for random word
  ///
  /// In en, this message translates to:
  /// **'Random'**
  String get random;

  /// Button label for hide answer
  ///
  /// In en, this message translates to:
  /// **'Hide'**
  String get hide;

  /// Button label for reveal answer
  ///
  /// In en, this message translates to:
  /// **'Reveal'**
  String get reveal;

  /// Frequency description very high
  ///
  /// In en, this message translates to:
  /// **'Very commonly used in everyday English'**
  String get veryCommonlyUsedInEverydayEnglish;

  /// Frequency description high
  ///
  /// In en, this message translates to:
  /// **'Frequently used in English'**
  String get frequentlyUsedInEnglish;

  /// Frequency description medium
  ///
  /// In en, this message translates to:
  /// **'Moderately used in English'**
  String get moderatelyUsedInEnglish;

  /// Frequency description low
  ///
  /// In en, this message translates to:
  /// **'Occasionally used in English'**
  String get occasionallyUsedInEnglish;

  /// Frequency description very low
  ///
  /// In en, this message translates to:
  /// **'Rarely used in English'**
  String get rarelyUsedInEnglish;

  /// Label for your progress section
  ///
  /// In en, this message translates to:
  /// **'Your Progress'**
  String get yourProgress;

  /// Label for views stat
  ///
  /// In en, this message translates to:
  /// **'Views'**
  String get views;

  /// Label for correct stat
  ///
  /// In en, this message translates to:
  /// **'Correct'**
  String get correct;

  /// Label for common stat
  ///
  /// In en, this message translates to:
  /// **'Common'**
  String get common;

  /// Label for uncommon stat
  ///
  /// In en, this message translates to:
  /// **'Uncommon'**
  String get uncommon;

  /// Label for very common stat
  ///
  /// In en, this message translates to:
  /// **'Very Common'**
  String get veryCommon;

  /// Label for rare stat
  ///
  /// In en, this message translates to:
  /// **'Rare'**
  String get rare;

  /// Label for viewed stat
  ///
  /// In en, this message translates to:
  /// **'Viewed'**
  String get viewed;

  /// Label for correct answers stat
  ///
  /// In en, this message translates to:
  /// **'Correct Answers'**
  String get correctAnswers;

  /// No description provided for @microphonePermissionRequired.
  ///
  /// In en, this message translates to:
  /// **'Microphone permission is required for speech recognition.'**
  String get microphonePermissionRequired;

  /// Error message when speech recognition is not available
  ///
  /// In en, this message translates to:
  /// **'Speech recognition not available. Please check microphone permissions.'**
  String get speechRecognitionNotAvailable;

  /// Error message when failing to start listening for speech recognition
  ///
  /// In en, this message translates to:
  /// **'Failed to start listening. Please try again.'**
  String get failedToStartListening;

  /// Error message when there is a problem starting speech recognition
  ///
  /// In en, this message translates to:
  /// **'Error starting speech recognition.'**
  String get errorStartingSpeechRecognition;

  /// Error message when pronunciation evaluation fails
  ///
  /// In en, this message translates to:
  /// **'Error evaluating pronunciation. Please try again.'**
  String get errorEvaluatingPronunciation;

  /// Message for perfect sentence pronunciation result
  ///
  /// In en, this message translates to:
  /// **'Perfect sentence pronunciation! Excellent fluency!'**
  String get perfectSentencePronunciation;

  /// Message for great sentence pronunciation result
  ///
  /// In en, this message translates to:
  /// **'Great sentence pronunciation! Very natural flow.'**
  String get greatSentencePronunciation;

  /// Message for good sentence pronunciation result
  ///
  /// In en, this message translates to:
  /// **'Good sentence pronunciation! Keep practicing for better fluency.'**
  String get goodSentencePronunciation;

  /// Message for not quite correct sentence pronunciation
  ///
  /// In en, this message translates to:
  /// **'Not quite right. Listen to the sentence again and practice the rhythm.'**
  String get notQuiteRight;

  /// Label for poor result or quality
  ///
  /// In en, this message translates to:
  /// **'Poor'**
  String get poor;

  /// Label for very high value or score
  ///
  /// In en, this message translates to:
  /// **'Very High'**
  String get veryHigh;

  /// Label for high value or score
  ///
  /// In en, this message translates to:
  /// **'High'**
  String get high;

  /// Label for medium value or score
  ///
  /// In en, this message translates to:
  /// **'Medium'**
  String get medium;

  /// Button label to practice the current sentence
  ///
  /// In en, this message translates to:
  /// **'Practice This Sentence'**
  String get practiceThisSentence;

  /// Status message when the app is listening for speech
  ///
  /// In en, this message translates to:
  /// **'Listening...'**
  String get listening;

  /// Status message when the app is ready to listen for speech
  ///
  /// In en, this message translates to:
  /// **'Ready to listen'**
  String get readyToListen;

  /// Label for displaying what the user said
  ///
  /// In en, this message translates to:
  /// **'You said:'**
  String get youSaid;

  /// Prompt to start speaking for live transcription
  ///
  /// In en, this message translates to:
  /// **'Start speaking to see your words here...'**
  String get startSpeakingToSeeYourWordsHere;

  /// Label for live transcription section
  ///
  /// In en, this message translates to:
  /// **'Live transcription'**
  String get liveTranscription;

  /// Button label to stop an action (e.g., recording)
  ///
  /// In en, this message translates to:
  /// **'Stop'**
  String get stop;

  /// Button label to start speaking
  ///
  /// In en, this message translates to:
  /// **'Start Speaking'**
  String get startSpeaking;

  /// Label for similarity score/statistic
  ///
  /// In en, this message translates to:
  /// **'Similarity'**
  String get similarity;

  /// Label for confidence score/statistic
  ///
  /// In en, this message translates to:
  /// **'Confidence'**
  String get confidence;

  /// Button label for continue action
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get continueText;

  /// Label for new words section or stat
  ///
  /// In en, this message translates to:
  /// **'New words'**
  String get newWords;

  /// Label for goal section or stat
  ///
  /// In en, this message translates to:
  /// **'Goal'**
  String get goal;

  /// Label for remaining items/stat
  ///
  /// In en, this message translates to:
  /// **'Remaining'**
  String get remaining;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
