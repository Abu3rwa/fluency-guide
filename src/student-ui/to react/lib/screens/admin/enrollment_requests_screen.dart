import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:englishfluencyguide/providers/course_provider.dart';
import 'package:englishfluencyguide/providers/user_provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class EnrollmentRequestsScreen extends StatefulWidget {
  const EnrollmentRequestsScreen({super.key});

  @override
  State<EnrollmentRequestsScreen> createState() =>
      _EnrollmentRequestsScreenState();
}

class _EnrollmentRequestsScreenState extends State<EnrollmentRequestsScreen> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final courseProvider = Provider.of<CourseProvider>(context, listen: false);

    return Scaffold(
      appBar: AppBar(title: const Text('Enrollment Requests')),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: courseProvider.getPendingEnrollments(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Text(
                'Error loading enrollment requests',
                style: theme.textTheme.titleMedium?.copyWith(
                  color: theme.colorScheme.error,
                ),
              ),
            );
          }

          final pendingEnrollments = snapshot.data ?? [];

          if (pendingEnrollments.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.check_circle_outline,
                    size: 64,
                    color: theme.colorScheme.primary.withOpacity(0.5),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No pending enrollment requests',
                    style: theme.textTheme.titleLarge,
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: pendingEnrollments.length,
            itemBuilder: (context, index) {
              final enrollment = pendingEnrollments[index];
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        enrollment['courseTitle'],
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      FutureBuilder<DocumentSnapshot>(
                        future: FirebaseFirestore.instance
                            .collection('users')
                            .doc(enrollment['userId'])
                            .get(),
                        builder: (context, userSnapshot) {
                          if (!userSnapshot.hasData) {
                            return const Text('Loading user info...');
                          }

                          final userData =
                              userSnapshot.data?.data()
                                  as Map<String, dynamic>?;
                          final userName = userData?['name'] ?? 'Unknown User';
                          final userEmail = userData?['email'] ?? 'No email';

                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Student: $userName'),
                              Text('Email: $userEmail'),
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton(
                            onPressed: _isLoading
                                ? null
                                : () async {
                                    setState(() => _isLoading = true);
                                    try {
                                      final success = await courseProvider
                                          .rejectEnrollment(
                                            enrollment['courseId'],
                                            enrollment['userId'],
                                          );
                                      if (success && mounted) {
                                        ScaffoldMessenger.of(
                                          context,
                                        ).showSnackBar(
                                          const SnackBar(
                                            content: Text(
                                              'Enrollment request rejected',
                                            ),
                                            backgroundColor: Colors.red,
                                          ),
                                        );
                                        setState(() {});
                                      }
                                    } finally {
                                      if (mounted) {
                                        setState(() => _isLoading = false);
                                      }
                                    }
                                  },
                            child: const Text('Reject'),
                          ),
                          const SizedBox(width: 8),
                          FilledButton(
                            onPressed: _isLoading
                                ? null
                                : () async {
                                    setState(() => _isLoading = true);
                                    try {
                                      final success = await courseProvider
                                          .approveEnrollment(
                                            enrollment['courseId'],
                                            enrollment['userId'],
                                          );
                                      if (success && mounted) {
                                        ScaffoldMessenger.of(
                                          context,
                                        ).showSnackBar(
                                          const SnackBar(
                                            content: Text(
                                              'Enrollment request approved',
                                            ),
                                            backgroundColor: Colors.green,
                                          ),
                                        );
                                        setState(() {});
                                      }
                                    } finally {
                                      if (mounted) {
                                        setState(() => _isLoading = false);
                                      }
                                    }
                                  },
                            child: const Text('Approve'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
