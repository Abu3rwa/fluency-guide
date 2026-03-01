import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, Alert,
    CircularProgress, Card, CardContent, Grid, Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    collection,
    count,
    getAggregateFromServer,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    startAfter,
    sum,
    where,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArticleIcon from '@mui/icons-material/Article';
import PeopleIcon from '@mui/icons-material/People';
import { colors } from '../../../theme';

function BlogAnalytics() {
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [stats, setStats] = useState({
        totalViews: 0,
        totalPosts: 0,
    });

    // Cursor for each page start. page 0 always starts without cursor.
    const pageStartCursorRef = useRef({ 0: null });

    const refreshStats = useCallback(async () => {
        try {
            const postsQuery = query(
                collection(db, 'blog_posts'),
                where('viewCount', '>=', 0)
            );
            const aggregateSnap = await getAggregateFromServer(postsQuery, {
                totalPosts: count(),
                totalViews: sum('viewCount'),
            });

            const data = aggregateSnap.data();
            setStats({
                totalPosts: data?.totalPosts || 0,
                totalViews: data?.totalViews || 0,
            });
        } catch (err) {
            // Keep UI functional even if aggregate stats fail.
            console.error('Error fetching aggregate blog stats:', err);
        }
    }, []);

    const ensurePageStartCursor = useCallback(async (targetPage, pageSize) => {
        if (targetPage === 0) {
            return { hasPage: true, cursor: null };
        }

        if (Object.prototype.hasOwnProperty.call(pageStartCursorRef.current, targetPage)) {
            const knownCursor = pageStartCursorRef.current[targetPage];
            return { hasPage: knownCursor !== null, cursor: knownCursor };
        }

        const postsRef = collection(db, 'blog_posts');
        let currentPage = 0;

        while (currentPage < targetPage) {
            if (Object.prototype.hasOwnProperty.call(pageStartCursorRef.current, currentPage + 1)) {
                currentPage += 1;
                continue;
            }

            const startCursor = pageStartCursorRef.current[currentPage];
            const constraints = [where('viewCount', '>=', 0), orderBy('viewCount', 'desc'), limit(pageSize)];
            if (startCursor) {
                constraints.push(startAfter(startCursor));
            }

            const snap = await getDocs(query(postsRef, ...constraints));
            const nextCursor = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
            pageStartCursorRef.current[currentPage + 1] = nextCursor;
            currentPage += 1;

            // No more pages available.
            if (!nextCursor) {
                break;
            }
        }

        if (!Object.prototype.hasOwnProperty.call(pageStartCursorRef.current, targetPage)) {
            return { hasPage: false, cursor: null };
        }

        const cursor = pageStartCursorRef.current[targetPage];
        return { hasPage: cursor !== null, cursor };
    }, []);

    useEffect(() => {
        let unsubscribe = () => { };
        let cancelled = false;

        const subscribeCurrentPage = async () => {
            setLoading(true);
            setError('');

            try {
                const { hasPage, cursor } = await ensurePageStartCursor(page, rowsPerPage);
                if (cancelled) return;

                if (!hasPage && page > 0) {
                    setPosts([]);
                    setLoading(false);
                    return;
                }

                const constraints = [where('viewCount', '>=', 0), orderBy('viewCount', 'desc'), limit(rowsPerPage)];
                if (cursor) {
                    constraints.push(startAfter(cursor));
                }

                const pageQuery = query(collection(db, 'blog_posts'), ...constraints);

                unsubscribe = onSnapshot(
                    pageQuery,
                    (snapshot) => {
                        if (cancelled) return;

                        const postsList = snapshot.docs.map((postDoc) => {
                            const data = postDoc.data();
                            return {
                                id: postDoc.id,
                                ...data,
                                viewCount: data?.viewCount || 0,
                            };
                        });

                        setPosts(postsList);

                        const nextCursor = snapshot.docs.length > 0
                            ? snapshot.docs[snapshot.docs.length - 1]
                            : null;
                        pageStartCursorRef.current[page + 1] = nextCursor;

                        setLoading(false);
                        refreshStats();
                    },
                    (err) => {
                        console.error('Error subscribing to blog analytics page:', err);
                        setError(isArabic ? 'حدث خطأ أثناء تحميل إحصائيات المدونة.' : 'Error loading blog analytics.');
                        setLoading(false);
                    }
                );
            } catch (err) {
                console.error('Error preparing blog analytics query:', err);
                setError(isArabic ? 'حدث خطأ أثناء تحميل إحصائيات المدونة.' : 'Error loading blog analytics.');
                setLoading(false);
            }
        };

        subscribeCurrentPage();

        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, [page, rowsPerPage, ensurePageStartCursor, isArabic, refreshStats]);

    useEffect(() => {
        refreshStats();
    }, [refreshStats]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const nextRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(nextRowsPerPage);
        setPage(0);
        pageStartCursorRef.current = { 0: null };
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getTitle = (titleObj) => {
        if (!titleObj) return 'Untitled';
        if (typeof titleObj === 'string') return titleObj;
        return titleObj[isArabic ? 'ar' : 'en'] || titleObj.en || 'Untitled';
    };

    const getCategory = (categoryObj) => {
        if (!categoryObj) return '-';
        if (typeof categoryObj === 'string') return categoryObj;
        return categoryObj[isArabic ? 'ar' : 'en'] || categoryObj.en || '-';
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', pb: 4 }}>
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
                    color: 'white',
                    py: 4,
                    px: 3,
                    mb: 4,
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <TrendingUpIcon sx={{ fontSize: 40 }} />
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                                    }}
                                >
                                    {isArabic ? 'إحصائيات المدونة' : 'Blog Analytics'}
                                </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                {isArabic
                                    ? 'تتبع مشاهدات المقالات وأداء المدونة'
                                    : 'Track article views and blog performance'}
                            </Typography>
                        </Box>
                        <Button
                            component={Link}
                            to="/admin/users"
                            variant="outlined"
                            startIcon={<PeopleIcon />}
                            sx={{
                                color: 'white',
                                borderColor: 'rgba(255,255,255,0.5)',
                                '&:hover': {
                                    borderColor: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)'
                                },
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                                fontWeight: 600
                            }}
                        >
                            {isArabic ? 'إدارة المستخدمين' : 'User Management'}
                        </Button>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            background: `linear-gradient(135deg, ${colors.secondary.light} 0%, ${colors.secondary.main} 100%)`,
                            color: 'white',
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <VisibilityIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                                <Typography variant="h3" sx={{ fontWeight: 700 }}>{stats.totalViews.toLocaleString()}</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    {isArabic ? 'إجمالي المشاهدات' : 'Total Views'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.primary.main} 100%)`,
                            color: 'white',
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <ArticleIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                                <Typography variant="h3" sx={{ fontWeight: 700 }}>{stats.totalPosts.toLocaleString()}</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    {isArabic ? 'إجمالي المقالات' : 'Total Articles'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Paper sx={{ overflow: 'hidden' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {isArabic ? 'المقالات الأكثر مشاهدة' : 'Top Performing Posts'}
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>{isArabic ? 'العنوان' : 'Title'}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{isArabic ? 'المؤلف' : 'Author'}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{isArabic ? 'الفئة' : 'Category'}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{isArabic ? 'تاريخ النشر' : 'Published'}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>{isArabic ? 'المشاهدات' : 'Views'}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : posts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <Typography color="textSecondary">
                                                {isArabic ? 'لا توجد مقالات' : 'No posts found'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    posts.map((post) => (
                                        <TableRow key={post.id} hover>
                                            <TableCell>
                                                <Typography sx={{ fontWeight: 500, maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {getTitle(post.title)}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    /{post.slug}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{post.author?.name || '-'}</TableCell>
                                            <TableCell>{getCategory(post.category)}</TableCell>
                                            <TableCell>{formatDate(post.publishedAt)}</TableCell>
                                            <TableCell align="right">
                                                <Typography sx={{ fontWeight: 600, color: colors.primary.main }}>
                                                    {post.viewCount.toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={stats.totalPosts}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        labelRowsPerPage={isArabic ? 'عدد الصفوف:' : 'Rows per page:'}
                    />
                </Paper>
            </Container>
        </Box>
    );
}

export default BlogAnalytics;
