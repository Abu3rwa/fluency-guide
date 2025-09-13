import courseService from "../courseService";

export const studentCoursePreviewService = {
  // Get preview lessons for a course
  getPreviewLessons: async (courseId, limit = 2) => {
    try {
      const course = await courseService.getCourseById(courseId);
      if (!course || !course.lessons) {
        return [];
      }
      return course.lessons.slice(0, limit);
    } catch (error) {
      console.error("Error fetching preview lessons:", error);
      return [];
    }
  },

  // Check if lesson is available in preview
  isLessonPreviewable: (lessonIndex, moduleIndex, lessonIndexInModule) => {
    // Only the first lesson of each module is previewable
    return lessonIndexInModule === 0; // First lesson in module
  },

  // Get course preview stats
  getPreviewStats: (course) => {
    if (!course || !course.lessons) {
      return {
        totalLessons: 0,
        previewLessons: 0,
        lockedLessons: 0,
        previewPercentage: 0,
      };
    }

    const totalLessons = course.lessons.length;
    // Count first lesson from each module as preview
    const previewLessons = course.modules ? course.modules.length : 0;
    const lockedLessons = totalLessons - previewLessons;

    return {
      totalLessons,
      previewLessons,
      lockedLessons,
      previewPercentage: Math.round((previewLessons / totalLessons) * 100),
    };
  },

  // Track preview interactions for analytics
  trackPreviewInteraction: (courseId, action, userId = null) => {
    // This would integrate with your analytics service
    console.log("Preview interaction tracked:", {
      courseId,
      action,
      userId,
      timestamp: new Date().toISOString(),
    });

    // In a real implementation, you would send this to your analytics service
    // analytics.track("course_preview_interaction", {
    //   courseId,
    //   action, // 'lesson_watch', 'enrollment_prompt', 'enroll_click', 'lesson_locked'
    //   userId: userId || "anonymous",
    //   timestamp: new Date().toISOString(),
    // });
  },

  // Track conversion steps
  trackConversionStep: (step, courseId, userId = null) => {
    // This would integrate with your analytics service
    console.log("Conversion step tracked:", {
      step,
      courseId,
      userId,
      timestamp: new Date().toISOString(),
    });

    // In a real implementation, you would send this to your analytics service
    // analytics.track("course_conversion_step", {
    //   step, // 'preview_view', 'enrollment_prompt', 'payment_start', 'enrollment_complete'
    //   courseId,
    //   userId: userId || "anonymous",
    //   timestamp: new Date().toISOString(),
    // });
  },

  // Track preview page view
  trackPreviewView: (courseId, userId = null) => {
    console.log("Preview page view tracked:", {
      courseId,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  // Track enrollment prompt interaction
  trackEnrollmentPrompt: (courseId, action, userId = null) => {
    console.log("Enrollment prompt tracked:", {
      courseId,
      action, // 'view', 'close', 'enroll_click', 'continue_browsing'
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  // Get preview content recommendations
  getPreviewRecommendations: async (courseId, userId = null) => {
    try {
      const course = await courseService.getCourseById(courseId);
      if (!course || !course.lessons) {
        return [];
      }

      // Simple logic: return first 2 lessons as preview
      // In a real implementation, you might use ML to select the most engaging lessons
      return course.lessons.slice(0, 2).map((lesson, index) => ({
        ...lesson,
        isPreview: true,
        previewIndex: index,
      }));
    } catch (error) {
      console.error("Error fetching preview recommendations:", error);
      return [];
    }
  },

  // Validate lesson access (for content protection)
  validateLessonAccess: async (userId, lessonId, courseId) => {
    try {
      // This would typically check against your backend
      const course = await courseService.getCourseById(courseId);
      if (!course || !course.lessons) {
        return { canAccess: false, reason: "Course not found" };
      }

      const lessonIndex = course.lessons.findIndex((l) => l.id === lessonId);
      if (lessonIndex === -1) {
        return { canAccess: false, reason: "Lesson not found" };
      }

      // For preview users, use consistent preview access logic
      if (!userId) {
        const isPreviewable = this.isLessonPreviewable(lessonIndex);
        return {
          canAccess: isPreviewable,
          reason: isPreviewable ? "preview_access" : "requires_enrollment",
        };
      }

      // For authenticated users, check enrollment
      // This would typically be done on the backend
      return { canAccess: true, reason: "enrolled_user" };
    } catch (error) {
      console.error("Error validating lesson access:", error);
      return { canAccess: false, reason: "validation_error" };
    }
  },

  // Get preview content metadata
  getPreviewMetadata: (course) => {
    if (!course) return null;

    return {
      courseId: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      thumbnail: course.thumbnail,
      price: course.price,
      level: course.level,
      category: course.category,
      totalLessons: course.lessons?.length || 0,
      previewLessons: course.modules?.length || 0,
      previewPercentage:
        course.lessons?.length > 0 && course.modules?.length
          ? Math.round((course.modules.length / course.lessons.length) * 100)
          : 0,
    };
  },
};
