import 'package:englishfluencyguide/widgets/common/bottonNav.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/theme_provider.dart';
import '../routes/app_routes.dart';
import '../providers/user_provider.dart';
import '../providers/locale_provider.dart';
import '../l10n/app_localizations.dart';
import '../providers/course_provider.dart';
import '../providers/achievement_provider.dart';
import '../providers/recent_activity_provider.dart';
import '../widgets/recent_activities_widget.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:englishfluencyguide/screens/hard_words_screen.dart';
import 'package:cloud_functions/cloud_functions.dart';

import 'home/greeting_section.dart';
import 'home/learning_path_section.dart';
import 'home/progress_overview.dart';
import 'home/statistics_section.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  late AnimationController _greetingController;
  late AnimationController _statsController;
  late AnimationController _progressController;

  @override
  void initState() {
    super.initState();
    _greetingController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _statsController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    _progressController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );

    // Start animations with stagger
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) _greetingController.forward();
    });
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) _statsController.forward();
    });
    Future.delayed(const Duration(milliseconds: 900), () {
      if (mounted) _progressController.forward();
    });

    // Load recent activities after the first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  void _loadData() {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final activityProvider =
        Provider.of<RecentActivityProvider>(context, listen: false);
    final achievementProvider =
        Provider.of<AchievementProvider>(context, listen: false);

    if (userProvider.currentUser != null) {
      activityProvider.manualRefresh(userProvider.currentUser!.uid);
      achievementProvider.loadAchievements(userProvider.currentUser!.uid);
    }
  }

  @override
  void dispose() {
    _greetingController.dispose();
    _statsController.dispose();
    _progressController.dispose();
    super.dispose();
  }

  Future<void> _handleRefresh(BuildContext context) async {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    await userProvider.initUser();
    if (!mounted) return;
    _loadData();
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final userProvider = Provider.of<UserProvider>(context);
    final courseProvider = Provider.of<CourseProvider>(context);
    final achievementProvider =
        Provider.of<AchievementProvider>(context, listen: false);
    final theme = Theme.of(context);
    final user = userProvider.currentUser;
    final l10n = AppLocalizations.of(context)!;

    final completedLessons = user?.completedLessons?.length ?? 0;
    final enrolledCourseIds = user?.enrolledCourses ?? [];
    final allCourses = courseProvider.courses;
    final totalLessons = allCourses
        .where((course) => enrolledCourseIds.contains(course.id))
        .fold<int>(0, (sum, course) => sum + (course.totalLessons));
    final progress =
        totalLessons > 0 ? completedLessons / totalLessons.toDouble() : 0.0;
    final minutesToday = user?.todayStudyMinutes ?? 0;
    final currentStreak = user?.currentStreak ?? 0;

    return Scaffold(
      backgroundColor: theme.colorScheme.surface,
      appBar: _buildEnhancedAppBar(theme, themeProvider, l10n),
      body: RefreshIndicator(
        onRefresh: () => _handleRefresh(context),
        color: theme.colorScheme.primary,
        backgroundColor: theme.colorScheme.surface,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Enhanced Greeting Section
              AnimatedBuilder(
                animation: _greetingController,
                builder: (context, child) {
                  return Transform.translate(
                    offset: Offset(0, 20 * (1 - _greetingController.value)),
                    child: Opacity(
                      opacity: _greetingController.value,
                      child: GreetingSection(user: user),
                    ),
                  );
                },
              ),
              const SizedBox(height: 24),

              // Enhanced Progress Overview
              AnimatedBuilder(
                animation: _progressController,
                builder: (context, child) {
                  return Transform.translate(
                    offset: Offset(0, 30 * (1 - _progressController.value)),
                    child: Opacity(
                      opacity: _progressController.value,
                      child: ProgressOverview(
                        progress: progress,
                        minutesToday: minutesToday,
                        currentStreak: currentStreak,
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 24),

              // Enhanced Statistics Cards
              AnimatedBuilder(
                animation: _statsController,
                builder: (context, child) {
                  return Transform.translate(
                    offset: Offset(0, 40 * (1 - _statsController.value)),
                    child: Opacity(
                      opacity: _statsController.value,
                      child: StatisticsSection(
                        user: user,
                        achievementProvider: achievementProvider,
                      ),
                    ),
                  );
                },
              ),

              const SizedBox(height: 24),

              // Recent Activities
              if (user != null)
                RecentActivitiesWidget(
                  userId: user.uid,
                  showIncompleteOnly: true,
                ).animate().fadeIn(delay: 1300.ms).slideY(begin: 0.3),
              const SizedBox(height: 24),
              if (user != null)
                RecentActivitiesWidget(
                  userId: user.uid,
                  showIncompleteOnly: false,
                ).animate().fadeIn(delay: 1300.ms).slideY(begin: 0.3),
              const SizedBox(height: 24),

              // Learning Path
              const LearningPathSection()
                  .animate()
                  .fadeIn(delay: 1400.ms)
                  .slideY(begin: 0.3),
              const SizedBox(height: 24),
              // Add Hard Words Review Button
              // Achievements Section
              Consumer<AchievementProvider>(
                builder: (context, achievementProvider, child) {
                  if (achievementProvider.isLoading) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (achievementProvider.achievements.isEmpty) {
                    return const Center(child: Text('No achievements yet.'));
                  }

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n.achievements,
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      const SizedBox(height: 16),
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: 3 / 2,
                        ),
                        itemCount: achievementProvider.achievements.length,
                        itemBuilder: (context, index) {
                          final achievement = achievementProvider.achievements[index];
                          return Card(
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(achievement.title, style: theme.textTheme.titleMedium),
                                  const SizedBox(height: 8),
                                  Text(achievement.description, style: theme.textTheme.bodySmall),
                                  const SizedBox(height: 8),
                                  if (achievement.isUnlocked)
                                    const Icon(Icons.check_circle, color: Colors.green)
                                  else
                                    const Icon(Icons.lock, color: Colors.grey),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const BottomNav(),
    );
  }

  PreferredSizeWidget _buildEnhancedAppBar(
      ThemeData theme, ThemeProvider themeProvider, AppLocalizations l10n) {
    return AppBar(
      automaticallyImplyLeading: false,
      elevation: 0,
      backgroundColor: theme.colorScheme.surface,
      surfaceTintColor: theme.colorScheme.surface,
      title: Image.asset(
        'assets/images/logo.png',
        width: 50,
        height: 50,
      ),
      actions: [
        _buildActionButton(
          icon: Icons.language,
          onPressed: () => _showLanguageDialog(context),
          tooltip: 'Language',
        ),
        _buildActionButton(
          icon: themeProvider.isDarkMode ? Icons.light_mode : Icons.dark_mode,
          onPressed: () => themeProvider.toggleTheme(),
          tooltip: 'Toggle Theme',
        ),
        _buildActionButton(
          icon: Icons.notifications_outlined,
          onPressed: () {
            Navigator.pushNamed(context, AppRoutes.notifications);
          },
          tooltip: 'Notifications',
        ),
        // _buildActionButton(
        //   icon: Icons.settings,
        //   onPressed: () {
        //     Navigator.pushNamed(context, AppRoutes.settings);
        //   },
        //   tooltip: 'Notification Settings',
        // ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required VoidCallback onPressed,
    required String tooltip,
  }) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      child: Tooltip(
        message: tooltip,
        child: IconButton(
          icon: Icon(icon),
          onPressed: onPressed,
          style: IconButton.styleFrom(
            backgroundColor:
                Theme.of(context).colorScheme.surfaceContainerHighest,
            foregroundColor: Theme.of(context).colorScheme.onSurface,
          ),
        ),
      ),
    );
  }

  void _showLanguageDialog(BuildContext context) {
    final localeProvider = Provider.of<LocaleProvider>(context, listen: false);
    final l10n = AppLocalizations.of(context)!;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(Icons.language, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 12),
            Text(l10n.selectLanguage),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _LanguageOption(
              title: 'English',
              subtitle: 'English',
              flag: '🇺🇸',
              onTap: () {
                localeProvider.setLocale(const Locale('en'));
                Navigator.pop(context);
              },
            ),
            const SizedBox(
              height: 10,
            ),
            _LanguageOption(
              title: 'العربية',
              subtitle: 'Arabic',
              flag: '🇸🇦',
              onTap: () {
                localeProvider.setLocale(const Locale('ar'));
                Navigator.pop(context);
              },
            ),
            const SizedBox(
              height: 10,
            ),
            _LanguageOption(
              title: 'Français',
              subtitle: 'French',
              flag: '🇫🇷',
              onTap: () {
                localeProvider.setLocale(const Locale('fr'));
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _LanguageOption extends StatelessWidget {
  final String title;
  final String subtitle;
  final String flag;
  final VoidCallback onTap;

  const _LanguageOption({
    required this.title,
    required this.subtitle,
    required this.flag,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ListTile(
      leading: Text(flag, style: const TextStyle(fontSize: 24)),
      title: Text(title),
      subtitle: Text(subtitle),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      tileColor: theme.colorScheme.surfaceContainerHighest
          .withAlpha((0.3 * 255).toInt()),
    );
  }
}
