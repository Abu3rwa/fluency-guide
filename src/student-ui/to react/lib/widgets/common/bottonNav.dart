import 'package:flutter/material.dart';
import '../../routes/app_routes.dart';
import '../../l10n/app_localizations.dart';

class BottomNav extends StatefulWidget {
  const BottomNav({super.key});

  @override
  State<BottomNav> createState() => _BottomNavState();
}

class _BottomNavState extends State<BottomNav> {
  int _selectedIndex = 0;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final currentRoute = ModalRoute.of(context)?.settings.name;
    setState(() {
      switch (currentRoute) {
        case AppRoutes.home:
          _selectedIndex = 0;
          break;
        case AppRoutes.courses:
          _selectedIndex = 1;
          break;
        case AppRoutes.progress:
          _selectedIndex = 2;
          break;
        case AppRoutes.messages:
          _selectedIndex = 3;
          break;
        case AppRoutes.profile:
          _selectedIndex = 4;
          break;

        default:
          _selectedIndex = 0;
      }
    });
  }

  void _navigateToProfile(BuildContext context) {
    setState(() => _selectedIndex = 3);
    Navigator.pushNamed(context, AppRoutes.profile);
  }

  void _navigateHome(BuildContext context) {
    setState(() => _selectedIndex = 0);
    Navigator.pushNamed(context, AppRoutes.home);
  }

  void _navigateCourses(BuildContext context) {
    setState(() => _selectedIndex = 1);
    Navigator.pushNamed(context, AppRoutes.courses);
  }

  void _navigateProgress(BuildContext context) {
    setState(() => _selectedIndex = 2);
    Navigator.pushNamed(context, AppRoutes.progress);
  }

  void _navigateMessages(BuildContext context) {
    setState(() => _selectedIndex = 2);
    Navigator.pushNamed(context, AppRoutes.messagesList);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    return NavigationBar(
      backgroundColor: theme.colorScheme.surface,
      selectedIndex: _selectedIndex,
      onDestinationSelected: (index) {
        setState(() => _selectedIndex = index);
        switch (index) {
          case 0:
            _navigateHome(context);
            break;
          case 1:
            _navigateCourses(context);
            break;
          case 2:
            _navigateProgress(context);
            break;
          case 3:
            _navigateMessages(context);
            break;
          case 4:
            _navigateToProfile(context);
            break;
        }
      },
      destinations: [
        NavigationDestination(
          icon: Icon(
            Icons.home_outlined,
            color: _selectedIndex == 0
                ? theme.colorScheme.primary
                : theme.colorScheme.onSurface,
          ),
          selectedIcon: Icon(Icons.home, color: theme.colorScheme.primary),
          label: l10n.navHome,
        ),
        NavigationDestination(
          icon: Icon(
            Icons.book_outlined,
            color: _selectedIndex == 1
                ? theme.colorScheme.primary
                : theme.colorScheme.onSurface,
          ),
          selectedIcon: Icon(Icons.book, color: theme.colorScheme.primary),
          label: l10n.navCourses,
        ),
        NavigationDestination(
          icon: Icon(
            Icons.insights_outlined,
            color: _selectedIndex == 2
                ? theme.colorScheme.primary
                : theme.colorScheme.onSurface,
          ),
          selectedIcon: Icon(Icons.insights, color: theme.colorScheme.primary),
          label: l10n.navProgress,
        ),
        NavigationDestination(
          icon: Icon(
            Icons.chat_outlined,
            color: _selectedIndex == 3
                ? theme.colorScheme.primary
                : theme.colorScheme.onSurface,
          ),
          selectedIcon: Icon(Icons.chat, color: theme.colorScheme.primary),
          label: l10n.navMessages,
        ),
        NavigationDestination(
          icon: Icon(
            Icons.person_outline,
            color: _selectedIndex == 3
                ? theme.colorScheme.primary
                : theme.colorScheme.onSurface,
          ),
          selectedIcon: Icon(Icons.person, color: theme.colorScheme.primary),
          label: l10n.navProfile,
        ),
      ],
    );
  }
}
