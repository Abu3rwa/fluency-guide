import React from 'react';
import { Box, Typography, Grid, Container, TextField, Button, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';

function Contact() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const contactInfo = [
    {
      icon: <EmailIcon sx={{ fontSize: 30 }} />,
      title: isArabic ? 'البريد الإلكتروني' : 'Email',
      content: 'contact@sudanglish.com',
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 30 }} />,
      title: isArabic ? 'الهاتف' : 'Phone',
      content: '+249 123 456 789',
    },
    {
      icon: <LocationOnIcon sx={{ fontSize: 30 }} />,
      title: isArabic ? 'العنوان' : 'Address',
      content: isArabic ? 'الخرطوم، السودان' : 'Khartoum, Sudan',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        paddingTop: { xs: 2, md: 4 },
        px: { xs: 2, sm: 3, md: 0 },
      }}
    >
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto', mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              color: 'text.primary',
              mb: 3,
            }}
          >
            {t('navigation.contact')}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              color: 'text.secondary',
              lineHeight: 1.8,
            }}
          >
            {isArabic
              ? 'نحن هنا لمساعدتك. تواصل معنا لأي استفسارات أو ملاحظات.'
              : 'We are here to help. Reach out to us for any questions or feedback.'}
          </Typography>
        </Box>

        <Grid container spacing={6}>
          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {contactInfo.map((info, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: 'white',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{info.icon}</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                    }}
                  >
                    {info.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      fontFamily: 'inherit',
                    }}
                  >
                    {info.content}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'white',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  mb: 4,
                  fontWeight: 700,
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                  color: 'primary.main',
                }}
              >
                {isArabic ? 'أرسل لنا رسالة' : 'Send us a Message'}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={isArabic ? 'الاسم' : 'Name'}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={isArabic ? 'البريد الإلكتروني' : 'Email'}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={isArabic ? 'الموضوع' : 'Subject'}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={isArabic ? 'الرسالة' : 'Message'}
                    multiline
                    rows={6}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={!isArabic && <SendIcon />}
                    startIcon={isArabic && <SendIcon />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                    }}
                  >
                    {isArabic ? 'إرسال الرسالة' : 'Send Message'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Contact;
