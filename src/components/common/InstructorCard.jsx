import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  VideoCall as VideoCallIcon,
  WorkspacePremium as PremiumIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import FunctionalRating from './FunctionalRating';

const InstructorCard = ({
  instructor,
  onBookInstructor,
  onInstructorProfile,
  onRatingSubmit,
  bookingLoading = null,
  isRTL = false
}) => {
  const theme = useTheme();
  const { t } = useTranslation('sessions');

  const isBookingThisInstructor = bookingLoading === instructor.id;
  const hasAvailableSlots = instructor.availableSlots > 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[12],
        },
        position: 'relative',
        overflow: 'visible',
        borderRadius: 3
      }}
    >
      {/* Verified Badge */}
      {instructor.verified && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: isRTL ? 'auto' : -8,
            left: isRTL ? -8 : 'auto',
            zIndex: 2,
            bgcolor: 'success.main',
            color: 'success.contrastText',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: theme.shadows[4]
          }}
        >
          <PremiumIcon sx={{ fontSize: 16 }} />
        </Box>
      )}

      <CardContent sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
        {/* Instructor Info */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box 
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
            onClick={() => onInstructorProfile?.(instructor.id)}
          >
            <Avatar
              src={instructor.avatar}
              sx={{
                width: { xs: 70, sm: 80 },
                height: { xs: 70, sm: 80 },
                mx: 'auto',
                mb: 2,
                border: `3px solid ${theme.palette.primary.main}`
              }}
            >
              {instructor.name.charAt(0)}
            </Avatar>
            
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                textDecoration: 'underline',
                color: 'primary.main',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              {instructor.name}
            </Typography>
          </Box>
          
          <FunctionalRating
            instructorId={instructor.id}
            currentRating={instructor.rating}
            reviewCount={instructor.reviewCount}
            onRatingSubmit={onRatingSubmit}
            size="small"
            precision={0.1}
            showReviewCount={true}
            allowRating={true}
          />
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2, 
              mt: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {instructor.description}
          </Typography>
        </Box>

        {/* Experience & Rate */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
            mb: 1 
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {t('topInstructors.experience', 'Experience')}: {instructor.experience}
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 0, sm: 0.5 },
              alignItems: { xs: 'flex-start', sm: 'center' }
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                <Typography 
                  variant="h6" 
                  color="primary.main" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  {instructor.currency === 'USD' ? '$' : instructor.currency}{instructor.hourlyRate}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                /{t('common.hr', 'hr')}
              </Typography>
            </Box>
          </Box>
          
          {/* Enhanced Availability Display with Visual Indicators */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: hasAvailableSlots 
                  ? instructor.availableSlots > 5 
                    ? 'success.main'  // Green for high availability (>5 slots)
                    : instructor.availableSlots > 2
                      ? 'warning.main'  // Orange for medium availability (3-5 slots)
                      : 'error.main'    // Red for low availability (1-2 slots)
                  : 'grey.400',       // Gray for no availability
                animation: hasAvailableSlots && instructor.availableSlots <= 2 ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': {
                    opacity: 1,
                  },
                  '50%': {
                    opacity: 0.5,
                  },
                  '100%': {
                    opacity: 1,
                  },
                }
              }}
            />
            <ScheduleIcon 
              fontSize="small" 
              color={hasAvailableSlots ? "success" : "disabled"} 
            />
            <Typography 
              variant="body2" 
              color={hasAvailableSlots ? "success.main" : "text.secondary"}
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: hasAvailableSlots && instructor.availableSlots <= 2 ? 600 : 400
              }}
            >
              {hasAvailableSlots 
                ? `${instructor.availableSlots} ${t('topInstructors.availableSlots', 'slots available this week')}`
                : t('topInstructors.noAvailableSlots', 'No slots available this week')
              }
            </Typography>
          </Box>
          
          {/* Availability Progress Bar */}
          {hasAvailableSlots && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 0.5
              }}>
                <Typography variant="caption" color="text.secondary">
                  {t('topInstructors.card.weeklyAvailability', 'This week availability')}
                </Typography>
                <Typography 
                  variant="caption" 
                  color={instructor.availableSlots > 5 ? 'success.main' : instructor.availableSlots > 2 ? 'warning.main' : 'error.main'}
                  sx={{ fontWeight: 600 }}
                >
                  {instructor.availableSlots > 5 
                    ? t('topInstructors.card.highAvailability', 'High') 
                    : instructor.availableSlots > 2 
                      ? t('topInstructors.card.mediumAvailability', 'Medium')
                      : t('topInstructors.card.lowAvailability', 'Limited')
                  }
                </Typography>
              </Box>
              <Box sx={{
                width: '100%',
                height: 4,
                backgroundColor: 'grey.200',
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  height: '100%',
                  width: `${Math.min((instructor.availableSlots / 10) * 100, 100)}%`,
                  backgroundColor: instructor.availableSlots > 5 
                    ? 'success.main' 
                    : instructor.availableSlots > 2 
                      ? 'warning.main' 
                      : 'error.main',
                  borderRadius: 2,
                  transition: 'width 0.3s ease-in-out'
                }}
                />
              </Box>
            </Box>
          )}
          
          {/* Next Available Slot Indicator */}
          {hasAvailableSlots && instructor.nextAvailableSlot && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5, 
              p: 1,
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
              mb: 2
            }}>
              <Box sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'success.main',
                animation: 'pulse 2s infinite'
              }} />
              <Typography 
                variant="caption" 
                color="success.dark"
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  fontWeight: 500
                }}
              >
                {t('topInstructors.card.nextAvailable', 'Next: {{time}}', { time: instructor.nextAvailableSlot })}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Specialties */}
        {instructor.specialties && instructor.specialties.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                textAlign: 'left',
                color: 'text.primary',
                mb: 1,
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              {t('topInstructors.card.specialties', 'Specialties')}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: { xs: 0.5, sm: 0.8 },
              justifyContent: 'flex-start'
            }}>
              {instructor.specialties.slice(0, 3).map((specialty, index) => (
                <Chip
                  key={index}
                  label={specialty}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    height: { xs: '22px', sm: '24px' },
                    '& .MuiChip-label': {
                      px: { xs: 1, sm: 1.5 }
                    },
                    borderRadius: '12px'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Subjects */}
        {instructor.subjects && instructor.subjects.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle2" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                textAlign: 'left',
                color: 'text.primary',
                mb: 1,
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              {t('topInstructors.card.subjects', 'Subjects')}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: { xs: 0.5, sm: 0.8 },
              justifyContent: 'flex-start'
            }}>
              {instructor.subjects.slice(0, 3).map((subject, index) => (
                <Chip
                  key={index}
                  label={subject}
                  size="small"
                  variant="filled"
                  color="secondary"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    height: { xs: '24px', sm: '26px' },
                    borderRadius: '13px',
                    '& .MuiChip-label': {
                      px: { xs: 1, sm: 1.5 }
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Book Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={() => onBookInstructor?.(instructor.id, instructor.name)}
          endIcon={isBookingThisInstructor ? <CircularProgress size={16} color="inherit" /> : <VideoCallIcon />}
          disabled={isBookingThisInstructor || !hasAvailableSlots}
          sx={{
            py: { xs: 1.2, sm: 1.5 },
            borderRadius: 2,
            fontWeight: 600,
            fontSize: { xs: '0.85rem', sm: '0.875rem' },
            background: !hasAvailableSlots 
              ? theme.palette.grey[400]
              : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            '&:hover': {
              background: !hasAvailableSlots
                ? theme.palette.grey[400]
                : `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              transform: (isBookingThisInstructor || !hasAvailableSlots) ? 'none' : 'translateY(-2px)',
              boxShadow: !hasAvailableSlots ? 'none' : theme.shadows[8]
            },
            '&:disabled': {
              background: theme.palette.grey[400]
            }
          }}
        >
          {isBookingThisInstructor ? 
            t('topInstructors.states.loading', 'Opening profile...') :
            !hasAvailableSlots ?
              t('topInstructors.card.noSlotsAvailable', 'No Slots Available') :
              t('topInstructors.card.viewAndBook', 'View & Book')
          }
        </Button>
      </CardContent>
    </Card>
  );
};

export default InstructorCard;