import 'package:flutter/material.dart';
import '../../../../../migrate/lib/models/user_model.dart';

class LeaderboardWidget extends StatelessWidget {
  final List<UserModel> topUsers;
  final String currentUserId;
  final String scoreLabel;

  const LeaderboardWidget({
    Key? key,
    required this.topUsers,
    required this.currentUserId,
    this.scoreLabel = 'Points',
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Leaderboard', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: topUsers.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final user = topUsers[index];
                final isCurrentUser = user.uid == currentUserId;
                return ListTile(
                  leading: CircleAvatar(
                    backgroundImage: user.profileImage.isNotEmpty
                        ? NetworkImage(user.profileImage)
                        : null,
                    child: user.profileImage.isEmpty
                        ? const Icon(Icons.person)
                        : null,
                  ),
                  title: Text(user.name),
                  subtitle: Text('$scoreLabel: ${user.totalPoints ?? 0}'),
                  trailing: Text('#${index + 1}'),
                  tileColor:
                      isCurrentUser ? Colors.blue.withOpacity(0.1) : null,
                  textColor: isCurrentUser ? Colors.blue : null,
                  style:
                      isCurrentUser ? ListTileStyle.drawer : ListTileStyle.list,
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
