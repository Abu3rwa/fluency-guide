import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../../services/blog/blogService';
import { getAllCategories } from '../../services/blog/categoryService';
import BlogPostCard from '../../components/blog/BlogPostCard';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { ROUTES } from '../../routes/constants';

const BlogSection = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create a map of categories for easy lookup
  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both posts and categories in parallel
        const [postsResult, categoriesResult] = await Promise.all([
          getPosts({ 
            pageSize: 3, // Get only 3 latest posts
            sortBy: 'published_at',
            sortOrder: 'desc'
          }),
          getAllCategories()
        ]);
        
        setPosts(postsResult.posts);
        setCategories(categoriesResult);
      } catch (error) {
        console.error('Failed to fetch latest blog data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewAllPosts = () => {
    navigate(ROUTES.BLOG);
  };

  if (loading && posts.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          {t('landing.blogSection.title', 'Latest from our Blog')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('landing.blogSection.loading', 'Loading latest posts...')}
        </Typography>
      </Box>
    );
  }

  if (posts.length === 0) {
    return null; // Don't show the section if there are no posts
  }

  // Determine language from i18n
  const currentLanguage = i18n.language === 'ar' ? 'ar' : 'en';

  return (
    <Box 
      sx={{ 
        py: 8,
        bgcolor: theme.palette.background.default,
        borderRadius: theme.shape.borderRadius * 2,
      }}
    >
      <Box 
        sx={{ 
          maxWidth: 'lg', 
          mx: 'auto', 
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography 
            variant="h4" 
            component="h2"
            sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            {t('landing.blogSection.title', 'Latest from our Blog')}
          </Typography>
          
          <Button 
            variant="outlined"
            onClick={handleViewAllPosts}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            {t('landing.blogSection.viewAll', 'View All Posts')}
          </Button>
        </Box>
        
        <Grid container spacing={4}>
          {posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <BlogPostCard 
                post={post} 
                language={currentLanguage} 
                category={categoryMap[post.category_id]} // Pass the category object
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default BlogSection;