import React from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PaymentIcon from '@mui/icons-material/Payment';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import StarIcon from '@mui/icons-material/Star';
import { gradients, componentStyles, colors, borderRadius } from '../../theme';

function QuickActions({ enrollments, onNewCourse, setActiveTab }) {
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const pendingCount = enrollments.filter(e => e.status === 'pending').length;
    const confirmedCount = enrollments.filter(e => e.status === 'confirmed').length;

    return (
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
            {/* Quick Actions */}
            <Grid item xs={12} md={6}>
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, sm: 3 },
                        borderRadius: borderRadius.large,
                        background: gradients.card,
                        height: '100%',
                    }}
                >
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            fontWeight: 700, 
                            mb: 2.5, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                        }}
                    >
                        <AssignmentIcon sx={{ color: colors.primary.main, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                        {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<AddIcon />}
                                onClick={onNewCourse}
                                sx={{
                                    ...componentStyles.actionButton,
                                    background: gradients.primary,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    py: { xs: 1, sm: 1.5 },
                                    borderRadius: 1.5,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #00695C 0%, #004D40 100%)',
                                    },
                                }}
                            >
                                {isArabic ? 'دورة جديدة' : 'New Course'}
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<GroupAddIcon />}
                                onClick={() => setActiveTab(2)}
                                sx={{
                                    ...componentStyles.actionButton,
                                    borderColor: colors.primary.main,
                                    color: colors.primary.main,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    py: { xs: 1, sm: 1.5 },
                                    borderRadius: 1.5,
                                    '&:hover': {
                                        borderColor: colors.primary.dark,
                                        bgcolor: 'rgba(0, 137, 123, 0.05)',
                                    },
                                }}
                            >
                                {isArabic ? 'الالتحاقات' : 'Enrollments'}
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<PaymentIcon />}
                                onClick={() => setActiveTab(3)}
                                sx={{
                                    ...componentStyles.actionButton,
                                    borderColor: colors.warning.main,
                                    color: colors.warning.main,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    py: { xs: 1, sm: 1.5 },
                                    borderRadius: 1.5,
                                    '&:hover': {
                                        borderColor: colors.warning.dark,
                                        bgcolor: 'rgba(255, 152, 0, 0.05)',
                                    },
                                }}
                            >
                                {isArabic ? 'دروس خاصة' : 'Private Lessons'}
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<WhatsAppIcon />}
                                onClick={() => window.open('https://wa.me/', '_blank')}
                                sx={{
                                    ...componentStyles.actionButton,
                                    borderColor: colors.whatsapp,
                                    color: colors.whatsapp,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    py: { xs: 1, sm: 1.5 },
                                    borderRadius: 1.5,
                                    '&:hover': {
                                        borderColor: '#1DA851',
                                        bgcolor: 'rgba(37, 211, 102, 0.05)',
                                    },
                                }}
                            >
                                {isArabic ? 'واتساب' : 'WhatsApp'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>

            {/* Pending Attention */}
            <Grid item xs={12} md={6}>
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, sm: 3 },
                        borderRadius: 2,
                        background: gradients.card,
                        height: '100%',
                    }}
                >
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            fontWeight: 700, 
                            mb: 2.5, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                        }}
                    >
                        <NotificationsActiveIcon sx={{ color: colors.warning.main, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                        {isArabic ? 'تحتاج انتباهك' : 'Needs Attention'}
                    </Typography>

                    {/* Pending Enrollments */}
                    {pendingCount > 0 ? (
                        <Box
                            onClick={() => setActiveTab(2)}
                            sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 1.5,
                                bgcolor: 'rgba(255, 152, 0, 0.1)',
                                border: '1px solid',
                                borderColor: 'warning.main',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 152, 0, 0.15)',
                                    transform: 'translateX(4px)',
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <WarningAmberIcon sx={{ color: 'warning.main' }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {isArabic ? 'التحاقات معلقة' : 'Pending Enrollments'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {isArabic ? 'بانتظار الموافقة' : 'Awaiting approval'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Chip
                                    label={pendingCount}
                                    color="warning"
                                    size="small"
                                    sx={{ fontWeight: 700, fontSize: '1rem', minWidth: 40 }}
                                />
                            </Box>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 1.5,
                                bgcolor: 'rgba(76, 175, 80, 0.1)',
                                border: '1px solid',
                                borderColor: 'success.main',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <StarIcon sx={{ color: 'success.main' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                    {isArabic ? 'لا توجد التحاقات معلقة!' : 'No pending enrollments!'}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Quick Stats */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box
                            sx={{
                                flex: 1,
                                p: 2,
                                borderRadius: 1.5,
                                bgcolor: 'rgba(0, 137, 123, 0.08)',
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#00897B' }}>
                                {confirmedCount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isArabic ? 'مؤكد' : 'Confirmed'}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                flex: 1,
                                p: 2,
                                borderRadius: 1.5,
                                bgcolor: 'rgba(255, 152, 0, 0.08)',
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9800' }}>
                                {pendingCount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isArabic ? 'معلق' : 'Pending'}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
}

export default QuickActions;
