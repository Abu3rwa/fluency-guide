import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'package:app_settings/app_settings.dart';
import 'package:provider/provider.dart';
import '../services/speech_recognition_service.dart';
import '../../../../../migrate/lib/models/pronunciation_progress.dart';
import '../providers/auth_provider.dart';
import '../providers/vocabulary_progress_provider.dart';
import '../providers/vocabulary_goal_provider.dart';
import '../providers/hard_word_provider.dart';

class WordPronunciationWidget extends StatefulWidget {
  final String targetWord;
  final String? pronunciation;
  final VoidCallback? onSuccess;
  final VoidCallback? onRetry;

  const WordPronunciationWidget({
    Key? key,
    required this.targetWord,
    this.pronunciation,
    this.onSuccess,
    this.onRetry,
  }) : super(key: key);

  @override
  State<WordPronunciationWidget> createState() =>
      _WordPronunciationWidgetState();
}

class _WordPronunciationWidgetState extends State<WordPronunciationWidget>
    with TickerProviderStateMixin {
  final SpeechRecognitionService _speechService = SpeechRecognitionService();

  bool _isListening = false;
  bool _isInitialized = false;
  String _recognizedText = '';
  double _confidence = 0.0;
  double _similarity = 0.0;
  String _feedback = '';
  bool _showResult = false;
  bool _isSuccess = false;
  bool _isSavingProgress = false;
  bool _streamListenersSetUp = false;
  PronunciationProgress? _lastProgress;

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

  Future<void> _initializeSpeechRecognition() async {
    if (_isInitialized) return;

    try {
      // Request microphone permission
      final hasPermission = await _speechService.requestMicrophonePermission();
      if (!hasPermission) {
        return;
      }

      // Initialize speech recognition with retry logic
      bool available = false;
      for (int i = 0; i < 3; i++) {
        available = await _speechService.initialize();
        if (available) break;
        await Future.delayed(const Duration(seconds: 1));
      }

      if (available && hasPermission) {
        setState(() {
          _isInitialized = true;
        });
        _setupStreamListeners();
      }
    } catch (e) {
      // Handle initialization error
    }
  }

  void _setupStreamListeners() {
    if (_streamListenersSetUp) return;

    try {
      _streamListenersSetUp = true;

      // Listen to words stream
      _speechService.wordsStream.listen((words) {
        if (mounted) {
          setState(() {
            _recognizedText = words;
          });
        }
      });

      // Listen to confidence stream
      _speechService.confidenceStream.listen((confidence) {
        if (mounted) {
          setState(() {
            _confidence = confidence;
          });
        }
      });

      // Listen to listening state stream
      _speechService.listeningStream.listen((isListening) {
        if (mounted) {
          setState(() {
            _isListening = isListening;
            if (!isListening && _recognizedText.isNotEmpty) {
              _evaluatePronunciation();
            }
          });
        }
      });
    } catch (e) {
      _streamListenersSetUp = false;
    }
  }

  Future<void> _requestPermission() async {
    final permissionGranted =
        await _speechService.requestMicrophonePermission();
    if (permissionGranted) {
      await _initializeSpeechRecognition();
      setState(() {}); // Ensure UI updates after initialization
    } else {
      // Check if permission is permanently denied
      final status = await _speechService.hasMicrophonePermission();
      if (!status) {
        // Show dialog to open app settings
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Microphone Permission Required'),
            content: const Text(
              'Speech recognition requires microphone access. Please enable it in app settings.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  AppSettings.openAppSettings();
                },
                child: const Text('Open Settings'),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
                'Permission denied. Please enable microphone access in app settings.'),
            backgroundColor: Colors.red,
            duration: Duration(seconds: 3),
          ),
        );
      }
    }
  }

  Future<void> _startListening() async {
    setState(() {
      _recognizedText = '';
    });
    if (!_isInitialized) {
      await _initializeSpeechRecognition();
      if (!_isInitialized) {
        return;
      }
    }

    if (_isListening) {
      await _stopListening();
    }

    final success = await _speechService.startListening(
      listenFor: const Duration(seconds: 8),
      pauseFor: const Duration(seconds: 2),
    );

    if (success) {
      setState(() {
        _isListening = true;
      });
    }
  }

  Future<void> _stopListening() async {
    setState(() {
      _isListening = false;
    });

    await _speechService.stopListening();
  }

  void _evaluatePronunciation() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userId = authProvider.firebaseUser?.uid;
    final hardWordProvider =
        Provider.of<HardWordProvider>(context, listen: false);

    if (userId == null) {
      // Fallback to basic evaluation if no user
      final similarity = _speechService.comparePronunciation(
        widget.targetWord,
        _recognizedText,
      );

      final feedback = _speechService.getPronunciationFeedback(
        widget.targetWord,
        _recognizedText,
        similarity,
      );

      setState(() {
        _similarity = similarity;
        _feedback = feedback;
        _showResult = true;
        _isSuccess = similarity >= 0.7;
      });

      _resultController.forward();

      if (_isSuccess) {
        widget.onSuccess?.call();
      }
      // Track hard word locally (no userId)
      if (!_isSuccess) {
        hardWordProvider.addOrUpdateHardWord(widget.targetWord);
      } else {
        hardWordProvider.markAsPracticed(widget.targetWord, correct: true);
      }
      return;
    }

    try {
      setState(() {
        _isSavingProgress = true;
      });

      // Use enhanced pronunciation analysis
      final progress = await _speechService.analyzePronunciation(
        userId,
        widget.targetWord,
        _recognizedText,
        _confidence,
      );

      // Save progress to Firebase
      await _speechService.savePronunciationProgress(progress);

      // Track vocabulary progress for the target word
      await _trackVocabularyProgress();

      setState(() {
        _lastProgress = progress;
        _similarity = progress.accuracy;
        _feedback = progress.feedback;
        _showResult = true;
        _isSuccess = progress.isCorrect;
        _isSavingProgress = false;
      });

      _resultController.forward();

      if (_isSuccess) {
        widget.onSuccess?.call();
      }
      // Track hard word for user
      if (!_isSuccess) {
        hardWordProvider.addOrUpdateHardWord(widget.targetWord);
      } else {
        hardWordProvider.markAsPracticed(widget.targetWord, correct: true);
      }

      // Show detailed feedback
      _showDetailedFeedback(progress);
    } catch (e) {
      setState(() {
        _isSavingProgress = false;
      });

      // Fallback to basic evaluation
      final similarity = _speechService.comparePronunciation(
        widget.targetWord,
        _recognizedText,
      );

      final feedback = _speechService.getPronunciationFeedback(
        widget.targetWord,
        _recognizedText,
        similarity,
      );

      setState(() {
        _similarity = similarity;
        _feedback = feedback;
        _showResult = true;
        _isSuccess = similarity >= 0.7;
      });

      _resultController.forward();

      if (_isSuccess) {
        widget.onSuccess?.call();
      }
      // Track hard word for user
      if (!_isSuccess) {
        hardWordProvider.addOrUpdateHardWord(widget.targetWord);
      } else {
        hardWordProvider.markAsPracticed(widget.targetWord, correct: true);
      }
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
      // Ensure vocabulary provider is initialized
      if (vocabularyProvider.currentUserId == null) {
        await vocabularyProvider.initialize(authProvider.firebaseUser!.uid);
      }

      final word = widget.targetWord.toLowerCase().trim();

      // Record that the word was viewed/practiced
      await vocabularyProvider.incrementViewCount(word);

      // If pronunciation was successful, record it as a correct answer
      if (_isSuccess) {
        await vocabularyProvider.recordCorrectAnswer(word);
        // Update vocabulary goal
        await goalProvider.updateProgress(1);
      } else {
        // If pronunciation failed, record it as an incorrect answer
        await vocabularyProvider.recordIncorrectAnswer(word);
      }
    } catch (e) {
      // Handle vocabulary progress tracking error
    }
  }

  Map<String, dynamic> _getVocabularyInfo() {
    final vocabularyProvider =
        Provider.of<VocabularyProgressProvider>(context, listen: false);
    final goalProvider =
        Provider.of<VocabularyGoalProvider>(context, listen: false);

    // Ensure vocabulary provider is initialized
    if (vocabularyProvider.currentUserId == null) {
      return {
        'word': widget.targetWord.toLowerCase().trim(),
        'accuracy': 0.0,
        'attempts': 0,
        'isFavorite': false,
        'isNew': true,
        'goalProgress': goalProvider.currentProgress,
        'goalTarget': goalProvider.dailyTarget,
        'goalRemaining': goalProvider.remainingWords,
      };
    }

    final word = widget.targetWord.toLowerCase().trim();
    final progress = vocabularyProvider.getWordProgress(word);
    final accuracy = vocabularyProvider.getWordAccuracy(word);
    final attempts = vocabularyProvider.getWordAttempts(word);
    final isFavorite = vocabularyProvider.isFavorite(word);

    return {
      'word': word,
      'accuracy': accuracy,
      'attempts': attempts,
      'isFavorite': isFavorite,
      'isNew': attempts == 0,
      'goalProgress': goalProvider.currentProgress,
      'goalTarget': goalProvider.dailyTarget,
      'goalRemaining': goalProvider.remainingWords,
    };
  }

  void _showDetailedFeedback(PronunciationProgress progress) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(
              progress.isCorrect ? Icons.check_circle : Icons.info,
              color: progress.isCorrect ? Colors.green : Colors.orange,
            ),
            const SizedBox(width: 8),
            const Text('Pronunciation Analysis'),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Target: ${progress.word}'),
              Text('You said: ${progress.spokenText}'),
              const SizedBox(height: 8),
              Text('Accuracy: ${(progress.accuracy * 100).round()}%'),
              Text('Confidence: ${(progress.confidence * 100).round()}%'),
              Text('Duration: ${progress.speakingDuration.inSeconds}s'),
              if (progress.mispronouncedWords.isNotEmpty) ...[
                const SizedBox(height: 8),
                const Text('Mispronounced words:'),
                ...progress.mispronouncedWords.map((word) => Text('• $word')),
              ],
              if (progress.correctWords.isNotEmpty) ...[
                const SizedBox(height: 8),
                const Text('Correct words:'),
                ...progress.correctWords.map((word) => Text('• $word')),
              ],
              const SizedBox(height: 8),
              Text('Feedback: ${progress.feedback}'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _retry() {
    setState(() {
      _recognizedText = '';
      _showResult = false;
      _feedback = '';
      _similarity = 0.0;
    });
    _resultController.reset();
    widget.onRetry?.call();
  }

  @override
  void dispose() {
    _speechService.cancelListening();
    _pulseController.dispose();
    _resultController.dispose();
    _streamListenersSetUp = false;
    super.dispose();
  }

  String _getVoiceQualityIndicator() {
    if (_speechService.isTtsInitialized) {
      return '⭐ Standard';
    }
    return '🔇 Not Available';
  }

  Widget _buildVoiceQualityIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.volume_up,
            size: 14,
            color: Colors.blue[700],
          ),
          const SizedBox(width: 4),
          Text(
            _getVoiceQualityIndicator(),
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: Colors.blue[700],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[850] : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.primaryColor.withOpacity(0.2),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Row(
            children: [
              Icon(Icons.record_voice_over, color: theme.primaryColor),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Pronunciation Practice',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              _buildVoiceQualityIndicator(),
            ],
          ),
          const SizedBox(height: 16),

          // Target Word
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: theme.primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Say this word:',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: Colors.grey[600],
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  widget.targetWord,
                                  style:
                                      theme.textTheme.headlineMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: theme.primaryColor,
                                  ),
                                ),
                              ),
                              // Play button for TTS
                              if (_speechService.isTtsInitialized)
                                IconButton(
                                  onPressed: () async {
                                    await _speechService
                                        .speak(widget.targetWord);
                                  },
                                  icon: const Icon(Icons.volume_up),
                                  tooltip: 'Listen to pronunciation',
                                  style: IconButton.styleFrom(
                                    backgroundColor:
                                        theme.primaryColor.withOpacity(0.2),
                                    foregroundColor: theme.primaryColor,
                                  ),
                                ),
                            ],
                          ),
                          if (widget.pronunciation != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              widget.pronunciation!,
                              style: theme.textTheme.bodyLarge?.copyWith(
                                fontStyle: FontStyle.italic,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Microphone Button
          Center(
            child: _isInitialized
                ? AnimatedBuilder(
                    animation: _pulseAnimation,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _isListening ? _pulseAnimation.value : 1.0,
                        child: ElevatedButton(
                          onPressed:
                              _isListening ? _stopListening : _startListening,
                          style: ElevatedButton.styleFrom(
                            backgroundColor:
                                _isListening ? Colors.red : theme.primaryColor,
                            foregroundColor: Colors.white,
                            shape: const CircleBorder(),
                            padding: const EdgeInsets.all(20),
                            elevation: 8,
                            shadowColor:
                                (_isListening ? Colors.red : theme.primaryColor)
                                    .withOpacity(0.3),
                          ),
                          child: Icon(
                            _isListening ? Icons.stop : Icons.mic,
                            color: Colors.white,
                            size: 32,
                          ),
                        ),
                      );
                    },
                  )
                : Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.grey[400],
                    ),
                    child: const Icon(
                      Icons.mic_off,
                      color: Colors.white,
                      size: 32,
                    ),
                  ),
          ),

          const SizedBox(height: 16),

          // Retry button for failed initialization
          if (!_isInitialized) ...[
            Center(
              child: Column(
                children: [
                  ElevatedButton.icon(
                    onPressed: () {
                      _initializeSpeechRecognition();
                    },
                    icon: const Icon(Icons.refresh),
                    label: const Text('Retry Initialization'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.orange,
                      foregroundColor: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    onPressed: _requestPermission,
                    icon: const Icon(Icons.mic),
                    label: const Text('Grant Microphone Permission'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Status Text
          Center(
            child: Column(
              children: [
                if (!_isInitialized) ...[
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.orange.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.orange.withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.warning,
                            color: Colors.orange, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          'Initializing speech recognition...',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.orange,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                if (_isSavingProgress) ...[
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.blue.withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.blue),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Saving progress...',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.blue,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                Text(
                  _isListening
                      ? 'Listening... Speak now!'
                      : _recognizedText.isNotEmpty
                          ? 'Tap to try again'
                          : 'Tap the microphone to start',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: _isListening ? Colors.red : Colors.grey[600],
                    fontWeight:
                        _isListening ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),

          // Recognized Text
          if (_recognizedText.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
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
                  Text(
                    'You said:',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _recognizedText,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Result Section
          if (_showResult) ...[
            const SizedBox(height: 20),
            AnimatedBuilder(
              animation: _resultAnimation,
              builder: (context, child) {
                return Transform.scale(
                  scale: _resultAnimation.value,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _isSuccess
                          ? Colors.green.withOpacity(0.1)
                          : Colors.orange.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _isSuccess
                            ? Colors.green.withOpacity(0.3)
                            : Colors.orange.withOpacity(0.3),
                      ),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Icon(
                              _isSuccess ? Icons.check_circle : Icons.info,
                              color: _isSuccess ? Colors.green : Colors.orange,
                              size: 24,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                _feedback,
                                style: theme.textTheme.bodyLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color:
                                      _isSuccess ? Colors.green : Colors.orange,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        LinearProgressIndicator(
                          value: _similarity,
                          backgroundColor: Colors.grey[300],
                          valueColor: AlwaysStoppedAnimation<Color>(
                            _isSuccess ? Colors.green : Colors.orange,
                          ),
                          minHeight: 8,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Accuracy: ${(_similarity * 100).round()}%',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),

                        // Vocabulary Progress Section
                        if (_isSuccess) ...[
                          const SizedBox(height: 12),
                          _buildVocabularyProgressSection(theme),
                        ],

                        if (!_isSuccess) ...[
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: _retry,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.orange,
                                foregroundColor: Colors.white,
                              ),
                              child: const Text('Try Again'),
                            ),
                          ),
                        ],

                        // Debug button for testing vocabulary progress
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton(
                            onPressed: () async {
                              await _trackVocabularyProgress();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                      'Vocabulary progress test completed. Check console for details.'),
                                  duration: Duration(seconds: 2),
                                ),
                              );
                            },
                            child:
                                const Text('Debug: Test Vocabulary Progress'),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildVocabularyProgressSection(ThemeData theme) {
    final vocabularyInfo = _getVocabularyInfo();

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
                'Vocabulary Progress',
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
                      'Word: ${vocabularyInfo['word']}',
                      style: theme.textTheme.bodySmall,
                    ),
                    Text(
                      'Accuracy: ${(vocabularyInfo['accuracy'] * 100).round()}%',
                      style: theme.textTheme.bodySmall,
                    ),
                    Text(
                      'Attempts: ${vocabularyInfo['attempts']}',
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
                      'Goal: ${vocabularyInfo['goalProgress']}/${vocabularyInfo['goalTarget']}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      'Remaining: ${vocabularyInfo['goalRemaining']}',
                      style: theme.textTheme.bodySmall,
                    ),
                    if (vocabularyInfo['isNew'] as bool)
                      Text(
                        'New word!',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.green,
                          fontWeight: FontWeight.bold,
                        ),
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
