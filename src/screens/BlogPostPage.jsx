import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Chip, 
  Divider,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
  Alert
} from '@mui/material';
import { getPostBySlug } from '../services/blog/blogService';
import { getCategory } from '../services/blog/categoryService';
import { formatDate, estimateReadTime } from '../utils/blogUtils';
import { sanitizeContent } from '../utils/contentSanitization';
import BlogImage from '../components/blog/BlogImage';
import BlogSkeletonLoader from '../components/blog/BlogSkeletonLoader';
import { useCustomTheme } from '../contexts/ThemeContext';

const BlogPostPage = () => {
  const { theme, isRTL } = useCustomTheme();
  const { lang, slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(lang === 'ar' ? 'ar' : 'en');

  useEffect(() => {
    setCurrentLanguage(lang === 'ar' ? 'ar' : 'en');
  }, [lang]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedPost = await getPostBySlug(slug);
        if (fetchedPost) {
          setPost(fetchedPost);
          
          // Fetch category information
          if (fetchedPost.category_id) {
            try {
              const fetchedCategory = await getCategory(fetchedPost.category_id);
              setCategory(fetchedCategory);
            } catch (categoryError) {
              console.error('Failed to fetch category:', categoryError);
            }
          }
        } else {
          setError('Post not found.');
        }
      } catch (err) {
        setError('Failed to fetch post.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleLanguageChange = (event, newLanguage) => {
    if (newLanguage !== null) {
      setCurrentLanguage(newLanguage);
      navigate(`/blog/${newLanguage}/${slug}`);
    }
  };

  if (loading) return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <BlogSkeletonLoader />
    </Container>
  );
  
  if (error) return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );
  
  if (!post) return null;

  // Check if content exists for the current language
  const title = post[`title_${currentLanguage}`] || post.title_en || post.title_ar || 'Untitled';
  const content = post[`content_${currentLanguage}`] || post.content_en || post.content_ar || 'No content available';
  const authorName = post[`author_name_${currentLanguage}`] || post.author_name_en || post.author_name_ar || 'Unknown Author';
  
  // Fallback to English if current language content doesn't exist
  const hasArabicContent = post.title_ar && post.content_ar && post.author_name_ar;
  const hasEnglishContent = post.title_en && post.content_en && post.author_name_en;

  const formattedDate = formatDate(post.published_at, currentLanguage === 'ar' ? 'ar-EG' : 'en-US');
  const readTime = estimateReadTime(content);
  const isCurrentLanguageArabic = currentLanguage === 'ar';
  
  // Get category name in the correct language
  const categoryName = category 
    ? (currentLanguage === 'ar' ? category.name_ar : category.name_en)
    : 'Uncategorized';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box 
        sx={{ 
          backgroundColor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: theme.components.MuiCard.styleOverrides.root.boxShadow,
          padding: { xs: 2, sm: 4 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
          }}
        >
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontWeight: 800,
              lineHeight: 1.3,
              color: theme.palette.primary.main,
              textAlign: isCurrentLanguageArabic ? 'right' : 'left',
            }}
          >
            {title}
          </Typography>
          
          <ToggleButtonGroup
            value={currentLanguage}
            exclusive
            onChange={handleLanguageChange}
            size="small"
            sx={{
              backgroundColor: theme.palette.background.default,
              borderRadius: 2,
            }}
          >
            <ToggleButton 
              value="en" 
              disabled={!hasEnglishContent}
              sx={{ 
                borderRadius: 2,
                borderColor: theme.palette.divider,
                '&.Mui-disabled': {
                  opacity: 0.5,
                },
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  borderColor: theme.palette.primary.main,
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
              disabled={!hasArabicContent}
              sx={{ 
                borderRadius: 2,
                borderColor: theme.palette.divider,
                '&.Mui-disabled': {
                  opacity: 0.5,
                },
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  borderColor: theme.palette.primary.main,
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
            gap: 2,
            mb: 4,
            pb: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            justifyContent: isCurrentLanguageArabic ? 'flex-end' : 'flex-start',
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            By {authorName}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {formattedDate}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {readTime} min read
          </Typography>
        </Box>
        
        {post.featured_image && (
          <BlogImage 
            src={post.featured_image} 
            alt={title} 
            sx={{ 
              width: '100%',
              height: 'auto',
              borderRadius: theme.shape.borderRadius,
              mb: 4,
            }} 
          />
        )}
        
        <Box
          sx={{
            fontSize: '1.1rem',
            lineHeight: 1.7,
            color: theme.palette.text.primary,
            textAlign: isCurrentLanguageArabic ? 'right' : 'left',
            direction: isCurrentLanguageArabic ? 'rtl' : 'ltr',
            '& h2': {
              fontSize: '1.8rem',
              fontWeight: 700,
              margin: '30px 0 20px',
              color: theme.palette.primary.main,
              textAlign: isCurrentLanguageArabic ? 'right' : 'left',
            },
            '& h3': {
              fontSize: '1.5rem',
              fontWeight: 600,
              margin: '25px 0 15px',
              color: theme.palette.secondary.main,
              textAlign: isCurrentLanguageArabic ? 'right' : 'left',
            },
            '& h4': {
              fontSize: '1.3rem',
              fontWeight: 600,
              margin: '20px 0 15px',
              color: theme.palette.primary.main,
              textAlign: isCurrentLanguageArabic ? 'right' : 'left',
            },
            '& p': {
              margin: '0 0 20px',
              textAlign: isCurrentLanguageArabic ? 'right' : 'left',
            },
            '& ul, & ol': {
              margin: '0 0 20px',
              paddingLeft: isCurrentLanguageArabic ? 0 : 30,
              paddingRight: isCurrentLanguageArabic ? 30 : 0,
              textAlign: isCurrentLanguageArabic ? 'right' : 'left',
            },
            '& li': {
              margin: '0 0 10px',
              textAlign: isCurrentLanguageArabic ? 'right' : 'left',
            },
            '& a': {
              color: theme.palette.primary.main,
              textDecoration: 'none',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: theme.shape.borderRadius,
              margin: '20px 0',
            },
            '& blockquote': {
              borderLeft: isCurrentLanguageArabic ? 'none' : `4px solid ${theme.palette.primary.main}`,
              borderRight: isCurrentLanguageArabic ? `4px solid ${theme.palette.primary.main}` : 'none',
              paddingLeft: isCurrentLanguageArabic ? 0 : 20,
              paddingRight: isCurrentLanguageArabic ? 20 : 0,
              margin: '20px 0',
              backgroundColor: theme.palette.mode === 'light' 
                ? theme.palette.grey[50] 
                : theme.palette.grey[900],
              fontStyle: 'italic',
              padding: '10px 20px',
              textAlign: isCurrentLanguageArabic ? 'right' : 'left',
              color: theme.palette.text.primary,
            },
          }}
          dangerouslySetInnerHTML={{ __html: sanitizeContent(content) }}
        />
        
        <Divider sx={{ my: 4 }} />
        
        <Box 
          sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: isCurrentLanguageArabic ? 'flex-end' : 'flex-start',
          }}
        >
          <Chip
            label={categoryName}
            sx={{ 
              borderRadius: 20,
              backgroundColor: theme.palette.mode === 'light' 
                ? theme.palette.grey[100] 
                : theme.palette.grey[900],
              fontWeight: 500,
              color: theme.palette.text.primary,
            }}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default BlogPostPage;