import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../../utils/rtlUtils';

const SessionTypeManagement = ({ 
  sessionTypes = [],
  instructors = [], // Add instructors prop for dropdown
  currentUser = null, // Add current user prop
  onSessionTypeCreate = () => {},
  onSessionTypeUpdate = () => {},
  onSessionTypeDelete = () => {}
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = useRTL();
  
  // Helper function to get localized text
  const getLocalizedText = (textObj, fallback = '') => {
    if (!textObj) return fallback;
    if (typeof textObj === 'string') return textObj;
    
    const currentLang = i18n.language || 'en';
    return textObj[currentLang] || textObj.en || textObj.ar || fallback;
  };
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    name: {
      en: '',
      ar: ''
    },
    duration: 30,
    price: 0,
    currency: 'USD',
    description: {
      en: '',
      ar: ''
    },
    instructorId: currentUser?.uid || '', // Auto-set to current user
    active: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});

  const handleOpenDialog = (sessionType = null) => {
    if (sessionType) {
      setSelectedType(sessionType.id);
      setFormData({
        name: {
          en: sessionType.name?.en || sessionType.name || '',
          ar: sessionType.name?.ar || ''
        },
        duration: sessionType.duration,
        price: sessionType.price,
        currency: sessionType.currency,
        description: {
          en: sessionType.description?.en || sessionType.description || '',
          ar: sessionType.description?.ar || ''
        },
        instructorId: sessionType.instructorId || '',
        active: sessionType.active !== undefined ? sessionType.active : true
      });
    } else {
      setSelectedType(null);
      setFormData({
        name: {
          en: '',
          ar: ''
        },
        duration: 30,
        price: 0,
        currency: 'USD',
        description: {
          en: '',
          ar: ''
        },
        instructorId: currentUser?.uid || '', // Auto-set to current user
        active: true
      });
      setErrors({});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedType(null);
    setFormData({
      name: {
        en: '',
        ar: ''
      },
      duration: 30,
      price: 0,
      currency: 'USD',
      description: {
        en: '',
        ar: ''
      },
      instructorId: '',
      active: true
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle bilingual fields (name.en, name.ar, description.en, description.ar)
    if (name.includes('.')) {
      const [field, lang] = name.split('.');
      setFormData(prev => ({ 
        ...prev, 
        [field]: {
          ...prev[field],
          [lang]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSave = () => {
    // Validate form
    const newErrors = {};
    if (!formData.name.en && !formData.name.ar) {
      newErrors.name = t('sessions.instructor.sessionTypes.form.nameRequired', 'Session type name is required in at least one language');
    }
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = t('sessions.instructor.sessionTypes.form.durationRequired', 'Duration must be a positive number');
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = t('sessions.instructor.sessionTypes.form.priceRequired', 'Price must be a positive number');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (selectedType) {
      onSessionTypeUpdate(selectedType, formData);
    } else {
      onSessionTypeCreate(formData);
    }
    
    handleCloseDialog();
  };

  const handleDelete = (typeId) => {
    if (window.confirm(t('common.confirmDelete', 'Are you sure you want to delete this session type?'))) {
      onSessionTypeDelete(typeId);
    }
  };

  // Filter session types for search
  const filteredTypes = sessionTypes.filter(type => {
    const searchLower = searchTerm.toLowerCase();
    
    // Get the current language name and description
    const nameEn = type.name?.en || type.name || '';
    const nameAr = type.name?.ar || '';
    const descEn = type.description?.en || type.description || '';
    const descAr = type.description?.ar || '';
    
    return nameEn.toLowerCase().includes(searchLower) ||
           nameAr.toLowerCase().includes(searchLower) ||
           descEn.toLowerCase().includes(searchLower) ||
           descAr.toLowerCase().includes(searchLower);
  });

  return (
    <Paper sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {t('sessions.admin.sessionTypeManagement', 'Session Type Management')}
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t('sessions.admin.addSessionType', 'Add Session Type')}
        </Button>
      </Box>
      
      <TextField
        label={t('sessions.admin.searchSessionTypes', 'Search Session Types')}
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('sessions.admin.sessionType', 'Session Type')}</TableCell>
              <TableCell>{t('sessions.admin.duration', 'Duration')}</TableCell>
              <TableCell>{t('sessions.admin.price', 'Price')}</TableCell>
              <TableCell>{t('sessions.admin.status', 'Status')}</TableCell>
              <TableCell align="right">{t('sessions.admin.actions', 'Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell component="th" scope="row">
                  <Typography variant="subtitle1">
                    {getLocalizedText(type.name, 'Unnamed Session Type')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getLocalizedText(type.description, t('sessions.admin.noDescription', 'No description provided'))}
                  </Typography>
                </TableCell>
                <TableCell>{type.duration} {t('sessions.admin.minutes', 'minutes')}</TableCell>
                <TableCell>{type.currency}{type.price}</TableCell>
                <TableCell>
                  <Chip 
                    label={type.active ? t('sessions.admin.active', 'Active') : t('sessions.admin.inactive', 'Inactive')} 
                    color={type.active ? 'success' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpenDialog(type)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleDelete(type.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t('sessions.admin.noSessionTypesFound', 'No session types found. Add session types to get started.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedType ? t('sessions.admin.editSessionType', 'Edit Session Type') : t('sessions.admin.addNewSessionType', 'Add New Session Type')}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* English Name */}
            <TextField
              autoFocus
              margin="dense"
              name="name.en"
              label={t('sessions.admin.sessionTypeNameEn', 'Session Type Name (English)')}
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name.en}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }}
            />
            
            {/* Arabic Name */}
            <TextField
              margin="dense"
              name="name.ar"
              label={t('sessions.admin.sessionTypeNameAr', 'Session Type Name (Arabic)')}
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name.ar}
              onChange={handleInputChange}
              sx={{ mb: 2, direction: 'rtl', textAlign: 'right' }}
              InputProps={{
                style: { direction: 'rtl', textAlign: 'right' }
              }}
            />
            
            {/* Instructor Info - Auto-filled */}
            <TextField
              margin="dense"
              name="instructorId"
              label={t('sessions.admin.instructor', 'Instructor')}
              type="text"
              fullWidth
              variant="outlined"
              value={currentUser?.displayName || currentUser?.email || 'Current User'}
              disabled
              helperText={t('sessions.admin.instructorAutoSet', 'Automatically set to current user')}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                name="duration"
                label={t('sessions.admin.durationMinutes', 'Duration (minutes)')}
                type="number"
                fullWidth
                variant="outlined"
                value={formData.duration}
                onChange={handleInputChange}
                error={!!errors.duration}
                helperText={errors.duration}
              />
              
              <TextField
                name="price"
                label={t('sessions.admin.priceLabel', 'Price')}
                type="number"
                fullWidth
                variant="outlined"
                value={formData.price}
                onChange={handleInputChange}
                error={!!errors.price}
                helperText={errors.price}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{formData.currency}</InputAdornment>
                }}
              />
              
              <FormControl fullWidth>
                <InputLabel id="currency-label">{t('sessions.admin.currency', 'Currency')}</InputLabel>
                <Select
                  labelId="currency-label"
                  value={formData.currency}
                  label={t('sessions.admin.currency', 'Currency')}
                  name="currency"
                  onChange={handleInputChange}
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                  <MenuItem value="LYD">LYD</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* English Description */}
            <TextField
              name="description.en"
              label={t('sessions.admin.descriptionEn', 'Description (English)')}
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.description.en}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            
            {/* Arabic Description */}
            <TextField
              name="description.ar"
              label={t('sessions.admin.descriptionAr', 'Description (Arabic)')}
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.description.ar}
              onChange={handleInputChange}
              sx={{ mb: 2, direction: 'rtl', textAlign: 'right' }}
              InputProps={{
                style: { direction: 'rtl', textAlign: 'right' }
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
              <Typography variant="subtitle2">
                {t('sessions.admin.status', 'Status')}:
              </Typography>
              <Chip 
                label={formData.active ? t('sessions.admin.active', 'Active') : t('sessions.admin.inactive', 'Inactive')} 
                color={formData.active ? 'success' : 'default'} 
                size="small" 
              />
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
              >
                {formData.active ? t('sessions.admin.deactivate', 'Deactivate') : t('sessions.admin.activate', 'Activate')}
              </Button>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('sessions.admin.cancel', 'Cancel')}</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {selectedType ? t('sessions.admin.saveChanges', 'Save Changes') : t('sessions.admin.createSessionType', 'Create Session Type')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SessionTypeManagement;