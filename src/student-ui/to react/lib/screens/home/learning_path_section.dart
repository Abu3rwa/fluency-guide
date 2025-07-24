import 'package:flutter/material.dart';
import 'package:englishfluencyguide/l10n/app_localizations.dart';
import 'package:englishfluencyguide/routes/app_routes.dart';
import 'package:englishfluencyguide/theme/app_theme.dart';

class LearningPathSection extends StatelessWidget {
  const LearningPathSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                l10n.learningPath,
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton.icon(
                onPressed: () =>
                    Navigator.pushNamed(context, AppRoutes.courses),
                icon: const Icon(Icons.arrow_forward_ios, size: 16),
                label: Text(l10n.seeAll),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            height: 270, // Fixed height to prevent overflow
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 1.2, // Slightly reduced aspect ratio
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: 4,
              itemBuilder: (context, index) {
                final lessons = [
                  {
                    'title': "Hard Words",
                    'icon': Icons.article_outlined,
                    'progress': 0.8,
                    'color': Colors.blue,
                    'route': AppRoutes.hardWords,
                  },
                  {
                    'title': l10n.courseVocabulary,
                    'icon': Icons.translate_outlined,
                    'progress': 0.6,
                    'color': Colors.green,
                    'route': AppRoutes.vocabulary,
                  },
                  // {
                  //   'title': l10n.coursePronunciation,
                  //   'icon': Icons.record_voice_over_outlined,
                  //   'progress': 0.4,
                  //   'color': Colors.orange,
                  //   'route': AppRoutes.pronunciation,
                  // },
                  {
                    'title': l10n.courseListening,
                    'icon': Icons.headphones_outlined,
                    'progress': 0.2,
                    'color': Colors.purple,
                    'route': AppRoutes.listeningPractice,
                  },
                  {
                    'title': l10n.courseSpeaking,
                    'icon': Icons.mic_none_outlined,
                    'progress': 0.1,
                    'color': Colors.red,
                    'route': AppRoutes.speaking,
                  },
                  // {
                  //   'title': l10n.courseConversation,
                  //   'icon': Icons.chat_bubble_outline,
                  //   'progress': 0.0,
                  //   'color': Colors.teal,
                  //   'route': AppRoutes.conversation,
                  // },
                ];
                return _EnhancedCourseCard(
                  title: lessons[index]['title'] as String,
                  icon: lessons[index]['icon'] as IconData,
                  progress: lessons[index]['progress'] as double,
                  color: lessons[index]['color'] as Color,
                  onTap: () {
                    Navigator.pushNamed(
                        context, lessons[index]['route'] as String);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _EnhancedCourseCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final double progress;
  final Color color;
  final VoidCallback onTap;

  const _EnhancedCourseCard({
    required this.title,
    required this.icon,
    required this.progress,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(0.1),
        ),
        boxShadow: const [
          AppTheme.boxShadow,
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(icon, size: 20, color: color),
                    ),
                    Text(
                      '${(progress * 100).toInt()}%',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: color,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Text(
                  title,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 5),
                LinearProgressIndicator(
                  value: progress,
                  backgroundColor: theme.colorScheme.surfaceVariant,
                  valueColor: AlwaysStoppedAnimation<Color>(color),
                  borderRadius: BorderRadius.circular(4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
