import 'package:flutter/material.dart';
import 'package:englishfluencyguide/l10n/app_localizations.dart';

class ProgressAchievements extends StatelessWidget {
  final List<Map<String, dynamic>> achievements;
  const ProgressAchievements({Key? key, required this.achievements})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (achievements.isEmpty) {
      return const SizedBox.shrink();
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          AppLocalizations.of(context)!.achievements,
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 100,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: achievements.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final achievement = achievements[index];
              return GestureDetector(
                onTap: () {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: Row(
                        children: [
                          Text(achievement['icon'] ?? '🏆',
                              style: const TextStyle(fontSize: 32)),
                          const SizedBox(width: 8),
                          Expanded(child: Text(achievement['title'] ?? '')),
                        ],
                      ),
                      content: Text(achievement['description'] ?? ''),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: Text(
                              MaterialLocalizations.of(context).okButtonLabel),
                        ),
                      ],
                    ),
                  );
                },
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      child: Text(achievement['icon'] ?? '🏆',
                          style: const TextStyle(fontSize: 28)),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      achievement['title'] ?? '',
                      style: Theme.of(context)
                          .textTheme
                          .bodyMedium
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      achievement['description'] ?? '',
                      style: Theme.of(context).textTheme.bodySmall,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
