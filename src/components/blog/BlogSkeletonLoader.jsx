import React from 'react';
import { Box, Skeleton, Chip } from '@mui/material';
import { useCustomTheme } from '../../contexts/ThemeContext';

const BlogSkeletonLoader = () => {
  const { theme } = useCustomTheme();

  return (
    <Box 
      sx={{ 
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
        boxShadow: theme.components.MuiCard.styleOverrides.root.boxShadow,
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(124,58,237,0.12)',
        }
      }}
    >
      <Skeleton 
        variant="rectangular" 
        animation="wave"
        sx={{ 
          height: 200,
          backgroundColor: theme.palette.mode === 'light' 
            ? theme.palette.grey[100] 
            : theme.palette.grey[900]
        }} 
      />
      <Box sx={{ padding: 3 }}>
        <Skeleton 
          variant="text" 
          animation="wave"
          width="40%"
          sx={{ 
            marginBottom: 2,
            backgroundColor: theme.palette.mode === 'light' 
              ? theme.palette.grey[100] 
              : theme.palette.grey[900]
          }} 
        />
        <Skeleton 
          variant="text" 
          animation="wave"
          sx={{ 
            marginBottom: 1.5,
            backgroundColor: theme.palette.mode === 'light' 
              ? theme.palette.grey[100] 
              : theme.palette.grey[900]
          }} 
        />
        <Skeleton 
          variant="text" 
          animation="wave"
          sx={{ 
            marginBottom: 1.5,
            backgroundColor: theme.palette.mode === 'light' 
              ? theme.palette.grey[100] 
              : theme.palette.grey[900]
          }} 
        />
        <Skeleton 
          variant="text" 
          animation="wave"
          width="60%"
          sx={{ 
            marginBottom: 3,
            backgroundColor: theme.palette.mode === 'light' 
              ? theme.palette.grey[100] 
              : theme.palette.grey[900]
          }} 
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
          <Skeleton 
            variant="rectangular" 
            animation="wave"
            width={80}
            height={24}
            sx={{ 
              borderRadius: 12,
              backgroundColor: theme.palette.mode === 'light' 
                ? theme.palette.grey[100] 
                : theme.palette.grey[900]
            }} 
          />
          <Skeleton 
            variant="rectangular" 
            animation="wave"
            width={80}
            height={24}
            sx={{ 
              borderRadius: 12,
              backgroundColor: theme.palette.mode === 'light' 
                ? theme.palette.grey[100] 
                : theme.palette.grey[900]
            }} 
          />
        </Box>
      </Box>
    </Box>
  );
};

export default BlogSkeletonLoader;