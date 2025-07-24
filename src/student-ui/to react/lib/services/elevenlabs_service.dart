import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:just_audio/just_audio.dart';

class ElevenLabsService {
  static const String _baseUrl = 'https://api.elevenlabs.io/v1';
  final String _apiKey;
  final AudioPlayer _audioPlayer = AudioPlayer();

  ElevenLabsService({required String apiKey}) : _apiKey = apiKey;

  // Get available voices
  Future<List<Voice>> getVoices() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/voices'),
        headers: {
          'xi-api-key': _apiKey,
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['voices'] as List)
            .map((voice) => Voice.fromJson(voice))
            .toList();
      } else {
        throw Exception(
            'Failed to load voices: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching voices: $e');
    }
  }

  // Convert text to speech
  Future<String> textToSpeech({
    required String text,
    required String voiceId,
    String modelId = 'eleven_monolingual_v1',
    double stability = 0.5,
    double similarityBoost = 0.75,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/text-to-speech/$voiceId'),
        headers: {
          'xi-api-key': _apiKey,
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'text': text,
          'model_id': modelId,
          'voice_settings': {
            'stability': stability,
            'similarity_boost': similarityBoost,
          },
        }),
      );

      if (response.statusCode == 200) {
        // Save audio file
        final bytes = response.bodyBytes;
        final tempDir = await getTemporaryDirectory();
        final fileName = 'speech_${DateTime.now().millisecondsSinceEpoch}.mp3';
        final filePath = '${tempDir.path}/$fileName';
        final file = File(filePath);
        await file.writeAsBytes(bytes);
        return filePath;
      } else {
        throw Exception(
            'Failed to generate speech: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      throw Exception('Error generating speech: $e');
    }
  }

  // Play audio file
  Future<void> playAudio(String filePath) async {
    try {
      await _audioPlayer.setFilePath(filePath);
      await _audioPlayer.play();
    } catch (e) {
      throw Exception('Error playing audio: $e');
    }
  }

  // Stop audio playback
  Future<void> stopAudio() async {
    await _audioPlayer.stop();
  }

  void dispose() {
    _audioPlayer.dispose();
  }
}

// Voice model
class Voice {
  final String voiceId;
  final String name;
  final String category;
  final Map<String, dynamic> settings;

  Voice({
    required this.voiceId,
    required this.name,
    required this.category,
    required this.settings,
  });

  factory Voice.fromJson(Map<String, dynamic> json) {
    return Voice(
      voiceId: json['voice_id'],
      name: json['name'],
      category: json['category'] ?? 'Unknown',
      settings: json['settings'] ?? {},
    );
  }
}
