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
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CloseIcon from '@mui/icons-material/Close';
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

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.key} disablePadding>
            <ListItemButton
              component={Link}
              to={link.path}
              onClick={handleNavClick}
              selected={location.pathname === link.path}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'rgba(244, 196, 48, 0.15)',
                  borderRight: isArabic ? 'none' : '3px solid',
                  borderLeft: isArabic ? '3px solid' : 'none',
                  borderColor: 'primary.light',
                },
              }}
            >
              <ListItemText
                primary={t(`navigation.${link.key}`)}
                sx={{
                  '& .MuiTypography-root': {
                    fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ px: 2, mt: 2 }}>
        <LanguageSwitcher />
      </Box>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'linear-gradient(135deg, #00695C 0%, #004D40 100%)',
        borderBottom: '2px solid #D4A574',
        boxShadow: 2,
        borderRadius: 0,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 70 } }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              flexGrow: { xs: 1, md: 0 },
              mr: { md: 4 },
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Sudanglish Logo"
              sx={{
                height: { xs: '50px', md: '65px' },
                width: 'auto',
                bgcolor: 'white',
                borderRadius: '50%',
                p: 0.5,
                mr: isArabic ? 0 : 3,
                ml: isArabic ? 3 : 0,
              }}
            />
            <Box
              component="h2"
              sx={{
                fontSize: { xs: '20px', md: '24px' },
                fontWeight: 700,
                color: '#FFFFFF',
                fontFamily: isArabic ? 'Tajawal, sans-serif' : 'Montserrat, sans-serif',
                m: 0,
                display: { xs: 'none', sm: 'block' }, // Hide text on small screens if needed
              }}
            >
              {isArabic ? 'سودانجلش' : 'Sudanglish'}
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1 }}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Button
                    key={link.key}
                    component={Link}
                    to={link.path}
                    onClick={handleNavClick}
                    sx={{
                      color: isActive ? 'primary.light' : '#FFFFFF',
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                      fontSize: '16px',
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      bgcolor: isActive ? 'rgba(244, 196, 48, 0.15)' : 'transparent',
                      borderBottom: isActive ? '2px solid' : 'none',
                      borderColor: 'primary.light',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: 'primary.light',
                        bgcolor: 'rgba(244, 196, 48, 0.15)',
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
                  endIcon={<PersonIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    color: '#FFFFFF',
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    fontWeight: 600,
                    fontSize: '15px',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                      borderColor: 'rgba(255,255,255,0.5)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      mr: 1,
                      bgcolor: '#D4A574',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                    }}
                  >
                    {(userProfile?.name || user?.email)?.[0]?.toUpperCase()}
                  </Avatar>
                  {userProfile?.name || user?.email?.split('@')[0]}
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
                      mt: 1.5,
                      minWidth: 220,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      overflow: 'visible',
                      '&::before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: isArabic ? 'auto' : 14,
                        left: isArabic ? 14 : 'auto',
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                >
                  {/* User Info Section */}
                  <Box sx={{ px: 2, py: 2, background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: '#D4A574',
                          fontSize: '1.25rem',
                          fontWeight: 700,
                        }}
                      >
                        {(userProfile?.name || user?.email)?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            color: '#FFFFFF',
                            fontSize: '0.95rem',
                            lineHeight: 1.2,
                          }}
                        >
                          {userProfile?.name || user?.email?.split('@')[0]}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.75rem',
                            textTransform: 'capitalize',
                          }}
                        >
                          {userProfile?.role || 'User'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Divider />
                  {userProfile?.role === 'student' && (
                    <MenuItem
                      component={Link}
                      to="/student/my-courses"
                      onClick={() => {
                        handleMenuClose();
                        setMobileOpen(false);
                      }}
                      sx={{
                        gap: 1.5,
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          bgcolor: 'rgba(0, 137, 123, 0.08)',
                          '& .MuiSvgIcon-root': { color: '#00897B' },
                        },
                      }}
                    >
                      <DashboardIcon fontSize="small" sx={{ color: '#00897B' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {isArabic ? 'دوراتي' : 'My Courses'}
                      </Typography>
                    </MenuItem>
                  )}
                  {userProfile?.role === 'instructor' && (
                    <MenuItem
                      component={Link}
                      to="/instructor/dashboard"
                      onClick={() => {
                        handleMenuClose();
                        setMobileOpen(false);
                      }}
                      sx={{
                        gap: 1.5,
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          bgcolor: 'rgba(0, 137, 123, 0.08)',
                          '& .MuiSvgIcon-root': { color: '#00897B' },
                        },
                      }}
                    >
                      <DashboardIcon fontSize="small" sx={{ color: '#00897B' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {isArabic ? 'لوحة التحكم' : 'Dashboard'}
                      </Typography>
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      gap: 1.5,
                      py: 1.5,
                      px: 2,
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: 'rgba(211, 47, 47, 0.08)',
                      },
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {isArabic ? 'تسجيل الخروج' : 'Logout'}
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              !isMobile && (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    startIcon={<LoginIcon />}
                    sx={{
                      color: 'primary.light',
                      borderColor: 'primary.light',
                      borderWidth: 2,
                      borderStyle: 'solid',
                      fontWeight: 600,
                      fontSize: '15px',
                      px: 2.5,
                      py: 1,
                      borderRadius: 1,
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: '#374151',
                        borderColor: 'primary.light',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(244, 196, 48, 0.25)',
                      },
                    }}
                  >
                    {t('navigation.login')}
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    startIcon={<PersonAddIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #D4A574 0%, #F4C430 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '15px',
                      px: 3,
                      py: 1,
                      borderRadius: 1,
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(212, 165, 116, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #B8860B 0%, #D4A574 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(212, 165, 116, 0.4)',
                      },
                    }}
                  >
                    {t('navigation.signup')}
                  </Button>
                </>
              )
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)'
                  }
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
          keepMounted: true, // Better mobile performance
        }}
      >
        {drawer}
        {!isAuthenticated && (
          <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              component={Link}
              to="/login"
              onClick={handleNavClick}
              startIcon={<LoginIcon />}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              {t('navigation.login')}
            </Button>
            <Button
              component={Link}
              to="/register"
              onClick={handleNavClick}
              startIcon={<PersonAddIcon />}
              variant="contained"
              fullWidth
              sx={{
                background: 'linear-gradient(135deg, #D4A574 0%, #F4C430 100%)',
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              {t('navigation.signup')}
            </Button>
          </Box>
        )}
      </Drawer>
    </AppBar>
  );
}

export default Header;
