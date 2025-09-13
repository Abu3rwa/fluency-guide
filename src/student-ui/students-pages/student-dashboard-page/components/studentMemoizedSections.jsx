import React, { memo } from 'react';
import { Box, Fade } from '@mui/material';

// Import simplified Student-prefixed components
import StudentProgressOverview from './StudentProgressOverview';
import StudentRecentActivities from './StudentRecentActivities';
import StudentQuickActions from './StudentQuickActions';
import ReviewQueueWidget from './ReviewQueueWidget';

// Memoized section wrapper with fade animation
const MemoizedSection = memo(({ children, timeout, ...props }) => (
  <Fade in timeout={timeout}>
    <Box {...props}>
      {children}
    </Box>
  </Fade>
));

MemoizedSection.displayName = 'MemoizedSection';

// Memoized Progress Overview Section
export const MemoizedProgressOverview = memo(({ todayStats, goals, loading, error, timeout }) => (
  <MemoizedSection timeout={timeout}>
    <StudentProgressOverview
      todayStats={todayStats}
      goals={goals}
      loading={loading}
    />
  </MemoizedSection>
));

MemoizedProgressOverview.displayName = 'MemoizedProgressOverview';

// Memoized Review Queue Widget
export const MemoizedReviewQueue = memo(({ userId, timeout }) => (
  <MemoizedSection timeout={timeout}>
    <ReviewQueueWidget userId={userId} />
  </MemoizedSection>
));

MemoizedReviewQueue.displayName = 'MemoizedReviewQueue';

// Memoized Recent Activities Section
export const MemoizedRecentActivities = memo(({ 
  activities, 
  onActivityClick, 
  onViewAll, 
  loading, 
  error, 
  timeout 
}) => (
  <MemoizedSection timeout={timeout}>
    <StudentRecentActivities
      activities={activities}
      onActivityClick={onActivityClick}
      onViewAll={onViewAll}
      loading={loading}
    />
  </MemoizedSection>
));

MemoizedRecentActivities.displayName = 'MemoizedRecentActivities';

// Memoized Quick Actions Section
export const MemoizedQuickActions = memo(({ 
  onEditProfile, 
  pinnedActions, 
  onPinAction, 
  timeout 
}) => (
  <MemoizedSection timeout={timeout}>
    <StudentQuickActions
      onEditProfile={onEditProfile}
      pinnedActions={pinnedActions}
      onPinAction={onPinAction}
    />
  </MemoizedSection>
));

MemoizedQuickActions.displayName = 'MemoizedQuickActions';

// Export all memoized components
export default {
  MemoizedProgressOverview,
  MemoizedReviewQueue,
  MemoizedRecentActivities,
  MemoizedQuickActions,
};