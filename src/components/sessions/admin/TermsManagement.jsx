import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import termsService from '../../../services/termsService';

/**
 * Admin component for managing terms and conditions
 * Provides full CRUD operations for multilingual terms content
 */
const TermsManagement = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Editor state
  const [editingTerm, setEditingTerm] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [selectedType, setSelectedType] = useState('private-sessions');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [termToDelete, setTermToDelete] = useState(null);

  const termTypes = [
    { value: 'private-sessions', label: 'Private Sessions' },
    { value: 'general', label: 'General Terms' },
    { value: 'privacy-policy', label: 'Privacy Policy' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' }
  ];

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      setLoading(true);
      setError(null);
      const allTerms = await termsService.getAllTerms();
      setTerms(allTerms);
    } catch (error) {
      console.error('Error loading terms:', error);
      setError(t('sessions.booking.terms.admin.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingTerm(null);
    setEditorContent('');
    setSelectedType('private-sessions');
    setSelectedLanguage('en');
    setEditorOpen(true);
  };

  const handleEdit = async (term) => {
    try {
      setLoading(true);
      const termData = await termsService.getTerms(term.type, term.language);
      setEditingTerm(term);
      setEditorContent(termData.content || '');
      setSelectedType(term.type);
      setSelectedLanguage(term.language);
      setEditorOpen(true);
    } catch (error) {
      console.error('Error loading term for editing:', error);
      setError(t('sessions.booking.terms.admin.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!editorContent.trim()) {
        setError('Content cannot be empty');
        return;
      }

      setLoading(true);
      setError(null);
      
      await termsService.saveTerms(
        selectedType,
        selectedLanguage,
        editorContent,
        userData.uid
      );
      
      setSuccess(t('sessions.booking.terms.admin.saveSuccess'));
      setEditorOpen(false);
      setEditingTerm(null);
      setEditorContent('');
      await loadTerms();
    } catch (error) {
      console.error('Error saving terms:', error);
      setError(t('sessions.booking.terms.admin.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (term) => {
    setTermToDelete(term);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await termsService.deleteTerms(termToDelete.type, termToDelete.language);
      
      setSuccess(t('sessions.booking.terms.admin.deleteSuccess'));
      setDeleteDialogOpen(false);
      setTermToDelete(null);
      await loadTerms();
    } catch (error) {
      console.error('Error deleting terms:', error);
      setError(t('sessions.booking.terms.admin.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditingTerm(null);
    setEditorContent('');
    setError(null);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString();
  };

  // Check if user is admin
  if (!userData?.isAdmin) {
    return (
      <Alert severity="error">
        {t('admin.adminAccess')} - Access denied
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('sessions.booking.terms.admin.manageTerms')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          disabled={loading}
        >
          {t('sessions.booking.terms.admin.createTerms')}
        </Button>
      </Box>

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

      <Grid container spacing={2}>
        {terms.map((term) => (
          <Grid item xs={12} md={6} key={term.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {termTypes.find(t => t.value === term.type)?.label || term.type}
                    </Typography>
                    <Chip 
                      label={languages.find(l => l.value === term.language)?.label || term.language}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleEdit(term)} disabled={loading}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(term)} disabled={loading}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Last modified: {formatDate(term.lastModified)}
                </Typography>
                
                <Typography variant="body2" sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {term.content?.substring(0, 150)}...
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {terms.length === 0 && !loading && (
        <Alert severity="info">
          {t('sessions.booking.terms.admin.noTermsYet')} 
        </Alert>
      )}

      {/* Editor Dialog */}
      <Dialog
        open={editorOpen}
        onClose={handleCloseEditor}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle>
          {editingTerm ? t('sessions.booking.terms.admin.editTerms') : t('sessions.booking.terms.admin.createTerms')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    disabled={!!editingTerm}
                  >
                    {termTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    disabled={!!editingTerm}
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={20}
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder={t('sessions.booking.terms.admin.contentPlaceholder')}
            variant="outlined"
            sx={{ 
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditor} startIcon={<CancelIcon />}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={loading || !editorContent.trim()}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            {t('sessions.booking.terms.admin.confirmDelete')}
          </Typography>
          {termToDelete && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {termTypes.find(t => t.value === termToDelete.type)?.label} - {languages.find(l => l.value === termToDelete.language)?.label}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TermsManagement;