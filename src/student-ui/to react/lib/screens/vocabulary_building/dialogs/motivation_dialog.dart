import 'package:flutter/material.dart';
import '../../../l10n/app_localizations.dart';

Future<void> showMotivationDialog(BuildContext context) {
  return showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(AppLocalizations.of(context)!.greatJob),
      content: Text(AppLocalizations.of(context)!
          .youveBeenLearningForAnother10MinutesKeepItUp),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text(AppLocalizations.of(context)!.thanks),
        ),
      ],
    ),
  );
}
