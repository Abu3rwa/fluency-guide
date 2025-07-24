import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../../migrate/lib/models/message_model.dart';
import 'package:rxdart/rxdart.dart';

class MessageService {
  final CollectionReference messagesCollection =
      FirebaseFirestore.instance.collection('messages');

  Future<void> sendMessage({
    required String lessonId,
    required String userId,
    required String receiverId,
    required String content,
  }) async {
    final message = MessageModel(
      id: '',
      lessonId: lessonId,
      userId: userId,
      receiverId: receiverId,
      content: content,
      createdAt: DateTime.now(),
      participants: [userId, receiverId],
    );
    final docRef = await messagesCollection.add(message.toMap());
    // Update the document with its actual ID
    await docRef.update({'id': docRef.id});
  }

  Future<void> sendMessageToMultipleReceivers({
    required String lessonId,
    required String userId,
    required List<String> receiverIds,
    required String content,
  }) async {
    final now = DateTime.now();
    try {
      final futures = receiverIds.map((receiverId) async {
        final message = MessageModel(
          id: '',
          lessonId: lessonId,
          userId: userId,
          receiverId: receiverId,
          content: content,
          createdAt: now,
          participants: [userId, receiverId],
        );
        final docRef = await messagesCollection.add(message.toMap());
        await docRef.update({'id': docRef.id});
      }).toList();

      await Future.wait(futures);
    } catch (e) {
      rethrow;
    }
  }

  // RECOMMENDED: Use this method - no duplicates, efficient
  Stream<List<MessageModel>> userMessagesStream(String userId) {
    try {
      return messagesCollection
          .where('participants', arrayContains: userId)
          .snapshots()
          .map((snapshot) {
        final messages = snapshot.docs
            .map((doc) => MessageModel.fromMap(
                doc.data() as Map<String, dynamic>, doc.id))
            .toList();

        // Deduplicate by message ID
        final uniqueMessages = <String, MessageModel>{};
        for (var message in messages) {
          uniqueMessages[message.id] = message;
        }
        return uniqueMessages.values.toList()
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
      });
    } catch (e) {
      return Stream.value(<MessageModel>[]);
    }
  }

  // Alternative with Firestore ordering (requires composite index)
  Stream<List<MessageModel>> userMessagesStreamWithIndex(String userId) {
    try {
      return messagesCollection
          .where('participants', arrayContains: userId)
          .orderBy('createdAt', descending: true)
          .limit(100)
          .snapshots()
          .map((snapshot) {
        final messages = snapshot.docs
            .map((doc) => MessageModel.fromMap(
                doc.data() as Map<String, dynamic>, doc.id))
            .toList();

        // Additional duplicate removal (safety measure)
        final uniqueMessages = <String, MessageModel>{};
        for (var message in messages) {
          uniqueMessages[message.id] = message;
        }
        return uniqueMessages.values.toList();
      });
    } catch (e) {
      return Stream.value(<MessageModel>[]);
    }
  }

  // Get messages for a specific conversation between two users
  Stream<List<MessageModel>> getConversationStream(
      String userId1, String userId2,
      {String? lessonId}) {
    try {
      Query query = messagesCollection;

      // Filter by lesson if provided
      if (lessonId != null) {
        query = query.where('lessonId', isEqualTo: lessonId);
      }

      // Filter for conversation between two specific users
      query = query.where('participants', whereIn: [
        [userId1, userId2],
        [userId2, userId1]
      ]);

      return query.snapshots().map((snapshot) {
        final messages = snapshot.docs
            .map((doc) => MessageModel.fromMap(
                doc.data() as Map<String, dynamic>, doc.id))
            .toList();

        // Remove duplicates and sort
        final uniqueMessages = <String, MessageModel>{};
        for (var message in messages) {
          uniqueMessages[message.id] = message;
        }

        final sortedMessages = uniqueMessages.values.toList();
        sortedMessages.sort(
            (a, b) => a.createdAt.compareTo(b.createdAt)); // Ascending for chat
        return sortedMessages;
      });
    } catch (e) {
      return Stream.value(<MessageModel>[]);
    }
  }

