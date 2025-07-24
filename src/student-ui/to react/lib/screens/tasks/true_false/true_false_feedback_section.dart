import 'package:flutter/material.dart';

class TrueFalseFeedbackSection extends StatelessWidget {
  final bool? isCorrect;
  final String explanation;

  const TrueFalseFeedbackSection({
    Key? key,
    required this.isCorrect,
    required this.explanation,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (isCorrect == null) return const SizedBox.shrink();

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.only(top: 20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isCorrect! ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCorrect! ? Colors.green : Colors.red,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isCorrect! ? Icons.check_circle : Icons.error,
                color: isCorrect! ? Colors.green : Colors.red,
              ),
              const SizedBox(width: 8),
              Text(
                isCorrect! ? 'Correct! 🎉' : 'Incorrect ❌',
                style: TextStyle(
                  color: isCorrect! ? Colors.green : Colors.red,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ],
          ),
          if (explanation.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: Text(
                explanation,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
        ],
      ),
    );
  }
}
