import 'package:flutter/material.dart';
import 'package:englishfluencyguide/l10n/app_localizations.dart';

class ProgressGoals extends StatelessWidget {
  final List<Map<String, dynamic>> goals;
  const ProgressGoals({Key? key, required this.goals}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (goals.isEmpty) {
      return const SizedBox.shrink();
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(AppLocalizations.of(context)!.yourGoals,
            style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 8),
        ...goals.map((goal) => Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(goal['title'] ?? '',
                        style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(
                      value: (goal['progress'] ?? 0) / (goal['target'] ?? 1),
                      minHeight: 8,
                    ),
                    const SizedBox(height: 8),
                    Text('${goal['progress'] ?? 0} / ${goal['target'] ?? 1}',
                        style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
            )),
      ],
    );
  }
}
