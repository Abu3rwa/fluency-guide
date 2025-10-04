import React from 'react';
import { Box, CardMedia } from '@mui/material';

const BlogImage = ({ src, alt, className = '', ...props }) => {
  if (!src) return null;
  
  return (
    <CardMedia
      component="img"
      image={src}
      alt={alt}
      sx={{
        width: '100%',
        height: 'auto',
        borderRadius: 1,
        ...props.sx
      }}
      onError={(e) => {
        e.target.style.display = 'none';
      }}
      {...props}
    />
  );
};

export default BlogImage;