import React, { useEffect, useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  Badge,
  CircularProgress,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { useUser } from "../../../contexts/UserContext";
import { enrollmentService } from "../../../services/enrollmentService";
import { ROUTES } from "../../../routes/constants";
import { useNavigate } from "react-router-dom";

const CourseCard = ({ course, onSignUp }) => {
  const { userData: user, isStudent } = useUser();
  const [enrolled, setEnrolled] = useState(false);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let mounted = true;
    const checkEnrollment = async () => {
      if (user && isStudent) {
        setChecking(true);
        try {
          const userId = user.uid || user.id;
          const studentEnrollments =
            await enrollmentService.getEnrollmentsByStudent(userId);

          const enrollments = studentEnrollments.filter(
            (enrollment) => enrollment.courseId === course.id
          );
          if (!mounted) return;
          setEnrolled(enrollments.length > 0);
          console.log("Enrollments fetched:", studentEnrollments);
          console.log("course id:", course.id);
        } catch (e) {
          if (mounted) setEnrolled(false);
        } finally {
          if (mounted) setChecking(false);
        }
      }
    };
    checkEnrollment();
    return () => {
      mounted = false;
    };
  }, [user, isStudent, course.id]);

  let actionButton;
  if (!user) {
    actionButton = (
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={onSignUp}
      >
        Login or Sign Up
      </Button>
    );
  } else if (isStudent && checking) {
    actionButton = (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  } else if (isStudent && enrolled) {
    actionButton = (
      <Button
        variant="contained"
        color="success"
        fullWidth
        sx={{ mt: 2 }}
        onClick={() => {
          navigate(
            `${ROUTES.STUDENT_COURSE_DETAILS.replace(":id", course.id)}`
          );
        }}
      >
        Start Learning
      </Button>
    );
  } else if (isStudent && !enrolled) {
    actionButton = (
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        href={`/courses/${course.id}/enroll`}
      >
        Enroll
      </Button>
    );
  }

  return (
    <Badge
      color="secondary"
      badgeContent={
        course.featured ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <StarIcon fontSize="small" sx={{ mr: 0.5 }} />
            مُميَّز
          </Box>
        ) : null
      }
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      sx={{
        width: "100%",
        "& .MuiBadge-badge": {
          left: 12,
          top: 12,
          transform: "none",
          borderRadius: 1,
          fontWeight: 600,
          fontSize: "0.75rem",
          padding: "0 8px",
          boxShadow: 1,
        },
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 340,
          minHeight: 340,
          position: "relative",
          boxShadow: 0.5, // Light shadow by default
          transition: "box-shadow 0.2s",
          ":hover": { boxShadow: 1 }, // Slightly stronger on hover
        }}
      >
        <CardMedia
          component="img"
          height="140"
          image={course.thumbnail || "/images/course-default.png"}
          alt={course.title}
          sx={{ objectFit: "cover" }}
        />
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <Typography variant="h6" fontWeight={600} noWrap>
              {course.title}
            </Typography>
            {course.certificateIncluded && (
              <Chip label="Certificate" size="small" color="success" />
            )}
            {course.discount && (
              <Chip
                label={`-${course.discount}%`}
                size="small"
                color="warning"
              />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary" noWrap>
            {course.shortDescription}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={1}
          >
            By {course.instructor}
          </Typography>
          <Stack direction="row" spacing={1} mt={1}>
            <Chip label={course.level} size="small" />
            <Chip label={course.category} size="small" />
          </Stack>
          <Typography variant="subtitle2" color="primary" mt={1}>
            {course.price === 0 ? "Free" : `$${course.price}`}
          </Typography>
          {actionButton}
        </CardContent>
      </Card>
    </Badge>
  );
};

export default CourseCard;
