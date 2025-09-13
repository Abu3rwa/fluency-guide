import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SessionCard from './SessionCard';

const SessionTypeSelector = ({ sessionTypes, onSelect, selectedSessionType }) => {
  const { t, i18n } = useTranslation();
  const [selectedType, setSelectedType] = useState(selectedSessionType || null);

  // Helper function to get localized text
  const getLocalizedText = (textObj, fallback = '') => {
    if (!textObj) return fallback;
    if (typeof textObj === 'string') return textObj;
    
    const currentLang = i18n.language || 'en';
    return textObj[currentLang] || textObj.en || textObj.ar || fallback;
  };

  const handleSelect = (sessionType) => {
    const newType = selectedType?.id === sessionType.id ? null : sessionType;
    setSelectedType(newType);
    onSelect(newType);
  };

  // Process session types to include localized names for display
  const processedSessionTypes = sessionTypes.map(type => ({
    ...type,
    displayName: getLocalizedText(type.name, 'Unnamed Session Type'),
    displayDescription: getLocalizedText(type.description, '')
  }));

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('sessions.booking.selectSessionType', 'Select Session Type')}
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {processedSessionTypes.map((sessionType) => (
          <SessionCard
            key={sessionType.id}
            session={sessionType}
            selected={selectedType?.id === sessionType.id}
            onSelect={handleSelect}
            isAvailable={true}
            isBooking={false}
          />
        ))}
      </Box>
    </Box>
  );
};

export default SessionTypeSelector;