import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip, 
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import { getPosts, deletePost, recoverPost } from '../../services/blog/blogService';
import { formatDate } from '../../utils/blogUtils';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { createSampleCategories } from '../../utils/blogUtils'; // Add this import

const BlogDashboardPage = () => {
  const { theme } = useCustomTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add this function
  const handleCreateSampleCategories = async () => {
    try {
      await createSampleCategories();
      alert('Sample categories created successfully!');
    } catch (error) {
      console.error('Error creating categories:', error);
      alert('Error creating categories. Check console for details.');
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // Fetch all posts regardless of status for the admin view
        const { posts: fetchedPosts } = await getPosts({ pageSize: 100 }); // Adjust pageSize as needed
        setPosts(fetchedPosts);
      } catch (err) {
        setError('Failed to fetch posts. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to soft-delete this post?')) {
      try {
        await deletePost(postId);
        setPosts(posts.map(p => p.id === postId ? { ...p, is_deleted: true } : p));
      } catch (err) {
        alert('Failed to delete post.');
      }
    }
  };

  const handleRecover = async (postId) => {
    if (window.confirm('Are you sure you want to recover this post?')) {
      try {
        await recoverPost(postId);
        setPosts(posts.map(p => p.id === postId ? { ...p, is_deleted: false } : p));
      } catch (err) {
        alert('Failed to recover post.');
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading posts...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Blog Management
        </Typography>
        <Box>
          {/* Add this button */}
          <Button
            variant="outlined"
            onClick={handleCreateSampleCategories}
            sx={{ mr: 2 }}
          >
            Create Sample Categories
          </Button>
          <Button
            component={Link}
            to="/admin/blog/new"
            variant="contained"
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
            Create New Post
          </Button>
        </Box>
      </Box>

      <Paper 
        sx={{ 
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: theme.components.MuiCard.styleOverrides.root.boxShadow,
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[900] }}>
                <TableCell sx={{ fontWeight: 600 }}>Title (EN)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((post) => (
                <TableRow 
                  key={post.id} 
                  sx={{ 
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
                    },
                    opacity: post.is_deleted ? 0.6 : 1,
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {post.title_en}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={post.status}
                      size="small"
                      sx={{ 
                        backgroundColor: post.status === 'published' 
                          ? theme.palette.success.light 
                          : theme.palette.warning.light,
                        color: post.status === 'published' 
                          ? theme.palette.success.dark 
                          : theme.palette.warning.dark,
                        fontWeight: 500,
                        mr: 1,
                      }}
                    />
                    {post.is_deleted && (
                      <Chip
                        label="Deleted"
                        size="small"
                        sx={{ 
                          backgroundColor: theme.palette.error.light,
                          color: theme.palette.error.dark,
                          fontWeight: 500,
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {formatDate(post.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {formatDate(post.updated_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        component={Link}
                        to={`/admin/blog/edit/${post.id}`}
                        sx={{ 
                          color: theme.palette.primary.main,
                          mr: 1,
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {!post.is_deleted ? (
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(post.id)}
                          sx={{ 
                            color: theme.palette.error.main,
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Recover">
                        <IconButton
                          onClick={() => handleRecover(post.id)}
                          sx={{ 
                            color: theme.palette.success.main,
                          }}
                        >
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default BlogDashboardPage;