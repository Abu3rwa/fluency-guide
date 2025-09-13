import React, { useState, useEffect } from 'react';
import {
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Modal,
  Button,
  Link,
  Divider,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import termsService from '../../../services/termsService';
import TermsViewer from './TermsViewer';
import TermsEditor from './TermsEditor';

/**
 * Enhanced TermsAgreement Component with Admin Controls
 * 
 * Features:
 * - Bilingual support (English/Arabic) with automatic language detection
 * - Admin management capabilities for terms content
 * - Clean, modular architecture with separated concerns
 * - Real-time content loading from Firestore
 * - Fallback to default content when custom terms don't exist
 * 
 * @param {Object} props
 * @param {boolean} props.checked - Current agreement state
 * @param {Function} props.onChange - Callback for checkbox change
 * @param {boolean} props.required - Whether agreement is required (default: true)
 * @param {string} props.termsType - Type of terms to display (default: 'private-sessions')
 * @param {boolean} props.showAdminControls - Whether to show admin edit controls (default: true for admins)
 * @returns {JSX.Element}
 */
const TermsAgreement = ({
  checked = false,
  onChange,
  required = true,
  termsType = 'private-sessions',
  showAdminControls = true
}) => {
  const { t, i18n } = useTranslation();
  const { userData } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentTerms, setCurrentTerms] = useState(null);

  const currentLanguage = i18n.language || 'en';
  const isAdmin = userData?.isAdmin;
  const canEdit = isAdmin && showAdminControls;

  // Load terms content when modal opens
  useEffect(() => {
    if (openModal && !editMode) {
      loadTermsContent();
    }
  }, [openModal, termsType, currentLanguage, editMode]);

  /**
   * Load terms content from service
   */
  const loadTermsContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const terms = await termsService.getTerms(termsType, currentLanguage);
      setCurrentTerms(terms);
      setTermsContent(terms.content || '');
    } catch (error) {
      console.error('Error loading terms:', error);
      setError(t('sessions.booking.terms.modal.errorLoading'));
      setTermsContent('');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle checkbox change
   */
  const handleCheckboxChange = (event) => {
    if (onChange) {
      onChange(event.target.checked);
    }
  };

  /**
   * Open terms modal
   */
  const handleViewTerms = () => {
    setOpenModal(true);
    setEditMode(false);
  };

  /**
   * Close modal and reset state
   */
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditMode(false);
    setError(null);
  };

  /**
   * Switch to edit mode
   */
  const handleEditTerms = () => {
    setEditMode(true);
  };

  /**
   * Handle successful terms save
   */
  const handleTermsSaved = () => {
    setEditMode(false);
    loadTermsContent(); // Reload content after save
  };

  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={handleCheckboxChange}
            color="primary"
            required={required}
          />
        }
        label={
          <AgreementText
            onViewTerms={handleViewTerms}
            required={required}
            checked={checked}
            t={t}
          />
        }
        sx={{ mt: 2, mb: 2 }}
      />

      {/* Terms Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="terms-modal-title"
        aria-describedby="terms-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '85%', md: 900 },
            maxHeight: '85vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Modal Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 3,
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <Typography id="terms-modal-title" variant="h5" component="h2">
              {t('sessions.booking.terms.modal.title')}
            </Typography>
            <Box>
              {canEdit && !editMode && (
                <IconButton 
                  onClick={handleEditTerms}
                  sx={{ mr: 1 }}
                  title={t('sessions.booking.terms.admin.editTerms')}
                >
                  <EditIcon />
                </IconButton>
              )}
              <IconButton onClick={handleCloseModal}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Modal Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : editMode ? (
              <TermsEditor
                termsType={termsType}
                language={currentLanguage}
                initialContent={termsContent}
                onSave={handleTermsSaved}
                onCancel={() => setEditMode(false)}
              />
            ) : (
              <TermsViewer 
                content={termsContent}
                isDefault={currentTerms?.isDefault}
                lastModified={currentTerms?.lastModified}
              />
            )}
          </Box>

          {/* Modal Footer */}
          {!editMode && (
            <Box sx={{ 
              p: 3, 
              borderTop: 1, 
              borderColor: 'divider',
              textAlign: 'center' 
            }}>
              <Button
                onClick={handleCloseModal}
                variant="contained"
                color="primary"
                size="large"
              >
                {t('sessions.booking.terms.modal.acknowledge')}
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
};

/**
 * Agreement text component with links
 */
const AgreementText = ({ onViewTerms, required, checked, t }) => (
  <Box>
    <Typography variant="body2" component="span">
      {t('sessions.booking.terms.agreement.agreeTo')}{' '}
      <Link
        component="button"
        variant="body2"
        onClick={onViewTerms}
        sx={{ 
          cursor: 'pointer', 
          color: 'primary.main', 
          textDecoration: 'underline',
          background: 'none',
          border: 'none',
          padding: 0
        }}
      >
        {t('sessions.booking.terms.agreement.termsOfService')}
      </Link>{' '}
      {t('sessions.booking.terms.agreement.and')}{' '}
      <Link
        component="button"
        variant="body2"
        onClick={onViewTerms}
        sx={{ 
          cursor: 'pointer', 
          color: 'primary.main', 
          textDecoration: 'underline',
          background: 'none',
          border: 'none',
          padding: 0
        }}
      >
        {t('sessions.booking.terms.agreement.privacyPolicy')}
      </Link>
      .
    </Typography>
    {required && !checked && (
      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
        {t('sessions.booking.terms.agreement.required')}
      </Typography>
    )}
  </Box>
);

export default TermsAgreement;