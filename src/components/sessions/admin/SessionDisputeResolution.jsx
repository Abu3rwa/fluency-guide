import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Alert,
  Divider,
  Grid,
  useTheme
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const SessionDisputeResolution = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  // State management
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolutionType, setResolutionType] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock dispute data - in real app, this would come from API
  useEffect(() => {
    loadDisputeData();
  }, []);

  const loadDisputeData = async () => {
    try {
      setLoading(true);
      
      // Mock dispute data
      const mockDisputes = [
        {
          id: 'dispute-1',
          sessionId: 'session-123',
          studentId: 'student-456',
          instructorId: 'instructor-789',
          studentName: 'Ahmed Hassan',
          instructorName: 'Sarah Johnson',
          sessionType: 'General English Conversation',
          sessionDate: '2024-01-15T10:00:00Z',
          disputeType: 'no_show',
          status: 'pending',
          priority: 'high',
          createdAt: '2024-01-15T12:30:00Z',
          description: 'Student claims instructor did not show up for the scheduled session.',
          amount: 50,
          currency: 'LYD'
        },
        {
          id: 'dispute-2',
          sessionId: 'session-124',
          studentId: 'student-457',
          instructorId: 'instructor-790',
          studentName: 'Fatima Al-Zahra',
          instructorName: 'Michael Brown',
          sessionType: 'Business English',
          sessionDate: '2024-01-14T14:00:00Z',
          disputeType: 'quality_concern',
          status: 'in_review',
          priority: 'medium',
          createdAt: '2024-01-14T16:15:00Z',
          description: 'Student reports poor audio quality and connection issues during the session.',
          amount: 75,
          currency: 'LYD'
        },
        {
          id: 'dispute-3',
          sessionId: 'session-125',
          studentId: 'student-458',
          instructorId: 'instructor-791',
          studentName: 'Omar Khalil',
          instructorName: 'Lisa Smith',
          sessionType: 'IELTS Preparation',
          sessionDate: '2024-01-13T16:30:00Z',
          disputeType: 'refund_request',
          status: 'resolved',
          priority: 'low',
          createdAt: '2024-01-13T18:45:00Z',
          description: 'Student requests refund due to dissatisfaction with teaching methodology.',
          amount: 100,
          currency: 'LYD',
          resolution: 'Partial refund granted (50%) and additional session offered.',
          resolvedAt: '2024-01-14T10:00:00Z',
          resolvedBy: 'Admin Team'
        }
      ];

      setDisputes(mockDisputes);
    } catch (error) {
      console.error('Error loading dispute data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (dispute) => {
    setSelectedDispute(dispute);
    setDetailsDialog(true);
  };

  const handleResolveDispute = async () => {
    try {
      if (!selectedDispute || !resolution.trim() || !resolutionType) return;

      // In real app, this would make API call to resolve dispute
      const updatedDispute = {
        ...selectedDispute,
        status: 'resolved',
        resolution: resolution,
        resolutionType: resolutionType,
        resolvedAt: new Date().toISOString(),
        resolvedBy: 'Current Admin' // Would be actual admin user
      };

      // Update disputes list
      setDisputes(prev => 
        prev.map(d => d.id === selectedDispute.id ? updatedDispute : d)
      );

      // Close dialog and reset form
      setDetailsDialog(false);
      setResolution('');
      setResolutionType('');
      setSelectedDispute(null);

    } catch (error) {
      console.error('Error resolving dispute:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'error';
      case 'in_review': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getDisputeTypeIcon = (type) => {
    switch (type) {
      case 'no_show': return <PersonIcon />;
      case 'quality_concern': return <WarningIcon />;
      case 'refund_request': return <MoneyIcon />;
      default: return <MessageIcon />;
    }
  };

  const DisputeDetailsDialog = () => (
    <Dialog 
      open={detailsDialog} 
      onClose={() => setDetailsDialog(false)}
      maxWidth="md"
      fullWidth
    >
      {selectedDispute && (
        <>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'error.main' }}>
                <GavelIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {t('sessions.disputes.disputeDetails')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  #{selectedDispute.id}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={3}>
              {/* Dispute Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  {t('sessions.disputes.disputeInfo')}
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    {t('sessions.disputes.type')}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getDisputeTypeIcon(selectedDispute.disputeType)}
                    <Typography>
                      {t(`sessions.disputes.types.${selectedDispute.disputeType}`)}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    {t('sessions.disputes.status')}
                  </Typography>
                  <Chip 
                    label={t(`sessions.disputes.statuses.${selectedDispute.status}`)}
                    color={getStatusColor(selectedDispute.status)}
                    size="small"
                  />
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    {t('sessions.disputes.priority')}
                  </Typography>
                  <Chip 
                    label={t(`sessions.disputes.priorities.${selectedDispute.priority}`)}
                    color={getPriorityColor(selectedDispute.priority)}
                    size="small"
                  />
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    {t('sessions.disputes.amount')}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {selectedDispute.amount} {selectedDispute.currency}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    {t('sessions.disputes.description')}
                  </Typography>
                  <Typography>
                    {selectedDispute.description}
                  </Typography>
                </Box>
              </Grid>

              {/* Session Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  {t('sessions.disputes.sessionInfo')}
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    {t('sessions.disputes.sessionType')}
                  </Typography>
                  <Typography>
                    {selectedDispute.sessionType}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    {t('sessions.disputes.sessionDate')}
                  </Typography>
                  <Typography>
                    {dayjs(selectedDispute.sessionDate).format('MMM DD, YYYY HH:mm')}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    {t('sessions.disputes.student')}
                  </Typography>
                  <Typography>
                    {selectedDispute.studentName}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    {t('sessions.disputes.instructor')}
                  </Typography>
                  <Typography>
                    {selectedDispute.instructorName}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    {t('sessions.disputes.reportedAt')}
                  </Typography>
                  <Typography>
                    {dayjs(selectedDispute.createdAt).format('MMM DD, YYYY HH:mm')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Resolution Section */}
            {selectedDispute.status !== 'resolved' && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  {t('sessions.disputes.resolution')}
                </Typography>
                
                <Box mb={2}>
                  <TextField
                    select
                    fullWidth
                    label={t('sessions.disputes.resolutionType')}
                    value={resolutionType}
                    onChange={(e) => setResolutionType(e.target.value)}
                  >
                    <MenuItem value="full_refund">{t('sessions.disputes.resolutionTypes.full_refund')}</MenuItem>
                    <MenuItem value="partial_refund">{t('sessions.disputes.resolutionTypes.partial_refund')}</MenuItem>
                    <MenuItem value="reschedule">{t('sessions.disputes.resolutionTypes.reschedule')}</MenuItem>
                    <MenuItem value="no_action">{t('sessions.disputes.resolutionTypes.no_action')}</MenuItem>
                    <MenuItem value="additional_session">{t('sessions.disputes.resolutionTypes.additional_session')}</MenuItem>
                  </TextField>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={t('sessions.disputes.resolutionNotes')}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder={t('sessions.disputes.resolutionPlaceholder')}
                />
              </>
            )}

            {/* Existing Resolution */}
            {selectedDispute.status === 'resolved' && (
              <>
                <Divider sx={{ my: 3 }} />
                <Alert severity="success">
                  <Typography variant="h6" gutterBottom>
                    {t('sessions.disputes.resolvedTitle')}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>{t('sessions.disputes.resolvedBy')}:</strong> {selectedDispute.resolvedBy}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>{t('sessions.disputes.resolvedAt')}:</strong> {dayjs(selectedDispute.resolvedAt).format('MMM DD, YYYY HH:mm')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{t('sessions.disputes.resolution')}:</strong> {selectedDispute.resolution}
                  </Typography>
                </Alert>
              </>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setDetailsDialog(false)}>
              {t('common.close')}
            </Button>
            {selectedDispute.status !== 'resolved' && (
              <Button
                onClick={handleResolveDispute}
                variant="contained"
                disabled={!resolution.trim() || !resolutionType}
                startIcon={<CheckCircleIcon />}
              >
                {t('sessions.disputes.resolveDispute')}
              </Button>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>{t('sessions.disputes.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          {t('sessions.disputes.title')}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {t('sessions.disputes.subtitle')}
        </Typography>
      </Box>

      {/* Disputes Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('sessions.disputes.dispute')}</TableCell>
                  <TableCell>{t('sessions.disputes.parties')}</TableCell>
                  <TableCell>{t('sessions.disputes.sessionDate')}</TableCell>
                  <TableCell>{t('sessions.disputes.amount')}</TableCell>
                  <TableCell>{t('sessions.disputes.priority')}</TableCell>
                  <TableCell>{t('sessions.disputes.status')}</TableCell>
                  <TableCell align="center">{t('sessions.disputes.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {disputes.map((dispute) => (
                  <TableRow key={dispute.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          #{dispute.id}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          {getDisputeTypeIcon(dispute.disputeType)}
                          <Typography variant="caption" color="textSecondary">
                            {t(`sessions.disputes.types.${dispute.disputeType}`)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {dispute.studentName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          vs {dispute.instructorName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(dispute.sessionDate).format('MMM DD, YYYY')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {dayjs(dispute.sessionDate).format('HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {dispute.amount} {dispute.currency}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={t(`sessions.disputes.priorities.${dispute.priority}`)}
                        color={getPriorityColor(dispute.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={t(`sessions.disputes.statuses.${dispute.status}`)}
                        color={getStatusColor(dispute.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewDetails(dispute)}
                      >
                        {t('sessions.disputes.viewDetails')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {disputes.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            {t('sessions.disputes.noDisputes')}
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            {t('sessions.disputes.noDisputesDesc')}
          </Typography>
        </Box>
      )}

      {/* Dispute Details Dialog */}
      <DisputeDetailsDialog />
    </Box>
  );
};

export default SessionDisputeResolution;