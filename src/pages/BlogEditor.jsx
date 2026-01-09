import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    MenuItem,
    Alert,
    CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useBlog } from "../contexts/BlogContext";
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { colors } from "../theme";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function BlogEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const isArabic = i18n.language === "ar";
    const { user, userProfile, isAdmin } = useAuth();
    const { getCategories } = useBlog();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const categories = getCategories();

    // Quill editor configuration
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'direction': 'rtl' }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            [{ 'align': [] }],
            ['clean']
        ],
    };

    const quillFormats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'direction', 'blockquote', 'code-block',
        'link', 'image', 'align'
    ];

    const [formData, setFormData] = useState({
        title: { en: "", ar: "" },
        excerpt: { en: "", ar: "" },
        content: { en: "", ar: "" },
        category: { en: "Learning Tips", ar: "نصائح التعلم" },
        featuredImage: "",
        status: "draft",
        tags: [],
    });

    useEffect(() => {
        if (!isAdmin) {
            navigate("/blog");
        }

        if (id) {
            fetchPost();
        }
    }, [isAdmin, navigate, id]);

    const fetchPost = async () => {
        setLoading(true);
        try {
            const postDoc = await getDoc(doc(db, "blog_posts", id));

            if (postDoc.exists()) {
                const postData = postDoc.data();
                setFormData({
                    title: postData.title || { en: "", ar: "" },
                    excerpt: postData.excerpt || { en: "", ar: "" },
                    content: postData.content || { en: "", ar: "" },
                    category: postData.category || { en: "Learning Tips", ar: "نصائح التعلم" },
                    featuredImage: postData.featuredImage || "",
                    status: postData.status || "draft",
                    tags: postData.tags || [],
                });
            }
        } catch (err) {
            setError("Error loading post");
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    };

    const handleChange = (field, lang, value) => {
        if (lang) {
            setFormData(prev => ({
                ...prev,
                [field]: { ...prev[field], [lang]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleCategoryChange = (value) => {
        const cat = categories.find(c => c.en === value);
        if (cat) {
            setFormData(prev => ({
                ...prev,
                category: { en: cat.en, ar: cat.ar }
            }));
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            return;
        }

        try {
            setUploadingImage(true);
            setError(null);

            const timestamp = Date.now();
            const storageRef = ref(storage, `blog-images/${timestamp}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            setFormData(prev => ({ ...prev, featuredImage: downloadURL }));
            setUploadingImage(false);
        } catch (err) {
            console.error("Error uploading image:", err);
            setError("Failed to upload image");
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        if (!formData.title.en.trim()) {
            setError("English title is required");
            setSaving(false);
            return;
        }

        try {
            const postData = {
                ...formData,
                slug: generateSlug(formData.title.en),
                author: {
                    uid: user.uid,
                    name: userProfile?.name || user.displayName || "Admin",
                    avatar: userProfile?.avatar || "",
                    bio: { en: "", ar: "" }
                },
                readingTime: Math.ceil(formData.content.en.split(" ").length / 200) || 3,
                updatedAt: serverTimestamp(),
            };

            if (id) {
                // Update existing post
                await updateDoc(doc(db, "blog_posts", id), postData);
            } else {
                // Create new post
                postData.publishedAt = formData.status === "published" ? serverTimestamp() : null;
                postData.createdAt = serverTimestamp();
                await addDoc(collection(db, "blog_posts"), postData);
            }

            setSuccess(true);
            setTimeout(() => navigate("/blog"), 1500);
        } catch (err) {
            console.error("Error saving post:", err);
            setError(err.message || "Error saving post");
        } finally {
            setSaving(false);
        }
    };

    if (!isAdmin) return null;

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
            <Box sx={{ bgcolor: colors.primary.main, color: "#fff", py: 3 }}>
                <Container maxWidth="lg">
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/blog")}
                        sx={{ color: "rgba(255,255,255,0.9)", mb: 1 }}
                    >
                        {isArabic ? "العودة للمدونة" : "Back to Blog"}
                    </Button>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: { xs: "1.5rem", md: "2rem" }
                        }}
                    >
                        {id
                            ? (isArabic ? "تعديل المقال" : "Edit Post")
                            : (isArabic ? "إنشاء مقال جديد" : "Create New Post")}
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>
                    {isArabic ? "تم الحفظ بنجاح!" : "Saved successfully!"}
                </Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* English Content */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, borderRadius: 2 }} elevation={0}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    English Content
                                </Typography>

                                <TextField
                                    fullWidth
                                    label="Title"
                                    value={formData.title.en}
                                    onChange={(e) => handleChange("title", "en", e.target.value)}
                                    required
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    label="Excerpt"
                                    value={formData.excerpt.en}
                                    onChange={(e) => handleChange("excerpt", "en", e.target.value)}
                                    multiline
                                    rows={2}
                                    sx={{ mb: 2 }}
                                />

                                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                                    Content
                                </Typography>
                                <Box sx={{
                                    '.ql-container': { minHeight: 250, fontSize: '1rem' },
                                    '.ql-editor': { minHeight: 250 },
                                    mb: 2,
                                    bgcolor: '#fff',
                                    borderRadius: 1
                                }}>
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.content.en}
                                        onChange={(value) => handleChange("content", "en", value)}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        placeholder="Write your content here..."
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Arabic Content */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, borderRadius: 2 }} elevation={0}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, direction: "rtl" }}>
                                    المحتوى العربي
                                </Typography>

                                <TextField
                                    fullWidth
                                    label="العنوان"
                                    value={formData.title.ar}
                                    onChange={(e) => handleChange("title", "ar", e.target.value)}
                                    sx={{ mb: 2 }}
                                    InputProps={{ sx: { direction: "rtl" } }}
                                />

                                <TextField
                                    fullWidth
                                    label="الملخص"
                                    value={formData.excerpt.ar}
                                    onChange={(e) => handleChange("excerpt", "ar", e.target.value)}
                                    multiline
                                    rows={2}
                                    sx={{ mb: 2 }}
                                    InputProps={{ sx: { direction: "rtl" } }}
                                />

                                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', direction: 'rtl' }}>
                                    المحتوى
                                </Typography>
                                <Box sx={{
                                    '.ql-container': { minHeight: 250, fontSize: '1rem', direction: 'rtl' },
                                    '.ql-editor': { minHeight: 250, textAlign: 'right' },
                                    mb: 2,
                                    bgcolor: '#fff',
                                    borderRadius: 1
                                }}>
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.content.ar}
                                        onChange={(value) => handleChange("content", "ar", value)}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        placeholder="اكتب المحتوى هنا..."
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Settings */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, borderRadius: 2 }} elevation={0}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    {isArabic ? "الإعدادات" : "Settings"}
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            select
                                            label={isArabic ? "التصنيف" : "Category"}
                                            value={formData.category.en}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                        >
                                            {categories.map((cat) => (
                                                <MenuItem key={cat.en} value={cat.en}>
                                                    {isArabic ? cat.ar : cat.en}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            select
                                            label={isArabic ? "الحالة" : "Status"}
                                            value={formData.status}
                                            onChange={(e) => handleChange("status", null, e.target.value)}
                                        >
                                            <MenuItem value="draft">{isArabic ? "مسودة" : "Draft"}</MenuItem>
                                            <MenuItem value="published">{isArabic ? "منشور" : "Published"}</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                        {isArabic ? "صورة الغلاف" : "Featured Image"}
                                    </Typography>

                                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            disabled={uploadingImage}
                                            sx={{ borderRadius: 1.5 }}
                                        >
                                            {uploadingImage ? (
                                                <CircularProgress size={20} />
                                            ) : (
                                                isArabic ? "رفع صورة" : "Upload Image"
                                            )}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </Button>

                                        <TextField
                                            fullWidth
                                            placeholder={isArabic ? "أو أدخل رابط الصورة" : "Or paste image URL"}
                                            value={formData.featuredImage}
                                            onChange={(e) => handleChange("featuredImage", null, e.target.value)}
                                            size="small"
                                        />
                                    </Box>

                                    {formData.featuredImage && (
                                        <Box
                                            sx={{
                                                mt: 2,
                                                width: "100%",
                                                maxWidth: 400,
                                                aspectRatio: "16/9",
                                                borderRadius: 2,
                                                overflow: "hidden",
                                                border: "1px solid",
                                                borderColor: "divider"
                                            }}
                                        >
                                            <img
                                                src={formData.featuredImage}
                                                alt="Preview"
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Submit */}
                        <Grid item xs={12}>
                            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate("/blog")}
                                    sx={{ borderRadius: 1.5 }}
                                >
                                    {isArabic ? "إلغاء" : "Cancel"}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={saving}
                                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                    sx={{
                                        bgcolor: colors.primary.main,
                                        borderRadius: 1.5,
                                        px: 4,
                                        "&:hover": { bgcolor: colors.primary.dark }
                                    }}
                                >
                                    {saving
                                        ? (isArabic ? "جاري الحفظ..." : "Saving...")
                                        : (isArabic ? "حفظ" : "Save")}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Container>
        </Box>
    );
}

export default BlogEditor;
