import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:awesome_notifications/awesome_notifications.dart';
import '../../../../../migrate/lib/models/hard_word_model.dart';
import '../services/achievement_service.dart';

class HardWordProvider extends ChangeNotifier {
  static const String storageKey = 'hard_words';
  final String userId;
  List<HardWordModel> _hardWords = [];

  List<HardWordModel> get hardWords => _hardWords;

  HardWordProvider({required this.userId}) {
    _loadHardWords();
  }

  Future<void> _loadHardWords() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(storageKey);
    if (data != null) {
      final List<dynamic> jsonList = json.decode(data);
      _hardWords = jsonList
          .map((e) => HardWordModel.fromJson(e))
          .where((w) => w.userId == userId)
          .toList();
      notifyListeners();
    }
  }

  Future<void> _saveHardWords() async {
    final prefs = await SharedPreferences.getInstance();
    final allWords = prefs.getString(storageKey);
    List<dynamic> jsonList = allWords != null ? json.decode(allWords) : [];
    // Remove old entries for this user
    jsonList.removeWhere((e) => e['userId'] == userId);
    // Add current
    jsonList.addAll(_hardWords.map((w) => w.toJson()));
    await prefs.setString(storageKey, json.encode(jsonList));
  }

  void addOrUpdateHardWord(String word) {
    final index = _hardWords.indexWhere((w) => w.word == word);
    if (index != -1) {
      _hardWords[index].wrongCount++;
      _hardWords[index].correctStreak = 0;
      _hardWords[index].isMastered = false;
    } else {
      _hardWords.add(HardWordModel(word: word, userId: userId));
    }
    _saveHardWords();
    notifyListeners();
  }

  void markAsPracticed(String word, {bool correct = false}) {
    final index = _hardWords.indexWhere((w) => w.word == word);
    if (index != -1) {
      _hardWords[index].lastPracticed = DateTime.now();
      if (correct) {
        _hardWords[index].correctStreak++;
        if (_hardWords[index].correctStreak >= 30) {
          _hardWords[index].isMastered = true;
          // Award achievement for mastering a hard word
          AchievementService.awardIfNotExists(
            userId: userId,
            achievementId: 'hard_word_master',
          );
        }
      } else {
        _hardWords[index].correctStreak = 0;
      }
      _saveHardWords();
      notifyListeners();
    }
  }

  void removeHardWord(String word) {
    _hardWords.removeWhere((w) => w.word == word);
    _saveHardWords();
    notifyListeners();
  }

  List<HardWordModel> getOverdueHardWords(
      {Duration overdue = const Duration(days: 1)}) {
    final now = DateTime.now();
    return _hardWords
        .where(
            (w) => !w.isMastered && now.difference(w.lastPracticed) > overdue)
        .toList();
  }

  void notifyOverdueHardWords() {
    final overdueWords = getOverdueHardWords();
    if (overdueWords.isNotEmpty) {
      AwesomeNotifications().createNotification(
        content: NotificationContent(
          id: 10,
          channelKey: 'hard_words_channel',
          title: 'Practice Needed!',
          body:
              'You have ${overdueWords.length} words that need more practice. Tap to review.',
          notificationLayout: NotificationLayout.Default,
        ),
      );
    }
  }

  void clearMasteredWords() {
    _hardWords.removeWhere((w) => w.isMastered);
    _saveHardWords();
    notifyListeners();
  }
}
