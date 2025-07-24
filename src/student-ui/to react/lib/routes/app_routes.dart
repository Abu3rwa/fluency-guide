import 'package:englishfluencyguide/screens/admin/vocabulary_upload_screen.dart';
import 'package:englishfluencyguide/screens/hard_words_screen.dart';
import 'package:englishfluencyguide/screens/tasks/multiple_choice/multiple_choice_screen.dart';
import 'package:englishfluencyguide/screens/tasks/fill_in_the_blank_quiz_screen.dart';
import '../screens/tasks/true_false/true_false_quiz_screen.dart';
import 'package:flutter/material.dart';
import '../screens/home_screen.dart';
import '../screens/auth/auth_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/onboarding_screen.dart';
import '../screens/courses_screen.dart';
import '../screens/progress_screen.dart';
import '../screens/course_details_screen.dart';
import '../screens/lesson_details_screen.dart';
import '../../../../../migrate/lib/models/course_model.dart';
import '../screens/messages/messages_screen.dart';
// import '../screens/achievements/achievements_screen.dart';
import '../screens/messages/messages_list_screen.dart';
import '../screens/vocabulary_building/vocabulary_building_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/notifications/notification_settings_screen.dart';
import '../screens/vocabulary_goal_setting_screen.dart';
import '../screens/listening/listening_practice_screen.dart';

class AppRoutes {
  static const String home = '/home';
  static const String auth = '/auth';
  static const String profile = '/profile';
  static const String settings = '/settings';
  static const String onboarding = '/onboarding';
  static const String courses = '/courses';
  static const String progress = '/progress';
  static const String courseDetails = '/course_details';
  static const String lessonDetails = '/lesson-details';
  static const String taskDetails = '/task-details';
  static const String taskView = '/task-view';
  static const String trueFalse = '/trueFalse';
  static const String fillInTheBlank = '/fillInBlanks';
  static const String messages = '/messages';
  static const String messaging = '/messaging';
  static const String achievements = '/achievements';
  static const String multipleChoice = '/multipleChoice';
  static const String messagesList = '/messagesList';
  static const String vocabulary = '/vocabulary';
  static const String grammar = '/grammar';
  static const String pronunciation = '/pronunciation';
  static const String listening = '/listening';
  static const String speaking = '/speaking';
  static const String conversation = '/conversation';
  static const String notifications = '/notifications';
  static const String notificationSettings = '/notificationSettings';
  static const String vocabularyGoalSetting = '/vocabularyGoalSetting';
  static const String vocabularyUpload = '/vocabularyUpload';
  static const String hardWords = '/hardWords';

  static const String listeningPractice = '/listening-practice';

  static Map<String, WidgetBuilder> get routes => {
        home: (context) => const HomeScreen(),
        auth: (context) => const AuthScreen(),
        profile: (context) => const ProfileScreen(),
        settings: (context) => const SettingsScreen(),
        onboarding: (context) => const OnboardingScreen(),
        courses: (context) => const CoursesScreen(),
        progress: (context) => const ProgressScreen(),
        messages: (context) => const MessagesScreen(),
        // achievements: (context) => const AchievementsScreen(),
        messagesList: (context) => const MessagesListScreen(),
        vocabulary: (context) => const VocabularyBuildingScreen(),
        notifications: (context) => const NotificationsScreen(),
        notificationSettings: (context) => const NotificationSettingsScreen(),
        vocabularyGoalSetting: (context) => const VocabularyGoalSettingScreen(),
        vocabularyUpload: (context) => const VocabularyUploadScreen(),
        listeningPractice: (context) => const ListeningPracticeScreen(),
        hardWords: (context) => HardWordsScreen()
        // messaging: (context) => const MessagingScreen(),
      };

  static Route<dynamic>? onGenerateRoute(RouteSettings settings) {
    if (settings.name == courseDetails) {
      final course = settings.arguments as CourseModel;
      return MaterialPageRoute(
        builder: (context) => CourseDetailsScreen(course: course),
      );
    } else if (settings.name == lessonDetails) {
      final args = settings.arguments as Map<String, String>;
      return MaterialPageRoute(
        builder: (_) => LessonDetailsScreen(
          lessonId: args['lessonId']!,
          moduleId: args['moduleId']!,
          courseId: args['courseId']!,
        ),
      );
    } else if (settings.name == taskDetails) {
      final args = settings.arguments as Map<String, dynamic>;
      final taskId = args['taskId'] as String;
      final lessonId = args['lessonId'] as String?;

      if (lessonId != null) {
        return MaterialPageRoute(
          builder: (_) => LessonDetailsScreen(
            lessonId: lessonId,
            moduleId: '', // This would need to be passed from the activity
            courseId: '', // This would need to be passed from the activity
          ),
        );
      }
      // Fallback to courses screen if no lesson ID
      return MaterialPageRoute(
        builder: (_) => const CoursesScreen(),
      );
    } else if (settings.name == trueFalse) {
      final args = settings.arguments as Map<String, dynamic>;
      return MaterialPageRoute(
        builder: (_) => TrueFalseQuizScreen(taskId: args['taskId']),
      );
    } else if (settings.name == fillInTheBlank) {
      final args = settings.arguments as Map<String, dynamic>;
      return MaterialPageRoute(
        builder: (_) => FillInTheBlankQuizScreen(taskId: args['taskId']),
      );
    } else if (settings.name == multipleChoice) {
      final args = settings.arguments as Map<String, dynamic>;
      return MaterialPageRoute(
        builder: (_) => MultipleChoiceScreen(taskId: args['taskId']),
      );
    }
    return null;
  }

  static Route<dynamic> onUnknownRoute(RouteSettings settings) {
    return MaterialPageRoute(
      builder: (context) => Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                'Page not found',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'No route defined for ${settings.name}',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
