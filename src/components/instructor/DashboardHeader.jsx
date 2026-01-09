import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Tabs,
    Tab,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PaymentIcon from '@mui/icons-material/Payment';
import { gradients, colors, borderRadius } from '../../theme';

function DashboardHeader({ activeTab, setActiveTab, onNewCourse }) {
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    return (
        <Box
            sx={{
                background: gradients.primaryExtended,
                pt: 3,
                pb: 0,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.3,
                }
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2 
                }}>
                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                color: '#FFFFFF',
                                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                                fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                            }}
                        >
                            {isArabic ? 'لوحة التحكم' : 'Instructor Dashboard'}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255,255,255,0.85)',
                                fontWeight: 400,
                                fontSize: { xs: '0.85rem', md: '0.95rem' },
                                display: { xs: 'none', sm: 'block' },
                            }}
                        >
                            {isArabic
                                ? 'إدارة دوراتك وطلابك بكل سهولة'
                                : 'Manage your courses and students with ease'}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onNewCourse}
                        sx={{
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            color: '#FFFFFF',
                            fontWeight: 600,
                            px: { xs: 2, sm: 3 },
                            py: 1,
                            borderRadius: borderRadius.medium,
                            textTransform: 'none',
                            border: '1px solid rgba(255,255,255,0.3)',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            width: { xs: '100%', sm: 'auto' },
                            '&:hover': {
                                background: 'rgba(255,255,255,0.3)',
                            },
                        }}
                    >
                        {isArabic ? 'دورة جديدة' : 'New Course'}
                    </Button>
                </Box>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onChange={(e, val) => setActiveTab(val)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        mt: 2,
                        '& .MuiTab-root': {
                            fontWeight: 600,
                            fontSize: { xs: '0.875rem', sm: '0.95rem' },
                            py: 1.5,
                            px: { xs: 1.5, sm: 2 },
                            color: 'rgba(255,255,255,0.7)',
                            minHeight: 48,
                            minWidth: { xs: 'auto', sm: 90 },
                        },
                        '& .Mui-selected': {
                            color: '#FFFFFF !important',
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#FFD54F',
                            height: 3,
                        },
                        '& .MuiTabs-scrollButtons': {
                            color: 'rgba(255,255,255,0.7)',
                        },
                    }}
                >
                    <Tab
                        icon={<HomeIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />}
                        iconPosition="start"
                        label={isArabic ? 'الرئيسية' : 'Main'}
                    />
                    <Tab
                        icon={<SchoolIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />}
                        iconPosition="start"
                        label={isArabic ? 'الدورات' : 'Courses'}
                    />
                    <Tab
                        icon={<GroupAddIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />}
                        iconPosition="start"
                        label={isArabic ? 'الالتحاقات' : 'Enrollments'}
                    />
                    <Tab
                        icon={<PaymentIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />}
                        iconPosition="start"
                        label={isArabic ? 'الدروس الخاصة' : 'Private Lessons'}
                    />
                </Tabs>
            </Container>
        </Box>
    );
}

export default DashboardHeader;
