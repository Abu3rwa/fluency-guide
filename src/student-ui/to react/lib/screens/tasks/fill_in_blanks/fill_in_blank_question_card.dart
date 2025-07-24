import 'package:flutter/material.dart';
import '../../../../../../../migrate/lib/models/task_model.dart';

class FillInBlankQuestionCard extends StatelessWidget {
  final TaskQuestion question;
  final bool showFeedback;
  final List<bool>? blanksCorrectness;
  final bool isAnswered;
  final Widget questionWithBlanks;
  final Widget? feedbackSection;
  final Widget? explanationSection;

  const FillInBlankQuestionCard({
    Key? key,
    required this.question,
    required this.showFeedback,
    required this.blanksCorrectness,
    required this.isAnswered,
    required this.questionWithBlanks,
    this.feedbackSection,
    this.explanationSection,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: Theme.of(context).cardColor,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 0.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Instructions
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.blue.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Icon(Icons.drag_indicator, color: Colors.blue[700], size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Drag and drop words to fill in the blanks',
                    style: TextStyle(
                      color: Colors.blue[700],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          // Question with Blanks
          questionWithBlanks,
          // Feedback Section
          if (showFeedback &&
              blanksCorrectness != null &&
              feedbackSection != null)
            feedbackSection!,
          // Explanation Section
          if (isAnswered &&
              question.explanation.isNotEmpty &&
              explanationSection != null)
            explanationSection!,
        ],
      ),
    );
  }
}
