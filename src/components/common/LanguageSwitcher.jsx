import React from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const baseButtonStyle = {
    minWidth: '40px',
    height: '30px',
    padding: '6px 16px',
    fontSize: '12px',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isArabic ? 'row-reverse' : 'row',
        gap: 0,
        alignItems: 'center',
        border: '2px solid #D4A574',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'transparent',
        width: 'fit-content',
      }}
    >
      <Button
        onClick={() => changeLanguage('en')}
        sx={{
          ...baseButtonStyle,
          fontFamily: "'Montserrat', sans-serif",
          background: i18n.language === 'en' ? 'linear-gradient(135deg, #D4A574 0%, #F4C430 100%)' : 'transparent',
          color: i18n.language === 'en' ? '#FFFFFF' : '#D4A574',
          border: 'none',
          borderRadius: 0,
          borderRight: isArabic ? 'none' : '1px solid rgba(212, 165, 116, 0.3)',
          borderLeft: isArabic ? '1px solid rgba(212, 165, 116, 0.3)' : 'none',
          '&:hover': {
            background: i18n.language === 'en' ? 'linear-gradient(135deg, #B8860B 0%, #D4A574 100%)' : 'rgba(212, 165, 116, 0.1)',
            color: i18n.language === 'en' ? '#FFFFFF' : '#D4A574',
          },
        }}
      >
        EN
      </Button>
      <Button
        onClick={() => changeLanguage('ar')}
        sx={{
          ...baseButtonStyle,
          fontFamily: "'Tajawal', sans-serif",
          background: i18n.language === 'ar' ? 'linear-gradient(135deg, #D4A574 0%, #F4C430 100%)' : 'transparent',
          color: i18n.language === 'ar' ? '#FFFFFF' : '#D4A574',
          border: 'none',
          borderRadius: 0,
          borderRight: isArabic ? '1px solid rgba(212, 165, 116, 0.3)' : 'none',
          borderLeft: isArabic ? 'none' : '1px solid rgba(212, 165, 116, 0.3)',
          '&:hover': {
            background: i18n.language === 'ar' ? 'linear-gradient(135deg, #B8860B 0%, #D4A574 100%)' : 'rgba(212, 165, 116, 0.1)',
            color: i18n.language === 'ar' ? '#FFFFFF' : '#D4A574',
          },
        }}
      >
        AR
      </Button>
    </Box>
  );
}

export default LanguageSwitcher;

