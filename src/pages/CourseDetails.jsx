import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import EnrollmentForm from '../components/common/EnrollmentForm';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Rating,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useCourses } from '../contexts/CourseContext';
import { useAuth } from '../contexts/AuthContext';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { courses, getCurrentRound } = useCourses();
  const { user } = useAuth();
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [fetchedCourse, setFetchedCourse] = useState(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [currentRound, setCurrentRound] = useState(null);

  // Try to find course in context first, then fetch from Firestore
  useEffect(() => {
    const findCourse = async () => {
      // Check if course exists in context
      const contextCourse = courses.find(c => c.id === courseId);
      if (contextCourse) {
        setFetchedCourse(contextCourse);
        setLoading(false);
        return;
      }

      // If not in context, fetch directly from Firestore
      try {
        const courseRef = doc(db, 'courses', courseId);
        const snapshot = await getDoc(courseRef);
        if (snapshot.exists()) {
          setFetchedCourse({ id: snapshot.id, ...snapshot.data() });
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    findCourse();
  }, [courseId, courses]);

  // Check if user is already enrolled
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user?.uid || !courseId) {
        setCheckingEnrollment(false);
        return;
      }

      try {
        const enrollmentsRef = collection(db, 'enrollments');
        const q = query(
          enrollmentsRef,
          where('userId', '==', user.uid),
          where('courseId', '==', courseId)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const enrollment = snapshot.docs[0].data();
          setEnrolled(true);
          setEnrollmentStatus(enrollment.status || 'pending');
        }
      } catch (error) {
        console.error('Error checking enrollment:', error);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollment();
  }, [user, courseId]);

  // Use current round from course data (already fetched by context)
  useEffect(() => {
    if (fetchedCourse?.currentRound) {
      setCurrentRound(fetchedCourse.currentRound);
    }
  }, [fetchedCourse]);

  const course = fetchedCourse;

  if (loading) {
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
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!course) {
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
          <Alert severity="error">
            {t('courseDetails.notFound')}
          </Alert>
        </Box>
      </Box>
    );
  }

  const handleEnrollClick = () => {
    setEnrollDialogOpen(true);
  };

  const handleEnrollClose = () => {
    setEnrollDialogOpen(false);
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
      default: return 'default';
    }
  };

  // Helper function to get bilingual text
  const getText = (field) => {
    if (typeof field === 'object') {
      return field[isArabic ? 'ar' : 'en'];
    }
    return field;
  };

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
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <Grid container spacing={4} flexDirection={{ xs: 'column-reverse', md: "row" }}>


          {/* Course Information */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
              }}
            >
              {getText(course.title)}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Rating value={course.rating || 4.5} readOnly />
              <Typography variant="body2" color="textSecondary">
                ({course.reviews?.length || 0} {isArabic ? 'تقييم' : 'reviews'})
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <SchoolIcon color="primary" />
              <Typography variant="subtitle1">
                <strong>{course.instructor?.name || 'Unknown Instructor'}</strong>
              </Typography>
            </Box>

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
              {t('courseDetails.description')}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              {getText(course.description)}
            </Typography>

            {course.objectives && (
              <>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                  {t('courseDetails.objectives')}
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  {(() => {
                    const objectives = getText(course.objectives);
                    const objectivesList = typeof objectives === 'string'
                      ? objectives.split(',').map(obj => obj.trim())
                      : Array.isArray(objectives) ? objectives : [objectives];
                    return objectivesList.map((objective, idx) => (
                      <li key={idx} style={{ marginBottom: '8px' }}>
                        <Typography variant="body2">{objective}</Typography>
                      </li>
                    ));
                  })()}
                </Box>
              </>
            )}

            {course.topics && (
              <>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                  {t('courseDetails.topics')}
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  {(() => {
                    const topics = getText(course.topics);
                    const topicsList = typeof topics === 'string'
                      ? topics.split(',').map(topic => topic.trim())
                      : Array.isArray(topics) ? topics : [topics];
                    return topicsList.map((topic, idx) => (
                      <li key={idx} style={{ marginBottom: '8px' }}>
                        <Typography variant="body2">{topic}</Typography>
                      </li>
                    ));
                  })()}
                </Box>
              </>
            )}

            {course.requirements && (
              <>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                  {t('courseDetails.requirements')}
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  {(() => {
                    const requirements = getText(course.requirements);
                    const requirementsList = typeof requirements === 'string'
                      ? requirements.split(',').map(req => req.trim())
                      : Array.isArray(requirements) ? requirements : [requirements];
                    return requirementsList.map((requirement, idx) => (
                      <li key={idx} style={{ marginBottom: '8px' }}>
                        <Typography variant="body2">{requirement}</Typography>
                      </li>
                    ));
                  })()}
                </Box>
              </>
            )}

            {course.instructor && (
              <>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                  {t('courseDetails.instructor')}
                </Typography>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <SchoolIcon color="primary" />
                      <Typography variant="subtitle1">
                        <strong>{course.instructor.name || 'Unknown Instructor'}</strong>
                      </Typography>
                    </Box>
                    {course.instructor.bio && (
                      <Typography variant="body2" color="textSecondary">
                        {getText(course.instructor.bio)}
                      </Typography>
                    )}
                    {course.instructor.email && (
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                        {course.instructor.email}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </Grid>
          {/* Course Image and Enrollment */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                paddingTop: '56.25%',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'grey.200',
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Box
                component="img"
                src={course.thumbnail || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27225%27%3E%3Crect fill=%27%23D4A574%27 width=%27400%27 height=%27225%27/%3E%3C/svg%3E'}
                alt={getText(course.title)}
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
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  {t('courseDetails.courseInfo')}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <AttachMoneyIcon />
                  <Typography variant="body2">
                    <strong>{typeof course.price === 'number' ? course.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : course.price} SDG</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <PeopleIcon />
                  <Typography variant="body2">
                    {course.enrolledStudents?.length || 0} / {course.maxStudents} {t('courseDetails.students')}
                  </Typography>
                </Box>

                {course.duration && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <SchoolIcon />
                    <Typography variant="body2">
                      {getText(course.duration)}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  <Chip
                    label={getText(course.level)}
                    color={getLevelColor(course.level)}
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={getText(course.category)}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                </Box>

                {/* Enrollment Button - Different states based on enrollment status */}
                {checkingEnrollment ? (
                  <Button
                    fullWidth
                    variant="contained"
                    disabled
                    sx={{ mb: 2 }}
                  >
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    {t('courseDetails.checking')}
                  </Button>
                ) : enrolled ? (
                  <>
                    {enrollmentStatus === 'confirmed' || enrollmentStatus === 'active' ? (
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={() => navigate(`/courses/${courseId}/content`)}
                        sx={{ mb: 2 }}
                      >
                        {t('courseDetails.goToCourse')}
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        color="warning"
                        size="large"
                        disabled
                        sx={{ mb: 2 }}
                      >
                        {t('courseDetails.awaitingConfirmation')}
                      </Button>
                    )}
                    <Alert severity={enrollmentStatus === 'confirmed' || enrollmentStatus === 'active' ? 'success' : 'info'} sx={{ mb: 2 }}>
                      {enrollmentStatus === 'confirmed' || enrollmentStatus === 'active'
                        ? t('courseDetails.enrolledMessage')
                        : t('courseDetails.pendingMessage')
                      }
                    </Alert>
                  </>
                ) : (
                  <>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={handleEnrollClick}
                      disabled={course.enrolledStudents?.length >= course.maxStudents}
                      sx={{ mb: 2 }}
                    >
                      {course.enrolledStudents?.length >= course.maxStudents
                        ? t('courseDetails.courseFull')
                        : t('courseDetails.enrollNow')
                      }
                    </Button>
                    {course.enrolledStudents?.length >= course.maxStudents && (
                      <Alert severity="warning">
                        {t('courseDetails.courseFull')}
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <EnrollmentForm
        open={enrollDialogOpen}
        onClose={handleEnrollClose}
        courseId={courseId}
        courseName={getText(course.title)}
        roundId={currentRound?.id}
        roundNumber={currentRound?.roundNumber || 1}
      />
    </Box>
  );
}

export default CourseDetails;
