import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../../../migrate/lib/models/vocabulary_word.dart';
import '../../../../../../migrate/lib/models/vocabulary_progress.dart';
import '../../providers/vocabulary_progress_provider.dart';
import '../../l10n/app_localizations.dart';

class WordCard extends StatelessWidget {
  final VocabularyWord word;
  final ThemeData theme;
  final bool isDark;
  final bool wordPronunciationCompleted;
  final bool sentencePronunciationCompleted;
  final void Function()? onShowPronunciationPractice;
  final void Function()? onShowSentencePronunciation;

  const WordCard({
    Key? key,
    required this.word,
    required this.theme,
    required this.isDark,
    required this.wordPronunciationCompleted,
    required this.sentencePronunciationCompleted,
    this.onShowPronunciationPractice,
    this.onShowSentencePronunciation,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 12,
      shadowColor: theme.primaryColor.withOpacity(0.3),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          color: isDark ? theme.colorScheme.surface : Colors.white,
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Word Header
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        word.word,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          fontSize: 36,
                          color: isDark
                              ? theme.colorScheme.primary
                              : theme.primaryColorDark,
                          letterSpacing: 0.5,
                        ),
                      ),
                      if (word.pronunciation != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          word.pronunciation!,
                          style: theme.textTheme.bodyLarge?.copyWith(
                            fontStyle: FontStyle.italic,
                            color: isDark
                                ? theme.colorScheme.onSurface.withOpacity(0.7)
                                : Colors.grey[600],
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: theme.primaryColor.withOpacity(0.1),
                  ),
                  child: IconButton(
                    icon: Icon(
                      Icons.volume_up,
                      size: 28,
                      color: theme.primaryColor,
                    ),
                    onPressed: onShowPronunciationPractice,
                    tooltip:
                        AppLocalizations.of(context)!.practicePronunciation,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Tags Row
            if (word.partOfSpeech != null ||
                word.category != null ||
                word.difficultyLevel != null)
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  if (word.partOfSpeech != null)
                    _buildTag(word.partOfSpeech!, theme.primaryColor, theme),
                  if (word.category != null)
                    _buildTag(word.category!, Colors.teal, theme),
                  if (word.difficultyLevel != null)
                    _buildTag(
                      'Level ${word.difficultyLevel}',
                      _getDifficultyColor(word.difficultyLevel!),
                      theme,
                    ),
                ],
              ),

            const SizedBox(height: 24),

            // Content Sections
            if (word.meaningArabic != null)
              _buildContentSection(
                AppLocalizations.of(context)!.meaning,
                word.meaningArabic!,
                Icons.translate,
                Colors.blue,
                theme,
              ),

            // Word Practice Button
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onShowPronunciationPractice,
                icon: Icon(
                  wordPronunciationCompleted
                      ? Icons.check_circle
                      : Icons.record_voice_over,
                  size: 18,
                  color:
                      wordPronunciationCompleted ? Colors.green : Colors.white,
                ),
                label: Text(wordPronunciationCompleted
                    ? AppLocalizations.of(context)!.wordPracticed
                    : AppLocalizations.of(context)!.practiceWord),
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 2,
                ),
              ),
            ),

            if (word.example != null) ...[
              const SizedBox(height: 16),
              _buildContentSection(
                AppLocalizations.of(context)!.example,
                word.example!,
                Icons.lightbulb_outline,
                Colors.orange,
                theme,
              ),
              // Sentence Practice Button
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: onShowSentencePronunciation,
                  icon: Icon(
                    sentencePronunciationCompleted
                        ? Icons.check_circle
                        : Icons.chat_bubble_outline,
                    size: 18,
                    color: sentencePronunciationCompleted
                        ? Colors.green
                        : Colors.white,
                  ),
                  label: Text(sentencePronunciationCompleted
                      ? AppLocalizations.of(context)!.sentencePracticed
                      : AppLocalizations.of(context)!.practiceSentence),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.teal,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 2,
                  ),
                ),
              ),
            ],

            if (word.exampleMeaningArabic != null) ...[
              const SizedBox(height: 16),
              _buildContentSection(
                AppLocalizations.of(context)!.exampleMeaning,
                word.exampleMeaningArabic!,
                Icons.language,
                Colors.green,
                theme,
              ),
            ],

            if (word.frequency != null) ...[
              const SizedBox(height: 16),
              _buildContentSection(
                AppLocalizations.of(context)!.usageFrequency,
                _getFrequencyDescription(context, word.frequency!),
                Icons.trending_up,
                Colors.purple,
                theme,
              ),
            ],

            // Progress Section
            Consumer<VocabularyProgressProvider>(
              builder: (context, progressProvider, child) {
                final progress = progressProvider.getWordProgress(word.word);
                if (progress != null) {
                  return Column(
                    children: [
                      const SizedBox(height: 16),
                      _buildProgressSection(progress, theme, context),
                    ],
                  );
                }
                return const SizedBox.shrink();
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTag(String text, Color color, ThemeData theme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        text,
        style: theme.textTheme.bodySmall?.copyWith(
          color: isDark ? color.withOpacity(0.9) : color,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
      ),
    );
  }

  Widget _buildContentSection(
    String title,
    String content,
    IconData icon,
    Color color,
    ThemeData theme,
  ) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isDark ? color.withOpacity(0.9) : color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: theme.textTheme.bodyMedium?.copyWith(
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressSection(
      VocabularyProgress progress, ThemeData theme, BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.blue.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.analytics, color: Colors.blue, size: 20),
              const SizedBox(width: 8),
              Text(
                AppLocalizations.of(context)!.yourProgress,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.blue.withOpacity(0.9) : Colors.blue,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildProgressItem(
                  AppLocalizations.of(context)!.views,
                  progress.timesViewed.toString(),
                  Icons.visibility,
                  Colors.blue,
                  context,
                ),
              ),
              Expanded(
                child: _buildProgressItem(
                  AppLocalizations.of(context)!.correct,
                  progress.timesCorrect.toString(),
                  Icons.check_circle,
                  Colors.green,
                  context,
                ),
              ),
              Expanded(
                child: _buildProgressItem(
                  AppLocalizations.of(context)!.accuracy,
                  '${(progress.accuracy * 100).round()}%',
                  Icons.trending_up,
                  Colors.orange,
                  context,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProgressItem(String label, String value, IconData icon,
      Color color, BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: isDark ? color.withOpacity(0.9) : color,
              ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: isDark ? Colors.white : Colors.grey[600],
              ),
        ),
      ],
    );
  }

  Color _getDifficultyColor(String level) {
    switch (level.toUpperCase()) {
      case 'A1':
        return Colors.green;
      case 'A2':
        return Colors.lightGreen;
      case 'B1':
        return Colors.orange;
      case 'B2':
        return Colors.deepOrange;
      case 'C1':
        return Colors.red;
      case 'C2':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  String _getFrequencyDescription(BuildContext context, String frequency) {
    switch (frequency.toLowerCase()) {
      case 'very_high':
        return AppLocalizations.of(context)!.veryCommonlyUsedInEverydayEnglish;
      case 'high':
        return AppLocalizations.of(context)!.frequentlyUsedInEnglish;
      case 'medium':
        return AppLocalizations.of(context)!.moderatelyUsedInEnglish;
      case 'low':
        return AppLocalizations.of(context)!.occasionallyUsedInEnglish;
      case 'very_low':
        return AppLocalizations.of(context)!.rarelyUsedInEnglish;
      default:
        return frequency;
    }
  }
}
