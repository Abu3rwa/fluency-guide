
import 'package:flutter/material.dart';
import '../../l10n/app_localizations.dart';

class VocabularyControls extends StatelessWidget {
  final VoidCallback onPrevious;
  final VoidCallback onNext;
  final VoidCallback onRandom;

  const VocabularyControls({
    Key? key,
    required this.onPrevious,
    required this.onNext,
    required this.onRandom,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildControlButton(
            context,
            icon: Icons.arrow_back_ios_new,
            label: AppLocalizations.of(context)!.previous,
            onPressed: onPrevious,
            theme: theme,
          ),
          _buildControlButton(
            context,
            icon: Icons.shuffle,
            label: AppLocalizations.of(context)!.random,
            onPressed: onRandom,
            theme: theme,
            isPrimary: true,
          ),
          _buildControlButton(
            context,
            icon: Icons.arrow_forward_ios,
            label: AppLocalizations.of(context)!.next,
            onPressed: onNext,
            theme: theme,
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton(
    BuildContext context,
  { required IconData icon, required String label, required VoidCallback onPressed, required ThemeData theme, bool isPrimary = false}) {
    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isPrimary ? theme.primaryColor : theme.cardColor,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: IconButton(
            icon: Icon(icon, color: isPrimary ? Colors.white : theme.primaryColor),
            onPressed: onPressed,
            iconSize: 24,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.w600,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }
}
