import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Container, Typography, Button, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchCourseAttendance } from '../../store/slices/attendanceSlice';
import { LessonAttendanceList } from '../../components/instructor/attendance';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function CourseAttendanceOverview() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const { attendanceRecords, loading } = useSelector(state => state.attendance);
    
    const [students, setStudents] = useState([]);
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        loadData();
    }, [courseId]);

    const loadData = async () => {
        try {
            setLoadingData(true);

            // Fetch course
            const courseDoc = await getDoc(doc(db, 'courses', courseId));
            if (courseDoc.exists()) {
                setCourse({ id: courseDoc.id, ...courseDoc.data() });
            }

            // Fetch enrolled students
            const enrollmentsRef = collection(db, 'enrollments');
            const q = query(
                enrollmentsRef,
                where('courseId', '==', courseId),
                where('status', '==', 'confirmed')
            );
            const enrollmentSnap = await getDocs(q);
            setStudents(enrollmentSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));

            // Fetch all units and lessons
            const unitsRef = collection(db, `courses/${courseId}/units`);
            const unitsSnap = await getDocs(unitsRef);
            
            const allLessons = [];
            for (const unitDoc of unitsSnap.docs) {
                const lessonsRef = collection(db, `courses/${courseId}/units/${unitDoc.id}/lessons`);
                const lessonsSnap = await getDocs(lessonsRef);
                
                lessonsSnap.docs.forEach(lessonDoc => {
                    allLessons.push({
                        id: lessonDoc.id,
                        unitId: unitDoc.id,
                        unitTitle: unitDoc.data().title,
                        ...lessonDoc.data()
                    });
                });
            }
            setLessons(allLessons);

            // Fetch all attendance for this course
            dispatch(fetchCourseAttendance({ courseId }));
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoadingData(false);
        }
    };

    const getLessonAttendance = (lessonId) => {
        return attendanceRecords.filter(a => a.lessonId === lessonId);
    };

    const getTitle = (obj) => {
        if (!obj) return '';
        return typeof obj === 'object' ? obj[isArabic ? 'ar' : 'en'] || obj.en : obj;
    };

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
                {isArabic ? 'العودة' : 'Back'}
            </Button>

            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                {isArabic ? 'سجل الحضور' : 'Attendance Overview'}
            </Typography>

            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                {getTitle(course?.title)}
            </Typography>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {isArabic ? 'الحضور حسب الدرس' : 'Attendance by Lesson'}
                </Typography>

                {lessons.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        {isArabic ? 'لا توجد دروس' : 'No lessons available'}
                    </Typography>
                ) : (
                    lessons.map(lesson => (
                        <LessonAttendanceList
                            key={lesson.id}
                            lesson={lesson}
                            students={students}
                            attendanceRecords={getLessonAttendance(lesson.id)}
                        />
                    ))
                )}
            </Box>
        </Container>
    );
}

export default CourseAttendanceOverview;
