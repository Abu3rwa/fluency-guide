import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../../migrate/lib/models/course_model.dart';
import '../../../../../migrate/lib/models/module_model.dart';
import '../../../../../migrate/lib/models/lesson_model.dart';
import '../providers/module_provider.dart';
import '../providers/lesson_provider.dart';
import '../providers/course_provider.dart';
import '../providers/user_provider.dart';
import '../widgets/analytics_card.dart';
import '../widgets/student_progress_list.dart';
import 'lesson_details_screen.dart';
import '../routes/app_routes.dart';
import '../l10n/app_localizations.dart';

class CourseDetailsScreen extends StatefulWidget {
  final CourseModel course;

  const CourseDetailsScreen({Key? key, required this.course}) : super(key: key);

  @override
  State<CourseDetailsScreen> createState() => _CourseDetailsScreenState();
}

class _CourseDetailsScreenState extends State<CourseDetailsScreen> {
  bool _isLoading = true;
  String _enrollmentStatus = 'not_enrolled';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      debugPrint('=== Loading Course Details ===');
      debugPrint('Course ID: ${widget.course.id}');
      debugPrint('Course Title: ${widget.course.title}');

      final moduleProvider = Provider.of<ModuleProvider>(
        context,
        listen: false,
      );
      await moduleProvider.loadModules(widget.course.id);

      final userProvider = Provider.of<UserProvider>(context, listen: false);
      final courseProvider =
          Provider.of<CourseProvider>(context, listen: false);

      if (userProvider.currentUser != null) {
        final status = await courseProvider.getEnrollmentStatus(
          widget.course.id,
          userProvider.currentUser!.uid,
        );
        setState(() => _enrollmentStatus = status);
      }

