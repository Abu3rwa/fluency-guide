import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../../migrate/lib/models/pronunciation_progress.dart';
import 'package:flutter/foundation.dart';

class PronunciationProgressService {
  static final PronunciationProgressService _instance =
      PronunciationProgressService._internal();
  factory PronunciationProgressService() => _instance;
  PronunciationProgressService._internal();

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Save pronunciation attempt to Firebase
  Future<void> savePronunciationProgress(PronunciationProgress progress) async {
    try {
      await _firestore
          .collection('pronunciation_progress')
          .add(progress.toFirestore());

      // Also update the summary
      await _updatePronunciationSummary(progress);

      print(
          'Pronunciation progress saved successfully for word: ${progress.word}');
    } catch (e) {
      print('Error saving pronunciation progress: $e');
      rethrow;
    }
  }

  /// Update pronunciation summary for a word
  Future<void> _updatePronunciationSummary(
      PronunciationProgress progress) async {
    try {
      final summaryRef = _firestore
          .collection('pronunciation_summaries')
          .doc('${progress.userId}_${progress.word}');

      await _firestore.runTransaction((transaction) async {
        final summaryDoc = await transaction.get(summaryRef);

        if (summaryDoc.exists) {
          // Update existing summary
          final existingSummary =
              PronunciationSummary.fromFirestore(summaryDoc);
          final updatedSummary =
              _calculateUpdatedSummary(existingSummary, progress);
          transaction.update(summaryRef, updatedSummary.toFirestore());
        } else {
          // Create new summary
          final newSummary = _createNewSummary(progress);
          transaction.set(summaryRef, newSummary.toFirestore());
        }
      });
    } catch (e) {
      print('Error updating pronunciation summary: $e');
      rethrow;
    }
  }

  /// Calculate updated summary based on new progress
  PronunciationSummary _calculateUpdatedSummary(
      PronunciationSummary existing, PronunciationProgress newProgress) {
    final totalAttempts = existing.totalAttempts + 1;
    final successfulAttempts =
        existing.successfulAttempts + (newProgress.isCorrect ? 1 : 0);

    // Calculate new averages
    final totalAccuracy = (existing.averageAccuracy * existing.totalAttempts) +
        newProgress.accuracy;
    final averageAccuracy = totalAccuracy / totalAttempts;

    final totalConfidence =
        (existing.averageConfidence * existing.totalAttempts) +
            newProgress.confidence;
    final averageConfidence = totalConfidence / totalAttempts;

    // Update best accuracy
    final bestAccuracy = newProgress.accuracy > existing.bestAccuracy
        ? newProgress.accuracy
        : existing.bestAccuracy;

    // Update common mistakes
    final commonMistakes = List<String>.from(existing.commonMistakes);
    if (!newProgress.isCorrect && newProgress.mispronouncedWords.isNotEmpty) {
      commonMistakes.addAll(newProgress.mispronouncedWords);
    }

    // Update word frequency
    final wordFrequency = Map<String, int>.from(existing.wordFrequency);
    for (final word in newProgress.spokenText.toLowerCase().split(' ')) {
      if (word.isNotEmpty) {
        wordFrequency[word] = (wordFrequency[word] ?? 0) + 1;
      }
    }

    return PronunciationSummary(
      userId: existing.userId,
      word: existing.word,
      totalAttempts: totalAttempts,
      successfulAttempts: successfulAttempts,
      averageAccuracy: averageAccuracy,
      averageConfidence: averageConfidence,
      bestAccuracy: bestAccuracy,
      firstAttempt: existing.firstAttempt,
      lastAttempt: newProgress.timestamp,
      commonMistakes: commonMistakes,
      wordFrequency: wordFrequency,
    );
  }

