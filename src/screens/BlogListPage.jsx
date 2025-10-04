import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid, 
  ToggleButton, 
  ToggleButtonGroup,
  Chip,
  Skeleton
} from '@mui/material';
import { getPosts } from '../services/blog/blogService';
import { getAllCategories } from '../services/blog/categoryService';
import BlogPostCard from '../components/blog/BlogPostCard';
import BlogSkeletonLoader from '../components/blog/BlogSkeletonLoader';
import { useCustomTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const BlogListPage = () => {
  const { theme, isRTL } = useCustomTheme();
  const { userData } = useAuth();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('en');
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const isCurrentLanguageArabic = language === 'ar';

  // Create a map of categories for easy lookup
  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const fetchPosts = async (loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
      }
      const { posts: newPosts, lastVisible: newLastVisible } = await getPosts({ 
        pageSize: 10,
        lastVisible: loadMore ? lastVisible : null,
        category: selectedCategory || undefined,
        showDrafts: userData?.isAdmin
      });

      if (newPosts.length < 10) {
        setHasMore(false);
      }

      setPosts(prev => loadMore ? [...prev, ...newPosts] : newPosts);
      setLastVisible(newLastVisible);
    } catch (err) {
      setError('Failed to fetch posts. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, language]);

  const handleLoadMore = () => {
    if (hasMore) {
      fetchPosts(true);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setPosts([]);
    setHasMore(true);
    setLastVisible(null);
  };

  const handleLanguageChange = (event, newLanguage) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
    }
  };

  if (initialLoad) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: isCurrentLanguageArabic ? 'flex-end' : 'space-between',
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontWeight: 800,
              color: theme.palette.text.primary, // Use theme text color
              textAlign: isCurrentLanguageArabic ? 'right' : 'left',
            }}
          >
            Our Blog
          </Typography>
          
          <ToggleButtonGroup
            value={language}
            exclusive
            onChange={handleLanguageChange}
            size="small"
          >
            <ToggleButton 
              value="en" 
              sx={{ 
                borderRadius: 20,
                borderColor: theme.palette.divider,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'light' 
                    ? theme.palette.grey[300] 
                    : theme.palette.grey[700],
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.divider,
                },
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light' 
                    ? theme.palette.grey[100] 
                    : theme.palette.grey[900],
                }
              }}
            >
              EN
            </ToggleButton>
            <ToggleButton 
              value="ar" 
              sx={{ 
                borderRadius: 20,
                borderColor: theme.palette.divider,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'light' 
                    ? theme.palette.grey[300] 
                    : theme.palette.grey[700],
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.divider,
                },
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light' 
                    ? theme.palette.grey[100] 
                    : theme.palette.grey[900],
                }
              }}
            >
              AR
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Grid container spacing={4}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <BlogSkeletonLoader />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography color="error" align="center">
        {error}
      </Typography>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: isCurrentLanguageArabic ? 'flex-end' : 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography 
          variant="h3" 
          component="h1"
          sx={{ 
            fontWeight: 800,
            color: theme.palette.text.primary, // Use theme text color
            textAlign: isCurrentLanguageArabic ? 'right' : 'left',
          }}
        >
          Our Blog
        </Typography>
        
        <ToggleButtonGroup
          value={language}
          exclusive
          onChange={handleLanguageChange}
          size="small"
        >
          <ToggleButton 
            value="en" 
            sx={{ 
              borderRadius: 20,
              borderColor: theme.palette.divider,
              '&.Mui-selected': {
                backgroundColor: theme.palette.mode === 'light' 
                  ? theme.palette.grey[300] 
                  : theme.palette.grey[700],
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider,
              },
              '&:hover': {
                backgroundColor: theme.palette.mode === 'light' 
                  ? theme.palette.grey[100] 
                  : theme.palette.grey[900],
              }
            }}
          >
            EN
          </ToggleButton>
          <ToggleButton 
            value="ar" 
            sx={{ 
              borderRadius: 20,
              borderColor: theme.palette.divider,
              '&.Mui-selected': {
                backgroundColor: theme.palette.mode === 'light' 
                  ? theme.palette.grey[300] 
                  : theme.palette.grey[700],
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider,
              },
              '&:hover': {
                backgroundColor: theme.palette.mode === 'light' 
                  ? theme.palette.grey[100] 
                  : theme.palette.grey[900],
              }
            }}
          >
            AR
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Box 
        sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mb: 4,
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`, // Use theme divider color
          justifyContent: isCurrentLanguageArabic ? 'flex-end' : 'flex-start',
        }}
      >
        <Chip
          label="All Posts"
          onClick={() => handleCategorySelect(null)}
          variant={selectedCategory === null ? "filled" : "outlined"}
          sx={{ 
            borderRadius: 20,
            borderColor: theme.palette.divider,
            backgroundColor: selectedCategory === null 
              ? theme.palette.mode === 'light' 
                ? theme.palette.grey[300] 
                : theme.palette.grey[700]
              : 'transparent',
            color: selectedCategory === null 
              ? theme.palette.text.primary
              : theme.palette.text.primary, // Use theme text color
            '&:hover': {
              backgroundColor: selectedCategory === null 
                ? theme.palette.mode === 'light' 
                  ? theme.palette.grey[400] 
                  : theme.palette.grey[600]
                : theme.palette.grey[100],
            }
          }}
        />
        {categories.map(category => (
          <Chip
            key={category.id}
            label={language === 'ar' ? category.name_ar : category.name_en}
            onClick={() => handleCategorySelect(category.id)}
            variant={selectedCategory === category.id ? "filled" : "outlined"}
            sx={{ 
              borderRadius: 20,
              borderColor: theme.palette.divider,
              backgroundColor: selectedCategory === category.id 
                ? theme.palette.mode === 'light' 
                  ? theme.palette.grey[300] 
                  : theme.palette.grey[700]
                : 'transparent',
              color: selectedCategory === category.id 
                ? theme.palette.text.primary
                : theme.palette.text.primary, // Use theme text color
              '&:hover': {
                backgroundColor: selectedCategory === category.id 
                  ? theme.palette.mode === 'light' 
                    ? theme.palette.grey[400] 
                    : theme.palette.grey[600]
                  : theme.palette.grey[100],
              }
            }}
          />
        ))}
      </Box>
      
      <Grid container spacing={4}>
        {posts.map(post => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <BlogPostCard 
              post={post} 
              language={language} 
              category={categoryMap[post.category_id]} // Pass the category object
            />
          </Grid>
        ))}
      </Grid>

      {loading && (
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {Array.from({ length: 2 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <BlogSkeletonLoader />
            </Grid>
          ))}
        </Grid>
      )}

      {hasMore && !loading && (
        <Box sx={{ textAlign: isCurrentLanguageArabic ? 'right' : 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            onClick={handleLoadMore}
            sx={{ 
              borderRadius: 2,
              fontWeight: 700,
              paddingX: 4,
              paddingY: 1.5,
              backgroundColor: theme.palette.mode === 'light' 
                ? theme.palette.grey[300] 
                : theme.palette.grey[700],
              color: theme.palette.text.primary,
              boxShadow: theme.palette.mode === 'light' 
                ? '0 4px 16px rgba(0,0,0,0.1)'
                : '0 4px 16px rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'light' 
                  ? theme.palette.grey[400] 
                  : theme.palette.grey[600],
                boxShadow: theme.palette.mode === 'light' 
                  ? '0 8px 24px rgba(0,0,0,0.15)'
                  : '0 8px 24px rgba(255,255,255,0.15)',
              }
            }}
          >
            Load More
          </Button>
        </Box>
      )}

      {!hasMore && posts.length > 0 && (
        <Typography 
          align={isCurrentLanguageArabic ? "right" : "center"} 
          sx={{ 
            mt: 4, 
            color: theme.palette.text.secondary, // Use theme secondary text color
          }}
        >
          You've reached the end!
        </Typography>
      )}
      
      {!hasMore && posts.length === 0 && (
        <Typography 
          align={isCurrentLanguageArabic ? "right" : "center"} 
          sx={{ 
            mt: 4, 
            color: theme.palette.text.secondary, // Use theme secondary text color
          }}
        >
          No posts found in this category.
        </Typography>
      )}
    </Container>
  );
};

export default BlogListPage;