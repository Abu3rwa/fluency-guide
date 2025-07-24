import 'package:flutter/material.dart';
import '../../l10n/app_localizations.dart';

class NavigationControls extends StatelessWidget {
  final ThemeData theme;
  final VoidCallback onPrevious;
  final VoidCallback onNext;
  final VoidCallback onRandom;
  final VoidCallback onToggleAnswer;
  final bool showAnswer;

  const NavigationControls({
    Key? key,
    required this.theme,
    required this.onPrevious,
    required this.onNext,
    required this.onRandom,
    required this.onToggleAnswer,
    required this.showAnswer,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          // Primary Navigation
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onPrevious,
                  icon: const Icon(Icons.arrow_back_ios, size: 18),
                  label: Text(AppLocalizations.of(context)!.previous),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey[600],
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 4,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onNext,
                  icon: const Icon(Icons.arrow_forward_ios, size: 18),
                  label: Text(AppLocalizations.of(context)!.next),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 4,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Secondary Actions
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onRandom,
                  icon: const Icon(Icons.shuffle, size: 18),
                  label: Text(AppLocalizations.of(context)!.random),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    side: BorderSide(color: theme.primaryColor),
                    foregroundColor: theme.primaryColor,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onToggleAnswer,
                  icon: Icon(
                    showAnswer ? Icons.visibility_off : Icons.visibility,
                    size: 18,
                  ),
                  label: Text(showAnswer
                      ? AppLocalizations.of(context)!.hide
                      : AppLocalizations.of(context)!.reveal),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    side: const BorderSide(color: Colors.orange),
                    foregroundColor: Colors.orange,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
