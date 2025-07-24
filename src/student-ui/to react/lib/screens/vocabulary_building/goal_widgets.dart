
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/vocabulary_goal_provider.dart';
import '../../l10n/app_localizations.dart';

class GoalPromptSection extends StatelessWidget {
  const GoalPromptSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<VocabularyGoalProvider>(
      builder: (context, goalProvider, child) {
        if (!goalProvider.hasGoal) {
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Card(
              color: Theme.of(context)
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
                            color: Colors.grey[600],
                          ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context)
                              .pushNamed('/vocabularyGoalSetting');
                        },
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

class GoalProgressSection extends StatelessWidget {
  const GoalProgressSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<VocabularyGoalProvider>(
      builder: (context, goalProvider, child) {
        if (goalProvider.hasGoal) {
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          AppLocalizations.of(context)!.todaysGoal,
                          style:
                              Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                        Text(
                          '${goalProvider.currentProgress} / ${goalProvider.dailyTarget}',
                          style:
                              Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: Theme.of(context).primaryColor,
                                  ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(
                      value: goalProvider.progressPercentage,
                      backgroundColor: Colors.green[300],
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Theme.of(context).primaryColor,
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
