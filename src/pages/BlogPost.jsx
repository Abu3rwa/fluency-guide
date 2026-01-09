import React, { useEffect, useState } from "react";
import {
    Box,
    Container,
    Typography,
    Chip,
    Breadcrumbs,
    Link as MuiLink,
    CircularProgress,
    Alert,
    Divider
} from "@mui/material";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBlog } from "../contexts/BlogContext";
import { AuthorBio, ShareButtons, BlogCard } from "../components/blog";
import { colors } from "../theme";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function BlogPost() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";

    const { currentPost, loading, error, fetchPostBySlug, fetchRelatedPosts } = useBlog();
    const [relatedPosts, setRelatedPosts] = useState([]);

    useEffect(() => {
        if (slug) {
            fetchPostBySlug(slug);
        }
    }, [slug, fetchPostBySlug]);

    useEffect(() => {
        const loadRelated = async () => {
            if (currentPost?.category?.en && currentPost?.id) {
                const related = await fetchRelatedPosts(currentPost.category.en, currentPost.id, 2);
                setRelatedPosts(related);
            }
        };
        loadRelated();
    }, [currentPost, fetchRelatedPosts]);

    // Update Open Graph meta tags for social sharing preview
    useEffect(() => {
        if (currentPost) {
            const postTitle = currentPost.title?.[isArabic ? "ar" : "en"] || currentPost.title?.en || "Sudanglish Blog";
            const postDescription = currentPost.excerpt?.[isArabic ? "ar" : "en"] || currentPost.excerpt?.en || "";
            const postImage = currentPost.featuredImage || "";
            const postUrl = window.location.href;

            // Update document title
            document.title = `${postTitle} | Sudanglish`;

            // Update or create meta tags
            const updateMetaTag = (property, content, isName = false) => {
                const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
                let meta = document.querySelector(selector);
                if (!meta) {
                    meta = document.createElement("meta");
                    if (isName) {
                        meta.setAttribute("name", property);
                    } else {
                        meta.setAttribute("property", property);
                    }
                    document.head.appendChild(meta);
                }
                meta.setAttribute("content", content);
            };

            // Open Graph tags (Facebook, WhatsApp)
            updateMetaTag("og:title", postTitle);
            updateMetaTag("og:description", postDescription);
            updateMetaTag("og:image", postImage);
            updateMetaTag("og:url", postUrl);
            updateMetaTag("og:type", "article");

            // Standard meta description
            updateMetaTag("description", postDescription, true);
        }

        // Cleanup: Reset to default on unmount
        return () => {
            document.title = "Sudanglish - Master English with Real Conversations";
        };
    }, [currentPost, isArabic]);

    const title = currentPost?.title?.[isArabic ? "ar" : "en"] || currentPost?.title?.en || "";
    const content = currentPost?.content?.[isArabic ? "ar" : "en"] || currentPost?.content?.en || "";
    const category = currentPost?.category?.[isArabic ? "ar" : "en"] || currentPost?.category?.en || "";

    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CircularProgress sx={{ color: colors.primary.main }} />
                </Box>
            </Box>
        );
    }

    if (error || !currentPost) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Container maxWidth="lg" sx={{ py: 8, flexGrow: 1 }}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error || (isArabic ? "المقال غير موجود" : "Post not found")}
                    </Alert>
                    <MuiLink
                        component={Link}
                        to="/blog"
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                            color: colors.primary.main,
                            textDecoration: "none",
                            fontFamily: "'Montserrat', sans-serif",
                            "&:hover": { textDecoration: "underline" }
                        }}
                    >
                        {!isArabic && <ArrowBackIcon />}
                        {isArabic ? "العودة للمدونة" : "Back to Blog"}
                        {isArabic && <ArrowForwardIcon />}
                    </MuiLink>
                </Container>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: "#f5f7fa"
            }}
        >
            {currentPost.featuredImage && (
                <Box
                    sx={{
                        width: "100%",
                        height: { xs: 200, sm: 300, md: 400 },
                        bgcolor: colors.primary.dark,
                        backgroundImage: `url(${currentPost.featuredImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                    }}
                />
            )}

            <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 }, flexGrow: 1 }}>
                <Breadcrumbs
                    sx={{
                        mb: 3,
                        fontFamily: "'Montserrat', sans-serif",
                        "& .MuiBreadcrumbs-separator": {
                            mx: 1
                        }
                    }}
                >
                    <MuiLink
                        component={Link}
                        to="/"
                        sx={{
                            color: colors.text.secondary,
                            textDecoration: "none",
                            "&:hover": { color: colors.primary.main }
                        }}
                    >
                        {isArabic ? "الرئيسية" : "Home"}
                    </MuiLink>
                    <MuiLink
                        component={Link}
                        to="/blog"
                        sx={{
                            color: colors.text.secondary,
                            textDecoration: "none",
                            "&:hover": { color: colors.primary.main }
                        }}
                    >
                        {isArabic ? "المدونة" : "Blog"}
                    </MuiLink>
                    <Typography
                        sx={{
                            color: colors.text.primary,
                            fontFamily: "'Montserrat', sans-serif"
                        }}
                    >
                        {title.length > 30 ? title.substring(0, 30) + "..." : title}
                    </Typography>
                </Breadcrumbs>

                <Box
                    sx={{
                        bgcolor: "#fff",
                        borderRadius: 2,
                        p: { xs: 3, md: 5 },
                        border: "1px solid",
                        borderColor: "divider"
                    }}
                >
                    {category && (
                        <Chip
                            label={category}
                            size="small"
                            sx={{
                                mb: 2,
                                bgcolor: "rgba(0, 137, 123, 0.1)",
                                color: colors.primary.main,
                                fontWeight: 500,
                                fontFamily: "'Montserrat', sans-serif"
                            }}
                        />
                    )}

                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                            lineHeight: 1.3,
                            mb: 2,
                            color: colors.text.primary,
                            direction: isArabic ? "rtl" : "ltr"
                        }}
                    >
                        {title}
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            gap: { xs: 2, sm: 3 },
                            mb: 3,
                            pb: 3,
                            borderBottom: "1px solid",
                            borderColor: "divider"
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <CalendarTodayIcon sx={{ fontSize: 16, color: colors.text.secondary }} />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: colors.text.secondary,
                                    fontFamily: "'Montserrat', sans-serif"
                                }}
                            >
                                {formatDate(currentPost.publishedAt)}
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: colors.text.secondary }} />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: colors.text.secondary,
                                    fontFamily: "'Montserrat', sans-serif"
                                }}
                            >
                                {currentPost.readingTime || 3} {isArabic ? "دقائق للقراءة" : "min read"}
                            </Typography>
                        </Box>

                        <Box sx={{ ml: "auto" }}>
                            <ShareButtons title={title} imageUrl={currentPost.featuredImage} />
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            "& p": {
                                fontFamily: "'Montserrat', sans-serif",
                                fontSize: "1.05rem",
                                lineHeight: 1.8,
                                color: colors.text.primary,
                                mb: 2,
                                direction: isArabic ? "rtl" : "ltr"
                            },
                            "& h2, & h3, & h4": {
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 700,
                                color: colors.text.primary,
                                mt: 4,
                                mb: 2,
                                direction: isArabic ? "rtl" : "ltr"
                            },
                            "& ul, & ol": {
                                fontFamily: "'Montserrat', sans-serif",
                                pl: isArabic ? 0 : 3,
                                pr: isArabic ? 3 : 0,
                                mb: 2,
                                direction: isArabic ? "rtl" : "ltr"
                            },
                            "& li": {
                                mb: 1,
                                lineHeight: 1.7
                            },
                            "& a": {
                                color: colors.primary.main,
                                textDecoration: "none",
                                "&:hover": { textDecoration: "underline" }
                            },
                            "& blockquote": {
                                borderLeft: isArabic ? "none" : `4px solid ${colors.primary.main}`,
                                borderRight: isArabic ? `4px solid ${colors.primary.main}` : "none",
                                pl: isArabic ? 0 : 3,
                                pr: isArabic ? 3 : 0,
                                py: 1,
                                my: 3,
                                bgcolor: "rgba(0, 137, 123, 0.04)",
                                borderRadius: 1,
                                fontStyle: "italic"
                            },
                            "& img": {
                                maxWidth: "100%",
                                height: "auto",
                                borderRadius: 2,
                                my: 2
                            },
                            "& pre": {
                                bgcolor: "#1e1e1e",
                                color: "#fff",
                                p: 2,
                                borderRadius: 2,
                                overflow: "auto",
                                fontSize: "0.9rem",
                                direction: "ltr"
                            }
                        }}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />

                    <AuthorBio author={currentPost.author} />
                </Box>

                {relatedPosts.length > 0 && (
                    <Box sx={{ mt: 5 }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                fontFamily: "'Montserrat', sans-serif",
                                mb: 3,
                                color: colors.text.primary,
                                direction: isArabic ? "rtl" : "ltr"
                            }}
                        >
                            {isArabic ? "مقالات ذات صلة" : "Related Posts"}
                        </Typography>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                gap: 3
                            }}
                        >
                            {relatedPosts.map((post) => (
                                <BlogCard key={post.id} post={post} compact />
                            ))}
                        </Box>
                    </Box>
                )}

                <Box sx={{ mt: 4 }}>
                    <MuiLink
                        component={Link}
                        to="/blog"
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                            color: colors.primary.main,
                            textDecoration: "none",
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 500,
                            "&:hover": { textDecoration: "underline" }
                        }}
                    >
                        {!isArabic && <ArrowBackIcon fontSize="small" />}
                        {isArabic ? "العودة للمدونة" : "Back to Blog"}
                        {isArabic && <ArrowForwardIcon fontSize="small" />}
                    </MuiLink>
                </Box>
            </Container>
        </Box>
    );
}

export default BlogPost;
