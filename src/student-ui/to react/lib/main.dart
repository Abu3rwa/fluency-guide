import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'providers/auth_provider.dart';
import 'providers/user_provider.dart';
import 'providers/course_provider.dart';
import 'providers/lesson_provider.dart';
import 'providers/achievement_provider.dart';
import 'providers/locale_provider.dart';
import 'providers/module_provider.dart';
import 'providers/task_provider.dart';
import 'providers/message_provider.dart';
import 'providers/recent_activity_provider.dart';
import 'providers/audio_provider.dart';
import 'providers/vocabulary_goal_provider.dart';
import 'providers/vocabulary_progress_provider.dart';
import 'services/auth_service.dart';
import 'services/notification_service.dart';
import 'theme/theme_provider.dart';
import 'routes/app_routes.dart';
import 'screens/home_screen.dart';
import 'screens/auth/auth_screen.dart';
import 'theme/app_theme.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'l10n/app_localizations.dart';
import 'firebase_options.dart';
import 'providers/session_timer_provider.dart';
import 'package:awesome_notifications/awesome_notifications.dart' as awesome;
import 'providers/hard_word_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e, stackTrace) {
    debugPrint('Error initializing Firebase: $e');
    debugPrint('Stack trace: $stackTrace');
  }

  // Initialize comprehensive notification service
  await NotificationService.initialize();
  await NotificationHandler.initializeListeners();

  awesome.AwesomeNotifications().initialize(
    null,
    [
      awesome.NotificationChannel(
        channelKey: 'hard_words_channel',
        channelName: 'Hard Words Notifications',
        channelDescription:
            'Notifications to remind users to practice hard words',
        defaultColor: const Color(0xFF9D50DD),
        importance: awesome.NotificationImportance.High,
        channelShowBadge: true,
      ),
    ],
    debug: true,
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => LocaleProvider(prefs),
        ),
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => CourseProvider()),
        ChangeNotifierProvider(create: (_) => LessonProvider()),
        ChangeNotifierProvider(create: (_) => ModuleProvider()),
        ChangeNotifierProvider(create: (_) => TaskProvider()),
        ChangeNotifierProvider(create: (_) => MessageProvider()),
        ChangeNotifierProvider(create: (_) => AchievementProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => RecentActivityProvider()),
        ChangeNotifierProvider(create: (_) => AudioProvider()),
        ChangeNotifierProxyProvider<UserProvider, VocabularyGoalProvider>(
          create: (context) => VocabularyGoalProvider(),
          update: (context, userProvider, previous) =>
              VocabularyGoalProvider(userProvider: userProvider),
        ),
        ChangeNotifierProvider(create: (_) => VocabularyProgressProvider()),
        Provider<AuthService>(
          create: (context) => AuthService(context.read<UserProvider>()),
        ),
        ChangeNotifierProvider(create: (_) => SessionTimerProvider()..start()),
        ChangeNotifierProxyProvider<AuthProvider, HardWordProvider>(
          create: (context) => HardWordProvider(userId: ''),
          update: (context, authProvider, previous) {
            final userId = authProvider.firebaseUser?.uid ?? '';
            return HardWordProvider(userId: userId);
          },
        ),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<LocaleProvider>(
      builder: (context, localeProvider, child) {
        return const AppContent();
      },
    );
  }
}

class AppContent extends StatefulWidget {
  const AppContent({super.key});
  @override
  State<AppContent> createState() => _AppContentState();
}

class _AppContentState extends State<AppContent> {
  SessionTimerProvider? _timerProvider;

  @override
  void initState() {
    super.initState();
    // Initialize user data after the first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final userProvider = context.read<UserProvider>();
      // final courseProvider = context.read<CourseProvider>();
      // final authProvider = context.read<AuthProvider>();
      final audioProvider = context.read<AudioProvider>();

      // Initialize audio service
      audioProvider.initialize();

      // Connect providers with loading provider
      if (!userProvider.isLoading) {
        userProvider.initUser();
      }
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _timerProvider ??= Provider.of<SessionTimerProvider>(context);
  }

  @override
  void dispose() {
    // _timerProvider?.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer3<AuthProvider, UserProvider, ThemeProvider>(
      builder: (context, authProvider, userProvider, themeProvider, _) {
        return Consumer<LocaleProvider>(
          builder: (context, localeProvider, child) {
            return MaterialApp(
              title: 'English Fluency Guide',
              navigatorKey: NotificationService.navigatorKey,
              locale: localeProvider.locale,
              supportedLocales: LocaleProvider.supportedLocales,
              localizationsDelegates: const [
                AppLocalizations.delegate,
                GlobalMaterialLocalizations.delegate,
                GlobalWidgetsLocalizations.delegate,
                GlobalCupertinoLocalizations.delegate,
              ],
              debugShowCheckedModeBanner: false,
              theme: AppTheme.lightTheme,
              darkTheme: AppTheme.darkTheme,
              themeMode:
                  themeProvider.isDarkMode ? ThemeMode.dark : ThemeMode.light,
              builder: (context, child) {
                if (child == null) return const SizedBox.shrink();
                return MediaQuery(
                  data: MediaQuery.of(context)
                      .copyWith(textScaler: const TextScaler.linear(1.0)),
                  child: child,
                );
              },
              home: authProvider.isLoading
                  ? const Scaffold(
                      body: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            CircularProgressIndicator(),
                            SizedBox(height: 16),
                            Text('Loading...'),
                          ],
                        ),
                      ),
                    )
                  : authProvider.isAuthenticated
                      ? const HomeScreen()
                      : const AuthScreen(),
              routes: AppRoutes.routes,
              onGenerateRoute: AppRoutes.onGenerateRoute,
              onUnknownRoute: AppRoutes.onUnknownRoute,
            );
          },
        );
      },
    );
  }
}
