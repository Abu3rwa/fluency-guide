export const COURSE_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  ENDED: 'ended',
  DRAFT: 'draft',
  CANCELLED: 'cancelled',
};

export const getCourseStatus = (course) => {
  const now = new Date();
  const startDate = course.startDate ? new Date(course.startDate) : null;
  const endDate = course.endDate ? new Date(course.endDate) : null;

  if (course.status === COURSE_STATUS.DRAFT || course.status === COURSE_STATUS.CANCELLED) {
    return course.status;
  }

  if (endDate && endDate < now) {
    return COURSE_STATUS.ENDED;
  }

  if (startDate && startDate > now) {
    return COURSE_STATUS.UPCOMING;
  }

  if (startDate && startDate <= now && endDate && endDate >= now) {
    return COURSE_STATUS.ACTIVE;
  }

  if (startDate && startDate <= now && !endDate) {
    return COURSE_STATUS.ACTIVE;
  }

  return course.status || COURSE_STATUS.UPCOMING;
};

export const canEnroll = (status) => {
  return status === COURSE_STATUS.UPCOMING || status === COURSE_STATUS.ACTIVE;
};

export const formatDate = (dateString, locale = 'en') => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

