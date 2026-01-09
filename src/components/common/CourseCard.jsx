import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    Box,
    Typography,
    Chip,
    Rating,
    Button,
    useTheme,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

function CourseCard({ course, isArabic }) {
    const navigate = useNavigate();
    const theme = useTheme();
    const { user } = useAuth();
    const [enrollmentStatus, setEnrollmentStatus] = useState(null);

    useEffect(() => {
        if (user?.uid) {
            checkEnrollmentStatus();
        }
    }, [user?.uid, course.id]);

    const checkEnrollmentStatus = async () => {
        try {
            const enrollmentsRef = collection(db, 'enrollments');
            const q = query(
                enrollmentsRef,
                where('email', '==', user.email),
                where('courseId', '==', course.id)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                setEnrollmentStatus(snapshot.docs[0].data().status);
            }
        } catch (error) {
            console.error('Error checking enrollment:', error);
        }
    };

    const handleCardClick = () => {
        navigate(`/courses/${course.id}`);
    };

    const getLevelColor = (level) => {
        const levelValue = typeof level === 'object' ? level[isArabic ? 'ar' : 'en'] : level;
        const levelLower = levelValue?.toLowerCase() || '';
        switch (levelLower) {
            case 'beginner':
            case 'مبتدئ':
                return 'success';
            case 'intermediate':
            case 'متوسط':
                return 'warning';
            case 'advanced':
            case 'متقدم':
                return 'error';
            default:
                return 'default';
        }
    };

    const courseTitle = typeof course.title === 'object' ? course.title[isArabic ? 'ar' : 'en'] : course.title;
    const courseDescription = typeof course.description === 'object' ? course.description[isArabic ? 'ar' : 'en'] : course.description;
    const courseCategory = typeof course.category === 'object' ? course.category[isArabic ? 'ar' : 'en'] : course.category;
    const courseLevel = typeof course.level === 'object' ? course.level[isArabic ? 'ar' : 'en'] : course.level;

    return (
        <Card
            onClick={handleCardClick}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                borderRadius: 2,
                boxShadow: 2,
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                },
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    paddingTop: '56.25%',
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: 'grey.200',
                }}
            >
                <Box
                    component="img"
                    src={course.thumbnail || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27225%27%3E%3Crect fill=%27%23D4A574%27 width=%27400%27 height=%27225%27/%3E%3C/svg%3E'}
                    alt={courseTitle}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                    }}
                />
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    noWrap
                    sx={{
                        fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                        fontWeight: 600,
                    }}
                >
                    {courseTitle}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                    }}
                >
                    {courseDescription}
                </Typography>

                <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                        size="small"
                        label={courseLevel}
                        color={getLevelColor(course.level)}
                        variant="outlined"
                    />
                    <Chip
                        size="small"
                        label={courseCategory}
                        variant="outlined"
                        color="primary"
                    />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                    <SchoolIcon fontSize="small" color="primary" />
                    <Typography variant="caption" color="text.secondary">
                        {course.instructor?.name || 'Unknown'}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                            {course.currentRound?.enrolledStudents || 0} {isArabic ? 'حالي' : 'current'} / {course.totalStudents || 0} {isArabic ? 'إجمالي' : 'total'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AttachMoneyIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                            {typeof course.price === 'number' ? course.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : (course.price || '0')} SDG
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating size="small" value={course.rating || 4.5} readOnly precision={0.5} />
                    <Typography variant="caption" color="text.secondary">
                        ({course.reviews?.length || 0})
                    </Typography>
                </Box>
            </CardContent>

            <Box sx={{ p: 2, pt: 0 }}>
                {enrollmentStatus ? (
                    <Chip
                        fullWidth
                        label={enrollmentStatus === 'confirmed'
                            ? (isArabic ? 'مؤكد - مسجل' : 'Enrolled - Confirmed')
                            : (isArabic ? 'قيد الانتظار' : 'Pending Approval')}
                        color={enrollmentStatus === 'confirmed' ? 'success' : 'warning'}
                        sx={{ width: '100%', py: 1.5, fontWeight: 600 }}
                    />
                ) : (
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleCardClick}
                        sx={{
                            fontWeight: 600,
                            textTransform: 'none',
                            py: 1.25,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.02)',
                            },
                        }}
                    >
                        View Details
                    </Button>
                )}
            </Box>
        </Card>
    );
}

export default CourseCard;
