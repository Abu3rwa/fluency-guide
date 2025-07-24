import 'package:flutter/material.dart';

class FillInBlankNavigationSection extends StatelessWidget {
  final int currentQuestionIndex;
  final int totalQuestions;
  final VoidCallback onNext;
  final VoidCallback onPrevious;
  final bool isLastQuestion;
  final bool isAnswered;

  const FillInBlankNavigationSection({
    Key? key,
    required this.currentQuestionIndex,
    required this.totalQuestions,
    required this.onNext,
    required this.onPrevious,
    required this.isLastQuestion,
    required this.isAnswered,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        ElevatedButton(
          onPressed: currentQuestionIndex > 0 ? onPrevious : null,
          child: const Text('Previous'),
        ),
        Text('Question ${currentQuestionIndex + 1} of $totalQuestions'),
        ElevatedButton(
          onPressed: isAnswered ? onNext : null,
          child: Text(isLastQuestion ? 'Finish' : 'Next'),
        ),
      ],
    );
  }
}
