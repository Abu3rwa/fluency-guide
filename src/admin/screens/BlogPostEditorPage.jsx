import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Grid, 
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { createPost, getPost, updatePost } from '../../services/blog/blogService';
import { getAllCategories } from '../../services/blog/categoryService';
import { generateSlug } from '../../utils/blogUtils';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext'; // Add this import

const BlogPostEditorPage = () => {
  const { theme } = useCustomTheme();
  const { userData } = useAuth(); // Get user data for author information
  const { postId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!postId;

  const [post, setPost] = useState({
    title_en: '',
    title_ar: '',
    content_en: '',
    content_ar: '',
    slug: '',
    excerpt_en: '',
    excerpt_ar: '',
    featured_image: '',
    category_id: '',
    tags: [],
    status: 'draft',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    const fetchPost = async () => {
      if (isEditing) {
        try {
          setLoading(true);
          const fetchedPost = await getPost(postId);
          if (fetchedPost) {
            setPost(fetchedPost);
          } else {
            setError('Post not found.');
          }
        } catch (err) {
          setError('Failed to fetch post.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCategories();
    fetchPost();
  }, [postId, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleSlugGeneration = () => {
    if (post.title_en) {
      setPost((prev) => ({ ...prev, slug: generateSlug(prev.title_en) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Add author information
      const postWithAuthor = {
        ...post,
        author_id: userData?.uid || 'unknown',
        author_name_en: userData?.name || userData?.email || 'Unknown Author',
        author_name_ar: userData?.name || userData?.email || 'مؤلف مجهول',
      };

      if (isEditing) {
        await updatePost(postId, postWithAuthor);
      } else {
        await createPost(postWithAuthor);
      }
      navigate('/admin/blog');
    } catch (err) {
      setError('Failed to save post. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) return (
    <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress />
    </Container>
  );
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 4, 
          fontWeight: 700,
          color: theme.palette.text.primary,
        }}
      >
        {isEditing ? 'Edit Post' : 'Create New Post'}
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}
      
      <Card sx={{ 
        borderRadius: theme.shape.borderRadius * 2,
        boxShadow: theme.components.MuiCard.styleOverrides.root.boxShadow,
      }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* English Fields */}
              <Grid item xs={12}>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  }}
                >
                  English Content
                </Typography>
                
                <TextField
                  fullWidth
                  label="Title (EN)"
                  name="title_en"
                  value={post.title_en}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                />
                
                <TextField
                  fullWidth
                  label="Content (EN)"
                  name="content_en"
                  value={post.content_en}
                  onChange={handleChange}
                  multiline
                  rows={10}
                  sx={{ mb: 3 }}
                />
                
                <TextField
                  fullWidth
                  label="Excerpt (EN)"
                  name="excerpt_en"
                  value={post.excerpt_en}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>

              {/* Arabic Fields */}
              <Grid item xs={12}>
                <Box sx={{ 
                  backgroundColor: theme.palette.mode === 'light' 
                    ? theme.palette.grey[50] 
                    : theme.palette.grey[900],
                  padding: 3,
                  borderRadius: theme.shape.borderRadius,
                  mb: 3,
                }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  >
                    المحتوى العربي (Arabic Content)
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="العنوان (AR)"
                    name="title_ar"
                    value={post.title_ar}
                    onChange={handleChange}
                    required
                    sx={{ mb: 3 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="المحتوى (AR)"
                    name="content_ar"
                    value={post.content_ar}
                    onChange={handleChange}
                    multiline
                    rows={10}
                    sx={{ mb: 3 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="نبذة (AR)"
                    name="excerpt_ar"
                    value={post.excerpt_ar}
                    onChange={handleChange}
                    multiline
                    rows={3}
                  />
                </Box>
              </Grid>

              {/* Metadata Fields */}
              <Grid item xs={12}>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  }}
                >
                  Metadata
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Slug"
                      name="slug"
                      value={post.slug}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="outlined"
                      onClick={handleSlugGeneration}
                      sx={{ 
                        height: '100%',
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.primary,
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                        }
                      }}
                    >
                      Generate from English Title
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Featured Image URL"
                      name="featured_image"
                      value={post.featured_image}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      helperText="Enter the URL of the featured image for this post"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category_id"
                        value={post.category_id}
                        onChange={handleChange}
                        required
                        label="Category"
                      >
                        <MenuItem value="">
                          <em>Select a category</em>
                        </MenuItem>
                        {categories.map(cat => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.name_en}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={post.status}
                        onChange={handleChange}
                        label="Status"
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: 2,
                  mt: 2,
                }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/admin/blog')}
                    sx={{
                      borderColor: theme.palette.divider,
                      color: theme.palette.text.primary,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
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
                      <CircularProgress size={24} sx={{ color: theme.palette.primary.contrastText }} />
                    ) : (
                      'Save Post'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default BlogPostEditorPage;