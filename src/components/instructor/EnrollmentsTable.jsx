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
    Chip,
    CircularProgress,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { colors, componentStyles } from '../../theme';

function EnrollmentsTable({ 
    enrollments, 
    courses, 
    loading, 
    filterCourseId, 
    onFilterChange, 
    onManage, 
    onWhatsApp,
    isArabic 
}) {
    const { t } = useTranslation();

    const filteredEnrollments = filterCourseId
        ? enrollments.filter(e => e.courseId === filterCourseId)
        : enrollments;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Filter */}
            <Box sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: { xs: '100%', sm: 300 } }}>
                    <InputLabel>{isArabic ? 'تصفية حسب الدورة' : 'Filter by Course'}</InputLabel>
                    <Select
                        value={filterCourseId}
                        onChange={(e) => onFilterChange(e.target.value)}
                        label={isArabic ? 'تصفية حسب الدورة' : 'Filter by Course'}
                    >
                        <MenuItem value="">{isArabic ? 'كل الدورات' : 'All Courses'}</MenuItem>
                        {courses.map((course) => (
                            <MenuItem key={course.id} value={course.id}>
                                {typeof course.title === 'object'
                                    ? course.title[isArabic ? 'ar' : 'en']
                                    : course.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} elevation={3} sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: { xs: 650, sm: 850 } }}>
                    <TableHead>
                        <TableRow sx={{ ...componentStyles.tableHeader }}>
                            <TableCell sx={{ fontWeight: 600 }}>
                                {isArabic ? 'الاسم' : 'Name'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                {isArabic ? 'البريد الإلكتروني' : 'Email'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                {isArabic ? 'رقم الهاتف' : 'Phone'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                {isArabic ? 'الدورة' : 'Course'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                {isArabic ? 'التاريخ' : 'Date'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                {isArabic ? 'الحالة' : 'Status'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                {isArabic ? 'التواصل' : 'Contact'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                {isArabic ? 'الإجراءات' : 'Actions'}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredEnrollments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4, color: colors.text.secondary }}>
                                    {isArabic ? 'لا توجد التحاقات' : 'No enrollments'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEnrollments.map((enrollment) => {
                                const course = courses.find(c => c.id === enrollment.courseId);
                                const enrollDate = enrollment.enrolledAt?.toDate
                                    ? enrollment.enrolledAt.toDate().toLocaleDateString()
                                    : new Date(enrollment.enrolledAt).toLocaleDateString();

                                const getStatusColor = (status) => {
                                    switch (status) {
                                        case 'pending':
                                            return 'warning';
                                        case 'confirmed':
                                            return 'success';
                                        case 'rejected':
                                            return 'error';
                                        default:
                                            return 'default';
                                    }
                                };

                                const getStatusLabel = (status) => {
                                    switch (status) {
                                        case 'pending':
                                            return isArabic ? 'قيد الانتظار' : 'Pending';
                                        case 'confirmed':
                                            return isArabic ? 'مؤكد' : 'Confirmed';
                                        case 'rejected':
                                            return isArabic ? 'مرفوض' : 'Rejected';
                                        default:
                                            return status;
                                    }
                                };

                                return (
                                    <TableRow 
                                        key={enrollment.id} 
                                        hover
                                        sx={{
                                            '&:hover': {
                                                bgcolor: colors.background.gradient,
                                            }
                                        }}
                                    >
                                        <TableCell>{`${enrollment.firstName} ${enrollment.lastName}`}</TableCell>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{enrollment.email || '-'}</TableCell>
                                        <TableCell>{enrollment.phoneNumber}</TableCell>
                                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                            {course
                                                ? (typeof course.title === 'object'
                                                    ? course.title[isArabic ? 'ar' : 'en']
                                                    : course.title)
                                                : 'Unknown'}
                                        </TableCell>
                                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{enrollDate}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusLabel(enrollment.status)}
                                                color={getStatusColor(enrollment.status)}
                                                size="small"
                                                sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.8125rem' } }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                startIcon={<WhatsAppIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                                                onClick={() => onWhatsApp(enrollment.phoneNumber)}
                                                sx={{ 
                                                    color: colors.whatsapp,
                                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                    minWidth: { xs: 'auto', sm: 64 },
                                                    px: { xs: 0.5, sm: 1 },
                                                    '&:hover': { 
                                                        bgcolor: 'rgba(37, 211, 102, 0.08)' 
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => onManage(enrollment)}
                                                sx={{
                                                    borderColor: colors.primary.main,
                                                    color: colors.primary.main,
                                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                    px: { xs: 1, sm: 1.5 },
                                                    '&:hover': {
                                                        borderColor: colors.primary.dark,
                                                        bgcolor: 'rgba(0, 137, 123, 0.08)',
                                                    }
                                                }}
                                            >
                                                {isArabic ? 'إدارة' : 'Manage'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default EnrollmentsTable;
