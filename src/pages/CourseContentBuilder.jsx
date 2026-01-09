import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Container,
    Button,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
    doc,
    getDoc,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    getDocs,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

function CourseContentBuilder() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const { user } = useAuth();

    const [course, setCourse] = useState(null);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dialog states
    const [unitDialogOpen, setUnitDialogOpen] = useState(false);
    const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [editingLesson, setEditingLesson] = useState(null);
    const [currentUnitId, setCurrentUnitId] = useState(null);

    // Form states
    const [unitForm, setUnitForm] = useState({
        title: { en: '', ar: '' },
        description: { en: '', ar: '' },
    });

    const [lessonForm, setLessonForm] = useState({
        title: { en: '', ar: '' },
        description: { en: '', ar: '' },
        type: 'video',
        duration: '',
        content: {
            linkType: 'youtube',
            link: '',
            text: { en: '', ar: '' },
            instructions: { en: '', ar: '' },
            instructorWhatsApp: '',
        },
    });

    useEffect(() => {
        if (user?.uid && courseId) {
            fetchCourseData();
        }
    }, [user?.uid, courseId]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            const courseDoc = await getDoc(doc(db, 'courses', courseId));

            if (!courseDoc.exists()) {
                setError(isArabic ? 'الدورة غير موجودة' : 'Course not found');
                return;
            }

            const courseData = courseDoc.data();
            if (courseData.instructor.uid !== user.uid) {
                setError(isArabic ? 'غير مصرح لك بتعديل هذه الدورة' : 'Not authorized');
                return;
            }

            setCourse({ id: courseDoc.id, ...courseData });
            await fetchUnits();
        } catch (err) {
            console.error('Error:', err);
            setError(isArabic ? 'خطأ في التحميل' : 'Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnits = async () => {
        try {
            const unitsRef = collection(db, `courses/${courseId}/units`);
            const unitsQuery = query(unitsRef, orderBy('order', 'asc'));
            const unitsSnap = await getDocs(unitsQuery);

            const unitsData = await Promise.all(
                unitsSnap.docs.map(async (unitDoc) => {
                    const lessonsRef = collection(db, `courses/${courseId}/units/${unitDoc.id}/lessons`);
                    const lessonsQuery = query(lessonsRef, orderBy('order', 'asc'));
                    const lessonsSnap = await getDocs(lessonsQuery);

                    return {
                        id: unitDoc.id,
                        ...unitDoc.data(),
                        lessons: lessonsSnap.docs.map(l => ({ id: l.id, ...l.data() })),
                    };
                })
            );

            setUnits(unitsData);
        } catch (err) {
            console.error('Error fetching units:', err);
        }
    };

    const handleAddUnit = () => {
        setEditingUnit(null);
        setUnitForm({ title: { en: '', ar: '' }, description: { en: '', ar: '' } });
        setUnitDialogOpen(true);
    };

    const handleEditUnit = (unit) => {
        setEditingUnit(unit);
        setUnitForm({
            title: unit.title || { en: '', ar: '' },
            description: unit.description || { en: '', ar: '' },
        });
        setUnitDialogOpen(true);
    };

    const handleSaveUnit = async () => {
        try {
            if (editingUnit) {
                await updateDoc(doc(db, `courses/${courseId}/units`, editingUnit.id), {
                    ...unitForm,
                    updatedAt: Timestamp.now(),
                });
            } else {
                await addDoc(collection(db, `courses/${courseId}/units`), {
                    ...unitForm,
                    order: units.length + 1,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                });
            }
            setUnitDialogOpen(false);
            await fetchUnits();
        } catch (err) {
            console.error('Error saving unit:', err);
            alert(isArabic ? 'خطأ في الحفظ' : 'Error saving');
        }
    };

    const handleDeleteUnit = async (unitId) => {
        if (!window.confirm(isArabic ? 'حذف هذه الوحدة؟' : 'Delete this unit?')) return;

        try {
            await deleteDoc(doc(db, `courses/${courseId}/units`, unitId));
            await fetchUnits();
        } catch (err) {
            console.error('Error deleting unit:', err);
        }
    };

    const handleAddLesson = (unitId) => {
        setCurrentUnitId(unitId);
        setEditingLesson(null);
        setLessonForm({
            title: { en: '', ar: '' },
            description: { en: '', ar: '' },
            type: 'video',
            duration: '',
            content: {
                linkType: 'youtube',
                link: '',
                text: { en: '', ar: '' },
                instructions: { en: '', ar: '' },
                instructorWhatsApp: user.phoneNumber || '',
            },
        });
        setLessonDialogOpen(true);
    };

    const handleEditLesson = (unitId, lesson) => {
        setCurrentUnitId(unitId);
        setEditingLesson(lesson);
        setLessonForm({
            title: lesson.title || { en: '', ar: '' },
            description: lesson.description || { en: '', ar: '' },
            type: lesson.type || 'video',
            duration: lesson.duration || '',
            content: lesson.content || {},
        });
        setLessonDialogOpen(true);
    };

    const handleSaveLesson = async () => {
        try {
            const unit = units.find(u => u.id === currentUnitId);

            if (editingLesson) {
                await updateDoc(
                    doc(db, `courses/${courseId}/units/${currentUnitId}/lessons`, editingLesson.id),
                    {
                        ...lessonForm,
                        updatedAt: Timestamp.now(),
                    }
                );
            } else {
                await addDoc(collection(db, `courses/${courseId}/units/${currentUnitId}/lessons`), {
                    ...lessonForm,
                    order: (unit?.lessons?.length || 0) + 1,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                });
            }
            setLessonDialogOpen(false);
            await fetchUnits();
        } catch (err) {
            console.error('Error saving lesson:', err);
            alert(isArabic ? 'خطأ في الحفظ' : 'Error saving');
        }
    };

    const handleDeleteLesson = async (unitId, lessonId) => {
        if (!window.confirm(isArabic ? 'حذف هذا الدرس؟' : 'Delete this lesson?')) return;

        try {
            await deleteDoc(doc(db, `courses/${courseId}/units/${unitId}/lessons`, lessonId));
            await fetchUnits();
        } catch (err) {
            console.error('Error deleting lesson:', err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !course) {
        return (
            <Container>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
            <Container maxWidth="lg">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/instructor/dashboard')}
                    sx={{ mb: 3 }}
                >
                    {isArabic ? 'العودة' : 'Back to Dashboard'}
                </Button>

                <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
                    {isArabic ? 'إدارة محتوى:' : 'Manage Content:'}{' '}
                    {typeof course.title === 'object' ? course.title[isArabic ? 'ar' : 'en'] : course.title}
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddUnit}
                    sx={{ mb: 3 }}
                >
                    {isArabic ? 'إضافة وحدة' : 'Add Unit'}
                </Button>

                {units.length === 0 ? (
                    <Alert severity="info">{isArabic ? 'لا توجد وحدات. أضف وحدة للبدء.' : 'No units yet. Add a unit to start.'}</Alert>
                ) : (
                    units.map((unit) => (
                        <Accordion key={unit.id} defaultExpanded sx={{ mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                        📚 {typeof unit.title === 'object' ? unit.title[isArabic ? 'ar' : 'en'] : unit.title}
                                    </Typography>
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditUnit(unit); }}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit.id); }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleAddLesson(unit.id)}
                                    sx={{ mb: 2 }}
                                >
                                    {isArabic ? 'إضافة درس' : 'Add Lesson'}
                                </Button>

                                {unit.lessons && unit.lessons.length > 0 ? (
                                    <List>
                                        {unit.lessons.map((lesson) => (
                                            <React.Fragment key={lesson.id}>
                                                <ListItem>
                                                    <ListItemText
                                                        primary={`${lesson.type === 'video' ? '📹' : lesson.type === 'reading' ? '📄' : '📝'} ${typeof lesson.title === 'object' ? lesson.title[isArabic ? 'ar' : 'en'] : lesson.title}`}
                                                        secondary={lesson.duration ? `${lesson.duration} ${isArabic ? 'دقيقة' : 'min'}` : null}
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <IconButton size="small" onClick={() => handleEditLesson(unit.id, lesson)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => handleDeleteLesson(unit.id, lesson.id)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                                <Divider />
                                            </React.Fragment>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        {isArabic ? 'لا توجد دروس' : 'No lessons yet'}
                                    </Typography>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    ))
                )}

                {/* Unit Dialog */}
                <Dialog open={unitDialogOpen} onClose={() => setUnitDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>{editingUnit ? (isArabic ? 'تعديل وحدة' : 'Edit Unit') : (isArabic ? 'إضافة وحدة' : 'Add Unit')}</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label={isArabic ? 'العنوان (إنجليزي)' : 'Title (English)'}
                            value={unitForm.title.en}
                            onChange={(e) => setUnitForm({ ...unitForm, title: { ...unitForm.title, en: e.target.value } })}
                            sx={{ mt: 2, mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label={isArabic ? 'العنوان (عربي)' : 'Title (Arabic)'}
                            value={unitForm.title.ar}
                            onChange={(e) => setUnitForm({ ...unitForm, title: { ...unitForm.title, ar: e.target.value } })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label={isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}
                            value={unitForm.description.en}
                            onChange={(e) => setUnitForm({ ...unitForm, description: { ...unitForm.description, en: e.target.value } })}
                            multiline
                            rows={2}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label={isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}
                            value={unitForm.description.ar}
                            onChange={(e) => setUnitForm({ ...unitForm, description: { ...unitForm.description, ar: e.target.value } })}
                            multiline
                            rows={2}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setUnitDialogOpen(false)}>{isArabic ? 'إلغاء' : 'Cancel'}</Button>
                        <Button onClick={handleSaveUnit} variant="contained">{isArabic ? 'حفظ' : 'Save'}</Button>
                    </DialogActions>
                </Dialog>

                {/* Lesson Dialog */}
                <Dialog open={lessonDialogOpen} onClose={() => setLessonDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle>{editingLesson ? (isArabic ? 'تعديل درس' : 'Edit Lesson') : (isArabic ? 'إضافة درس' : 'Add Lesson')}</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label={isArabic ? 'العنوان (إنجليزي)' : 'Title (English)'}
                            value={lessonForm.title.en}
                            onChange={(e) => setLessonForm({ ...lessonForm, title: { ...lessonForm.title, en: e.target.value } })}
                            sx={{ mt: 2, mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label={isArabic ? 'العنوان (عربي)' : 'Title (Arabic)'}
                            value={lessonForm.title.ar}
                            onChange={(e) => setLessonForm({ ...lessonForm, title: { ...lessonForm.title, ar: e.target.value } })}
                            sx={{ mb: 2 }}
                        />

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>{isArabic ? 'نوع الدرس' : 'Lesson Type'}</InputLabel>
                            <Select
                                value={lessonForm.type}
                                onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                            >
                                <MenuItem value="video">{isArabic ? 'فيديو' : 'Video'}</MenuItem>
                                <MenuItem value="reading">{isArabic ? 'قراءة' : 'Reading'}</MenuItem>
                                <MenuItem value="assignment">{isArabic ? 'مهمة' : 'Assignment'}</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            type="number"
                            label={isArabic ? 'المدة (دقائق)' : 'Duration (minutes)'}
                            value={lessonForm.duration}
                            onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                            sx={{ mb: 3 }}
                        />

                        {lessonForm.type === 'video' && (
                            <>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>{isArabic ? 'نوع الرابط' : 'Link Type'}</InputLabel>
                                    <Select
                                        value={lessonForm.content.linkType || 'youtube'}
                                        onChange={(e) => setLessonForm({
                                            ...lessonForm,
                                            content: { ...lessonForm.content, linkType: e.target.value }
                                        })}
                                        label={isArabic ? 'نوع الرابط' : 'Link Type'}
                                    >
                                        <MenuItem value="youtube">YouTube</MenuItem>
                                        <MenuItem value="meet">Google Meet</MenuItem>
                                        <MenuItem value="zoom">Zoom</MenuItem>
                                        <MenuItem value="vimeo">Vimeo</MenuItem>
                                        <MenuItem value="other">{isArabic ? 'رابط آخر' : 'Other Link'}</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    label={
                                        lessonForm.content.linkType === 'youtube' ? (isArabic ? 'رابط YouTube' : 'YouTube URL') :
                                            lessonForm.content.linkType === 'meet' ? (isArabic ? 'رابط Google Meet' : 'Google Meet URL') :
                                                lessonForm.content.linkType === 'zoom' ? (isArabic ? 'رابط Zoom' : 'Zoom URL') :
                                                    lessonForm.content.linkType === 'vimeo' ? (isArabic ? 'رابط Vimeo' : 'Vimeo URL') :
                                                        (isArabic ? 'الرابط' : 'Link URL')
                                    }
                                    value={lessonForm.content.link || lessonForm.content.videoUrl || ''}
                                    onChange={(e) => setLessonForm({
                                        ...lessonForm,
                                        content: { ...lessonForm.content, link: e.target.value, videoUrl: e.target.value }
                                    })}
                                    placeholder={
                                        lessonForm.content.linkType === 'youtube' ? 'https://www.youtube.com/watch?v=...' :
                                            lessonForm.content.linkType === 'meet' ? 'https://meet.google.com/...' :
                                                lessonForm.content.linkType === 'zoom' ? 'https://zoom.us/j/...' :
                                                    'https://...'
                                    }
                                />
                            </>
                        )}

                        {lessonForm.type === 'reading' && (
                            <>
                                <TextField
                                    fullWidth
                                    label={isArabic ? 'المحتوى (إنجليزي)' : 'Content (English)'}
                                    value={lessonForm.content.text?.en || ''}
                                    onChange={(e) => setLessonForm({
                                        ...lessonForm,
                                        content: { ...lessonForm.content, text: { ...lessonForm.content.text, en: e.target.value } }
                                    })}
                                    multiline
                                    rows={6}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label={isArabic ? 'المحتوى (عربي)' : 'Content (Arabic)'}
                                    value={lessonForm.content.text?.ar || ''}
                                    onChange={(e) => setLessonForm({
                                        ...lessonForm,
                                        content: { ...lessonForm.content, text: { ...lessonForm.content.text, ar: e.target.value } }
                                    })}
                                    multiline
                                    rows={6}
                                />
                            </>
                        )}

                        {lessonForm.type === 'assignment' && (
                            <>
                                <TextField
                                    fullWidth
                                    label={isArabic ? 'التعليمات (إنجليزي)' : 'Instructions (English)'}
                                    value={lessonForm.content.instructions?.en || ''}
                                    onChange={(e) => setLessonForm({
                                        ...lessonForm,
                                        content: { ...lessonForm.content, instructions: { ...lessonForm.content.instructions, en: e.target.value } }
                                    })}
                                    multiline
                                    rows={4}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label={isArabic ? 'التعليمات (عربي)' : 'Instructions (Arabic)'}
                                    value={lessonForm.content.instructions?.ar || ''}
                                    onChange={(e) => setLessonForm({
                                        ...lessonForm,
                                        content: { ...lessonForm.content, instructions: { ...lessonForm.content.instructions, ar: e.target.value } }
                                    })}
                                    multiline
                                    rows={4}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label={isArabic ? 'رقم واتساب (للتسليم)' : 'WhatsApp Number (for submission)'}
                                    value={lessonForm.content.instructorWhatsApp || ''}
                                    onChange={(e) => setLessonForm({
                                        ...lessonForm,
                                        content: { ...lessonForm.content, instructorWhatsApp: e.target.value }
                                    })}
                                    placeholder="+249123456789"
                                />
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setLessonDialogOpen(false)}>{isArabic ? 'إلغاء' : 'Cancel'}</Button>
                        <Button onClick={handleSaveLesson} variant="contained">{isArabic ? 'حفظ' : 'Save'}</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}

export default CourseContentBuilder;
