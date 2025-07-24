// import 'package:flutter/material.dart';
// import 'package:provider/provider.dart';
// import '../../providers/achievement_provider.dart';
// import '../../providers/user_provider.dart';
// import '../../models/achievement_model.dart';
// import '../../widgets/achievement_card.dart';
// import '../../l10n/app_localizations.dart';

// class AchievementsScreen extends StatefulWidget {
//   const AchievementsScreen({Key? key}) : super(key: key);

//   @override
//   State<AchievementsScreen> createState() => _AchievementsScreenState();
// }

// class _AchievementsScreenState extends State<AchievementsScreen>
//     with SingleTickerProviderStateMixin {
//   late TabController _tabController;
//   String _selectedCategory = 'all';
//   AchievementRarity? _selectedRarity;

//   final List<String> categories = [
//     'all',
//     'streak',
//     'completion',
//     'accuracy',
//     'time',
//     'social',
//     'special',
//   ];

//   @override
//   void initState() {
//     super.initState();
//     _tabController = TabController(length: 2, vsync: this);
//     _loadAchievements();
//   }

//   @override
//   void dispose() {
//     _tabController.dispose();
//     super.dispose();
//   }

//   Future<void> _loadAchievements() async {
//     final user = Provider.of<UserProvider>(context, listen: false).currentUser;
//     if (user != null) {
//       await Provider.of<AchievementProvider>(context, listen: false)
//           .loadUserAchievements(user.uid);
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     final theme = Theme.of(context);
//     final achievementProvider = Provider.of<AchievementProvider>(context);
//     final user = Provider.of<UserProvider>(context).currentUser;
//     final l10n = AppLocalizations.of(context)!;

//     // Join userAchievements with allAchievements to get points
//     final unlockedAchievements = achievementProvider.userAchievements
//         .where((ua) => ua.isUnlocked)
//         .toList();
//     final allAchievements = achievementProvider.allAchievements;
//     int totalPoints = 0;
//     final unlockedWithPoints = unlockedAchievements.map((ua) {
//       final achievement = allAchievements.firstWhere(
//         (a) => a.id == ua.id,
//         orElse: () => null,
//       );
//       final points = achievement?.points ?? 0;
//       totalPoints += points;
//       return {
//         'title': achievement?.title ?? ua.id,
//         'points': points,
//         'achievement': achievement,
//         'userAchievement': ua,
//       };
//     }).toList();

//     return Scaffold(
//       appBar: AppBar(
//         title: Text(l10n.achievements),
//         elevation: 0,
//         actions: [
//           IconButton(
//             icon: const Icon(Icons.refresh),
//             onPressed: () => _loadAchievements(),
//           ),
//         ],
//         bottom: TabBar(
//           controller: _tabController,
//           tabs: const [
//             Tab(text: 'Overview'),
//             Tab(text: 'All Achievements'),
//           ],
//         ),
//       ),
//       body: user == null
//           ? const Center(child: Text('Please sign in to view achievements'))
//           : TabBarView(
//               controller: _tabController,
//               children: [
//                 _buildOverviewTab(achievementProvider, user),
//                 _buildAllAchievementsTab(achievementProvider),
//               ],
//             ),
//     );
//   }

//   Widget _buildOverviewTab(AchievementProvider provider, user) {
//     return RefreshIndicator(
//       onRefresh: _loadAchievements,
//       child: SingleChildScrollView(
//         physics: const AlwaysScrollableScrollPhysics(),
//         padding: const EdgeInsets.all(16),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             // Stats Cards
//             _buildStatsCards(provider),
//             const SizedBox(height: 24),

//             // Recent Achievements
//             _buildRecentAchievements(provider),
//             const SizedBox(height: 24),

//             // Category Progress
//             _buildCategoryProgress(provider),
//             const SizedBox(height: 24),

//             // Rarity Distribution
//             _buildRarityDistribution(provider),
//           ],
//         ),
//       ),
//     );
//   }

