import React from 'react';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { COURSE_STATUS } from '../../utils/courseStatus';

function CourseStatusBadge({ status }) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const statusConfig = {
    [COURSE_STATUS.UPCOMING]: {
      label: isArabic ? 'قريباً' : 'Upcoming',
      color: '#2563EB',
      bgColor: '#DBEAFE',
    },
    [COURSE_STATUS.ACTIVE]: {
      label: isArabic ? 'نشط' : 'Active',
      color: '#0D9488',
      bgColor: '#CCFBF1',
    },
    [COURSE_STATUS.ENDED]: {
      label: isArabic ? 'انتهى' : 'Ended',
      color: '#6B7280',
      bgColor: '#F3F4F6',
    },
    [COURSE_STATUS.DRAFT]: {
      label: isArabic ? 'مسودة' : 'Draft',
      color: '#9CA3AF',
      bgColor: '#F9FAFB',
    },
    [COURSE_STATUS.CANCELLED]: {
      label: isArabic ? 'ملغي' : 'Cancelled',
      color: '#DC2626',
      bgColor: '#FEE2E2',
    },
  };

  const config = statusConfig[status] || statusConfig[COURSE_STATUS.UPCOMING];

  return (
    <Chip
      label={config.label}
      sx={{
        backgroundColor: config.bgColor,
        color: config.color,
        fontWeight: 600,
        fontSize: '0.75rem',
        height: '28px',
        fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
      }}
    />
  );
}

export default CourseStatusBadge;

