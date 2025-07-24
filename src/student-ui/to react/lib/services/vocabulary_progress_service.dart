import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../../migrate/lib/models/vocabulary_progress.dart';

class VocabularyProgressService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'vocabulary_progress';

  // Get progress for a specific word
  Future<VocabularyProgress?> getWordProgress(
      String userId, String word) async {
    try {
      final doc = await _firestore
          .collection(_collection)
          .where('userId', isEqualTo: userId)
          .where('word', isEqualTo: word)
          .get();

      if (doc.docs.isNotEmpty) {
        return VocabularyProgress.fromFirestore(doc.docs.first);
      }
      return null;
    } catch (e) {
      print('Error getting word progress: $e');
      return null;
    }
  }

  // Get all progress for a user
  Future<List<VocabularyProgress>> getUserProgress(String userId) async {
    try {
      print(
          'Fetching vocabulary::::::::::::::::::::: progress for user: $userId');
      final querySnapshot = await _firestore
          .collection(_collection)
          .where('userId', isEqualTo: userId)
          // .orderBy('lastViewed', descending: true)
          .get();

      print(
          'vocabulary::::::::::::::::::::: ${querySnapshot.docs.length} documents in vocabulary_progress collection');

      final progressList = querySnapshot.docs
          .map((doc) => VocabularyProgress.fromFirestore(doc))
          .toList();

      print('Parsed ${progressList.length} vocabulary progress items');
      return progressList;
    } catch (e) {
      print('Error getting user progress: $e');
      return [];
    }
  }

  // Get favorite words for a user
  Future<List<VocabularyProgress>> getFavoriteWords(String userId) async {
    try {
      final querySnapshot = await _firestore
          .collection(_collection)
          .where('userId', isEqualTo: userId)
          .where('isFavorite', isEqualTo: true)
          .orderBy('lastViewed', descending: true)
          .get();

      return querySnapshot.docs
          .map((doc) => VocabularyProgress.fromFirestore(doc))
          .toList();
    } catch (e) {
      print('Error getting favorite words: $e');
      return [];
    }
  }

  // Save or update word progress
  Future<void> saveWordProgress(VocabularyProgress progress) async {
    try {
      final docRef = _firestore
          .collection(_collection)
          .doc('${progress.userId}_${progress.word}');

      await docRef.set(progress.toFirestore());
    } catch (e) {
      print('Error saving word progress: $e');
      rethrow;
    }
  }

  // Increment view count for a word
  Future<void> incrementViewCount(String userId, String word) async {
    try {
      final docRef = _firestore.collection(_collection).doc('${userId}_$word');

      final doc = await docRef.get();

      if (doc.exists) {
        // Update existing document
        await docRef.update({
          'timesViewed': FieldValue.increment(1),
          'lastViewed': Timestamp.now(),
          'updatedAt': Timestamp.now(),
        });
      } else {
        // Create new document
        final progress = VocabularyProgress(
          userId: userId,
          word: word,
          timesViewed: 1,
          lastViewed: DateTime.now(),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        await docRef.set(progress.toFirestore());
      }
    } catch (e) {
      print('Error incrementing view count: $e');
      rethrow;
    }
  }

  // Record correct answer
  Future<void> recordCorrectAnswer(String userId, String word) async {
    print('=== VOCABULARY PROGRESS SERVICE: recordCorrectAnswer ===');
    print('User ID: $userId');
    print('Word: $word');

    try {
      final docRef = _firestore.collection(_collection).doc('${userId}_$word');
      print('Document reference: ${docRef.path}');

      final doc = await docRef.get();
      print('Document exists: ${doc.exists}');

      if (doc.exists) {
        print('Updating existing document...');
        await docRef.update({
          'timesCorrect': FieldValue.increment(1),
          'timesViewed': FieldValue.increment(1),
          'lastViewed': Timestamp.now(),
          'updatedAt': Timestamp.now(),
        });
        print('Document updated successfully');
      } else {
        print('Creating new document...');
        final progress = VocabularyProgress(
          userId: userId,
          word: word,
          timesViewed: 1,
          timesCorrect: 1,
          lastViewed: DateTime.now(),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        await docRef.set(progress.toFirestore());
        print('New document created successfully');
      }
      print(
          '=== VOCABULARY PROGRESS SERVICE: recordCorrectAnswer COMPLETED ===');
    } catch (e) {
      print('ERROR in recordCorrectAnswer service: $e');
      rethrow;
    }
  }

  // Record incorrect answer
  Future<void> recordIncorrectAnswer(String userId, String word) async {
    try {
      final docRef = _firestore.collection(_collection).doc('${userId}_$word');

      final doc = await docRef.get();

      if (doc.exists) {
        await docRef.update({
          'timesIncorrect': FieldValue.increment(1),
          'timesViewed': FieldValue.increment(1),
          'lastViewed': Timestamp.now(),
          'updatedAt': Timestamp.now(),
        });
      } else {
        final progress = VocabularyProgress(
          userId: userId,
          word: word,
          timesViewed: 1,
          timesIncorrect: 1,
          lastViewed: DateTime.now(),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        await docRef.set(progress.toFirestore());
      }
    } catch (e) {
      print('Error recording incorrect answer: $e');
      rethrow;
    }
  }

  // Toggle favorite status
  Future<void> toggleFavorite(
      String userId, String word, bool isFavorite) async {
    try {
      final docRef = _firestore.collection(_collection).doc('${userId}_$word');

      final doc = await docRef.get();

      if (doc.exists) {
        await docRef.update({
          'isFavorite': isFavorite,
          'updatedAt': Timestamp.now(),
        });
      } else {
        final progress = VocabularyProgress(
          userId: userId,
          word: word,
          isFavorite: isFavorite,
          lastViewed: DateTime.now(),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        await docRef.set(progress.toFirestore());
      }
    } catch (e) {
      print('Error toggling favorite: $e');
      rethrow;
    }
  }

  // Get user statistics
  Future<Map<String, dynamic>> getUserStatistics(String userId) async {
    try {
      final progressList = await getUserProgress(userId);

      int totalWords = progressList.length;
      int totalViews =
          progressList.fold(0, (sum, progress) => sum + progress.timesViewed);
      int totalCorrect =
          progressList.fold(0, (sum, progress) => sum + progress.timesCorrect);
      int totalIncorrect = progressList.fold(
          0, (sum, progress) => sum + progress.timesIncorrect);
      int totalFavorites = progressList.where((p) => p.isFavorite).length;

      double overallAccuracy = totalCorrect + totalIncorrect > 0
          ? totalCorrect / (totalCorrect + totalIncorrect)
          : 0.0;

      return {
        'totalWords': totalWords,
        'totalViews': totalViews,
        'totalCorrect': totalCorrect,
        'totalIncorrect': totalIncorrect,
        'totalFavorites': totalFavorites,
        'overallAccuracy': overallAccuracy,
      };
    } catch (e) {
      print('Error getting user statistics: $e');
      return {
        'totalWords': 0,
        'totalViews': 0,
        'totalCorrect': 0,
        'totalIncorrect': 0,
        'totalFavorites': 0,
        'overallAccuracy': 0.0,
      };
    }
  }

  // Delete progress for a word
  Future<void> deleteWordProgress(String userId, String word) async {
    try {
      await _firestore.collection(_collection).doc('${userId}_$word').delete();
    } catch (e) {
      print('Error deleting word progress: $e');
      rethrow;
    }
  }

  // Delete all progress for a user
  Future<void> deleteAllUserProgress(String userId) async {
    try {
      final querySnapshot = await _firestore
          .collection(_collection)
          .where('userId', isEqualTo: userId)
          .get();

      final batch = _firestore.batch();
      for (var doc in querySnapshot.docs) {
        batch.delete(doc.reference);
      }
      await batch.commit();
    } catch (e) {
      print('Error deleting all user progress: $e');
      rethrow;
    }
  }

  // Test method to debug Firebase connection
  Future<void> debugFirebaseConnection(String userId) async {
    try {
      print('=== Firebase Debug Info ===');
      print('User ID: $userId');

      // Check vocabulary_progress collection
      final vocabQuery =
          await _firestore.collection(_collection).limit(5).get();
      print('Total documents in $_collection: ${vocabQuery.docs.length}');

      // Check user-specific documents
      final userQuery = await _firestore
          .collection(_collection)
          .where('userId', isEqualTo: userId)
          .limit(5)
          .get();
      print('Documents for user $userId: ${userQuery.docs.length}');

      if (userQuery.docs.isNotEmpty) {
        print('Sample document data: ${userQuery.docs.first.data()}');
      }

      print('=== End Debug Info ===');
    } catch (e) {
      print('Error in debug method: $e');
    }
  }
}
