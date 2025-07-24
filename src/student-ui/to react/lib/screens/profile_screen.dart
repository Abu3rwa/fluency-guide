import 'package:englishfluencyguide/providers/locale_provider.dart';
import 'package:englishfluencyguide/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_provider.dart';
import '../providers/achievement_provider.dart';
import '../../../../../migrate/lib/models/user_model.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/auth_service.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:app_settings/app_settings.dart';
import '../l10n/app_localizations.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _progressSyncEnabled = false;
  String _fluencyLevel = 'Beginner';
  int _dailyStudyGoal = 30;
  String _difficultyLevel = 'Beginner';
  List<String> _learningFocusAreas = [];
  String _preferredAccent = 'American';
  bool _notificationsEnabled = true;
  bool _soundEnabled = true;
  bool _dailyReminderEnabled = true;
  TimeOfDay _reminderTime = const TimeOfDay(hour: 9, minute: 0);

  @override
  void initState() {
    super.initState();
    _loadSettings();
    _loadAchievements();
  }

  Future<void> _loadSettings() async {
    if (!mounted) return;

    final user = Provider.of<UserProvider>(context, listen: false).currentUser;
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _progressSyncEnabled = prefs.getBool('progressSyncEnabled') ?? false;
      _fluencyLevel = (user?.preferences?['fluencyLevel'] as String?) ??
          prefs.getString('fluencyLevel') ??
          'Beginner';
      _dailyStudyGoal = (user?.preferences?['dailyStudyGoal'] as int?) ??
          prefs.getInt('dailyStudyGoal') ??
          30;
      _difficultyLevel = (user?.preferences?['difficultyLevel'] as String?) ??
          prefs.getString('difficultyLevel') ??
          'Beginner';
      _learningFocusAreas =
          (user?.preferences?['learningFocusAreas'] as List<dynamic>?)
                  ?.cast<String>() ??
              prefs.getStringList('learningFocusAreas') ??
              [];
      _preferredAccent = (user?.preferences?['preferredAccent'] as String?) ??
          prefs.getString('preferredAccent') ??
          'American';
      _notificationsEnabled = prefs.getBool('notificationsEnabled') ?? true;
      _soundEnabled = prefs.getBool('soundEnabled') ?? true;
      _dailyReminderEnabled = prefs.getBool('dailyReminderEnabled') ?? true;
      final reminderHour = prefs.getInt('reminderHour') ?? 9;
      final reminderMinute = prefs.getInt('reminderMinute') ?? 0;
      _reminderTime = TimeOfDay(hour: reminderHour, minute: reminderMinute);
    });
  }

  Future<void> _loadAchievements() async {
    final user = Provider.of<UserProvider>(context, listen: false).currentUser;
    if (user != null) {
      await Provider.of<AchievementProvider>(context, listen: false)
          .loadUserAchievements(user.uid);
    }
  }

  Future<void> _saveSetting<T>(String key, T value) async {
    final prefs = await SharedPreferences.getInstance();
    if (value is bool) {
      await prefs.setBool(key, value);
    } else if (value is int) {
      await prefs.setInt(key, value);
    } else if (value is double) {
      await prefs.setDouble(key, value);
    } else if (value is String) {
      await prefs.setString(key, value);
    } else if (value is List<String>) {
      await prefs.setStringList(key, value);
    }
  }

  Future<void> _signOut() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    try {
      await authService.signOut();
      userProvider.signOut();
      if (mounted) {
        Navigator.of(
          context,
        ).pushNamedAndRemoveUntil('/auth', (Route<dynamic> route) => false);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error signing out: $e')));
      }
    }
  }

  String _formatDate(DateTime? date) {
    if (date == null) return 'Not available';
    return DateFormat('MMM d, yyyy').format(date);
  }

  String _formatDuration(int? minutes) {
    if (minutes == null) return '0 min';
    final hours = minutes ~/ 60;
    final remainingMinutes = minutes % 60;
    if (hours > 0) {
      return '$hours h ${remainingMinutes}m';
    }
    return '$remainingMinutes min';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final userProvider = Provider.of<UserProvider>(context);
    final user = userProvider.currentUser;
    final l10n = AppLocalizations.of(context)!;

    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.profile)),
        body: Center(child: Text(l10n.pleaseSignIn)),
      );
    }

    // Get user preferences from the user model
    final preferences = user.preferences ?? {};
    final progress = user.progress ?? {};

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.profile),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () {
              final user =
                  Provider.of<UserProvider>(context, listen: false).currentUser;
              if (user != null) {
                _showEditProfileDialog(context, user);
              }
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await userProvider.initUser();
          await _loadSettings();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Profile Header Section
              _buildProfileHeader(context, user, theme, colorScheme),

              const SizedBox(height: 16),

              // Stats Section

              // Learning Preferences Section
              _buildLearningPreferencesSection(context, theme, preferences),

              const SizedBox(height: 24),

              // Account Information Section
              _buildAccountInfoSection(context, user, theme),

              const SizedBox(height: 24),

              // App Settings Section
              _buildAppSettingsSection(context, theme),

              const SizedBox(height: 24),

              // Account Actions Section
              _buildAccountActionsSection(context, theme),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader(
    BuildContext context,
    UserModel user,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    final l10n = AppLocalizations.of(context)!;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: colorScheme.shadow.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: colorScheme.primary.withOpacity(0.1),
            backgroundImage: user.profileImage.isNotEmpty
                ? NetworkImage(user.profileImage)
                : null,
            child: user.profileImage.isEmpty
                ? Icon(Icons.person, size: 50, color: colorScheme.primary)
                : null,
          ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),
          const SizedBox(height: 16),
          Text(
            user.name,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ).animate().fadeIn().slideY(begin: 0.2, curve: Curves.easeOutQuart),
          const SizedBox(height: 4),
          Text(
            '${user.isAdmin ? l10n.administrator : l10n.student} • ${user.preferredLanguage ?? l10n.preferredLanguage}',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.primary,
              fontWeight: FontWeight.w500,
            ),
          )
              .animate()
              .fadeIn(delay: 100.ms)
              .slideY(begin: 0.2, curve: Curves.easeOutQuart),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.email_outlined,
                size: 16,
                color: colorScheme.onSurface.withOpacity(0.6),
              ),
              const SizedBox(width: 4),
              Text(
                user.email,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurface.withOpacity(0.6),
                ),
              ),
              if (user.emailVerified == true) ...[
                const SizedBox(width: 4),
                Icon(Icons.verified, size: 16, color: colorScheme.primary),
              ],
            ],
          )
              .animate()
              .fadeIn(delay: 200.ms)
              .slideY(begin: 0.2, curve: Curves.easeOutQuart),
        ],
      ),
    );
  }

  Widget _buildLearningPreferencesSection(
    BuildContext context,
    ThemeData theme,
    Map<String, dynamic> preferences,
  ) {
    final l10n = AppLocalizations.of(context)!;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            l10n.learningPreferences,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ).animate().fadeIn(delay: 800.ms),
          const SizedBox(height: 12),
          _buildInfoCard(context, [
            _InfoItem(
              icon: Icons.timer,
              label: l10n.dailyStudyGoal,
              value: l10n.minutes(
                  (preferences['dailyStudyGoal'] ?? _dailyStudyGoal) as int),
              onTap: () => _showDailyStudyGoalDialog(context),
            ),
          ])
              .animate()
              .fadeIn(delay: 900.ms)
              .slideY(begin: 0.2, curve: Curves.easeOutQuart),
        ],
      ),
    );
  }

  Widget _buildAccountInfoSection(
    BuildContext context,
    UserModel user,
    ThemeData theme,
  ) {
    final selectedLanguage = user.preferredLanguage;
    String? lang;
    if (selectedLanguage == "en") {
      lang = "English";
    } else {
      lang = "العربية";
    }
    final l10n = AppLocalizations.of(context)!;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.accountInformation,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ).animate().fadeIn(delay: 1000.ms),
          const SizedBox(height: 16),
          _buildInfoCard(context, [
            _InfoItem(
              icon: Icons.email_outlined,
              label: l10n.email,
              value: user.email,
            ),
            _InfoItem(
              icon: Icons.verified_user,
              label: l10n.accountType,
              value: user.isAdmin ? l10n.admin : l10n.student,
            ),
            _InfoItem(
              icon: Icons.calendar_today,
              label: l10n.memberSince,
              value: _formatDate(user.createdAt),
            ),
            _InfoItem(
              icon: Icons.login,
              label: l10n.lastLogin,
              value: _formatDate(user.lastLogin),
            ),
            _InfoItem(
              icon: Icons.language,
              label: l10n.preferredLanguage,
              value: lang ?? l10n.language,
              onTap: () => _showLanguageSelectionDialog(context, user),
            ),
            if (user.phoneNumber != null)
              _InfoItem(
                icon: Icons.phone,
                label: l10n.phoneNumber,
                value: user.phoneNumber!,
              ),
            if (user.bio != null)
              _InfoItem(
                icon: Icons.description,
                label: l10n.bio,
                value: user.bio!,
              ),
          ])
              .animate()
              .fadeIn(delay: 1100.ms)
              .slideY(begin: 0.2, curve: Curves.easeOutQuart),
        ],
      ),
    );
  }

  Widget _buildAppSettingsSection(BuildContext context, ThemeData theme) {
    final l10n = AppLocalizations.of(context)!;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.appSettings,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ).animate().fadeIn(delay: 1200.ms),
          const SizedBox(height: 16),
          _buildInfoCard(context, [
            _InfoItem(
              icon: Icons.notifications,
              label: l10n.notifications,
              value: _notificationsEnabled ? l10n.enabled : l10n.disabled,
              onTap: () => _toggleNotifications(!_notificationsEnabled),
            ),
            _InfoItem(
              icon: Icons.volume_up,
              label: l10n.sound,
              value: _soundEnabled ? l10n.enabled : l10n.disabled,
              onTap: () => _toggleSound(!_soundEnabled),
            ),
            _InfoItem(
              icon: Icons.access_time,
              label: l10n.dailyReminder,
              value: _dailyReminderEnabled
                  ? '${_reminderTime.format(context)}'
                  : l10n.disabled,
              onTap: () => _toggleDailyReminder(!_dailyReminderEnabled),
            ),
          ])
              .animate()
              .fadeIn(delay: 1300.ms)
              .slideY(begin: 0.2, curve: Curves.easeOutQuart),
        ],
      ),
    );
  }

  Widget _buildAccountActionsSection(BuildContext context, ThemeData theme) {
    final l10n = AppLocalizations.of(context)!;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.accountActions,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ).animate().fadeIn(delay: 1400.ms),
          const SizedBox(height: 16),
          _buildInfoCard(context, [
            _InfoItem(
              icon: Icons.file_download,
              label: l10n.exportData,
              value: l10n.downloadLearningData,
              onTap: () {
                // TODO: Implement data export
              },
            ),
            _InfoItem(
              icon: Icons.person_remove,
              label: l10n.deleteAccount,
              value: l10n.deleteAccountDescription,
              onTap: () {
                // TODO: Implement account deletion
              },
            ),
            _InfoItem(
              icon: Icons.logout,
              label: l10n.signOut,
              value: l10n.signOutDescription,
              onTap: _signOut,
            ),
          ])
              .animate()
              .fadeIn(delay: 1500.ms)
              .slideY(begin: 0.2, curve: Curves.easeOutQuart),
        ],
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: theme.colorScheme.shadow.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurface.withOpacity(0.6),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(BuildContext context, List<_InfoItem> items) {
    final theme = Theme.of(context);
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: theme.colorScheme.shadow.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: items.map((item) {
          final isLast = items.last == item;
          return InkWell(
            onTap: item.onTap,
            child: Container(
              decoration: BoxDecoration(
                border: !isLast
                    ? Border(
                        bottom: BorderSide(
                          color: theme.colorScheme.outline.withOpacity(0.1),
                        ),
                      )
                    : null,
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  Icon(item.icon, size: 20, color: theme.colorScheme.primary),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          item.label,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurface.withOpacity(0.6),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          item.value,
                          style: theme.textTheme.bodyLarge?.copyWith(
                            fontWeight: FontWeight.w500,
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 2,
                        ),
                      ],
                    ),
                  ),
                  if (item.onTap != null)
                    Icon(
                      Icons.chevron_right,
                      size: 20,
                      color: theme.colorScheme.onSurface.withOpacity(0.3),
                    ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // Dialog methods
  Future<void> _showDailyStudyGoalDialog(BuildContext context) async {
    int? selectedGoal = await showDialog<int>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Select Daily Study Goal'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RadioListTile<int>(
                title: const Text('15 minutes'),
                value: 15,
                groupValue: _dailyStudyGoal,
                onChanged: (int? value) {
                  Navigator.pop(context, value);
                },
              ),
              RadioListTile<int>(
                title: const Text('30 minutes'),
                value: 30,
                groupValue: _dailyStudyGoal,
                onChanged: (int? value) {
                  Navigator.pop(context, value);
                },
              ),
              RadioListTile<int>(
                title: const Text('45 minutes'),
                value: 45,
                groupValue: _dailyStudyGoal,
                onChanged: (int? value) {
                  Navigator.pop(context, value);
                },
              ),
              RadioListTile<int>(
                title: const Text('60 minutes'),
                value: 60,
                groupValue: _dailyStudyGoal,
                onChanged: (int? value) {
                  Navigator.pop(context, value);
                },
              ),
            ],
          ),
        );
      },
    );
    if (selectedGoal != null) {
      await _saveSetting('dailyStudyGoal', selectedGoal);
      if (!mounted) return;
      setState(() {
        _dailyStudyGoal = selectedGoal;
      });
    }
  }

  Future<void> _showDifficultyLevelDialog(BuildContext context) async {
    String? selectedLevel = await showDialog<String>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Select Difficulty Level'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RadioListTile<String>(
                title: const Text('Beginner'),
                value: 'Beginner',
                groupValue: _difficultyLevel,
                onChanged: (String? value) {
                  Navigator.pop(context, value);
                },
              ),
              RadioListTile<String>(
                title: const Text('Intermediate'),
                value: 'Intermediate',
                groupValue: _difficultyLevel,
                onChanged: (String? value) {
                  Navigator.pop(context, value);
                },
              ),
              RadioListTile<String>(
                title: const Text('Advanced'),
                value: 'Advanced',
                groupValue: _difficultyLevel,
                onChanged: (String? value) {
                  Navigator.pop(context, value);
                },
              ),
            ],
          ),
        );
      },
    );
    if (selectedLevel != null) {
      await _saveSetting('difficultyLevel', selectedLevel);
      if (!mounted) return;
      setState(() {
        _difficultyLevel = selectedLevel;
      });
    }
  }

  Future<void> _showLanguageSelectionDialog(
      BuildContext context, UserModel user) async {
    final l10n = AppLocalizations.of(context)!;
    final languages = {
      'en': 'English',
      'ar': 'العربية',
      // Add more if needed
    };

    String? selected = await showDialog<String>(
      context: context,
      builder: (context) => SimpleDialog(
        title: Text(l10n.selectLanguage),
        children: languages.entries.map((entry) {
          return SimpleDialogOption(
            onPressed: () => Navigator.pop(context, entry.key),
            child: Text(entry.value),
          );
        }).toList(),
      ),
    );
    if (selected != null && selected != user.preferredLanguage) {
      if (!mounted) return;
      await Provider.of<UserProvider>(context, listen: false)
          .updatePreferredLanguage(selected);
      // Optionally update the app locale immediately
      if (!mounted) return;
      Provider.of<LocaleProvider>(context, listen: false)
          .setLocale(Locale(selected));
      setState(() {});
    }
  }

  Future<void> _openAppSettings() async {
    try {
      // Try using app_settings package first
      await AppSettings.openAppSettings();
    } catch (e) {
      try {
        // Fallback to permission_handler
        await openAppSettings();
      } catch (e) {
        if (mounted) {
          // If both methods fail, show instructions to open settings manually
          showDialog(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                title: const Text('Open Settings'),
                content: const Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Please follow these steps to enable notifications:'),
                    SizedBox(height: 8),
                    Text('1. Open your device Settings'),
                    Text('2. Find and tap on "Apps" or "Applications"'),
                    Text('3. Find and tap on "English Fluency"'),
                    Text('4. Tap on "Permissions"'),
                    Text('5. Enable "Notifications"'),
                  ],
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('OK'),
                  ),
                ],
              );
            },
          );
        }
      }
    }
  }

  Future<void> _toggleNotifications(bool value) async {
    await _saveSetting('notificationsEnabled', value);
    if (!mounted) return;
    setState(() {
      _notificationsEnabled = value;
    });
  }

  Future<void> _toggleSound(bool value) async {
    await _saveSetting('soundEnabled', value);
    if (!mounted) return;
    setState(() {
      _soundEnabled = value;
    });
  }

  Future<void> _toggleDailyReminder(bool value) async {
    await _saveSetting('dailyReminderEnabled', value);
    if (!mounted) return;
    setState(() {
      _dailyReminderEnabled = value;
    });
  }

  Future<void> _showReminderTimeDialog(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _reminderTime,
      builder: (BuildContext context, Widget? child) {
        return Theme(
          data: Theme.of(context).copyWith(
            timePickerTheme: TimePickerThemeData(
              backgroundColor: Theme.of(context).colorScheme.surface,
              hourMinuteShape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(color: Theme.of(context).colorScheme.primary),
              ),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && picked != _reminderTime) {
      await _saveSetting('reminderHour', picked.hour);
      await _saveSetting('reminderMinute', picked.minute);
      if (!mounted) return;
      setState(() {
        _reminderTime = picked;
      });

      // Schedule the reminder

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Daily reminder set for ${picked.format(context)}'),
          ),
        );
      }
    }
  }

  Widget _buildSettingItem({
    required String title,
    required Widget? child,
    VoidCallback? onTap,
    bool isLast = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          bottom: !isLast
              ? BorderSide(color: Theme.of(context).dividerColor, width: 0.5)
              : BorderSide.none,
        ),
      ),
      child: ListTile(
        title: Text(title),
        trailing: child ?? const SizedBox.shrink(),
        onTap: onTap,
      ),
    );
  }

  Future<void> _showEditProfileDialog(
      BuildContext context, UserModel user) async {
    final nameController = TextEditingController(text: user.name);
    final bioController = TextEditingController(text: user.bio ?? '');

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Profile'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'Name'),
            ),
            TextField(
              controller: bioController,
              decoration: const InputDecoration(labelText: 'Bio'),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Save'),
          ),
        ],
      ),
    );

    if (result == true) {
      await _updateProfile(nameController.text, bioController.text);
    }
  }

  Future<void> _updateProfile(String name, String bio) async {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final authService = Provider.of<AuthService>(context, listen: false);
    final user = userProvider.currentUser;
    if (user == null) return;

    // Update in Firestore
    final updated = await authService.updateUserProfile(user.uid, {
      'name': name,
      'bio': bio,
    });

    // Refresh user in provider
    await userProvider.initUser();

    if (mounted) {
      setState(() {}); // Refresh UI
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated!')),
      );
    }
  }
}

class _InfoItem {
  final IconData icon;
  final String label;
  final String value;
  final VoidCallback? onTap;

  _InfoItem({
    required this.icon,
    required this.label,
    required this.value,
    this.onTap,
  });
}