  /// Create new summary for first attempt
  PronunciationSummary _createNewSummary(PronunciationProgress progress) {
    final wordFrequency = <String, int>{};
    for (final word in progress.spokenText.toLowerCase().split(' ')) {
      if (word.isNotEmpty) {
        wordFrequency[word] = (wordFrequency[word] ?? 0) + 1;
      }
    }

    return PronunciationSummary(
      userId: progress.userId,
      word: progress.word,
      totalAttempts: 1,
      successfulAttempts: progress.isCorrect ? 1 : 0,
      averageAccuracy: progress.accuracy,
      averageConfidence: progress.confidence,
      bestAccuracy: progress.accuracy,
      firstAttempt: progress.timestamp,
      lastAttempt: progress.timestamp,
      commonMistakes: progress.isCorrect ? [] : progress.mispronouncedWords,
      wordFrequency: wordFrequency,
    );
  }

  /// Get pronunciation summary for a word
  Future<PronunciationSummary?> getPronunciationSummary(
      String userId, String word) async {
    try {
      final doc = await _firestore
          .collection('pronunciation_summaries')
          .doc('${userId}_$word')
          .get();

      if (doc.exists) {
        return PronunciationSummary.fromFirestore(doc);
      }
      return null;
    } catch (e) {
      print('Error getting pronunciation summary: $e');
      return null;
    }
  }

  /// Get all pronunciation summaries for a user
  Future<List<PronunciationSummary>> getUserPronunciationSummaries(
      String userId) async {
    try {
      print('Fetching pronunciation summaries for user: $userId');
      final querySnapshot = await _firestore
          .collection('pronunciation_summaries')
          .where('userId', isEqualTo: userId)
          .get();

      print(
          'Found ${querySnapshot.docs.length} pronunciation summary documents');

      final summaries = querySnapshot.docs
          .map((doc) => PronunciationSummary.fromFirestore(doc))
          .toList();

      // Sort by lastAttempt in Dart instead of Firestore
      summaries.sort((a, b) => b.lastAttempt.compareTo(a.lastAttempt));

      print('Parsed ${summaries.length} pronunciation summaries');
      for (final summary in summaries) {
        print(
            'Word: ${summary.word}, Attempts: ${summary.totalAttempts}, Accuracy: ${summary.averageAccuracy}');
      }

      return summaries;
    } catch (e) {
      print('Error getting user pronunciation summaries: $e');
      return [];
    }
  }

  /// Get recent pronunciation attempts for a word
  Future<List<PronunciationProgress>> getRecentAttempts(
      String userId, String word,
      {int limit = 10}) async {
    try {
      final querySnapshot = await _firestore
          .collection('pronunciation_progress')
          .where('userId', isEqualTo: userId)
          .where('word', isEqualTo: word)
          .get();

      final attempts = querySnapshot.docs
          .map((doc) => PronunciationProgress.fromFirestore(doc))
          .toList();

      // Sort by timestamp in Dart and limit
      attempts.sort((a, b) => b.timestamp.compareTo(a.timestamp));
      return attempts.take(limit).toList();
    } catch (e) {
      print('Error getting recent attempts: $e');
      return [];
    }
  }

