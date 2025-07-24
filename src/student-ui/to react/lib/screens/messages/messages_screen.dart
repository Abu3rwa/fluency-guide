import 'package:englishfluencyguide/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../providers/message_provider.dart';
import '../../providers/user_provider.dart';
import '../../../../../../migrate/lib/models/message_model.dart';
import '../../theme/theme_provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:awesome_notifications/awesome_notifications.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({Key? key}) : super(key: key);

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  bool _isScreenActive = true;
  bool _isSelectionMode = false;
  Set<String> _selectedMessages = {};
  String? _editingMessageId;
  final TextEditingController _editController = TextEditingController();
  final FocusNode _editFocusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _isScreenActive = true;
    // Listen for new messages and show notification if not on screen
    final messageProvider =
        Provider.of<MessageProvider>(context, listen: false);
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    messageProvider
        .userMessagesStream(userProvider.currentUser?.uid ?? '')
        .listen((messages) {
      if (!_isScreenActive && messages.isNotEmpty) {
        final latest = messages.first;
        AwesomeNotifications().createNotification(
          content: NotificationContent(
            id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
            channelKey: 'basic_channel',
            title: 'New Message',
            body: latest.content,
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _isScreenActive = false;
    _editController.dispose();
    _editFocusNode.dispose();
    super.dispose();
  }

  void _toggleSelectionMode() {
    setState(() {
      _isSelectionMode = !_isSelectionMode;
      if (!_isSelectionMode) {
        _selectedMessages.clear();
      }
    });
  }

  void _toggleMessageSelection(String messageId) {
    setState(() {
      if (_selectedMessages.contains(messageId)) {
        _selectedMessages.remove(messageId);
      } else {
        _selectedMessages.add(messageId);
      }

      if (_selectedMessages.isEmpty) {
        _isSelectionMode = false;
      }
    });
  }

  void _selectAllMessages(List<MessageModel> messages) {
    setState(() {
      _selectedMessages = messages.map((msg) => msg.id).toSet();
    });
  }

  void _deleteSelectedMessages() async {
    if (_selectedMessages.isEmpty) return;

    final messageProvider =
        Provider.of<MessageProvider>(context, listen: false);

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Messages'),
        content: Text(
            'Are you sure you want to delete ${_selectedMessages.length} message(s)?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        for (String messageId in _selectedMessages) {
          await messageProvider.deleteMessage(messageId);
        }
        setState(() {
          _selectedMessages.clear();
          _isSelectionMode = false;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Messages deleted successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to delete messages: $e')),
          );
        }
      }
    }
  }

  void _forwardMessages(List<MessageModel> allMessages) async {
    if (_selectedMessages.isEmpty) return;

    final messagesToForward =
        allMessages.where((msg) => _selectedMessages.contains(msg.id)).toList();

    // Show contact selection dialog (simplified - you might want to implement a proper contact picker)
    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Forward Messages'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Forward ${messagesToForward.length} message(s) to:'),
            const SizedBox(height: 16),
            TextField(
              decoration: const InputDecoration(
                labelText: 'Recipient ID',
                hintText: 'Enter recipient user ID',
              ),
              onChanged: (value) {},
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, 'admin'), // Simplified
            child: const Text('Forward'),
          ),
        ],
      ),
    );

    if (result != null) {
      // Forward implementation here
      setState(() {
        _selectedMessages.clear();
        _isSelectionMode = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Messages forwarded successfully')),
      );
    }
  }

  void _startEditing(MessageModel message) {
    setState(() {
      _editingMessageId = message.id;
      _editController.text = message.content ?? '';
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _editFocusNode.requestFocus();
    });
  }

  void _saveEdit() async {
    if (_editingMessageId == null) return;

    final messageProvider =
        Provider.of<MessageProvider>(context, listen: false);
    try {
      await messageProvider.editMessage(
          _editingMessageId!, _editController.text);
      setState(() {
        _editingMessageId = null;
        _editController.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Message edited successfully')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to edit message: $e')),
      );
    }
  }

  void _cancelEdit() {
    setState(() {
      _editingMessageId = null;
      _editController.clear();
    });
  }

  void _copyMessage(String content) {
    Clipboard.setData(ClipboardData(text: content));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Message copied to clipboard')),
    );
  }

  void _starMessage(String messageId) async {
    final messageProvider =
        Provider.of<MessageProvider>(context, listen: false);
    try {
      await messageProvider.toggleStarMessage(messageId);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Message starred/unstarred')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to star message: $e')),
      );
    }
  }

  void _replyToMessage(MessageModel message) {
    // Implement reply functionality
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Replying to: ${message.content}')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).currentUser;
    final messageProvider =
        Provider.of<MessageProvider>(context, listen: false);
    final themeProvider = Provider.of<ThemeProvider>(context);
    final theme = Theme.of(context);

    if (user == null) {
      return Scaffold(
        backgroundColor: theme.colorScheme.background,
        body: Center(
          child: Text(
            'Please sign in to view your messages.',
            style: theme.textTheme.bodyLarge,
          ),
        ),
      );
    }

    // Mark all messages as read when opening the screen
    WidgetsBinding.instance.addPostFrameCallback((_) {
      messageProvider.markAllMessagesRead(user.uid);
    });

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: _isSelectionMode ? 80.0 : 120.0,
            floating: false,
            pinned: true,
            backgroundColor: _isSelectionMode
                ? theme.colorScheme.primaryContainer
                : theme.colorScheme.surface,
            elevation: 0,
            leading: _isSelectionMode
                ? IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: _toggleSelectionMode,
                  )
                : null,
            title: _isSelectionMode
                ? Text('${_selectedMessages.length} selected')
                : null,
            flexibleSpace: _isSelectionMode
                ? null
                : FlexibleSpaceBar(
                    title: Text(
                      AppLocalizations.of(context)!.navMessages,
                      style: theme.textTheme.headlineSmall?.copyWith(
                        color: theme.colorScheme.onSurface,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    background: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            theme.colorScheme.primary.withOpacity(0.1),
                            theme.colorScheme.secondary.withOpacity(0.05),
                          ],
                        ),
                      ),
                    ),
                  ),
            actions: _isSelectionMode
                ? [
                    IconButton(
                      icon: const Icon(Icons.select_all),
                      onPressed: () =>
                          _selectAllMessages([]), // Pass actual messages
                    ),
                    IconButton(
                      icon: const Icon(Icons.forward),
                      onPressed: () =>
                          _forwardMessages([]), // Pass actual messages
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete),
                      onPressed: _deleteSelectedMessages,
                    ),
                  ]
                : [
                    IconButton(
                      icon: const Icon(Icons.search),
                      onPressed: () {
                        // Implement search functionality
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content:
                                  Text('Search functionality coming soon')),
                        );
                      },
                    ),
                    IconButton(
                      icon: Icon(
                        themeProvider.isDarkMode
                            ? Icons.light_mode
                            : Icons.dark_mode,
                        color: theme.colorScheme.onSurface,
                      ),
                      onPressed: () => themeProvider.toggleTheme(),
                    ),
                    PopupMenuButton<String>(
                      onSelected: (value) {
                        switch (value) {
                          case 'info':
                            _showMessageInfo(context);
                            break;
                          case 'starred':
                            // Navigate to starred messages
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text(
                                      'Starred messages view coming soon')),
                            );
                            break;
                          case 'settings':
                            // Navigate to settings
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('Settings coming soon')),
                            );
                            break;
                        }
                      },
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: 'starred',
                          child: Row(
                            children: [
                              Icon(Icons.star),
                              SizedBox(width: 8),
                              Text('Starred Messages'),
                            ],
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'settings',
                          child: Row(
                            children: [
                              Icon(Icons.settings),
                              SizedBox(width: 8),
                              Text('Settings'),
                            ],
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'info',
                          child: Row(
                            children: [
                              Icon(Icons.info_outline),
                              SizedBox(width: 8),
                              Text('Info'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
          ),
          SliverFillRemaining(
            hasScrollBody: true,
            child: StreamBuilder<List<MessageModel>>(
              initialData: const [],
              stream: messageProvider.userMessagesStream(user.uid),
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 48,
                          color: theme.colorScheme.error,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Error: ${snapshot.error}',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.error,
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () => setState(() {}),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Center(
                    child: CircularProgressIndicator(
                      color: theme.colorScheme.primary,
                    ),
                  );
                }
                if (!snapshot.hasData) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(
                          color: theme.colorScheme.primary,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Loading messages...',
                          style: theme.textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  );
                }
                final messages = snapshot.data!;
                if (messages.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.chat_bubble_outline,
                          size: 64,
                          color: theme.colorScheme.onSurface.withOpacity(0.5),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No messages yet.',
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: theme.colorScheme.onSurface.withOpacity(0.7),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Start a conversation by sending a message!',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurface.withOpacity(0.5),
                          ),
                        ),
                      ],
                    ),
                  );
                }
                return ListView.builder(
                  physics: const NeverScrollableScrollPhysics(),
                  shrinkWrap: true,
                  reverse: true,
                  padding: const EdgeInsets.all(16),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final msg = messages[index];
                    final isMe = msg.userId == user.uid;
                    final isSelected = _selectedMessages.contains(msg.id);
                    final isEditing = _editingMessageId == msg.id;

                    return KeyedSubtree(
                      key: ValueKey('message_${msg.id}'),
                      child: _buildMessageBubble(
                        context,
                        msg,
                        isMe,
                        isSelected,
                        isEditing,
                        messages,
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
      bottomNavigationBar: _MessageInputBar(
        editingMessageId: _editingMessageId,
        editController: _editController,
        editFocusNode: _editFocusNode,
        onSaveEdit: _saveEdit,
        onCancelEdit: _cancelEdit,
      ),
    );
  }

  Widget _buildMessageBubble(
    BuildContext context,
    MessageModel msg,
    bool isMe,
    bool isSelected,
    bool isEditing,
    List<MessageModel> allMessages,
  ) {
    final theme = Theme.of(context);

    return GestureDetector(
      onLongPress: () {
        if (!_isSelectionMode) {
          setState(() {
            _isSelectionMode = true;
            _selectedMessages.add(msg.id);
          });
        }
      },
      onTap: () {
        if (_isSelectionMode) {
          _toggleMessageSelection(msg.id);
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 8.0),
        decoration: isSelected
            ? BoxDecoration(
                color: theme.colorScheme.primaryContainer.withOpacity(0.3),
                borderRadius: BorderRadius.circular(12),
              )
            : null,
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(4.0),
              child: Align(
                alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  constraints: BoxConstraints(
                    maxWidth: MediaQuery.of(context).size.width * 0.8,
                  ),
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    gradient: isMe
                        ? LinearGradient(
                            colors: [
                              theme.colorScheme.primary,
                              theme.colorScheme.secondary,
                            ],
                          )
                        : null,
                    color: isMe ? null : theme.colorScheme.surface,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: theme.colorScheme.shadow.withOpacity(0.1),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                    border: isSelected
                        ? Border.all(color: theme.colorScheme.primary, width: 2)
                        : null,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (isEditing) ...[
                        TextField(
                          controller: _editController,
                          focusNode: _editFocusNode,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: isMe
                                ? Colors.white
                                : theme.colorScheme.onSurface,
                            fontSize: 16,
                          ),
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: EdgeInsets.zero,
                          ),
                          maxLines: null,
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            GestureDetector(
                              onTap: _saveEdit,
                              child: Icon(
                                Icons.check,
                                size: 16,
                                color: isMe
                                    ? Colors.white
                                    : theme.colorScheme.primary,
                              ),
                            ),
                            const SizedBox(width: 12),
                            GestureDetector(
                              onTap: _cancelEdit,
                              child: Icon(
                                Icons.close,
                                size: 16,
                                color: isMe
                                    ? Colors.white70
                                    : theme.colorScheme.error,
                              ),
                            ),
                          ],
                        ),
                      ] else ...[
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                msg.content ?? 'No content',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: isMe
                                      ? Colors.white
                                      : theme.colorScheme.onSurface,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                            if (msg.isStarred == true) ...[
                              const SizedBox(width: 8),
                              Icon(
                                Icons.star,
                                size: 16,
                                color: isMe ? Colors.amber[200] : Colors.amber,
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              _formatTime(msg.createdAt),
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: isMe
                                    ? Colors.white70
                                    : theme.colorScheme.onSurface
                                        .withOpacity(0.6),
                                fontSize: 12,
                              ),
                            ),
                            if (msg.isEdited == true) ...[
                              const SizedBox(width: 4),
                              Text(
                                '• edited',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: isMe
                                      ? Colors.white60
                                      : theme.colorScheme.onSurface
                                          .withOpacity(0.5),
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
            if (isSelected)
              Positioned(
                top: 8,
                left: isMe ? 8 : null,
                right: isMe ? null : 8,
                child: Container(
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.check,
                    color: theme.colorScheme.onPrimary,
                    size: 16,
                  ),
                ),
              ),
            if (!_isSelectionMode && !isEditing)
              Positioned(
                top: 0,
                right: isMe ? 0 : null,
                left: isMe ? null : 0,
                child: PopupMenuButton<String>(
                  icon: Icon(
                    Icons.more_vert,
                    size: 16,
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                  ),
                  onSelected: (value) {
                    switch (value) {
                      case 'copy':
                        _copyMessage(msg.content ?? '');
                        break;
                      case 'star':
                        _starMessage(msg.id);
                        break;
                      case 'reply':
                        _replyToMessage(msg);
                        break;
                      case 'forward':
                        setState(() {
                          _selectedMessages.add(msg.id);
                        });
                        _forwardMessages(allMessages);
                        break;
                      case 'edit':
                        if (isMe) _startEditing(msg);
                        break;
                      case 'delete':
                        setState(() {
                          _selectedMessages.add(msg.id);
                        });
                        _deleteSelectedMessages();
                        break;
                      case 'select':
                        setState(() {
                          _isSelectionMode = true;
                          _selectedMessages.add(msg.id);
                        });
                        break;
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'copy',
                      child: Row(
                        children: [
                          Icon(Icons.copy, size: 16),
                          SizedBox(width: 8),
                          Text('Copy')
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'star',
                      child: Row(
                        children: [
                          Icon(
                              msg.isStarred == true
                                  ? Icons.star
                                  : Icons.star_border,
                              size: 16),
                          const SizedBox(width: 8),
                          Text(msg.isStarred == true ? 'Unstar' : 'Star')
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'reply',
                      child: Row(
                        children: [
                          Icon(Icons.reply, size: 16),
                          SizedBox(width: 8),
                          Text('Reply')
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'forward',
                      child: Row(
                        children: [
                          Icon(Icons.forward, size: 16),
                          SizedBox(width: 8),
                          Text('Forward')
                        ],
                      ),
                    ),
                    if (isMe) ...[
                      const PopupMenuItem(
                        value: 'edit',
                        child: Row(
                          children: [
                            Icon(Icons.edit, size: 16),
                            SizedBox(width: 8),
                            Text('Edit')
                          ],
                        ),
                      ),
                      const PopupMenuItem(
                        value: 'delete',
                        child: Row(
                          children: [
                            Icon(Icons.delete, size: 16),
                            SizedBox(width: 8),
                            Text('Delete')
                          ],
                        ),
                      ),
                    ],
                    const PopupMenuItem(
                      value: 'select',
                      child: Row(
                        children: [
                          Icon(Icons.check_circle_outline, size: 16),
                          SizedBox(width: 8),
                          Text('Select')
                        ],
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime dateTime) {
    return "${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}";
  }

  void _showMessageInfo(BuildContext context) {
    final theme = Theme.of(context);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: theme.colorScheme.surface,
        title: Text(
          'Messages Info',
          style: theme.textTheme.headlineSmall,
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '• Messages are sent to admin users',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 8),
            Text(
              '• Real-time updates with Firestore',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 8),
            Text(
              '• Secure end-to-end communication',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 8),
            Text(
              '• Long press to select messages',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 8),
            Text(
              '• Use menu for more options',
              style: theme.textTheme.bodyMedium,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'OK',
              style: TextStyle(color: theme.colorScheme.primary),
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageInputBar extends StatefulWidget {
  final String? editingMessageId;
  final TextEditingController editController;
  final FocusNode editFocusNode;
  final VoidCallback onSaveEdit;
  final VoidCallback onCancelEdit;

  const _MessageInputBar({
    this.editingMessageId,
    required this.editController,
    required this.editFocusNode,
    required this.onSaveEdit,
    required this.onCancelEdit,
  });

  @override
  State<_MessageInputBar> createState() => _MessageInputBarState();
}

class _MessageInputBarState extends State<_MessageInputBar> {
  final TextEditingController _controller = TextEditingController();
  bool _isLoading = false;
  bool _isTyping = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _sendMessage() async {
    final user = Provider.of<UserProvider>(context, listen: false).currentUser;
    final messageProvider =
        Provider.of<MessageProvider>(context, listen: false);

    if (_controller.text.trim().isEmpty || user == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      await messageProvider.sendMessage(
        userId: user.uid,
        content: _controller.text.trim(),
        lessonId: '',
        receiverId: '',
      );
      _controller.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Message sent successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send message: $e')),
        );
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (widget.editingMessageId != null) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          border: Border(
            top: BorderSide(
              color: theme.colorScheme.outline.withOpacity(0.2),
            ),
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                'Editing message...',
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontStyle: FontStyle.italic,
                  color: theme.colorScheme.onSurface.withOpacity(0.7),
                ),
              ),
            ),
            TextButton(
              onPressed: widget.onSaveEdit,
              child: const Text('Save'),
            ),
            TextButton(
              onPressed: widget.onCancelEdit,
              child: const Text('Cancel'),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(
          top: BorderSide(
            color: theme.colorScheme.outline.withOpacity(0.2),
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: theme.colorScheme.shadow.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceVariant.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: theme.colorScheme.outline.withOpacity(0.2),
                  ),
                ),
                child: TextField(
                  controller: _controller,
                  maxLines: null,
                  textCapitalization: TextCapitalization.sentences,
                  decoration: InputDecoration(
                    hintText: 'Type a message...',
                    hintStyle: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.5),
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                  ),
                  style: theme.textTheme.bodyMedium,
                  onChanged: (value) {
                    setState(() {
                      _isTyping = value.trim().isNotEmpty;
                    });
                  },
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              decoration: BoxDecoration(
                gradient: _isTyping && !_isLoading
                    ? LinearGradient(
                        colors: [
                          theme.colorScheme.primary,
                          theme.colorScheme.secondary,
                        ],
                      )
                    : null,
                color: _isTyping && !_isLoading
                    ? null
                    : theme.colorScheme.outline.withOpacity(0.3),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                onPressed: _isLoading ? null : _sendMessage,
                icon: _isLoading
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            theme.colorScheme.onPrimary,
                          ),
                        ),
                      )
                    : Icon(
                        Icons.send_rounded,
                        color: _isTyping
                            ? theme.colorScheme.onPrimary
                            : theme.colorScheme.onSurface.withOpacity(0.5),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
