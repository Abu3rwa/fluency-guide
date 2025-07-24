import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/recent_activity_model.dart';
import '../providers/recent_activity_provider.dart';
import '../routes/app_routes.dart';
import '../l10n/app_localizations.dart';
import 'package:flutter_animate/flutter_animate.dart';

class RecentActivitiesWidget extends StatefulWidget {
  final String userId;
  final bool showIncompleteOnly;

  const RecentActivitiesWidget({
    Key? key,
    required this.userId,
    this.showIncompleteOnly = false,
  }) : super(key: key);

  @override
  _RecentActivitiesWidgetState createState() => _RecentActivitiesWidgetState();
}

class _RecentActivitiesWidgetState extends State<RecentActivitiesWidget> {
  late Future<void> _loadActivitiesFuture;

  @override
  void initState() {
    super.initState();
    _loadActivitiesFuture = _loadActivities();
  }

  Future<void> _loadActivities() {
    final activityProvider =
        Provider.of<RecentActivityProvider>(context, listen: false);
    if (widget.showIncompleteOnly) {
      return activityProvider.loadIncompleteActivities(widget.userId);
    } else {
      return activityProvider.loadRecentActivities(widget.userId);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _loadActivitiesFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return _buildLoadingCard(Theme.of(context));
        }

        return Consumer<RecentActivityProvider>(
          builder: (context, activityProvider, child) {
            final activities = widget.showIncompleteOnly
                ? activityProvider.incompleteActivities
                : activityProvider.recentActivities;

            if (activities.isEmpty) {
              return _buildEmptyCard(Theme.of(context),
                  AppLocalizations.of(context)!, widget.showIncompleteOnly);
            }

            return _buildActivitiesCard(
                context,
                Theme.of(context),
                AppLocalizations.of(context)!,
                activities,
                widget.showIncompleteOnly);
          },
        );
      },
    );
  }

  Widget _buildLoadingCard(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(10),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withAlpha(10),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  height: 16,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withAlpha(10),
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            height: 60,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withAlpha(5),
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildEmptyCard(
      ThemeData theme, AppLocalizations l10n, bool showIncompleteOnly) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(10),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                showIncompleteOnly ? Icons.pending_actions : Icons.history,
                color: theme.colorScheme.primary,
                size: 24,
              ),
              const SizedBox(width: 12),
              Text(
                showIncompleteOnly
                    ? l10n.incompleteTasks
                    : l10n.recentActivities,
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: theme.colorScheme.primaryContainer.withAlpha(10),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(
                  showIncompleteOnly
                      ? Icons.check_circle_outline
                      : Icons.celebration,
                  color: theme.colorScheme.primary,
                  size: 32,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        showIncompleteOnly
                            ? l10n.noIncompleteTasks
                            : l10n.noRecentActivities,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        showIncompleteOnly
                            ? l10n.allTasksCompleted
                            : l10n.startLearningToSeeActivities,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildActivitiesCard(
      BuildContext context,
      ThemeData theme,
      AppLocalizations l10n,
      List<RecentActivity> activities,
      bool showIncompleteOnly) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(10),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    showIncompleteOnly ? Icons.pending_actions : Icons.history,
                    color: theme.colorScheme.primary,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    showIncompleteOnly
                        ? l10n.incompleteTasks
                        : l10n.recentActivities,
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              if (activities.isNotEmpty)
                Text(
                  '${activities.length}',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          ...activities
              .take(3)
              .map((activity) => _buildActivityItem(context, theme, activity))
              .toList(),
          if (activities.length > 3)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Center(
                child: TextButton(
                  onPressed: () {
                    // Navigate to full activities list
                    Navigator.pushNamed(context, AppRoutes.progress);
                  },
                  child: Text(
                    l10n.viewAll,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildActivityItem(
      BuildContext context, ThemeData theme, RecentActivity activity) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => _navigateToActivity(context, activity),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _getActivityBackgroundColor(theme, activity),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _getActivityBorderColor(theme, activity),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: _getActivityIconBackgroundColor(theme, activity),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    activity.typeIcon,
                    color: _getActivityIconColor(theme, activity),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        activity.title,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.onSurface,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: _getStatusBackgroundColor(theme, activity),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              activity.statusText,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: _getStatusTextColor(theme, activity),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            activity.typeText,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                          if (activity.timeSpent != null) ...[
                            const SizedBox(width: 8),
                            Text(
                              '• ${activity.timeSpent} min',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ],
                      ),
                      if (activity.progress > 0 && activity.progress < 1.0) ...[
                        const SizedBox(height: 8),
                        LinearProgressIndicator(
                          value: activity.progress,
                          backgroundColor:
                              theme.colorScheme.surfaceContainerHighest,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            theme.colorScheme.primary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${(activity.progress * 100).toInt()}% complete',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  color: theme.colorScheme.onSurfaceVariant,
                  size: 16,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getActivityBackgroundColor(ThemeData theme, RecentActivity activity) {
    if (activity.status == ActivityStatus.failed) {
      return theme.colorScheme.errorContainer.withAlpha(10);
    } else if (activity.status == ActivityStatus.inProgress) {
      return theme.colorScheme.primaryContainer.withAlpha(10);
    } else if (activity.status == ActivityStatus.completed) {
      return theme.colorScheme.secondaryContainer.withAlpha(10);
    }
    return theme.colorScheme.surfaceContainerHighest.withAlpha(10);
  }

  Color _getActivityBorderColor(ThemeData theme, RecentActivity activity) {
    if (activity.status == ActivityStatus.failed) {
      return theme.colorScheme.error.withAlpha(20);
    } else if (activity.status == ActivityStatus.inProgress) {
      return theme.colorScheme.primary.withAlpha(20);
    } else if (activity.status == ActivityStatus.completed) {
      return theme.colorScheme.secondary.withAlpha(20);
    }
    return theme.colorScheme.outline.withAlpha(10);
  }

  Color _getActivityIconBackgroundColor(
      ThemeData theme, RecentActivity activity) {
    if (activity.status == ActivityStatus.failed) {
      return theme.colorScheme.error;
    } else if (activity.status == ActivityStatus.inProgress) {
      return theme.colorScheme.primary;
    } else if (activity.status == ActivityStatus.completed) {
      return theme.colorScheme.secondary;
    }
    return theme.colorScheme.primary;
  }

  Color _getActivityIconColor(ThemeData theme, RecentActivity activity) {
    return theme.colorScheme.onPrimary;
  }

  Color _getStatusBackgroundColor(ThemeData theme, RecentActivity activity) {
    switch (activity.status) {
      case ActivityStatus.inProgress:
        return theme.colorScheme.primary.withAlpha(10);
      case ActivityStatus.completed:
        return theme.colorScheme.secondary.withAlpha(10);
      case ActivityStatus.failed:
        return theme.colorScheme.error.withAlpha(10);
      case ActivityStatus.notStarted:
        return theme.colorScheme.surfaceContainerHighest;
    }
  }

  Color _getStatusTextColor(ThemeData theme, RecentActivity activity) {
    switch (activity.status) {
      case ActivityStatus.inProgress:
        return theme.colorScheme.primary;
      case ActivityStatus.completed:
        return theme.colorScheme.secondary;
      case ActivityStatus.failed:
        return theme.colorScheme.error;
      case ActivityStatus.notStarted:
        return theme.colorScheme.onSurfaceVariant;
    }
  }

  void _navigateToActivity(BuildContext context, RecentActivity activity) {
    switch (activity.type) {
      case ActivityType.lesson:
        Navigator.pushNamed(
          context,
          AppRoutes.lessonDetails,
          arguments: {
            'lessonId': activity.targetId,
            'moduleId': activity.metadata['moduleId'],
            'courseId': activity.courseId,
          },
        );
        break;
      case ActivityType.task:
        switch (activity.targetId) {
          case AppRoutes.trueFalse:
            Navigator.pushNamed(
              context,
              AppRoutes.trueFalse,
              arguments: {
                'taskId': activity.taskId,
                'lessonId': activity.lessonId,
              },
            );
            break;
          case AppRoutes.fillInTheBlank:
            Navigator.pushNamed(
              context,
              AppRoutes.fillInTheBlank,
              arguments: {
                'taskId': activity.taskId,
                'lessonId': activity.lessonId,
              },
            );
            break;
          default:
            Navigator.pushNamed(
              context,
              AppRoutes.taskDetails,
              arguments: {
                'taskId': activity.targetId,
                'lessonId': activity.lessonId,
              },
            );
        }
        break;
      case ActivityType.course:
        Navigator.pushNamed(
          context,
          AppRoutes.courseDetails,
          arguments: activity.targetId,
        );
        break;
      case ActivityType.quiz:
        Navigator.pushNamed(
          context,
          AppRoutes.taskDetails, // Assuming quizzes are tasks
          arguments: {
            'taskId': activity.targetId,
            'lessonId': activity.lessonId,
          },
        );
        break;
      case ActivityType.speakingPractice:
        // Handle speaking practice navigation
        break;
    }
  }
}
