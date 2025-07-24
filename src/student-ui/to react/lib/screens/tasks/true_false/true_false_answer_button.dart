import 'package:flutter/material.dart';

class TrueFalseAnswerButton extends StatelessWidget {
  final String label;
  final bool value;
  final bool isSelected;
  final bool? isCorrect;
  final bool isDisabled;
  final Function(bool) onAnswer;

  const TrueFalseAnswerButton({
    Key? key,
    required this.label,
    required this.value,
    required this.isSelected,
    required this.isCorrect,
    required this.isDisabled,
    required this.onAnswer,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final color = value ? Colors.green : Colors.red;
    final icon = value ? Icons.check_circle : Icons.cancel;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      height: 60,
      child: ElevatedButton.icon(
        onPressed: isDisabled ? null : () => onAnswer(value),
        icon: Icon(
          icon,
          color: isSelected ? Colors.white : color,
        ),
        label: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : color,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: isSelected ? color : Colors.white,
          foregroundColor: isSelected ? Colors.white : color,
          side: BorderSide(color: color, width: 2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: isSelected ? 8 : 2,
        ),
      ),
    );
  }
}
