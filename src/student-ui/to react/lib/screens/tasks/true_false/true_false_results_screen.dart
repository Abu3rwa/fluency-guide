import 'package:flutter/material.dart';
import '../../../../../../../migrate/lib/models/task_model.dart';

class TrueFalseResultsScreen extends StatelessWidget {
  final int score;
  final int totalPoints;
  final bool passed;
  final int attempts;
  final int attemptsAllowed;
  final DateTime? quizStartTime;
  final List<TaskQuestion> questions;
  final Map<String, bool> userAnswers;
  final VoidCallback onRestart;

  const TrueFalseResultsScreen({
    Key? key,
    required this.score,
    required this.totalPoints,
    required this.passed,
    required this.attempts,
    required this.attemptsAllowed,
    required this.quizStartTime,
    required this.questions,
    required this.userAnswers,
    required this.onRestart,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final percentage =
        totalPoints > 0 ? (score / totalPoints * 100).round() : 0;
    final totalTime = quizStartTime != null
        ? DateTime.now().difference(quizStartTime!).inSeconds
        : 0;

    // Debug logging for results screen
    debugPrint('=== RESULTS SCREEN DEBUG ===');
    debugPrint('Score received: $score');
    debugPrint('Total points received: $totalPoints');
    debugPrint('Percentage calculated: $percentage%');
    debugPrint('Passed: $passed');
    debugPrint('=== END RESULTS SCREEN DEBUG ===');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quiz Results'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Results Header
            Card(
              elevation: 8,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: LinearGradient(
                    colors: passed
                        ? [Colors.green[400]!, Colors.green[600]!]
                        : [Colors.red[400]!, Colors.red[600]!],
                  ),
                ),
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Icon(
                      passed ? Icons.celebration : Icons.sentiment_dissatisfied,
                      size: 60,
                      color: Colors.white,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      passed ? 'Congratulations!' : 'Keep Trying!',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '$score / $totalPoints ($percentage%)',
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Stats Cards
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    context,
                    'Time Taken',
                    '${totalTime ~/ 60}:${(totalTime % 60).toString().padLeft(2, '0')}',
                    Icons.timer,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildStatCard(
                    context,
                    'Attempts',
                    '$attempts / $attemptsAllowed',
                    Icons.refresh,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Review Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Review Answers',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 16),
                    ...questions.asMap().entries.map((entry) {
                      final index = entry.key;
                      final q = entry.value;
                      final isCorrect = userAnswers[q.id] ==
                          (q.correctAnswer.toString().toLowerCase() == 'true');

                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        color: isCorrect
                            ? Colors.green.withOpacity(0.1)
                            : Colors.red.withOpacity(0.1),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor:
                                isCorrect ? Colors.green : Colors.red,
                            child: Text(
                              '${index + 1}',
                              style: const TextStyle(color: Colors.white),
                            ),
                          ),
                          title: Text(q.text),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Your answer: ${userAnswers[q.id] == true ? 'True' : 'False'}',
                                style: TextStyle(
                                  color: isCorrect ? Colors.green : Colors.red,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                'Correct answer: ${(q.correctAnswer.toString().toLowerCase() == 'true') ? 'True' : 'False'}',
                                style: const TextStyle(color: Colors.blueGrey),
                              ),
                              if (q.explanation.isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 4.0),
                                  child: Text(
                                    'Explanation: ${q.explanation}',
                                    style:
                                        Theme.of(context).textTheme.bodySmall,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Action Buttons
            if (attempts < attemptsAllowed) ...[
              ElevatedButton.icon(
                onPressed: onRestart,
                icon: const Icon(Icons.refresh),
                label: const Text('Try Again'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.all(16),
                ),
              ),
              const SizedBox(height: 8),
            ],
            OutlinedButton.icon(
              onPressed: () => Navigator.of(context).pop(),
              icon: const Icon(Icons.home),
              label: const Text('Back to Menu'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.all(16),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(
      BuildContext context, String title, String value, IconData icon) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: Theme.of(context).primaryColor),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
