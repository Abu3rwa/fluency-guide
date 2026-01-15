import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

/**
 * ProtectedRoute component for role-based access control
 * @param {React.ReactNode} children - Component to render if authorized
 * @param {string|string[]} requiredRole - Role(s) required to access the route
 * @returns {React.ReactNode}
 */
function ProtectedRoute({ children, requiredRole = null }) {
  const { user, userProfile, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  // Still loading user data
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="textSecondary">
          {isArabic ? 'جاري التحميل...' : 'Loading...'}
        </Typography>
      </Box>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userRole = userProfile?.role || 'student';
    const isAdmin = userProfile?.isAdmin === true;

    // Check if user has required role
    // 'admin' is a special case - check isAdmin flag instead of role
    const hasAccess = rolesArray.some(role => {
      if (role === 'admin') return isAdmin;
      return userRole === role;
    });

    if (!hasAccess) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            padding: 2,
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
            {isArabic ? 'وصول مرفوض' : 'Access Denied'}
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 3 }}>
            {isArabic
              ? 'أنت لا تملك الصلاحيات المطلوبة للوصول إلى هذه الصفحة'
              : 'You do not have permission to access this page'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {isArabic ? `دورك الحالي: ${userRole}` : `Your role: ${userRole}`}
          </Typography>
        </Box>
      );
    }
  }

  return children;
}

export default ProtectedRoute;
