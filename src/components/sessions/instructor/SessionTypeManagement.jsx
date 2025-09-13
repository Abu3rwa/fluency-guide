import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { sessionTypeService } from '../../../services/sessionService';

const SessionTypeManagement = () => {
  const { t } = useTranslation();
  const { currentUser, userData } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Use userData for role checks and currentUser for basic auth
  const user = userData || currentUser;
  
  // State management
  const [sessionTypes, setSessionTypes] = useState([]);
  const [filteredSessionTypes, setFilteredSessionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'free', 'paid'
  const [showFilters, setShowFilters] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    duration: 30,
    price: 0,
    currency: 'LYD',
    active: true,
    category: 'general',
    requirements: '',
    maxStudents: 1
  });
  
  const [formErrors, setFormErrors] = useState({});

  // Load session types on component mount
  useEffect(() => {
    loadSessionTypes();
  }, []);
  
  // Filter session types when data or filters change
  useEffect(() => {
    filterSessionTypes();
  }, [sessionTypes, searchTerm, statusFilter, priceFilter]);
  
  const filterSessionTypes = () => {
    let filtered = [...sessionTypes];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(type => {
        const nameEn = type.name?.en || type.name || '';
        const nameAr = type.name?.ar || '';
        const descEn = type.description?.en || type.description || '';
        const descAr = type.description?.ar || '';
        
        return nameEn.toLowerCase().includes(searchLower) ||
               nameAr.toLowerCase().includes(searchLower) ||
               descEn.toLowerCase().includes(searchLower) ||
               descAr.toLowerCase().includes(searchLower) ||
               type.category?.toLowerCase().includes(searchLower);
      });
    }
    
    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(type => type.active !== false);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(type => type.active === false);
    }
    
    // Apply price filter
    if (priceFilter === 'free') {
      filtered = filtered.filter(type => type.price === 0);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter(type => type.price > 0);
    }
    
    setFilteredSessionTypes(filtered);
  };

  const loadSessionTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const types = await sessionTypeService.getAll(user);
      setSessionTypes(types || []);
    } catch (err) {
      console.error('Error loading session types:', err);
      setError(t('sessions.management.errorLoading', 'Failed to load session types'));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // At least one language name is required
    if ((!formData.name.en || formData.name.en.trim().length < 2) && 
        (!formData.name.ar || formData.name.ar.trim().length < 2)) {
      errors.name = t('sessions.instructor.sessionTypes.form.nameRequired', 'Session type name is required in at least one language');
    }
    
    // At least one language description is recommended
    if ((!formData.description.en || formData.description.en.trim().length < 10) && 
        (!formData.description.ar || formData.description.ar.trim().length < 10)) {
      errors.description = t('sessions.instructor.sessionTypes.form.descriptionRequired', 'Description is required in at least one language (min 10 characters)');
    }
    
    if (!formData.duration || formData.duration < 15 || formData.duration > 180) {
      errors.duration = t('sessions.instructor.sessionTypes.form.durationRequired', 'Duration must be between 15 and 180 minutes');
    }
    
    if (formData.price < 0 || formData.price > 1000) {
      errors.price = t('sessions.instructor.sessionTypes.form.priceRequired', 'Price must be a positive number');
    }
    
    if (!formData.currency) {
      errors.currency = t('common.required', 'This field is required');
    }
    
    if (formData.maxStudents < 1 || formData.maxStudents > 20) {
      errors.maxStudents = t('sessions.instructor.dashboard.form.validation.maxStudentsRequired', 'Maximum students must be between 1 and 20');
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Ensure we have a valid user ID for createdBy field
    const userId = currentUser?.uid;
    if (!userId) {
      setError(t('auth.userNotAuthenticated', 'User not authenticated. Please sign in as an instructor.'));
      return;
    }
    
    try {
      setFormErrors({});
      
      if (editingType) {
        await sessionTypeService.update(editingType.id, formData);
      } else {
        // Add instructorId field according to database requirements
        const sessionTypeData = {
          ...formData,
          instructorId: userId
        };
        await sessionTypeService.create(sessionTypeData, userId);
      }
      
      await loadSessionTypes();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving session type:', err);
      setError(t('sessions.management.errorSaving', 'Failed to save session type'));
    }
  };

  const handleDelete = async (typeId) => {
    if (!window.confirm(t('sessions.management.confirmDelete', 'Are you sure you want to delete this session type?'))) {
      return;
    }
    
    try {
      await sessionTypeService.delete(typeId);
      await loadSessionTypes();
      handleMenuClose();
    } catch (err) {
      console.error('Error deleting session type:', err);
      setError(t('sessions.management.errorDeleting', 'Failed to delete session type'));
    }
  };

  const handleToggleActive = async (typeId, currentActive) => {
    try {
      await sessionTypeService.update(typeId, { active: !currentActive });
      await loadSessionTypes();
    } catch (err) {
      console.error('Error toggling session type status:', err);
      setError(t('sessions.management.errorToggling', 'Failed to update session type status'));
    }
  };

  const handleOpenDialog = (type = null) => {
    setEditingType(type);
    
    if (type) {
      setFormData({
        name: {
          en: type.name?.en || type.name || '',
          ar: type.name?.ar || ''
        },
        description: {
          en: type.description?.en || type.description || '',
          ar: type.description?.ar || ''
        },
        duration: type.duration || 30,
        price: type.price || 0,
        currency: type.currency || 'LYD',
        active: type.active !== false,
        category: type.category || 'general',
        requirements: type.requirements ?? '',
        maxStudents: type.maxStudents || 1
      });
    } else {
      setFormData({
        name: { en: '', ar: '' },
        description: { en: '', ar: '' },
        duration: 30,
        price: 0,
        currency: 'LYD',
        active: true,
        category: 'general',
        requirements: '',
        maxStudents: 1
      });
    }
    
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingType(null);
    setFormErrors({});
  };

  const handleMenuOpen = (event, type) => {
    setAnchorEl(event.currentTarget);
    setSelectedType(type);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedType(null);
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parentKey, childKey] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [childKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error for this field when user starts typing
    const errorField = field.includes('.') ? field.split('.')[0] : field;
    if (formErrors[errorField]) {
      setFormErrors(prev => ({
        ...prev,
        [errorField]: null
      }));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('sessions.management.title', 'Session Types')}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {t('sessions.management.subtitle', 'Manage your session types and pricing')}
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size={isMobile ? "small" : "medium"}
        >
          {t('sessions.management.addNew', 'Add New Type')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder={t('sessions.instructor.sessionTypes.search', 'Search session types...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="medium"
              sx={{ bgcolor: 'background.paper' }}
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              select
              fullWidth
              label={t('sessions.instructor.sessionTypes.table.status', 'Status')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="medium"
            >
              <MenuItem value="all">{t('common.all', 'All')}</MenuItem>
              <MenuItem value="active">{t('sessions.instructor.sessionTypes.table.active', 'Active')}</MenuItem>
              <MenuItem value="inactive">{t('sessions.instructor.sessionTypes.table.inactive', 'Inactive')}</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              select
              fullWidth
              label={t('sessions.instructor.sessionTypes.table.price', 'Price')}
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              size="medium"
            >
              <MenuItem value="all">{t('common.all', 'All')}</MenuItem>
              <MenuItem value="free">{t('common.free', 'Free')}</MenuItem>
              <MenuItem value="paid">{t('common.paid', 'Paid')}</MenuItem>
            </TextField>
          </Grid>
          
          {(searchTerm || statusFilter !== 'all' || priceFilter !== 'all') && (
            <Grid item xs={12} sm={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  {filteredSessionTypes.length} of {sessionTypes.length} types
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPriceFilter('all');
                  }}
                >
                  {t('common.clearFilters', 'Clear Filters')}
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Session Types Grid */}
      {filteredSessionTypes.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            {sessionTypes.length === 0 ? (
              <>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  {t('sessions.instructor.sessionTypes.noSessionTypesFound', 'No Session Types Yet')}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  {t('sessions.management.noTypesDesc', 'Create your first session type to start accepting bookings')}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  {t('sessions.management.createFirst', 'Create First Session Type')}
                </Button>
              </>
            ) : (
              <>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  {t('common.noResults', 'No results found')}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  {t('common.tryDifferentFilters', 'Try adjusting your search or filters')}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPriceFilter('all');
                  }}
                >
                  {t('common.clearFilters', 'Clear Filters')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredSessionTypes.map((type) => (
            <Grid item xs={12} sm={6} md={4} key={type.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: type.active ? 1 : 0.6,
                  border: type.active ? '2px solid transparent' : '2px dashed',
                  borderColor: type.active ? 'transparent' : 'grey.400'
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {type.name?.en || type.name?.ar || type.name || t('sessions.instructor.sessionTypes.unnamedSession', 'Unnamed Session')}
                      {type.name?.ar && type.name?.en && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {type.name.ar}
                        </Typography>
                      )}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        icon={type.active ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        label={type.active ? t('sessions.management.active', 'Active') : t('sessions.management.inactive', 'Inactive')}
                        color={type.active ? 'success' : 'default'}
                        size="small"
                      />
                      
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, type)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 2, minHeight: '2.5em' }}>
                    {type.description?.en || type.description?.ar || type.description || t('sessions.management.noDescription', 'No description provided')}
                    {type.description?.ar && type.description?.en && (
                      <Box component="span" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic', direction: 'rtl', textAlign: 'right' }}>
                        {type.description.ar}
                      </Box>
                    )}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MoneyIcon fontSize="small" color="primary" />
                      <Typography variant="h6" color="primary">
                        {type.currency}{type.price}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {type.duration} min
                      </Typography>
                    </Box>
                  </Box>
                  
                  {type.category && (
                    <Chip 
                      label={type.category} 
                      size="small" 
                      variant="outlined"
                      sx={{ mb: 1 }} 
                    />
                  )}
                  
                  {type.maxStudents > 1 && (
                    <Typography variant="body2" color="text.secondary">
                      {t('sessions.management.maxStudents', 'Max students: {{count}}', { count: type.maxStudents })}
                    </Typography>
                  )}
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(type)}
                  >
                    {t('sessions.management.edit', 'Edit')}
                  </Button>
                  
                  <Button
                    size="small"
                    color={type.active ? 'warning' : 'success'}
                    onClick={() => handleToggleActive(type.id, type.active)}
                  >
                    {type.active ? t('sessions.management.deactivate', 'Deactivate') : t('sessions.management.activate', 'Activate')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleOpenDialog(selectedType);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          {t('sessions.management.edit', 'Edit')}
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleToggleActive(selectedType?.id, selectedType?.active);
          handleMenuClose();
        }}>
          {selectedType?.active ? <VisibilityOffIcon sx={{ mr: 1 }} /> : <VisibilityIcon sx={{ mr: 1 }} />}
          {selectedType?.active ? t('sessions.management.deactivate', 'Deactivate') : t('sessions.management.activate', 'Activate')}
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            handleDelete(selectedType?.id);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          {t('sessions.management.delete', 'Delete')}
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingType 
            ? t('sessions.management.editType', 'Edit Session Type') 
            : t('sessions.management.addType', 'Add New Session Type')
          }
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* English Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('sessions.instructor.sessionTypes.form.nameEn', 'Session Type Name (English)')}
                  fullWidth
                  value={formData.name.en}
                  onChange={(e) => handleInputChange('name.en', e.target.value)}
                  error={!!formErrors.name}
                  helperText={typeof formErrors.name === 'string' ? formErrors.name : undefined}
                />
              </Grid>
              
              {/* Arabic Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('sessions.instructor.sessionTypes.form.nameAr', 'Session Type Name (Arabic)')}
                  fullWidth
                  value={formData.name.ar}
                  onChange={(e) => handleInputChange('name.ar', e.target.value)}
                  error={!!formErrors.name}
                  dir="rtl"
                  InputProps={{
                    style: { direction: 'rtl', textAlign: 'right' }
                  }}
                />
              </Grid>
              
              {/* Auto-filled Instructor ID */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('sessions.admin.instructor', 'Instructor')}
                  fullWidth
                  value={user?.displayName || user?.email || 'Current User'}
                  disabled
                  helperText={t('sessions.admin.instructorAutoSet', 'Automatically set to current user')}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('sessions.management.category', 'Category')}
                  fullWidth
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  helperText={t('sessions.management.categoryHelper', 'e.g., "mathematics", "physics", "languages", "programming"')}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('sessions.management.duration', 'Duration (minutes)')}
                  type="number"
                  fullWidth
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  error={!!formErrors.duration}
                  helperText={typeof formErrors.duration === 'string' ? formErrors.duration : undefined}
                  inputProps={{ min: 15, max: 180, step: 15 }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('sessions.management.price', 'Price')}
                  type="number"
                  fullWidth
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  error={!!formErrors.price}
                  helperText={typeof formErrors.price === 'string' ? formErrors.price : undefined}
                  inputProps={{ min: 0, max: 1000, step: 5 }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('sessions.management.currency', 'Currency')}
                  fullWidth
                  select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  error={!!formErrors.currency}
                  helperText={typeof formErrors.currency === 'string' ? formErrors.currency : undefined}
                >
                  <MenuItem value="LYD">LYD (Libyan Dinar)</MenuItem>
                  <MenuItem value="USD">USD (US Dollar)</MenuItem>
                  <MenuItem value="EUR">EUR (Euro)</MenuItem>
                </TextField>
              </Grid>
              
              {/* English Description */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('sessions.instructor.sessionTypes.form.descriptionEn', 'Description (English)')}
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description.en}
                  onChange={(e) => handleInputChange('description.en', e.target.value)}
                  error={!!formErrors.description}
                  helperText={typeof formErrors.description === 'string' ? formErrors.description : t('sessions.management.descriptionHelper', 'Describe what students will learn in this session')}
                />
              </Grid>
              
              {/* Arabic Description */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('sessions.instructor.sessionTypes.form.descriptionAr', 'Description (Arabic)')}
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description.ar}
                  onChange={(e) => handleInputChange('description.ar', e.target.value)}
                  error={!!formErrors.description}
                  dir="rtl"
                  InputProps={{
                    style: { direction: 'rtl', textAlign: 'right' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('sessions.management.maxStudents', 'Maximum Students')}
                  type="number"
                  fullWidth
                  value={formData.maxStudents}
                  onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 1)}
                  error={!!formErrors.maxStudents}
                  helperText={typeof formErrors.maxStudents === 'string' ? formErrors.maxStudents : t('sessions.management.maxStudentsHelper', '1 for private sessions, more for group sessions')}
                  inputProps={{ min: 1, max: 20 }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Typography variant="subtitle2">
                    {t('sessions.admin.status', 'Status')}:
                  </Typography>
                  <Chip 
                    icon={formData.active ? <CheckCircleIcon /> : <CancelIcon />}
                    label={formData.active ? t('sessions.management.active', 'Active') : t('sessions.management.inactive', 'Inactive')}
                    color={formData.active ? 'success' : 'default'}
                    onClick={() => handleInputChange('active', !formData.active)}
                    clickable
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label={t('sessions.management.requirements', 'Prerequisites/Requirements')}
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  helperText={t('sessions.management.requirementsHelper', 'Any prerequisites or materials students need (optional)')}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={Object.keys(validateForm()).length > 0}
          >
            {editingType 
              ? t('sessions.management.updateType', 'Update Session Type')
              : t('sessions.management.createType', 'Create Session Type')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionTypeManagement;