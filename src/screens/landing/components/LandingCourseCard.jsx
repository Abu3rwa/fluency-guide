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
  useTheme,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { useUser } from "../../../contexts/UserContext";
import { enrollmentService } from "../../../services/enrollmentService";
import { ROUTES } from "../../../routes/constants";
import { useNavigate } from "react-router-dom";
import PaymentDialog from "../../../components/PaymentDialog";

const LandingCourseCard = ({ course, enrollment, onSignUp }) => {
  const { userData: user, isStudent } = useUser();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const enrollmentStatus = enrollment ? enrollment.status : "not-enrolled";

  let actionButton;
  if (!user) {
    actionButton = (
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 0 }}
        onClick={onSignUp}
      >
        Login or Sign Up
      </Button>
    );
  } else if (enrollmentStatus === "active") {
    actionButton = (
      <Button
        variant="contained"
        color="success"
        fullWidth
        sx={{ mt: 0 }}
        onClick={() => {
          navigate(
            `${ROUTES.STUDENT_COURSE_DETAILS.replace(":id", course.id)}`
          );
        }}
      >
        Start Learning
      </Button>
    );
  } else if (enrollmentStatus === "pending") {
    actionButton = (
      <Typography sx={{ mt: 0 }} color="text.secondary" align="center">
        Enrollment Pending
      </Typography>
    );
  } else if (enrollmentStatus === "rejected") {
    actionButton = (
      <Typography sx={{ mt: 0 }} color="error" align="center">
        Enrollment Rejected
      </Typography>
    );
  } else {
    actionButton = (
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 0 }}
        onClick={() => setShowPaymentDialog(true)}
      >
        Enroll
      </Button>
    );
  }

  return (
    <React.Fragment>
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
            minHeight: 380,
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
          <CardContent sx={{ p: 2.5, pb: 2, position: "relative" }}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                width: "100%",
                lineHeight: 1.3,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                mb: 1.5,
              }}
            >
              {course.title}
            </Typography>
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ mb: 1.5, justifyContent: "flex-end" }}
            >
              {/* {course.certificateIncluded && (
                <Chip label="Certificate" size="small" color="success" />
              )} */}
              {course.discount && (
                <Chip
                  sx={{
                    fontWeight: 400,
                    fontSize: "0.775rem",
                    lineHeight: 1,
                    position: "absolute",
                    top: 1,
                    [theme.direction === "rtl" ? "left" : "right"]: 1,
                    backgroundColor: "transparent",
                    border: "1px solid #ffc107",
                    color: "#ffc107",
                    borderRadius: "10px",
                    padding: "0 8px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  label={`${course.discount}% off`}
                  size="small"
                  color="warning"
                />
              )}
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1.5,
                fontWeight: 400,
                fontSize: "0.775rem",
                lineHeight: 1,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {course.shortDescription}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mb: 1.5, fontWeight: 500 }}
            >
              By {course.instructor}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 2, flexWrap: "wrap", gap: 0.5 }}
            >
              <Chip label={course.level} size="small" />
              <Chip label={course.category} size="small" />
            </Stack>
            <Typography
              variant="subtitle2"
              color="primary"
              sx={{ mb: 2, fontWeight: 600 }}
            >
              {course.price === 0 ? "Free" : `$${course.price}`}
            </Typography>
            {actionButton}
          </CardContent>
        </Card>
      </Badge>

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        course={course}
        userData={user}
        onPaymentComplete={(result) => {
          setShowPaymentDialog(false);
        }}
      />
    </React.Fragment>
  );
};

export default LandingCourseCard;
