import React, { useState, memo, useCallback } from 'react';
import {
  Box,
  CardMedia,
  Skeleton,
  IconButton,
  Typography,
  Fade
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Book as BookIcon,
  BrokenImage as BrokenImageIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getImageOverlayStyles } from '../theme/styleUtils';
import { CARD_DIMENSIONS, TRANSITIONS } from '../constants';

/**
 * Optimized course image component with lazy loading, error handling, and preview overlay
 */
export const CourseCardImage = memo(({ 
  src, 
  alt, 
  loading = false,
  featured = false,
  height = CARD_DIMENSIONS.IMAGE_HEIGHT,
  onPreviewClick,
  showPreview = true,
  priority = false,
  fallbackIcon: FallbackIcon = BookIcon
}) => {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true); // Consider it loaded to hide skeleton
  }, []);

  const handlePreviewClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onPreviewClick?.();
  }, [onPreviewClick]);

  // Loading state
  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        width="100%"
        height={height}
        animation="wave"
        sx={{ 
          borderRadius: '16px 16px 0 0',
          bgcolor: 'action.hover'
        }}
        aria-label={t('common.loading', 'Loading...')}
      />
    );
  }

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        overflow: 'hidden',
        height,
        bgcolor: 'grey.100'
      }}
    >
      {/* Loading skeleton overlay */}
      {!imageLoaded && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 1
          }}
        />
      )}
      
      {/* Main image or fallback */}
      {!imageError && src ? (
        <CardMedia
          component="img"
          height={height}
          image={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={priority ? 'eager' : 'lazy'}
          sx={{
            objectFit: 'cover',
            transition: `opacity ${TRANSITIONS.SMOOTH}, transform ${TRANSITIONS.SMOOTH}`,
            opacity: imageLoaded ? 1 : 0,
            '&:hover': {
              transform: showPreview ? 'scale(1.05)' : 'none'
            }
          }}
        />
      ) : (
        <Fade in={imageLoaded || imageError}>
          <Box
            sx={{
              height: '100%',
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'grey.500',
              flexDirection: 'column',
              gap: 1,
            }}
            role="img"
            aria-label={alt}
          >
            {imageError ? (
              <>
                <BrokenImageIcon sx={{ fontSize: 48 }} />
                <Typography variant="body2" color="inherit">
                  {t('courseCard.imageError', 'Image unavailable')}
                </Typography>
              </>
            ) : (
              <>
                <FallbackIcon sx={{ fontSize: 48 }} />
                <Typography variant="body2" color="inherit">
                  {t('courseCard.courseImage', 'Course Image')}
                </Typography>
              </>
            )}
          </Box>
        </Fade>
      )}
      
      {/* Preview overlay */}
      {showPreview && onPreviewClick && (
        <Box sx={theme => getImageOverlayStyles(theme)}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <IconButton
              onClick={handlePreviewClick}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                '&:hover': { 
                  bgcolor: 'white', 
                  transform: 'scale(1.1)' 
                },
                transition: TRANSITIONS.QUICK,
                boxShadow: 3
              }}
              aria-label={t('courseCard.previewCourse', 'Preview course')}
            >
              <PlayIcon sx={{ fontSize: 36, color: 'primary.main' }} />
            </IconButton>
            <Typography
              variant="caption"
              sx={{
                color: 'white',
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {t('courseCard.previewLabel', 'Preview Course')}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Featured gradient overlay */}
      {featured && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255,193,7,0.3) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}

      {/* Loading indicator for lazy images */}
      {!imageLoaded && !imageError && src && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t('common.loading', 'Loading...')}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

CourseCardImage.displayName = 'CourseCardImage';

/**
 * Specialized image component for course thumbnails in list view
 */
export const CourseListImage = memo(({ 
  src, 
  alt, 
  loading = false,
  size = 80
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        width={size}
        height={size}
        sx={{ borderRadius: 2, flexShrink: 0 }}
      />
    );
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 2,
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        bgcolor: 'grey.200'
      }}
    >
      {!imageError && src ? (
        <CardMedia
          component="img"
          width={size}
          height={size}
          image={src}
          alt={alt}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          sx={{
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'grey.500'
          }}
        >
          <BookIcon sx={{ fontSize: size * 0.4 }} />
        </Box>
      )}
      
      {!imageLoaded && !imageError && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{ position: 'absolute', top: 0, left: 0 }}
        />
      )}
    </Box>
  );
});

CourseListImage.displayName = 'CourseListImage';