import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/vocabulary_goal_provider.dart';
import '../../../../../migrate/lib/models/vocabulary_goal_model.dart';
import '../l10n/app_localizations.dart';

class VocabularyGoalSettingScreen extends StatefulWidget {
  const VocabularyGoalSettingScreen({Key? key}) : super(key: key);

  @override
  State<VocabularyGoalSettingScreen> createState() =>
      _VocabularyGoalSettingScreenState();
}

class _VocabularyGoalSettingScreenState
    extends State<VocabularyGoalSettingScreen> {
  int _selectedTarget = 10;
  bool _isCustomTarget = false;
  final TextEditingController _customTargetController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final goalProvider = context.read<VocabularyGoalProvider>();
    if (goalProvider.hasGoal) {
      _selectedTarget = goalProvider.dailyTarget;
    }
  }

  @override
  void dispose() {
    _customTargetController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.setVocabularyGoal),
        centerTitle: true,
      ),
      body: Consumer<VocabularyGoalProvider>(
        builder: (context, goalProvider, child) {
          return SingleChildScrollView(
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
                              Icons.flag,
                              color: theme.colorScheme.primary,
                              size: 28,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                l10n.vocabularyGoalTitle,
                                style: theme.textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          l10n.vocabularyGoalDescription,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Current Goal Status (if exists)
                if (goalProvider.hasGoal) ...[
                  _buildCurrentGoalCard(goalProvider, l10n, theme),
                  const SizedBox(height: 24),
                ],

                // Goal Presets
                Text(
                  l10n.chooseGoalPreset,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),

                // Preset Cards
                ...VocabularyGoalPresets.presets
                    .map((preset) => _buildPresetCard(preset, l10n, theme)),

                const SizedBox(height: 16),

                // Custom Target Option
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.edit,
                              color: theme.colorScheme.secondary,
                              size: 24,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                l10n.customTarget,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            Switch(
                              value: _isCustomTarget,
                              onChanged: (value) {
                                setState(() {
                                  _isCustomTarget = value;
                                  if (value) {
                                    _customTargetController.text =
                                        _selectedTarget.toString();
                                  }
                                });
                              },
                              activeColor: theme.colorScheme.secondary,
                            ),
                          ],
                        ),
                        if (_isCustomTarget) ...[
                          const SizedBox(height: 16),
                          TextField(
                            controller: _customTargetController,
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              labelText: l10n.enterCustomTarget,
                              hintText: l10n.customTargetHint,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              suffixText: l10n.wordsPerDay,
                            ),
                            onChanged: (value) {
                              final target = int.tryParse(value);
                              if (target != null && target > 0) {
                                setState(() {
                                  _selectedTarget = target;
                                });
                              }
                            },
                          ),
                        ],
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Set Goal Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: goalProvider.isLoading
                        ? null
                        : () => _setGoal(goalProvider),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: theme.colorScheme.primary,
                      foregroundColor: theme.colorScheme.onPrimary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: goalProvider.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : Text(
                            goalProvider.hasGoal
                                ? l10n.updateGoal
                                : l10n.setGoal,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ),

                if (goalProvider.hasGoal) ...[
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: goalProvider.isLoading
                          ? null
                          : () => _deleteGoal(goalProvider),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        l10n.deleteGoal,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],

                if (goalProvider.error != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red[50],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red[200]!),
                    ),
                    child: Text(
                      goalProvider.error!,
                      style: TextStyle(color: Colors.red[700]),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildCurrentGoalCard(VocabularyGoalProvider goalProvider,
      AppLocalizations l10n, ThemeData theme) {
    return Card(
      color: theme.colorScheme.primaryContainer.withOpacity(0.1),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.track_changes,
                  color: theme.colorScheme.primary,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Text(
                  l10n.currentGoal,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.dailyTarget,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                    Text(
                      '${goalProvider.dailyTarget} ${l10n.words}',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      l10n.progress,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                    Text(
                      '${goalProvider.currentProgress}/${goalProvider.dailyTarget}',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            LinearProgressIndicator(
              value: goalProvider.progressPercentage,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(
                goalProvider.isCompleted
                    ? Colors.green
                    : theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              goalProvider.isCompleted
                  ? l10n.goalCompleted
                  : l10n.remainingWords(goalProvider.remainingWords),
              style: theme.textTheme.bodySmall?.copyWith(
                color: goalProvider.isCompleted
                    ? Colors.green[700]
                    : Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPresetCard(
      VocabularyGoalPreset preset, AppLocalizations l10n, ThemeData theme) {
    final isSelected = !_isCustomTarget && _selectedTarget == preset.target;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: isSelected
          ? theme.colorScheme.primaryContainer.withOpacity(0.1)
          : null,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: isSelected ? theme.colorScheme.primary : Colors.transparent,
          width: 2,
        ),
      ),
      child: InkWell(
        onTap: () {
          setState(() {
            _isCustomTarget = false;
            _selectedTarget = preset.target;
          });
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color:
                      _getDifficultyColor(preset.difficulty).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  _getDifficultyIcon(preset.difficulty),
                  color: _getDifficultyColor(preset.difficulty),
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          preset.name,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: _getDifficultyColor(preset.difficulty)
                                .withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            preset.difficulty,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: _getDifficultyColor(preset.difficulty),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      preset.description,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${preset.target} ${l10n.wordsPerDay}',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                  ],
                ),
              ),
              if (isSelected)
                Icon(
                  Icons.check_circle,
                  color: theme.colorScheme.primary,
                  size: 24,
                ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return Colors.green;
      case 'medium':
        return Colors.orange;
      case 'hard':
        return Colors.red;
      case 'expert':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  IconData _getDifficultyIcon(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return Icons.sentiment_satisfied;
      case 'medium':
        return Icons.sentiment_neutral;
      case 'hard':
        return Icons.sentiment_dissatisfied;
      case 'expert':
        return Icons.psychology;
      default:
        return Icons.flag;
    }
  }

  Future<void> _setGoal(VocabularyGoalProvider goalProvider) async {
    if (_isCustomTarget) {
      final customTarget = int.tryParse(_customTargetController.text);
      if (customTarget == null || customTarget <= 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.invalidTarget),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }
      _selectedTarget = customTarget;
    }

    await goalProvider.setGoal(_selectedTarget);

    if (goalProvider.error == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.goalSetSuccessfully),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pop();
      }
    }
  }

  Future<void> _deleteGoal(VocabularyGoalProvider goalProvider) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(AppLocalizations.of(context)!.deleteGoal),
        content: Text(AppLocalizations.of(context)!.deleteGoalConfirmation),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(AppLocalizations.of(context)!.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text(AppLocalizations.of(context)!.delete),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await goalProvider.deleteGoal();
      if (goalProvider.error == null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.goalDeleted),
            backgroundColor: Colors.orange,
          ),
        );
        Navigator.of(context).pop();
      }
    }
  }
}