  /// Get user's pronunciation statistics
  Future<Map<String, dynamic>> getUserPronunciationStats(String userId) async {
    try {
      print('Getting pronunciation stats for user: $userId');
      final summaries = await getSimplePronunciationSummaries(userId);

      if (summaries.isEmpty) {
        print('No pronunciation summaries found for user');
        return {
          'totalWords': 0,
          'totalAttempts': 0,
          'successfulAttempts': 0,
          'averageAccuracy': 0.0,
          'averageConfidence': 0.0,
          'bestAccuracy': 0.0,
          'successRate': 0.0,
        };
      }

      final totalWords = summaries.length;
      final totalAttempts =
          summaries.fold(0, (sum, s) => sum + s.totalAttempts);
      final totalSuccessful =
          summaries.fold(0, (sum, s) => sum + s.successfulAttempts);

      // Calculate weighted averages
      double totalAccuracyWeighted = 0.0;
      double totalConfidenceWeighted = 0.0;
      double bestAccuracy = 0.0;

      for (final summary in summaries) {
        totalAccuracyWeighted +=
            summary.averageAccuracy * summary.totalAttempts;
        totalConfidenceWeighted +=
            summary.averageConfidence * summary.totalAttempts;
        if (summary.bestAccuracy > bestAccuracy) {
          bestAccuracy = summary.bestAccuracy;
        }
      }

      final averageAccuracy =
          totalAttempts > 0 ? totalAccuracyWeighted / totalAttempts : 0.0;
      final averageConfidence =
          totalAttempts > 0 ? totalConfidenceWeighted / totalAttempts : 0.0;
      final successRate =
          totalAttempts > 0 ? totalSuccessful / totalAttempts : 0.0;

      final stats = {
        'totalWords': totalWords,
        'totalAttempts': totalAttempts,
        'successfulAttempts': totalSuccessful,
        'averageAccuracy': averageAccuracy,
        'averageConfidence': averageConfidence,
        'bestAccuracy': bestAccuracy,
        'successRate': successRate,
      };

      print('Pronunciation stats calculated: $stats');
      return stats;
    } catch (e) {
      print('Error getting user pronunciation stats: $e');
      return {};
    }
  }

  /// Remove punctuation from text for comparison
  String _removePunctuation(String text) {
    return text.replaceAll(RegExp(r'[^\w\s]'), '').trim();
  }

  /// Calculate pronunciation accuracy and similarity
  double calculateAccuracy(
      String targetWord, String spokenText, double confidence) {
    if (spokenText.isEmpty) return 0.0;

    final target = _removePunctuation(targetWord.toLowerCase());
    final spoken = _removePunctuation(spokenText.toLowerCase());

    debugPrint('Calculating accuracy:');
    debugPrint('Original target: "$targetWord"');
    debugPrint('Original spoken: "$spokenText"');
    debugPrint('Cleaned target: "$target"');
    debugPrint('Cleaned spoken: "$spoken"');

    // Exact match
    if (target == spoken) return 1.0;

    // Calculate similarity using Levenshtein distance
    final distance = _levenshteinDistance(target, spoken);
    final maxLength =
        target.length > spoken.length ? target.length : spoken.length;
    final similarity = 1.0 - (distance / maxLength);

    // Combine with confidence score
    final accuracy = (similarity * 0.7) + (confidence * 0.3);
    debugPrint('Accuracy calculation result: $accuracy');
    return accuracy;
  }

  /// Calculate Levenshtein distance between two strings
  int _levenshteinDistance(String s1, String s2) {
    if (s1 == s2) return 0;
    if (s1.isEmpty) return s2.length;
    if (s2.isEmpty) return s1.length;

    List<int> v0 = List<int>.filled(s2.length + 1, 0);
    List<int> v1 = List<int>.filled(s2.length + 1, 0);

    for (int i = 0; i <= s2.length; i++) {
      v0[i] = i;
    }

    for (int i = 0; i < s1.length; i++) {
      v1[0] = i + 1;

      for (int j = 0; j < s2.length; j++) {
        int cost = s1[i] == s2[j] ? 0 : 1;
        v1[j + 1] = [v1[j] + 1, v0[j + 1] + 1, v0[j] + cost]
            .reduce((a, b) => a < b ? a : b);
      }

      List<int> temp = v0;
      v0 = v1;
      v1 = temp;
    }

    return v0[s2.length];
  }

  /// Analyze spoken text and identify mispronounced words
  List<String> analyzeMispronouncedWords(String targetWord, String spokenText) {
    final target = _removePunctuation(targetWord.toLowerCase());
    final spoken = _removePunctuation(spokenText.toLowerCase());

    if (target == spoken) return [];

    final targetWords = target.split(' ');
    final spokenWords = spoken.split(' ');
    final mispronounced = <String>[];

    // Simple word-by-word comparison
    for (int i = 0; i < targetWords.length; i++) {
      if (i < spokenWords.length) {
        if (targetWords[i] != spokenWords[i]) {
          mispronounced.add(spokenWords[i]);
        }
      } else {
        // Missing words
        mispronounced.addAll(targetWords.skip(i));
        break;
      }
    }

    // Extra words
    if (spokenWords.length > targetWords.length) {
      mispronounced.addAll(spokenWords.skip(targetWords.length));
    }

    return mispronounced;
  }

