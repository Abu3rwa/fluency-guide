import 'package:flutter/material.dart';

class FillInBlankBlankSpace extends StatelessWidget {
  final String currentAnswer;
  final Color? blankColor;
  final bool isHovering;
  final VoidCallback? onRemove;
  final void Function(String)? onAccept;

  const FillInBlankBlankSpace({
    Key? key,
    required this.currentAnswer,
    required this.blankColor,
    required this.isHovering,
    this.onRemove,
    this.onAccept,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: currentAnswer.isNotEmpty ? onRemove : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.symmetric(horizontal: 2, vertical: 0),
        constraints: const BoxConstraints(
          minWidth: 60,
          maxWidth: 100,
          minHeight: 28,
          maxHeight: 32,
        ),
        decoration: BoxDecoration(
          color: isHovering
              ? theme.primaryColor.withOpacity(0.2)
              : currentAnswer.isEmpty
                  ? theme.colorScheme.surfaceVariant
                  : blankColor?.withOpacity(0.1) ??
                      theme.primaryColor.withOpacity(0.1),
          border: Border.all(
            color: isHovering
                ? theme.primaryColor
                : blankColor ?? theme.colorScheme.outline,
            width: isHovering ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Center(
          child: currentAnswer.isEmpty
              ? Text(
                  '_____',
                  style: TextStyle(
                    fontSize: 12,
                    color: theme.colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Text(
                        currentAnswer,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: blankColor ?? theme.colorScheme.onSurface,
                        ),
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(width: 2),
                    Icon(
                      Icons.close,
                      size: 12,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
