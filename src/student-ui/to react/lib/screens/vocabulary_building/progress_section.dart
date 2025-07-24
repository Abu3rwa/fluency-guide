import 'package:flutter/material.dart';

class ProgressSection extends StatelessWidget {
  final int currentIndex;
  final int vocabularyLength;
  final ThemeData theme;
  final bool isDark;
  final Animation<double> progressAnimation;

  const ProgressSection({
    Key? key,
    required this.currentIndex,
    required this.vocabularyLength,
    required this.theme,
    required this.isDark,
    required this.progressAnimation,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? theme.colorScheme.surface : Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${currentIndex + 1} of $vocabularyLength',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: theme.primaryColor,
                ),
              ),
              Text(
                '${(((currentIndex + 1) / vocabularyLength) * 100).round()}%',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: isDark
                      ? theme.colorScheme.onSurface.withOpacity(0.7)
                      : Colors.grey[600],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          AnimatedBuilder(
            animation: progressAnimation,
            builder: (context, child) {
              return LinearProgressIndicator(
                value: ((currentIndex + 1) / vocabularyLength) *
                    progressAnimation.value,
                backgroundColor: isDark
                    ? theme.colorScheme.onSurface.withOpacity(0.1)
                    : Colors.grey[300],
                valueColor: AlwaysStoppedAnimation<Color>(theme.primaryColor),
                minHeight: 6,
                borderRadius: BorderRadius.circular(3),
              );
            },
          ),
        ],
      ),
    );
  }
}
