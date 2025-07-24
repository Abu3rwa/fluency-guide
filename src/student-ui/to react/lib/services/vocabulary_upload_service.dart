import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import '../database/level_one_vocabulary.dart';

class VocabularyUploadService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Upload all vocabulary data to Firebase Firestore
  static Future<void> uploadVocabularyToFirebase({
    Function(int progress, int total)? onProgress,
    Function(String message)? onMessage,
  }) async {
    try {
      onMessage?.call('Starting vocabulary upload to Firebase...');

      final vocabularyData = threeThousandWords['vocabulary'] as List<dynamic>;
      final metadata = threeThousandWords['metadata'] as Map<String, dynamic>;

      final totalWords = vocabularyData.length;
      onMessage?.call('Found $totalWords words to upload');

      // First, upload metadata
      await _uploadMetadata(metadata);
      onMessage?.call('Metadata uploaded successfully');

      // Upload vocabulary in batches to avoid timeout
      const batchSize = 50;
      int uploadedCount = 0;
      print('Vocabulary data length: ${vocabularyData.length}');
      for (int i = 0; i < vocabularyData.length; i += batchSize) {
        final endIndex = (i + batchSize < vocabularyData.length)
            ? i + batchSize
            : vocabularyData.length;

        final batch = vocabularyData.sublist(i, endIndex);

        await _uploadBatch(batch, i);

        uploadedCount += batch.length;
        final progress = ((uploadedCount / totalWords) * 100).round();

        onProgress?.call(uploadedCount, totalWords);
        onMessage
            ?.call('Uploaded $uploadedCount/$totalWords words ($progress%)');

        // Small delay to prevent overwhelming Firebase
        await Future.delayed(const Duration(milliseconds: 100));
      }

      onMessage?.call('Vocabulary upload completed successfully!');
    } catch (e) {
      onMessage?.call('Error uploading vocabulary: $e');
      debugPrint('Error uploading vocabulary to Firebase: $e');
      rethrow;
    }
  }

  /// Upload metadata to Firebase
  static Future<void> _uploadMetadata(Map<String, dynamic> metadata) async {
    try {
      await _firestore.collection('commonWords').doc('metadata').set({
        ...metadata,
        'uploaded_at': FieldValue.serverTimestamp(),
        'total_words': threeThousandWords['vocabulary'].length,
      });
    } catch (e) {
      debugPrint('Error uploading metadata: $e');
      rethrow;
    }
  }

  /// Upload a batch of vocabulary words
  static Future<void> _uploadBatch(List<dynamic> batch, int startIndex) async {
    try {
      final batchWrite = _firestore.batch();

      for (int i = 0; i < batch.length; i++) {
        final wordData = batch[i] as Map<String, dynamic>;
        final word = wordData['word'] as String;

        // Create a document reference with auto-generated ID
        final docRef = _firestore.collection('commonWords').doc();

        // Add upload timestamp and index
        final dataToUpload = {
          ...wordData,
          'uploaded_at': FieldValue.serverTimestamp(),
          'index': startIndex + i,
          'word_lowercase': word.toLowerCase(),
        };

        batchWrite.set(docRef, dataToUpload, SetOptions(merge: true));
      }

      await batchWrite.commit();
    } catch (e) {
      debugPrint('Error uploading batch: $e');
      rethrow;
    }
  }

  /// Check if vocabulary is already uploaded
  static Future<bool> isVocabularyUploaded() async {
    try {
      final metadataDoc =
          await _firestore.collection('commonWords').doc('metadata').get();

      return metadataDoc.exists;
    } catch (e) {
      debugPrint('Error checking if vocabulary is uploaded: $e');
      return false;
    }
  }

  /// Get vocabulary statistics from Firebase
  static Future<Map<String, dynamic>?> getVocabularyStats() async {
    try {
      final metadataDoc =
          await _firestore.collection('commonWords').doc('metadata').get();

      if (metadataDoc.exists) {
        return metadataDoc.data();
      }
      return null;
    } catch (e) {
      debugPrint('Error getting vocabulary stats: $e');
      return null;
    }
  }

  /// Delete all vocabulary data from Firebase (for testing/reset)
  static Future<void> deleteAllVocabulary() async {
    try {
      // Delete metadata
      await _firestore.collection('commonWords').doc('metadata').delete();

      // Get all documents in commonWords collection and delete them
      final querySnapshot = await _firestore.collection('commonWords').get();

      if (querySnapshot.docs.isNotEmpty) {
        final batch = _firestore.batch();
        for (var doc in querySnapshot.docs) {
          batch.delete(doc.reference);
        }
        await batch.commit();
      }

      debugPrint('All vocabulary data deleted from commonWords collection');
    } catch (e) {
      debugPrint('Error deleting vocabulary: $e');
      rethrow;
    }
  }

  /// Upload specific categories of vocabulary
  static Future<void> uploadVocabularyByCategory({
    required List<String> categories,
    Function(int progress, int total)? onProgress,
    Function(String message)? onMessage,
  }) async {
    try {
      onMessage?.call(
          'Filtering vocabulary by categories: ${categories.join(', ')}');

      final vocabularyData = threeThousandWords['vocabulary'] as List<dynamic>;

      // Filter vocabulary by categories
      final filteredVocabulary = vocabularyData.where((word) {
        final category = word['category'] as String?;
        return category != null && categories.contains(category);
      }).toList();

      final totalWords = filteredVocabulary.length;
      onMessage?.call('Found $totalWords words in specified categories');

      if (totalWords == 0) {
        onMessage?.call('No words found for the specified categories');
        return;
      }

      // Upload filtered vocabulary
      const batchSize = 50;
      int uploadedCount = 0;

      for (int i = 0; i < filteredVocabulary.length; i += batchSize) {
        final endIndex = (i + batchSize < filteredVocabulary.length)
            ? i + batchSize
            : filteredVocabulary.length;

        final batch = filteredVocabulary.sublist(i, endIndex);

        await _uploadBatch(batch, i);

        uploadedCount += batch.length;
        final progress = ((uploadedCount / totalWords) * 100).round();

        onProgress?.call(uploadedCount, totalWords);
        onMessage
            ?.call('Uploaded $uploadedCount/$totalWords words ($progress%)');

        await Future.delayed(const Duration(milliseconds: 100));
      }

      onMessage?.call('Category vocabulary upload completed!');
    } catch (e) {
      onMessage?.call('Error uploading category vocabulary: $e');
      debugPrint('Error uploading category vocabulary: $e');
      rethrow;
    }
  }

  /// Upload vocabulary by difficulty level
  static Future<void> uploadVocabularyByLevel({
    required List<String> levels,
    Function(int progress, int total)? onProgress,
    Function(String message)? onMessage,
  }) async {
    try {
      onMessage?.call('Filtering vocabulary by levels: ${levels.join(', ')}');

      final vocabularyData = threeThousandWords['vocabulary'] as List<dynamic>;

      // Filter vocabulary by difficulty levels
      final filteredVocabulary = vocabularyData.where((word) {
        final level = word['difficulty_level'] as String?;
        return level != null && levels.contains(level);
      }).toList();

      final totalWords = filteredVocabulary.length;
      onMessage?.call('Found $totalWords words in specified levels');

      if (totalWords == 0) {
        onMessage?.call('No words found for the specified levels');
        return;
      }

      // Upload filtered vocabulary
      const batchSize = 50;
      int uploadedCount = 0;

      for (int i = 0; i < filteredVocabulary.length; i += batchSize) {
        final endIndex = (i + batchSize < filteredVocabulary.length)
            ? i + batchSize
            : filteredVocabulary.length;

        final batch = filteredVocabulary.sublist(i, endIndex);

        await _uploadBatch(batch, i);

        uploadedCount += batch.length;
        final progress = ((uploadedCount / totalWords) * 100).round();

        onProgress?.call(uploadedCount, totalWords);
        onMessage
            ?.call('Uploaded $uploadedCount/$totalWords words ($progress%)');

        await Future.delayed(const Duration(milliseconds: 100));
      }

      onMessage?.call('Level vocabulary upload completed!');
    } catch (e) {
      onMessage?.call('Error uploading level vocabulary: $e');
      debugPrint('Error uploading level vocabulary: $e');
      rethrow;
    }
  }

  /// Test Firebase connectivity and vocabulary upload service
  static Future<Map<String, dynamic>> testVocabularyService() async {
    try {
      debugPrint('=== TESTING VOCABULARY UPLOAD SERVICE ===');

      // Test 1: Check Firebase connectivity
      debugPrint('Testing Firebase connectivity...');
      final testDoc =
          await _firestore.collection('commonWords').doc('test').set({
        'test': true,
        'timestamp': FieldValue.serverTimestamp(),
      });
      debugPrint('Firebase connectivity: ✅ SUCCESS');

      // Clean up test document
      await _firestore.collection('commonWords').doc('test').delete();

      // Test 2: Check vocabulary data structure
      debugPrint('Testing vocabulary data structure...');
      final vocabularyData = threeThousandWords['vocabulary'] as List<dynamic>;
      final metadata = threeThousandWords['metadata'] as Map<String, dynamic>;

      debugPrint('Vocabulary data count: ${vocabularyData.length}');
      debugPrint('Metadata keys: ${metadata.keys.toList()}');

      // Test 3: Check if vocabulary is already uploaded
      debugPrint('Checking if vocabulary is already uploaded...');
      final isUploaded = await isVocabularyUploaded();
      debugPrint('Vocabulary uploaded: $isUploaded');

      // Test 4: Get vocabulary stats if available
      Map<String, dynamic>? stats;
      if (isUploaded) {
        stats = await getVocabularyStats();
        debugPrint('Vocabulary stats: $stats');
      }

      debugPrint('=== VOCABULARY SERVICE TEST COMPLETED ===');

      return {
        'firebase_connected': true,
        'vocabulary_count': vocabularyData.length,
        'metadata_keys': metadata.keys.toList(),
        'is_uploaded': isUploaded,
        'stats': stats,
        'test_successful': true,
      };
    } catch (e) {
      debugPrint('=== VOCABULARY SERVICE TEST FAILED ===');
      debugPrint('Error: $e');

      return {
        'firebase_connected': false,
        'error': e.toString(),
        'test_successful': false,
      };
    }
  }

  /// Upload a small test batch of vocabulary (for testing)
  static Future<void> uploadTestVocabulary({
    Function(int progress, int total)? onProgress,
    Function(String message)? onMessage,
  }) async {
    try {
      onMessage?.call('Starting test vocabulary upload...');

      final vocabularyData = threeThousandWords['vocabulary'] as List<dynamic>;
      final metadata = threeThousandWords['metadata'] as Map<String, dynamic>;

      // Take only first 10 words for testing
      final testVocabulary = vocabularyData.take(10).toList();
      final totalWords = testVocabulary.length;

      onMessage?.call('Uploading $totalWords test words...');

      // Upload metadata
      await _firestore.collection('commonWords').doc('test_metadata').set({
        ...metadata,
        'uploaded_at': FieldValue.serverTimestamp(),
        'total_words': totalWords,
        'is_test': true,
      });

      // Upload test vocabulary
      const batchSize = 5;
      int uploadedCount = 0;

      for (int i = 0; i < testVocabulary.length; i += batchSize) {
        final endIndex = (i + batchSize < testVocabulary.length)
            ? i + batchSize
            : testVocabulary.length;

        final batch = testVocabulary.sublist(i, endIndex);

        await _uploadBatch(batch, i);

        uploadedCount += batch.length;
        final progress = ((uploadedCount / totalWords) * 100).round();

        onProgress?.call(uploadedCount, totalWords);
        onMessage?.call(
            'Uploaded $uploadedCount/$totalWords test words ($progress%)');

        await Future.delayed(const Duration(milliseconds: 100));
      }

      onMessage?.call('Test vocabulary upload completed successfully!');
    } catch (e) {
      onMessage?.call('Test upload failed: $e');
      debugPrint('Error in test vocabulary upload: $e');
      rethrow;
    }
  }
}
