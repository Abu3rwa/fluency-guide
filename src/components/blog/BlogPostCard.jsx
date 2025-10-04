import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Chip, 
  Box, 
  Divider 
} from '@mui/material';
import { estimateReadTime, formatDate } from '../../utils/blogUtils';
import BlogImage from './BlogImage';
import { useCustomTheme } from '../../contexts/ThemeContext';

/**
 * @param {{ post: import('../../services/blog/types').BlogPost, language: 'en' | 'ar', category?: import('../../services/blog/types').BlogCategory }} props
 */
const BlogPostCard = ({ post, language, category }) => {
  const { theme, isRTL } = useCustomTheme();
  const isCurrentLanguageArabic = language === 'ar';

  const {
    slug,
    featured_image,
    category_id,
  } = post;

  const title = post[`title_${language}`];
  const excerpt = post[`excerpt_${language}`];
  const authorName = post[`author_name_${language}`];
  const readTime = estimateReadTime(post[`content_${language}`]);
  const formattedDate = formatDate(post.published_at, language === 'ar' ? 'ar-EG' : 'en-US');

  // Handle missing title
  if (!title) return null;

  // Determine category display name
  const categoryName = category 
    ? (language === 'ar' ? category.name_ar : category.name_en)
    : 'Category'; // Fallback if category is not provided

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.palette.mode === 'light' 
            ? '0 12px 24px rgba(124,58,237,0.12)' 
            : '0 12px 24px rgba(167,139,250,0.12)', // Lighter shadow for dark mode
          borderColor: theme.palette.divider,
        },
        borderRadius: theme.shape.borderRadius * 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper, // Use theme background
      }}
    >
      {featured_image && (
        <Link 
          to={`/blog/${language}/${slug}`} 
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <BlogImage 
            src={featured_image} 
            alt={title} 
            sx={{ 
              height: 200,
              objectFit: 'cover',
            }} 
          />
        </Link>
      )}
      
      <CardContent 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 3,
        }}
      >
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: isCurrentLanguageArabic ? 'flex-end' : 'space-between',
            alignItems: 'center',
            marginBottom: 2,
          }}
        >
          <Chip 
            label={categoryName}
            size="small"
            sx={{ 
              backgroundColor: theme.palette.mode === 'light' 
                ? theme.palette.grey[100] 
                : theme.palette.grey[900],
              fontWeight: 500,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: theme.palette.text.primary, // Use theme text color
            }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary, // Use theme secondary text color
              fontSize: '0.8rem',
              textAlign: isCurrentLanguageArabic ? 'right' : 'left',
            }}
          >
            {formattedDate}
          </Typography>
        </Box>
        
        <Typography 
          variant="h5" 
          component="h2"
          sx={{ 
            marginBottom: 2,
            fontWeight: 600,
            lineHeight: 1.4,
            color: theme.palette.primary.main, // Use primary color from theme
            textAlign: isCurrentLanguageArabic ? 'right' : 'left',
          }}
        >
          <Link 
            to={`/blog/${language}/${slug}`}
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
            }}
          >
            {title}
          </Link>
        </Typography>
        
        {excerpt && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary, // Use theme secondary text color
              lineHeight: 1.6,
              marginBottom: 3,
              flexGrow: 1,
              textAlign: isCurrentLanguageArabic ? 'right' : 'left',
            }}
          >
            {excerpt}
          </Typography>
        )}
        
        <Divider 
          sx={{ 
            marginY: 2,
            borderColor: theme.palette.divider, // Use theme divider color
          }} 
        />
        
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: isCurrentLanguageArabic ? 'flex-end' : 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 500,
              color: theme.palette.text.secondary, // Use theme secondary text color
              textAlign: isCurrentLanguageArabic ? 'right' : 'left',
            }}
          >
            {authorName}
          </Typography>
          <Chip 
            label={`${readTime} min read`}
            size="small"
            sx={{ 
              backgroundColor: theme.palette.mode === 'light' 
                ? theme.palette.grey[50] 
                : theme.palette.grey[800],
              fontSize: '0.85rem',
              color: theme.palette.text.primary, // Use theme text color
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BlogPostCard;