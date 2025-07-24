import 'package:englishfluencyguide/widgets/common/bottonNav.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:englishfluencyguide/models/course_model.dart';
import 'package:englishfluencyguide/models/user_model.dart';
import 'package:englishfluencyguide/providers/course_provider.dart';
import 'package:englishfluencyguide/providers/user_provider.dart';
import 'package:englishfluencyguide/routes/app_routes.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../l10n/app_localizations.dart';

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key});

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isGridView = true;
  late List<String> _categories;
  late List<String> _categoriesEn;
  late String _selectedDifficulty;
  late String _selectedDuration;
  late String _selectedPrice;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        Provider.of<CourseProvider>(context, listen: false).loadCourses();
      }
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final l10n = AppLocalizations.of(context)!;
    _selectedDifficulty = l10n.all;
    _selectedDuration = l10n.all;
    _selectedPrice = l10n.all;
    _categories = [
      l10n.all,
      l10n.beginner,
      l10n.intermediate,
      l10n.advanced,
      l10n.business,
      l10n.conversational,
      l10n.grammar,
      l10n.vocabulary,
    ];
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToCourses() {
    if (!mounted) return;
    final double scrollPosition = MediaQuery.of(context).size.height * 0.4;
    _scrollController.animateTo(
      scrollPosition,
      duration: const Duration(milliseconds: 600),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final userProvider = Provider.of<UserProvider>(context);
    final courseProvider = Provider.of<CourseProvider>(context);
    final user = userProvider.currentUser;
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // App Bar
          SliverAppBar(
            backgroundColor: theme.colorScheme.surface,
            floating: true,
            pinned: true,
            title: Text(l10n.courses),
            actions: [
              IconButton(
                icon: Icon(_isGridView ? Icons.list : Icons.grid_view),
                onPressed: () {
                  if (!mounted) return;
                  setState(() => _isGridView = !_isGridView);
                },
              ),
              IconButton(
                icon: const Icon(Icons.filter_list),
                onPressed: () => _showFilterDialog(context),
              ),
            ],
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(75),
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: SearchBar(
                  controller: _searchController,
                  hintText: l10n.searchCourses,
                  leading: const Icon(Icons.search),
                  onChanged: (value) {
                    // TODO: Implement search
                  },
                ),
              ),
            ),
          ),

          // Categories
          SliverToBoxAdapter(
            child: SizedBox(
              height: 48,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _categories.length,
                itemBuilder: (context, index) {
                  final category = _categories[index];
                  final isSelected =
                      category == courseProvider.selectedCategory;
                  return Padding(
                    key: ValueKey('category_$category'),
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      key: ValueKey('chip_$category'),
                      label: Text(category),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (!mounted) return;
                        courseProvider.setCategory(selected ? category : null);
                      },
                      backgroundColor: isSelected
                          ? Theme.of(context).colorScheme.primaryContainer
                          : null,
                      labelStyle: TextStyle(
                        color: isSelected
                            ? Theme.of(context).colorScheme.onPrimaryContainer
                            : null,
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          // Content
          if (courseProvider.courses.isEmpty && !courseProvider.isLoading)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.school_outlined,
                      size: 64,
                      color: theme.colorScheme.primary.withOpacity(0.5),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      courseProvider.selectedCategory != null &&
                              courseProvider.selectedCategory != 'All'
                          ? l10n.noCoursesInCategory(
                              courseProvider.selectedCategory!)
                          : l10n.noCoursesAvailable,
                      style: theme.textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.checkBackLater,
                      style: theme.textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: _isGridView
                  ? SliverGrid(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.75,
                        crossAxisSpacing: 8,
                        mainAxisSpacing: 8,
                      ),
                      delegate: SliverChildBuilderDelegate((context, index) {
                        final course = courseProvider.courses[index];
                        return _CourseCard(
                          course: course,
                          isGridView: true,
                        );
                      }, childCount: courseProvider.courses.length),
                    )
                  : SliverList(
                      delegate: SliverChildBuilderDelegate((context, index) {
                        final course = courseProvider.courses[index];
                        return Padding(
                          key: ValueKey('course_${course.id}'),
                          padding: const EdgeInsets.only(bottom: 8),
                          child: _CourseCard(
                            course: course,
                            isGridView: false,
                          ),
                        );
                      }, childCount: courseProvider.courses.length),
                    ),
            ),
        ],
      ),
      bottomNavigationBar: const BottomNav(),
    );
  }

  Widget _buildContinueLearningCard(BuildContext context, UserModel user) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    return Card(
      child: InkWell(
        onTap: () {
          // TODO: Navigate to last active course
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: theme.colorScheme.primary.withOpacity(0.1),
                ),
                child: const Icon(Icons.play_circle_outline, size: 40),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.continueProgress,
                      style: theme.textTheme.titleMedium,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      l10n.resumeLastLesson,
                      style: theme.textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(
                      value: 0.7, // TODO: Get actual progress
                      backgroundColor:
                          theme.colorScheme.primary.withOpacity(0.1),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    ).animate().fadeIn().slideX();
  }

  Widget _buildNoActiveCourseCard(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: theme.colorScheme.secondary.withOpacity(0.1),
              ),
              child: Icon(
                Icons.school_outlined,
                size: 40,
                color: theme.colorScheme.secondary,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(l10n.startLearning, style: theme.textTheme.titleMedium),
                  const SizedBox(height: 4),
                  Text(
                    l10n.beginJourney,
                    style: theme.textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 8),
                  FilledButton(
                    onPressed: _scrollToCourses,
                    child: Text(l10n.browseCourses),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn().slideX();
  }

  Widget _buildQuickStats(BuildContext context, UserModel user) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    return Row(
      children: [
        Expanded(
          child: _StatCard(
            icon: Icons.school,
            value: '${user.enrolledCourses?.length ?? 0}',
            label: l10n.enrolled,
            color: theme.colorScheme.primary,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatCard(
            icon: Icons.timer,
            value: '${user.totalStudyMinutes ?? 0}',
            label: l10n.minutes(user.totalStudyMinutes ?? 0),
            color: theme.colorScheme.secondary,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatCard(
            icon: Icons.local_fire_department,
            value: '${user.currentStreak ?? 0}',
            label: l10n.dayStreakLabel.toString(),
            color: theme.colorScheme.tertiary,
          ),
        ),
      ],
    ).animate().fadeIn().slideX();
  }

  Future<void> _showFilterDialog(BuildContext context) async {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.filterCourses),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            DropdownButtonFormField<String>(
              value: _selectedDifficulty,
              decoration: InputDecoration(labelText: l10n.difficultyLevel),
              items: [
                l10n.all,
                l10n.beginner,
                l10n.intermediate,
                l10n.advanced,
              ]
                  .map(
                    (level) =>
                        DropdownMenuItem(value: level, child: Text(level)),
                  )
                  .toList(),
              onChanged: (value) {
                setState(() => _selectedDifficulty = value!);
                Navigator.pop(context);
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedDuration,
              decoration: InputDecoration(labelText: l10n.duration),
              items: [
                l10n.all,
                l10n.shortDuration,
                l10n.mediumDuration,
                l10n.longDuration,
              ]
                  .map(
                    (duration) => DropdownMenuItem(
                      value: duration,
                      child: Text(duration),
                    ),
                  )
                  .toList(),
              onChanged: (value) {
                setState(() => _selectedDuration = value!);
                Navigator.pop(context);
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedPrice,
              decoration: InputDecoration(labelText: l10n.price),
              items: [
                l10n.all,
                l10n.free,
                l10n.paid,
              ]
                  .map(
                    (price) =>
                        DropdownMenuItem(value: price, child: Text(price)),
                  )
                  .toList(),
              onChanged: (value) {
                setState(() => _selectedPrice = value!);
                Navigator.pop(context);
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                _selectedDifficulty = l10n.all;
                _selectedDuration = l10n.all;
                _selectedPrice = l10n.all;
              });
              Navigator.pop(context);
            },
            child: Text(l10n.reset),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.apply),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              value,
              style: theme.textTheme.titleLarge?.copyWith(
                color: color,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              label,
              style: theme.textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _CourseCard extends StatelessWidget {
  final CourseModel course;
  final bool isGridView;

  const _CourseCard({required this.course, required this.isGridView});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;

    final cardContent = Padding(
      padding: const EdgeInsets.all(6.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Course Image
          Stack(
            children: [
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Image.network(
                  course.thumbnail ?? '',
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: theme.colorScheme.primary.withOpacity(0.1),
                      child: Icon(
                        Icons.school_outlined,
                        size: 48,
                        color: theme.colorScheme.primary,
                      ),
                    );
                  },
                ),
              ),
              if (course.featured)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Featured',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          // Course Title
          Text(
            course.title,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          // Course Description
          // Text(
          //   course.description.substring(0, 25),
          //   style: theme.textTheme.bodySmall,
          //   maxLines: isGridView ? 2 : 3,
          //   overflow: TextOverflow.ellipsis,
          // ),
          const SizedBox(height: 8),
          // Course Metadata
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.people_outline,
                        size: 16,
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${course.enrolledStudents} students',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(
                        Icons.book_outlined,
                        size: 16,
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${course.totalLessons} lessons',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              IconButton(
                onPressed: () {
                  Navigator.pushNamed(
                    context,
                    AppRoutes.courseDetails,
                    arguments: course,
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: theme.colorScheme.onPrimary,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 4,
                    vertical: 4,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                icon: Icon(
                  Icons.visibility_outlined,
                  color: theme.colorScheme.onPrimary,
                ),
              ),
            ],
          ),
        ],
      ),
    );

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.pushNamed(
            context,
            AppRoutes.courseDetails,
            arguments: course,
          );
        },
        child: isGridView
            ? cardContent
            : Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Course Image
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: SizedBox(
                        width: 120,
                        height: 90,
                        child: Image.network(
                          course.thumbnail ?? '',
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(child: cardContent),
                  ],
                ),
              ),
      ),
    );
  }
}
