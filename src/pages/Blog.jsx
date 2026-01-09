import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Button, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useBlog } from "../contexts/BlogContext";
import { useAuth } from "../contexts/AuthContext";
import { BlogGrid, CategoryFilter } from "../components/blog";
import { colors } from "../theme";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

function Blog() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";
    const { category: categoryParam } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const {
        posts,
        loading,
        error,
        hasMore,
        fetchPosts,
        getCategories,
        loadMore
    } = useBlog();

    const [selectedCategory, setSelectedCategory] = useState(categoryParam || null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const categories = getCategories();

    useEffect(() => {
        fetchPosts(selectedCategory, true);
    }, [selectedCategory, fetchPosts]);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const handleDeleteClick = (postId) => {
        setPostToDelete(postId);
        setDeleteDialogOpen(true);
        setDeleteError(null);
    };

    const handleDeleteConfirm = async () => {
        if (!postToDelete) return;

        try {
            await deleteDoc(doc(db, "blog_posts", postToDelete));
            setDeleteDialogOpen(false);
            setPostToDelete(null);
            fetchPosts(selectedCategory, true);
        } catch (err) {
            console.error("Error deleting post:", err);
            setDeleteError(isArabic ? "فشل في حذف المقال" : "Failed to delete post");
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setPostToDelete(null);
        setDeleteError(null);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: "#f5f7fa"
            }}
        >
            <Box
                sx={{
                    py: { xs: 4, md: 6 },
                    bgcolor: colors.primary.main,
                    color: "#fff"
                }}
            >
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
                            mb: 1,
                            direction: isArabic ? "rtl" : "ltr"
                        }}
                    >
                        {isArabic ? "المدونة" : "Blog"}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            opacity: 0.9,
                            fontFamily: "'Montserrat', sans-serif",
                            maxWidth: 600,
                            direction: isArabic ? "rtl" : "ltr"
                        }}
                    >
                        {isArabic
                            ? "نصائح ومقالات لتعلم اللغة الإنجليزية"
                            : "Tips and articles for learning English"}
                    </Typography>

                    {isAdmin && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate("/blog/new")}
                            sx={{
                                mt: 2,
                                bgcolor: "#fff",
                                color: colors.primary.main,
                                fontWeight: 600,
                                borderRadius: 1.5,
                                px: 3,
                                "&:hover": {
                                    bgcolor: "rgba(255,255,255,0.9)"
                                }
                            }}
                        >
                            {isArabic ? "إنشاء مقال" : "Create Post"}
                        </Button>
                    )}
                </Container>
            </Box>

            <Container
                maxWidth="lg"
                sx={{
                    py: { xs: 3, md: 5 },
                    flexGrow: 1
                }}
            >
                <CategoryFilter
                    categories={categories}
                    selected={selectedCategory}
                    onSelect={handleCategorySelect}
                />

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {!loading && posts.length === 0 && (
                    <Box
                        sx={{
                            textAlign: "center",
                            py: 8
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: colors.text.secondary,
                                fontFamily: "'Montserrat', sans-serif"
                            }}
                        >
                            {isArabic ? "لا توجد مقالات" : "No posts found"}
                        </Typography>
                    </Box>
                )}

                <BlogGrid posts={posts} loading={loading} onDelete={handleDeleteClick} />

                {hasMore && posts.length > 0 && (
                    <Box sx={{ textAlign: "center", mt: 4 }}>
                        <Button
                            variant="outlined"
                            onClick={loadMore}
                            disabled={loading}
                            sx={{
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 600,
                                borderColor: colors.primary.main,
                                color: colors.primary.main,
                                px: 4,
                                py: 1.5,
                                borderRadius: 1.5,
                                "&:hover": {
                                    borderColor: colors.primary.dark,
                                    bgcolor: "rgba(0, 137, 123, 0.04)"
                                }
                            }}
                        >
                            {loading
                                ? (isArabic ? "جاري التحميل..." : "Loading...")
                                : (isArabic ? "تحميل المزيد" : "Load More")}
                        </Button>
                    </Box>
                )}
            </Container>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {isArabic ? "تأكيد الحذف" : "Confirm Delete"}
                </DialogTitle>
                <DialogContent>
                    {deleteError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                    <DialogContentText sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {isArabic
                            ? "هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء."
                            : "Are you sure you want to delete this post? This action cannot be undone."}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleDeleteCancel}
                        sx={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        {isArabic ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        sx={{
                            fontFamily: "'Montserrat', sans-serif",
                            borderRadius: 1.5
                        }}
                    >
                        {isArabic ? "حذف" : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Blog;
