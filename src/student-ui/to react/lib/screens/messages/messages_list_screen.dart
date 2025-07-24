import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/message_provider.dart';
import '../../providers/user_provider.dart';
import '../../../../../../migrate/lib/models/message_model.dart';
import 'messages_screen.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class MessagesListScreen extends StatefulWidget {
  const MessagesListScreen({Key? key}) : super(key: key);

  @override
  State<MessagesListScreen> createState() => _MessagesListScreenState();
}

class _MessagesListScreenState extends State<MessagesListScreen> {
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).currentUser;
    final messageProvider =
        Provider.of<MessageProvider>(context, listen: false);

    if (user == null) {
      return const Scaffold(
        body: Center(child: Text('Please sign in to view your messages.')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chats'),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search chats...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (value) => setState(() => _searchQuery = value),
            ),
          ),
          Expanded(
            child: StreamBuilder<Map<String, List<MessageModel>>>(
              stream: messageProvider.messageService
                  .getConversationsStream(user.uid),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(
                      child: Text('No chats yet. Start a conversation!'));
                }
                final conversations = snapshot.data!;
                var chatList = conversations.entries.toList()
                  ..sort((a, b) =>
                      b.value.last.createdAt.compareTo(a.value.last.createdAt));

                // Filter by search query
                if (_searchQuery.isNotEmpty) {
                  chatList = chatList.where((entry) {
                    final lastMsg = entry.value.last;
                    return lastMsg.content
                        .toLowerCase()
                        .contains(_searchQuery.toLowerCase());
                  }).toList();
                }

                if (chatList.isEmpty) {
                  return Center(
                    child: Text('No chats found for "$_searchQuery"'),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    setState(() {}); // Triggers a rebuild and refresh
                  },
                  child: ListView.separated(
                    itemCount: chatList.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final entry = chatList[index];
                      final messages = entry.value;
                      if (messages.isEmpty) return const SizedBox.shrink();
                      final lastMsg = messages.last;
                      final otherUserId = lastMsg.participants.firstWhere(
                        (id) => id != user.uid,
                        orElse: () => '',
                      );
                      if (otherUserId.isEmpty) {
                        return const ListTile(title: Text('Unknown user'));
                      }

                      return FutureBuilder<DocumentSnapshot>(
                        future: FirebaseFirestore.instance
                            .collection('users')
                            .doc(otherUserId)
                            .get(),
                        builder: (context, userSnap) {
                          String name = 'User';
                          String? avatarUrl;
                          if (userSnap.hasData &&
                              userSnap.data != null &&
                              userSnap.data!.exists) {
                            final data =
                                userSnap.data!.data() as Map<String, dynamic>;
                            name = data['name'] ?? 'User';
                            avatarUrl = data['avatarUrl'] as String?;
                          }
                          return ListTile(
                            leading: CircleAvatar(
                              backgroundImage: avatarUrl != null
                                  ? NetworkImage(avatarUrl)
                                  : null,
                              child: avatarUrl == null
                                  ? Text(name.isNotEmpty ? name[0] : '?')
                                  : null,
                            ),
                            title: Text(
                              name,
                              style:
                                  const TextStyle(fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis,
                            ),
                            subtitle: Text(
                              lastMsg.content,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            trailing: const Icon(Icons.arrow_forward_ios),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const MessagesScreen(),
                                ),
                              );
                            },
                          );
                        },
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Start a new chat
        },
        child: const Icon(Icons.add_comment),
      ),
    );
  }
}
