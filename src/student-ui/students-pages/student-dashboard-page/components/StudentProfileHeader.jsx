import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

const StudentProfileHeader = ({
  user,
  displayName,
  avatar,
  onEditProfile,
  onSettings,
  onLogout,
  userStats = {},
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    currentStreak = 0,
    totalPoints = 0,
    todayStudyMinutes = 0,
    enrolledCoursesCount = 0,
  } = userStats;

  const formatStudyTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <Card
      elevation={2}
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        mb: 3,
        borderRadius: 3,
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: { xs: 2, sm: 3 },
          }}
        >
          {/* Avatar Section */}
          <Avatar
            src={avatar}
            alt={displayName}
            sx={{
              width: { xs: 80, sm: 100, md: 120 },
              height: { xs: 80, sm: 100, md: 120 },
              border: '4px solid rgba(255, 255, 255, 0.2)',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            {displayName?.charAt(0)?.toUpperCase()}
          </Avatar>

          {/* Profile Info */}
          <Box
            sx={{
              flex: 1,
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              component="h1"
              sx={{
                fontWeight: 600,
                mb: 1,
                wordBreak: 'break-word',
              }}
            >
              {displayName || t('student.dashboard.profile.welcome')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                opacity: 0.9,
                mb: 2,
              }}
            >
              {user?.email}
            </Typography>

            {/* Stats Chips */}
            <Stack
              direction={isSmallMobile ? 'column' : 'row'}
              spacing={1}
              sx={{
                justifyContent: { xs: 'center', sm: 'flex-start' },
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Chip
                label={`${t('student.dashboard.profile.streak')}: ${currentStreak} ${t('student.dashboard.profile.days')}`}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              />
              <Chip
                label={`${t('student.dashboard.profile.points')}: ${totalPoints.toLocaleString()}`}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              />
              <Chip
                label={`${t('student.dashboard.profile.todayStudy')}: ${formatStudyTime(todayStudyMinutes)}`}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              />
              <Chip
                label={`${t('student.dashboard.profile.courses')}: ${enrolledCoursesCount}`}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              />
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'row', sm: 'column' },
              gap: 1,
            }}
          >
            <IconButton
              onClick={onEditProfile}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
                minWidth: { xs: 44, sm: 48 },
                minHeight: { xs: 44, sm: 48 },
              }}
              aria-label={t('student.dashboard.profile.editProfile')}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={onSettings}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
                minWidth: { xs: 44, sm: 48 },
                minHeight: { xs: 44, sm: 48 },
              }}
              aria-label={t('student.dashboard.profile.settings')}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton
              onClick={onLogout}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
                minWidth: { xs: 44, sm: 48 },
                minHeight: { xs: 44, sm: 48 },
              }}
              aria-label={t('student.dashboard.profile.logout')}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StudentProfileHeader;