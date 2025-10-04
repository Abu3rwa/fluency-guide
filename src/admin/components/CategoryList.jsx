import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Tooltip, 
  Box, 
  Typography,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { getAllCategories, deleteCategory } from '../../services/blog/categoryService';
import { useCustomTheme } from '../../contexts/ThemeContext';

const CategoryList = ({ onEdit, onDelete }) => {
  const { theme } = useCustomTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCategories = await getAllCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await deleteCategory(categoryId);
        onDelete(categoryId);
        fetchCategories(); // Refresh the list
      } catch (err) {
        console.error('Error deleting category:', err);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (categories.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No categories found. Create your first category to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: theme.shape.borderRadius * 2 }}>
      <Table sx={{ minWidth: 650 }} aria-label="categories table">
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
            <TableCell sx={{ fontWeight: 700 }}>English Name</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Arabic Name</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Slug</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
            <TableCell sx={{ fontWeight: 700, width: 120 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((category) => (
            <TableRow
              key={category.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {category.name_en}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" sx={{ fontWeight: 500 }} dir="rtl">
                  {category.name_ar}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={category.slug} 
                  size="small" 
                  sx={{ 
                    backgroundColor: theme.palette.mode === 'light' 
                      ? theme.palette.grey[200] 
                      : theme.palette.grey[700],
                    fontWeight: 500,
                    fontSize: '0.8rem'
                  }} 
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                  {category.description_en || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton 
                      onClick={() => onEdit(category)}
                      sx={{ 
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'light' 
                            ? theme.palette.grey[100] 
                            : theme.palette.grey[900]
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      onClick={() => handleDelete(category.id)}
                      sx={{ 
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'light' 
                            ? theme.palette.grey[100] 
                            : theme.palette.grey[900]
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CategoryList;