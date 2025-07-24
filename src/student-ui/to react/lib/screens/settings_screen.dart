import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_provider.dart';
import '../services/auth_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../../migrate/lib/models/user_model.dart';
import '../theme/app_theme.dart';
import '../theme/theme_provider.dart';
import '../widgets/language_selector.dart';
import '../widgets/streak_widget.dart';
import '../l10n/app_localizations.dart';
import 'notifications/notification_settings_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _progressSyncEnabled = false;
  String _fluencyLevel = 'Beginner';
  int _dailyStudyGoal = 30;
  String _difficultyLevel = 'Beginner';
  List<String> _learningFocusAreas = [];
  String _preferredAccent = 'American';

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _progressSyncEnabled = prefs.getBool('progressSyncEnabled') ?? false;
      _fluencyLevel = prefs.getString('fluencyLevel') ?? 'Beginner';
      _dailyStudyGoal = prefs.getInt('dailyStudyGoal') ?? 30;
      _difficultyLevel = prefs.getString('difficultyLevel') ?? 'Beginner';
      _learningFocusAreas = prefs.getStringList('learningFocusAreas') ?? [];
      _preferredAccent = prefs.getString('preferredAccent') ?? 'American';
    });
  }

  Future<void> _toggleProgressSync(bool value) async {
    setState(() {
      _progressSyncEnabled = value;
    });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('progressSyncEnabled', value);
  }

  Future<void> _signOut() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    try {
      await authService.signOut();
      userProvider.signOut();
      Navigator.of(context).pushNamedAndRemoveUntil(
        '/auth', // Navigate to the authentication screen
        (Route<dynamic> route) => false, // Remove all previous routes
      );
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error signing out: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final route = ModalRoute.of(context);
    if (route == null || route.settings.arguments == null) {
      return Scaffold(
        appBar: AppBar(
          title: Text(AppLocalizations.of(context)!.settings),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
        body: Center(
            child:
                Text(AppLocalizations.of(context)!.settingsDataNotAvailable)),
      );
    }

    final args = route.settings.arguments as Map<String, dynamic>;
    final userProvider = Provider.of<UserProvider>(context);
    final UserModel? currentUser = userProvider.currentUser;
    final themeProvider = Provider.of<ThemeProvider>(context);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.settings)),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Profile & Account Section
          _buildSectionTitle(l10n.profileAndAccount),
          Card(
            margin: const EdgeInsets.symmetric(vertical: 8.0),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: Colors.grey[200],
                    backgroundImage:
                        currentUser?.profileImage?.isNotEmpty == true
                            ? NetworkImage(currentUser?.profileImage ?? '')
                            : null,
                    child: currentUser?.profileImage?.isEmpty == true
                        ? Icon(Icons.person, size: 40, color: Colors.grey[400])
                        : null,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    currentUser?.name ?? l10n.guestUser,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  Text(
                    currentUser?.email ?? l10n.noEmail,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${l10n.fluencyLevel}: $_fluencyLevel',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontStyle: FontStyle.italic,
                        ),
                  ),
                  const SizedBox(height: 16),
                  ListTile(
                    leading: const Icon(Icons.sync),
                    title: Text(l10n.progressSync),
                    trailing: Switch(
                      value: _progressSyncEnabled,
                      onChanged: _toggleProgressSync,
                    ),
                    onTap: () => _toggleProgressSync(!_progressSyncEnabled),
                  ),
                  ListTile(
                    leading: const Icon(Icons.logout),
                    title: Text(l10n.signOut),
                    onTap: _signOut,
                  ),
                  ListTile(
                    leading: const Icon(Icons.person_remove),
                    title: Text(l10n.deleteAccount),
                    onTap: () {
                      // TODO: Implement delete account functionality
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.file_download),
                    title: Text(l10n.exportData),
                    onTap: () {
                      // TODO: Implement data export functionality
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Learning Preferences Section
          _buildSectionTitle(l10n.learningPreferences),
          Card(
            margin: const EdgeInsets.symmetric(vertical: 8.0),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSettingsTile(
                    title: l10n.dailyStudyGoal,
                    subtitle: '$_dailyStudyGoal ${l10n.minutes}',
                    icon: Icons.timer,
                    onTap: () => _showDailyStudyGoalDialog(context),
                  ),
                  _buildSettingsTile(
                    title: l10n.difficultyLevel,
                    subtitle: _difficultyLevel,
                    icon: Icons.school,
                    onTap: () => _showDifficultyLevelDialog(context),
                  ),
                  _buildSettingsTile(
                    title: l10n.learningFocusAreas,
                    subtitle: _learningFocusAreas.isEmpty
                        ? l10n.noneSelected
                        : _learningFocusAreas.join(', '),
                    icon: Icons.my_library_books,
                    onTap: () => _showLearningFocusAreasDialog(context),
                  ),
                  _buildSettingsTile(
                    title: l10n.preferredAccent,
                    subtitle: _preferredAccent,
                    icon: Icons.record_voice_over,
                    onTap: () => _showPreferredAccentDialog(context),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Theme Settings
          _buildSectionTitle(l10n.theme),
          Card(
            child: Column(
              children: [
                ListTile(
                  title: Text(l10n.lightMode),
                  trailing: !themeProvider.isDarkMode
                      ? const Icon(Icons.check, color: Colors.green)
                      : null,
                  onTap: () {
                    themeProvider.setTheme(false);
                  },
                ),
                ListTile(
                  title: Text(l10n.darkMode),
                  trailing: themeProvider.isDarkMode
                      ? const Icon(Icons.check, color: Colors.green)
                      : null,
                  onTap: () {
                    themeProvider.setTheme(true);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Notification Settings
          _buildSectionTitle('Notifications'),
          Card(
            margin: const EdgeInsets.symmetric(vertical: 8.0),
            child: ListTile(
              leading: const Icon(Icons.notifications_active),
              title: const Text('Notification Settings'),
              subtitle: const Text('Configure learning reminders and alerts'),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const NotificationSettingsScreen(),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 24),

          // Data Management Section
          _buildSectionTitle('Data Management'),
          Card(
            margin: const EdgeInsets.symmetric(vertical: 8.0),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.cloud_upload),
                  title: const Text('Vocabulary Upload'),
                  subtitle: const Text('Upload vocabulary data to Firebase'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    Navigator.pushNamed(context, '/vocabularyUpload');
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.file_download),
                  title: const Text('Export Data'),
                  subtitle: const Text('Download your learning progress'),
                  onTap: () {
                    // TODO: Implement data export functionality
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Data export feature coming soon!'),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Language Settings
          const LanguageSelector(),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).colorScheme.secondary,
            ),
      ),
    );
  }

  Widget _buildSettingsTile({
    required String title,
    required String subtitle,
    required IconData icon,
    VoidCallback? onTap,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: Text(subtitle),
      onTap: onTap,
    );
  }

  // Dialogs for Learning Preferences

  Future<void> _showDailyStudyGoalDialog(BuildContext context) async {
    final l10n = AppLocalizations.of(context)!;
    int? selectedGoal = await showDialog<int>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(l10n.selectDailyStudyGoal),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RadioListTile<int>(
                title: Text('15 ${l10n.minutes}'),
                value: 15,
                groupValue: _dailyStudyGoal,
                onChanged: (int? value) {
                  Navigator.pop(context, value);
                },
              ),
              RadioListTile<int>(
                title: Text('30 ${l10n.minutes}'),
                value: 30,
                groupValue: _dailyStudyGoal,
                onChanged: (int? value) {
                  Navigator.pop(context, value);
                },
              ),
              RadioListTile<int>(
                title: Text('45 ${l10n.minutes}'),
                value: 45,
                groupValue: _dailyStudyGoal,
                onChanged: (int? value) {
                  Navigator.pop(context, value);
                },
              ),
              RadioListTile<int>(
                title: Text('60 ${l10n.minutes}'),
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
      setState(() {
        _dailyStudyGoal = selectedGoal;
      });
    }
  }

  Future<void> _showDifficultyLevelDialog(BuildContext context) async {
    final l10n = AppLocalizations.of(context)!;
    String? selectedLevel = await showDialog<String>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(l10n.selectDifficultyLevel),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RadioListTile<String>(
                title: Text(l10n.beginner),
                value: l10n.beginner,
                groupValue: _difficultyLevel,
                onChanged: (String? value) {
                  Navigator.pop(context, value);
                },
              ),
              RadioListTile<String>(
                title: Text(l10n.intermediate),
                value: l10n.intermediate,
                groupValue: _difficultyLevel,
                onChanged: (String? value) {
                  Navigator.pop(context, value);
                },
              ),
              RadioListTile<String>(
                title: Text(l10n.advanced),
                value: l10n.advanced,
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
      setState(() {
        _difficultyLevel = selectedLevel;
      });
    }
  }

  Future<void> _showLearningFocusAreasDialog(BuildContext context) async {
    final l10n = AppLocalizations.of(context)!;
    List<String>? selectedAreas = await showDialog<List<String>>(
      context: context,
      builder: (BuildContext context) {
        List<String> tempSelectedAreas = List.from(_learningFocusAreas);
        return AlertDialog(
          title: Text(l10n.selectLearningFocusAreas),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CheckboxListTile(
                title: Text(l10n.grammar),
                value: tempSelectedAreas.contains(l10n.grammar),
                onChanged: (bool? value) {
                  setState(() {
                    if (value == true) {
                      tempSelectedAreas.add(l10n.grammar);
                    } else {
                      tempSelectedAreas.remove(l10n.grammar);
                    }
                  });
                },
              ),
              CheckboxListTile(
                title: Text(l10n.vocabulary),
                value: tempSelectedAreas.contains(l10n.vocabulary),
                onChanged: (bool? value) {
                  setState(() {
                    if (value == true) {
                      tempSelectedAreas.add(l10n.vocabulary);
                    } else {
                      tempSelectedAreas.remove(l10n.vocabulary);
                    }
                  });
                },
              ),
              CheckboxListTile(
                title: Text(l10n.pronunciation),
                value: tempSelectedAreas.contains(l10n.pronunciation),
                onChanged: (bool? value) {
                  setState(() {
                    if (value == true) {
                      tempSelectedAreas.add(l10n.pronunciation);
                    } else {
                      tempSelectedAreas.remove(l10n.pronunciation);
                    }
                  });
                },
              ),
              CheckboxListTile(
                title: Text(l10n.conversation),
                value: tempSelectedAreas.contains(l10n.conversation),
                onChanged: (bool? value) {
                  setState(() {
                    if (value == true) {
                      tempSelectedAreas.add(l10n.conversation);
                    } else {
                      tempSelectedAreas.remove(l10n.conversation);
                    }
                  });
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context, null);
              },
              child: Text(l10n.cancel),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context, tempSelectedAreas);
              },
              child: Text(l10n.ok),
            ),
          ],
        );
      },
    );
    if (selectedAreas != null) {
      await _saveSetting('learningFocusAreas', selectedAreas.join(','));
      setState(() {
        _learningFocusAreas = selectedAreas;
      });
    }
  }

  Future<void> _showPreferredAccentDialog(BuildContext context) async {
    final l10n = AppLocalizations.of(context)!;
    String? selectedAccent = await showDialog<String>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(l10n.selectPreferredAccent),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RadioListTile<String>(
                title: Text(l10n.americanAccent),
                value: l10n.americanAccent,
                groupValue: _preferredAccent,
                onChanged: (String? value) {
                  Navigator.pop(context, value);
                },
              ),
              RadioListTile<String>(
                title: Text(l10n.britishAccent),
                value: l10n.britishAccent,
                groupValue: _preferredAccent,
                onChanged: (String? value) {
                  Navigator.pop(context, value);
                },
              ),
              RadioListTile<String>(
                title: Text(l10n.australianAccent),
                value: l10n.australianAccent,
                groupValue: _preferredAccent,
                onChanged: (String? value) {
                  Navigator.pop(context, value);
                },
              ),
            ],
          ),
        );
      },
    );
    if (selectedAccent != null) {
      await _saveSetting('preferredAccent', selectedAccent);
      setState(() {
        _preferredAccent = selectedAccent;
      });
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
}
