import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Container,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Typography,
  Avatar,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/app_logo.png';

function Header() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, logout, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isArabic, i18n.language]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavClick = () => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/');
  };

  const navLinks = [
    { key: 'home', path: '/' },
    { key: 'courses', path: '/courses' },
    { key: 'blog', path: '/blog' },
    { key: 'about', path: '/about' },
    { key: 'contact', path: '/contact' },
  ];

  // Mobile Drawer Content
  const drawer = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFFFFF',
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2.5,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#00695C',
            fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
          }}
        >
          {isArabic ? 'القائمة' : 'Menu'}
        </Typography>
        <IconButton onClick={handleDrawerToggle} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Navigation Links */}
      <List sx={{ flex: 1, py: 2 }}>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <ListItem key={link.key} disablePadding>
              <ListItemButton
                component={Link}
                to={link.path}
                onClick={handleNavClick}
                sx={{
                  py: 1.5,
                  px: 3,
                  mx: 1.5,
                  borderRadius: 2,
                  mb: 0.5,
                  bgcolor: isActive ? 'rgba(0, 105, 92, 0.08)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(0, 105, 92, 0.05)',
                  },
                }}
              >
                <ListItemText
                  primary={t(`navigation.${link.key}`)}
                  sx={{
                    '& .MuiTypography-root': {
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '1rem',
                      color: isActive ? '#00695C' : '#374151',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Language Switcher */}
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <LanguageSwitcher />
      </Box>

      {/* Auth Buttons in Drawer */}
      {!isAuthenticated && (
        <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            component={Link}
            to="/login"
            onClick={handleNavClick}
            fullWidth
            sx={{
              py: 1.5,
              mb: 1.5,
              color: '#00695C',
              border: '2px solid #00695C',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.95rem',
              textTransform: 'none',
              fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
              '&:hover': {
                bgcolor: 'rgba(0, 105, 92, 0.05)',
                borderColor: '#004D40',
              },
            }}
          >
            {t('navigation.login')}
          </Button>
          <Button
            component={Link}
            to="/register"
            onClick={handleNavClick}
            fullWidth
            sx={{
              py: 1.5,
              bgcolor: '#00695C',
              color: '#FFFFFF',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.95rem',
              textTransform: 'none',
              fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
              '&:hover': {
                bgcolor: '#004D40',
              },
            }}
          >
            {t('navigation.signup')}
          </Button>
        </Box>
      )}

      {/* User Info in Drawer (when logged in) */}
      {isAuthenticated && userProfile && (
        <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: '#00695C',
                fontSize: '1.1rem',
                fontWeight: 700,
              }}
            >
              {(userProfile?.name || user?.email)?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                {userProfile?.name || user?.email?.split('@')[0]}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                {userProfile?.role}
              </Typography>
            </Box>
          </Box>

          {userProfile?.role === 'student' && (
            <Button
              component={Link}
              to="/student/my-courses"
              onClick={handleNavClick}
              fullWidth
              sx={{
                py: 1.2,
                mb: 1,
                justifyContent: 'flex-start',
                color: '#374151',
                borderRadius: 2,
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(0, 105, 92, 0.05)' },
              }}
            >
              {isArabic ? 'دوراتي' : 'My Courses'}
            </Button>
          )}

          {userProfile?.role === 'instructor' && (
            <Button
              component={Link}
              to="/instructor/dashboard"
              onClick={handleNavClick}
              fullWidth
              sx={{
                py: 1.2,
                mb: 1,
                justifyContent: 'flex-start',
                color: '#374151',
                borderRadius: 2,
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(0, 105, 92, 0.05)' },
              }}
            >
              {isArabic ? 'لوحة التحكم' : 'Dashboard'}
            </Button>
          )}

          {userProfile?.isAdmin && (
            <>
              <Button
                component={Link}
                to="/admin/users"
                onClick={handleNavClick}
                fullWidth
                sx={{
                  py: 1.2,
                  mb: 1,
                  justifyContent: 'flex-start',
                  color: '#374151',
                  borderRadius: 2,
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(0, 105, 92, 0.05)' },
                }}
              >
                {isArabic ? 'إدارة المستخدمين' : 'User Management'}
              </Button>
              <Button
                component={Link}
                to="/admin/analytics/blog"
                onClick={handleNavClick}
                fullWidth
                sx={{
                  py: 1.2,
                  mb: 1,
                  justifyContent: 'flex-start',
                  color: '#374151',
                  borderRadius: 2,
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(0, 105, 92, 0.05)' },
                }}
              >
                {isArabic ? 'إحصائيات المدونة' : 'Blog Analytics'}
              </Button>
            </>
          )}

          <Button
            onClick={() => {
              handleNavClick();
              handleLogout();
            }}
            fullWidth
            sx={{
              py: 1.2,
              justifyContent: 'flex-start',
              color: '#dc2626',
              borderRadius: 2,
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.05)' },
            }}
          >
            {isArabic ? 'تسجيل الخروج' : 'Logout'}
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      sx={{
        background: '#FFFFFF',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        zIndex: theme.zIndex.drawer + 1
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 }, gap: 2 }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              gap: 1.5,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Sudanglish Logo"
              sx={{
                height: { xs: 40, md: 48 },
                width: 'auto',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#00695C',
                fontFamily: isArabic ? 'Tajawal, sans-serif' : 'Montserrat, sans-serif',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {isArabic ? 'سودانجلش' : 'Sudanglish'}
            </Typography>
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Button
                    key={link.key}
                    component={Link}
                    to={link.path}
                    onClick={handleNavClick}
                    sx={{
                      color: isActive ? '#00695C' : '#4B5563',
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                      fontSize: '0.95rem',
                      fontWeight: isActive ? 600 : 500,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      position: 'relative',
                      '&::after': isActive ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 20,
                        height: 2,
                        bgcolor: '#00695C',
                        borderRadius: 1,
                      } : {},
                      '&:hover': {
                        color: '#00695C',
                        bgcolor: 'rgba(0, 105, 92, 0.05)',
                      },
                    }}
                  >
                    {t(`navigation.${link.key}`)}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {!isMobile && <LanguageSwitcher />}

            {isAuthenticated && userProfile ? (
              <>
                <Button
                  onClick={handleMenuOpen}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.75,
                    px: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(0, 105, 92, 0.05)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 105, 92, 0.1)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: '#00695C',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                    }}
                  >
                    {(userProfile?.name || user?.email)?.[0]?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ textAlign: 'left', display: { xs: 'none', lg: 'block' } }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: '#1a1a2e',
                        lineHeight: 1.2,
                        fontSize: '0.85rem',
                      }}
                    >
                      {userProfile?.name || user?.email?.split('@')[0]}
                    </Typography>
                  </Box>
                  <KeyboardArrowDownIcon sx={{ color: '#6B7280', fontSize: 20 }} />
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: isArabic ? 'left' : 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: isArabic ? 'left' : 'right',
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  {/* User Info */}
                  <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                      {userProfile?.name || user?.email?.split('@')[0]}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                      {userProfile?.role}
                    </Typography>
                  </Box>

                  {userProfile?.role === 'student' && (
                    <MenuItem
                      component={Link}
                      to="/student/my-courses"
                      onClick={handleMenuClose}
                      sx={{ py: 1.5, px: 2 }}
                    >
                      <Typography variant="body2">{isArabic ? 'دوراتي' : 'My Courses'}</Typography>
                    </MenuItem>
                  )}

                  {userProfile?.role === 'instructor' && (
                    <MenuItem
                      component={Link}
                      to="/instructor/dashboard"
                      onClick={handleMenuClose}
                      sx={{ py: 1.5, px: 2 }}
                    >
                      <Typography variant="body2">{isArabic ? 'لوحة التحكم' : 'Dashboard'}</Typography>
                    </MenuItem>
                  )}

                  {userProfile?.isAdmin && (
                    <MenuItem
                      component={Link}
                      to="/admin/users"
                      onClick={handleMenuClose}
                      sx={{ py: 1.5, px: 2 }}
                    >
                      <Typography variant="body2">{isArabic ? 'إدارة المستخدمين' : 'User Management'}</Typography>
                    </MenuItem>
                  )}

                  <Divider />

                  <MenuItem
                    onClick={handleLogout}
                    sx={{ py: 1.5, px: 2, color: '#dc2626' }}
                  >
                    <Typography variant="body2">{isArabic ? 'تسجيل الخروج' : 'Logout'}</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              !isMobile && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    component={Link}
                    to="/login"
                    sx={{
                      color: '#00695C',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      px: 2.5,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                      '&:hover': {
                        bgcolor: 'rgba(0, 105, 92, 0.05)',
                      },
                    }}
                  >
                    {t('navigation.login')}
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    sx={{
                      bgcolor: '#00695C',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      px: 2.5,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                      '&:hover': {
                        bgcolor: '#004D40',
                      },
                    }}
                  >
                    {t('navigation.signup')}
                  </Button>
                </Box>
              )
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                aria-label="open drawer"
                onClick={handleDrawerToggle}
                sx={{
                  color: '#374151',
                  p: 1,
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor={isArabic ? 'left' : 'right'}
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}

export default Header;