import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';

function AttendanceStats({ attendanceRecords, totalStudents }) {
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
    const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
    const lateCount = attendanceRecords.filter(a => a.status === 'late').length;
    const notMarkedCount = totalStudents - attendanceRecords.length;

    const stats = [
        {
            label: isArabic ? 'حاضر' : 'Present',
            count: presentCount,
            color: '#4CAF50',
            icon: <CheckCircleIcon />,
        },
        {
            label: isArabic ? 'غائب' : 'Absent',
            count: absentCount,
            color: '#f44336',
            icon: <CancelIcon />,
        },
        {
            label: isArabic ? 'متأخر' : 'Late',
            count: lateCount,
            color: '#FF9800',
            icon: <AccessTimeIcon />,
        },
        {
            label: isArabic ? 'لم يتم التسجيل' : 'Not Marked',
            count: notMarkedCount,
            color: '#9E9E9E',
            icon: <PeopleIcon />,
        },
    ];

    return (
        <Grid container spacing={2}>
            {stats.map((stat, index) => (
                <Grid item xs={6} sm={3} key={index}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                bgcolor: `${stat.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: stat.color,
                                mb: 1,
                            }}
                        >
                            {stat.icon}
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                            {stat.count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                            {stat.label}
                        </Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
}

export default AttendanceStats;
