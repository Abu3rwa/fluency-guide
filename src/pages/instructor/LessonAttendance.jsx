import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Checkbox,
    TextField,
    Chip,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { markAttendance, bulkMarkAttendance, fetchLessonAttendance } from '../../store/slices/attendanceSlice';
import { fetchCourseContent } from '../../store/slices/courseSlice';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function LessonAttendance() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const { attendanceRecords, loading, error } = useSelector(state => state.attendance);
    const { courseContent } = useSelector(state => state.courses);
    const { user } = useSelector(state => state.auth);

    const [students, setStudents] = useState([]);
    const [lesson, setLesson] = useState(null);
    const [course, setCourse] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedStudents, setSelectedStudents] = useState({});
    const [notes, setNotes] = useState({});
    const [confirmDialog, setConfirmDialog] = useState(false);

    useEffect(() => {
        loadData();
    }, [courseId, lessonId]);

    const loadData = async () => {
        try {
            setLoadingData(true);

            // Fetch course
            const courseDoc = await getDoc(doc(db, 'courses', courseId));
            if (courseDoc.exists()) {
                setCourse({ id: courseDoc.id, ...courseDoc.data() });
            }

            // Fetch course content via Redux if not available
            if (!courseContent[courseId]) {
                await dispatch(fetchCourseContent(courseId));
            }

            // Find lesson in Redux state
            // Note: We need to access the store state directly or wait for the dispatch to update
            // Since we just dispatched, the selector might not update immediately in this closure
            // Better to rely on the dispatched result or use a selector effect, but for now:

            // We'll use the result of the dispatch if we just fetched, otherwise use existing state
            // Actually, for simplicity in this migration step, let's rely on the selector updating
            // and maybe trigger this check in a separate useEffect or just access the data after a short delay/re-render?
            // A cleaner way is to just fetch it and let the re-render handle 'lesson' derivation. 
            // BUT 'lesson' is local state here.

            // Let's get the data directly for setting local state
            const contentAction = await dispatch(fetchCourseContent(courseId));
            if (fetchCourseContent.fulfilled.match(contentAction)) {
                const units = contentAction.payload.content;
                let foundLesson = null;
                for (const unit of units) {
                    const l = unit.lessons?.find(l => l.id === lessonId);
                    if (l) {
                        foundLesson = { ...l, unitId: unit.id };
                        break;
                    }
                }
                setLesson(foundLesson);
            } else if (courseContent[courseId]) {
                // Fallback if we didn't need to fetch (though the above logic fetches every time for freshness which is fine for now)
                // Optimally, check redundancy later
                const units = courseContent[courseId];
                let foundLesson = null;
                for (const unit of units) {
                    const l = unit.lessons?.find(l => l.id === lessonId);
                    if (l) {
                        foundLesson = { ...l, unitId: unit.id };
                        break;
                    }
                }
                setLesson(foundLesson);
            }

            // Fetch enrolled students
            const enrollmentsRef = collection(db, 'enrollments');
            const q = query(
                enrollmentsRef,
                where('courseId', '==', courseId),
                where('status', '==', 'confirmed')
            );
            const enrollmentSnap = await getDocs(q);
            const enrollmentsList = enrollmentSnap.docs.map(doc => {
                const data = doc.data();
                console.log('📋 Enrollment document:', { id: doc.id, ...data });
                return {
                    id: doc.id,
                    ...data
                };
            });

            console.log('👥 Total students loaded:', enrollmentsList.length);
            setStudents(enrollmentsList);

            // Fetch attendance for this lesson
            dispatch(fetchLessonAttendance({ courseId, lessonId }));
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoadingData(false);
        }
    };

    // Helper function to safely get studentId from enrollment
    const getStudentId = (student) => {
        // Try different possible field names
        const studentId = student.userId || student.studentId || student.user_id || student.id;
        if (!studentId) {
            console.error('❌ No studentId found in enrollment:', student);
        }
        return studentId;
    };

    const handleSelectAll = (checked) => {
        const newSelected = {};
        students.forEach(student => {
            const studentId = getStudentId(student);
            if (studentId) {
                newSelected[studentId] = checked;
            }
        });
        setSelectedStudents(newSelected);
    };

    const handleSelectStudent = (studentId, checked) => {
        setSelectedStudents(prev => ({
            ...prev,
            [studentId]: checked
        }));
    };

    const handleMarkAttendance = async (studentId, status, event) => {
        event?.preventDefault();
        event?.stopPropagation();

        console.log('🔵 Marking attendance:', {
            courseId,
            lessonId,
            studentId,
            status,
            unitId: lesson?.unitId,
            hasUser: !!user,
            instructorId: user?.uid
        });

        // Validate required data
        if (!lesson || !lesson.unitId) {
            alert(isArabic ? 'خطأ: بيانات الدرس غير متوفرة' : 'Error: Lesson data not available');
            console.error('❌ Missing lesson data:', lesson);
            return;
        }

        if (!user || !user.uid) {
            alert(isArabic ? 'خطأ: يجب تسجيل الدخول' : 'Error: Must be logged in');
            console.error('❌ Missing user data:', user);
            return;
        }

        if (!studentId) {
            alert(isArabic ? 'خطأ: معرف الطالب غير موجود' : 'Error: Student ID not found');
            console.error('❌ Missing studentId. Received:', studentId);
            return;
        }

        try {
            const result = await dispatch(markAttendance({
                courseId,
                unitId: lesson.unitId,
                lessonId,
                studentId,
                status,
                notes: notes[studentId] || '',
                instructorId: user.uid
            }));

            console.log('📊 Mark result:', result);

            if (markAttendance.fulfilled.match(result)) {
                console.log('✅ Attendance marked successfully');
                await dispatch(fetchLessonAttendance({ courseId, lessonId }));
            } else {
                console.error('❌ Failed to mark attendance:', result.error || result.payload);
                alert(isArabic ? `خطأ: ${result.error?.message || result.payload || 'فشل تسجيل الحضور'}`
                    : `Error: ${result.error?.message || result.payload || 'Failed to mark attendance'}`);
            }
        } catch (err) {
            console.error('❌ Exception marking attendance:', err);
            alert(isArabic ? `خطأ: ${err.message}` : `Error: ${err.message}`);
        }
    };

    const handleBulkMark = async (status) => {
        const selectedIds = Object.keys(selectedStudents).filter(id => selectedStudents[id]);
        if (selectedIds.length === 0) {
            alert(isArabic ? 'الرجاء اختيار طالب واحد على الأقل' : 'Please select at least one student');
            return;
        }

        console.log('📦 Bulk marking:', { selectedIds, status });

        await dispatch(bulkMarkAttendance({
            courseId,
            unitId: lesson.unitId,
            lessonId,
            studentIds: selectedIds,
            status,
            instructorId: user.uid
        }));

        setSelectedStudents({});
        setConfirmDialog(false);
        loadData();
    };

    const getAttendanceStatus = (studentId) => {
        const record = attendanceRecords.find(a => a.studentId === studentId);
        return record?.status;
    };

    const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
    const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
    const lateCount = attendanceRecords.filter(a => a.status === 'late').length;

    if (loadingData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/instructor/course/${courseId}/content`)}
                sx={{ mb: 3 }}
            >
                {t('common.back')}
            </Button>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {isArabic ? 'خطأ: ' : 'Error: '}{error}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                    {isArabic ? 'تسجيل الحضور' : 'Mark Attendance'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Typography variant="body1">
                        <strong>{isArabic ? 'الدورة:' : 'Course:'}</strong>{' '}
                        {course?.title?.[isArabic ? 'ar' : 'en'] || course?.title}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Typography variant="body1">
                        <strong>{isArabic ? 'الدرس:' : 'Lesson:'}</strong>{' '}
                        {lesson?.title?.[isArabic ? 'ar' : 'en'] || lesson?.title}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                        label={`${isArabic ? 'حاضر' : 'Present'}: ${presentCount}`}
                        color="success"
                        variant="outlined"
                    />
                    <Chip
                        label={`${isArabic ? 'غائب' : 'Absent'}: ${absentCount}`}
                        color="error"
                        variant="outlined"
                    />
                    <Chip
                        label={`${isArabic ? 'متأخر' : 'Late'}: ${lateCount}`}
                        color="warning"
                        variant="outlined"
                    />
                    <Chip
                        label={`${isArabic ? 'المجموع' : 'Total'}: ${students.length}`}
                        variant="outlined"
                    />
                </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        {isArabic ? 'الطلاب' : 'Students'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => setConfirmDialog(true)}
                            disabled={Object.values(selectedStudents).filter(Boolean).length === 0}
                        >
                            {isArabic ? 'تسجيل حضور المحددين' : 'Mark Selected Present'}
                        </Button>
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        checked={students.length > 0 && Object.values(selectedStudents).filter(Boolean).length === students.length}
                                    />
                                </TableCell>
                                <TableCell>{isArabic ? 'الاسم' : 'Name'}</TableCell>
                                <TableCell>{isArabic ? 'البريد الإلكتروني' : 'Email'}</TableCell>
                                <TableCell>{isArabic ? 'الحالة' : 'Status'}</TableCell>
                                <TableCell>{isArabic ? 'ملاحظات' : 'Notes'}</TableCell>
                                <TableCell align="center">{isArabic ? 'الإجراءات' : 'Actions'}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student) => {
                                const studentId = getStudentId(student);
                                const status = getAttendanceStatus(studentId);
                                return (
                                    <TableRow key={student.id}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedStudents[studentId] || false}
                                                onChange={(e) => handleSelectStudent(studentId, e.target.checked)}
                                                disabled={!!status}
                                            />
                                        </TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>
                                            {status === 'present' && (
                                                <Chip label={isArabic ? 'حاضر' : 'Present'} color="success" size="small" />
                                            )}
                                            {status === 'absent' && (
                                                <Chip label={isArabic ? 'غائب' : 'Absent'} color="error" size="small" />
                                            )}
                                            {status === 'late' && (
                                                <Chip label={isArabic ? 'متأخر' : 'Late'} color="warning" size="small" />
                                            )}
                                            {!status && (
                                                <Chip label={isArabic ? 'لم يتم التسجيل' : 'Not Marked'} variant="outlined" size="small" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                placeholder={isArabic ? 'ملاحظات...' : 'Notes...'}
                                                value={notes[studentId] || ''}
                                                onChange={(e) => setNotes(prev => ({ ...prev, [studentId]: e.target.value }))}
                                                disabled={!!status}
                                                sx={{ width: 150 }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {!status && (
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={(e) => handleMarkAttendance(studentId, 'present', e)}
                                                    >
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={(e) => handleMarkAttendance(studentId, 'absent', e)}
                                                    >
                                                        <CancelIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="warning"
                                                        onClick={(e) => handleMarkAttendance(studentId, 'late', e)}
                                                    >
                                                        <AccessTimeIcon />
                                                    </IconButton>
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                {students.length === 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        {isArabic ? 'لا يوجد طلاب مسجلين في هذه الدورة' : 'No enrolled students in this course'}
                    </Alert>
                )}
            </Paper>

            <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
                <DialogTitle>{isArabic ? 'تأكيد تسجيل الحضور' : 'Confirm Attendance'}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {isArabic
                            ? `هل تريد تسجيل حضور ${Object.values(selectedStudents).filter(Boolean).length} طالب؟`
                            : `Mark ${Object.values(selectedStudents).filter(Boolean).length} students as present?`}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog(false)}>
                        {isArabic ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button onClick={() => handleBulkMark('present')} variant="contained" color="success">
                        {isArabic ? 'تأكيد' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default LessonAttendance;
