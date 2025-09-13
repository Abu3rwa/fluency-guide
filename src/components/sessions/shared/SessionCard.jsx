import React from 'react';
import { Box, Card, CardContent, Typography, Button, Chip } from '@mui/material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const SessionCard = ({ 
  session, 
  selected = false, 
  onSelect = () => {},
  isAvailable = true,
  isBooking = false
}) => {
  const { t } = useTranslation();
  const handleSelect = () => {
    if (!isAvailable) return;
    onSelect(session);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        border: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        cursor: isAvailable ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: isAvailable ? 3 : 0,
          transform: isAvailable ? 'translateY(-4px)' : 'none'
        }
      }}
      onClick={handleSelect}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Typography variant="h6" component="div">
            {session.displayName || session.name || session.type || t('sessions.shared.sessionCard.session', 'Session')}
          </Typography>
          {!isAvailable && (
            <Chip 
              label={t('sessions.shared.sessionCard.full', 'Full')} 
              size="small" 
              color="error" 
              sx={{ ml: 1 }} 
            />
          )}
        </Box>
        
        {session.date && session.startTime && (
          <Typography color="text.secondary" gutterBottom>
            {format(session.date, 'EEEE, MMMM d')} • {format(session.startTime, 'h:mm a')} - {format(session.endTime, 'h:mm a')}
          </Typography>
        )}
        
        {session.duration && (
          <Typography color="text.secondary" gutterBottom>
            {session.duration} {t('sessions.shared.sessionCard.minutes', 'minutes')}
          </Typography>
        )}
        
        {session.price && session.currency && (
          <Typography variant="h6" color="primary" gutterBottom>
            {session.currency}{session.price}
          </Typography>
        )}
        
        {(session.displayDescription || session.description) && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxHeight: '4.8em', overflow: 'hidden' }}>
            {session.displayDescription || session.description}
          </Typography>
        )}
        
        <Box sx={{ mt: 'auto' }}>
          {isBooking ? (
            <Button 
              variant={selected ? 'contained' : 'outlined'} 
              color="primary"
              fullWidth
              disabled={!isAvailable}
              sx={{ mt: 2 }}
            >
              {selected ? t('sessions.shared.sessionCard.selected', 'Selected') : isAvailable ? t('sessions.shared.sessionCard.selectSession', 'Select Session') : t('sessions.shared.sessionCard.notAvailable', 'Not Available')}
            </Button>
          ) : (
            <Button 
              variant={selected ? 'contained' : 'outlined'} 
              color="primary"
              fullWidth
              disabled={!isAvailable}
              sx={{ mt: 2 }}
            >
              {selected ? 'Selected' : isAvailable ? 'Book Now' : 'Unavailable'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SessionCard;