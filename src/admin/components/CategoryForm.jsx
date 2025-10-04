import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Grid, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { createCategory, updateCategory } from '../../services/blog/categoryService';
import { generateSlug } from '../../utils/blogUtils';

const CategoryForm = ({ open, onClose, category, onSave }) => {
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    slug: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name_en: category.name_en || '',
        name_ar: category.name_ar || '',
        description_en: category.description_en || '',
        description_ar: category.description_ar || '',
        slug: category.slug || ''
      });
    } else {
      setFormData({
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        slug: ''
      });
    }
  }, [category, open]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate slug when English name changes and no slug exists
    if (field === 'name_en' && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.name_en || !formData.name_ar) {
        throw new Error('Both English and Arabic names are required');
      }
      
      if (!formData.slug) {
        throw new Error('Slug is required');
      }
      
      if (category) {
        // Update existing category
        await updateCategory(category.id, formData);
      } else {
        // Create new category
        await createCategory(formData);
      }
      
      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.message || 'Failed to save category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {category ? 'Edit Category' : 'Create New Category'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="English Name *"
                value={formData.name_en}
                onChange={handleChange('name_en')}
                required
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Arabic Name *"
                value={formData.name_ar}
                onChange={handleChange('name_ar')}
                required
                variant="outlined"
                dir="rtl"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Slug *"
                value={formData.slug}
                onChange={handleChange('slug')}
                required
                variant="outlined"
                helperText="Used in URLs. Should be unique and URL-friendly"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="English Description"
                value={formData.description_en}
                onChange={handleChange('description_en')}
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Arabic Description"
                value={formData.description_ar}
                onChange={handleChange('description_ar')}
                multiline
                rows={3}
                variant="outlined"
                dir="rtl"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          variant="contained"
          sx={{ 
            background: 'linear-gradient(90deg, #7C3AED 0%, #F59E42 100%)',
            color: '#fff',
            fontWeight: 700,
            '&:hover': {
              background: 'linear-gradient(90deg, #6D28D9 0%, #F59E42 100%)',
            },
            '&:disabled': {
              background: '#9CA3AF',
            }
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ color: '#fff', mr: 1 }} />
              {category ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            category ? 'Update Category' : 'Create Category'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryForm;