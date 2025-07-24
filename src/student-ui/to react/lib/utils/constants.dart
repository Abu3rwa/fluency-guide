const String GEMINI_API_KEY = "AIzaSyChgJBha7WC-9ovDf3c1bDQ4vwOFKgKbiM";

class Constants {
  // export GEMINI_API_KEY="AIzaSyChgJBha7WC-9ovDf3c1bDQ4vwOFKgKbiM"
  // $env:GEMINI_API_KEY="AIzaSyChgJBha7WC-9ovDf3c1bDQ4vwOFKgKbiM"
  static const String geminiApiKey = 'AIzaSyChgJBha7WC-9ovDf3c1bDQ4vwOFKgKbiM';
  static const String appName = 'English Fluency Guide';
  static const String logoPath = 'assets/images/logo.png';
  static const String launchIconPath = 'assets/images/launch_icon.png';

  // Audio asset paths
  static const String audioClockTicking = 'assets/audios/clock-ticking.mp3';
  static const String audioCorrect = 'assets/audios/correct.mp3';
  static const String audioIncorrect = 'assets/audios/incorrect.mp3';

  // SharedPreferences keys
  static const String prefsLocale = 'locale';
  static const String prefsThemeMode = 'theme_mode';
  static const String prefsUserId = 'user_id';

  // Firestore collection names
  static const String usersCollection = 'users';
  static const String coursesCollection = 'courses';
  static const String lessonsCollection = 'lessons';
  static const String achievementsCollection = 'achievements';
  static const String modulesCollection = 'modules';
  static const String tasksCollection = 'tasks';
  static const String messagesCollection = 'messages';

  // Other constants
  static const int defaultDailyGoal = 10;
  static const int maxUsernameLength = 20;
}
