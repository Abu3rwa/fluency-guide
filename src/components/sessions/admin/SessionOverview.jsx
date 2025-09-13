import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid
} from '@mui/material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const SessionOverview = ({ totalSessions, totalEarnings, averageRating }) => {
  const { t } = useTranslation();
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('sessions.admin.dashboard.overview.totalSessions', 'Total Sessions')}
            </Typography>
            <Typography variant="h4">
              {totalSessions}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('sessions.admin.dashboard.overview.totalEarnings', 'Total Earnings')}
            </Typography>
            <Typography variant="h4">
              {totalEarnings?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('sessions.admin.performance.rating.averageRating', 'Average Rating')}
            </Typography>
            <Typography variant="h4">
              {averageRating?.toFixed(2)} / 5
            </Typography>
            
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {t('sessions.admin.overview.basedOnReviews', 'Based on {{month}} reviews', { month: format(new Date(), 'MMMM') })}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SessionOverview;