  /// Generate feedback based on pronunciation attempt
  String generateFeedback(PronunciationProgress progress) {
    if (progress.isCorrect) {
      if (progress.accuracy >= 0.95) {
        return 'Perfect pronunciation! Excellent work!';
      } else if (progress.accuracy >= 0.85) {
        return 'Great pronunciation! Very close to perfect.';
      } else {
        return 'Good pronunciation! Keep practicing to improve.';
      }
    } else {
      if (progress.accuracy >= 0.7) {
        return 'Close! Try to pronounce it more clearly.';
      } else if (progress.accuracy >= 0.5) {
        return 'Not quite right. Listen to the pronunciation again and try.';
      } else {
        return 'Try again. Focus on each syllable carefully.';
      }
    }
  }

  /// Populate user with sample pronunciation progress data
  Future<void> populateSamplePronunciationData(String userId) async {
    try {
      final sampleWords = [
        'hello',
        'world',
        'beautiful',
        'pronunciation',
        'practice',
        'english',
        'fluency',
        'learning',
        'speaking',
        'confidence',
      ];

      for (final word in sampleWords) {
        // Create multiple attempts for each word
        final attempts = _generateSampleAttempts(word);

        for (final attempt in attempts) {
          await savePronunciationProgress(attempt);
        }
      }

      print(
          'Sample pronunciation data populated successfully for user: $userId');
    } catch (e) {
      print('Error populating sample pronunciation data: $e');
      rethrow;
    }
  }

  List<PronunciationProgress> _generateSampleAttempts(String word) {
    final attempts = <PronunciationProgress>[];
    final now = DateTime.now();

    // Generate 2-4 attempts per word with varying accuracy
    final numAttempts = 2 + (word.length % 3); // 2-4 attempts

    for (int i = 0; i < numAttempts; i++) {
      final accuracy =
          0.3 + (i * 0.2) + (word.length * 0.01); // Improving over time
      final confidence = 0.6 + (i * 0.1) + (word.length * 0.005);
      final isCorrect = accuracy > 0.7;

      final spokenText = isCorrect ? word : _generateMispronunciation(word);
      final mispronouncedWords = isCorrect ? <String>[] : <String>[spokenText];
      final correctWords = isCorrect ? <String>[word] : <String>[];

      attempts.add(PronunciationProgress(
        userId: 'a3mvtyHHrSX4e2PiEpNG9w031vJ3', // Use the actual user ID
        word: word,
        spokenText: spokenText,
        confidence: confidence.clamp(0.0, 1.0),
        similarity: accuracy,
        isCorrect: isCorrect,
        mispronouncedWords: mispronouncedWords,
        correctWords: correctWords,
        accuracy: accuracy.clamp(0.0, 1.0),
        attemptNumber: i + 1,
        timestamp: now.subtract(Duration(days: i, hours: i)),
        speakingDuration: Duration(milliseconds: 2000 + (i * 500)),
        feedback: _generateSampleFeedback(accuracy, isCorrect),
        additionalMetrics: {
          'accuracyLevel': accuracy > 0.8
              ? 'Excellent'
              : accuracy > 0.6
                  ? 'Good'
                  : 'Poor',
          'confidenceLevel': confidence > 0.8
              ? 'Very High'
              : confidence > 0.6
                  ? 'High'
                  : 'Medium',
          'spokenTextLength': spokenText.length,
          'targetWordLength': word.length,
          'wordCount': spokenText.split(' ').length,
        },
      ));
    }

    return attempts;
  }

  String _generateMispronunciation(String word) {
    // Simple mispronunciation generator
    final mispronunciations = {
      'hello': 'helo',
      'world': 'worl',
      'beautiful': 'beautifull',
      'pronunciation': 'pronounciation',
      'practice': 'practise',
      'english': 'inglish',
      'fluency': 'fluensy',
      'learning': 'lurning',
      'speaking': 'speeking',
      'confidence': 'confidense',
    };

    return mispronunciations[word] ?? word.substring(0, word.length - 1);
  }

  String _generateSampleFeedback(double accuracy, bool isCorrect) {
    if (isCorrect) {
      if (accuracy >= 0.95) {
        return 'Perfect pronunciation! Excellent work!';
      } else if (accuracy >= 0.85) {
        return 'Great pronunciation! Very close to perfect.';
      } else {
        return 'Good pronunciation! Keep practicing to improve.';
      }
    } else {
      if (accuracy >= 0.7) {
        return 'Close! Try to pronounce it more clearly.';
      } else if (accuracy >= 0.5) {
        return 'Not quite right. Listen to the pronunciation again and try.';
      } else {
        return 'Try again. Focus on each syllable carefully.';
      }
    }
  }

  /// Test method to debug Firebase connection for pronunciation data
  Future<void> debugPronunciationFirebaseConnection(String userId) async {
    try {
      print('=== Pronunciation Firebase Debug Info ===');
      print('User ID: $userId');

      // Check pronunciation_summaries collection
      final summariesQuery =
          await _firestore.collection('pronunciation_summaries').limit(5).get();
      print(
          'Total documents in pronunciation_summaries: ${summariesQuery.docs.length}');

      // Check user-specific summary documents
      final userSummariesQuery = await _firestore
          .collection('pronunciation_summaries')
          .where('userId', isEqualTo: userId)
          .limit(5)
          .get();
      print(
          'Summary documents for user $userId: ${userSummariesQuery.docs.length}');

      if (userSummariesQuery.docs.isNotEmpty) {
        print(
            'Sample summary document data: ${userSummariesQuery.docs.first.data()}');
      }

      // Check pronunciation_progress collection
      final progressQuery =
          await _firestore.collection('pronunciation_progress').limit(5).get();
      print(
          'Total documents in pronunciation_progress: ${progressQuery.docs.length}');

      // Check user-specific progress documents
      final userProgressQuery = await _firestore
          .collection('pronunciation_progress')
          .where('userId', isEqualTo: userId)
          .limit(5)
          .get();
      print(
          'Progress documents for user $userId: ${userProgressQuery.docs.length}');

      if (userProgressQuery.docs.isNotEmpty) {
        print(
            'Sample progress document data: ${userProgressQuery.docs.first.data()}');
      }

      print('=== End Pronunciation Debug Info ===');
    } catch (e) {
      print('Error in pronunciation debug method: $e');
    }
  }

  /// Simple method to get pronunciation summaries without complex queries
  Future<List<PronunciationSummary>> getSimplePronunciationSummaries(
      String userId) async {
    try {
      print('Getting simple pronunciation summaries for user: $userId');

      // Get all documents and filter in Dart
      final querySnapshot =
          await _firestore.collection('pronunciation_summaries').get();

      final allDocs = querySnapshot.docs;
      print('Total documents in collection: ${allDocs.length}');

      // Filter by userId in Dart
      final userDocs = allDocs.where((doc) {
        final data = doc.data();
        return data['userId'] == userId;
      }).toList();

      print('Documents for user $userId: ${userDocs.length}');

      final summaries = userDocs
          .map((doc) => PronunciationSummary.fromFirestore(doc))
          .toList();

      // Sort by lastAttempt
      summaries.sort((a, b) => b.lastAttempt.compareTo(a.lastAttempt));

      print('Parsed ${summaries.length} pronunciation summaries');
      for (final summary in summaries) {
        print(
            'Word: ${summary.word}, Attempts: ${summary.totalAttempts}, Accuracy: ${summary.averageAccuracy}');
      }

      return summaries;
    } catch (e) {
      print('Error getting simple pronunciation summaries: $e');
      return [];
    }
  }
}
