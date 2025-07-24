import 'package:flutter/material.dart';
import '../../../../../migrate/lib/models/achievement_model.dart';

class AchievementCard extends StatelessWidget {
  final AchievementModel achievement;
  final VoidCallback? onTap;
  final bool showProgress;
  final bool compact;

  const AchievementCard({
    Key? key,
    required this.achievement,
    this.onTap,
    this.showProgress = true,
    this.compact = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isUnlocked = achievement.isUnlocked;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      elevation: isUnlocked ? 4 : 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: isUnlocked
              ? _getRarityColor(achievement.rarity)
                  .withAlpha((0.3 * 255).toInt())
              : Colors.grey.withAlpha(20),
          width: isUnlocked ? 2 : 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding:
              compact ? const EdgeInsets.all(12) : const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: isUnlocked
                ? LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      _getRarityColor(achievement.rarity)
                          .withAlpha((0.1 * 255).toInt()),
                      _getRarityColor(achievement.rarity)
                          .withAlpha((0.05 * 255).toInt()),
                    ],
                  )
                : null,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  // Achievement Icon
                  Container(
                    width: compact ? 40 : 50,
                    height: compact ? 40 : 50,
                    decoration: BoxDecoration(
                      color: isUnlocked
                          ? _getRarityColor(achievement.rarity)
                              .withAlpha((0.2 * 255).toInt())
                          : Colors.grey.withAlpha(15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isUnlocked
                            ? _getRarityColor(achievement.rarity)
                            : Colors.grey.withAlpha(48),
                        width: 2,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        isUnlocked ? achievement.icon : '🔒',
                        style: TextStyle(
                          fontSize: compact ? 20 : 24,
                          color: isUnlocked
                              ? _getRarityColor(achievement.rarity)
                              : Colors.grey,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Achievement Details
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                achievement.title,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: isUnlocked
                                      ? theme.colorScheme.onSurface
                                      : Colors.grey,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (isUnlocked) ...[
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: _getRarityColor(achievement.rarity),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  '+${achievement.points}',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          achievement.description,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: isUnlocked
                                ? theme.colorScheme.onSurface
                                    .withAlpha((0.7 * 255).toInt())
                                : Colors.grey,
                          ),
                          maxLines: compact ? 1 : 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (!compact) ...[
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              // Rarity Badge
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: _getRarityColor(achievement.rarity)
                                      .withAlpha((0.2 * 255).toInt()),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  achievement.rarityName,
                                  style: theme.textTheme.labelSmall?.copyWith(
                                    color: _getRarityColor(achievement.rarity),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              // Type Badge
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.primary
                                      .withAlpha((0.2 * 255).toInt()),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  achievement.type
                                      .toString()
                                      .split('.')
                                      .last
                                      .toUpperCase(),
                                  style: theme.textTheme.labelSmall?.copyWith(
                                    color: theme.colorScheme.primary,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),

              // Progress Bar (if applicable)
              if (showProgress &&
                  achievement.maxProgress != null &&
                  achievement.maxProgress! > 0) ...[
                const SizedBox(height: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Progress',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurface
                                .withAlpha((0.6 * 255).toInt()),
                          ),
                        ),
                        Text(
                          '${achievement.currentProgress ?? 0}/${achievement.maxProgress}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurface
                                .withAlpha((0.6 * 255).toInt()),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    LinearProgressIndicator(
                      value: achievement.progressPercentage,
                      backgroundColor: Colors.grey.withAlpha(20),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        isUnlocked
                            ? _getRarityColor(achievement.rarity)
                            : Colors.grey,
                      ),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ],
                ),
              ],

              // Unlock Date (if unlocked)
              if (isUnlocked && achievement.unlockDate != null && !compact) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.check_circle,
                      size: 16,
                      color: _getRarityColor(achievement.rarity),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Unlocked ${_formatDate(achievement.unlockDate!)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: _getRarityColor(achievement.rarity),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Color _getRarityColor(AchievementRarity rarity) {
    switch (rarity) {
      case AchievementRarity.common:
        return const Color(0xFF4CAF50); // Green
      case AchievementRarity.rare:
        return const Color(0xFF2196F3); // Blue
      case AchievementRarity.epic:
        return const Color(0xFF9C27B0); // Purple
      case AchievementRarity.legendary:
        return const Color(0xFFFF9800); // Orange
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      return 'today';
    } else if (difference.inDays == 1) {
      return 'yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return '$weeks week${weeks > 1 ? 's' : ''} ago';
    } else {
      final months = (difference.inDays / 30).floor();
      return '$months month${months > 1 ? 's' : ''} ago';
    }
  }
}

class AchievementGrid extends StatelessWidget {
  final List<AchievementModel> achievements;
  final Function(AchievementModel)? onAchievementTap;
  final bool showProgress;
  final int crossAxisCount;

  const AchievementGrid({
    Key? key,
    required this.achievements,
    this.onAchievementTap,
    this.showProgress = true,
    this.crossAxisCount = 2,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        childAspectRatio: 0.8,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: achievements.length,
      itemBuilder: (context, index) {
        final achievement = achievements[index];
        return AchievementCard(
          achievement: achievement,
          onTap: onAchievementTap != null
              ? () => onAchievementTap!(achievement)
              : null,
          showProgress: showProgress,
          compact: true,
        );
      },
    );
  }
}

class AchievementList extends StatelessWidget {
  final List<AchievementModel> achievements;
  final Function(AchievementModel)? onAchievementTap;
  final bool showProgress;

  const AchievementList({
    Key? key,
    required this.achievements,
    this.onAchievementTap,
    this.showProgress = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: achievements.length,
      itemBuilder: (context, index) {
        final achievement = achievements[index];
        return AchievementCard(
          achievement: achievement,
          onTap: onAchievementTap != null
              ? () => onAchievementTap!(achievement)
              : null,
          showProgress: showProgress,
        );
      },
    );
  }
}