  // FIXED: Alternative stream that properly handles duplicates
  Stream<List<MessageModel>> userMessagesStreamAlternative(String userId) {
    final senderStream =
        messagesCollection.where('userId', isEqualTo: userId).snapshots();

    final receiverStream =
        messagesCollection.where('receiverId', isEqualTo: userId).snapshots();

    return Rx.combineLatest2(
      senderStream,
      receiverStream,
      (QuerySnapshot senderSnap, QuerySnapshot receiverSnap) {
        // Use Set to track unique message IDs
        final uniqueMessages = <String, MessageModel>{};

        // Process sender messages
        for (var doc in senderSnap.docs) {
          final message =
              MessageModel.fromMap(doc.data() as Map<String, dynamic>, doc.id);
          uniqueMessages[message.id] = message;
        }

        // Process receiver messages
        for (var doc in receiverSnap.docs) {
          final message =
              MessageModel.fromMap(doc.data() as Map<String, dynamic>, doc.id);
          uniqueMessages[message.id] = message;
        }

        // Convert to list and sort
        final messageList = uniqueMessages.values.toList();
        messageList.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        return messageList;
      },
    );
  }

  // Get messages grouped by conversation (for inbox/chat list)
  Stream<Map<String, List<MessageModel>>> getConversationsStream(
      String userId) {
    try {
      return messagesCollection
          .where('participants', arrayContains: userId)
          .snapshots()
          .map((snapshot) {
        final messages = snapshot.docs
            .map((doc) => MessageModel.fromMap(
                doc.data() as Map<String, dynamic>, doc.id))
            .toList();

        // Remove duplicates
        final uniqueMessages = <String, MessageModel>{};
        for (var message in messages) {
          uniqueMessages[message.id] = message;
        }

        // Group by conversation (other participant)
        final conversations = <String, List<MessageModel>>{};
        for (var message in uniqueMessages.values) {
          final otherUserId =
              message.userId == userId ? message.receiverId : message.userId;

          if (!conversations.containsKey(otherUserId)) {
            conversations[otherUserId] = [];
          }
          conversations[otherUserId]!.add(message);
        }

        // Sort messages within each conversation
        conversations.forEach((key, messageList) {
          messageList.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        });

        return conversations;
      });
    } catch (e) {
      return Stream.value(<String, List<MessageModel>>{});
    }
  }

  // Delete a message
  Future<void> deleteMessage(String messageId) async {
    try {
      await messagesCollection.doc(messageId).delete();
    } catch (e) {
      rethrow;
    }
  }

  // Mark messages as read (if you have a read status field)
  Future<void> markMessagesAsRead(List<String> messageIds) async {
    try {
      final batch = FirebaseFirestore.instance.batch();
      for (var messageId in messageIds) {
        batch.update(messagesCollection.doc(messageId), {'isRead': true});
      }
      await batch.commit();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> markAllMessagesRead(String userId) async {
    final query = await messagesCollection
        .where('participants', arrayContains: userId)
        .get();
    for (var doc in query.docs) {
      final data = doc.data() as Map<String, dynamic>;
      final readBy = List<String>.from(data['readBy'] ?? []);
      if (!readBy.contains(userId)) {
        readBy.add(userId);
        await doc.reference.update({'readBy': readBy});
      }
    }
  }

  Stream<List<MessageModel>> debugUserMessagesStream(String userId) {
    return messagesCollection
        .where('participants', arrayContains: userId)
        .orderBy('createdAt', descending: false)
        .snapshots()
        .map((snapshot) {
      final messages = snapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        return MessageModel.fromMap(data, doc.id);
      }).toList();

      final uniqueMessages = <String, MessageModel>{};
      for (var message in messages) {
        if (uniqueMessages.containsKey(message.id)) {
          print('DUPLICATE FOUND: ${message.id}');
        }
        uniqueMessages[message.id] = message;
      }
      return uniqueMessages.values.toList();
    });
  }

  // Edit a message
  Future<void> editMessage(String messageId, String newContent) async {
    try {
      await messagesCollection.doc(messageId).update({
        'content': newContent,
        'isEdited': true,
        'editedAt': DateTime.now(),
      });
    } catch (e) {
      rethrow;
    }
  }

  // Toggle star on a message
  Future<void> toggleStarMessage(String messageId) async {
    try {
      final doc = await messagesCollection.doc(messageId).get();
      final current = doc.data() as Map<String, dynamic>?;
      final isStarred = current?['isStarred'] == true;
      await messagesCollection.doc(messageId).update({
        'isStarred': !isStarred,
      });
    } catch (e) {
      rethrow;
    }
  }
}
