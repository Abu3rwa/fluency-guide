import 'package:flutter/material.dart';
import '../services/elevenlabs_service.dart';
import '../config/app_config.dart';

class ListeningPracticeScreen extends StatefulWidget {
  const ListeningPracticeScreen({Key? key}) : super(key: key);

  @override
  State<ListeningPracticeScreen> createState() =>
      _ListeningPracticeScreenState();
}

class _ListeningPracticeScreenState extends State<ListeningPracticeScreen> {
  late ElevenLabsService _elevenLabsService;
  List<Voice> _voices = [];
  Voice? _selectedVoice;
  bool _isLoading = false;
  bool _isPlaying = false;
  final TextEditingController _textController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _elevenLabsService = ElevenLabsService(apiKey: AppConfig.elevenLabsApiKey);
    _loadVoices();
  }

  Future<void> _loadVoices() async {
    setState(() => _isLoading = true);
    try {
      final voices = await _elevenLabsService.getVoices();
      setState(() {
        _voices = voices;
        _selectedVoice = voices.isNotEmpty ? voices[0] : null;
      });
    } catch (e) {
      _showError('Failed to load voices: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _generateAndPlaySpeech() async {
    if (_textController.text.isEmpty || _selectedVoice == null) {
      _showError('Please enter text and select a voice');
      return;
    }

    setState(() => _isLoading = true);
    try {
      final audioPath = await _elevenLabsService.textToSpeech(
        text: _textController.text,
        voiceId: _selectedVoice!.voiceId,
      );
      await _elevenLabsService.playAudio(audioPath);
      setState(() => _isPlaying = true);
      // Reset playing state after a delay
      Future.delayed(const Duration(seconds: 5), () {
        if (mounted) setState(() => _isPlaying = false);
      });
    } catch (e) {
      _showError('Failed to generate speech: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _stopPlayback() async {
    await _elevenLabsService.stopAudio();
    setState(() => _isPlaying = false);
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Text-to-Speech'),
        backgroundColor: Colors.blue,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Text input
            TextField(
              controller: _textController,
              maxLines: 3,
              decoration: const InputDecoration(
                  labelText: 'Enter text to speak',
                  border: OutlineInputBorder(),
                  hintText: 'Type the word or sentence you want to hear...'),
            ),
            const SizedBox(height: 16),
            // Voice selection
            if (_voices.isNotEmpty)
              DropdownButtonFormField<Voice>(
                value: _selectedVoice,
                decoration: const InputDecoration(
                  labelText: 'Select Voice',
                  border: OutlineInputBorder(),
                ),
                items: _voices.map((voice) {
                  return DropdownMenuItem(
                    value: voice,
                    child: Text('${voice.name} (${voice.category})'),
                  );
                }).toList(),
                onChanged: (voice) {
                  setState(() => _selectedVoice = voice);
                },
              ),
            const SizedBox(height: 24),
            // Control buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isLoading ? null : _generateAndPlaySpeech,
                    icon: _isLoading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.play_arrow),
                    label: Text(_isLoading ? 'Generating...' : 'Speak'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                if (_isPlaying)
                  ElevatedButton.icon(
                    onPressed: _stopPlayback,
                    icon: const Icon(Icons.stop),
                    label: const Text('Stop'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 24),
            // Sample phrases for language learning
            Text(
              'Quick Phrases:',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                'Hello, how are you?',
                'Thank you very much',
                'What time is it?',
                'Where is the bathroom?',
                'I would like to order food',
                'How much does this cost?',
                'Can you help me?',
                'Nice to meet you',
              ].map((phrase) {
                return ActionChip(
                  label: Text(phrase),
                  onPressed: () {
                    _textController.text = phrase;
                  },
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _elevenLabsService.dispose();
    _textController.dispose();
    super.dispose();
  }
}
