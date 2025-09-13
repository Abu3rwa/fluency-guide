import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Rating, Chip, Button } from '@mui/material';
import { Stack } from '@mui/system';
import { useTranslation } from 'react-i18next';

const InstructorProfileCard = ({ 
  instructor, 
  selected = false, 
  onSelect = () => {},
  showSelect = true
}) => {
  const { t } = useTranslation();
  const handleSelect = () => {
    onSelect(instructor);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        border: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-4px)'
        }
      }}
      onClick={handleSelect}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={instructor.photoURL} 
            alt={instructor.displayName}
            sx={{ width: 56, height: 56, mr: 2 }}
          />
          <Box>
            <Typography variant="h6" component="div">
              {instructor.displayName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating 
                value={instructor.instructorProfile?.rating?.average || 0} 
                readOnly 
                precision={0.5} 
                size="small" 
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({instructor.instructorProfile?.rating?.count || 0} {t('sessions.instructor.profile.reviews', 'reviews')})
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {instructor.instructorProfile?.bio && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxHeight: '3em', overflow: 'hidden' }}>
            {instructor.instructorProfile.bio}
          </Typography>
        )}
        
        <Stack spacing={1} sx={{ mb: 2 }}>
          {instructor.instructorProfile?.qualifications?.map((qual, index) => (
            <Chip 
              key={index} 
              label={qual} 
              size="small" 
              color="primary" 
              variant="outlined" 
              sx={{ maxWidth: '100%' }}
            />
          ))}
          
          {instructor.instructorProfile?.languages?.map((lang, index) => (
            <Chip 
              key={`lang-${index}`} 
              label={lang} 
              size="small" 
              color="secondary" 
              variant="outlined" 
              sx={{ maxWidth: '100%' }}
            />
          ))}
          
          {instructor.instructorProfile?.subjects?.map((subject, index) => (
            <Chip 
              key={`subject-${index}`} 
              label={subject} 
              size="small" 
              color="secondary" 
              variant="outlined" 
              sx={{ maxWidth: '100%' }}
            />
          ))}
        </Stack>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" color="primary">
            {instructor.instructorProfile?.currency || 'USD'}{instructor.instructorProfile?.hourlyRate || 0}/hr
          </Typography>
          
          {showSelect && (
            <Button 
              variant={selected ? 'contained' : 'outlined'} 
              color="primary"
              size="small"
              onClick={handleSelect}
            >
              {selected ? t('sessions.instructor.profile.selected', 'Selected') : t('sessions.instructor.profile.viewProfile', 'View Profile')}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default InstructorProfileCard;