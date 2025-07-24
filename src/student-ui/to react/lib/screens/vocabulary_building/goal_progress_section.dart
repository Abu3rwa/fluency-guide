import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../l10n/app_localizations.dart';
import '../../providers/vocabulary_goal_provider.dart';

/// A section that displays the user's daily vocabulary goal progress.
///
/// It shows a progress bar and text indicating the current progress towards the
/// daily target. It animates its appearance and shows a celebratory message
/// upon goal completion.
class GoalProgressSection extends StatelessWidget {
  const GoalProgressSection({super.key});

  // Using constants for dimensions improves readability and maintainability.
  static const double _cardBorderRadius = 12.0;
  static const double _progressBarHeight = 8.0;

  @override
  Widget build(BuildContext context) {
    // Using context.watch is a modern and clean way to get the provider instance.
    // The widget will rebuild automatically when VocabularyGoalProvider notifies listeners.
    final goalProvider = Provider.of<VocabularyGoalProvider>(context);
    final theme = Theme.of(context);
    final localizations = AppLocalizations.of(context)!;

    // AnimatedSwitcher provides a smooth transition when the goal card appears or disappears.
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      transitionBuilder: (child, animation) {
        return FadeTransition(
          opacity: animation,
          child: SizeTransition(
            sizeFactor: animation,
            axis: Axis.vertical,
            child: child,
          ),
        );
      },
      child: goalProvider.hasGoal
          // Using a Key ensures AnimatedSwitcher correctly identifies the widget.
          ? _buildGoalCard(context, theme, localizations, goalProvider)
          : const SizedBox.shrink(key: ValueKey('no-goal')),
    );
  }

  /// Builds the main card that contains the goal progress information.
  Widget _buildGoalCard(
    BuildContext context,
    ThemeData theme,
    AppLocalizations localizations,
    VocabularyGoalProvider goalProvider,
  ) {
    return Container(
      key: const ValueKey('goal-card'),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Card(
        elevation: 2,
        // Using surfaceContainerHighest provides better adaptive color.
        color: theme.colorScheme.surfaceContainerHighest,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(_cardBorderRadius),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildHeader(theme, localizations, goalProvider),
              const SizedBox(height: 12),
              _buildProgressBar(theme, goalProvider),
            ],
          ),
        ),
      ),
    );
  }

  /// Builds the header section with the title and progress text/icon.
  Widget _buildHeader(
    ThemeData theme,
    AppLocalizations localizations,
    VocabularyGoalProvider goalProvider,
  ) {
    // Use the correct property for goal completion status
    final bool isCompleted = goalProvider.isCompleted;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          localizations.todaysGoal,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        if (isCompleted)
          _buildCompletedIndicator(theme, localizations)
        else
          Text(
            '${goalProvider.currentProgress} / ${goalProvider.dailyTarget}',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.primary,
            ),
          ),
      ],
    );
  }

  /// Builds the visual indicator for when the goal is completed.
  Widget _buildCompletedIndicator(
      ThemeData theme, AppLocalizations localizations) {
    return Row(
      children: [
        Text(
          localizations.goalAchieved, // Example: "Goal Achieved!"
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.primary,
          ),
        ),
        const SizedBox(width: 8),
        Icon(
          Icons.check_circle,
          color: theme.colorScheme.primary,
        ),
      ],
    );
  }

  /// Builds the rounded linear progress bar.
  Widget _buildProgressBar(
    ThemeData theme,
    VocabularyGoalProvider goalProvider,
  ) {
    // ClipRRect gives the progress bar rounded corners, matching the card's design.
    return ClipRRect(
      borderRadius: BorderRadius.circular(_progressBarHeight / 2),
      child: LinearProgressIndicator(
        value: goalProvider.progressPercentage,
        minHeight: _progressBarHeight,
        // Using theme colors makes the widget adapt to the app's theme.
        backgroundColor: theme.colorScheme.surfaceVariant,
        valueColor: AlwaysStoppedAnimation<Color>(
          theme.colorScheme.primary,
        ),
      ),
    );
  }
}
