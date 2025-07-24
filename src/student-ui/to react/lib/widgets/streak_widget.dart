import 'package:flutter/material.dart';

class StreakWidget extends StatelessWidget {
  final int streakCount;
  const StreakWidget({Key? key, required this.streakCount}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: ListTile(
        leading:
            const Icon(Icons.local_fire_department, color: Colors.orange, size: 32),
        title: Text('Current Streak',
            style: Theme.of(context).textTheme.titleMedium),
        subtitle: Text(
          streakCount > 0
              ? '$streakCount days in a row!'
              : 'Start your streak today!',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        trailing:
            streakCount > 0 ? const Text('🔥', style: const TextStyle(fontSize: 28)) : null,
      ),
    );
  }
}
