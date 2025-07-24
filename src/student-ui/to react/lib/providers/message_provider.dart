import 'package:flutter/material.dart';
import '../services/message_service.dart';
import '../../../../../migrate/lib/models/message_model.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class MessageProvider extends ChangeNotifier {
  final MessageService _messageService = MessageService();
  bool _isSending = false;
  String? _error;

  bool get isSending => _isSending;
  String? get error => _error;

  MessageService get messageService => _messageService;

  Future<void> sendMessage({
    required String lessonId,
    required String userId,
    required String receiverId,
    required String content,
  }) async {
    _isSending = true;
    _error = null;
    notifyListeners();
    try {
      await _messageService.sendMessage(
        lessonId: lessonId,
        userId: userId,
        receiverId: receiverId,
        content: content,
      );
    } catch (e) {
      _error = e.toString();
    } finally {
      _isSending = false;
      notifyListeners();
    }
  }

  Future<void> sendMessageToMultipleReceivers({
    required String lessonId,
    required String userId,
    required List<String> receiverIds,
    required String content,
  }) async {
    _isSending = true;
    _error = null;
    notifyListeners();
    try {
      await _messageService.sendMessageToMultipleReceivers(
        lessonId: lessonId,
        userId: userId,
        receiverIds: receiverIds,
        content: content,
      );
    } catch (e) {
      _error = e.toString();
    } finally {
      _isSending = false;
      notifyListeners();
    }
  }

  Stream<List<MessageModel>> userMessagesStream(String userId) {
    return _messageService.userMessagesStream(userId).distinct();
  }

  Future<void> markAllMessagesRead(String userId) async {
    await _messageService.markAllMessagesRead(userId);
  }

  Future<void> editMessage(String messageId, String newContent) async {
    await _messageService.editMessage(messageId, newContent);
    notifyListeners();
  }

  Future<void> toggleStarMessage(String messageId) async {
    await _messageService.toggleStarMessage(messageId);
    notifyListeners();
  }

  Future<void> deleteMessage(String messageId) async {
    await _messageService.deleteMessage(messageId);
    notifyListeners();
  }
}
