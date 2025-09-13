import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { addDays, format, isAfter, isToday } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../../utils/rtlUtils';

const DatePicker = ({ minDate = new Date(), onSelect, selectedDate }) => {
  const { t, i18n } = useTranslation();
  const isRTL = useRTL();
  const [selected, setSelected] = useState(selectedDate || null);

  const handleDateSelect = (date) => {
    const newDate = selected && date.getTime() === selected.getTime() ? null : date;
    setSelected(newDate);
    onSelect(newDate);
  };

  const generateWeekDates = () => {
    const dates = [];
    const today = new Date();
    
    // Always start from today or minDate, whichever is later
    let currentDate = minDate && isAfter(minDate, today) ? minDate : today;
    
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  };

  const dates = generateWeekDates();

  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Typography variant="subtitle1" gutterBottom sx={{ textAlign: isRTL ? 'right' : 'left' }}>
        {t('sessions.datePicker.selectDate', 'Select a Date')}
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mt: 2 }}>
        {dates.map((date) => {
          const isDisabled = minDate && isAfter(minDate, date);
          const isSelected = selected && date.getTime() === selected.getTime();
          
          return (
            <Button
              key={date.toISOString()}
              variant="outlined"
              color={isSelected ? 'primary' : 'secondary'}
              onClick={() => handleDateSelect(date)}
              disabled={isDisabled}
              sx={{
                py: 1.5,
                textTransform: 'none',
                bgcolor: isSelected ? 'primary.main' : 'inherit',
                color: isSelected ? 'primary.contrastText' : 'inherit',
                '&:hover': {
                  bgcolor: isSelected ? 'primary.dark' : 'action.hover'
                },
                borderColor: isSelected ? 'primary.main' : 'divider'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                  {format(date, 'EEE', { locale: i18n.language === 'ar' ? undefined : undefined })}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                  {format(date, 'd')}
                </Typography>
              </Box>
            </Button>
          );
        })}
      </Box>
      
      {selected && (
        <Box sx={{ mt: 2, textAlign: isRTL ? 'right' : 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('sessions.datePicker.selected', 'Selected')}: {format(selected, 'EEEE, MMMM d, yyyy', { locale: i18n.language === 'ar' ? undefined : undefined })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DatePicker;