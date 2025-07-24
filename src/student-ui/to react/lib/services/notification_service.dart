import 'package:awesome_notifications/awesome_notifications.dart';
import 'package:englishfluencyguide/routes/app_routes.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz;

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  // Global navigator key for navigation from notifications
  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();

  // Beautiful gradient colors for different notification types
  static const Map<String, List<Color>> _gradientColors = {
    'basic_channel': [Color(0xFF667eea), Color(0xFF764ba2)],
    'daily_reminder': [Color(0xFF6C63FF), Color(0xFF8B5CF6)],
    'achievements': [Color(0xFFFFB800), Color(0xFFFF8A00)],
    'new_content': [Color(0xFF00BFA5), Color(0xFF00D4AA)],
    'daily_challenge': [Color(0xFFE91E63), Color(0xFFF50057)],
    'streak': [Color(0xFFFF6B35), Color(0xFFFF8E53)],
    'pronunciation': [Color(0xFF4CAF50), Color(0xFF66BB6A)],
    'learning': [Color(0xFF2196F3), Color(0xFF42A5F5)],
  };

  /// Initialize the notification service
  static Future<void> initialize() async {
    // Initialize timezone data
    tz.initializeTimeZones();

    // Define notification channels with beautiful styling
    final channels = [
      // Basic Channel for Firebase messages
      NotificationChannel(
        channelKey: 'basic_channel',
        channelName: 'Basic Notifications',
        channelDescription: 'Basic notification channel for app messages',
        defaultColor: const Color(0xFF667eea),
        ledColor: const Color(0xFF667eea),
        channelShowBadge: true,
        importance: NotificationImportance.Default,
        defaultRingtoneType: DefaultRingtoneType.Notification,
        enableVibration: true,
        playSound: true,
        enableLights: true,
        ledOnMs: 1000,
        ledOffMs: 500,
      ),

      // Daily Reminder Channel
      NotificationChannel(
        channelKey: 'daily_reminder',
        channelName: 'Daily Learning Reminders',
        channelDescription: 'Daily reminders for language learning sessions',
        defaultColor: const Color(0xFF6C63FF),
        ledColor: const Color(0xFF6C63FF),
        channelShowBadge: true,
        importance: NotificationImportance.High,
        defaultRingtoneType: DefaultRingtoneType.Notification,
        enableVibration: true,
        playSound: true,
        enableLights: true,
        ledOnMs: 800,
        ledOffMs: 400,
      ),

      // Achievement Channel
      NotificationChannel(
        channelKey: 'achievements',
        channelName: 'Achievements & Streaks',
        channelDescription:
            'Notifications for achievements and learning streaks',
        defaultColor: const Color(0xFFFFB800),
        ledColor: const Color(0xFFFFB800),
        channelShowBadge: true,
        importance: NotificationImportance.High,
        defaultRingtoneType: DefaultRingtoneType.Notification,
        enableVibration: true,
        playSound: true,
        enableLights: true,
        ledOnMs: 600,
        ledOffMs: 300,
      ),

      // New Content Channel
      NotificationChannel(
        channelKey: 'new_content',
        channelName: 'New Content',
        channelDescription:
            'Notifications for new words, lessons, and challenges',
        defaultColor: const Color(0xFF00BFA5),
        ledColor: const Color(0xFF00BFA5),
        channelShowBadge: true,
        importance: NotificationImportance.Default,
        defaultRingtoneType: DefaultRingtoneType.Notification,
        enableVibration: false,
        playSound: true,
        enableLights: true,
        ledOnMs: 1200,
        ledOffMs: 600,
      ),

      // Challenge Channel
      NotificationChannel(
        channelKey: 'daily_challenge',
        channelName: 'Daily Challenges',
        channelDescription: 'Daily language learning challenges',
        defaultColor: const Color(0xFFE91E63),
        ledColor: const Color(0xFFE91E63),
        channelShowBadge: true,
        importance: NotificationImportance.High,
        defaultRingtoneType: DefaultRingtoneType.Notification,
        enableVibration: true,
        playSound: true,
        enableLights: true,
        ledOnMs: 500,
        ledOffMs: 250,
      ),
    ];

    // Initialize Awesome Notifications with custom logo
    await AwesomeNotifications().initialize(
      // Remove the custom icon path to use default initialization
      null, // Use null instead of 'assets/images/logo.png'
      channels,
      debug: true,
    );

    // Request notification permissions
    await requestNotificationPermissions();

    debugPrint('Notification service initialized successfully');
  }

  /// Request notification permissions from user
  static Future<bool> requestNotificationPermissions() async {
    // Request basic notification permission
    bool isAllowed = await AwesomeNotifications().isNotificationAllowed();

    if (!isAllowed) {
      isAllowed =
          await AwesomeNotifications().requestPermissionToSendNotifications();
    }

    // For Android 13+, request POST_NOTIFICATIONS permission
    if (!isAllowed) {
      final status = await Permission.notification.request();
      isAllowed = status == PermissionStatus.granted;
    }

    return isAllowed;
  }

  /// Get beautiful emoji for different notification types
  static String _getNotificationEmoji(String type) {
    switch (type.toLowerCase()) {
      case 'daily_reminder':
        return '🌟';
      case 'achievement':
        return '🏆';
      case 'streak':
        return '🔥';
      case 'challenge':
        return '🎯';
      case 'new_content':
        return '✨';
      case 'pronunciation':
        return '🗣️';
      case 'learning':
        return '📚';
      case 'practice':
        return '💪';
      case 'reminder':
        return '⏰';
      case 'download':
        return '📥';
      case 'study':
        return '🎓';
      default:
        return '📱';
    }
  }

  /// Get beautiful motivational messages
  static String _getMotivationalMessage(String type) {
    final messages = {
      'daily_reminder': [
        "Time to shine with your daily language practice! ✨",
        "Your future self will thank you for this practice! 🌟",
        "Every word learned brings you closer to fluency! 🚀",
        "Let's make today's learning session amazing! 💫",
        "Your dedication to learning is inspiring! 🌈",
      ],
      'achievement': [
        "Congratulations! You're absolutely crushing it! 🎉",
        "Another milestone reached! You're unstoppable! ⚡",
        "Your hard work is paying off beautifully! 🌟",
        "You're becoming a language learning legend! 👑",
        "This achievement proves your dedication! 💎",
      ],
      'streak': [
        "Your streak is on fire! Keep it burning! 🔥",
        "Consistency is your superpower! 💪",
        "You're building an incredible learning habit! 🌱",
        "Every day counts, and you're showing up! ⭐",
        "Your commitment is absolutely inspiring! 🌟",
      ],
      'challenge': [
        "Ready to conquer today's challenge? 🎯",
        "This challenge is no match for your skills! ⚡",
        "Time to level up your language game! 🚀",
        "You've got this challenge in the bag! 💪",
        "Let's make this challenge your victory! 🏆",
      ],
      'learning': [
        "You're making incredible progress! 🌟",
        "Every word you learn opens new doors! 🚪",
        "Your brain is getting stronger with each session! 💪",
        "Learning is your superpower! ⚡",
        "You're building a brighter future! ✨",
      ],
      'pronunciation': [
        "Your pronunciation is getting better every day! 🗣️",
        "Practice makes perfect! Keep going! 💪",
        "You're sounding more native with each attempt! 🌟",
        "Your voice is your instrument - keep tuning it! 🎵",
        "Confidence in speaking comes from practice! 🎯",
      ],
      'study': [
        "Your study time is an investment in yourself! 💎",
        "Every minute of study brings you closer to fluency! 🚀",
        "You're building knowledge that will last a lifetime! 📚",
        "Your dedication to learning is admirable! 🌟",
        "Study smart, learn fast! ⚡",
      ],
    };

    final typeMessages = messages[type] ?? messages['daily_reminder']!;
    return typeMessages[
        DateTime.now().millisecondsSinceEpoch % typeMessages.length];
  }

  /// Schedule daily learning reminder with beautiful styling
  static Future<void> scheduleDailyReminder({
    required int hour,
    required int minute,
    String? customMessage,
  }) async {
    try {
      // Check permissions first
      bool isAllowed = await checkAndRequestPermissions();
      if (!isAllowed) {
        debugPrint('Notification permissions not granted for daily reminder');
        return;
      }

      // Cancel existing daily reminder first
      await AwesomeNotifications().cancel(1);

      final messages = customMessage != null
          ? [customMessage]
          : [
              "Time for your daily language practice! 🎯",
              "Ready to learn something new today? 📚",
              "Don't break your learning streak! 🔥",
              "Your daily lesson is waiting! ✨",
              "Keep your language skills sharp! 💪",
            ];

      debugPrint('Scheduling daily reminder for $hour:$minute');

      await AwesomeNotifications().createNotification(
        content: NotificationContent(
          id: 1,
          channelKey: 'daily_reminder',
          title: '🌟 Language Learning Time!',
          body: messages[DateTime.now().day % messages.length],
          summary: 'Your daily learning session awaits!',
          notificationLayout: NotificationLayout.BigText,
          actionType: ActionType.Default,
          category: NotificationCategory.Reminder,
          wakeUpScreen: true,
          fullScreenIntent: false,
          autoDismissible: true,
          backgroundColor: const Color(0xFF6C63FF),
          color: const Color(0xFFFFFFFF),
          icon: 'assets/images/logo.png', // Use custom logo
          payload: {
            'type': 'daily_reminder',
            'action': 'open_lesson',
            'scheduled_time': '$hour:$minute',
          },
        ),
        actionButtons: [
          NotificationActionButton(
            key: 'START_LEARNING',
            label: 'Start Learning',
            actionType: ActionType.Default,
            color: const Color(0xFF00BFA5),
            autoDismissible: true,
          ),
          NotificationActionButton(
            key: 'REMIND_LATER',
            label: 'Remind in 1 hour',
            actionType: ActionType.Default,
            color: const Color(0xFFFF9800),
            autoDismissible: true,
          ),
        ],
        schedule: NotificationCalendar(
          hour: hour,
          minute: minute,
          second: 0,
          millisecond: 0,
          repeats: true,
          allowWhileIdle: true,
          preciseAlarm: true,
        ),
      );

      debugPrint('Daily reminder scheduled successfully for $hour:$minute');

      // Also schedule a test notification for 1 minute from now to verify it works
      await _scheduleTestReminder();
    } catch (e) {
      debugPrint('Error scheduling daily reminder: $e');
    }
  }

  /// Show a simple test notification immediately with beautiful styling
  static Future<void> showTestNotification({
    String title = 'Test Notification',
    String body =
        'This is a test notification from your language learning app!',
  }) async {
    try {
      // Check permissions first
      bool isAllowed = await checkAndRequestPermissions();

      if (!isAllowed) {
        throw Exception('Notification permissions not granted');
      }

      String motivationalMessage = _getMotivationalMessage('daily_reminder');

      await AwesomeNotifications().createNotification(
        content: NotificationContent(
          id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
          channelKey: 'basic_channel',
          title: '🧪 $title',
          body: '$body\n\n$motivationalMessage',
          summary: 'Testing beautiful notifications! ✨',
          notificationLayout: NotificationLayout.BigText,
          actionType: ActionType.Default,
          autoDismissible: true,
          backgroundColor: const Color(0xFF667eea),
          color: const Color(0xFFFFFFFF),
          icon: 'assets/images/logo.png', // Use custom logo
        ),
        actionButtons: [
          NotificationActionButton(
            key: 'TEST_SUCCESS',
            label: '✅ Test Successful!',
            actionType: ActionType.Default,
            color: const Color(0xFF00BFA5),
            autoDismissible: true,
          ),
        ],
      );

      debugPrint('Test notification sent successfully');
    } catch (e) {
      debugPrint('Error showing test notification: $e');
    }
  }

  /// Schedule a test reminder to verify notifications work
  static Future<void> _scheduleTestReminder() async {
    try {
      // Check permissions first
      bool isAllowed = await checkAndRequestPermissions();
      if (!isAllowed) {
        debugPrint('Notification permissions not granted for test reminder');
        return;
      }

      // Cancel any existing test reminder
      await AwesomeNotifications().cancel(999);

      await AwesomeNotifications().createNotification(
        content: NotificationContent(
          id: 999,
          channelKey: 'daily_reminder',
          title: '🎯 Daily Reminder Test',
          body:
              'This is a beautiful test to verify daily reminders are working! ✨',
          summary: 'Test notification for daily reminders',
          notificationLayout: NotificationLayout.BigText,
          actionType: ActionType.Default,
          category: NotificationCategory.Reminder,
          autoDismissible: true,
          backgroundColor: const Color(0xFF6C63FF),
          color: const Color(0xFFFFFFFF),
          icon: 'assets/images/logo.png', // Use custom logo
          payload: {
            'type': 'test_reminder',
          },
        ),
        actionButtons: [
          NotificationActionButton(
            key: 'TEST_SUCCESS',
            label: '✅ Test Successful!',
            actionType: ActionType.Default,
            color: const Color(0xFF00BFA5),
            autoDismissible: true,
          ),
        ],
        schedule: NotificationInterval(
          interval: const Duration(minutes: 1),
          allowWhileIdle: true,
        ),
      );
      debugPrint('Test reminder scheduled for 1 minute from now');
    } catch (e) {
      debugPrint('Error scheduling test reminder: $e');
    }
  }

  /// Schedule a test reminder immediately (for debugging)
  static Future<void> scheduleTestReminderNow() async {
    try {
      // Check permissions first
      bool isAllowed = await checkAndRequestPermissions();
      if (!isAllowed) {
        debugPrint('Notification permissions not granted for test reminder');
        return;
      }

      // Cancel any existing test reminder
      await AwesomeNotifications().cancel(999);

      await AwesomeNotifications().createNotification(
        content: NotificationContent(
          id: 999,
          channelKey: 'daily_reminder',
          title: '🎯 Test Reminder',
          body:
              'This is a test reminder to verify notifications are working! ✨',
          summary: 'Test notification',
          notificationLayout: NotificationLayout.BigText,
          actionType: ActionType.Default,
          category: NotificationCategory.Reminder,
          autoDismissible: true,
          backgroundColor: const Color(0xFF6C63FF),
          color: const Color(0xFFFFFFFF),
          icon: 'assets/images/logo.png',
          payload: {
            'type': 'test_reminder',
          },
        ),
        actionButtons: [
          NotificationActionButton(
            key: 'TEST_SUCCESS',
            label: '✅ Test Successful!',
            actionType: ActionType.Default,
            color: const Color(0xFF00BFA5),
            autoDismissible: true,
          ),
        ],
        schedule: NotificationInterval(
          interval: const Duration(seconds: 10), // Show in 10 seconds
          allowWhileIdle: true,
        ),
      );
      debugPrint('Test reminder scheduled for 10 seconds from now');
    } catch (e) {
      debugPrint('Error scheduling test reminder: $e');
    }
  }

  /// Show achievement notification with beautiful styling
  static Future<void> showAchievementNotification({
    required String title,
    required String message,
    required String achievementType,
    int? streakCount,
  }) async {
    String emoji = _getAchievementEmoji(achievementType);
    String motivationalMessage = _getMotivationalMessage('achievement');

    await AwesomeNotifications().createNotification(
      content: NotificationContent(
        id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
        channelKey: 'achievements',
        title: '$emoji $title',
        body: '$message\n\n$motivationalMessage',
        summary: 'Achievement unlocked! 🎉',
        notificationLayout: NotificationLayout.BigText,
        actionType: ActionType.Default,
        category: NotificationCategory.Social,
        wakeUpScreen: true,
        autoDismissible: true,
        backgroundColor: const Color(0xFFFFB800),
        color: const Color(0xFFFFFFFF),
        icon: 'assets/images/logo.png', // Use custom logo
        payload: {
          'type': 'achievement',
          'achievement_type': achievementType,
          'streak_count': streakCount?.toString() ?? '0',
        },
      ),
      actionButtons: [
        NotificationActionButton(
          key: 'SHARE_ACHIEVEMENT',
          label: 'Share Victory',
          actionType: ActionType.Default,
          color: const Color(0xFFFFB800),
          autoDismissible: true,
        ),
        NotificationActionButton(
          key: 'VIEW_PROGRESS',
          label: 'View Progress',
          actionType: ActionType.Default,
          color: const Color(0xFF6C63FF),
          autoDismissible: true,
        ),
      ],
    );
  }

  /// Show new content notification with beautiful styling
  static Future<void> showNewContentNotification({
    required String contentType,
    required String title,
    required String description,
    String? imageUrl,
  }) async {
    String emoji = _getNotificationEmoji('new_content');
    String motivationalMessage = _getMotivationalMessage('new_content');

    await AwesomeNotifications().createNotification(
      content: NotificationContent(
        id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
        channelKey: 'new_content',
        title: '$emoji New $contentType Available!',
        body: '$title\n\n$description\n\n$motivationalMessage',
        summary: 'Fresh content waiting for you! ✨',
        notificationLayout: NotificationLayout.BigText,
        actionType: ActionType.Default,
        category: NotificationCategory.Social,
        backgroundColor: const Color(0xFF00BFA5),
        color: const Color(0xFFFFFFFF),
        payload: {
          'type': 'new_content',
          'content_type': contentType,
          'title': title,
        },
      ),
      actionButtons: [
        NotificationActionButton(
          key: 'EXPLORE_CONTENT',
          label: 'Explore Now',
          actionType: ActionType.Default,
          color: const Color(0xFF00BFA5),
          autoDismissible: true,
        ),
        NotificationActionButton(
          key: 'SAVE_FOR_LATER',
          label: 'Save for Later',
          actionType: ActionType.Default,
          color: const Color(0xFF757575),
          autoDismissible: true,
        ),
      ],
    );
  }

  /// Schedule daily challenge notification with beautiful styling
  static Future<void> scheduleDailyChallenge({
    required int hour,
    required int minute,
  }) async {
    try {
      // Check permissions first
      bool isAllowed = await checkAndRequestPermissions();
      if (!isAllowed) {
        debugPrint('Notification permissions not granted for daily challenge');
        return;
      }

      // Cancel existing daily challenge first
      await AwesomeNotifications().cancel(2);

      final challenges = [
        "Today's challenge: Learn 5 new words! 📝",
        "Challenge: Practice pronunciation for 10 minutes! 🗣️",
        "Daily challenge: Complete a conversation exercise! 💬",
        "Challenge: Review yesterday's vocabulary! 🔄",
        "Today's challenge: Listen to native speakers! 👂",
      ];

      String motivationalMessage = _getMotivationalMessage('challenge');

      debugPrint('Scheduling daily challenge for $hour:$minute');

      await AwesomeNotifications().createNotification(
        content: NotificationContent(
          id: 2,
          channelKey: 'daily_challenge',
          title: '🎯 Daily Challenge Ready!',
          body:
              '${challenges[DateTime.now().weekday % challenges.length]}\n\n$motivationalMessage',
          summary: 'Your daily challenge awaits! ⚡',
          notificationLayout: NotificationLayout.BigText,
          actionType: ActionType.Default,
          category: NotificationCategory.Workout,
          wakeUpScreen: true,
          backgroundColor: const Color(0xFFE91E63),
          color: const Color(0xFFFFFFFF),
          payload: {
            'type': 'daily_challenge',
            'challenge_id': DateTime.now().day.toString(),
            'scheduled_time': '$hour:$minute',
          },
        ),
        actionButtons: [
          NotificationActionButton(
            key: 'START_CHALLENGE',
            label: 'Start Challenge',
            actionType: ActionType.Default,
            color: const Color(0xFFE91E63),
            autoDismissible: true,
          ),
          NotificationActionButton(
            key: 'REMIND_LATER',
            label: 'Remind in 1 hour',
            actionType: ActionType.Default,
            color: const Color(0xFFFF9800),
            autoDismissible: true,
          ),
        ],
        schedule: NotificationCalendar(
          hour: hour,
          minute: minute,
          second: 0,
          millisecond: 0,
          repeats: true,
          allowWhileIdle: true,
          preciseAlarm: true,
        ),
      );

      debugPrint('Daily challenge scheduled successfully for $hour:$minute');
    } catch (e) {
      debugPrint('Error scheduling daily challenge: $e');
    }
  }

  /// Show streak reminder notification with beautiful styling
  static Future<void> showStreakReminderNotification({
    required int streakCount,
    required int hoursLeft,
  }) async {
    String urgencyMessage = hoursLeft <= 2
        ? "Only $hoursLeft hours left to keep your streak! ⏰"
        : "You have $hoursLeft hours to maintain your $streakCount-day streak! 🔥";

    String motivationalMessage = _getMotivationalMessage('streak');

    await AwesomeNotifications().createNotification(
      content: NotificationContent(
        id: 3,
        channelKey: 'daily_reminder',
        title: '🔥 Don\'t Lose Your $streakCount-Day Streak!',
        body: '$urgencyMessage\n\n$motivationalMessage',
        summary: 'Keep your streak alive! 💪',
        notificationLayout: NotificationLayout.BigText,
        actionType: ActionType.Default,
        category: NotificationCategory.Reminder,
        wakeUpScreen: true,
        criticalAlert: hoursLeft <= 1,
        backgroundColor: const Color(0xFFFF6B35),
        color: const Color(0xFFFFFFFF),
        payload: {
          'type': 'streak_reminder',
          'streak_count': streakCount.toString(),
          'hours_left': hoursLeft.toString(),
        },
      ),
      actionButtons: [
        NotificationActionButton(
          key: 'PRACTICE_NOW',
          label: 'Practice Now',
          actionType: ActionType.Default,
          color: const Color(0xFFE91E63),
          autoDismissible: true,
        ),
        NotificationActionButton(
          key: 'QUICK_REVIEW',
          label: 'Quick Review',
          actionType: ActionType.Default,
          color: const Color(0xFF00BFA5),
          autoDismissible: true,
        ),
      ],
    );
  }

  /// Show vocabulary practice reminder with beautiful styling
  static Future<void> showVocabularyPracticeReminder({
    required String word,
    required String meaning,
  }) async {
    String motivationalMessage = _getMotivationalMessage('practice');

    await AwesomeNotifications().createNotification(
      content: NotificationContent(
        id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
        channelKey: 'daily_reminder',
        title: '📚 Practice Time!',
        body: 'Review: "$word" - $meaning\n\n$motivationalMessage',
        summary: 'Time to practice vocabulary! 💪',
        notificationLayout: NotificationLayout.BigText,
        actionType: ActionType.Default,
        category: NotificationCategory.Reminder,
        backgroundColor: const Color(0xFF6C63FF),
        color: const Color(0xFFFFFFFF),
        payload: {
          'type': 'vocabulary_practice',
          'word': word,
          'meaning': meaning,
        },
      ),
      actionButtons: [
        NotificationActionButton(
          key: 'PRACTICE_WORD',
          label: 'Practice Now',
          actionType: ActionType.Default,
          color: const Color(0xFF00BFA5),
          autoDismissible: true,
        ),
        NotificationActionButton(
          key: 'REMIND_LATER',
          label: 'Later',
          actionType: ActionType.Default,
          color: const Color(0xFF757575),
          autoDismissible: true,
        ),
      ],
    );
  }

  /// Check if notifications are allowed and request if needed
  static Future<bool> checkAndRequestPermissions() async {
    bool isAllowed = await AwesomeNotifications().isNotificationAllowed();

    if (!isAllowed) {
      isAllowed =
          await AwesomeNotifications().requestPermissionToSendNotifications();
    }

    // For Android 13+, request POST_NOTIFICATIONS permission
    if (!isAllowed) {
      final status = await Permission.notification.request();
      isAllowed = status == PermissionStatus.granted;
    }

    return isAllowed;
  }

  /// Cancel all scheduled notifications
  static Future<void> cancelAllNotifications() async {
    await AwesomeNotifications().cancelAll();
  }

  /// Cancel specific notification by ID
  static Future<void> cancelNotification(int id) async {
    await AwesomeNotifications().cancel(id);
  }

  /// Get list of scheduled notifications
  static Future<List<NotificationModel>> getScheduledNotifications() async {
    try {
      final notifications =
          await AwesomeNotifications().listScheduledNotifications();
      debugPrint('Found ${notifications.length} scheduled notifications');
      for (var notification in notifications) {
        debugPrint(
            'Scheduled notification: ID=${notification.content?.id}, Title=${notification.content?.title}');
      }
      return notifications;
    } catch (e) {
      debugPrint('Error getting scheduled notifications: $e');
      return [];
    }
  }

  /// Check if daily reminder is scheduled
  static Future<bool> isDailyReminderScheduled() async {
    try {
      final notifications = await getScheduledNotifications();
      return notifications.any((notification) => notification.content?.id == 1);
    } catch (e) {
      debugPrint('Error checking daily reminder: $e');
      return false;
    }
  }

  /// Check if daily challenge is scheduled
  static Future<bool> isDailyChallengeScheduled() async {
    try {
      final notifications = await getScheduledNotifications();
      return notifications.any((notification) => notification.content?.id == 2);
    } catch (e) {
      debugPrint('Error checking daily challenge: $e');
      return false;
    }
  }

  /// Show debug information about scheduled notifications
  static Future<void> showDebugInfo() async {
    try {
      final notifications = await getScheduledNotifications();
      final isReminderScheduled = await isDailyReminderScheduled();
      final isChallengeScheduled = await isDailyChallengeScheduled();

      debugPrint('=== NOTIFICATION DEBUG INFO ===');
      debugPrint('Total scheduled notifications: ${notifications.length}');
      debugPrint('Daily reminder scheduled: $isReminderScheduled');
      debugPrint('Daily challenge scheduled: $isChallengeScheduled');
      debugPrint('================================');
    } catch (e) {
      debugPrint('Error showing debug info: $e');
    }
  }

  /// Comprehensive notification debugging method
  static Future<void> debugNotificationStatus() async {
    try {
      debugPrint('=== COMPREHENSIVE NOTIFICATION DEBUG ===');

      // Check permissions
      bool isAllowed = await AwesomeNotifications().isNotificationAllowed();
      debugPrint('Notifications allowed: $isAllowed');

      // Check if service is initialized
      bool isInitialized = await AwesomeNotifications().isNotificationAllowed();
      debugPrint('Service initialized: $isInitialized');

      // Get scheduled notifications
      final notifications = await getScheduledNotifications();
      debugPrint('Scheduled notifications count: ${notifications.length}');

      for (var notification in notifications) {
        debugPrint(
            'Scheduled: ID=${notification.content?.id}, Title=${notification.content?.title}, Channel=${notification.content?.channelKey}');
      }

      // Check specific notification IDs
      final isTestScheduled = notifications.any((n) => n.content?.id == 999);
      final isDailyReminderScheduled =
          notifications.any((n) => n.content?.id == 1);
      final isDailyChallengeScheduled =
          notifications.any((n) => n.content?.id == 2);

      debugPrint('Test notification (ID 999) scheduled: $isTestScheduled');
      debugPrint('Daily reminder (ID 1) scheduled: $isDailyReminderScheduled');
      debugPrint(
          'Daily challenge (ID 2) scheduled: $isDailyChallengeScheduled');

      debugPrint('=== END DEBUG ===');
    } catch (e) {
      debugPrint('Error in debugNotificationStatus: $e');
    }
  }

  /// Test notification permissions and send immediate test
  static Future<void> testNotificationPermissions() async {
    try {
      debugPrint('=== TESTING NOTIFICATION PERMISSIONS ===');

      // Check basic permission
      bool isAllowed = await AwesomeNotifications().isNotificationAllowed();
      debugPrint('Basic notification permission: $isAllowed');

      if (!isAllowed) {
        debugPrint('Requesting notification permission...');
        isAllowed =
            await AwesomeNotifications().requestPermissionToSendNotifications();
        debugPrint('Permission request result: $isAllowed');
      }

      // Check Android 13+ permission
      final status = await Permission.notification.status;
      debugPrint('Android notification permission status: $status');

      if (status != PermissionStatus.granted) {
        debugPrint('Requesting Android notification permission...');
        final requestStatus = await Permission.notification.request();
        debugPrint('Android permission request result: $requestStatus');
      }

      // Try to send an immediate test notification
      if (isAllowed) {
        debugPrint('Sending immediate test notification...');
        await showTestNotification(
          title: 'Permission Test',
          body:
              'This is a test to verify notification permissions are working!',
        );
      } else {
        debugPrint('Cannot send test notification - permissions not granted');
      }

      debugPrint('=== END PERMISSION TEST ===');
    } catch (e) {
      debugPrint('Error in testNotificationPermissions: $e');
    }
  }

  /// Helper method to get emoji for achievement type
  static String _getAchievementEmoji(String achievementType) {
    switch (achievementType.toLowerCase()) {
      case 'streak_milestone':
        return '🔥';
      case 'vocabulary_master':
        return '📚';
      case 'pronunciation_expert':
        return '🗣️';
      case 'conversation_champion':
        return '💬';
      case 'daily_challenge_winner':
        return '🏆';
      case 'level_up':
        return '⬆️';
      default:
        return '🎉';
    }
  }

  // ==================== PERSISTENT NOTIFICATIONS ====================

  /// Show a persistent notification that stays until dismissed
  static Future<void> showPersistentNotification({
    required int id,
    required String title,
    required String body,
    String? channelKey,
    String? icon,
    Color? backgroundColor,
    Map<String, String>? payload,
    List<NotificationActionButton>? actionButtons,
    bool showProgress = false,
    double? progress,
  }) async {
    try {
      // Check permissions first
      bool isAllowed = await checkAndRequestPermissions();

      if (!isAllowed) {
        throw Exception('Notification permissions not granted');
      }

      await AwesomeNotifications().createNotification(
        content: NotificationContent(
          id: id,
          channelKey: channelKey ?? 'basic_channel',
          title: title,
          body: body,
          icon: icon ?? 'assets/images/logo.png', // Use custom logo as default
          notificationLayout: showProgress
              ? NotificationLayout.ProgressBar
              : NotificationLayout.BigText,
          actionType: ActionType.Default,
          autoDismissible: false, // Make it persistent
          backgroundColor: backgroundColor ?? const Color(0xFF2196F3),
          color: const Color(0xFFFFFFFF),
          payload: payload,
          progress: progress,
        ),
        actionButtons: actionButtons,
      );

      debugPrint('Persistent notification created with ID: $id');
    } catch (e) {
      debugPrint('Error showing persistent notification: $e');
    }
  }

  /// Update an existing persistent notification
  static Future<void> updatePersistentNotification({
    required int id,
    String? title,
    String? body,
    String? icon,
    Color? backgroundColor,
    Map<String, String>? payload,
    double? progress,
  }) async {
    try {
      await AwesomeNotifications().createNotification(
        content: NotificationContent(
          id: id,
          channelKey: 'basic_channel',
          title: title ?? '',
          body: body ?? '',
          icon: icon ?? 'assets/images/logo.png', // Use custom logo as default
          notificationLayout: progress != null
              ? NotificationLayout.ProgressBar
              : NotificationLayout.BigText,
          actionType: ActionType.Default,
          autoDismissible: false,
          backgroundColor: backgroundColor ?? const Color(0xFF2196F3),
          color: const Color(0xFFFFFFFF),
          payload: payload,
          progress: progress,
        ),
      );

      debugPrint('Persistent notification updated with ID: $id');
    } catch (e) {
      debugPrint('Error updating persistent notification: $e');
    }
  }

  /// Remove a persistent notification
  static Future<void> removePersistentNotification(int id) async {
    try {
      await AwesomeNotifications().dismiss(id);
      debugPrint('Persistent notification removed with ID: $id');
    } catch (e) {
      debugPrint('Error removing persistent notification: $e');
    }
  }

  /// Show a learning session persistent notification with beautiful styling
  static Future<void> showLearningSessionNotification({
    required int sessionId,
    required String currentWord,
    required int wordsCompleted,
    required int totalWords,
  }) async {
    final progress = totalWords > 0 ? wordsCompleted / totalWords : 0.0;
    String motivationalMessage = _getMotivationalMessage('learning');

    await showPersistentNotification(
      id: sessionId,
      title: '📚 Learning Session in Progress',
      body: 'Current word: "$currentWord"\n\n$motivationalMessage',
      channelKey: 'daily_reminder',
      backgroundColor: const Color(0xFF6C63FF),
      showProgress: true,
      progress: progress,
      payload: {
        'type': 'learning_session',
        'session_id': sessionId.toString(),
        'current_word': currentWord,
        'words_completed': wordsCompleted.toString(),
        'total_words': totalWords.toString(),
      },
      actionButtons: [
        NotificationActionButton(
          key: 'PAUSE_SESSION',
          label: '⏸️ Pause',
          actionType: ActionType.Default,
          color: const Color(0xFFFF9800),
          autoDismissible: false,
        ),
        NotificationActionButton(
          key: 'END_SESSION',
          label: '🏁 End Session',
          actionType: ActionType.Default,
          color: const Color(0xFFE91E63),
          autoDismissible: false,
        ),
      ],
    );
  }

  /// Show a pronunciation practice persistent notification with beautiful styling
  static Future<void> showPronunciationPracticeNotification({
    required int practiceId,
    required String targetWord,
    required int attempts,
    required double bestAccuracy,
  }) async {
    String motivationalMessage = _getMotivationalMessage('pronunciation');

    await showPersistentNotification(
      id: practiceId,
      title: '🗣️ Pronunciation Practice',
      body: 'Practicing: "$targetWord"\n\n$motivationalMessage',
      channelKey: 'achievements',
      backgroundColor: const Color(0xFFFFB800),
      payload: {
        'type': 'pronunciation_practice',
        'practice_id': practiceId.toString(),
        'target_word': targetWord,
        'attempts': attempts.toString(),
        'best_accuracy': bestAccuracy.toString(),
      },
      actionButtons: [
        NotificationActionButton(
          key: 'PRACTICE_AGAIN',
          label: '🔄 Try Again',
          actionType: ActionType.Default,
          color: const Color(0xFF00BFA5),
          autoDismissible: false,
        ),
        NotificationActionButton(
          key: 'FINISH_PRACTICE',
          label: '✅ Finish',
          actionType: ActionType.Default,
          color: const Color(0xFF757575),
          autoDismissible: false,
        ),
      ],
    );
  }

  /// Show a streak maintenance persistent notification with beautiful styling
  static Future<void> showStreakMaintenanceNotification({
    required int streakId,
    required int currentStreak,
    required int hoursLeft,
  }) async {
    final urgencyColor =
        hoursLeft <= 2 ? const Color(0xFFE91E63) : const Color(0xFFFFB800);

    String urgencyMessage = hoursLeft <= 2
        ? 'Only $hoursLeft hours left to maintain your streak! ⏰'
        : '$hoursLeft hours left to keep your streak alive 🔥';

    String motivationalMessage = _getMotivationalMessage('streak');

    await showPersistentNotification(
      id: streakId,
      title: '🔥 $currentStreak-Day Streak Active',
      body: '$urgencyMessage\n\n$motivationalMessage',
      channelKey: 'achievements',
      backgroundColor: urgencyColor,
      payload: {
        'type': 'streak_maintenance',
        'streak_id': streakId.toString(),
        'current_streak': currentStreak.toString(),
        'hours_left': hoursLeft.toString(),
      },
      actionButtons: [
        NotificationActionButton(
          key: 'PRACTICE_NOW',
          label: '💪 Practice Now',
          actionType: ActionType.Default,
          color: const Color(0xFF00BFA5),
          autoDismissible: false,
        ),
        NotificationActionButton(
          key: 'DISMISS_STREAK',
          label: '❌ Dismiss',
          actionType: ActionType.Default,
          color: const Color(0xFF757575),
          autoDismissible: false,
        ),
      ],
    );
  }

  /// Show a download progress persistent notification with beautiful styling
  static Future<void> showDownloadProgressNotification({
    required int downloadId,
    required String fileName,
    required double progress,
    String? status,
  }) async {
    await showPersistentNotification(
      id: downloadId,
      title: '📥 Downloading: $fileName',
      body: status ?? 'Download in progress...\n\nAlmost there! 🚀',
      channelKey: 'new_content',
      backgroundColor: const Color(0xFF00BFA5),
      showProgress: true,
      progress: progress,
      payload: {
        'type': 'download_progress',
        'download_id': downloadId.toString(),
        'file_name': fileName,
        'progress': progress.toString(),
      },
      actionButtons: [
        NotificationActionButton(
          key: 'CANCEL_DOWNLOAD',
          label: '❌ Cancel',
          actionType: ActionType.Default,
          color: const Color(0xFFE91E63),
          autoDismissible: false,
        ),
      ],
    );
  }

  /// Show a study reminder persistent notification with beautiful styling
  static Future<void> showStudyReminderNotification({
    required int reminderId,
    required String message,
    required int minutesLeft,
  }) async {
    String motivationalMessage = _getMotivationalMessage('study');

    await showPersistentNotification(
      id: reminderId,
      title: '⏰ Study Reminder',
      body: '$message\n\n$motivationalMessage',
      channelKey: 'daily_reminder',
      backgroundColor: const Color(0xFF6C63FF),
      payload: {
        'type': 'study_reminder',
        'reminder_id': reminderId.toString(),
        'minutes_left': minutesLeft.toString(),
      },
      actionButtons: [
        NotificationActionButton(
          key: 'START_STUDY',
          label: '📚 Start Studying',
          actionType: ActionType.Default,
          color: const Color(0xFF00BFA5),
          autoDismissible: false,
        ),
        NotificationActionButton(
          key: 'SNOOZE_15',
          label: '⏰ Snooze 15min',
          actionType: ActionType.Default,
          color: const Color(0xFFFF9800),
          autoDismissible: false,
        ),
        NotificationActionButton(
          key: 'DISMISS_REMINDER',
          label: '❌ Dismiss',
          actionType: ActionType.Default,
          color: const Color(0xFF757575),
          autoDismissible: false,
        ),
      ],
    );
  }
}

/// Notification handler for managing user interactions
class NotificationHandler {
  static Future<void> initializeListeners() async {
    // Listen to notification actions
    AwesomeNotifications().setListeners(
      onActionReceivedMethod: onActionReceivedMethod,
      onNotificationCreatedMethod: onNotificationCreatedMethod,
      onNotificationDisplayedMethod: onNotificationDisplayedMethod,
      onDismissActionReceivedMethod: onDismissActionReceivedMethod,
    );
  }

  /// Called when notification is created
  @pragma("vm:entry-point")
  static Future<void> onNotificationCreatedMethod(
    ReceivedNotification receivedNotification,
  ) async {
    debugPrint('Notification created: ${receivedNotification.title}');
  }

  /// Called when notification is displayed
  @pragma("vm:entry-point")
  static Future<void> onNotificationDisplayedMethod(
    ReceivedNotification receivedNotification,
  ) async {
    debugPrint('Notification displayed: ${receivedNotification.title}');
  }

  /// Called when user dismisses notification
  @pragma("vm:entry-point")
  static Future<void> onDismissActionReceivedMethod(
    ReceivedAction receivedAction,
  ) async {
    debugPrint('Notification dismissed: ${receivedAction.payload}');

    // Track dismissal analytics
    // Analytics.trackEvent('notification_dismissed', {
    //   'type': receivedAction.payload?['type'],
    //   'channel': receivedAction.channelKey,
    // });
  }

