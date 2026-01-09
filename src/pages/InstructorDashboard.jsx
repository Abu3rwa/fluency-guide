import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  LinearProgress,
  Chip,
  Container,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useCourses } from '../contexts/CourseContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../utils/imageUpload';
import { collection, query, where, getDocs, updateDoc, addDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { gradients, componentStyles } from '../theme';

// Dashboard Components
import { DashboardHeader, DashboardStats, QuickActions, PrivateLessons } from '../components/instructor';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';


function InstructorDashboard() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courses, loading, fetchInstructorCourses, createCourse, updateCourse, deleteCourse, restartCourse, fetchCourseRounds } = useCourses();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: { en: '', ar: '' },
    description: { en: '', ar: '' },
    businessDescription: { en: '', ar: '' },
    category: { en: '', ar: '' },
    level: { en: '', ar: '' },
    price: '',
    maxStudents: 20,
    thumbnail: '',
    language: 'en',
    startDate: '',
    endDate: '',
    duration: { en: '', ar: '' },
    requirements: { en: '', ar: '' },
    objectives: { en: '', ar: '' },
    topics: { en: '', ar: '' },
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [filterCourseId, setFilterCourseId] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState('');
  const [restartDialogOpen, setRestartDialogOpen] = useState(false);
  const [restartingCourse, setRestartingCourse] = useState(null);
  const [restartFormData, setRestartFormData] = useState({
    startDate: '',
    endDate: '',
    maxStudents: 20,
    price: '',
  });
  const [courseRounds, setCourseRounds] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  // Fetch instructor courses on mount
  useEffect(() => {
    if (user?.uid) {
      fetchInstructorCourses(user.uid);
      fetchEnrollments(user.uid);
    }
  }, [user?.uid, fetchInstructorCourses]);

  const fetchEnrollments = async (instructorUid) => {
    setEnrollmentLoading(true);
    try {
      // Get instructor's courses
      const coursesRef = collection(db, 'courses');
      const coursesQuery = query(coursesRef, where('instructor.uid', '==', instructorUid));
      const coursesSnap = await getDocs(coursesQuery);
      const courseIds = coursesSnap.docs.map(doc => doc.id);

      // Get enrollments for these courses
      if (courseIds.length > 0) {
        const enrollmentsRef = collection(db, 'enrollments');
        const enrollmentsQuery = query(enrollmentsRef, where('courseId', 'in', courseIds));
        const enrollmentsSnap = await getDocs(enrollmentsQuery);
        const enrollmentsList = enrollmentsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEnrollments(enrollmentsList);

        // Calculate student counts per course and round
        const courseCounts = {};
        const roundCounts = {};

        enrollmentsList.forEach(enrollment => {
          // Count total students per course
          if (!courseCounts[enrollment.courseId]) {
            courseCounts[enrollment.courseId] = 0;
          }
          courseCounts[enrollment.courseId]++;

          // Count students per round
          if (enrollment.roundId) {
            if (!roundCounts[enrollment.roundId]) {
              roundCounts[enrollment.roundId] = 0;
            }
            roundCounts[enrollment.roundId]++;
          }
        });

        // Update course totalStudents
        for (const [courseId, count] of Object.entries(courseCounts)) {
          try {
            await updateDoc(doc(db, 'courses', courseId), {
              totalStudents: count,
            });
          } catch (err) {
            console.error('Error updating course student count:', err);
          }
        }

        // Update round enrolledStudents
        for (const [roundId, count] of Object.entries(roundCounts)) {
          try {
            await updateDoc(doc(db, 'course_rounds', roundId), {
              enrolledStudents: count,
            });
          } catch (err) {
            console.error('Error updating round student count:', err);
          }
        }

        // Refresh courses to get updated counts
        await fetchInstructorCourses(instructorUid);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const instructorCourses = courses;

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase
    setUploadingImage(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const url = await uploadImage(file, 'course-thumbnails');
      setFormData({ ...formData, thumbnail: url });
      setUploadProgress(100);
      setTimeout(() => setUploadingImage(false), 500);
    } catch (error) {
      setUploadError(error.message);
      setUploadingImage(false);
      setPreviewImage(null);
    }
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: { en: course.title?.en || '', ar: course.title?.ar || '' },
        description: { en: course.description?.en || '', ar: course.description?.ar || '' },
        businessDescription: { en: course.businessDescription?.en || '', ar: course.businessDescription?.ar || '' },
        category: { en: course.category?.en || '', ar: course.category?.ar || '' },
        level: { en: course.level?.en || '', ar: course.level?.ar || '' },
        price: course.currentRound?.price || course.price || '',
        maxStudents: course.currentRound?.maxStudents || 20,
        thumbnail: course.thumbnail || '',
        language: course.language || 'en',
        startDate: course.currentRound?.startDate || '',
        endDate: course.currentRound?.endDate || '',
        duration: { en: course.duration?.en || '', ar: course.duration?.ar || '' },
        requirements: { en: course.requirements?.en || '', ar: course.requirements?.ar || '' },
        objectives: { en: course.objectives?.en || '', ar: course.objectives?.ar || '' },
        topics: { en: course.topics?.en || '', ar: course.topics?.ar || '' },
      });
      // Set preview image if thumbnail exists
      if (course.thumbnail) {
        setPreviewImage(course.thumbnail);
      }
    } else {
      setEditingCourse(null);
      setFormData({
        title: { en: '', ar: '' },
        description: { en: '', ar: '' },
        businessDescription: { en: '', ar: '' },
        category: { en: '', ar: '' },
        level: { en: '', ar: '' },
        price: '',
        maxStudents: 20,
        thumbnail: '',
        language: 'en',
        startDate: '',
        endDate: '',
        duration: { en: '', ar: '' },
        requirements: { en: '', ar: '' },
        objectives: { en: '', ar: '' },
        topics: { en: '', ar: '' },
      });
      setPreviewImage(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCourse(null);
    setFormData({
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
      businessDescription: { en: '', ar: '' },
      category: { en: '', ar: '' },
      level: { en: '', ar: '' },
      price: '',
      maxStudents: 20,
      thumbnail: '',
      language: 'en',
      startDate: '',
      endDate: '',
      duration: { en: '', ar: '' },
      requirements: { en: '', ar: '' },
      objectives: { en: '', ar: '' },
      topics: { en: '', ar: '' },
    });
  };

  const handleSaveCourse = async () => {
    try {
      setFormMessage({ type: '', text: '' });
      if (editingCourse) {
        // Separate course content from round-specific data
        const { startDate, endDate, maxStudents, price, ...courseContent } = formData;

        // Update course content
        await updateCourse(editingCourse.id, courseContent);

        // Update current round if it exists
        if (editingCourse.currentRoundId) {
          await updateDoc(doc(db, 'course_rounds', editingCourse.currentRoundId), {
            startDate,
            endDate,
            maxStudents,
            price,
            updatedAt: Timestamp.now(),
          });
        }

        setFormMessage({ type: 'success', text: isArabic ? 'تم تحديث الدورة بنجاح' : 'Course updated successfully!' });
      } else {
        await createCourse({
          ...formData,
          instructor: { uid: user.uid, name: user.displayName || 'Instructor' },
          status: 'published',
        });
        setFormMessage({ type: 'success', text: isArabic ? 'تم إنشاء الدورة بنجاح' : 'Course created successfully!' });
      }
      setTimeout(() => handleCloseDialog(), 1500);
    } catch (error) {
      console.error('Error saving course:', error);
      setFormMessage({ type: 'error', text: error.message || (isArabic ? 'خطأ في حفظ الدورة' : 'Error saving course') });
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذه الدورة؟' : 'Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await deleteCourse(courseId);
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(isArabic ? 'خطأ في حذف الدورة' : 'Error deleting course');
    }
  };

  const handleEnrollmentAction = (enrollment) => {
    const course = instructorCourses.find(c => c.id === enrollment.courseId);
    setSelectedEnrollment(enrollment);
    setPaymentAmount(course?.price || '');
    setEnrollmentStatus(enrollment.status);
    setEnrollmentDialogOpen(true);
  };

  const handleUpdateEnrollmentStatus = async () => {
    if (!selectedEnrollment) return;

    try {
      const enrollmentRef = doc(db, 'enrollments', selectedEnrollment.id);
      const updateData = { status: enrollmentStatus };

      if (enrollmentStatus === 'confirmed') {
        updateData.paymentAmount = parseFloat(paymentAmount);
        updateData.paymentDate = Timestamp.now();

        await addDoc(collection(db, 'payments'), {
          enrollmentId: selectedEnrollment.id,
          studentId: selectedEnrollment.id,
          studentName: `${selectedEnrollment.firstName} ${selectedEnrollment.lastName}`,
          studentEmail: selectedEnrollment.email,
          courseId: selectedEnrollment.courseId,
          courseName: instructorCourses.find(c => c.id === selectedEnrollment.courseId)?.title || 'Unknown',
          amount: parseFloat(paymentAmount),
          originalAmount: instructorCourses.find(c => c.id === selectedEnrollment.courseId)?.price || 0,
          discount: (instructorCourses.find(c => c.id === selectedEnrollment.courseId)?.price || 0) - parseFloat(paymentAmount),
          status: 'completed',
          createdAt: Timestamp.now(),
          instructorId: user.uid,
        });
      }

      await updateDoc(enrollmentRef, updateData);
      setEnrollmentDialogOpen(false);
      await fetchEnrollments(user.uid);
    } catch (error) {
      console.error('Error updating enrollment:', error);
      alert(isArabic ? 'خطأ في تحديث الالتحاق' : 'Error updating enrollment');
    }
  };

  const handleWhatsAppClick = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const handleOpenRestartDialog = (course) => {
    setRestartingCourse(course);
    setRestartFormData({
      startDate: '',
      endDate: '',
      maxStudents: 20,
      price: course.price || '',
    });
    setRestartDialogOpen(true);
  };

  const handleCloseRestartDialog = () => {
    setRestartDialogOpen(false);
    setRestartingCourse(null);
    setRestartFormData({
      startDate: '',
      endDate: '',
      maxStudents: 20,
      price: '',
    });
  };

  const handleRestartCourse = async () => {
    if (!restartingCourse) return;

    try {
      await restartCourse(restartingCourse.id, {
        ...restartFormData,
        instructorId: user.uid,
      });

      setFormMessage({
        type: 'success',
        text: isArabic ? 'تم إعادة تشغيل الدورة بنجاح' : 'Course restarted successfully!'
      });

      handleCloseRestartDialog();
      await fetchInstructorCourses(user.uid);
    } catch (error) {
      console.error('Error restarting course:', error);
      alert(isArabic ? 'خطأ في إعادة تشغيل الدورة' : 'Error restarting course');
    }
  };

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
        }}
      >
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            padding: { xs: 2, md: 4 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Alert severity="warning">
            {isArabic ? 'يرجى تسجيل الدخول كمدرس' : 'Please login as an instructor'}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f7fa',
      }}
    >
      <DashboardHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewCourse={() => handleOpenDialog()}
      />

      <Container maxWidth="lg" sx={{ mt: 3, pb: 6, position: 'relative', zIndex: 2 }}>
        {activeTab === 0 && (
          <>
            <DashboardStats courses={instructorCourses} enrollments={enrollments} />
            <QuickActions
              enrollments={enrollments}
              onNewCourse={() => handleOpenDialog()}
              setActiveTab={setActiveTab}
            />
          </>
        )}
        {/* Tab Content */}
        {activeTab === 1 && (
          <>
            {/* Courses Table */}
            <Box sx={{ overflowX: 'auto', mb: 4 }}>
              <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', minWidth: 650 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.light' }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {isArabic ? 'الدورة' : 'Course'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {isArabic ? 'الفئة' : 'Category'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {isArabic ? 'المستوى' : 'Level'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {isArabic ? 'الجولة' : 'Round'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {isArabic ? 'الطلاب' : 'Students'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {isArabic ? 'السعر' : 'Price'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {isArabic ? 'الإجراءات' : 'Actions'}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : instructorCourses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          {isArabic ? 'لا توجد دورات' : 'No courses yet'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      instructorCourses.map((course) => (
                        <TableRow key={course.id} hover>
                          <TableCell>
                            {typeof course.title === 'object' ? course.title[isArabic ? 'ar' : 'en'] : course.title}
                          </TableCell>
                          <TableCell align="right">
                            {typeof course.category === 'object' ? course.category[isArabic ? 'ar' : 'en'] : course.category}
                          </TableCell>
                          <TableCell align="right">
                            {typeof course.level === 'object' ? course.level[isArabic ? 'ar' : 'en'] : course.level}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${isArabic ? 'جولة' : 'Round'} ${course.totalRounds || 1}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {course.totalStudents || 0} {isArabic ? 'إجمالي' : 'total'}
                          </TableCell>
                          <TableCell align="right">${course.price}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(`/instructor/course/${course.id}/content`)}
                                sx={{ minWidth: 'auto', px: 1 }}
                              >
                                {isArabic ? 'المحتوى' : 'Content'}
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleOpenDialog(course)}
                                sx={{ minWidth: 'auto', px: 1 }}
                              >
                                <EditIcon fontSize="small" />
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                onClick={() => handleOpenRestartDialog(course)}
                                sx={{ minWidth: 'auto', px: 1 }}
                              >
                                {isArabic ? 'إعادة' : 'R'}
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleDeleteCourse(course.id)}
                                sx={{ minWidth: 'auto', px: 1 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        )}

        {/* Enrollments Tab */}
        {activeTab === 2 && (
          <>
            {/* Enrollments Section */}
            <Box id="enrollments-section" sx={{ mt: 0 }}>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                }}
              >
                {isArabic ? 'الالتحاقات' : 'Enrollments'}
              </Typography>

              {/* Filter by Course */}
              <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <FormControl sx={{ minWidth: 300 }}>
                  <InputLabel>{isArabic ? 'تصفية حسب الدورة' : 'Filter by Course'}</InputLabel>
                  <Select
                    value={filterCourseId}
                    onChange={(e) => setFilterCourseId(e.target.value)}
                    label={isArabic ? 'تصفية حسب الدورة' : 'Filter by Course'}
                  >
                    <MenuItem value="">{isArabic ? 'كل الدورات' : 'All Courses'}</MenuItem>
                    {instructorCourses.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {typeof course.title === 'object' ? course.title[isArabic ? 'ar' : 'en'] : course.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Enrollments Table */}
              <Box sx={{ overflowX: 'auto' }}>
                <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', minWidth: 800 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.light' }}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {isArabic ? 'الاسم' : 'Name'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {isArabic ? 'البريد الإلكتروني' : 'Email'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {isArabic ? 'رقم الهاتف' : 'Phone'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {isArabic ? 'الدورة' : 'Course'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {isArabic ? 'الجولة' : 'Round'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {isArabic ? 'التاريخ' : 'Date'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {isArabic ? 'الحالة' : 'Status'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {isArabic ? 'التواصل' : 'Contact'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {isArabic ? 'الإجراءات' : 'Actions'}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enrollmentLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <CircularProgress />
                          </TableCell>
                        </TableRow>
                      ) : (
                        (() => {
                          const filteredEnrollments = filterCourseId
                            ? enrollments.filter(e => e.courseId === filterCourseId)
                            : enrollments;

                          return filteredEnrollments.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} align="center">
                                {isArabic ? 'لا توجد التحاقات' : 'No enrollments'}
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredEnrollments.map((enrollment) => {
                              const course = instructorCourses.find(c => c.id === enrollment.courseId);
                              const enrollDate = enrollment.enrolledAt?.toDate ? enrollment.enrolledAt.toDate().toLocaleDateString() : new Date(enrollment.enrolledAt).toLocaleDateString();
                              return (
                                <TableRow key={enrollment.id} hover>
                                  <TableCell>{`${enrollment.firstName} ${enrollment.lastName}`}</TableCell>
                                  <TableCell>{enrollment.email || '-'}</TableCell>
                                  <TableCell>{enrollment.phoneNumber}</TableCell>
                                  <TableCell>
                                    {course ? (typeof course.title === 'object' ? course.title[isArabic ? 'ar' : 'en'] : course.title) : 'Unknown'}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={`${isArabic ? 'جولة' : 'R'} ${enrollment.roundNumber || 1}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell>{enrollDate}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={enrollment.status === 'pending' ? (isArabic ? 'قيد الانتظار' : 'Pending') : enrollment.status === 'confirmed' ? (isArabic ? 'مؤكد' : 'Confirmed') : (isArabic ? 'مرفوض' : 'Rejected')}
                                      color={enrollment.status === 'pending' ? 'warning' : enrollment.status === 'confirmed' ? 'success' : 'error'}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="small"
                                      startIcon={<WhatsAppIcon />}
                                      onClick={() => handleWhatsAppClick(enrollment.phoneNumber)}
                                      sx={{ color: '#25D366' }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => handleEnrollmentAction(enrollment)}
                                    >
                                      {isArabic ? 'إدارة' : 'Manage'}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          );
                        })()
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </>
        )}

        {/* Private Lessons Tab */}
        {activeTab === 3 && (
          <>
            {/* Private Lessons Section */}
            <Box id="private-lessons-section" sx={{ mt: 0 }}>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 4,
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                }}
              >
                {isArabic ? 'الدروس الخاصة' : 'Private Lessons'}
              </Typography>
              <PrivateLessons />
            </Box>
          </>
        )}

        {/* Course Form Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingCourse
              ? (isArabic ? 'تعديل الدورة' : 'Edit Course')
              : (isArabic ? 'إضافة دورة جديدة' : 'Add New Course')}
          </DialogTitle>
          <DialogContent sx={{ pt: 2, maxHeight: '80vh', overflowY: 'auto' }}>
            {formMessage.text && (
              <Alert severity={formMessage.type} sx={{ mb: 2 }}>
                {formMessage.text}
              </Alert>
            )}
            {/* Basic Information */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>
                  {isArabic ? 'المعلومات الأساسية' : 'Basic Information'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                    {isArabic ? 'اسم الدورة - English' : 'Course Title - English'}
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.title.en}
                    onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                    placeholder="Enter in English"
                    required
                  />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
                    {isArabic ? 'اسم الدورة - العربية' : 'Course Title - Arabic'}
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.title.ar}
                    onChange={(e) => setFormData({ ...formData, title: { ...formData.title, ar: e.target.value } })}
                    placeholder="أدخل باللغة العربية"
                    required
                  />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
                    {isArabic ? 'الوصف - English' : 'Description - English'}
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.description.en}
                    onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })}
                    multiline
                    rows={3}
                    placeholder="Enter in English"
                    required
                  />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
                    {isArabic ? 'الوصف - العربية' : 'Description - Arabic'}
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.description.ar}
                    onChange={(e) => setFormData({ ...formData, description: { ...formData.description, ar: e.target.value } })}
                    multiline
                    rows={3}
                    placeholder="أدخل باللغة العربية"
                    required
                  />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, color: 'text.secondary' }}>
                    {isArabic ? 'وصف الأعمال (اختياري) - English' : 'Business Description (Optional) - English'}
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.businessDescription.en}
                    onChange={(e) => setFormData({ ...formData, businessDescription: { ...formData.businessDescription, en: e.target.value } })}
                    multiline
                    rows={2}
                    placeholder="Enter business description in English"
                  />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, color: 'text.secondary' }}>
                    {isArabic ? 'وصف الأعمال (اختياري) - العربية' : 'Business Description (Optional) - Arabic'}
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.businessDescription.ar}
                    onChange={(e) => setFormData({ ...formData, businessDescription: { ...formData.businessDescription, ar: e.target.value } })}
                    multiline
                    rows={2}
                    placeholder="أدخل وصف الأعمال باللغة العربية"
                  />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
                    {isArabic ? 'صورة الدورة' : 'Course Thumbnail'}
                  </Typography>

                  {uploadError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {uploadError}
                    </Alert>
                  )}

                  {previewImage && (
                    <Box
                      component="img"
                      src={previewImage}
                      alt="Preview"
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 1,
                        mb: 2,
                        border: '2px solid #e0e0e0',
                      }}
                    />
                  )}

                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                    disabled={uploadingImage}
                    sx={{ mb: 2 }}
                  >
                    {uploadingImage
                      ? (isArabic ? 'جاري الرفع...' : 'Uploading...')
                      : (isArabic ? 'اختر صورة' : 'Choose Image')}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageSelect}
                      disabled={uploadingImage}
                    />
                  </Button>

                  {uploadingImage && (
                    <Box sx={{ width: '100%', mb: 2 }}>
                      <LinearProgress variant="determinate" value={uploadProgress} />
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        {uploadProgress}%
                      </Typography>
                    </Box>
                  )}

                  {formData.thumbnail && (
                    <Typography variant="caption" sx={{ color: 'success.main', mb: 2 }}>
                      ✓ {isArabic ? 'تم تحميل الصورة بنجاح' : 'Image uploaded successfully'}
                    </Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Course Details */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>
                  {isArabic ? 'تفاصيل الدورة' : 'Course Details'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {isArabic ? 'الفئة - English' : 'Category - English'}
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={formData.category.en}
                          onChange={(e) => setFormData({ ...formData, category: { ...formData.category, en: e.target.value } })}
                        >
                          <MenuItem value="">Select...</MenuItem>
                          <MenuItem value="General English">General English</MenuItem>
                          <MenuItem value="Business">Business</MenuItem>
                          <MenuItem value="Conversational">Conversational</MenuItem>
                          <MenuItem value="Grammar">Grammar</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {isArabic ? 'الفئة - العربية' : 'Category - Arabic'}
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={formData.category.ar}
                          onChange={(e) => setFormData({ ...formData, category: { ...formData.category, ar: e.target.value } })}
                        >
                          <MenuItem value="">اختر...</MenuItem>
                          <MenuItem value="اللغة الإنجليزية العامة">اللغة الإنجليزية العامة</MenuItem>
                          <MenuItem value="الأعمال">الأعمال</MenuItem>
                          <MenuItem value="المحادثة">المحادثة</MenuItem>
                          <MenuItem value="القواعد">القواعد</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {isArabic ? 'المستوى - English' : 'Level - English'}
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={formData.level.en}
                          onChange={(e) => setFormData({ ...formData, level: { ...formData.level, en: e.target.value } })}
                        >
                          <MenuItem value="">Select...</MenuItem>
                          <MenuItem value="Beginner">Beginner</MenuItem>
                          <MenuItem value="Intermediate">Intermediate</MenuItem>
                          <MenuItem value="Advanced">Advanced</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {isArabic ? 'المستوى - العربية' : 'Level - Arabic'}
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={formData.level.ar}
                          onChange={(e) => setFormData({ ...formData, level: { ...formData.level, ar: e.target.value } })}
                        >
                          <MenuItem value="">اختر...</MenuItem>
                          <MenuItem value="مبتدئ">مبتدئ</MenuItem>
                          <MenuItem value="متوسط">متوسط</MenuItem>
                          <MenuItem value="متقدم">متقدم</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>{isArabic ? 'اللغة' : 'Language'}</InputLabel>
                        <Select
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="ar">Arabic</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={isArabic ? 'عدد الطلاب الأقصى' : 'Max Students'}
                        type="number"
                        value={formData.maxStudents}
                        onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                        inputProps={{ min: 1, max: 1000 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Pricing & Schedule */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>
                  {isArabic ? 'السعر والجدول الزمني' : 'Pricing & Schedule'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={isArabic ? 'السعر' : 'Price ($)'}
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        inputProps={{ step: 0.01, min: 0 }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={isArabic ? 'المدة - English' : 'Duration - English'}
                        value={formData.duration.en}
                        onChange={(e) => setFormData({ ...formData, duration: { ...formData.duration, en: e.target.value } })}
                        placeholder="e.g., 8 weeks"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={isArabic ? 'المدة - العربية' : 'Duration - Arabic'}
                        value={formData.duration.ar}
                        onChange={(e) => setFormData({ ...formData, duration: { ...formData.duration, ar: e.target.value } })}
                        placeholder="مثل: 8 أسابيع"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={isArabic ? 'تاريخ البداية' : 'Start Date'}
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={isArabic ? 'تاريخ النهاية' : 'End Date'}
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Course Content */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>
                  {isArabic ? 'محتوى الدورة' : 'Course Content'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {isArabic ? 'أهداف الدورة - English' : 'Learning Objectives - English'}
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.objectives.en}
                    onChange={(e) => setFormData({ ...formData, objectives: { ...formData.objectives, en: e.target.value } })}
                    multiline
                    rows={3}
                    placeholder="Separate with new lines"
                  />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
                    {isArabic ? 'أهداف الدورة - العربية' : 'Learning Objectives - Arabic'}
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.objectives.ar}
                    onChange={(e) => setFormData({ ...formData, objectives: { ...formData.objectives, ar: e.target.value } })}
                    multiline
                    rows={3}
                    placeholder="افصل بسطور جديدة"
                  />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
                    {isArabic ? 'المواضيع الرئيسية - English' : 'Main Topics - English'}
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.topics.en}
                    onChange={(e) => setFormData({ ...formData, topics: { ...formData.topics, en: e.target.value } })}
                    multiline
                    rows={3}
                    placeholder="Separate with new lines"
                  />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
                    {isArabic ? 'المواضيع الرئيسية - العربية' : 'Main Topics - Arabic'}
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.topics.ar}
                    onChange={(e) => setFormData({ ...formData, topics: { ...formData.topics, ar: e.target.value } })}
                    multiline
                    rows={3}
                    placeholder="افصل بسطور جديدة"
                  />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
                    {isArabic ? 'المتطلبات المسبقة - English' : 'Prerequisites - English'}
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.requirements.en}
                    onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, en: e.target.value } })}
                    multiline
                    rows={2}
                    placeholder="Leave empty if none"
                  />

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>
                    {isArabic ? 'المتطلبات المسبقة - العربية' : 'Prerequisites - Arabic'}
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.requirements.ar}
                    onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, ar: e.target.value } })}
                    multiline
                    rows={2}
                    placeholder="اترك فارغاً إذا لم توجد"
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button onClick={handleCloseDialog} disabled={loading}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSaveCourse}
              variant="contained"
              color="primary"
              disabled={loading || uploadingImage}
              sx={{ minWidth: 100 }}
            >
              {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
              {isArabic ? 'حفظ' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enrollment Management Dialog */}
        <Dialog open={enrollmentDialogOpen} onClose={() => setEnrollmentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {isArabic ? 'إدارة الالتحاق' : 'Manage Enrollment'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedEnrollment && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <Typography variant="body2" color="textSecondary">
                  <strong>{isArabic ? 'اسم الطالب' : 'Student Name'}:</strong> {selectedEnrollment.firstName} {selectedEnrollment.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>{isArabic ? 'البريد الإلكتروني' : 'Email'}:</strong> {selectedEnrollment.email || '-'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>{isArabic ? 'رقم الهاتف' : 'Phone'}:</strong> {selectedEnrollment.phoneNumber}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>{isArabic ? 'رقم WhatsApp' : 'WhatsApp'}:</strong> {selectedEnrollment.whatsappNumber || '-'}
                </Typography>

                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{isArabic ? 'حالة الالتحاق' : 'Enrollment Status'}</InputLabel>
                    <Select
                      value={enrollmentStatus}
                      onChange={(e) => setEnrollmentStatus(e.target.value)}
                      label={isArabic ? 'حالة الالتحاق' : 'Enrollment Status'}
                    >
                      <MenuItem value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</MenuItem>
                      <MenuItem value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</MenuItem>
                      <MenuItem value="rejected">{isArabic ? 'مرفوض' : 'Rejected'}</MenuItem>
                    </Select>
                  </FormControl>

                  {enrollmentStatus === 'confirmed' && (
                    <TextField
                      fullWidth
                      label={isArabic ? 'مبلغ الدفع' : 'Payment Amount'}
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      helperText={isArabic ? 'يمكنك تطبيق خصم' : 'You can apply discount'}
                    />
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEnrollmentDialogOpen(false)}>
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
            <Button
              onClick={handleUpdateEnrollmentStatus}
              variant="contained"
              color="primary"
            >
              {isArabic ? 'حفظ' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Restart Course Dialog */}
        <Dialog open={restartDialogOpen} onClose={handleCloseRestartDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {isArabic ? 'إعادة تشغيل الدورة' : 'Restart Course'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {isArabic
                ? `سيتم إنشاء جولة جديدة للدورة "${restartingCourse ? (typeof restartingCourse.title === 'object' ? restartingCourse.title[isArabic ? 'ar' : 'en'] : restartingCourse.title) : ''}"`
                : `This will create a new round for "${restartingCourse ? (typeof restartingCourse.title === 'object' ? restartingCourse.title.en : restartingCourse.title) : ''}"`}
            </Typography>

            <TextField
              fullWidth
              label={isArabic ? 'تاريخ البدء' : 'Start Date'}
              type="date"
              value={restartFormData.startDate}
              onChange={(e) => setRestartFormData({ ...restartFormData, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label={isArabic ? 'تاريخ الانتهاء' : 'End Date'}
              type="date"
              value={restartFormData.endDate}
              onChange={(e) => setRestartFormData({ ...restartFormData, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label={isArabic ? 'الحد الأقصى للطلاب' : 'Max Students'}
              type="number"
              value={restartFormData.maxStudents}
              onChange={(e) => setRestartFormData({ ...restartFormData, maxStudents: parseInt(e.target.value) || 20 })}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label={isArabic ? 'السعر' : 'Price'}
              type="number"
              value={restartFormData.price}
              onChange={(e) => setRestartFormData({ ...restartFormData, price: e.target.value })}
              helperText={isArabic ? 'يمكنك تغيير السعر للجولة الجديدة' : 'You can change the price for the new round'}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseRestartDialog}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleRestartCourse}
              variant="contained"
              color="primary"
            >
              {isArabic ? 'إعادة تشغيل' : 'Restart Course'}
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
}

export default InstructorDashboard;
