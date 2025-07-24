import 'package:englishfluencyguide/routes/app_routes.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:englishfluencyguide/l10n/app_localizations.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<NotificationItem> _notifications = [];
  bool _isLoading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    // Simulate loading delay
    await Future.delayed(const Duration(milliseconds: 800));

    setState(() {
      _notifications = _getSampleNotifications();
      _isLoading = false;
    });
  }

  List<NotificationItem> _getSampleNotifications() {
    final l10n = AppLocalizations.of(context)!;
    return [
      NotificationItem(
        id: '1',
        title: l10n.dailyLearningReminderTitle,
        description: l10n.dailyLearningReminderDescription,
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        type: NotificationType.reminder,
        isRead: false,
      ),
      NotificationItem(
        id: '2',
        title: l10n.achievementUnlockedTitle,
        description: l10n.achievementUnlockedDescription,
        timestamp: DateTime.now().subtract(const Duration(hours: 2)),
        type: NotificationType.achievement,
        isRead: false,
      ),
      NotificationItem(
        id: '3',
        title: l10n.newVocabularyTitle,
        description: l10n.newVocabularyDescription,
        timestamp: DateTime.now().subtract(const Duration(hours: 4)),
        type: NotificationType.update,
        isRead: true,
      ),
      NotificationItem(
        id: '4',
        title: l10n.dailyChallengeTitle,
        description: l10n.dailyChallengeDescription,
        timestamp: DateTime.now().subtract(const Duration(hours: 6)),
        type: NotificationType.challenge,
        isRead: true,
      ),
      NotificationItem(
        id: '5',
        title: l10n.streakWarningTitle,
        description: l10n.streakWarningDescription,
        timestamp: DateTime.now().subtract(const Duration(hours: 8)),
        type: NotificationType.alert,
        isRead: true,
      ),
      NotificationItem(
        id: '6',
        title: l10n.lessonCompletedTitle,
        description: l10n.lessonCompletedDescription,
        timestamp: DateTime.now().subtract(const Duration(days: 1)),
        type: NotificationType.success,
        isRead: true,
      ),
      NotificationItem(
        id: '7',
        title: l10n.weeklyProgressReportTitle,
        description: l10n.weeklyProgressReportDescription,
        timestamp: DateTime.now().subtract(const Duration(days: 2)),
        type: NotificationType.report,
        isRead: true,
      ),
    ];
  }

  void _markAsRead(String notificationId) {
    setState(() {
      final notification =
          _notifications.firstWhere((n) => n.id == notificationId);
      notification.isRead = true;
    });
  }

  void _deleteNotification(String notificationId) {
    final l10n = AppLocalizations.of(context)!;
    setState(() {
      _notifications.removeWhere((n) => n.id == notificationId);
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(l10n.notificationDeleted),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _markAllAsRead() {
    final l10n = AppLocalizations.of(context)!;
    setState(() {
      for (var notification in _notifications) {
        notification.isRead = true;
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(l10n.allNotificationsMarkedAsRead),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _clearAllNotifications() {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(l10n.clearAllNotificationsDialogTitle),
          content: Text(l10n.clearAllNotificationsDialogContent),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(l10n.cancel),
            ),
            TextButton(
              onPressed: () {
                setState(() {
                  _notifications.clear();
                });
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(l10n.clearAllNotifications),
                    duration: const Duration(seconds: 2),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
              child: Text(l10n.clearAll,
                  style: const TextStyle(color: Colors.red)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final unreadCount = _notifications.where((n) => !n.isRead).length;

    return Scaffold(
      backgroundColor: theme.colorScheme.surface,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text(l10n.notifications),
        centerTitle: true,
        elevation: 0,
        backgroundColor: theme.colorScheme.surface,
        foregroundColor: theme.colorScheme.onSurface,
        actions: [
          if (_notifications.isNotEmpty) ...[
            IconButton(
              icon: const Icon(Icons.done_all),
              onPressed: _markAllAsRead,
              tooltip: l10n.markAllAsRead,
            ),
            IconButton(
              icon: const Icon(Icons.delete),
              onPressed: _clearAllNotifications,
              tooltip: l10n.clearAllNotifications,
            ),
            IconButton(
              onPressed: () {
                Navigator.pushNamed(context, AppRoutes.notificationSettings);
              },
              icon: const Icon(Icons.settings),
              tooltip: l10n.notificationSettings,
            ),
          ],
        ],
      ),
      body: _isLoading
          ? _buildLoadingState()
          : _notifications.isEmpty
              ? _buildEmptyState()
              : _buildNotificationsList(),
    );
  }

  Widget _buildLoadingState() {
    final l10n = AppLocalizations.of(context)!;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text(l10n.loadingNotifications),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_none,
            size: 80,
            color: theme.colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            l10n.noNotifications,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            l10n.noNotificationsDescription,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              setState(() {
                _isLoading = true;
              });
              _loadNotifications();
            },
            icon: const Icon(Icons.refresh),
            label: Text(l10n.refresh),
            style: ElevatedButton.styleFrom(
              backgroundColor: theme.colorScheme.primary,
              foregroundColor: theme.colorScheme.onPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationsList() {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final unreadCount = _notifications.where((n) => !n.isRead).length;

    return Column(
      children: [
        // Unread count indicator
        if (unreadCount > 0)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: theme.colorScheme.primaryContainer.withOpacity(0.3),
            child: Text(
              l10n.unreadNotifications(unreadCount),
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),

        // Notifications list
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: _notifications.length,
            itemBuilder: (context, index) {
              final notification = _notifications[index];
              return _buildNotificationTile(notification);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildNotificationTile(NotificationItem notification) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: Colors.red,
        child: const Icon(
          Icons.delete,
          color: Colors.white,
        ),
      ),
      onDismissed: (direction) {
        _deleteNotification(notification.id);
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        decoration: BoxDecoration(
          color: notification.isRead
              ? theme.colorScheme.surface
              : theme.colorScheme.primaryContainer.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: notification.isRead
                ? Colors.transparent
                : theme.colorScheme.primary.withOpacity(0.2),
            width: 1,
          ),
        ),
        child: ListTile(
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          leading:
              _buildNotificationIcon(notification.type, notification.isRead),
          title: Text(
            notification.title,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight:
                  notification.isRead ? FontWeight.normal : FontWeight.w600,
              color: notification.isRead
                  ? theme.colorScheme.onSurface
                  : theme.colorScheme.onSurface,
            ),
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 4),
              Text(
                notification.description,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _formatTimestamp(notification.timestamp),
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.outline,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          trailing: notification.isRead
              ? null
              : Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary,
                    shape: BoxShape.circle,
                  ),
                ),
          onTap: () {
            if (!notification.isRead) {
              _markAsRead(notification.id);
            }
            // Handle notification tap - navigate to relevant screen
            _handleNotificationTap(notification);
          },
        ),
      ),
    );
  }

  Widget _buildNotificationIcon(NotificationType type, bool isRead) {
    final theme = Theme.of(context);
    IconData iconData;
    Color iconColor;

    switch (type) {
      case NotificationType.reminder:
        iconData = Icons.schedule;
        iconColor = const Color(0xFF6C63FF);
        break;
      case NotificationType.achievement:
        iconData = Icons.emoji_events;
        iconColor = const Color(0xFFFFB800);
        break;
      case NotificationType.update:
        iconData = Icons.new_releases;
        iconColor = const Color(0xFF00BFA5);
        break;
      case NotificationType.challenge:
        iconData = Icons.fitness_center;
        iconColor = const Color(0xFFE91E63);
        break;
      case NotificationType.alert:
        iconData = Icons.warning;
        iconColor = const Color(0xFFFF5722);
        break;
      case NotificationType.success:
        iconData = Icons.check_circle;
        iconColor = const Color(0xFF4CAF50);
        break;
      case NotificationType.report:
        iconData = Icons.analytics;
        iconColor = const Color(0xFF9C27B0);
        break;
    }

    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: iconColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: iconColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Icon(
        iconData,
        color: iconColor,
        size: 24,
      ),
    );
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);
    final l10n = AppLocalizations.of(context)!;

    if (difference.inMinutes < 1) {
      return l10n.justNow;
    } else if (difference.inMinutes < 60) {
      return l10n.minutesAgo(difference.inMinutes);
    } else if (difference.inHours < 24) {
      return l10n.hoursAgo(difference.inHours);
    } else if (difference.inDays < 7) {
      return l10n.daysAgo(difference.inDays);
    } else {
      return DateFormat('MMM dd, yyyy').format(timestamp);
    }
  }

  void _handleNotificationTap(NotificationItem notification) {
    final l10n = AppLocalizations.of(context)!;
    // Handle navigation based on notification type
    switch (notification.type) {
      case NotificationType.reminder:
        // Navigate to lessons
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.openingLessons)),
        );
        break;
      case NotificationType.achievement:
        // Navigate to achievements
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.openingAchievements)),
        );
        break;
      case NotificationType.update:
        // Navigate to new content
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.openingNewContent)),
        );
        break;
      case NotificationType.challenge:
        // Navigate to challenges
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.openingChallenges)),
        );
        break;
      case NotificationType.alert:
        // Navigate to practice
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.openingPractice)),
        );
        break;
      case NotificationType.success:
        // Navigate to progress
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.openingProgress)),
        );
        break;
      case NotificationType.report:
        // Navigate to analytics
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.openingAnalytics)),
        );
        break;
    }
  }
}

enum NotificationType {
  reminder,
  achievement,
  update,
  challenge,
  alert,
  success,
  report,
}

class NotificationItem {
  final String id;
  final String title;
  final String description;
  final DateTime timestamp;
  final NotificationType type;
  bool isRead;

  NotificationItem({
    required this.id,
    required this.title,
    required this.description,
    required this.timestamp,
    required this.type,
    this.isRead = false,
  });
}
