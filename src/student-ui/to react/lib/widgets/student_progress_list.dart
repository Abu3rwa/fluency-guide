import 'package:flutter/material.dart';

class StudentProgressList extends StatelessWidget {
  const StudentProgressList({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // TODO: Replace with actual student progress data
    final List<Map<String, dynamic>> mockStudents = [
      {
        'name': 'John Doe',
        'email': 'john@example.com',
        'completionRate': 75,
        'lastActivity': '2024-03-15',
        'averageScore': 85,
        'totalTimeSpent': 120,
        'isCompleted': false,
        'lastModule': 'Module 2',
        'lastLesson': 'Lesson 3',
      },
      {
        'name': 'Jane Smith',
        'email': 'jane@example.com',
        'completionRate': 90,
        'lastActivity': '2024-03-14',
        'averageScore': 92,
        'totalTimeSpent': 150,
        'isCompleted': true,
        'lastModule': 'Module 3',
        'lastLesson': 'Lesson 5',
      },
    ];

    return ListView.builder(
      itemCount: mockStudents.length,
      itemBuilder: (context, index) {
        final student = mockStudents[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ExpansionTile(
            leading: CircleAvatar(child: Text(student['name']![0])),
            title: Text(student['name']!),
            subtitle: Text(student['email']!),
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildProgressRow(
                      'Completion Rate',
                      '${student['completionRate']}%',
                      (student['completionRate'] as int) / 100,
                    ),
                    const SizedBox(height: 8),
                    _buildProgressRow(
                      'Average Score',
                      '${student['averageScore']}%',
                      (student['averageScore'] as int) / 100,
                    ),
                    const SizedBox(height: 8),
                    _buildInfoRow('Last Activity', student['lastActivity']!),
                    const SizedBox(height: 8),
                    _buildInfoRow(
                      'Total Time Spent',
                      '${student['totalTimeSpent']} minutes',
                    ),
                    const SizedBox(height: 8),
                    _buildInfoRow('Last Module', student['lastModule']!),
                    const SizedBox(height: 8),
                    _buildInfoRow('Last Lesson', student['lastLesson']!),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildProgressRow(String label, String value, double progress) {
    return Row(
      children: [
        Expanded(flex: 2, child: Text(label)),
        Expanded(
          flex: 3,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation<Color>(
                  progress >= 0.8
                      ? Colors.green
                      : progress >= 0.6
                      ? Colors.orange
                      : Colors.red,
                ),
              ),
              const SizedBox(height: 4),
              Text(value),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      children: [
        Expanded(flex: 2, child: Text(label)),
        Expanded(
          flex: 3,
          child: Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }
}
