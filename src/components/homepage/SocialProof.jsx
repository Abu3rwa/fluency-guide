import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { StudentsIcon, CoursesIcon, BlogIcon, PrivateLessonsIcon, ProgressIcon, ProfileIcon } from '../../utils/icons';

function SocialProof() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    blogs: 0,
    instructors: 0,
    privateLessons: 0,
    totalHours: 0,
    loading: true
  });

  useEffect(() => {
    fetchRealStats();
  }, []);

  const fetchRealStats = async () => {
    try {
      // Fetch enrollments count (students)
      const enrollmentsSnap = await getDocs(
        query(collection(db, 'enrollments'), where('status', '==', 'confirmed'))
      );
      const studentsCount = enrollmentsSnap.size;

      // Fetch courses
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const coursesCount = coursesSnap.size;

      // Fetch instructors
      const instructorsSnap = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'instructor'))
      );
      const instructorsCount = instructorsSnap.size;

      // Fetch lessons and calculate total hours
      let totalMinutes = 0;
      for (const courseDoc of coursesSnap.docs) {
        const unitsSnap = await getDocs(collection(db, `courses/${courseDoc.id}/units`));
        for (const unitDoc of unitsSnap.docs) {
          const lessonsSnap = await getDocs(collection(db, `courses/${courseDoc.id}/units/${unitDoc.id}/lessons`));
          lessonsSnap.docs.forEach(lessonDoc => {
            const duration = lessonDoc.data().duration;
            if (duration) {
              totalMinutes += parseInt(duration) || 0;
            }
          });
        }
      }

      // Fetch published blog posts
      const blogsSnap = await getDocs(
        query(collection(db, 'blog_posts'), where('status', '==', 'published'))
      );
      const blogsCount = blogsSnap.size;

      // Fetch private lessons students
      const privateLessonsSnap = await getDocs(collection(db, 'private_students'));
      const privateLessonsCount = privateLessonsSnap.size;

      setStats({
        students: studentsCount,
        courses: coursesCount,
        blogs: blogsCount,
        instructors: instructorsCount || 1,
        privateLessons: privateLessonsCount,
        totalHours: Math.round(totalMinutes / 60),
        loading: false
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        students: 50,
        courses: 20,
        blogs: 0,
        instructors: 1,
        privateLessons: 0,
        totalHours: 0,
        loading: false
      });
    }
  };

  const displayStats = [
    {
      key: 'instructors',
      value: stats.instructors > 0 ? `${stats.instructors}` : '1',
      label: t('homepage.stats.instructors'),
      icon: ProfileIcon,
    },
    {
      key: 'students',
      value: stats.students > 0 ? `${stats.students}+` : '50+',
      label: t('homepage.stats.students'),
      icon: StudentsIcon,
    },
    {
      key: 'courses',
      value: stats.courses > 0 ? `${stats.courses}+` : '20+',
      label: t('homepage.stats.courses'),
      icon: CoursesIcon,
    },
    {
      key: 'hours',
      value: stats.totalHours > 0 ? `${stats.totalHours}+` : '100+',
      label: t('homepage.stats.learningHours'),
      icon: ProgressIcon,
    },
    {
      key: 'blogs',
      value: stats.blogs > 0 ? `${stats.blogs}` : '0',
      label: t('homepage.stats.blogs'),
      icon: BlogIcon,
    },
    {
      key: 'privateLessons',
      value: stats.privateLessons > 0 ? `${stats.privateLessons}+` : '0',
      label: t('homepage.stats.privateLessons'),
      icon: PrivateLessonsIcon,
    },
  ];

  return (
    <Box
      sx={{
        padding: { xs: 5, md: 10 },
        backgroundColor: 'background.paper',
        direction: isArabic ? 'rtl' : 'ltr',
      }}
    >
      {/* Section Title */}
      <Typography
        variant="h3"
        sx={{
          textAlign: 'center',
          fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
          fontWeight: 700,
          color: '#00695C',
          mb: 2,
          fontSize: { xs: '1.75rem', md: '2.5rem' },
          direction: isArabic ? 'rtl' : 'ltr',
        }}
      >
        {t('homepage.stats.title')}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
          color: 'text.secondary',
          mb: 6,
          fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
          direction: isArabic ? 'rtl' : 'ltr',
        }}
      >
        {t('homepage.stats.subtitle')}
      </Typography>

      <Grid
        container
        spacing={3}
        sx={{
          mb: 6,
          justifyContent: 'center',
          direction: isArabic ? 'rtl' : 'ltr',
        }}
      >
        {displayStats.map((stat) => (
          <Grid item xs={6} sm={4} md={2} key={stat.key}>
            <Box
              sx={{
                textAlign: 'center',
                padding: 3,
                backgroundColor: 'background.default',
                borderRadius: '16px',
                border: '1px solid transparent',
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(212, 165, 116, 0.15)',
                  borderColor: 'primary.main',
                },
              }}
            >
              {stats.loading ? (
                <>
                  <Skeleton variant="circular" width={50} height={50} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width={60} />
                  <Skeleton variant="text" width={80} />
                </>
              ) : (
                <>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <Box
                      component="img"
                      src={stat.icon}
                      alt={stat.label}
                      sx={{
                        width: 50,
                        height: 50,
                        objectFit: 'contain',
                        // No flip needed for icons - they look the same in RTL
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #D4A574 0%, #F4C430 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 0.5,
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                      direction: 'ltr', // Numbers always LTR
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                      color: 'text.secondary',
                      fontWeight: 500,
                      direction: isArabic ? 'rtl' : 'ltr',
                      textAlign: 'center',
                    }}
                  >
                    {stat.label}
                  </Typography>
                </>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Testimonial */}
      <Box
        sx={{
          textAlign: 'center',
          padding: { xs: 4, md: 6 },
          backgroundColor: 'background.default',
          borderRadius: '16px',
          border: '2px solid',
          borderColor: 'primary.main',
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative',
          direction: isArabic ? 'rtl' : 'ltr',
          '&::before': {
            content: isArabic ? '"\\201D"' : '"\\201C"', // Different quote for RTL
            position: 'absolute',
            top: '-20px',
            left: isArabic ? 'auto' : '50%',
            right: isArabic ? '50%' : 'auto',
            transform: 'translateX(50%)',
            fontSize: '80px',
            color: 'primary.main',
            fontFamily: 'serif',
            lineHeight: 1,
          },
        }}
      >
        <Typography
          variant="h4"
          component="h3"
          sx={{
            fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
            fontWeight: 600,
            mb: 2,
            color: 'text.primary',
            direction: isArabic ? 'rtl' : 'ltr',
          }}
        >
          {t('homepage.testimonials.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
            color: 'text.secondary',
            fontStyle: 'italic',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: 1.8,
            direction: isArabic ? 'rtl' : 'ltr',
            textAlign: isArabic ? 'right' : 'left',
          }}
        >
          {isArabic
            ? '"سودانجليزي ساعدني في تحسين مستواي في اللغة الإنجليزية بشكل كبير. المدرسون محترفون والدروس تفاعلية."'
            : '"Sudanglish helped me improve my English significantly. The instructors are professional and the lessons are interactive."'}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
            color: 'text.secondary',
            mt: 2,
            direction: isArabic ? 'rtl' : 'ltr',
            textAlign: isArabic ? 'right' : 'left',
          }}
        >
          {isArabic ? '- طالب سعيد' : '- Happy Student'}
        </Typography>
      </Box>
    </Box>
  );
}

export default SocialProof;