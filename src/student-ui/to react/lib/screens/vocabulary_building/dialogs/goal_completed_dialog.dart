import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';

Future<void> showGoalCompletedDialog(BuildContext context) {
  return showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(AppLocalizations.of(context)!.goalAchieved),
      content: Text(AppLocalizations.of(context)!
          .congratulationsYouHaveReachedYourDailyVocabularyGoalWouldYouLikeToSetANewOne),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text(AppLocalizations.of(context)!.notNow),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.of(context).pop();
            Navigator.of(context).pushNamed('/vocabularyGoalSetting');
          },
          child: Text(AppLocalizations.of(context)!.setNewGoal),
        ),
      ],
    ),
  );
}