  /// Called when user taps notification or action button
  @pragma("vm:entry-point")
  static Future<void> onActionReceivedMethod(
    ReceivedAction receivedAction,
  ) async {
    final payload = receivedAction.payload;
    final actionKey = receivedAction.buttonKeyPressed;

    debugPrint('Notification action: $actionKey, Payload: $payload');

    // Handle different notification types and actions
    switch (payload?['type']) {
      case 'daily_reminder':
        await _handleDailyReminderAction(actionKey, payload);
        break;
      case 'achievement':
        await _handleAchievementAction(actionKey, payload);
        break;
      case 'new_content':
        await _handleNewContentAction(actionKey, payload);
        break;
      case 'daily_challenge':
        await _handleDailyChallengeAction(actionKey, payload);
        break;
      case 'streak_reminder':
        await _handleStreakReminderAction(actionKey, payload);
        break;
      case 'vocabulary_practice':
        await _handleVocabularyPracticeAction(actionKey, payload);
        break;
    }
  }

  static Future<void> _handleDailyReminderAction(
    String? actionKey,
    Map<String, String?>? payload,
  ) async {
    // Navigate to main lesson screen
    debugPrint('Navigating to daily lessons');
  }

  static Future<void> _handleAchievementAction(
    String? actionKey,
    Map<String, String?>? payload,
  ) async {
    switch (actionKey) {
      case 'SHARE_ACHIEVEMENT':
        // Handle sharing achievement
        debugPrint('Sharing achievement: ${payload?['achievement_type']}');
        break;
      case 'VIEW_PROGRESS':
        // Navigate to progress screen
        debugPrint('Navigating to progress screen');
        break;
      default:
        // Navigate to achievements screen
        debugPrint('Navigating to achievements');
        break;
    }
  }

