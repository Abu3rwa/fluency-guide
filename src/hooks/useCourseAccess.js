import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { enrollmentService } from "../services/enrollmentService";

// Course access levels enum
export const CourseAccessLevel = {
  PREVIEW: "preview", // First 1-2 lessons only
  ENROLLED: "enrolled", // Full course access
  COMPLETED: "completed", // Course finished
  RESTRICTED: "restricted", // No access
};

export const useCourseAccess = (courseId) => {
  const { userData: user, isAuthenticated } = useUser();
  const [accessLevel, setAccessLevel] = useState(CourseAccessLevel.RESTRICTED);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const previewLessons = 2; // Configurable number of preview lessons

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!isAuthenticated) {
          setAccessLevel(CourseAccessLevel.PREVIEW);
          setEnrollment(null);
          return;
        }

        if (!courseId) {
          setAccessLevel(CourseAccessLevel.RESTRICTED);
          return;
        }

        const enrollmentData =
          await enrollmentService.getEnrollmentByStudentAndCourse(
            user.uid,
            courseId
          );

        if (enrollmentData && enrollmentData.status === "active") {
          setAccessLevel(CourseAccessLevel.ENROLLED);
          setEnrollment(enrollmentData);
        } else {
          setAccessLevel(CourseAccessLevel.PREVIEW);
          setEnrollment(enrollmentData);
        }
      } catch (error) {
        console.error("Error checking course access:", error);
        setError(error.message);
        setAccessLevel(CourseAccessLevel.PREVIEW);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [courseId, user, isAuthenticated]);

  return {
    accessLevel,
    enrollment,
    previewLessons,
    loading,
    error,
    isEnrolled: accessLevel === CourseAccessLevel.ENROLLED,
    canPreview: accessLevel === CourseAccessLevel.PREVIEW,
    isAuthenticated,
  };
};
