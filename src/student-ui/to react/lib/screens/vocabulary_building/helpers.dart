import 'package:flutter/material.dart';
import '../../l10n/app_localizations.dart';

Color getDifficultyColor(String level) {
  switch (level.toUpperCase()) {
    case 'A1':
      return Colors.green;
    case 'A2':
      return Colors.lightGreen;
    case 'B1':
      return Colors.orange;
    case 'B2':
      return Colors.deepOrange;
    case 'C1':
      return Colors.red;
    case 'C2':
      return Colors.purple;
    default:
      return Colors.grey;
  }
}

String getFrequencyDescription(BuildContext context, String frequency) {
  switch (frequency.toLowerCase()) {
    case 'very_high':
      return AppLocalizations.of(context)!.veryCommonlyUsedInEverydayEnglish;
    case 'high':
      return AppLocalizations.of(context)!.frequentlyUsedInEnglish;
    case 'medium':
      return AppLocalizations.of(context)!.moderatelyUsedInEnglish;
    case 'low':
      return AppLocalizations.of(context)!.occasionallyUsedInEnglish;
    case 'very_low':
      return AppLocalizations.of(context)!.rarelyUsedInEnglish;
    default:
      return frequency;
  }
}
