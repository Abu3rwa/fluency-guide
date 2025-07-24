import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:app_settings/app_settings.dart';
import 'package:provider/provider.dart';
import '../services/speech_recognition_service.dart';
import '../../../../../migrate/lib/models/pronunciation_progress.dart';
import '../providers/auth_provider.dart';
import '../providers/vocabulary_progress_provider.dart';
import '../providers/vocabulary_goal_provider.dart';
import '../providers/hard_word_provider.dart';
import '../l10n/app_localizations.dart';
import 'dart:async';

class SentencePronunciationWidget extends StatefulWidget {
  final String targetSentence;
  final String? sentenceTranslation;
  final String? context; // Additional context about the sentence
  final VoidCallback? onSuccess;
  final VoidCallback? onRetry;

  const SentencePronunciationWidget({
    Key? key,
    required this.targetSentence,
    this.sentenceTranslation,
    this.context,
    this.onSuccess,
    this.onRetry,
  }) : super(key: key);

  @override
  State<SentencePronunciationWidget> createState() =>
      _SentencePronunciationWidgetState();
}

class _SentencePronunciationWidgetState
    extends State<SentencePronunciationWidget> with TickerProviderStateMixin {
  final SpeechRecognitionService _speechService = SpeechRecognitionService();
  bool _isListening = false;
  bool _isInitialized = false;
  bool _streamListenersSetUp = false;
  String _recognizedText = '';
  double _confidence = 0.0;
  double _similarity = 0.0;
  String _feedback = '';
  bool _showResult = false;
  bool _isSuccess = false;
  bool _isSavingProgress = false;
  PronunciationProgress? _lastProgress;
  Timer? _syncTimer;

  late AnimationController _pulseController;
  late AnimationController _resultController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _resultAnimation;

  @override
  void initState() {
    super.initState();
    _initializeSpeechRecognition();
    _setupAnimations();
  }

  void _setupAnimations() {
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );

    _resultController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));

    _resultAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _resultController,
      curve: Curves.elasticOut,
    ));
  }

  void _setupStreamListeners() {
    if (_streamListenersSetUp) return;

    _speechService.wordsStream.listen((words) {
      if (mounted) {
        setState(() {
          _recognizedText = words;
        });
      }
    });

    _speechService.confidenceStream.listen((confidence) {
      if (mounted) {
        setState(() {
          _confidence = confidence;
        });
      }
    });

    _speechService.listeningStream.listen((isListening) {
      if (mounted) {
        setState(() {
          _isListening = isListening;
          if (!isListening && _recognizedText.isNotEmpty) {
            _evaluateSentencePronunciation();
          }
        });
      }
    });

    _streamListenersSetUp = true;
    if (mounted) {
      setState(() {
        _isListening = _speechService.isListening;
      });
    }
  }

  void _startSyncTimer() {
    _syncTimer?.cancel();
    _syncTimer = Timer.periodic(const Duration(milliseconds: 500), (timer) {
      if (_isListening && mounted) {
        final serviceWords = _speechService.lastWords;
        if (serviceWords.isNotEmpty && serviceWords != _recognizedText) {
          setState(() {
            _recognizedText = serviceWords;
            _confidence = _speechService.confidence;
          });
        }
      } else if (!_isListening) {
        timer.cancel();
      }
    });
  }

  void _stopSyncTimer() {
    _syncTimer?.cancel();
    _syncTimer = null;
  }

  Future<void> _initializeSpeechRecognition() async {
    final hasPermission = await _speechService.hasMicrophonePermission();

    if (!hasPermission) {
      final permissionGranted =
          await _speechService.requestMicrophonePermission();
      if (!permissionGranted) {
        setState(() {
          _isInitialized = false;
        });
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                AppLocalizations.of(context)!.microphonePermissionRequired),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
        return;
      }
    }

    bool available = false;
    for (int i = 0; i < 3; i++) {
      available = await _speechService.initialize();
      if (available) break;
      if (i < 2) {
        await Future.delayed(const Duration(seconds: 1));
      }
    }

    setState(() {
      _isInitialized = available;
    });

    if (!available) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content:
              Text(AppLocalizations.of(context)!.speechRecognitionNotAvailable),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 3),
        ),
      );
      return;
    }

    _setupStreamListeners();
  }

  Future<void> _startListening() async {
    try {
      if (!_isInitialized) {
        await _initializeSpeechRecognition();
        if (!_isInitialized) {
          if (!mounted) return;

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                  AppLocalizations.of(context)!.speechRecognitionNotAvailable),
              backgroundColor: Colors.red,
              duration: const Duration(seconds: 3),
            ),
          );
          return;
        }
      } else {
        if (!_streamListenersSetUp) {
          _setupStreamListeners();
        }
      }

      HapticFeedback.lightImpact();
      setState(() {
        _recognizedText = '';
        _showResult = false;
        _feedback = '';
        _isListening = false;
      });

      if (_speechService.isListening) {
        await _speechService.stopListening();
        await Future.delayed(const Duration(milliseconds: 100));
      }

      final success = await _speechService.startListening(
        listenFor: const Duration(seconds: 8),
        pauseFor: const Duration(seconds: 2),
      );

      if (success) {
        _pulseController.repeat(reverse: true);
        setState(() {
          _isListening = _speechService.isListening;
        });
        _startSyncTimer();
      } else {
        if (!mounted) return;

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.failedToStartListening),
            backgroundColor: Colors.orange,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              AppLocalizations.of(context)!.errorStartingSpeechRecognition),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  Future<void> _stopListening() async {
    try {
      await _speechService.stopListening();
      _pulseController.stop();
      _pulseController.reset();
      _stopSyncTimer();
      setState(() {
        _isListening = _speechService.isListening;
      });
    } catch (e) {
      // Handle error silently
    }
  }

  Future<void> _evaluateSentencePronunciation() async {
    if (_recognizedText.isEmpty) return;

    setState(() {
      _isSavingProgress = true;
    });

    try {
      _similarity = _calculateSentenceSimilarity(
        widget.targetSentence.toLowerCase().trim(),
        _recognizedText.toLowerCase().trim(),
      );

      _isSuccess = _similarity >= 0.7;
      _feedback = _generateSentenceFeedback(_similarity, _isSuccess);
      await _saveSentenceProgress();

      setState(() {
        _showResult = true;
        _isSavingProgress = false;
      });

      _resultController.forward();

      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) {
          _resetPractice();
        }
      });
    } catch (e) {
      setState(() {
        _isSavingProgress = false;
        _feedback = AppLocalizations.of(context)!.errorEvaluatingPronunciation;
        _showResult = true;
      });
    }
  }

  double _calculateSentenceSimilarity(String target, String recognized) {
    if (target == recognized) return 1.0;

    final targetWords =
        target.split(' ').where((word) => word.isNotEmpty).toList();
    final recognizedWords =
        recognized.split(' ').where((word) => word.isNotEmpty).toList();

    if (targetWords.isEmpty || recognizedWords.isEmpty) return 0.0;

    int correctWords = 0;
    int totalWords = targetWords.length;

    for (final targetWord in targetWords) {
      if (recognizedWords.contains(targetWord)) {
        correctWords++;
      }
    }

    double orderSimilarity = 0.0;
    int minLength = targetWords.length < recognizedWords.length
        ? targetWords.length
        : recognizedWords.length;

    for (int i = 0; i < minLength; i++) {
      if (targetWords[i] == recognizedWords[i]) {
        orderSimilarity += 1.0;
      }
    }
    orderSimilarity = minLength > 0 ? orderSimilarity / minLength : 0.0;

    final wordAccuracy = totalWords > 0 ? correctWords / totalWords : 0.0;
    final finalSimilarity = (wordAccuracy * 0.7) + (orderSimilarity * 0.3);

    return finalSimilarity;
  }

  String _generateSentenceFeedback(double similarity, bool isSuccess) {
    if (isSuccess) {
      if (similarity >= 0.95) {
        return AppLocalizations.of(context)!.perfectSentencePronunciation;
      } else if (similarity >= 0.85) {
        return AppLocalizations.of(context)!.greatSentencePronunciation;
      } else {
        return AppLocalizations.of(context)!.goodSentencePronunciation;
      }
    } else {
      if (similarity >= 0.6) {
        return AppLocalizations.of(context)!.close;
      } else if (similarity >= 0.4) {
        return AppLocalizations.of(context)!.notQuiteRight;
      } else {
        return AppLocalizations.of(context)!.tryAgain;
      }
    }
  }

  Future<void> _saveSentenceProgress() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final hardWordProvider =
        Provider.of<HardWordProvider>(context, listen: false);
    if (authProvider.firebaseUser == null) return;

    try {
      final sentenceId = 'sentence_${widget.targetSentence.hashCode}';

      final progress = PronunciationProgress(
        userId: authProvider.firebaseUser!.uid,
        word: sentenceId,
        spokenText: _recognizedText,
        confidence: _confidence,
        similarity: _similarity,
        isCorrect: _isSuccess,
        mispronouncedWords: _isSuccess ? [] : _getMispronouncedWords(),
        correctWords: _isSuccess ? _getCorrectWords() : [],
        accuracy: _similarity,
        attemptNumber: 1,
        timestamp: DateTime.now(),
        speakingDuration: const Duration(milliseconds: 2000),
        feedback: _feedback,
        additionalMetrics: {
          'sentenceType': 'vocabulary_example',
          'targetSentence': widget.targetSentence,
          'sentenceTranslation': widget.sentenceTranslation,
          'context': widget.context,
          'wordCount': widget.targetSentence.split(' ').length,
          'spokenWordCount': _recognizedText.split(' ').length,
          'accuracyLevel': _similarity > 0.8
              ? AppLocalizations.of(context)!.excellent
              : _similarity > 0.6
                  ? AppLocalizations.of(context)!.good
                  : AppLocalizations.of(context)!.poor,
          'confidenceLevel': _confidence > 0.8
              ? AppLocalizations.of(context)!.veryHigh
              : _confidence > 0.6
                  ? AppLocalizations.of(context)!.high
                  : AppLocalizations.of(context)!.medium,
        },
      );

      await _speechService.savePronunciationProgress(progress);
      _lastProgress = progress;

      // Track vocabulary progress for individual words in the sentence
      await _trackVocabularyProgress();
      // Track hard words for each word in the sentence
      final words = widget.targetSentence
          .toLowerCase()
          .split(' ')
          .where((word) => word.isNotEmpty)
          .toList();
      for (final word in words) {
        if (!_isSuccess) {
          hardWordProvider.addOrUpdateHardWord(word);
        } else {
          hardWordProvider.markAsPracticed(word, correct: true);
        }
      }
    } catch (e) {
      // Handle error silently
    }
  }

  Future<void> _trackVocabularyProgress() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final vocabularyProvider =
        Provider.of<VocabularyProgressProvider>(context, listen: false);
    final goalProvider =
        Provider.of<VocabularyGoalProvider>(context, listen: false);

    if (authProvider.firebaseUser == null) return;

    try {
      // Extract individual words from the target sentence
      final words = widget.targetSentence
          .toLowerCase()
          .split(' ')
          .where((word) => word.isNotEmpty)
          .toList();

      // Track progress for each word in the sentence
      for (final word in words) {
        // Record that the word was viewed/practiced
        await vocabularyProvider.incrementViewCount(word);

        // If pronunciation was successful, record it as a correct answer
        if (_isSuccess) {
          await vocabularyProvider.recordCorrectAnswer(word);
        } else {
          // If pronunciation failed, record it as an incorrect answer
          await vocabularyProvider.recordIncorrectAnswer(word);
        }
      }

      // Update vocabulary goal if pronunciation was successful
      if (_isSuccess && words.isNotEmpty) {
        await goalProvider.updateProgress(words.length);
      }
    } catch (e) {
      // Handle error silently
    }
  }

  List<String> _getMispronouncedWords() {
    final targetWords = widget.targetSentence.toLowerCase().split(' ');
    final spokenWords = _recognizedText.toLowerCase().split(' ');
    final mispronounced = <String>[];

    for (final targetWord in targetWords) {
      if (!spokenWords.contains(targetWord)) {
        mispronounced.add(targetWord);
      }
    }

    return mispronounced;
  }

  List<String> _getCorrectWords() {
    final targetWords = widget.targetSentence.toLowerCase().split(' ');
    final spokenWords = _recognizedText.toLowerCase().split(' ');
    final correct = <String>[];

    for (final targetWord in targetWords) {
      if (spokenWords.contains(targetWord)) {
        correct.add(targetWord);
      }
    }

    return correct;
  }

  Map<String, dynamic> _getVocabularyInfo() {
    final vocabularyProvider =
        Provider.of<VocabularyProgressProvider>(context, listen: false);
    final goalProvider =
        Provider.of<VocabularyGoalProvider>(context, listen: false);

    final words = widget.targetSentence
        .toLowerCase()
        .split(' ')
        .where((word) => word.isNotEmpty)
        .toList();

    final wordProgress = <String, Map<String, dynamic>>{};
    int totalWordsPracticed = 0;
    int newWordsLearned = 0;

    for (final word in words) {
      final progress = vocabularyProvider.getWordProgress(word);
      final accuracy = vocabularyProvider.getWordAccuracy(word);
      final attempts = vocabularyProvider.getWordAttempts(word);
      final isFavorite = vocabularyProvider.isFavorite(word);

      wordProgress[word] = {
        'accuracy': accuracy,
        'attempts': attempts,
        'isFavorite': isFavorite,
        'isNew': attempts == 0,
      };

      totalWordsPracticed++;
      if (attempts == 0) {
        newWordsLearned++;
      }
    }

    return {
      'wordProgress': wordProgress,
      'totalWords': totalWordsPracticed,
      'newWordsLearned': newWordsLearned,
      'goalProgress': goalProvider.currentProgress,
      'goalTarget': goalProvider.dailyTarget,
      'goalRemaining': goalProvider.remainingWords,
    };
  }

  void _resetPractice() {
    setState(() {
      _recognizedText = '';
      _showResult = false;
      _isSuccess = false;
      _feedback = '';
      _confidence = 0.0;
      _similarity = 0.0;
    });
    _resultController.reset();
  }

  @override
  void dispose() {
    _stopSyncTimer();
    _pulseController.dispose();
    _resultController.dispose();
    _speechService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        // Target Sentence Display
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: theme.colorScheme.primary.withOpacity(0.6),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.chat_bubble_outline,
                      color: theme.colorScheme.primary),
                  const SizedBox(width: 8),
                  Text(
                    AppLocalizations.of(context)!.practiceThisSentence,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                widget.targetSentence,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              if (widget.sentenceTranslation != null) ...[
                const SizedBox(height: 8),
                Text(
                  widget.sentenceTranslation!,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontStyle: FontStyle.italic,
                    color: theme.colorScheme.onSurface.withOpacity(0.7),
                  ),
                ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 24),

        // Pronunciation Practice Area
        if (!_showResult) ...[
          // Listening Status
          AnimatedBuilder(
            animation: _pulseAnimation,
            builder: (context, child) {
              return Transform.scale(
                scale: _isListening ? _pulseAnimation.value : 1.0,
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _isListening
                        ? Colors.red.withOpacity(0.2)
                        : Colors.grey.withOpacity(0.1),
                    border: Border.all(
                      color: _isListening ? Colors.red : Colors.grey,
                      width: 3,
                    ),
                  ),
                  child: Icon(
                    _isListening ? Icons.mic : Icons.mic_none,
                    size: 48,
                    color: _isListening ? Colors.red : Colors.grey,
                  ),
                ),
              );
            },
          ),

          const SizedBox(height: 24),

          // Recognized Text Display
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _recognizedText.isNotEmpty
                  ? theme.colorScheme.surfaceVariant
                  : theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _recognizedText.isNotEmpty
                    ? theme.colorScheme.primary.withOpacity(0.3)
                    : theme.dividerColor.withOpacity(0.2),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      _isListening ? Icons.mic : Icons.mic_none,
                      color: _isListening ? Colors.red : Colors.grey,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _isListening
                          ? AppLocalizations.of(context)!.listening
                          : AppLocalizations.of(context)!.readyToListen,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: _isListening ? Colors.red : Colors.grey,
                      ),
                    ),
                    if (_isListening) ...[
                      const SizedBox(width: 8),
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 12),
                if (_recognizedText.isNotEmpty) ...[
                  Text(
                    AppLocalizations.of(context)!.youSaid,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                          color: theme.colorScheme.primary.withOpacity(0.3)),
                    ),
                    child: Text(
                      _recognizedText,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: theme.colorScheme.onSurface,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ] else ...[
                  Text(
                    AppLocalizations.of(context)!
                        .startSpeakingToSeeYourWordsHere,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.5),
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
                if (_isListening && _recognizedText.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(
                        Icons.radio_button_checked,
                        color: Colors.red,
                        size: 12,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        AppLocalizations.of(context)!.liveTranscription,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.red,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Control Buttons
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _isListening ? _stopListening : _startListening,
                  icon: Icon(_isListening ? Icons.stop : Icons.mic),
                  label: Text(_isListening
                      ? AppLocalizations.of(context)!.stop
                      : AppLocalizations.of(context)!.startSpeaking),
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        _isListening ? Colors.red : theme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],

        // Result Display
        if (_showResult) ...[
          AnimatedBuilder(
            animation: _resultAnimation,
            builder: (context, child) {
              return Transform.scale(
                scale: _resultAnimation.value,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: _isSuccess
                        ? Colors.green.withOpacity(0.1)
                        : Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: _isSuccess
                          ? Colors.green.withOpacity(0.3)
                          : Colors.orange.withOpacity(0.3),
                    ),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        _isSuccess ? Icons.check_circle : Icons.info_outline,
                        size: 48,
                        color: _isSuccess ? Colors.green : Colors.orange,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _feedback,
                        style: theme.textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w500,
                          color: _isSuccess
                              ? Colors.green[700]
                              : Colors.orange[700],
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),

                      // Vocabulary Progress Section
                      if (_isSuccess) ...[
                        _buildVocabularyProgressSection(theme),
                        const SizedBox(height: 16),
                      ],

                      Row(
                        children: [
                          Expanded(
                            child: _buildResultMetric(
                              AppLocalizations.of(context)!.similarity,
                              '${(_similarity * 100).round()}%',
                              Icons.compare_arrows,
                              _similarity > 0.7 ? Colors.green : Colors.orange,
                            ),
                          ),
                          Expanded(
                            child: _buildResultMetric(
                              AppLocalizations.of(context)!.confidence,
                              '${(_confidence * 100).round()}%',
                              Icons.psychology,
                              _confidence > 0.6 ? Colors.blue : Colors.grey,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: _resetPractice,
                              child:
                                  Text(AppLocalizations.of(context)!.tryAgain),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: _isSuccess
                                  ? widget.onSuccess
                                  : widget.onRetry,
                              style: ElevatedButton.styleFrom(
                                backgroundColor:
                                    _isSuccess ? Colors.green : Colors.orange,
                                foregroundColor: Colors.white,
                              ),
                              child: Text(_isSuccess
                                  ? AppLocalizations.of(context)!.continueText
                                  : AppLocalizations.of(context)!.retry),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],

        // Loading indicator
        if (_isSavingProgress)
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: CircularProgressIndicator(),
          ),
      ],
    );
  }

  Widget _buildResultMetric(
      String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
        ),
      ],
    );
  }

  Widget _buildVocabularyProgressSection(ThemeData theme) {
    final vocabularyInfo = _getVocabularyInfo();
    final wordProgress = vocabularyInfo['wordProgress'] as Map<String, dynamic>;
    final totalWords = vocabularyInfo['totalWords'] as int;
    final newWordsLearned = vocabularyInfo['newWordsLearned'] as int;
    final goalProgress = vocabularyInfo['goalProgress'] as int;
    final goalTarget = vocabularyInfo['goalTarget'] as int;
    final goalRemaining = vocabularyInfo['goalRemaining'] as int;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.blue.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.book, color: Colors.blue, size: 20),
              const SizedBox(width: 8),
              Text(
                AppLocalizations.of(context)!.vocabularyProgress,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppLocalizations.of(context)!.wordsPracticed,
                      style: theme.textTheme.bodySmall,
                    ),
                    Text(
                      AppLocalizations.of(context)!.newWords,
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      AppLocalizations.of(context)!.goal,
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      AppLocalizations.of(context)!.remaining,
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
