import 'package:flutter/material.dart';

class FillInBlankFeedbackSection extends StatelessWidget {
  final List<bool> blanksCorrectness;
  const FillInBlankFeedbackSection({Key? key, required this.blanksCorrectness})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final correctCount = blanksCorrectness.where((correct) => correct).length;
    final totalCount = blanksCorrectness.length;
    final theme = Theme.of(context);
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: correctCount == totalCount
            ? Colors.green
                .withOpacity(theme.brightness == Brightness.dark ? 0.2 : 0.1)
            : Colors.orange
                .withOpacity(theme.brightness == Brightness.dark ? 0.2 : 0.1),
        border: Border.all(
          color: correctCount == totalCount
              ? Colors.green.withOpacity(0.5)
              : Colors.orange.withOpacity(0.5),
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(
            correctCount == totalCount ? Icons.check_circle : Icons.info,
            color: correctCount == totalCount ? Colors.green : Colors.orange,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              correctCount == totalCount
                  ? 'Perfect! All blanks are correct.'
                  : '$correctCount out of $totalCount blanks are correct.',
              style: TextStyle(
                color:
                    correctCount == totalCount ? Colors.green : Colors.orange,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
