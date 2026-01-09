import React from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { gradients, componentStyles, colors, shadows } from '../../theme';

// Custom branded icons
import iconCourses from '../../assets/icons/icon_courses.png';
import iconProgress from '../../assets/icons/icon_progress.png';
import iconStudents from '../../assets/icons/icon_students.png';
import iconCertificate from '../../assets/icons/icon_certificate.png';

function DashboardStats({ courses, enrollments }) {
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const stats = [
        {
            label: isArabic ? 'إجمالي الدورات' : 'Total Courses',
            value: courses.length,
            icon: iconCourses,
            gradient: gradients.primary,
            color: '#00897B',
        },
        {
            label: isArabic ? 'الجولات النشطة' : 'Active Rounds',
            value: courses.reduce((sum, c) => sum + (c.totalRounds || c.rounds?.length || 1), 0),
            icon: iconProgress,
            gradient: gradients.success,
            color: '#4CAF50',
        },
        {
            label: isArabic ? 'إجمالي الطلاب' : 'Total Students',
            value: courses.reduce((sum, c) => sum + (c.totalStudents || 0), 0),
            icon: iconStudents,
            gradient: gradients.info,
            color: '#2196F3',
        },
        {
            label: isArabic ? 'متوسط التقييم' : 'Average Rating',
            value: courses.length > 0
                ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1)
                : '0',
            icon: iconCertificate,
            gradient: gradients.warning,
            color: '#FF9800',
        },
    ];

    return (
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: { xs: 2, sm: 2.5 },
                            borderRadius: 2,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: shadows.cardHover,
                            },
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'row', sm: 'row' },
                            alignItems: 'center',
                            gap: { xs: 1.5, sm: 2 },
                        }}>
                            <Box
                                sx={{
                                    p: { xs: 1, sm: 1.5 },
                                    borderRadius: 1.5,
                                    width: { xs: 48, sm: 56 },
                                    height: { xs: 48, sm: 56 },
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    background: stat.gradient,
                                }}
                            >
                                <img
                                    src={stat.icon}
                                    alt=""
                                    style={{
                                        width: 28,
                                        height: 28,
                                        objectFit: 'contain',
                                        filter: 'brightness(0) invert(1)'
                                    }}
                                />
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        fontWeight: 500,
                                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {stat.label}
                                </Typography>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        color: stat.color,
                                        fontSize: { xs: '1.5rem', sm: '2rem' },
                                    }}
                                >
                                    {stat.value}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
}

export default DashboardStats;
