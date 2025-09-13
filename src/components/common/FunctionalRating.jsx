import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Rating,
  Alert,
  CircularProgress
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const FunctionalRating = ({ 
  instructorId, 
  currentRating = 0, 
  reviewCount = 0, 
  onRatingSubmit = () => {},
  size = "small",
  precision = 0.5,
  showReviewCount = true,
  allowRating = true
}) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRatingClick = () => {
    if (!allowRating) return;
    
    if (!currentUser) {
      alert(t('rating.loginRequired', 'Please log in to rate this instructor'));
      return;
    }
    
    setDialogOpen(true);
    setUserRating(0);
    setReviewText('');
    setError('');
  };

  const handleSubmitRating = async () => {
    if (userRating === 0) {
      setError(t('rating.ratingRequired', 'Please select a rating'));
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      // Call the parent's rating submit handler
      await onRatingSubmit({
        instructorId,
        userId: currentUser.uid,
        rating: userRating,
        review: reviewText.trim(),
        userName: currentUser.displayName || currentUser.email
      });
      
      setDialogOpen(false);
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError(t('rating.submitError', 'Failed to submit rating. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setUserRating(0);
    setReviewText('');
    setError('');
  };

  return (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent:"space-around",
          gap: 1,
          cursor: allowRating ? 'pointer' : 'default'
        }}
        onClick={handleRatingClick}
      >
        <Rating
          value={currentRating}
          precision={precision}
          size={size}
          readOnly={!allowRating}
          icon={<StarIcon fontSize="inherit" />}
          emptyIcon={<StarIcon fontSize="inherit" />}
        />
        
        {showReviewCount && (
          <Typography variant="body2" color="text.secondary">
            {currentRating.toFixed(1)} ({reviewCount} {t('topInstructors.reviews', 'reviews')})
          </Typography>
        )}
        
        {allowRating && currentUser && (
          <Typography 
            variant="caption" 
            color="primary" 
            sx={{ 
              ml: 1,
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            {t('rating.clickToRate', 'Click to rate')}
          </Typography>
        )}
      </Box>

      {/* Rating Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('rating.dialogTitle', 'Rate This Instructor')}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              {t('rating.howWasExperience', 'How was your experience with this instructor?')}
            </Typography>
            
            <Rating
              value={userRating}
              onChange={(event, newValue) => setUserRating(newValue)}
              size="large"
              precision={0.5}
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarIcon fontSize="inherit" />}
              sx={{ fontSize: '3rem', mb: 2 }}
            />
            
            <Typography variant="body2" color="text.secondary">
              {userRating === 0 && t('rating.selectRating', 'Select a rating')}
              {userRating === 0.5 && t('rating.terrible', 'Terrible')}
              {userRating === 1 && t('rating.bad', 'Bad')}
              {userRating === 1.5 && t('rating.poor', 'Poor')}
              {userRating === 2 && t('rating.fair', 'Fair')}
              {userRating === 2.5 && t('rating.average', 'Average')}
              {userRating === 3 && t('rating.good', 'Good')}
              {userRating === 3.5 && t('rating.veryGood', 'Very Good')}
              {userRating === 4 && t('rating.excellent', 'Excellent')}
              {userRating === 4.5 && t('rating.outstanding', 'Outstanding')}
              {userRating === 5 && t('rating.perfect', 'Perfect')}
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            label={t('rating.writeReview', 'Write a review (optional)')}
            multiline
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder={t('rating.reviewPlaceholder', 'Share your experience to help other students...')}
            sx={{ mb: 2 }}
          />
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitRating}
            disabled={submitting || userRating === 0}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            {submitting 
              ? t('rating.submitting', 'Submitting...') 
              : t('rating.submitRating', 'Submit Rating')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FunctionalRating;