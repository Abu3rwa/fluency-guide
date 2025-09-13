import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/constants';
import { getInstructors } from '../services/userService';
import { sessionService, availabilityService } from '../services/sessionService';
import InstructorCard from '../components/common/InstructorCard';
import { useRTL } from '../utils/rtlUtils';

const InstructorsShowcasePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isRTL = useRTL();
  const theme = useTheme();
  
  const [instructors, setInstructors] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  
  // Helper function to calculate available slots for instructor
  const calculateAvailableSlots = async (instructor) => {
    try {
      const startDate = dayjs().toDate();
      const endDate = dayjs().add(7, 'day').toDate(); // Next 7 days
      
      const availability = await availabilityService.getForInstructor(
        instructor.id,
        startDate,
        endDate
      );
      
      // The service already filters for future slots, so we just need to count them
      const futureSlots = availability.length;
          
      // Fallback to user doc availability only if service returns 0 but user has availability data
      if (futureSlots === 0 && instructor.availability?.slots && instructor.availability.slots.length > 0) {
        const userSlots = instructor.availability.slots;
        const now = dayjs();
        const fallbackSlots = userSlots.filter(slot => {
          if (slot.startTime) {
            const slotTime = slot.startTime.toDate ? dayjs(slot.startTime.toDate()) : dayjs(slot.startTime);
            const isFuture = slotTime.isAfter(now);
            return isFuture;
          }
          return false;
        });
        return fallbackSlots.length;
      }
      
      return futureSlots;
    } catch (error) {
      console.warn('Error calculating availability for instructor', instructor.id, ':', error.message);
      return 0;
    }
  };

  // Load instructors
  useEffect(() => {
    const loadInstructors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const instructorData = await getInstructors();
        
        // Process instructors with availability calculation
        const processedInstructors = await Promise.all(
          instructorData
            .filter(instructor => 
              instructor.isInstructor && (instructor.displayName || instructor.name)
            )
            .map(async (instructor) => {
              const availableSlots = await calculateAvailableSlots(instructor);
              
              return {
                id: instructor.id,
                name: instructor.displayName || instructor.name || t('instructors.showcase.unknownInstructor', 'Unknown Instructor'),
                avatar: instructor.photoURL || instructor.profileImage || '/api/placeholder/100/100',
                rating: instructor.instructorProfile?.rating?.average || 4.5,
                reviewCount: instructor.instructorProfile?.rating?.count || 0,
                specialties: instructor.instructorProfile?.specialties || [t('instructors.showcase.generalTutoring', 'General Tutoring')],
                subjects: instructor.instructorProfile?.subjects || instructor.instructorProfile?.languages || [t('instructors.showcase.defaultSubject', 'English')],
                hourlyRate: instructor.instructorProfile?.hourlyRate || 25,
                currency: instructor.instructorProfile?.currency || 'USD',
                experience: instructor.instructorProfile?.experience || t('instructors.showcase.newInstructor', 'New Instructor'),
                verified: true,
                description: instructor.instructorProfile?.bio || t('instructors.showcase.noDescription', 'Experienced instructor ready to help you achieve your learning goals.'),
                availableSlots: availableSlots,
                // Keep original data for filtering
                instructorProfile: instructor.instructorProfile
              };
            })
        );
        
        setInstructors(processedInstructors);
        setFilteredInstructors(processedInstructors);
      } catch (err) {
        console.error('Error loading instructors:', err);
        setError(t('instructors.showcase.error', 'Error loading instructors'));
      } finally {
        setLoading(false);
      }
    };
    
    loadInstructors();
  }, [t]);
  
  // Extract unique languages and specialties for filters
  const allLanguages = [...new Set(instructors.flatMap(instructor => 
    instructor.subjects || []
  ))];
  
  const allSpecialties = [...new Set(instructors.flatMap(instructor => 
    instructor.specialties || []
  ))];
  
  // Filter instructors based on search and filters
  useEffect(() => {
    let result = instructors;
    
    // Apply search term filter
    if (searchTerm) {
      result = result.filter(instructor => 
        instructor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.subjects?.some(lang => 
          lang.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        instructor.specialties?.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply language filter
    if (selectedLanguage) {
      result = result.filter(instructor => 
        instructor.subjects?.includes(selectedLanguage)
      );
    }
    
    // Apply specialty filter
    if (selectedSpecialty) {
      result = result.filter(instructor => 
        instructor.specialties?.includes(selectedSpecialty)
      );
    }
    
    setFilteredInstructors(result);
  }, [searchTerm, selectedLanguage, selectedSpecialty, instructors]);
  
  const handleBookInstructor = async (instructorId, instructorName) => {
    try {
      setBookingLoading(instructorId);
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      // Navigate directly to instructor profile for direct booking
      navigate(`/instructors/${instructorId}`);
    } catch (error) {
      console.error('Error navigating to instructor profile:', error);
    } finally {
      setBookingLoading(null);
    }
  };

  const handleInstructorProfile = (instructorId) => {
    navigate(`/instructors/${instructorId}`);
  };

  const handleRatingSubmit = async (ratingData) => {
    // In a real implementation, this would submit the rating to the backend
    console.log('Rating submitted:', ratingData);
    
    // Update local state with new rating (optimistic update)
    setInstructors(prevInstructors => 
      prevInstructors.map(instructor => {
        if (instructor.id === ratingData.instructorId) {
          const currentCount = instructor.reviewCount;
          const currentRating = instructor.rating;
          const newCount = currentCount + 1;
          const newRating = ((currentRating * currentCount) + ratingData.rating) / newCount;
          
          return {
            ...instructor,
            rating: newRating,
            reviewCount: newCount
          };
        }
        return instructor;
      })
    );
  };
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedLanguage('');
    setSelectedSpecialty('');
  };
  
  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          textAlign: isRTL ? 'right' : 'left',
          fontWeight: 700,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2
        }}
      >
        {t('instructors.showcase.title', 'Meet Our Instructors')}
      </Typography>
      
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ 
          mb: 4, 
          textAlign: isRTL ? 'right' : 'left',
          maxWidth: 800
        }}
      >
        {t('instructors.showcase.subtitle', 'Browse our qualified instructors and find the perfect match for your learning needs. Each instructor brings unique expertise and teaching style to help you achieve your English learning goals.')}
      </Typography>
      
      {/* Filters */}
      <Box 
        sx={{ 
          mb: 4, 
          p: 3, 
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1
        }}
      >
        <Grid container spacing={2} alignItems="end">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t('instructors.showcase.search', 'Search Instructors')}
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('instructors.showcase.searchPlaceholder', 'Search by name, language, or specialty')}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>{t('instructors.showcase.language', 'Language')}</InputLabel>
              <Select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                label={t('instructors.showcase.language', 'Language')}
              >
                <MenuItem value="">
                  <em>{t('instructors.showcase.allLanguages', 'All Languages')}</em>
                </MenuItem>
                {allLanguages.map((language) => (
                  <MenuItem key={language} value={language}>
                    {language}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>{t('instructors.showcase.specialty', 'Specialty')}</InputLabel>
              <Select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                label={t('instructors.showcase.specialty', 'Specialty')}
              >
                <MenuItem value="">
                  <em>{t('instructors.showcase.allSpecialties', 'All Specialties')}</em>
                </MenuItem>
                {allSpecialties.map((specialty) => (
                  <MenuItem key={specialty} value={specialty}>
                    {specialty}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={handleResetFilters}
              sx={{ height: '100%' }}
            >
              {t('instructors.showcase.reset', 'Reset Filters')}
            </Button>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {searchTerm && (
            <Chip 
              label={`${t('instructors.showcase.searchTerm', 'Search')}: ${searchTerm}`} 
              onDelete={() => setSearchTerm('')} 
              color="primary" 
              variant="outlined" 
            />
          )}
          {selectedLanguage && (
            <Chip 
              label={`${t('instructors.showcase.language', 'Language')}: ${selectedLanguage}`} 
              onDelete={() => setSelectedLanguage('')} 
              color="primary" 
              variant="outlined" 
            />
          )}
          {selectedSpecialty && (
            <Chip 
              label={`${t('instructors.showcase.specialty', 'Specialty')}: ${selectedSpecialty}`} 
              onDelete={() => setSelectedSpecialty('')} 
              color="primary" 
              variant="outlined" 
            />
          )}
        </Box>
      </Box>
      
      {/* Results */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ ml: 2, alignSelf: 'center' }}>
            {t('instructors.showcase.loading', 'Loading instructors...')}
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 6 }}>
          {error}
        </Alert>
      ) : filteredInstructors.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 6, 
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {t('instructors.showcase.noInstructors', 'No instructors found matching your criteria')}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {t('instructors.showcase.tryDifferent', 'Try adjusting your filters or search terms')}
          </Typography>
          <Button variant="outlined" onClick={handleResetFilters}>
            {t('instructors.showcase.resetFilters', 'Reset All Filters')}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredInstructors.map((instructor) => (
            <Grid item xs={12} sm={6} lg={4} key={instructor.id}>
              <InstructorCard
                instructor={instructor}
                onBookInstructor={handleBookInstructor}
                onInstructorProfile={handleInstructorProfile}
                onRatingSubmit={handleRatingSubmit}
                bookingLoading={bookingLoading}
                isRTL={isRTL}
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Results count */}
      {!loading && (
        <Box sx={{ mt: 3, textAlign: isRTL ? 'right' : 'left' }}>
          <Typography color="text.secondary">
            {t('instructors.showcase.resultsCount', 
              'Showing {{count}} of {{total}} instructors', 
              { 
                count: filteredInstructors.length, 
                total: instructors.length 
              }
            )}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default InstructorsShowcasePage;