      debugPrint('Modules loaded: ${moduleProvider.modules.length}');
      if (moduleProvider.error != null) {
        debugPrint('Error loading modules: ${moduleProvider.error}');
      }
    } catch (e, stackTrace) {
      debugPrint('Error in _loadData: $e');
      debugPrint('Stack trace: $stackTrace');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleEnrollment() async {
    try {
      final userProvider = Provider.of<UserProvider>(context, listen: false);
      final courseProvider =
          Provider.of<CourseProvider>(context, listen: false);
      final l10n = AppLocalizations.of(context)!;

      if (userProvider.currentUser == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.pleaseSignIn)),
        );
        return;
      }

      final currentStatus = await courseProvider.getEnrollmentStatus(
        widget.course.id,
        userProvider.currentUser!.uid,
      );

      if (currentStatus == 'active') {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.alreadyEnrolled)),
        );
        return;
      }

      if (currentStatus == 'pending') {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.enrollmentPendingApproval)),
        );
        return;
      }

      final success = await courseProvider.enrollInCourse(
        widget.course.id,
        userProvider.currentUser!.uid,
      );

      if (success) {
        setState(() => _enrollmentStatus = 'pending');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.enrollmentRequestSent)),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.enrollmentRequestFailed)),
        );
      }
    } catch (e) {
      debugPrint('Error enrolling in course: $e');
      final l10n = AppLocalizations.of(context)!;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.errorOccurred)),
      );
    }
  }

  Widget _buildEnrollmentButton() {
    final l10n = AppLocalizations.of(context)!;
    switch (_enrollmentStatus) {
      case 'approved':
        return ElevatedButton.icon(
          onPressed: () {
            // Navigate to course content
          },
          icon: const Icon(Icons.play_circle_outline),
          label: Text(l10n.startLearning),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green,
            foregroundColor: Colors.white,
          ),
        );
      case 'pending':
        return ElevatedButton.icon(
          onPressed: null,
          icon: const Icon(Icons.hourglass_empty),
          label: Text(l10n.enrollmentPending),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.orange,
            foregroundColor: Colors.white,
          ),
        );
      case 'rejected':
        return ElevatedButton.icon(
          onPressed: _handleEnrollment,
          icon: const Icon(Icons.refresh),
          label: Text(l10n.reapply),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            foregroundColor: Colors.white,
          ),
        );
      default:
        return ElevatedButton.icon(
          onPressed: _handleEnrollment,
          icon: const Icon(Icons.add_circle_outline),
          label: Text(l10n.enrollNow),
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).primaryColor,
            foregroundColor: Colors.white,
          ),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: Text(widget.course.title),
          bottom: TabBar(
            tabs: [
              Tab(text: l10n.overview),
              Tab(text: l10n.modules),
              Tab(text: l10n.students),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildOverviewTab(),
            _buildModulesTab(),
            _buildStudentsTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildOverviewTab() {
    final l10n = AppLocalizations.of(context)!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.course.title,
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.course.description,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    children: [
                      Chip(
                        label: Text('${widget.course.duration} hours'),
                        avatar: const Icon(Icons.access_time),
                      ),
                      Chip(
                        label: Text('${widget.course.totalLessons} lessons'),
                        avatar: const Icon(Icons.book),
                      ),
                      Chip(
                        label: Text('${widget.course.totalQuizzes} quizzes'),
                        avatar: const Icon(Icons.quiz),
                      ),
                      Chip(
                        label: Text(widget.course.category),
                        avatar: const Icon(Icons.category),
                      ),
                      Chip(
                        label: Text(widget.course.level),
                        avatar: const Icon(Icons.school),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Center(
                    child: _buildEnrollmentButton(),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(l10n.analytics, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            children: [
              AnalyticsCard(
                title: l10n.totalStudents,
                value: '0',
                icon: Icons.people,
              ),
              AnalyticsCard(
                title: l10n.completionRate,
                value: '0%',
                icon: Icons.check_circle,
              ),
              AnalyticsCard(
                title: l10n.averageScore,
                value: '0%',
                icon: Icons.score,
              ),
              AnalyticsCard(
                title: l10n.totalTimeSpent,
                value: '0h',
                icon: Icons.timer,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildModulesTab() {
    final l10n = AppLocalizations.of(context)!;
    debugPrint('=== Building Modules Tab ===');
    if (_isLoading) {
      debugPrint('Still loading...');
      return const Center(child: CircularProgressIndicator());
    }

    return Consumer<ModuleProvider>(
      builder: (context, moduleProvider, child) {
        final modules = moduleProvider.modules;
        debugPrint('Building modules tab with ${modules.length} modules');

        if (moduleProvider.error != null) {
          debugPrint('Error in provider: ${moduleProvider.error}');
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text('Error: ${moduleProvider.error}'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => _loadData(),
                  child: Text(l10n.retry),
                ),
              ],
            ),
          );
        }

        if (modules.isEmpty) {
          debugPrint('No modules found');
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.info_outline, size: 48, color: Colors.blue),
                const SizedBox(height: 16),
                Text(l10n.noModulesAvailable),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => _loadData(),
                  child: Text(l10n.refresh),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: modules.length,
          itemBuilder: (context, index) {
            final lessonProvider = Provider.of<LessonProvider>(
              context,
              listen: false,
            );
            final module = modules[index];
            debugPrint('Building module: ${module.title}');
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ExpansionTile(
                title: Text(
                  module.title,
                  style: Theme.of(context).textTheme.titleSmall,
                ),
                children: [
                  Column(
                    children: [
                      FutureBuilder<List<LessonModel>>(
                        future: lessonProvider.getLessonsByModule(module.id),
                        builder: (context, snapshot) {
                          debugPrint('Lessons snapshot: ${module.id}');
                          if (snapshot.connectionState ==
                              ConnectionState.waiting) {
                            return const Center(
                              child: CircularProgressIndicator(),
                            );
                          }

                          if (snapshot.hasError) {
                            return Center(
                              child: Text('Error: ${snapshot.error}'),
                            );
                          }

                          final lessons = snapshot.data ?? [];
                          if (lessons.isEmpty) {
                            return const Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Text(
                                'No lessons available in this module',
                              ),
                            );
                          }

                          return ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: lessons.length,
                            itemBuilder: (context, index) {
                              final lesson = lessons[index];
                              return ListTile(
                                leading: Text(
                                  '${index + 1}',
                                  style: Theme.of(context).textTheme.titleSmall,
                                ),
                                title: Text(lesson.title),
                                subtitle: Text(
                                  'Duration: ${lesson.duration} minutes',
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                                onTap: () {
                                  Navigator.pushNamed(
                                    context,
                                    AppRoutes.lessonDetails,
                                    arguments: {
                                      'lessonId': lesson.id,
                                      'moduleId': module.id,
                                      'courseId': widget.course.id,
                                    },
                                  );
                                },
                              );
                            },
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildStudentsTab() {
    return const StudentProgressList();
  }
}
