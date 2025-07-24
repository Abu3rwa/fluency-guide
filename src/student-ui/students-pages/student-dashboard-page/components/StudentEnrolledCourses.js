import React, { useEffect, useState } from "react";
import { enrollmentService } from "../../../../services/enrollmentService";
import studentCourseService from "../../../../services/student-services/studentCourseService"; // adjust path as needed
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Grid,
  Chip,
} from "@mui/material";

const StudentEnrolledCourses = ({ studentId }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        const data = await enrollmentService.getEnrollmentsByStudent(studentId);
        setEnrollments(data);

        // Fetch course details for each enrollment
        const courseDetails = {};
        for (const enrollment of data) {
          if (!courseDetails[enrollment.courseId]) {
            const course = await studentCourseService.getCourseById(
              enrollment.courseId
            );
            courseDetails[enrollment.courseId] = course;
          }
        }
        setCourses(courseDetails);
        console.log(courseDetails);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchEnrollments();
  }, [studentId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Enrolled Courses
      </Typography>
      {enrollments.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          You are not enrolled in any courses yet.
        </Typography>
      )}
      <Grid container spacing={2}>
        {enrollments.map((enrollment) => {
          const course = courses[enrollment.courseId];
          return (
            <Grid item xs={12} sm={6} md={4} key={enrollment.id}>
              <Card variant="outlined">
                <CardHeader
                  title={course?.title || "Course"}
                  subheader={course?.level || ""}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {course?.description || "No description available."}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Status: <Chip label={enrollment.status} size="small" />
                  </Typography>
                  <Typography variant="subtitle2">
                    Enrolled At:{" "}
                    {new Date(enrollment.enrolledAt).toLocaleString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  {/* You can add actions like 'Go to Course' here */}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default StudentEnrolledCourses;
