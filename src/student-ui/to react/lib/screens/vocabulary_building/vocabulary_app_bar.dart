import 'package:flutter/material.dart';
import '../../l10n/app_localizations.dart';

class VocabularyAppBar extends StatelessWidget {
  final bool isSearchExpanded;
  final bool isFavorite;
  final VoidCallback onToggleSearch;
  final VoidCallback onToggleFavorite;
  final VoidCallback onTestFirebaseConnection;

  const VocabularyAppBar({
    Key? key,
    required this.isSearchExpanded,
    required this.isFavorite,
    required this.onToggleSearch,
    required this.onToggleFavorite,
    required this.onTestFirebaseConnection,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SliverAppBar(
      automaticallyImplyLeading: false,
      expandedHeight: 120,
      floating: false,
      pinned: true,
      elevation: 0,
      backgroundColor: theme.primaryColor,
      foregroundColor: Colors.white,
      flexibleSpace: FlexibleSpaceBar(
        centerTitle: true,
        title: Text(
          AppLocalizations.of(context)!.vocabularyBuilder,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: Colors.white,
            letterSpacing: 0.5,
          ),
        ),
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                theme.primaryColor,
                theme.primaryColor.withOpacity(0.8),
              ],
            ),
          ),
        ),
      ),
      actions: [
        IconButton(
          icon: Icon(isSearchExpanded ? Icons.close : Icons.search,
              color: Colors.white),
          onPressed: onToggleSearch,
          tooltip: AppLocalizations.of(context)!.search,
        ),
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          child: IconButton(
            icon: AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: Icon(
                isFavorite ? Icons.favorite : Icons.favorite_border,
                key: ValueKey(isFavorite),
                color: isFavorite ? Colors.red[300] : Colors.white,
              ),
            ),
            onPressed: onToggleFavorite,
            tooltip: AppLocalizations.of(context)!.toggleFavorite,
          ),
        ),
      ],
    );
  }
}
