import 'package:flutter/material.dart';

class MultipleChoiceFeedbackSection extends StatelessWidget {
  final bool isCorrect;
  final String explanation;

  const MultipleChoiceFeedbackSection({
    Key? key,
    required this.isCorrect,
    required this.explanation,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isCorrect
            ? Colors.green
                .withOpacity(theme.brightness == Brightness.dark ? 0.2 : 0.1)
            : Colors.red
                .withOpacity(theme.brightness == Brightness.dark ? 0.2 : 0.1),
        border: Border.all(
          color: isCorrect
              ? Colors.green.withOpacity(0.5)
              : Colors.red.withOpacity(0.5),
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isCorrect ? Icons.check_circle : Icons.cancel,
                color: isCorrect ? Colors.green : Colors.red,
              ),
              const SizedBox(width: 12),
              Text(
                isCorrect ? 'Correct!' : 'Incorrect',
                style: TextStyle(
                  color: isCorrect ? Colors.green : Colors.red,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          if (explanation.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              explanation,
              style:
                  TextStyle(color: theme.colorScheme.onSurface, fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }
}
