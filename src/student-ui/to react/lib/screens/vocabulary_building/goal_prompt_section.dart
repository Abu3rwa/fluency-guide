import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/vocabulary_goal_provider.dart';
import '../../l10n/app_localizations.dart';

class GoalPromptSection extends StatelessWidget {
  final VoidCallback onSetGoal;
  const GoalPromptSection({Key? key, required this.onSetGoal})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<VocabularyGoalProvider>(
      builder: (context, goalProvider, child) {
        if (!goalProvider.hasGoal) {
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Card(
              color: Theme.of(context).brightness == Brightness.dark
                  ? Theme.of(context).colorScheme.surface
                  : Theme.of(context)
                      .colorScheme
                      .primaryContainer
                      .withOpacity(0.1),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.flag_outlined,
                          color: Theme.of(context).colorScheme.primary,
                          size: 24,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            AppLocalizations.of(context)!
                                .setYourDailyVocabularyGoal,
                            style: Theme.of(context)
                                .textTheme
                                .titleMedium
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      AppLocalizations.of(context)!
                          .trackYourProgressAndStayMotivatedBySettingADailyVocabularyGoal,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color:
                                Theme.of(context).brightness == Brightness.dark
                                    ? Theme.of(context)
                                        .colorScheme
                                        .onSurface
                                        .withOpacity(0.7)
                                    : Colors.grey[600],
                          ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: onSetGoal,
                        icon: const Icon(Icons.add),
                        label: Text(AppLocalizations.of(context)!.setGoal),
                        style: ElevatedButton.styleFrom(
                          backgroundColor:
                              Theme.of(context).colorScheme.primary,
                          foregroundColor:
                              Theme.of(context).colorScheme.onPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }
}
