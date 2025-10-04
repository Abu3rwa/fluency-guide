import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper, 
  Alert,
  CircularProgress,
  Snackbar,
  Alert as SnackbarAlert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import CategoryList from '../components/CategoryList';
import CategoryForm from '../components/CategoryForm';
import { getAllCategories, createCategory } from '../../services/blog/categoryService';
import { createSampleCategories } from '../../utils/blogUtils';
import { useCustomTheme } from '../../contexts/ThemeContext';

const BlogCategoryManagementPage = () => {
  const { theme } = useCustomTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await getAllCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories. Please check the console for details.');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateSampleCategories = async () => {
    try {
      setLoading(true);
      setMessage(null);
      setError(null);
      await createSampleCategories();
      setMessage('Sample categories created successfully!');
      fetchCategories(); // Refresh the category list
      setSnackbar({
        open: true,
        message: 'Sample categories created successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error creating categories:', err);
      setError('Failed to create sample categories. Please check the console for details.');
      setSnackbar({
        open: true,
        message: 'Failed to create sample categories.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleDeleteCategory = (categoryId) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    setSnackbar({
      open: true,
      message: 'Category deleted successfully!',
      severity: 'success'
    });
  };

  const handleSaveCategory = async () => {
    try {
      await fetchCategories(); // Refresh the category list
      setSnackbar({
        open: true,
        message: editingCategory 
          ? 'Category updated successfully!' 
          : 'Category created successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error refreshing categories:', err);
      setSnackbar({
        open: true,
        message: 'Category saved, but failed to refresh list.',
        severity: 'warning'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Blog Category Management
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/admin/blog')}
          sx={{ 
            borderRadius: 2,
            fontWeight: 700,
            paddingX: 3,
            paddingY: 1,
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
            '&:hover': {
              borderColor: theme.palette.primary.main,
            }
          }}
        >
          Back to Blog Management
        </Button>
      </Box>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper 
        sx={{ 
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: theme.components.MuiCard.styleOverrides.root.boxShadow,
          p: 4,
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Manage Categories
          </Typography>
          <Button
            variant="contained"
            onClick={handleCreateCategory}
            startIcon={<AddIcon />}
            sx={{ 
              borderRadius: 2,
              fontWeight: 700,
              paddingX: 3,
              paddingY: 1,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: theme.palette.primary.contrastText,
              boxShadow: '0 4px 16px rgba(124,58,237,0.12)',
              '&:hover': {
                background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                boxShadow: '0 8px 24px rgba(124,58,237,0.16)',
              }
            }}
          >
            Add New Category
          </Button>
        </Box>

        <CategoryList 
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
        />
      </Paper>

      <Paper 
        sx={{ 
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: theme.components.MuiCard.styleOverrides.root.boxShadow,
          p: 4,
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Create Sample Categories
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, color: theme.palette.text.secondary }}>
          Click the button below to create sample blog categories that you can use for your posts.
        </Typography>
        
        <Button
          variant="contained"
          onClick={handleCreateSampleCategories}
          disabled={loading}
          sx={{ 
            borderRadius: 2,
            fontWeight: 700,
            paddingX: 4,
            paddingY: 1.5,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: theme.palette.primary.contrastText,
            boxShadow: '0 4px 16px rgba(124,58,237,0.12)',
            '&:hover': {
              background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
              boxShadow: '0 8px 24px rgba(124,58,237,0.16)',
            },
            '&:disabled': {
              background: theme.palette.grey[400],
            }
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ color: theme.palette.primary.contrastText, mr: 1 }} />
              Creating...
            </>
          ) : (
            'Create Sample Categories'
          )}
        </Button>
        
        <Box sx={{ mt: 4, p: 3, backgroundColor: theme.palette.grey[100], borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Sample Categories That Will Be Created:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Education / التعليم
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Language Tips / نصائح اللغة
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Platform Updates / تحديثات المنصة
          </Typography>
          <Typography variant="body2">
            • Success Stories / قصص النجاح
          </Typography>
        </Box>
      </Paper>

      <CategoryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        category={editingCategory}
        onSave={handleSaveCategory}
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <SnackbarAlert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </SnackbarAlert>
      </Snackbar>
    </Container>
  );
};

export default BlogCategoryManagementPage;