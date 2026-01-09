import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Container,
    CircularProgress,
    Alert,
    Paper,
    List,
    ListItem,
    ListItemButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { colors } from '../theme';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';

function CourseContentView() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const { user } = useAuth();

    const [course, setCourse] = useState(null);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [lessonDialogOpen, setLessonDialogOpen] = useState(false);

    useEffect(() => {
        if (user?.uid && courseId) {
            fetchCourseData();
        }
    }, [user?.uid, courseId]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch course details
            const courseDoc = await getDoc(doc(db, 'courses', courseId));
            if (!courseDoc.exists()) {
                setError(isArabic ? 'الدورة غير موجودة' : 'Course not found');
                setLoading(false);
                return;
            }

            setCourse({ id: courseDoc.id, ...courseDoc.data() });

            // Fetch units
            const unitsRef = collection(db, `courses/${courseId}/units`);
            const unitsQuery = query(unitsRef, orderBy('order', 'asc'));
            const unitsSnap = await getDocs(unitsQuery);

            const unitsData = await Promise.all(
                unitsSnap.docs.map(async (unitDoc) => {
                    const unitId = unitDoc.id;
                    const unitData = unitDoc.data();

                    // Fetch lessons for this unit
                    const lessonsRef = collection(db, `courses/${courseId}/units/${unitId}/lessons`);
                    const lessonsQuery = query(lessonsRef, orderBy('order', 'asc'));
                    const lessonsSnap = await getDocs(lessonsQuery);

                    const lessons = lessonsSnap.docs.map(lessonDoc => ({
                        id: lessonDoc.id,
                        ...lessonDoc.data()
                    }));

                    return {
                        id: unitId,
                        ...unitData,
                        lessons
                    };
                })
            );

            setUnits(unitsData);
        } catch (err) {
            console.error('Error fetching course data:', err);
            setError(isArabic ? 'خطأ في تحميل محتوى الدورة' : 'Error loading course content');
        } finally {
            setLoading(false);
        }
    };

    const handleLessonClick = (lesson) => {
        setSelectedLesson(lesson);
        setLessonDialogOpen(true);
    };

    const handleCloseLesson = () => {
        setLessonDialogOpen(false);
        setSelectedLesson(null);
    };

    const getTotalLessons = () => units.reduce((sum, unit) => sum + (unit.lessons?.length || 0), 0);

    const getLessonIcon = (type) => {
        switch (type) {
            case 'video':
                return <VideoLibraryIcon />;
            case 'reading':
                return <MenuBookIcon />;
            case 'assignment':
                return <AssignmentIcon />;
            default:
                return <MenuBookIcon />;
        }
    };

    const getVideoEmbedUrl = (url) => {
        if (!url) return null;

        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('youtu.be')
                ? url.split('youtu.be/')[1]?.split('?')[0]
                : url.split('v=')[1]?.split('&')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }

        // Vimeo
        if (url.includes('vimeo.com')) {
            const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
            return `https://player.vimeo.com/video/${videoId}`;
        }

        return url;
    };

    const renderLessonContent = () => {
        if (!selectedLesson) return null;

        const { type, content } = selectedLesson;

        switch (type) {
            case 'video': {
                const linkUrl = content?.link || content?.videoUrl;
                const linkType = content?.linkType || 'youtube';

                // Check if link can be embedded (YouTube, Vimeo only)
                const isEmbeddable = linkType === 'youtube' || linkType === 'vimeo' ||
                    (linkUrl && (linkUrl.includes('youtube.com') || linkUrl.includes('youtu.be') || linkUrl.includes('vimeo.com')));

                if (isEmbeddable) {
                    const embedUrl = getVideoEmbedUrl(linkUrl);
                    return (
                        <Box sx={{ width: '100%', aspectRatio: '16/9', position: 'relative' }}>
                            {embedUrl ? (
                                <iframe
                                    src={embedUrl}
                                    title="Lesson Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        borderRadius: '8px'
                                    }}
                                />
                            ) : (
                                <Alert severity="error">{isArabic ? 'رابط الفيديو غير صالح' : 'Invalid video URL'}</Alert>
                            )}
                        </Box>
                    );
                } else {
                    // For Meet, Zoom, and other links - show a button to open in new tab
                    const getLinkLabel = () => {
                        switch (linkType) {
                            case 'meet': return isArabic ? 'انضم إلى Google Meet' : 'Join Google Meet';
                            case 'zoom': return isArabic ? 'انضم إلى Zoom' : 'Join Zoom Meeting';
                            default: return isArabic ? 'فتح الرابط' : 'Open Link';
                        }
                    };

                    const getLinkColor = () => {
                        switch (linkType) {
                            case 'meet': return '#00897B';
                            case 'zoom': return '#2D8CFF';
                            default: return 'primary.main';
                        }
                    };

                    return (
                        <Box sx={{
                            p: 4,
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
                            borderRadius: 2,
                        }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                {linkType === 'meet' && '🎥 Google Meet'}
                                {linkType === 'zoom' && '📹 Zoom Meeting'}
                                {linkType === 'other' && '🔗 External Link'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {isArabic
                                    ? 'انقر على الزر أدناه للانضمام إلى الجلسة'
                                    : 'Click the button below to join the session'}
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => window.open(linkUrl, '_blank')}
                                sx={{
                                    bgcolor: getLinkColor(),
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    '&:hover': {
                                        bgcolor: getLinkColor(),
                                        filter: 'brightness(0.9)',
                                    }
                                }}
                            >
                                {getLinkLabel()}
                            </Button>
                        </Box>
                    );
                }
            }

            case 'reading': {
                return (
                    <Box
                        sx={{
                            p: 3,
                            '& p': { mb: 2 },
                            '& h1, & h2, & h3': { mt: 3, mb: 2 },
                            whiteSpace: 'pre-wrap'
                        }}
                    >
                        <Typography variant="body1">
                            {content?.text?.[isArabic ? 'ar' : 'en'] || content?.text}
                        </Typography>
                    </Box>
                );
            }

            case 'assignment': {
                return (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            {isArabic ? 'تعليمات المهمة' : 'Assignment Instructions'}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                            {content?.instructions?.[isArabic ? 'ar' : 'en'] || content?.instructions}
                        </Typography>

                        <Alert severity="info" sx={{ mb: 2 }}>
                            {isArabic
                                ? 'أرسل المهمة المكتملة عبر واتساب'
                                : 'Send your completed assignment via WhatsApp'}
                        </Alert>

                        {content?.instructorWhatsApp && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<WhatsAppIcon />}
                                onClick={() => window.open(`https://wa.me/${content.instructorWhatsApp}`, '_blank')}
                                fullWidth
                            >
                                {isArabic ? 'فتح واتساب' : 'Open WhatsApp'}
                            </Button>
                        )}
                    </Box>
                );
            }

            default: {
                return <Typography>Content type not supported</Typography>;
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !course) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error || (isArabic ? 'خطأ' : 'Error')}</Alert>
                <Button onClick={() => navigate('/student/my-courses')} sx={{ mt: 2 }}>
                    {isArabic ? 'العودة إلى دوراتي' : 'Back to My Courses'}
                </Button>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
            {/* Header Section */}
            <Box sx={{ 
                bgcolor: colors.primary.main, 
                color: '#fff',
                py: { xs: 3, md: 4 },
            }}>
                <Container maxWidth="lg">
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/student/my-courses')}
                        sx={{ 
                            color: 'rgba(255,255,255,0.9)',
                            mb: 2,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        {isArabic ? 'العودة إلى دوراتي' : 'Back to My Courses'}
                    </Button>

                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            mb: 1.5,
                            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                            fontFamily: "'Montserrat', sans-serif",
                        }}
                    >
                        {typeof course.title === 'object' ? course.title[isArabic ? 'ar' : 'en'] : course.title}
                    </Typography>

                    {course.description && (
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                opacity: 0.9, 
                                mb: 2,
                                maxWidth: 700,
                                fontSize: { xs: '0.9rem', md: '1rem' }
                            }}
                        >
                            {typeof course.description === 'object'
                                ? course.description[isArabic ? 'ar' : 'en']
                                : course.description}
                        </Typography>
                    )}

                    {/* Course Stats */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                        <Chip
                            icon={<SchoolIcon sx={{ color: 'inherit !important' }} />}
                            label={`${units.length} ${isArabic ? 'وحدات' : 'Units'}`}
                            sx={{ 
                                bgcolor: 'rgba(255,255,255,0.15)', 
                                color: '#fff',
                                fontWeight: 500,
                                borderRadius: 1,
                            }}
                        />
                        <Chip
                            icon={<PlayCircleOutlineIcon sx={{ color: 'inherit !important' }} />}
                            label={`${getTotalLessons()} ${isArabic ? 'دروس' : 'Lessons'}`}
                            sx={{ 
                                bgcolor: 'rgba(255,255,255,0.15)', 
                                color: '#fff',
                                fontWeight: 500,
                                borderRadius: 1,
                            }}
                        />
                    </Box>
                </Container>
            </Box>

            {/* Content Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
                {units.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                        <Typography color="text.secondary">
                            {isArabic
                                ? 'المحتوى قادم قريباً. تحقق مرة أخرى لاحقاً.'
                                : 'Content coming soon. Check back later.'}
                        </Typography>
                    </Paper>
                ) : (
                    <Box>
                        {units.map((unit, unitIndex) => (
                            <Box key={unit.id} sx={{ mb: 4 }}>
                                {/* Unit Header */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: { xs: 1.5, sm: 2 },
                                        mb: 2,
                                    }}
                                >
                                    <Box sx={{
                                        width: { xs: 36, sm: 44 },
                                        height: { xs: 36, sm: 44 },
                                        borderRadius: 1.5,
                                        bgcolor: colors.primary.main,
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: { xs: '1rem', sm: '1.1rem' },
                                        fontFamily: "'Montserrat', sans-serif",
                                        flexShrink: 0,
                                    }}>
                                        {unitIndex + 1}
                                    </Box>

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                fontWeight: 600, 
                                                fontSize: { xs: '1rem', sm: '1.15rem' },
                                                fontFamily: "'Montserrat', sans-serif",
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {typeof unit.title === 'object' ? unit.title[isArabic ? 'ar' : 'en'] : unit.title}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ fontSize: '0.85rem' }}
                                        >
                                            {unit.lessons?.length || 0} {isArabic ? 'دروس' : 'lessons'}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Lessons List */}
                                <Paper 
                                    elevation={0}
                                    sx={{ 
                                        borderRadius: 2, 
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {unit.lessons && unit.lessons.length > 0 ? (
                                        <List disablePadding>
                                            {unit.lessons.map((lesson, lessonIndex) => (
                                                <ListItem
                                                    key={lesson.id}
                                                    disablePadding
                                                    sx={{
                                                        borderBottom: lessonIndex < unit.lessons.length - 1 ? '1px solid' : 'none',
                                                        borderColor: 'divider',
                                                    }}
                                                >
                                                    <ListItemButton
                                                        onClick={() => handleLessonClick(lesson)}
                                                        sx={{
                                                            py: { xs: 1.5, sm: 2 },
                                                            px: { xs: 2, sm: 2.5 },
                                                            '&:hover': {
                                                                bgcolor: 'rgba(0, 137, 123, 0.04)',
                                                            },
                                                        }}
                                                    >
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: { xs: 1.5, sm: 2 },
                                                            width: '100%',
                                                        }}>
                                                            {/* Lesson Icon */}
                                                            <Box sx={{ 
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: 1,
                                                                bgcolor: lesson.type === 'video' ? 'rgba(0, 137, 123, 0.08)'
                                                                    : lesson.type === 'reading' ? 'rgba(76, 175, 80, 0.08)'
                                                                    : 'rgba(255, 152, 0, 0.08)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: lesson.type === 'video' ? colors.primary.main
                                                                    : lesson.type === 'reading' ? '#4caf50'
                                                                    : '#ff9800',
                                                                flexShrink: 0,
                                                            }}>
                                                                {getLessonIcon(lesson.type)}
                                                            </Box>

                                                            {/* Lesson Info */}
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography 
                                                                    sx={{ 
                                                                        fontWeight: 500, 
                                                                        fontSize: { xs: '0.9rem', sm: '0.95rem' },
                                                                        lineHeight: 1.4,
                                                                    }}
                                                                >
                                                                    {lessonIndex + 1}. {typeof lesson.title === 'object'
                                                                        ? lesson.title[isArabic ? 'ar' : 'en']
                                                                        : lesson.title}
                                                                </Typography>

                                                                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, alignItems: 'center' }}>
                                                                    <Typography 
                                                                        variant="caption"
                                                                        sx={{
                                                                            fontSize: '0.75rem',
                                                                            color: lesson.type === 'video' ? colors.primary.main
                                                                                : lesson.type === 'reading' ? '#388e3c'
                                                                                : '#f57c00',
                                                                            fontWeight: 500,
                                                                        }}
                                                                    >
                                                                        {lesson.type === 'video'
                                                                            ? (isArabic ? 'فيديو' : 'Video')
                                                                            : lesson.type === 'reading'
                                                                                ? (isArabic ? 'قراءة' : 'Reading')
                                                                                : (isArabic ? 'مهمة' : 'Assignment')}
                                                                    </Typography>
                                                                    {lesson.duration && (
                                                                        <Typography 
                                                                            variant="caption" 
                                                                            color="text.secondary"
                                                                            sx={{ fontSize: '0.75rem' }}
                                                                        >
                                                                            {lesson.duration} {isArabic ? 'د' : 'min'}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Box>

                                                            {/* Play indicator for videos */}
                                                            {lesson.type === 'video' && (
                                                                <PlayCircleOutlineIcon 
                                                                    sx={{ 
                                                                        color: colors.primary.main,
                                                                        fontSize: 24,
                                                                        opacity: 0.6,
                                                                    }} 
                                                                />
                                                            )}
                                                        </Box>
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Box sx={{ py: 3, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {isArabic ? 'لا توجد دروس بعد' : 'No lessons yet'}
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>
                        ))}
                    </Box>
                )}
            </Container>

            {/* Lesson Dialog */}
            <Dialog
                open={lessonDialogOpen}
                onClose={handleCloseLesson}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                            {selectedLesson && typeof selectedLesson.title === 'object'
                                ? selectedLesson.title[isArabic ? 'ar' : 'en']
                                : selectedLesson?.title}
                        </Typography>
                        <IconButton onClick={handleCloseLesson}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedLesson && renderLessonContent()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseLesson}>
                        {isArabic ? 'إغلاق' : 'Close'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default CourseContentView;
