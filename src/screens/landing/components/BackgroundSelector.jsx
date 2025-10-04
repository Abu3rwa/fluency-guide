import React from 'react';
import { Box } from '@mui/material';
import BrandedHeroBackground from './BrandedHeroBackground';

const BackgroundSelector = ({ 
  theme, 
  isRTL, 
  brandColors,
  logoUrl,
  brandPattern
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
      }}
    >
      <BrandedHeroBackground 
        theme={theme} 
        isRTL={isRTL}
        brandColors={brandColors}
        logoUrl={logoUrl}
        brandPattern={brandPattern}
      />
    </Box>
  );
};

export default BackgroundSelector;
