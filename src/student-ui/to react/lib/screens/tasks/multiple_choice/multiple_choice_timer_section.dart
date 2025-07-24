import 'package:flutter/material.dart';

class MultipleChoiceTimerSection extends StatelessWidget {
  final int remainingSeconds;
  final VoidCallback? onTimeUp;

  const MultipleChoiceTimerSection({
    Key? key,
    required this.remainingSeconds,
    this.onTimeUp,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.timer, size: 18),
        const SizedBox(width: 6),
        Text(
          'Time left: $remainingSeconds s',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
