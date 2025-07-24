import 'package:flutter/material.dart';
import '../../../../../../../migrate/lib/models/task_model.dart';

class FillInBlankQuestionWithBlanks extends StatelessWidget {
  final TaskQuestion question;
  final List<String> userAnswers;
  final Widget Function(int blankIndex) blankBuilder;

  const FillInBlankQuestionWithBlanks({
    Key? key,
    required this.question,
    required this.userAnswers,
    required this.blankBuilder,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Parse [ ... ] in the text and replace with blanks
    final blankPattern = RegExp(r'\[[^\]]*\]');
    final parts = <String>[];
    int lastEnd = 0;
    for (final match in blankPattern.allMatches(question.text)) {
      parts.add(question.text.substring(lastEnd, match.start));
      parts.add('BLANK');
      lastEnd = match.end;
    }
    parts.add(question.text.substring(lastEnd));
    int blankCounter = 0;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text.rich(
        TextSpan(
          children: parts.map((part) {
            if (part == 'BLANK') {
              final idx = blankCounter++;
              return WidgetSpan(
                child: blankBuilder(idx),
                alignment: PlaceholderAlignment.middle,
              );
            } else {
              return TextSpan(
                text: part,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              );
            }
          }).toList(),
        ),
        softWrap: true,
        overflow: TextOverflow.visible,
        textAlign: TextAlign.left,
      ),
    );
  }
}
