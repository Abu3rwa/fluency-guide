import 'package:flutter/material.dart';
import '../../../../../../migrate/lib/models/pronunciation_progress.dart';
import '../../services/pronunciation_progress_service.dart';
import 'package:englishfluencyguide/l10n/app_localizations.dart';

class ProgressPronunciationSection extends StatefulWidget {
  final String userId;
  final Map<String, dynamic>? pronunciationStats;

  const ProgressPronunciationSection({
    Key? key,
    required this.userId,
    this.pronunciationStats,
  }) : super(key: key);

  @override
  State<ProgressPronunciationSection> createState() =>
      _ProgressPronunciationSectionState();
}

class _ProgressPronunciationSectionState
    extends State<ProgressPronunciationSection> {
  List<PronunciationSummary> _pronunciationSummaries = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPronunciationProgress();
  }

  Future<void> _loadPronunciationProgress() async {
    try {
      print('Loading pronunciation progress for user: ${widget.userId}');
      final service = PronunciationProgressService();

      // Use the simple method that doesn't require composite indexes
      final summaries =
          await service.getSimplePronunciationSummaries(widget.userId);

      print('Loaded ${summaries.length} pronunciation summaries');
      for (final summary in summaries) {
        print(
            'Summary: ${summary.word} - ${summary.totalAttempts} attempts, ${summary.averageAccuracy} accuracy');
      }

      setState(() {
        _pronunciationSummaries = summaries;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading pronunciation progress: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16.0),
          child: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    if (_pronunciationSummaries.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            children: [
              Icon(
                Icons.mic_outlined,
                size: 64,
                color: Colors.grey[400],
              ),
              const SizedBox(height: 16),
              Text(
                AppLocalizations.of(context)!.noPronunciationPractice,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                AppLocalizations.of(context)!.startPracticingPronunciation,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[500],
                    ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.mic, color: Theme.of(context).primaryColor),
            const SizedBox(width: 8),
            Text(
              AppLocalizations.of(context)!.pronunciationProgress,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const Spacer(),
            Text(
              '${_pronunciationSummaries.length} words',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Statistics Cards
        _buildStatisticsCards(),
        const SizedBox(height: 16),

        // Progress List
        _buildProgressList(),
      ],
    );
  }

  Widget _buildStatisticsCards() {
    final stats = widget.pronunciationStats ?? {};
    final totalAttempts = stats['totalAttempts'] ?? 0;
    final successfulAttempts = stats['successfulAttempts'] ?? 0;
    final averageAccuracy = stats['averageAccuracy'] ?? 0.0;
    final averageConfidence = stats['averageConfidence'] ?? 0.0;
    final totalWords = stats['totalWords'] ?? 0;
    final bestAccuracy = stats['bestAccuracy'] ?? 0.0;

    final successRate =
        totalAttempts > 0 ? (successfulAttempts / totalAttempts) : 0.0;

    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                AppLocalizations.of(context)!.totalAttempts,
                totalAttempts.toString(),
                Icons.mic,
                Colors.blue,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildStatCard(
                AppLocalizations.of(context)!.successRate,
                '${(successRate * 100).toStringAsFixed(1)}%',
                Icons.check_circle,
                Colors.green,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildStatCard(
                AppLocalizations.of(context)!.avgAccuracy,
                '${(averageAccuracy * 100).toStringAsFixed(1)}%',
                Icons.trending_up,
                Colors.orange,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                AppLocalizations.of(context)!.bestAccuracy,
                '${(bestAccuracy * 100).toStringAsFixed(1)}%',
                Icons.star,
                Colors.purple,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildStatCard(
                AppLocalizations.of(context)!.avgConfidence,
                '${(averageConfidence * 100).toStringAsFixed(1)}%',
                Icons.psychology,
                Colors.teal,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildStatCard(
                AppLocalizations.of(context)!.wordsPracticed,
                totalWords.toString(),
                Icons.book,
                Colors.indigo,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard(
      String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 4),
            Text(
              value,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
            ),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressList() {
    // Sort by last attempt (most recent first)
    final sortedSummaries =
        List<PronunciationSummary>.from(_pronunciationSummaries)
          ..sort((a, b) => b.lastAttempt.compareTo(a.lastAttempt));

    return Column(
      children: [
        Row(
          children: [
            Text(
              AppLocalizations.of(context)!.recentPractice,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const Spacer(),
            TextButton(
              onPressed: () {
                // TODO: Navigate to detailed pronunciation progress
              },
              child: Text(AppLocalizations.of(context)!.viewAll),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ...sortedSummaries
            .take(5)
            .map((summary) => _buildProgressCard(summary)),
      ],
    );
  }

  Widget _buildProgressCard(PronunciationSummary summary) {
    final accuracy = summary.averageAccuracy;
    final confidence = summary.averageConfidence;
    final successRate = summary.totalAttempts > 0
        ? (summary.successfulAttempts / summary.totalAttempts)
        : 0.0;

    Color accuracyColor;
    String accuracyText;

    if (accuracy >= 0.8) {
      accuracyColor = Colors.green;
      accuracyText = AppLocalizations.of(context)!.excellent;
    } else if (accuracy >= 0.6) {
      accuracyColor = Colors.orange;
      accuracyText = AppLocalizations.of(context)!.good;
    } else {
      accuracyColor = Colors.red;
      accuracyText = AppLocalizations.of(context)!.needsPractice;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: accuracyColor.withOpacity(0.1),
          child: Icon(
            Icons.mic,
            color: accuracyColor,
            size: 20,
          ),
        ),
        title: Text(
          summary.word,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Column(
              children: [
                Text(
                  '${summary.totalAttempts} ${AppLocalizations.of(context)!.attempts}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
                const SizedBox(height: 5),
                Text(
                  accuracyText,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: accuracyColor,
                        // fontWeight: FontWeight.w500,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            LinearProgressIndicator(
              value: accuracy,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(accuracyColor),
              minHeight: 4,
            ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${(accuracy * 100).toStringAsFixed(0)}%',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: accuracyColor,
                  ),
            ),
            Text(
              '${(successRate * 100).toStringAsFixed(0)}% ${AppLocalizations.of(context)!.success}',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Detailed Statistics
                Row(
                  children: [
                    Expanded(
                      child: _buildDetailStat(
                        AppLocalizations.of(context)!.bestAccuracy,
                        '${(summary.bestAccuracy * 100).toStringAsFixed(1)}%',
                        Icons.star,
                        Colors.amber,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildDetailStat(
                        AppLocalizations.of(context)!.avgConfidence,
                        '${(confidence * 100).toStringAsFixed(1)}%',
                        Icons.psychology,
                        Colors.teal,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Time Information
                Row(
                  children: [
                    Expanded(
                      child: _buildDetailStat(
                        AppLocalizations.of(context)!.firstAttempt,
                        _formatDate(summary.firstAttempt),
                        Icons.schedule,
                        Colors.blue,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildDetailStat(
                        AppLocalizations.of(context)!.lastAttempt,
                        _formatDate(summary.lastAttempt),
                        Icons.update,
                        Colors.green,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Common Mistakes
                if (summary.commonMistakes.isNotEmpty) ...[
                  Text(
                    AppLocalizations.of(context)!.commonMistakes,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: summary.commonMistakes
                        .take(6)
                        .map((mistake) => Chip(
                              label: Text(
                                mistake,
                                style: const TextStyle(fontSize: 12),
                              ),
                              backgroundColor: Colors.red[50],
                              labelStyle: TextStyle(color: Colors.red[700]),
                            ))
                        .toList(),
                  ),
                  const SizedBox(height: 16),
                ],

                // Word Frequency
                if (summary.wordFrequency.isNotEmpty) ...[
                  Text(
                    AppLocalizations.of(context)!.wordFrequency,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: summary.wordFrequency.entries
                        .take(6)
                        .map((entry) => Chip(
                              label: Text(
                                '${entry.key}: ${entry.value}',
                                style: const TextStyle(fontSize: 12),
                              ),
                              backgroundColor: Colors.blue[50],
                              labelStyle: TextStyle(color: Colors.blue[700]),
                            ))
                        .toList(),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailStat(
      String label, String value, IconData icon, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(width: 4),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: color,
              ),
        ),
      ],
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      return 'Today';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }
}
