import 'package:englishfluencyguide/models/achievement_model.dart';
import 'package:flutter/material.dart';
import 'package:englishfluencyguide/models/user_model.dart';
import 'package:englishfluencyguide/providers/achievement_provider.dart';
import 'package:englishfluencyguide/l10n/app_localizations.dart';

class StatisticsSection extends StatefulWidget {
  final UserModel? user;
  final AchievementProvider achievementProvider;

  const StatisticsSection({
    Key? key,
    required this.user,
    required this.achievementProvider,
  }) : super(key: key);

  @override
  State<StatisticsSection> createState() => _StatisticsSectionState();
}

class _StatisticsSectionState extends State<StatisticsSection> {
  late List<UserAchievementModel> _achievements = [];
  @override
  void initState() {
    super.initState();
    _loadAchievements();
  }

  Future<void> _loadAchievements() async {
    await widget.achievementProvider.loadUserAchievements(widget.user!.uid);
    _achievements = widget.achievementProvider.userAchievements;
    print("_achievements $_achievements");
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    // _loadAchievements();

    int seconds = widget.user?.totalStudyMinutes ?? 0;
    int minutes = (seconds / 60).round();
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return Row(
      children: [
        Expanded(
          child: _EnhancedStatCard(
            icon: Icons.timer_outlined,
            value: minutes.toString(),
            label: l10n.minutesToday,
            color: Colors.blue,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _EnhancedStatCard(
            icon: Icons.emoji_events_outlined,
            value: '${widget.achievementProvider.userAchievements.length}',
            label: l10n.achievements,
            color: Colors.amber,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _EnhancedStatCard(
            icon: Icons.star_outline,
            value: '${5}',
            label: l10n.xpPoints,
            color: Colors.purple,
          ),
        ),
      ],
    );
  }
}

class _EnhancedStatCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color color;

  const _EnhancedStatCard({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(0.1),
        ),
        boxShadow: [
          BoxShadow(
            color: theme.colorScheme.shadow.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, size: 24, color: color),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
