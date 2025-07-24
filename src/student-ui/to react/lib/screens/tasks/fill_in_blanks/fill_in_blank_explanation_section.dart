import 'package:flutter/material.dart';

class FillInBlankExplanationSection extends StatelessWidget {
  final String explanation;
  const FillInBlankExplanationSection({Key? key, required this.explanation})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.primaryColor
            .withOpacity(theme.brightness == Brightness.dark ? 0.2 : 0.1),
        border: Border.all(color: theme.primaryColor.withOpacity(0.5)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.lightbulb, color: theme.primaryColor),
              const SizedBox(width: 8),
              Text(
                'Explanation',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: theme.primaryColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            explanation,
            style: TextStyle(color: theme.colorScheme.onSurface, fontSize: 10),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
