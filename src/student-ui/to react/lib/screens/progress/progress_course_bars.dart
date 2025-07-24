import 'package:flutter/material.dart';
import 'package:englishfluencyguide/l10n/app_localizations.dart';

class ProgressCourseBars extends StatelessWidget {
  final List<Map<String, dynamic>> courses;
  const ProgressCourseBars({Key? key, required this.courses}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (courses.isEmpty) {
      return const SizedBox.shrink();
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(AppLocalizations.of(context)!.courseProgress,
            style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 8),
        ...courses.map((course) => Card(
              child: ListTile(
                leading: course['thumbnail'] != null
                    ? CircleAvatar(
                        backgroundImage: NetworkImage(course['thumbnail']))
                    : const CircleAvatar(child: Icon(Icons.book)),
                title: Text(course['title'] ?? ''),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    LinearProgressIndicator(
                      value: (course['progress'] ?? 0) / 100,
                      minHeight: 8,
                    ),
                    const SizedBox(height: 4),
                    Text('${(course['progress'] ?? 0).toStringAsFixed(1)}%',
                        style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  // TODO: Navigate to course details
                },
              ),
            )),
      ],
    );
  }
}
