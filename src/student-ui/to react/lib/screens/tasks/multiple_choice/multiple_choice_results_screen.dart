import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:englishfluencyguide/providers/audio_provider.dart';

class MultipleChoiceResultsScreen extends StatefulWidget {
  final int correctAnswers;
  final int totalQuestions;

  const MultipleChoiceResultsScreen({
    Key? key,
    required this.correctAnswers,
    required this.totalQuestions,
  }) : super(key: key);

  @override
  State<MultipleChoiceResultsScreen> createState() =>
      _MultipleChoiceResultsScreenState();
}

class _MultipleChoiceResultsScreenState
    extends State<MultipleChoiceResultsScreen> {
  @override
  void initState() {
    super.initState();
    // Play congratulations sound when results are shown
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final audioProvider = context.read<AudioProvider>();
      audioProvider.playCongratulations();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Quiz Completed!',
            style: Theme.of(context).textTheme.headlineLarge,
          ),
          const SizedBox(height: 16),
          Text(
            'You got ${widget.correctAnswers} out of ${widget.totalQuestions} correct.',
            style: Theme.of(context).textTheme.titleLarge,
          ),
        ],
      ),
    );
  }
}
