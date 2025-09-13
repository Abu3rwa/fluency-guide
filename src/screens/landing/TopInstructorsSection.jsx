import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import dayjs from 'dayjs';
import {
  ArrowForward as ArrowForwardIcon,
  WorkspacePremium as PremiumIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../routes/constants';
import { getInstructors } from '../../services/userService';
import { sessionService, availabilityService } from '../../services/sessionService';
import { getSessionTypeNameString } from '../../utils/sessionLocalization';
import FunctionalRating from '../../components/common/FunctionalRating';
import InstructorCard from '../../components/common/InstructorCard';

const TopInstructorsSection = ({ t, tSessions, isRTL }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Use sessions namespace for translations (prefer passed tSessions if available)
  const { t: tSessionsInternal } = useTranslation('sessions');
  const tSessionsToUse = tSessions || tSessionsInternal;
  
  // State management
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(null); // Track which instructor is being booked
  
  // Helper function to calculate available slots for instructor
  const calculateAvailableSlots = async (instructor) => {
    console.log(`\n=== CALCULATING AVAILABILITY FOR INSTRUCTOR ${instructor.id} (${instructor.displayName || instructor.name}) ===`);
    
    try {
      const startDate = dayjs().toDate();
      const endDate = dayjs().add(7, 'day').toDate(); // Next 7 days
      
      console.log(`Date range: ${dayjs(startDate).format('YYYY-MM-DD HH:mm')} to ${dayjs(endDate).format('YYYY-MM-DD HH:mm')}`);
      
      const availability = await availabilityService.getForInstructor(
        instructor.id,
        startDate,
        endDate
      );
     
      console.log(`🔍 [TOP_INSTRUCTORS] Availability lookup params instructor ${instructor.id}`);
      console.log(`📅 [TOP_INSTRUCTORS] Availability lookup params ${dayjs(startDate).format('YYYY-MM-DD')} to ${dayjs(endDate).format('YYYY-MM-DD')}`);
      console.log(`⏰ [TOP_INSTRUCTORS] Availability lookup params ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
            
      console.log(`✅ [TOP_INSTRUCTORS] availabilityService.getForInstructor returned ${availability.length} slots for instructor ${instructor.id}:`, availability);
    
      // The service already filters for future slots and handles timezone conversion
      const futureSlots = availability.length;
      
      console.log(`📊 [TOP_INSTRUCTORS] Future slots count: ${futureSlots}`);
          
      // Enhanced fallback to user doc availability if service returns 0
      if (futureSlots === 0 && instructor.availability?.slots && instructor.availability.slots.length > 0) {
        console.log(`⚠️ [TOP_INSTRUCTORS] Service returned 0 slots, checking user doc availability for instructor ${instructor.id}`);
        console.log(`📋 [TOP_INSTRUCTORS] User doc availability:`, instructor.availability);
        
        const userSlots = instructor.availability.slots;
        const nowLibya = dayjs().add(2, 'hour'); // Libya is UTC+2
        
        console.log(`⏰ [TOP_INSTRUCTORS] Current Libya time: ${nowLibya.format('YYYY-MM-DD HH:mm')}`);
        
        const fallbackSlots = userSlots.filter(slot => {
          try {
            if (!slot.startTime) {
              console.log(`⚠️ [TOP_INSTRUCTORS] Slot missing startTime:`, slot);
              return false;
            }
            
            // Handle both Firestore timestamps and Date objects
            const slotTime = slot.startTime.toDate ? dayjs(slot.startTime.toDate()) : dayjs(slot.startTime);
            
            // If this is a stored UTC time, convert to Libya time
            const slotTimeLibya = slotTime.add(2, 'hour');
            
            // Check if this slot is in the future (Libya time)
            const isFuture = slotTimeLibya.isAfter(nowLibya);
            
            console.log(`📅 [TOP_INSTRUCTORS] User doc slot for instructor ${instructor.id}:`, {
              slotTimeUtc: slotTime.format('YYYY-MM-DD HH:mm'),
              slotTimeLibya: slotTimeLibya.format('YYYY-MM-DD HH:mm'),
              nowLibya: nowLibya.format('YYYY-MM-DD HH:mm'),
              isFuture,
              slot: slot
            });
            
            return isFuture;
          } catch (error) {
            console.warn(`❌ [TOP_INSTRUCTORS] Error processing slot for instructor ${instructor.id}:`, slot, error);
            return false;
          }
        });
        
        console.log(`✅ [TOP_INSTRUCTORS] Fallback found ${fallbackSlots.length} future slots for instructor ${instructor.id}`);
        console.log(`🏁 [TOP_INSTRUCTORS] === END CALCULATION FOR INSTRUCTOR ${instructor.id} - RESULT: ${fallbackSlots.length} slots ===\n`);
        return fallbackSlots.length;
      }
      
      console.log(`🏁 [TOP_INSTRUCTORS] === END CALCULATION FOR INSTRUCTOR ${instructor.id} - RESULT: ${futureSlots} slots ===\n`);
      return futureSlots;
    } catch (error) {
      console.warn(`❌ [TOP_INSTRUCTORS] Error calculating availability for instructor`, instructor.id, ':', error.message);
      console.error(`🔴 [TOP_INSTRUCTORS] Full error:`, error);
      
      // Enhanced fallback: try to get a reasonable estimate from user doc
      if (instructor.availability?.slots && instructor.availability.slots.length > 0) {
        console.log(`Error fallback: checking user doc for instructor ${instructor.id}`);
        console.log(`User doc in error fallback:`, instructor.availability);
        
        try {
          const userSlots = instructor.availability.slots;
          const nowLibya = dayjs().add(2, 'hour'); // Libya is UTC+2
          
          const estimatedSlots = userSlots.filter(slot => {
            if (!slot.startTime) return false;
            try {
              const slotTime = slot.startTime.toDate ? dayjs(slot.startTime.toDate()) : dayjs(slot.startTime);
              const slotTimeLibya = slotTime.add(2, 'hour');
              const isFuture = slotTimeLibya.isAfter(nowLibya);
              
              console.log(`Error fallback slot check:`, {
                slotTimeUtc: slotTime.format('YYYY-MM-DD HH:mm'),
                slotTimeLibya: slotTimeLibya.format('YYYY-MM-DD HH:mm'),
                isFuture
              });
              
              return isFuture;
            } catch {
              return false;
            }
          });
          
          console.log(`Error fallback found ${estimatedSlots.length} slots for instructor ${instructor.id}`);
          console.log(`=== END ERROR CALCULATION FOR INSTRUCTOR ${instructor.id} - RESULT: ${estimatedSlots.length} slots ===\n`);
          return estimatedSlots.length;
        } catch (fallbackError) {
          console.warn(`Error in fallback calculation for instructor ${instructor.id}:`, fallbackError);
        }
      }
      
      // For instructors without availability setup, return 0
      console.log(`=== END ERROR CALCULATION FOR INSTRUCTOR ${instructor.id} - RESULT: 0 slots (no availability) ===\n`);
      return 0;
    }
  };
  
  // Load instructors from database
  useEffect(() => {
    const loadInstructors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const instructorData = await getInstructors();
        
        // Filter instructors and limit to top 6 (more lenient filtering)
        // Calculate real availability for each instructor instead of using hardcoded values
        const featuredInstructors = await Promise.all(
          instructorData
            .filter(instructor => 
              // Show instructor if they have isInstructor true, even with minimal profile
              instructor.isInstructor && (instructor.displayName || instructor.name)
            )
            .slice(0, 6)
            .map(async (instructor) => {
              // Calculate real availability for this instructor
              const availableSlots = await calculateAvailableSlots(instructor);
              
              // Calculate next available slot for enhanced user experience
              let nextAvailableSlot = null;
              if (availableSlots > 0) {
                try {
                  const startDate = dayjs().toDate();
                  const endDate = dayjs().add(7, 'day').toDate();
                  
                  const availability = await availabilityService.getForInstructor(
                    instructor.id,
                    startDate,
                    endDate
                  );
                  
                  // Find the earliest available slot
                  if (availability.length > 0) {
                    const earliestSlot = availability
                      .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf())[0];
                    
                    if (earliestSlot && earliestSlot.startTime) {
                      // Convert UTC time back to Libya time for display
                      const slotTimeLibya = dayjs(earliestSlot.startTime).add(2, 'hour');
                      nextAvailableSlot = slotTimeLibya.format('MMM D, h:mm A');
                    }
                  }
                } catch (error) {
                  console.warn(`Error calculating next available slot for instructor ${instructor.id}:`, error);
                }
              }
              
              return {
                id: instructor.id,
                name: instructor.displayName || instructor.name || tSessionsToUse('topInstructors.defaults.unknownInstructor'),
                avatar: instructor.photoURL || instructor.profileImage || '/api/placeholder/100/100',
                rating: instructor.instructorProfile?.rating?.average || 4.5, // Default to 4.5 if no rating
                reviewCount: instructor.instructorProfile?.rating?.count || 0,
                specialties: instructor.instructorProfile?.specialties || [tSessionsToUse('topInstructors.defaults.generalTutoring')],
                // Support both new 'subjects' and legacy 'languages' fields
                subjects: instructor.instructorProfile?.subjects || instructor.instructorProfile?.languages || [tSessionsToUse('topInstructors.defaults.defaultSubject')],
                hourlyRate: instructor.instructorProfile?.hourlyRate || 25, // Default hourly rate
                currency: instructor.instructorProfile?.currency || 'USD',
                experience: instructor.instructorProfile?.experience || tSessionsToUse('topInstructors.defaults.newInstructor'),
                verified: true,
                description: instructor.instructorProfile?.bio || tSessionsToUse('topInstructors.defaults.noDescription'),
                availableSlots: availableSlots, // Real availability data
                nextAvailableSlot: nextAvailableSlot // Next available slot for enhanced UX
              };
            })
        );
        
        setInstructors(featuredInstructors);
      } catch (err) {
        console.error('Error loading instructors:', err);
        setError(tSessionsToUse('topInstructors.states.error'));
      } finally {
        setLoading(false);
      }
    };
    
    loadInstructors();
  }, [t]);
  
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

  const handleViewAllInstructors = () => {
    navigate(ROUTES.INSTRUCTORS_SHOWCASE);
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
    
    // TODO: Implement actual API call to save rating
    // await ratingService.submitRating(ratingData);
  };

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: theme.palette.background.default,
        position: 'relative'
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2
            }}
          >
            {tSessionsToUse('topInstructors.header.title')}
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}
          >
            {tSessionsToUse('topInstructors.header.subtitle')}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 4 }}>
            <PremiumIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              {tSessionsToUse('topInstructors.header.verified')}
            </Typography>
          </Box>
        </Box>

        {/* Instructors Grid or Loading/Error States */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ ml: 2, alignSelf: 'center' }}>
              {tSessionsToUse('topInstructors.states.loading')}
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 6 }}>
            {error}
          </Alert>
        ) : instructors.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {tSessionsToUse('topInstructors.states.noInstructors')}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {instructors.map((instructor) => (
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

        {/* View All Instructors Button */}
        {!loading && !error && instructors.length > 0 && (
          <Box textAlign="center">
            <Button
              variant="outlined"
              size="large"
              onClick={handleViewAllInstructors}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              {tSessionsToUse('topInstructors.actions.viewAll')}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default TopInstructorsSection;