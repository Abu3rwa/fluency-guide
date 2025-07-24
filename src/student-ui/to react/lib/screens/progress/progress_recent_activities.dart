import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:englishfluencyguide/providers/recent_activity_provider.dart';
import 'package:englishfluencyguide/models/recent_activity_model.dart';
import 'package:englishfluencyguide/l10n/app_localizations.dart';

class ProgressRecentActivities extends StatelessWidget {
  const ProgressRecentActivities({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final recentActivityProvider = Provider.of<RecentActivityProvider>(context);
    final activities = recentActivityProvider.recentActivities;
    if (activities.isEmpty) {
      return Center(
          child: Text(AppLocalizations.of(context)!.noRecentActivities));
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.history, color: Colors.orange),
            const SizedBox(width: 8),
            Text(AppLocalizations.of(context)!.recentActivities,
                style: Theme.of(context).textTheme.titleLarge),
          ],
        ),
        const SizedBox(height: 8),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: activities.length,
          itemBuilder: (context, index) {
            final activity = activities[index];
            return Card(
              child: ListTile(
                leading: Icon(_getActivityIcon(activity)),
                title: Text(activity.title),
                subtitle: Text(
                    '${activity.statusText} • ${(activity.progress * 100).toStringAsFixed(0)}%'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  // TODO: Navigate to activity details or resume
                },
              ),
            );
          },
        ),
      ],
    );
  }

  IconData _getActivityIcon(RecentActivity activity) {
    switch (activity.type) {
      case ActivityType.lesson:
        return Icons.menu_book;
      case ActivityType.task:
        return Icons.assignment_turned_in;
      case ActivityType.course:
        return Icons.school;
      case ActivityType.quiz:
        return Icons.quiz;
      case ActivityType.speakingPractice:
        return Icons.record_voice_over;
      default:
        return Icons.help_outline;
    }
  }
}