//   Widget _buildStatsCards(AchievementProvider provider) {
//     return GridView.count(
//       shrinkWrap: true,
//       physics: const NeverScrollableScrollPhysics(),
//       crossAxisCount: 2,
//       crossAxisSpacing: 12,
//       mainAxisSpacing: 12,
//       childAspectRatio: 1.5,
//       children: [
//         // _buildStatCard(
//         //   'Total Points',
//         //   totalPoints.toString(),
//         //   Icons.stars,
//         //   Colors.amber,
//         // ),
//         _buildStatCard(
//           'Unlocked',
//           '${provider.unlockedAchievementsCount}/${provider.totalAchievementsCount}',
//           Icons.emoji_events,
//           Colors.green,
//         ),
//         _buildStatCard(
//           'Completion',
//           '${provider.completionPercentage.toStringAsFixed(1)}%',
//           Icons.pie_chart,
//           Colors.blue,
//         ),
//         _buildStatCard(
//           'Current Streak',
//           '0', // You can integrate this with your user model
//           Icons.local_fire_department,
//           Colors.orange,
//         ),
//       ],
//     );
//   }

//   Widget _buildStatCard(
//       String title, String value, IconData icon, Color color) {
//     return Card(
//       elevation: 4,
//       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
//       child: Container(
//         padding: const EdgeInsets.all(16),
//         decoration: BoxDecoration(
//           borderRadius: BorderRadius.circular(12),
//           gradient: LinearGradient(
//             begin: Alignment.topLeft,
//             end: Alignment.bottomRight,
//             colors: [color.withOpacity(0.1), color.withOpacity(0.05)],
//           ),
//         ),
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             Icon(icon, size: 32, color: color),
//             const SizedBox(height: 8),
//             Text(
//               value,
//               style: const TextStyle(
//                 fontSize: 24,
//                 fontWeight: FontWeight.bold,
//               ),
//             ),
//             Text(
//               title,
//               style: const TextStyle(
//                 fontSize: 12,
//                 color: Colors.grey,
//               ),
//               textAlign: TextAlign.center,
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   Widget _buildRecentAchievements(AchievementProvider provider) {
//     final recentAchievements = provider.unlockedAchievements
//         .where((a) => a.unlockDate != null)
//         .toList()
//       ..sort((a, b) => b.unlockDate!.compareTo(a.unlockDate!));

//     return Column(
//       crossAxisAlignment: CrossAxisAlignment.start,
//       children: [
//         const Text(
//           'Recent Achievements',
//           style: TextStyle(
//             fontSize: 20,
//             fontWeight: FontWeight.bold,
//           ),
//         ),
//         const SizedBox(height: 12),
//         if (recentAchievements.isEmpty)
//           const Card(
//             child: Padding(
//               padding: EdgeInsets.all(16),
//               child: Text(
//                 'No achievements unlocked yet. Keep learning to earn achievements!',
//                 textAlign: TextAlign.center,
//                 style: TextStyle(color: Colors.grey),
//               ),
//             ),
//           )
//         else
//           ...recentAchievements.take(3).map((achievement) => AchievementCard(
//                 achievement: achievement,
//                 showProgress: false,
//               )),
//       ],
//     );
//   }

//   Widget _buildCategoryProgress(AchievementProvider provider) {
//     final categorySummary = provider.achievementsByCategory;

//     return Column(
//       crossAxisAlignment: CrossAxisAlignment.start,
//       children: [
//         const Text(
//           'Progress by Category',
//           style: TextStyle(
//             fontSize: 20,
//             fontWeight: FontWeight.bold,
//           ),
//         ),
//         const SizedBox(height: 12),
//         ...categorySummary.entries.map((entry) {
//           final category = entry.key;
//           final count = entry.value;
//           final totalInCategory = provider.allAchievements
//               .where((a) => a.category == category)
//               .length;
//           final percentage =
//               totalInCategory > 0 ? (count / totalInCategory) * 100 : 0.0;

//           return Card(
//             margin: const EdgeInsets.only(bottom: 8),
//             child: Padding(
//               padding: const EdgeInsets.all(16),
//               child: Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   Row(
//                     mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                     children: [
//                       Text(
//                         category.toUpperCase(),
//                         style: const TextStyle(
//                           fontWeight: FontWeight.bold,
//                         ),
//                       ),
//                       Text('$count/$totalInCategory'),
//                     ],
//                   ),
//                   const SizedBox(height: 8),
//                   LinearProgressIndicator(
//                     value: percentage / 100,
//                     backgroundColor: Colors.grey.withOpacity(0.2),
//                   ),
//                   const SizedBox(height: 4),
//                   Text(
//                     '${percentage.toStringAsFixed(1)}%',
//                     style: const TextStyle(
//                       fontSize: 12,
//                       color: Colors.grey,
//                     ),
//                   ),
//                 ],
//               ),
//             ),
//           );
//         }),
//       ],
//     );
//   }

//   Widget _buildRarityDistribution(AchievementProvider provider) {
//     final raritySummary = provider.achievementsByRarity;

//     return Column(
//       crossAxisAlignment: CrossAxisAlignment.start,
//       children: [
//         const Text(
//           'Rarity Distribution',
//           style: TextStyle(
//             fontSize: 20,
//             fontWeight: FontWeight.bold,
//           ),
//         ),
//         const SizedBox(height: 12),
//         ...AchievementRarity.values.map((rarity) {
//           final count = raritySummary[rarity] ?? 0;
//           final color = _getRarityColor(rarity);

//           return Card(
//             margin: const EdgeInsets.only(bottom: 8),
//             child: ListTile(
//               leading: Container(
//                 width: 40,
//                 height: 40,
//                 decoration: BoxDecoration(
//                   color: color.withOpacity(0.2),
//                   borderRadius: BorderRadius.circular(8),
//                 ),
//                 child: Center(
//                   child: Text(
//                     _getRarityIcon(rarity),
//                     style: const TextStyle(fontSize: 20),
//                   ),
//                 ),
//               ),
//               title: Text(rarity.toString().split('.').last.toUpperCase()),
//               subtitle: Text('$count achievements'),
//               trailing: Text(
//                 count.toString(),
//                 style: TextStyle(
//                   fontSize: 18,
//                   fontWeight: FontWeight.bold,
//                   color: color,
//                 ),
//               ),
//             ),
//           );
//         }),
//       ],
//     );
//   }

//   Widget _buildAllAchievementsTab(AchievementProvider provider) {
//     return Column(
//       children: [
//         // Filters
//         Container(
//           padding: const EdgeInsets.all(16),
//           child: Row(
//             children: [
//               Expanded(
//                 child: DropdownButtonFormField<String>(
//                   value: _selectedCategory,
//                   decoration: const InputDecoration(
//                     labelText: 'Category',
//                     border: OutlineInputBorder(),
//                   ),
//                   items: categories.map((category) {
//                     return DropdownMenuItem(
//                       value: category,
//                       child: Text(category.toUpperCase()),
//                     );
//                   }).toList(),
//                   onChanged: (value) {
//                     setState(() {
//                       _selectedCategory = value!;
//                     });
//                   },
//                 ),
//               ),
//               const SizedBox(width: 12),
//               Expanded(
//                 child: DropdownButtonFormField<AchievementRarity?>(
//                   value: _selectedRarity,
//                   decoration: const InputDecoration(
//                     labelText: 'Rarity',
//                     border: OutlineInputBorder(),
//                   ),
//                   items: [
//                     const DropdownMenuItem(
//                       value: null,
//                       child: Text('All'),
//                     ),
//                     ...AchievementRarity.values.map((rarity) {
//                       return DropdownMenuItem(
//                         value: rarity,
//                         child: Text(
//                             rarity.toString().split('.').last.toUpperCase()),
//                       );
//                     }),
//                   ],
//                   onChanged: (value) {
//                     setState(() {
//                       _selectedRarity = value;
//                     });
//                   },
//                 ),
//               ),
//             ],
//           ),
//         ),

//         // Achievements List
//         Expanded(
//           child: RefreshIndicator(
//             onRefresh: _loadAchievements,
//             child: _buildFilteredAchievements(provider),
//           ),
//         ),
//       ],
//     );
//   }

//   Widget _buildFilteredAchievements(AchievementProvider provider) {
//     List<AchievementModel> filteredAchievements = provider.userAchievements;

//     // Apply category filter
//     if (_selectedCategory != 'all') {
//       filteredAchievements = filteredAchievements
//           .where((a) => a.category == _selectedCategory)
//           .toList();
//     }

//     // Apply rarity filter
//     if (_selectedRarity != null) {
//       filteredAchievements = filteredAchievements
//           .where((a) => a.rarity == _selectedRarity)
//           .toList();
//     }

//     if (filteredAchievements.isEmpty) {
//       return const Center(
//         child: Text(
//           'No achievements found with the selected filters.',
//           style: TextStyle(color: Colors.grey),
//         ),
//       );
//     }

//     return ListView.builder(
//       padding: const EdgeInsets.all(8),
//       itemCount: filteredAchievements.length,
//       itemBuilder: (context, index) {
//         final achievement = filteredAchievements[index];
//         return AchievementCard(
//           achievement: achievement,
//           onTap: () => _showAchievementDetails(achievement),
//           showProgress: true,
//         );
//       },
//     );
//   }

//   void _showAchievementDetails(AchievementModel achievement) {
//     showDialog(
//       context: context,
//       builder: (context) => AlertDialog(
//         title: Row(
//           children: [
//             Text(achievement.icon),
//             const SizedBox(width: 8),
//             Expanded(child: Text(achievement.title)),
//           ],
//         ),
//         content: Column(
//           mainAxisSize: MainAxisSize.min,
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             Text(achievement.description),
//             const SizedBox(height: 16),
//             Row(
//               children: [
//                 Container(
//                   padding: const EdgeInsets.symmetric(
//                     horizontal: 8,
//                     vertical: 4,
//                   ),
//                   decoration: BoxDecoration(
//                     color: _getRarityColor(achievement.rarity).withOpacity(0.2),
//                     borderRadius: BorderRadius.circular(8),
//                   ),
//                   child: Text(
//                     achievement.rarityName,
//                     style: TextStyle(
//                       color: _getRarityColor(achievement.rarity),
//                       fontWeight: FontWeight.bold,
//                     ),
//                   ),
//                 ),
//                 const SizedBox(width: 8),
//                 Container(
//                   padding: const EdgeInsets.symmetric(
//                     horizontal: 8,
//                     vertical: 4,
//                   ),
//                   decoration: BoxDecoration(
//                     color: Colors.blue.withOpacity(0.2),
//                     borderRadius: BorderRadius.circular(8),
//                   ),
//                   child: Text(
//                     '+${achievement.points} points',
//                     style: const TextStyle(
//                       color: Colors.blue,
//                       fontWeight: FontWeight.bold,
//                     ),
//                   ),
//                 ),
//               ],
//             ),
//             if (achievement.unlockDate != null) ...[
//               const SizedBox(height: 16),
//               Row(
//                 children: [
//                   const Icon(Icons.check_circle, color: Colors.green),
//                   const SizedBox(width: 8),
//                   Text('Unlocked ${_formatDate(achievement.unlockDate!)}'),
//                 ],
//               ),
//             ],
//           ],
//         ),
//         actions: [
//           TextButton(
//             onPressed: () => Navigator.of(context).pop(),
//             child: const Text('Close'),
//           ),
//         ],
//       ),
//     );
//   }

//   Color _getRarityColor(AchievementRarity rarity) {
//     switch (rarity) {
//       case AchievementRarity.common:
//         return const Color(0xFF4CAF50);
//       case AchievementRarity.rare:
//         return const Color(0xFF2196F3);
//       case AchievementRarity.epic:
//         return const Color(0xFF9C27B0);
//       case AchievementRarity.legendary:
//         return const Color(0xFFFF9800);
//     }
//   }

//   String _getRarityIcon(AchievementRarity rarity) {
//     switch (rarity) {
//       case AchievementRarity.common:
//         return '🥉';
//       case AchievementRarity.rare:
//         return '🥈';
//       case AchievementRarity.epic:
//         return '🥇';
//       case AchievementRarity.legendary:
//         return '👑';
//     }
//   }

//   String _formatDate(DateTime date) {
//     final now = DateTime.now();
//     final difference = now.difference(date);

//     if (difference.inDays == 0) {
//       return 'today';
//     } else if (difference.inDays == 1) {
//       return 'yesterday';
//     } else if (difference.inDays < 7) {
//       return '${difference.inDays} days ago';
//     } else if (difference.inDays < 30) {
//       final weeks = (difference.inDays / 7).floor();
//       return '$weeks week${weeks > 1 ? 's' : ''} ago';
//     } else {
//       final months = (difference.inDays / 30).floor();
//       return '$months month${months > 1 ? 's' : ''} ago';
//     }
//   }
// }
