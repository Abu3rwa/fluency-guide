import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import termsService from '../../../services/termsService';
import TermsViewer from './TermsViewer';

/**
 * TermsEditor Component
 * Provides editing interface for terms content with live preview
 * 
 * @param {Object} props
 * @param {string} props.termsType - Type of terms being edited
 * @param {string} props.language - Language code for the terms
 * @param {string} props.initialContent - Initial content to edit
 * @param {Function} props.onSave - Callback when terms are saved
 * @param {Function} props.onCancel - Callback when editing is cancelled
 * @returns {JSX.Element}
 */
const TermsEditor = ({
  termsType,
  language,
  initialContent = '',
  onSave,
  onCancel
}) => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 = Edit, 1 = Preview

  /**
   * Handle saving terms content
   */
  const handleSave = async () => {
    if (!content.trim()) {
      setError('Content cannot be empty');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      await termsService.saveTerms(
        termsType,
        language,
        content,
        userData.uid
      );
      
      setSuccess(t('sessions.booking.terms.admin.saveSuccess'));
      
      // Call the onSave callback after a short delay to show success message
      setTimeout(() => {
        if (onSave) {
          onSave();
        }
      }, 1000);
    } catch (error) {
      console.error('Error saving terms:', error);
      setError(t('sessions.booking.terms.admin.saveError'));
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle cancelling edit
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Editor Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('sessions.booking.terms.admin.termsEditor')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Type: {termsType} | Language: {language}
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Edit" />
          <Tab label="Preview" icon={<PreviewIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Content Area */}
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: '400px' }}>
        {activeTab === 0 ? (
          /* Edit Mode */
          <TextField
            fullWidth
            multiline
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('sessions.booking.terms.admin.contentPlaceholder')}
            variant="outlined"
            sx={{
              height: '100%',
              minHeight: '400px',
              '& .MuiInputBase-root': {
                height: '100%',
                minHeight: '400px',
                alignItems: 'flex-start'
              },
              '& .MuiInputBase-input': {
                height: '100% !important',
                minHeight: '380px !important',
                overflow: 'auto !important',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                padding: '12px'
              }
            }}
          />
        ) : (
          /* Preview Mode */
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              height: '100%', 
              minHeight: '400px',
              overflow: 'auto',
              backgroundColor: 'grey.50'
            }}
          >
            <Typography variant="subtitle2" gutterBottom color="textSecondary">
              Preview:
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TermsViewer content={content} />
          </Paper>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 2, 
        mt: 3,
        pt: 2,
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Button 
          onClick={handleCancel} 
          startIcon={<CancelIcon />}
          disabled={loading}
        >
          {t('common.cancel')}
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          startIcon={<SaveIcon />}
          disabled={loading || !content.trim()}
        >
          {loading ? t('common.saving') : t('common.save')}
        </Button>
      </Box>

      {/* Editor Help */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="textSecondary" component="div">
          <strong>Markdown Support:</strong>
          <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2, fontSize: 'inherit' }}>
            <li><strong>Headers:</strong> # Main Title, ## Section, ### Subsection</li>
            <li><strong>Lists:</strong> - Bullet points or * Bullet points</li>
            <li><strong>Bold text:</strong> **bold text** or __bold text__</li>
            <li><strong>Italic text:</strong> *italic text* or _italic text_</li>
            <li><strong>Line breaks:</strong> Leave empty line between paragraphs</li>
            <li><strong>Example:</strong></li>
          </Box>
          <Box component="pre" sx={{ 
            mt: 1, 
            p: 1, 
            bgcolor: 'grey.100', 
            borderRadius: 1, 
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            overflow: 'auto'
          }}>
{`# Terms of Service

## 1. Introduction
Welcome to our platform.

## 2. User Responsibilities
- Follow community guidelines
- Respect other users
- **Important:** Keep your account secure

*Last updated: Today*`}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default TermsEditor;