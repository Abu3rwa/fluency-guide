import React from 'react';
import { Grid, IconButton, Link as MuiLink, Box, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageSwitcher from './LanguageSwitcher';
import logo from '../../assets/logo_new.png';

function Footer() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const footerLinks = [
    {
      title: t('footer.quickLinks'), links: [
        { name: t('navigation.home'), path: '/' },
        { name: t('navigation.courses'), path: '/courses' },
        { name: t('navigation.blog'), path: '/blog' },
        { name: t('navigation.about'), path: '/about' },
        { name: t('navigation.contact'), path: '/contact' },
      ]
    },
    {
      title: t('footer.legal'), links: [
        { name: t('footer.terms'), path: '#' },
        { name: t('footer.privacy'), path: '#' },
      ]
    }
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #00695C 0%, #004D40 100%)',
        color: '#F3F4F6',
        borderTop: '4px solid #D4A574',
        pt: 8,
        pb: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          {/* Brand Column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                component="img"
                src={logo}
                alt="Sudanglish Logo"
                sx={{
                  height: '50px',
                  width: 'auto',
                  bgcolor: 'white',
                  borderRadius: '50%',
                  p: 0.5,
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                  fontWeight: 700,
                  color: '#F3F4F6',
                }}
              >
                {t('common.appName')}\n              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                mb: 3,
                color: '#9CA3AF',
                lineHeight: 1.6,
                maxWidth: '300px',
                fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
              }}
            >
              {t('footer.description')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: '#00897B', border: '1px solid #00897B', '&:hover': { bgcolor: '#00897B', color: 'white' } }}>
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: '#00897B', border: '1px solid #00897B', '&:hover': { bgcolor: '#00897B', color: 'white' } }}>
                <TwitterIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: '#00897B', border: '1px solid #00897B', '&:hover': { bgcolor: '#00897B', color: 'white' } }}>
                <InstagramIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: '#00897B', border: '1px solid #00897B', '&:hover': { bgcolor: '#00897B', color: 'white' } }}>
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Links Columns */}
          {footerLinks.map((section) => (
            <Grid item xs={6} md={2} key={section.title}>
              <Typography
                variant="h6"
                sx={{
                  color: '#D4A574',
                  fontWeight: 600,
                  mb: 3,
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                }}
              >
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {section.links.map((link) => (
                  <MuiLink
                    key={link.name}
                    component={Link}
                    to={link.path}
                    sx={{
                      color: '#D1D5DB',
                      textDecoration: 'none',
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                      transition: 'color 0.2s',
                      '&:hover': {
                        color: '#D4A574',
                      }
                    }}
                  >
                    {link.name}
                  </MuiLink>
                ))}
              </Box>
            </Grid>
          ))}

          {/* Contact Column */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              sx={{
                color: '#D4A574',
                fontWeight: 600,
                mb: 3,
                fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
              }}
            >
              {t('footer.contactUs')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: '#D1D5DB' }}>
                <EmailIcon fontSize="small" sx={{ color: '#D4A574' }} />
                <Typography variant="body2" sx={{ fontFamily: 'inherit' }}>3bdulhafeez.sd@gmail.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: '#D1D5DB' }}>
                <PhoneIcon fontSize="small" sx={{ color: '#D4A574' }} />
                <Typography className="ltr" variant="body2" sx={{ fontFamily: 'inherit' }}>+249 115 337 188</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: '#D1D5DB' }}>
                <LocationOnIcon fontSize="small" sx={{ color: '#D4A574' }} />
                <Typography variant="body2" sx={{ fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif" }}>
                  {t('footer.location')}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            mt: 6,
            pt: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#6B7280',
              fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
            }}
          >
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </Typography>
          <LanguageSwitcher />
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;

