import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    CircularProgress,
    Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { colors, componentStyles } from '../../theme';

function CoursesTable({ courses, loading, onEdit, onDelete, onView, isArabic }) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} elevation={3} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: { xs: 650, sm: 750 } }}>
                <TableHead>
                    <TableRow sx={{ ...componentStyles.tableHeader }}>
                        <TableCell sx={{ fontWeight: 600 }}>
                            {isArabic ? 'الدورة' : 'Course'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {isArabic ? 'الفئة' : 'Category'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {isArabic ? 'المستوى' : 'Level'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {isArabic ? 'الجولات' : 'Rounds'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {isArabic ? 'الطلاب' : 'Students'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {isArabic ? 'السعر' : 'Price'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {isArabic ? 'الإجراءات' : 'Actions'}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {courses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4, color: colors.text.secondary }}>
                                {isArabic ? 'لا توجد دورات' : 'No courses yet'}
                            </TableCell>
                        </TableRow>
                    ) : (
                        courses.map((course) => (
                            <TableRow 
                                key={course.id} 
                                hover
                                sx={{
                                    '&:hover': {
                                        bgcolor: colors.background.gradient,
                                    }
                                }}
                            >
                                <TableCell>
                                    {typeof course.title === 'object'
                                        ? course.title[isArabic ? 'ar' : 'en']
                                        : course.title}
                                </TableCell>
                                <TableCell align="right">
                                    {typeof course.category === 'object'
                                        ? course.category[isArabic ? 'ar' : 'en']
                                        : course.category}
                                </TableCell>
                                <TableCell align="right">
                                    {typeof course.level === 'object'
                                        ? course.level[isArabic ? 'ar' : 'en']
                                        : course.level}
                                </TableCell>
                                <TableCell align="right">
                                    {course.totalRounds || course.rounds?.length || 1}
                                </TableCell>
                                <TableCell align="right">
                                    {course.totalStudents || 0}
                                </TableCell>
                                <TableCell align="right">{course.price} SDG</TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                        <Button
                                            size="small"
                                            startIcon={<VisibilityIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                                            onClick={() => onView(course)}
                                            sx={{ 
                                                color: colors.info.main,
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                px: { xs: 1, sm: 1.5 },
                                                '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.08)' }
                                            }}
                                        >
                                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                                {isArabic ? 'عرض' : 'View'}
                                            </Box>
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                                            onClick={() => onEdit(course)}
                                            sx={{ 
                                                color: colors.primary.main,
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                px: { xs: 1, sm: 1.5 },
                                                '&:hover': { bgcolor: 'rgba(0, 137, 123, 0.08)' }
                                            }}
                                        >
                                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                                {isArabic ? 'تعديل' : 'Edit'}
                                            </Box>
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                                            color="error"
                                            onClick={() => onDelete(course.id)}
                                            sx={{
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                px: { xs: 1, sm: 1.5 },
                                                '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.08)' }
                                            }}
                                        >
                                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                                {isArabic ? 'حذف' : 'Delete'}
                                            </Box>
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default CoursesTable;
