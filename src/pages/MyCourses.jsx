import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Button,
    CircularProgress,
    Alert,
    Container,
    Chip,
    Paper,
    LinearProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

function MyCourses() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const { user } = useAuth();
    const navigate = useNavigate();

    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user?.uid) {
            fetchEnrolledCourses();
        }
    }, [user?.uid]);

    const fetchEnrolledCourses = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get user's enrollments (both confirmed and pending)
            const enrollmentsRef = collection(db, 'enrollments');
            const enrollmentsQuery = query(
                enrollmentsRef,
                where('email', '==', user.email)
            );
            const enrollmentsSnap = await getDocs(enrollmentsQuery);

            if (enrollmentsSnap.empty) {
                setEnrolledCourses([]);
                setLoading(false);
                return;
            }

            // Create a map of courseId to enrollment status
            const enrollmentMap = {};
            enrollmentsSnap.docs.forEach(doc => {
                const data = doc.data();
                enrollmentMap[data.courseId] = data.status;
            });

            // Get course IDs from enrollments
            const courseIds = Object.keys(enrollmentMap);

            // Fetch course details
            const coursesRef = collection(db, 'courses');
            const coursesPromises = courseIds.map(async (courseId) => {
                const courseDoc = await getDocs(query(coursesRef, where('__name__', '==', courseId)));
                if (!courseDoc.empty) {
                    return {
                        id: courseDoc.docs[0].id,
                        ...courseDoc.docs[0].data(),
                        enrollmentStatus: enrollmentMap[courseId]
                    };
                }
                return null;
            });

            const courses = await Promise.all(coursesPromises);
            setEnrolledCourses(courses.filter(course => course !== null));
        } catch (err) {
            console.error('Error fetching enrolled courses:', err);
            setError(isArabic ? 'خطأ في تحميل الدورات' : 'Error loading courses');
        } finally {
            setLoading(false);
        }
    };

    const handleViewCourse = (courseId) => {
        navigate(`/student/course/${courseId}`);
    };

    if (!user) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="warning">
                    {isArabic ? 'يرجى تسجيل الدخول' : 'Please login to view your courses'}
                </Alert>
            </Container>
        );
    }

    // Calculate stats
    const confirmedCourses = enrolledCourses.filter(c => c.enrollmentStatus === 'confirmed');
    const pendingCourses = enrolledCourses.filter(c => c.enrollmentStatus === 'pending');

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
            {/* Hero Header with Banner */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #00897B 0%, #00695C 50%, #D4A574 100%)',
                    pt: 6,
                    pb: 8,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        opacity: 0.3,
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography
                        variant="h2"
                        component="h1"
                        sx={{
                            fontWeight: 800,
                            color: '#FFFFFF',
                            mb: 2,
                            fontSize: { xs: '2rem', sm: '2.75rem', md: '3.5rem' },
                            fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        }}
                    >
                        {isArabic ? 'دوراتي' : 'My Learning Journey'}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'rgba(255,255,255,0.95)',
                            fontWeight: 400,
                            maxWidth: '600px',
                            fontSize: { xs: '1rem', md: '1.25rem' },
                        }}
                    >
                        {isArabic
                            ? 'تابع تقدمك واستمر في رحلة التعلم'
                            : 'Track your progress and continue your learning adventure'}
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: -4, pb: 6, position: 'relative', zIndex: 2 }}>
                {/* Stats Cards */}
                {enrolledCourses.length > 0 && (
                    <Grid container spacing={{ xs: 1.5, sm: 3 }} sx={{ mb: 4 }}>
                        <Grid item xs={4} sm={4}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: { xs: 1.5, sm: 3 },
                                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)',
                                    borderRadius: 3,
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)' },
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: { xs: 'center', sm: 'left' },
                                }}>
                                    <Box
                                        sx={{
                                            p: { xs: 0.75, sm: 1.5 },
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
                                            mb: { xs: 1, sm: 0 },
                                            mr: { xs: 0, sm: 2 },
                                            width: { xs: 36, sm: 56 },
                                            height: { xs: 36, sm: 56 },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <SchoolIcon sx={{ color: '#FFFFFF', fontSize: { xs: 20, sm: 28 } }} />
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            }}
                                        >
                                            {isArabic ? 'إجمالي' : 'Total'}
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#00897B', fontSize: { xs: '1.25rem', sm: '2.125rem' } }}>
                                            {enrolledCourses.length}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={4} sm={4}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: { xs: 1.5, sm: 3 },
                                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)',
                                    borderRadius: 3,
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)' },
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: { xs: 'center', sm: 'left' },
                                }}>
                                    <Box
                                        sx={{
                                            p: { xs: 0.75, sm: 1.5 },
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                                            mb: { xs: 1, sm: 0 },
                                            mr: { xs: 0, sm: 2 },
                                            width: { xs: 36, sm: 56 },
                                            height: { xs: 36, sm: 56 },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <CheckCircleIcon sx={{ color: '#FFFFFF', fontSize: { xs: 20, sm: 28 } }} />
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            }}
                                        >
                                            {isArabic ? 'نشطة' : 'Active'}
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50', fontSize: { xs: '1.25rem', sm: '2.125rem' } }}>
                                            {confirmedCourses.length}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={4} sm={4}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: { xs: 1.5, sm: 3 },
                                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)',
                                    borderRadius: 3,
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)' },
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: { xs: 'center', sm: 'left' },
                                }}>
                                    <Box
                                        sx={{
                                            p: { xs: 0.75, sm: 1.5 },
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                            mb: { xs: 1, sm: 0 },
                                            mr: { xs: 0, sm: 2 },
                                            width: { xs: 36, sm: 56 },
                                            height: { xs: 36, sm: 56 },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <PendingIcon sx={{ color: '#FFFFFF', fontSize: { xs: 20, sm: 28 } }} />
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                fontWeight: 500,
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            }}
                                        >
                                            {isArabic ? 'معلق' : 'Pending'}
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#FF9800', fontSize: { xs: '1.25rem', sm: '2.125rem' } }}>
                                            {pendingCourses.length}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* Courses Section */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress size={60} thickness={4} sx={{ color: '#00897B' }} />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                        {error}
                    </Alert>
                ) : enrolledCourses.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            textAlign: 'center',
                            py: 10,
                            px: 4,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)',
                        }}
                    >
                        <Box
                            component="img"
                            src="/api/placeholder/400/300"
                            alt="No courses"
                            sx={{
                                width: '100%',
                                maxWidth: 300,
                                height: 'auto',
                                mb: 4,
                                opacity: 0.9,
                            }}
                        />
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: '#00897B',
                                mb: 2,
                                fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                            }}
                        >
                            {isArabic ? 'ابدأ رحلتك التعليمية!' : 'Start Your Learning Journey!'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                            {isArabic
                                ? 'استكشف دوراتنا المتنوعة وابدأ في تطوير مهاراتك اليوم'
                                : 'Explore our diverse courses and start developing your skills today'}
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/courses')}
                            sx={{
                                background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
                                color: '#FFFFFF',
                                fontWeight: 700,
                                px: 5,
                                py: 1.5,
                                borderRadius: 3,
                                fontSize: '1.1rem',
                                textTransform: 'none',
                                boxShadow: '0 4px 20px rgba(0, 137, 123, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #00695C 0%, #004D40 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 25px rgba(0, 137, 123, 0.4)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {isArabic ? 'تصفح الدورات' : 'Browse Courses'}
                        </Button>
                    </Paper>
                ) : (
                    <>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                mb: 3,
                                color: '#1a1a1a',
                                fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                            }}
                        >
                            {isArabic ? 'دوراتي المسجلة' : 'My Enrolled Courses'}
                        </Typography>
                        <Grid container spacing={3}>
                            {enrolledCourses.map((course) => (
                                <Grid item xs={12} sm={6} md={4} key={course.id}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                            },
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="180"
                                            image={course.thumbnail || '/default-course-image.jpg'}
                                            alt={typeof course.title === 'object' ? course.title[isArabic ? 'ar' : 'en'] : course.title}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Typography
                                                    variant="h6"
                                                    component="h2"
                                                    sx={{
                                                        fontWeight: 700,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        flex: 1,
                                                        fontSize: '1.1rem',
                                                        lineHeight: 1.3,
                                                    }}
                                                >
                                                    {typeof course.title === 'object'
                                                        ? course.title[isArabic ? 'ar' : 'en']
                                                        : course.title}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    icon={course.enrollmentStatus === 'confirmed' ? <CheckCircleIcon /> : <PendingIcon />}
                                                    label={course.enrollmentStatus === 'confirmed'
                                                        ? (isArabic ? 'مؤكد' : 'Active')
                                                        : (isArabic ? 'معلق' : 'Pending')}
                                                    color={course.enrollmentStatus === 'confirmed' ? 'success' : 'warning'}
                                                    sx={{ ml: 1, fontWeight: 600 }}
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                                                <strong>{isArabic ? 'المدرب:' : 'Instructor:'}</strong>{' '}
                                                {course.instructor?.name || 'Unknown'}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    mb: 2,
                                                }}
                                            >
                                                {typeof course.description === 'object'
                                                    ? course.description[isArabic ? 'ar' : 'en']
                                                    : course.description}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ p: 2, pt: 0 }}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                onClick={() => handleViewCourse(course.id)}
                                                disabled={course.enrollmentStatus !== 'confirmed'}
                                                sx={{
                                                    background: course.enrollmentStatus === 'confirmed'
                                                        ? 'linear-gradient(135deg, #00897B 0%, #00695C 100%)'
                                                        : 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
                                                    color: '#FFFFFF',
                                                    fontWeight: 600,
                                                    py: 1.25,
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontSize: '1rem',
                                                    '&:hover': {
                                                        background: course.enrollmentStatus === 'confirmed'
                                                            ? 'linear-gradient(135deg, #00695C 0%, #004D40 100%)'
                                                            : 'linear-gradient(135deg, #757575 0%, #616161 100%)',
                                                    },
                                                }}
                                            >
                                                {course.enrollmentStatus === 'confirmed'
                                                    ? (isArabic ? 'متابعة التعلم' : 'Continue Learning')
                                                    : (isArabic ? 'في انتظار الموافقة' : 'Awaiting Approval')}
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}
            </Container>
        </Box>
    );
}

export default MyCourses;
