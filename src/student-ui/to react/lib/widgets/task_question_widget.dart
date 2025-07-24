import 'package:flutter/material.dart';
import '../../../../../migrate/lib/models/task_model.dart';
import 'package:collection/collection.dart';

class MultipleChoiceQuestion extends StatelessWidget {
  final TaskQuestion question;
  final Function(dynamic) onAnswer;
  final bool showFeedback;
  final bool showCorrectAnswers;

  const MultipleChoiceQuestion({
    super.key,
    required this.question,
    required this.onAnswer,
    this.showFeedback = true,
    this.showCorrectAnswers = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: question.options.asMap().entries.map((entry) {
        final index = entry.key;
        final option = entry.value;
        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => onAnswer(index),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceVariant,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Theme.of(context).colorScheme.outline,
                ),
              ),
              child: Text(
                option,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class TrueFalseQuestion extends StatefulWidget {
  final TaskQuestion question;
  final Function(dynamic) onAnswer;
  final bool showFeedback;
  final bool showCorrectAnswers;

  const TrueFalseQuestion({
    super.key,
    required this.question,
    required this.onAnswer,
    this.showFeedback = true,
    this.showCorrectAnswers = true,
  });

  @override
  State<TrueFalseQuestion> createState() => _TrueFalseQuestionState();
}

class _TrueFalseQuestionState extends State<TrueFalseQuestion> {
  String _selectedAnswer = '';
  bool _isCorrect = false;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: widget.question.options.map((option) {
        return Flexible(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () {
                setState(() {
                  _selectedAnswer = option;
                  _isCorrect = option == widget.question.correctAnswer;
                  widget.onAnswer(option);
                });
              },
              child: Container(
                padding:
                    const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceVariant,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Theme.of(context).colorScheme.outline,
                  ),
                ),
                child: Text(
                  option,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class FillInBlanksQuestion extends StatelessWidget {
  final TaskQuestion question;
  final Function(dynamic) onAnswer;
  final bool showFeedback;
  final bool showCorrectAnswers;

  const FillInBlanksQuestion({
    super.key,
    required this.question,
    required this.onAnswer,
    this.showFeedback = true,
    this.showCorrectAnswers = true,
  });

  @override
  Widget build(BuildContext context) {
    final parts = question.text.split('_____');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < parts.length; i++) ...[
          Text(parts[i]),
          if (i < parts.length - 1)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Enter your answer',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onChanged: (value) => onAnswer(value),
              ),
            ),
        ],
      ],
    );
  }
}

class ShortAnswerQuestion extends StatelessWidget {
  final TaskQuestion question;
  final Function(dynamic) onAnswer;
  final bool showFeedback;
  final bool showCorrectAnswers;

  const ShortAnswerQuestion({
    super.key,
    required this.question,
    required this.onAnswer,
    this.showFeedback = true,
    this.showCorrectAnswers = true,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      maxLines: 3,
      decoration: InputDecoration(
        hintText: 'Enter your answer',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      onChanged: (value) => onAnswer(value),
    );
  }
}

class EssayQuestion extends StatelessWidget {
  final TaskQuestion question;
  final Function(dynamic) onAnswer;
  final bool showFeedback;
  final bool showCorrectAnswers;

  const EssayQuestion({
    super.key,
    required this.question,
    required this.onAnswer,
    this.showFeedback = true,
    this.showCorrectAnswers = true,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      maxLines: 5,
      decoration: InputDecoration(
        hintText: 'Write your essay here',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      onChanged: (value) => onAnswer(value),
    );
  }
}

class TaskQuestionWidget extends StatefulWidget {
  final TaskQuestion question;
  final List<String> answers;
  final Function(dynamic) onAnswer;
  final bool showFeedback;
  final bool showCorrectAnswers;
  final bool allowReview;

  const TaskQuestionWidget({
    super.key,
    required this.question,
    required this.answers,
    required this.onAnswer,
    this.showFeedback = true,
    this.showCorrectAnswers = true,
    this.allowReview = true,
  });

  @override
  State<TaskQuestionWidget> createState() => _TaskQuestionWidgetState();
}

class _TaskQuestionWidgetState extends State<TaskQuestionWidget> {
  dynamic _selectedAnswer;
  bool? _isCorrect;
  String? _feedbackMsg;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.question.text,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            _buildAnswerInput(),
            if (widget.showFeedback && _feedbackMsg != null) ...[
              const SizedBox(height: 16),
              _buildFeedback(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildAnswerInput() {
    final type = widget.question.type.toLowerCase();
    switch (type) {
      case 'multiplechoice':
        return _buildMultipleChoice();
      case 'truefalse':
        return _buildTrueFalse();
      case 'fillinblanks':
        return _buildFillInBlanks();
      case 'shortanswer':
        return _buildShortAnswer();
      case 'essay':
        return _buildEssay();
      default:
        return _buildMultipleChoice();
    }
  }

  Widget _buildTrueFalse() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: widget.answers.map((option) {
        final isSelected = _selectedAnswer == option;
        final isCorrect = option == widget.question.correctAnswer;

        // Color logic for selected/correct/incorrect states
        Color bgColor;
        Color textColor;
        Color borderColor;

        if (isSelected && _isCorrect != null) {
          if (_isCorrect!) {
            bgColor = Theme.of(context)
                .colorScheme
                .primary
                .withAlpha((0.1 * 255).toInt());
            textColor = Theme.of(context).colorScheme.primary;
            borderColor = Theme.of(context).colorScheme.primary;
          } else {
            bgColor = Theme.of(context)
                .colorScheme
                .error
                .withAlpha((0.1 * 255).toInt());
            textColor = Theme.of(context).colorScheme.error;
            borderColor = Theme.of(context).colorScheme.error;
          }
        } else if (isSelected) {
          bgColor = Theme.of(context)
              .colorScheme
              .secondary
              .withAlpha((0.1 * 255).toInt());
          textColor = Theme.of(context).colorScheme.secondary;
          borderColor = Theme.of(context).colorScheme.secondary;
        } else {
          bgColor = Theme.of(context).colorScheme.surfaceContainerHighest;
          textColor = Theme.of(context).colorScheme.onSurface;
          borderColor = Theme.of(context).colorScheme.outline;
        }

        return Flexible(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () {
                setState(() {
                  _selectedAnswer = option;
                  widget.onAnswer(option);
                  _showTrueFalseFeedback(option);
                });
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                padding:
                    const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: borderColor,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      option.toString(),
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: isSelected
                                ? textColor
                                : Theme.of(context).brightness ==
                                        Brightness.dark
                                    ? Colors.white70
                                    : Theme.of(context)
                                        .colorScheme
                                        .onSurfaceVariant,
                            fontWeight: isSelected
                                ? FontWeight.bold
                                : FontWeight.normal,
                          ),
                    ),
                    if (isSelected && _isCorrect != null) ...[
                      const SizedBox(width: 8),
                      Icon(
                        _isCorrect! ? Icons.check_circle : Icons.error,
                        color: textColor,
                        size: 20,
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  void _showTrueFalseFeedback(String answer) {
    final correct = answer == widget.question.correctAnswer;
    setState(() {
      _isCorrect = correct;
      _feedbackMsg = correct ? 'Correct!' : 'Incorrect';
    });
  }

  Widget _buildMultipleChoice() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ...widget.answers.asMap().entries.map((entry) {
          final index = entry.key;
          final option = entry.value;
          final isSelected = _selectedAnswer == option;
          final isCorrect =
              _isCorrect != null && option == widget.question.correctAnswer;
          final isIncorrect = _isCorrect == false && isSelected;

          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 4.0),
            child: InkWell(
              onTap: () {
                setState(() {
                  _selectedAnswer = option;
                  widget.onAnswer(option);
                  _showFeedback(option);
                });
              },
              child: Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: isSelected
                      ? (isCorrect
                          ? Colors.green.withAlpha((0.1 * 255).toInt())
                          : (isIncorrect
                              ? Colors.red.withAlpha((0.1 * 255).toInt())
                              : Colors.blue.withAlpha((0.1 * 255).toInt())))
                      : Colors.grey.withAlpha((0.1 * 255).toInt()),
                  borderRadius: BorderRadius.circular(8.0),
                  border: Border.all(
                    color: isSelected
                        ? (isCorrect
                            ? Colors.green
                            : (isIncorrect ? Colors.red : Colors.blue))
                        : Colors.grey.withAlpha(0x33),
                    width: 1.0,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 24.0,
                      height: 24.0,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isSelected
                              ? (isCorrect
                                  ? Colors.green
                                  : (isIncorrect ? Colors.red : Colors.blue))
                              : Colors.grey.withAlpha(0x33),
                          width: 2.0,
                        ),
                      ),
                      child: isSelected
                          ? Center(
                              child: Icon(
                                isCorrect
                                    ? Icons.check_circle
                                    : isIncorrect
                                        ? Icons.cancel
                                        : Icons.radio_button_checked,
                                size: 20.0,
                                color: isCorrect
                                    ? Colors.green
                                    : isIncorrect
                                        ? Colors.red
                                        : Colors.blue,
                              ),
                            )
                          : null,
                    ),
                    const SizedBox(width: 12.0),
                    Expanded(
                      child: Text(
                        option,
                        style: TextStyle(
                          color: isSelected
                              ? (isCorrect
                                  ? Colors.green
                                  : isIncorrect
                                      ? Colors.red
                                      : Colors.blue)
                              : Colors.black87,
                          fontSize: 16.0,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildFillInBlanks() {
    final parts = widget.question.text.split('_____');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < parts.length; i++) ...[
          Text(parts[i]),
          if (i < parts.length - 1)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Enter your answer',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onChanged: (value) => widget.onAnswer(value),
              ),
            ),
        ],
      ],
    );
  }

  Widget _buildShortAnswer() {
    return TextField(
      maxLines: 3,
      decoration: InputDecoration(
        hintText: 'Enter your answer',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      onChanged: (value) => widget.onAnswer(value),
    );
  }

  Widget _buildEssay() {
    return TextField(
      maxLines: 5,
      decoration: InputDecoration(
        hintText: 'Write your essay here',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      onChanged: (value) => widget.onAnswer(value),
    );
  }

  Widget _buildFeedback() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _isCorrect == true
            ? Theme.of(context)
                .colorScheme
                .secondary
                .withAlpha((0.1 * 255).toInt())
            : Theme.of(context)
                .colorScheme
                .error
                .withAlpha((0.1 * 255).toInt()),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(
            _isCorrect == true ? Icons.check_circle : Icons.error,
            color: _isCorrect == true
                ? Theme.of(context).colorScheme.secondary
                : Theme.of(context).colorScheme.error,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _feedbackMsg!,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: _isCorrect == true
                            ? Theme.of(context).colorScheme.secondary
                            : Theme.of(context).colorScheme.error,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                if (widget.showCorrectAnswers && !_isCorrect!) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Correct answer: ${widget.question.correctAnswer}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurface,
                        ),
                  ),
                ],
                if (widget.question.explanation.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    widget.question.explanation,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurface,
                        ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showFeedback(dynamic answer) {
    bool correct = false;
    if (widget.question.type.toLowerCase() == 'multiplechoice') {
      correct = answer == widget.question.correctAnswer;
    } else if (widget.question.type.toLowerCase() == 'truefalse') {
      correct = answer == widget.question.correctAnswer;
    } else if (widget.question.type.toLowerCase() == 'shortanswer' ||
        widget.question.type.toLowerCase() == 'essay' ||
        widget.question.type.toLowerCase() == 'grammarcorrection') {
      correct = answer.toString().trim().toLowerCase() ==
          (widget.question.correctAnswer?.toString().trim().toLowerCase() ??
              '');
    } else if (widget.question.type.toLowerCase() == 'fillinblanks') {
      if (answer is List && widget.question.correctAnswer is List) {
        correct =
            const ListEquality().equals(answer, widget.question.correctAnswer);
      }
    }
    setState(() {
      _isCorrect = correct;
      _feedbackMsg = correct ? 'Correct!' : 'Incorrect';
    });
  }
}
