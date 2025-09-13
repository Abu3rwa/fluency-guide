import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Import session-related components
import InstructorRoleManagement from '../../components/sessions/admin/InstructorRoleManagement';
import InstructorPerformanceMetrics from '../../components/sessions/admin/InstructorPerformanceMetrics';
 
// Import services
import userService from '../../services/userService';

const AdminInstructorManagementPage = () => {
  const { t } = useTranslation();
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [instructors, setInstructors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalInstructors: 0,
    activeInstructors: 0,
    pendingInstructors: 0,
    totalUsers: 0
  });

  // Load data on component mount
  useEffect(() => {
    loadInstructorData();
  }, []);

  const loadInstructorData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load instructors and all users
      const [instructorData, userData] = await Promise.all([
        userService.getUsersByRole('isInstructor'),
        userService.getAllUsers()
      ]);

      setInstructors(instructorData || []);
      setAllUsers(userData || []);
      
      // Calculate statistics
      calculateStats(instructorData, userData);
      
    } catch (err) {
      console.error('Error loading instructor data:', err);
      setError(t('admin.instructors.errorLoading', 'Error loading instructor data'));
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (instructorData, userData) => {
    const totalInstructors = instructorData.length;
    const activeInstructors = instructorData.filter(i => i.instructorProfile?.isActive !== false).length;
    const pendingInstructors = instructorData.filter(i => !i.instructorProfile).length;
    const totalUsers = userData.length;

    setStats({
      totalInstructors,
      activeInstructors,
      pendingInstructors,
      totalUsers
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInstructorCreate = async (userData) => {
    try {
      await userService.updateUserRole(userData.id, { isInstructor: true });
      await loadInstructorData(); // Refresh data
    } catch (error) {
      console.error('Error creating instructor:', error);
      setError(t('admin.instructors.errorCreating', 'Error creating instructor'));
    }
  };

  const handleInstructorUpdate = async (instructorId, updateData) => {
    try {
      await userService.updateUserProfile(instructorId, updateData);
      await loadInstructorData(); // Refresh data
    } catch (error) {
      console.error('Error updating instructor:', error);
      setError(t('admin.instructors.errorUpdating', 'Error updating instructor'));
    }
  };

  const handleInstructorDelete = async (instructorId) => {
    try {
      await userService.updateUserRole(instructorId, { isInstructor: false });
      await loadInstructorData(); // Refresh data
    } catch (error) {
      console.error('Error removing instructor:', error);
      setError(t('admin.instructors.errorDeleting', 'Error removing instructor'));
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const roleUpdate = { isInstructor: newRole === 'instructor' };
      if (newRole === 'admin') {
        roleUpdate.isAdmin = true;
      }
      
      await userService.updateUserRole(userId, roleUpdate);
      await loadInstructorData(); // Refresh data
    } catch (error) {
      console.error('Error changing user role:', error);
      setError(t('admin.instructors.errorRoleChange', 'Error changing user role'));
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h6" component="div">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.main`,
              color: `${color}.contrastText`,
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          {t('admin.instructors.title', 'Instructor Management')}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {t('admin.instructors.subtitle', 'Manage instructor roles, permissions, and performance metrics for private session bookings.')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
 

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('admin.instructors.totalInstructors', 'Total Instructors')}
            value={stats.totalInstructors}
            icon={<SchoolIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('admin.instructors.activeInstructors', 'Active Instructors')}
            value={stats.activeInstructors}
            icon={<PeopleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('admin.instructors.pendingSetup', 'Pending Setup')}
            value={stats.pendingInstructors}
            icon={<PersonAddIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('admin.instructors.totalUsers', 'Total Users')}
            value={stats.totalUsers}
            icon={<TrendingUpIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              icon={<PeopleIcon />} 
              label={t('admin.instructors.roleManagement', 'Role Management')} 
              iconPosition="start"
            />
            <Tab 
              icon={<AssessmentIcon />} 
              label={t('admin.instructors.performanceMetrics', 'Performance Metrics')} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <InstructorRoleManagement
              instructors={instructors}
              allUsers={allUsers}
              onInstructorCreate={handleInstructorCreate}
              onInstructorUpdate={handleInstructorUpdate}
              onInstructorDelete={handleInstructorDelete}
              onRoleChange={handleRoleChange}
            />
          )}
          
          {activeTab === 1 && (
            <InstructorPerformanceMetrics />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminInstructorManagementPage;