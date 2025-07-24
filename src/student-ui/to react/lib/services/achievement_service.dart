import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../../migrate/lib/models/achievement_model.dart';
import '../../../../../migrate/lib/models/user_model.dart';

// AchievementService handles achievement logic and Firestore integration.
class AchievementService {
  final CollectionReference userAchievementsCollection =
      FirebaseFirestore.instance.collection('user_achievements');

  /// Initialize achievements in Firestore
  Future<void> initializeAchievements() async {
    // Remove the for loop that uses defaultAchievements
  }

  /// Get all achievements (master list)
  Future<List<AchievementModel>> getAllAchievements() async {
    try {
      final snapshot =
          await FirebaseFirestore.instance.collection('achievements').get();
      return snapshot.docs
          .map((doc) =>
              AchievementModel.fromJson(doc.data() as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Error getting achievements: $e');
      return [];
    }
  }

  /// Get all user achievements (progress)
  Future<List<UserAchievementModel>> getUserAchievements(String userId) async {
    try {
      final snapshot = await userAchievementsCollection
          .where('userId', isEqualTo: userId)
          .get();
      return snapshot.docs
          .map((doc) =>
              UserAchievementModel.fromJson(doc.data() as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Error getting user achievements: $e');
      return [];
    }
  }

  /// Get user's achievement progress (joined with master data)
  Future<List<AchievementModel>> getUserAchievementProgress(
      String userId) async {
    try {
      final userAchievements = await getUserAchievements(userId);
      final allAchievements = await getAllAchievements();
      final Map<String, UserAchievementModel> userAchievementMap = {
        for (var ua in userAchievements) ua.achievementId: ua
      };
      return allAchievements.map((achievement) {
        final userAchievement = userAchievementMap[achievement.id];
        if (userAchievement != null) {
          return achievement.copyWith(
            unlockDate:
                userAchievement.isUnlocked ? userAchievement.earnedAt : null,
            currentProgress: userAchievement.progress,
          );
        }
        return achievement;
      }).toList();
    } catch (e) {
      print('Error getting user achievement progress: $e');
      return [];
    }
  }

  /// Award an achievement to a user (static helper)
  static Future<void> awardIfNotExists({
    required String userId,
    required String achievementId,
  }) async {
    final userAchievementsCollection =
        FirebaseFirestore.instance.collection('user_achievements');
    final existingDoc = await userAchievementsCollection
        .where('userId', isEqualTo: userId)
        .where('achievementId', isEqualTo: achievementId)
        .get();
    if (existingDoc.docs.isEmpty) {
      await userAchievementsCollection.add({
        'userId': userId,
        'achievementId': achievementId,
        'earnedAt': FieldValue.serverTimestamp(),
        'progress': 0,
        'isUnlocked': true,
      });
    }
  }

  /// Update achievement progress for a user
  Future<void> updateAchievementProgress(
      String userId, String achievementId, int progress) async {
    try {
      final existingDoc = await userAchievementsCollection
          .where('userId', isEqualTo: userId)
          .where('achievementId', isEqualTo: achievementId)
          .get();
      if (existingDoc.docs.isNotEmpty) {
        await existingDoc.docs.first.reference.update({
          'progress': progress,
        });
      } else {
        await userAchievementsCollection.add({
          'userId': userId,
          'achievementId': achievementId,
          'earnedAt': null,
          'progress': progress,
          'isUnlocked': false,
        });
      }
    } catch (e) {
      print('Error updating achievement progress: $e');
    }
  }
}
