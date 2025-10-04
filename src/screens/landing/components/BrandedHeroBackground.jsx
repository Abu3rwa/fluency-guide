import React from 'react';
import { Box } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LanguageIcon from '@mui/icons-material/Language';

const BrandedHeroBackground = ({ theme, isRTL, brandColors, logoUrl, brandPattern }) => {
  // Get theme mode (dark or light)
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Default brand colors if not provided - adapt to theme
  const primaryColor = brandColors?.primary || theme.palette.primary.main;
  const secondaryColor = brandColors?.secondary || theme.palette.secondary.main;
  const accentColor = brandColors?.accent || theme.palette.primary.light;
  
  // Theme-aware colors for solid background
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f8f9fa';
  const overlayColor = isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)';
  const patternColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const logoFilter = isDarkMode ? 'brightness(0) invert(1)' : 'brightness(0) invert(1)';
  
  // Education icons array
  const educationIcons = [
    { Icon: SchoolIcon, size: 40, opacity: 0.1 },
    { Icon: MenuBookIcon, size: 35, opacity: 0.08 },
    { Icon: PsychologyIcon, size: 30, opacity: 0.06 },
    { Icon: LanguageIcon, size: 45, opacity: 0.12 },
  ];

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: backgroundColor,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, ${accentColor}15 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${accentColor}10 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, ${accentColor}08 0%, transparent 50%)
          `,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(45deg, transparent 30%, ${overlayColor} 50%, transparent 70%),
            linear-gradient(-45deg, transparent 30%, ${overlayColor.replace('0.1', '0.05')} 50%, transparent 70%)
          `,
        },
      }}
    >
      {/* Education Icons Background */}
      {educationIcons.map(({ Icon, size, opacity }, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: `${15 + (index * 20)}%`,
            left: `${10 + (index * 15)}%`,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            opacity: opacity,
            zIndex: 1,
            animation: `float${index} ${6 + index}s ease-in-out infinite`,
            [`@keyframes float${index}`]: {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: `translateY(-${10 + index * 5}px) rotate(${180 + index * 45}deg)` },
            },
          }}
        >
          <Icon sx={{ fontSize: size }} />
        </Box>
      ))}

      {/* Brand Logo/Icon */}
      {logoUrl && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.1,
            zIndex: 2,
            '& img': {
              width: '300px',
              height: '300px',
              objectFit: 'contain',
              filter: logoFilter,
            },
          }}
        >
          <img src={logoUrl} alt="Brand Logo" />
        </Box>
      )}

      {/* Brand Pattern Overlay */}
      {brandPattern === 'dots' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(circle at 1px 1px, ${patternColor} 1px, transparent 0)`,
            backgroundSize: '20px 20px',
            opacity: isDarkMode ? 0.3 : 0.2,
          }}
        />
      )}

      {brandPattern === 'grid' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(${patternColor} 1px, transparent 1px),
              linear-gradient(90deg, ${patternColor} 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
            opacity: isDarkMode ? 0.2 : 0.15,
          }}
        />
      )}

      {brandPattern === 'waves' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(45deg, transparent 30%, ${overlayColor} 50%, transparent 70%),
              linear-gradient(-45deg, transparent 30%, ${overlayColor.replace('0.1', '0.05')} 50%, transparent 70%)
            `,
            opacity: isDarkMode ? 0.4 : 0.3,
          }}
        />
      )}

      {/* Subtle floating elements for brand identity */}
      <Box
        sx={{
          position: 'absolute',
          top: '25%',
          right: '20%',
          width: 50,
          height: 50,
          background: `linear-gradient(45deg, ${accentColor}30, ${accentColor}15)`,
          borderRadius: '50%',
          opacity: isDarkMode ? 0.3 : 0.2,
          animation: 'float1 8s ease-in-out infinite',
          '@keyframes float1': {
            '0%, 100%': { transform: 'translateY(0px) scale(1)' },
            '50%': { transform: 'translateY(-15px) scale(1.1)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '30%',
          right: '10%',
          width: 35,
          height: 35,
          background: `linear-gradient(45deg, ${accentColor}25, ${accentColor}10)`,
          borderRadius: '20%',
          opacity: isDarkMode ? 0.25 : 0.15,
          animation: 'float2 10s ease-in-out infinite',
          '@keyframes float2': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-10px) rotate(180deg)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          left: '5%',
          width: 45,
          height: 45,
          background: `linear-gradient(45deg, ${accentColor}20, ${accentColor}08)`,
          borderRadius: '30%',
          opacity: isDarkMode ? 0.2 : 0.1,
          animation: 'float3 12s ease-in-out infinite',
          '@keyframes float3': {
            '0%, 100%': { transform: 'translateY(0px) scale(1)' },
            '50%': { transform: 'translateY(-20px) scale(0.9)' },
          },
        }}
      />
    </Box>
  );
};

export default BrandedHeroBackground;
