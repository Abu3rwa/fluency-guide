import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, Skeleton } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function BlogSection() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLatestPosts();
    }, []);

    const fetchLatestPosts = async () => {
        try {
            const postsRef = collection(db, 'blog_posts');
            const q = query(
                postsRef,
                where('status', '==', 'published'),
                orderBy('publishedAt', 'desc'),
                limit(3)
            );
            const snapshot = await getDocs(q);
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(postsData);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ py: 8, bgcolor: '#f5f7fa', direction: isArabic ? 'rtl' : 'ltr' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} direction={isArabic ? 'row-reverse' : 'row'}>
                        {[1, 2, 3].map((i) => (
                            <Grid item xs={12} md={4} key={i}>
                                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                                <Skeleton variant="text" sx={{ mt: 2 }} />
                                <Skeleton variant="text" width="60%" />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        );
    }


    // Show section with button even if no posts yet
    const showPosts = posts.length > 0;

    return (
        <Box sx={{ py: 8, bgcolor: '#f5f7fa', direction: isArabic ? 'rtl' : 'ltr' }}>
            <Container maxWidth="lg">
                {/* Section Header */}
                <Box sx={{ textAlign: 'center', mb: 6 }} display='flex' justifyContent="center" flexDirection="column">
                    <Typography
                        variant="h3"
                        sx={{
                            fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                            fontWeight: 700,
                            color: '#00695C',
                            mb: 2,
                            fontSize: { xs: '1.75rem', md: '2.5rem' },
                            direction: isArabic ? 'rtl' : 'ltr',
                            textAlign: "center"
                        }}
                    >
                        {t('blog.latestArticles')}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            maxWidth: 600,
                            mx: 'auto',
                            fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                            direction: isArabic ? 'rtl' : 'ltr',
                        }}
                    >
                        {t('blog.latestArticlesSubtitle')}
                    </Typography>
                </Box>

                {/* Blog Posts Grid */}
                {
                    showPosts && (
                        <Grid container spacing={4} direction={isArabic ? 'row-reverse' : 'row'} justifyContent="center">
                            {posts.map((post) => (
                                <Grid item xs={12} md={4} key={post.id}>
                                    <Card
                                        component={Link}
                                        to={`/blog/${post.slug}`}
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            textDecoration: 'none',
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                            }
                                        }}
                                    >
                                        {post.featuredImage && (
                                            <CardMedia
                                                component="img"
                                                height="180"
                                                image={post.featuredImage}
                                                alt={typeof post.title === 'object' ? post.title[isArabic ? 'ar' : 'en'] : post.title}
                                                sx={{ objectFit: 'cover' }}
                                            />
                                        )}
                                        <CardContent sx={{ flexGrow: 1, p: 3, textAlign: isArabic ? 'right' : 'left' }}>
                                            {post.category && (
                                                <Chip
                                                    label={typeof post.category === 'object' ? post.category[isArabic ? 'ar' : 'en'] : post.category}
                                                    size="small"
                                                    sx={{
                                                        mb: 2,
                                                        bgcolor: 'rgba(0, 137, 123, 0.1)',
                                                        color: '#00897B',
                                                        fontWeight: 500,
                                                        fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                                                    }}
                                                />
                                            )}
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                                                    fontWeight: 600,
                                                    color: 'text.primary',
                                                    mb: 1,
                                                    direction: isArabic ? 'rtl' : 'ltr',
                                                    textAlign: isArabic ? 'right' : 'left',
                                                    lineHeight: 1.4,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {typeof post.title === 'object' ? post.title[isArabic ? 'ar' : 'en'] : post.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2,
                                                    direction: isArabic ? 'rtl' : 'ltr',
                                                    textAlign: isArabic ? 'right' : 'left',
                                                    fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {typeof post.excerpt === 'object' ? post.excerpt[isArabic ? 'ar' : 'en'] : post.excerpt}
                                            </Typography>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                color: 'text.secondary',
                                                flexDirection: isArabic ? 'row-reverse' : 'row',
                                                justifyContent: isArabic ? 'flex-end' : 'flex-start',
                                            }}>
                                                <AccessTimeIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" sx={{ fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif" }}>
                                                    {post.readingTime || 3} {t('blog.minRead')}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )
                }

                {/* View All Button */}
                <Box sx={{ textAlign: 'center', mt: 5 }} display='flex' justifyContent="center">
                    <Button
                        component={Link}
                        to="/blog"
                        variant="outlined"
                        size="large"
                        startIcon={isArabic ? <ArrowBackIcon /> : null}
                        endIcon={!isArabic ? <ArrowForwardIcon /> : null}
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                            fontWeight: 600,
                            borderColor: '#00695C',
                            color: '#00695C',
                            direction: isArabic ? 'rtl' : 'ltr',
                            '&:hover': {
                                borderColor: '#004D40',
                                bgcolor: 'rgba(0, 105, 92, 0.05)'
                            }
                        }}
                    >
                        {t('blog.viewAllArticles')}
                    </Button>
                </Box>
            </Container >
        </Box >
    );
}

export default BlogSection;