  static Future<void> _handleNewContentAction(
    String? actionKey,
    Map<String, String?>? payload,
  ) async {
    final contentType = payload?['content_type'];
    // Navigate to specific content type screen
    debugPrint('Navigating to $contentType content');
  }

  static Future<void> _handleDailyChallengeAction(
    String? actionKey,
    Map<String, String?>? payload,
  ) async {
    switch (actionKey) {
      case 'START_CHALLENGE':
        // Navigate directly to challenge
        debugPrint('Starting daily challenge');
        break;
      case 'REMIND_LATER':
        // Schedule reminder in 1 hour
        await _scheduleReminderLater();
        break;
      default:
        // Navigate to challenges screen
        debugPrint('Navigating to challenges');
        break;
    }
  }

  static Future<void> _handleStreakReminderAction(
    String? actionKey,
    Map<String, String?>? payload,
  ) async {
    switch (actionKey) {
      case 'PRACTICE_NOW':
        // Navigate to quick practice session
        debugPrint('Starting quick practice to maintain streak');
        break;
      default:
        // Navigate to main app
        debugPrint('Navigating to main app');
        break;
    }
  }

  static Future<void> _handleVocabularyPracticeAction(
    String? actionKey,
    Map<String, String?>? payload,
  ) async {
    switch (actionKey) {
      case 'PRACTICE_WORD':
        final word = payload?['word'];
        // Navigate to vocabulary practice with specific word
        debugPrint('Practicing word: $word');
        break;
      case 'REMIND_LATER':
        // Schedule reminder in 1 hour
        await _scheduleReminderLater();
        break;
      default:
        // Navigate to vocabulary building screen
        debugPrint('Navigating to vocabulary building');
        break;
    }
  }

  static Future<void> _scheduleReminderLater() async {
    // Schedule a notification for 1 hour later
    await AwesomeNotifications().createNotification(
      content: NotificationContent(
        id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
        channelKey: 'daily_challenge',
        title: 'Challenge Reminder! 🎯',
        body: 'Your daily challenge is still waiting!',
        payload: {
          'type': 'daily_challenge',
          'is_reminder': 'true',
        },
      ),
      schedule: NotificationInterval(
        interval: const Duration(hours: 1),
        allowWhileIdle: true,
      ),
    );
  }
}
