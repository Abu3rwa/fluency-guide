import 'package:flutter/material.dart';

class FillInBlankProgressSection extends StatelessWidget {
  final int currentQuestionIndex;
  final int totalQuestions;

  const FillInBlankProgressSection({
    Key? key,
    required this.currentQuestionIndex,
    required this.totalQuestions,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        LinearProgressIndicator(
          value: (currentQuestionIndex + 1) / totalQuestions,
        ),
        const SizedBox(height: 8),
        Text('Progress: ${currentQuestionIndex + 1} / $totalQuestions'),
      ],
    );
  }
}
