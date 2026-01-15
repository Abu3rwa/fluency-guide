import React from "react";
import { Box, Typography, Card, CardContent, CardMedia, Chip, Skeleton, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { colors } from "../../theme";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../../contexts/AuthContext";

function BlogCard({ post, compact = false, onDelete }) {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const title = post?.title?.[isArabic ? "ar" : "en"] || post?.title?.en || "";
    const excerpt = post?.excerpt?.[isArabic ? "ar" : "en"] || post?.excerpt?.en || "";
    const category = post?.category?.[isArabic ? "ar" : "en"] || post?.category?.en || "";
    const authorName = post?.author?.name || "";
    const readingTime = post?.readingTime || 3;

    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/blog/edit/${post?.id}`);
    };

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDelete) {
            onDelete(post?.id);
        }
    };

    return (
        <Card
            component={Link}
            to={`/blog/${post?.slug}`}
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                textDecoration: "none",
                borderRadius: 2,
                overflow: "hidden",
                transition: "all 0.2s ease",
                border: "1px solid",
                borderColor: "divider",
                position: "relative",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)"
                }
            }}
        >
            {isAdmin && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: isArabic ? "auto" : 8,
                        left: isArabic ? 8 : "auto",
                        display: "flex",
                        gap: 0.5,
                        zIndex: 1
                    }}
                >
                    {post?.status === 'draft' && (
                        <Chip
                            label={t('blog.draft') || 'Draft'}
                            size="small"
                            color="warning"
                            sx={{ height: 24, fontWeight: 700 }}
                        />
                    )}
                    <IconButton
                        size="small"
                        onClick={handleEdit}
                        sx={{
                            bgcolor: "rgba(255,255,255,0.95)",
                            "&:hover": { bgcolor: "#fff" }
                        }}
                    >
                        <EditIcon fontSize="small" color="primary" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={handleDelete}
                        sx={{
                            bgcolor: "rgba(255,255,255,0.95)",
                            "&:hover": { bgcolor: "#fff" }
                        }}
                    >
                        <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                </Box>
            )}

            <CardMedia
                component="img"
                height={compact ? 140 : 180}
                image={post?.featuredImage || "/placeholder-blog.jpg"}
                alt={title}
                sx={{ objectFit: "cover" }}
            />
            <CardContent
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: compact ? 2 : 2.5,
                    fontFamily: "'Montserrat', sans-serif"
                }}
            >
                {category && (
                    <Chip
                        label={category}
                        size="small"
                        sx={{
                            alignSelf: "flex-start",
                            mb: 1.5,
                            bgcolor: "rgba(0, 137, 123, 0.1)",
                            color: colors.primary.main,
                            fontWeight: 500,
                            fontSize: "0.75rem",
                            height: 24,
                            fontFamily: "'Montserrat', sans-serif"
                        }}
                    />
                )}

                <Typography
                    variant={compact ? "subtitle1" : "h6"}
                    sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: colors.text.primary,
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        fontFamily: "'Montserrat', sans-serif",
                        direction: isArabic ? "rtl" : "ltr"
                    }}
                >
                    {title}
                </Typography>

                {!compact && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: colors.text.secondary,
                            mb: 2,
                            lineHeight: 1.6,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            flexGrow: 1,
                            fontFamily: "'Montserrat', sans-serif",
                            direction: isArabic ? "rtl" : "ltr"
                        }}
                    >
                        {excerpt}
                    </Typography>
                )}

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: "auto",
                        pt: 1.5,
                        borderTop: "1px solid",
                        borderColor: "divider"
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PersonIcon sx={{ fontSize: 14, color: colors.text.secondary }} />
                        <Typography
                            variant="caption"
                            sx={{
                                color: colors.text.secondary,
                                fontFamily: "'Montserrat', sans-serif"
                            }}
                        >
                            {authorName}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: colors.text.secondary }} />
                        <Typography
                            variant="caption"
                            sx={{
                                color: colors.text.secondary,
                                fontFamily: "'Montserrat', sans-serif"
                            }}
                        >
                            {readingTime} {t('blog.minRead')}\n                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export function BlogCardSkeleton({ compact = false }) {
    return (
        <Card
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider"
            }}
        >
            <Skeleton variant="rectangular" height={compact ? 140 : 180} />
            <CardContent sx={{ p: compact ? 2 : 2.5 }}>
                <Skeleton variant="rounded" width={80} height={24} sx={{ mb: 1.5 }} />
                <Skeleton variant="text" sx={{ fontSize: "1.25rem", mb: 0.5 }} />
                <Skeleton variant="text" sx={{ fontSize: "1.25rem", width: "80%" }} />
                {!compact && (
                    <>
                        <Skeleton variant="text" sx={{ mt: 1 }} />
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="60%" />
                    </>
                )}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Skeleton variant="text" width={80} />
                    <Skeleton variant="text" width={60} />
                </Box>
            </CardContent>
        </Card>
    );
}

export default BlogCard;
