import 'package:flutter/material.dart';

class TrueFalseNavigation extends StatelessWidget {
  final int currentQuestionIndex;
  final int totalQuestions;
  final bool isAnswered;
  final VoidCallback onNext;
  final VoidCallback onPrevious;
  final VoidCallback onSubmit;

  const TrueFalseNavigation({
    Key? key,
    required this.currentQuestionIndex,
    required this.totalQuestions,
    required this.isAnswered,
    required this.onNext,
    required this.onPrevious,
    required this.onSubmit,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Previous Button
          SizedBox(
            width: 100,
            child: TextButton(
              onPressed: currentQuestionIndex > 0 ? onPrevious : null,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.all(2),
                backgroundColor: Colors.grey[300],
                foregroundColor: Colors.black87,
              ),
              child: const Text(
                'Back',
              ),
            ),
          ),

          // Question Navigator Dots
          Row(
            children: List.generate(
              totalQuestions,
              (index) => Container(
                margin: const EdgeInsets.symmetric(horizontal: 2),
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: index <= currentQuestionIndex
                      ? Colors.green
                      : Colors.grey[300],
                ),
              ),
            ),
          ),

          // Next/Submit Button
          SizedBox(
            width: 120,
            child: ElevatedButton.icon(
              onPressed: isAnswered
                  ? () {
                      if (currentQuestionIndex < totalQuestions - 1) {
                        onNext();
                      } else {
                        onSubmit();
                      }
                    }
                  : null,
              icon: Icon(
                currentQuestionIndex == totalQuestions - 1
                    ? Icons.check
                    : Icons.arrow_forward,
              ),
              label: Text(
                currentQuestionIndex == totalQuestions - 1
                    ? 'Submit'
                    : 'Next',
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: currentQuestionIndex == totalQuestions - 1
                    ? Colors.orange
                    : Theme.of(context).primaryColor,
                foregroundColor: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
