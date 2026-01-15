import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Collapse,
    IconButton,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AttendanceStatusBadge from './AttendanceStatusBadge';

function LessonAttendanceList({ lesson, students, attendanceRecords }) {
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const [expanded, setExpanded] = useState(false);

    const getStudentAttendance = (studentId) => {
        return attendanceRecords.find(a => a.studentId === studentId);
    };

    const attendedStudents = students.filter(s => {
        const attendance = getStudentAttendance(s.userId);
        return attendance && attendance.status === 'present';
    });

    const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
    const totalStudents = students.length;

    const getTitle = (obj) => {
        if (!obj) return '';
        return typeof obj === 'object' ? obj[isArabic ? 'ar' : 'en'] || obj.en : obj;
    };

    return (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {getTitle(lesson?.title)}
                    </Typography>
                    <Chip
                        label={`${presentCount}/${totalStudents}`}
                        size="small"
                        color={presentCount === totalStudents ? 'success' : 'default'}
                    />
                </Box>
                <IconButton size="small">
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            <Collapse in={expanded} timeout="auto">
                <Divider sx={{ my: 2 }} />
                {attendedStudents.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        {isArabic ? 'لا يوجد طلاب حاضرون' : 'No students attended'}
                    </Typography>
                ) : (
                    <List>
                        {attendedStudents.map((student, index) => {
                            const attendance = getStudentAttendance(student.userId);
                            return (
                                <React.Fragment key={student.userId}>
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                {student.name?.[0]?.toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={student.name}
                                            secondary={student.email}
                                        />
                                        <AttendanceStatusBadge status={attendance?.status} />
                                    </ListItem>
                                    {index < attendedStudents.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </Collapse>
        </Paper>
    );
}

export default LessonAttendanceList;
