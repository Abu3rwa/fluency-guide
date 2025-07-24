import 'package:englishfluencyguide/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/hard_word_provider.dart';
import '../widgets/word_pronunciation_widget.dart';

class HardWordsScreen extends StatelessWidget {
  // const HardWordsScreen({Key? key}) : super(key: key);
//  final callable = FirebaseFunctions.instance.httpsCallable('getKit');
//   final result = await callable.call({'kitType': 'starter'});
//   print(result.data['kit']);
  @override
  Widget build(BuildContext context) {
    final hardWordProvider = Provider.of<HardWordProvider>(context);
    final hardWords =
        hardWordProvider.hardWords.where((w) => !w.isMastered).toList();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Hard Words'),
        backgroundColor: theme.colorScheme.primary,
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
        child: hardWords.isEmpty
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.emoji_emotions,
                        size: 64, color: theme.colorScheme.primary),
                    const SizedBox(height: 16),
                    Text(
                      'No hard words!\nKeep up the great work!',
                      textAlign: TextAlign.center,
                      style: theme.textTheme.titleMedium,
                    ),
                  ],
                ),
              )
            : ListView.separated(
                itemCount: hardWords.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final word = hardWords[index];
                  final lastPracticed =
                      DateFormat.yMMMd().add_Hm().format(word.lastPracticed);
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        color: theme.primaryColor,
                        boxShadow: const [AppTheme.boxShadow]),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                word.word,
                                style: theme.textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: theme.colorScheme.primary,
                                ),
                              ),
                            ),
                            Row(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.record_voice_over),
                                  tooltip: 'Practice',
                                  color: theme.colorScheme.secondary,
                                  onPressed: () {
                                    showDialog(
                                      context: context,
                                      builder: (context) => AlertDialog(
                                        title: Text('Practice "${word.word}"'),
                                        content: SizedBox(
                                          width: 300,
                                          child: WordPronunciationWidget(
                                            targetWord: word.word,
                                            onSuccess: () {
                                              WidgetsBinding.instance
                                                  .addPostFrameCallback((_) {
                                                Navigator.of(context).pop();
                                              });
                                            },
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete),
                                  tooltip: 'Remove',
                                  color: theme.colorScheme.error,
                                  onPressed: () {
                                    hardWordProvider.removeHardWord(word.word);
                                  },
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        LinearProgressIndicator(
                          value: (word.correctStreak / 30).clamp(0.0, 1.0),
                          minHeight: 8,
                          backgroundColor: theme.colorScheme.surfaceVariant,
                          valueColor: AlwaysStoppedAnimation<Color>(
                              theme.colorScheme.primary),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Practiced: ${word.correctStreak}/30',
                              style: theme.textTheme.bodyMedium,
                            ),
                            Text(
                              'Last practiced: $lastPracticed',
                              style: theme.textTheme.bodySmall
                                  ?.copyWith(color: theme.hintColor),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }
}
