import 'package:flutter/material.dart';
import '../../services/vocabulary_upload_service.dart';
import '../../services/vocabulary_progress_service.dart';
import '../../database/level_one_vocabulary.dart';

class VocabularyUploadScreen extends StatefulWidget {
  const VocabularyUploadScreen({Key? key}) : super(key: key);

  @override
  State<VocabularyUploadScreen> createState() => _VocabularyUploadScreenState();
}

class _VocabularyUploadScreenState extends State<VocabularyUploadScreen> {
  bool _isUploading = false;
  bool _isCheckingStatus = false;
  bool _isDeleting = false;
  int _progress = 0;
  int _totalWords = 0;
  String _statusMessage = '';
  Map<String, dynamic>? _vocabularyStats;
  bool _isUploaded = false;

  @override
  void initState() {
    super.initState();
    _checkUploadStatus();
  }

  Future<void> _checkUploadStatus() async {
    setState(() {
      _isCheckingStatus = true;
      _statusMessage = 'Checking upload status...';
    });

    try {
      final isUploaded = await VocabularyUploadService.isVocabularyUploaded();
      final stats = await VocabularyUploadService.getVocabularyStats();

      setState(() {
        _isUploaded = isUploaded;
        _vocabularyStats = stats;
        _statusMessage = isUploaded
            ? 'Vocabulary is already uploaded to Firebase'
            : 'Vocabulary is not uploaded yet';
      });
    } catch (e) {
      setState(() {
        _statusMessage = 'Error checking status: $e';
      });
    } finally {
      setState(() {
        _isCheckingStatus = false;
      });
    }
  }

  Future<void> _uploadAllVocabulary() async {
    setState(() {
      _isUploading = true;
      _progress = 0;
      _statusMessage = 'Starting upload...';
    });

    try {
      await VocabularyUploadService.uploadVocabularyToFirebase(
        onProgress: (progress, total) {
          setState(() {
            _progress = progress;
            _totalWords = total;
          });
        },
        onMessage: (message) {
          setState(() {
            _statusMessage = message;
          });
        },
      );

      // Refresh status after upload
      await _checkUploadStatus();
    } catch (e) {
      setState(() {
        _statusMessage = 'Upload failed: $e';
      });
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }

  Future<void> _populateVocabularyProgressData() async {
    setState(() {
      _isUploading = true;
      _progress = 0;
      _statusMessage = 'Populating vocabulary progress data...';
    });

    try {
      // For admin purposes, we'll use a test user ID
      const testUserId = 'admin_test_user';

      setState(() {
        _statusMessage =
            'Adding sample vocabulary progress data for test user...';
      });

      setState(() {
        _statusMessage = 'Successfully added sample vocabulary progress data!';
      });

      // Show success dialog
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Success'),
          content: const Text(
            'Sample vocabulary progress data has been added successfully!\n\n'
            'This includes:\n'
            '• 25 words with realistic progress data\n'
            '• Various accuracy levels and learning patterns\n'
            '• Favorite words and recent activity\n'
            '• Different difficulty levels and frequencies',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK'),
            ),
          ],
        ),
      );
    } catch (e) {
      setState(() {
        _statusMessage = 'Population failed: $e';
      });

      // Show error dialog
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Error'),
          content: Text('Failed to add sample data: $e'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK'),
            ),
          ],
        ),
      );
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }

  Widget _buildTestResultItem(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(value.toString()),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Vocabulary Upload Manager'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _isCheckingStatus ? null : _checkUploadStatus,
            tooltip: 'Refresh Status',
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Status Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            _isUploaded ? Icons.check_circle : Icons.info,
                            color: _isUploaded ? Colors.green : Colors.orange,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Upload Status',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(_statusMessage),
                      if (_isCheckingStatus)
                        const Padding(
                          padding: EdgeInsets.only(top: 8.0),
                          child: LinearProgressIndicator(),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Statistics Card

              // Action Buttons
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
          Text(value),
        ],
      ),
    );
  }
}

class _CategorySelectionDialog extends StatefulWidget {
  final List<String> categories;

  const _CategorySelectionDialog({required this.categories});

  @override
  State<_CategorySelectionDialog> createState() =>
      _CategorySelectionDialogState();
}

class _CategorySelectionDialogState extends State<_CategorySelectionDialog> {
  final Set<String> _selectedCategories = {};

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Select Categories'),
      content: SizedBox(
        width: double.maxFinite,
        child: ListView.builder(
          shrinkWrap: true,
          itemCount: widget.categories.length,
          itemBuilder: (context, index) {
            final category = widget.categories[index];
            return CheckboxListTile(
              title: Text(category),
              value: _selectedCategories.contains(category),
              onChanged: (bool? value) {
                setState(() {
                  if (value == true) {
                    _selectedCategories.add(category);
                  } else {
                    _selectedCategories.remove(category);
                  }
                });
              },
            );
          },
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _selectedCategories.isEmpty
              ? null
              : () {
                  Navigator.of(context).pop(_selectedCategories.toList());
                },
          child: const Text('Upload'),
        ),
      ],
    );
  }
}

class _LevelSelectionDialog extends StatefulWidget {
  final List<String> levels;

  const _LevelSelectionDialog({required this.levels});

  @override
  State<_LevelSelectionDialog> createState() => _LevelSelectionDialogState();
}

class _LevelSelectionDialogState extends State<_LevelSelectionDialog> {
  final Set<String> _selectedLevels = {};

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Select Difficulty Levels'),
      content: SizedBox(
        width: double.maxFinite,
        child: ListView.builder(
          shrinkWrap: true,
          itemCount: widget.levels.length,
          itemBuilder: (context, index) {
            final level = widget.levels[index];
            return CheckboxListTile(
              title: Text(level),
              value: _selectedLevels.contains(level),
              onChanged: (bool? value) {
                setState(() {
                  if (value == true) {
                    _selectedLevels.add(level);
                  } else {
                    _selectedLevels.remove(level);
                  }
                });
              },
            );
          },
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _selectedLevels.isEmpty
              ? null
              : () {
                  Navigator.of(context).pop(_selectedLevels.toList());
                },
          child: const Text('Upload'),
        ),
      ],
    );
  }
}
