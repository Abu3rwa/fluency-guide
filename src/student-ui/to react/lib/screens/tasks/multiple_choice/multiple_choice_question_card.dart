import 'package:flutter/material.dart';
import 'package:englishfluencyguide/models/task_model.dart';

class MultipleChoiceQuestionCard extends StatelessWidget {
  final TaskQuestion question;
  final String? selectedAnswer;
  final void Function(String) onAnswer;

  const MultipleChoiceQuestionCard({
    Key? key,
    required this.question,
    required this.selectedAnswer,
    required this.onAnswer,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          question.text,
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 32),
        ...question.options.map((option) {
          return ListTile(
            title: Text(option),
            leading: Radio<String>(
              value: option,
              groupValue: selectedAnswer,
              onChanged: (String? value) {
                if (value != null) onAnswer(value);
              },
            ),
          );
        }).toList(),
      ],
    );
  }
}
