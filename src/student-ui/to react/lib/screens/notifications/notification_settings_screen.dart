import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/notification_service.dart';
import '../../l10n/app_localizations.dart';

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({Key? key}) : super(key: key);

  @override
  State<NotificationSettingsScreen> createState() =>
      _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState
    extends State<NotificationSettingsScreen> {
  bool _dailyRemindersEnabled = true;
  bool _achievementsEnabled = true;
  bool _newContentEnabled = true;
  bool _dailyChallengesEnabled = true;
  bool _streakRemindersEnabled = true;
  bool _isLoading = true;

  TimeOfDay _dailyReminderTime = const TimeOfDay(hour: 19, minute: 0);
  TimeOfDay _dailyChallengeTime = const TimeOfDay(hour: 9, minute: 0);

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  /// Load saved notification settings
  Future<void> _loadSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      setState(() {
        _dailyRemindersEnabled =
            prefs.getBool('daily_reminders_enabled') ?? true;
        _achievementsEnabled = prefs.getBool('achievements_enabled') ?? true;
        _newContentEnabled = prefs.getBool('new_content_enabled') ?? true;
        _dailyChallengesEnabled =
            prefs.getBool('daily_challenges_enabled') ?? true;
        _streakRemindersEnabled =
            prefs.getBool('streak_reminders_enabled') ?? true;

        // Load saved times
        final reminderHour = prefs.getInt('daily_reminder_hour') ?? 19;
        final reminderMinute = prefs.getInt('daily_reminder_minute') ?? 0;
        _dailyReminderTime =
            TimeOfDay(hour: reminderHour, minute: reminderMinute);

        final challengeHour = prefs.getInt('daily_challenge_hour') ?? 9;
        final challengeMinute = prefs.getInt('daily_challenge_minute') ?? 0;
        _dailyChallengeTime =
            TimeOfDay(hour: challengeHour, minute: challengeMinute);

        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading notification settings: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  /// Save notification settings
  Future<void> _saveSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      await prefs.setBool('daily_reminders_enabled', _dailyRemindersEnabled);
      await prefs.setBool('achievements_enabled', _achievementsEnabled);
      await prefs.setBool('new_content_enabled', _newContentEnabled);
      await prefs.setBool('daily_challenges_enabled', _dailyChallengesEnabled);
      await prefs.setBool('streak_reminders_enabled', _streakRemindersEnabled);

      // Save times
      await prefs.setInt('daily_reminder_hour', _dailyReminderTime.hour);
      await prefs.setInt('daily_reminder_minute', _dailyReminderTime.minute);
      await prefs.setInt('daily_challenge_hour', _dailyChallengeTime.hour);
      await prefs.setInt('daily_challenge_minute', _dailyChallengeTime.minute);

      // Show success feedback (only for time changes to avoid spam)
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white, size: 16),
                SizedBox(width: 8),
                Text('Settings saved successfully'),
              ],
            ),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 1),
            behavior: SnackBarBehavior.floating,
            margin: EdgeInsets.all(16),
          ),
        );
      }
    } catch (e) {
      debugPrint('Error saving notification settings: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.error, color: Colors.white, size: 16),
                SizedBox(width: 8),
                Text('Failed to save settings'),
              ],
            ),
            backgroundColor: Colors.red,
            duration: Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
            margin: EdgeInsets.all(16),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.notificationSettings),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Loading notification settings...'),
                ],
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.notifications_active,
                                color: Theme.of(context).primaryColor,
                                size: 28,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  l10n.stayMotivated,
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleLarge
                                      ?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            l10n.notificationSettingsDescription,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                  color: Colors.grey[600],
                                ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Daily Reminders Section
                  _buildNotificationSection(
                    title: l10n.dailyLearningReminders,
                    subtitle: l10n.dailyRemindersDescription,
                    icon: Icons.schedule,
                    color: const Color(0xFF6C63FF),
                    enabled: _dailyRemindersEnabled,
                    onChanged: (value) async {
                      setState(() {
                        _dailyRemindersEnabled = value;
                      });
                      await _saveSettings();
                      if (value) {
                        _scheduleDailyReminder();
                      } else {
                        NotificationService.cancelNotification(1);
                      }
                    },
                    child: _dailyRemindersEnabled
                        ? _buildTimeSelector(
                            l10n.reminderTime,
                            _dailyReminderTime,
                            (time) async {
                              setState(() {
                                _dailyReminderTime = time;
                              });
                              await _saveSettings();
                              _scheduleDailyReminder();
                            },
                          )
                        : null,
                  ),

                  const SizedBox(height: 16),

                  // Daily Challenges Section
                  _buildNotificationSection(
                    title: l10n.dailyChallenges,
                    subtitle: l10n.dailyChallengesDescription,
                    icon: Icons.emoji_events,
                    color: const Color(0xFFE91E63),
                    enabled: _dailyChallengesEnabled,
                    onChanged: (value) async {
                      setState(() {
                        _dailyChallengesEnabled = value;
                      });
                      await _saveSettings();
                      if (value) {
                        _scheduleDailyChallenge();
                      } else {
                        NotificationService.cancelNotification(2);
                      }
                    },
                    child: _dailyChallengesEnabled
                        ? _buildTimeSelector(
                            l10n.challengeTime,
                            _dailyChallengeTime,
                            (time) async {
                              setState(() {
                                _dailyChallengeTime = time;
                              });
                              await _saveSettings();
                              _scheduleDailyChallenge();
                            },
                          )
                        : null,
                  ),

                  const SizedBox(height: 16),

                  // Achievements Section
                  _buildNotificationSection(
                    title: l10n.achievementsAndStreaks,
                    subtitle: l10n.achievementsDescription,
                    icon: Icons.star,
                    color: const Color(0xFFFFB800),
                    enabled: _achievementsEnabled,
                    onChanged: (value) async {
                      setState(() {
                        _achievementsEnabled = value;
                      });
                      await _saveSettings();
                    },
                  ),

                  const SizedBox(height: 16),

                  // New Content Section
                  _buildNotificationSection(
                    title: l10n.newContent,
                    subtitle: l10n.newContentDescription,
                    icon: Icons.new_releases,
                    color: const Color(0xFF00BFA5),
                    enabled: _newContentEnabled,
                    onChanged: (value) async {
                      setState(() {
                        _newContentEnabled = value;
                      });
                      await _saveSettings();
                    },
                  ),

                  const SizedBox(height: 16),

                  // Streak Reminders Section
                  _buildNotificationSection(
                    title: l10n.streakReminders,
                    subtitle: l10n.streakRemindersDescription,
                    icon: Icons.local_fire_department,
                    color: const Color(0xFFFF5722),
                    enabled: _streakRemindersEnabled,
                    onChanged: (value) async {
                      setState(() {
                        _streakRemindersEnabled = value;
                      });
                      await _saveSettings();
                    },
                  ),

                  const SizedBox(height: 24),

                  // Manage All Notifications
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _manageAllNotifications,
                      icon: const Icon(Icons.settings),
                      label: Text(l10n.manageAllNotifications),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.grey[600],
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Reset to Defaults
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _resetToDefaults,
                      icon: const Icon(Icons.restore),
                      label: const Text('Reset to Defaults'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.orange,
                        side: const BorderSide(color: Colors.orange),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Debug Notifications
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _debugNotifications,
                      icon: const Icon(Icons.bug_report),
                      label: const Text('Debug Notifications'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.purple,
                        side: const BorderSide(color: Colors.purple),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildNotificationSection({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required bool enabled,
    required ValueChanged<bool> onChanged,
    Widget? child,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                      ),
                      Text(
                        subtitle,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey[600],
                            ),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: enabled,
                  onChanged: onChanged,
                  activeColor: color,
                ),
              ],
            ),
            if (child != null) ...[
              const SizedBox(height: 16),
              child,
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTimeSelector(
    String label,
    TimeOfDay time,
    ValueChanged<TimeOfDay> onTimeChanged,
  ) {
    return InkWell(
      onTap: () async {
        final newTime = await showTimePicker(
          context: context,
          initialTime: time,
        );
        if (newTime != null) {
          onTimeChanged(newTime);
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey[300]!),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            Row(
              children: [
                Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text(
                  '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _scheduleDailyReminder() {
    debugPrint(
        'Scheduling daily reminder for ${_dailyReminderTime.format(context)}');
    NotificationService.scheduleDailyReminder(
      hour: _dailyReminderTime.hour,
      minute: _dailyReminderTime.minute,
    );

    // Show confirmation
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.schedule, color: Colors.white, size: 16),
            const SizedBox(width: 8),
            Text(
                'Daily reminder scheduled for ${_dailyReminderTime.format(context)}'),
          ],
        ),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  void _scheduleDailyChallenge() {
    debugPrint(
        'Scheduling daily challenge for ${_dailyChallengeTime.format(context)}');
    NotificationService.scheduleDailyChallenge(
      hour: _dailyChallengeTime.hour,
      minute: _dailyChallengeTime.minute,
    );

    // Show confirmation
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.emoji_events, color: Colors.white, size: 16),
            const SizedBox(width: 8),
            Text(
                'Daily challenge scheduled for ${_dailyChallengeTime.format(context)}'),
          ],
        ),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  void _manageAllNotifications() async {
    await NotificationService.cancelAllNotifications();
    _showTestSnackBar('All notifications cancelled');
  }

  void _resetToDefaults() {
    setState(() {
      _dailyRemindersEnabled = true;
      _achievementsEnabled = true;
      _newContentEnabled = true;
      _dailyChallengesEnabled = true;
      _streakRemindersEnabled = true;
      _dailyReminderTime = const TimeOfDay(hour: 19, minute: 0);
      _dailyChallengeTime = const TimeOfDay(hour: 9, minute: 0);
    });
    _saveSettings();
    _manageAllNotifications();
  }

  void _showTestSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _debugNotifications() async {
    try {
      // Show debug info in console
      await NotificationService.showDebugInfo();

      // Check if reminders are scheduled
      final isReminderScheduled =
          await NotificationService.isDailyReminderScheduled();
      final isChallengeScheduled =
          await NotificationService.isDailyChallengeScheduled();

      // Show debug info to user
      String debugMessage = 'Debug Info:\n';
      debugMessage +=
          'Daily Reminder Scheduled: ${isReminderScheduled ? "Yes" : "No"}\n';
      debugMessage +=
          'Daily Challenge Scheduled: ${isChallengeScheduled ? "Yes" : "No"}\n';
      debugMessage += 'Reminder Time: ${_dailyReminderTime.format(context)}\n';
      debugMessage +=
          'Challenge Time: ${_dailyChallengeTime.format(context)}\n';
      debugMessage += 'Reminder Enabled: $_dailyRemindersEnabled\n';
      debugMessage += 'Challenge Enabled: $_dailyChallengesEnabled';

      // Show debug dialog
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Notification Debug Info'),
          content: SingleChildScrollView(
            child: Text(debugMessage),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                _testDailyReminder();
              },
              child: const Text('Test Reminder'),
            ),
          ],
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Debug error: $e'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  void _testDailyReminder() {
    NotificationService.showTestNotification(
      title: 'Daily Reminder Test',
      body: 'This is a test to verify notifications are working! 🎯',
    );
    _showTestSnackBar('Test reminder sent! Check your notifications.');
  }
}
