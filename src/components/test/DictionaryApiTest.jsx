// src/components/test/DictionaryApiTest.jsx
// Test component for Dictionary API integration

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { VolumeUp, PlayArrow, Stop } from '@mui/icons-material';
import studentDictionaryApiService from '../../services/student-services/studentDictionaryApiService';
import studentAudioService from '../../services/student-services/studentAudioService';

const DictionaryApiTest = () => {
  const [word, setWord] = useState('');
  const [apiData, setApiData] = useState(null);
  const [audioSources, setAudioSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);

  const testDictionaryApi = async () => {
    if (!word.trim()) {
      setError('Please enter a word to test');
      return;
    }

    setLoading(true);
    setError(null);
    setApiData(null);
    setAudioSources([]);

    try {
      console.log(`🧪 Testing Dictionary API for word: ${word}`);
      
      // Test Dictionary API service
      const data = await studentDictionaryApiService.fetchWordData(word);
      setApiData(data);

      // Test Audio service
      const sources = await studentAudioService.getPriorityAudioSources(word);
      setAudioSources(sources);

      console.log('✅ Test completed successfully');
    } catch (error) {
      console.error('❌ Test failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (audioUrl, type) => {
    if (!audioUrl) {
      setError('No audio URL available');
      return;
    }

    try {
      setPlayingAudio(type);
      await studentAudioService.playAudio(audioUrl);
    } catch (error) {
      console.error('❌ Audio playback error:', error);
      setError('Failed to play audio');
    } finally {
      setPlayingAudio(null);
    }
  };

  const clearCache = async () => {
    try {
      await studentDictionaryApiService.clearAllCache();
      setError(null);
      alert('Cache cleared successfully!');
    } catch (error) {
      setError('Failed to clear cache');
    }
  };

  const getCacheStats = () => {
    const stats = studentDictionaryApiService.getCacheStats();
    alert(`Cache Stats:\nTotal: ${stats.totalEntries}\nValid: ${stats.validEntries}\nExpired: ${stats.expiredEntries}`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Dictionary API Integration Test
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Configuration
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Enter word to test"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g., subscribe, fight, cry"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={testDictionaryApi}
              disabled={loading || !word.trim()}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={20} /> : 'Test API'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={clearCache}>
              Clear Cache
            </Button>
            <Button variant="outlined" onClick={getCacheStats}>
              Cache Stats
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {apiData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              API Response Data
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Word: <strong>{apiData.word}</strong>
            </Typography>
            
            {apiData.phonetic && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Phonetic: <strong>{apiData.phonetic}</strong>
              </Typography>
            )}

            {apiData.pronunciations && apiData.pronunciations.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Pronunciations ({apiData.pronunciations.length}):
                </Typography>
                <List dense>
                  {apiData.pronunciations.map((pronunciation, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={pronunciation.type} 
                              size="small" 
                              color={pronunciation.verified ? "primary" : "default"}
                            />
                            <Typography variant="body2">
                              {pronunciation.text}
                            </Typography>
                            {pronunciation.verified && (
                              <Chip label="Verified" size="small" color="success" />
                            )}
                          </Box>
                        }
                        secondary={`Source: ${pronunciation.source}`}
                      />
                      {pronunciation.audio && (
                        <Button
                          size="small"
                          startIcon={playingAudio === pronunciation.type ? <Stop /> : <PlayArrow />}
                          onClick={() => playAudio(pronunciation.audio, pronunciation.type)}
                          disabled={playingAudio !== null}
                        >
                          {playingAudio === pronunciation.type ? 'Playing' : 'Play'}
                        </Button>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {apiData.definitions && apiData.definitions.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Definitions:
                </Typography>
                {apiData.definitions.map((meaning, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Chip label={meaning.partOfSpeech} size="small" sx={{ mb: 1 }} />
                    {meaning.definitions.map((def, defIndex) => (
                      <Typography key={defIndex} variant="body2" sx={{ ml: 2, mb: 1 }}>
                        {defIndex + 1}. {def.definition}
                        {def.example && (
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                            Example: "{def.example}"
                          </Typography>
                        )}
                      </Typography>
                    ))}
                  </Box>
                ))}
              </Box>
            )}

            {apiData.synonyms && apiData.synonyms.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Synonyms:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {apiData.synonyms.map((synonym, index) => (
                    <Chip key={index} label={synonym} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {apiData.antonyms && apiData.antonyms.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Antonyms:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {apiData.antonyms.map((antonym, index) => (
                    <Chip key={index} label={antonym} size="small" variant="outlined" color="error" />
                  ))}
                </Box>
              </Box>
            )}

            {apiData.fallback && (
              <Alert severity="warning">
                This data was generated from fallback sources (API was unavailable)
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {audioSources.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Audio Sources ({audioSources.length})
            </Typography>
            
            <List dense>
              {audioSources.map((source, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={source.type} 
                          size="small" 
                          color={source.verified ? "primary" : "default"}
                        />
                        <Typography variant="body2">
                          {source.text}
                        </Typography>
                        <Chip label={source.source} size="small" variant="outlined" />
                      </Box>
                    }
                    secondary={source.audio || 'No audio URL available'}
                  />
                  {source.audio && (
                    <Button
                      size="small"
                      startIcon={playingAudio === source.type ? <Stop /> : <VolumeUp />}
                      onClick={() => playAudio(source.audio, source.type)}
                      disabled={playingAudio !== null}
                    >
                      {playingAudio === source.type ? 'Playing' : 'Play'}
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DictionaryApiTest; 