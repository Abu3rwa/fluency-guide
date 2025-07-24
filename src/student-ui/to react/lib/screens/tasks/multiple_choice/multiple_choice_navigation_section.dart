import 'package:flutter/material.dart';

class MultipleChoiceNavigationSection extends StatelessWidget {
  final int currentQuestionIndex;
  final int totalQuestions;
  final bool isAnswered;
  final VoidCallback onNext;
  final bool isLastQuestion;

  const MultipleChoiceNavigationSection({
    Key? key,
    required this.currentQuestionIndex,
    required this.totalQuestions,
    required this.isAnswered,
    required this.onNext,
    required this.isLastQuestion,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text('Question ${currentQuestionIndex + 1} of $totalQuestions'),
        ElevatedButton(
          onPressed: isAnswered ? onNext : null,
          child: Text(isLastQuestion ? 'Finish' : 'Next'),
        ),
      ],
    );
  }
}
