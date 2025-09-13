import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Fab,
  Drawer,
  useMediaQuery,
  Fade,
  Alert,
  Snackbar,
  Chip,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  BookmarkBorder as BookmarkIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../../contexts/ThemeContext";
import { useStudentCourse } from "../../contexts/studentCourseContext";
import { useUser } from "../../contexts/UserContext";
import { enrollmentService } from "../../services/enrollmentService";
import StudentCourseCard from "../../components/student/StudentCourseCard";
import CustomSpinner from "../../components/CustomSpinner";
import { CourseFiltersContainer } from "../../components/student/filters/CourseFilters";
import { useCourseFiltering, useCourseBookmarks, useCourseLayout } from "../../components/student/hooks/useCourseFiltering";
import { 
  FILTER_CATEGORIES, 
  COURSE_LEVELS, 
  COURSE_LANGUAGES, 
  VIEW_MODES, 
  SORT_OPTIONS,
  COURSE_CARD_VARIANTS,
  TRANSITIONS,
  DESIGN_TOKENS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
} from "../../components/student/constants";
import { getTypographyStyles, getPaperStyles } from "../../components/student/theme/styleUtils";

const StudentCoursesPage = () => {
  const { t } = useTranslation();
  const { mode, theme } = useCustomTheme();
  const { getAllCourses } = useStudentCourse();
  const { userData: user } = useUser();
  
  // Responsive design hooks
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const isTablet = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { getCoursesPerPage, getGridColumns } = useCourseLayout();
  const { getBookmarks, toggleBookmark } = useCourseBookmarks(user?.uid);

  // State management
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [bookmarkedCourses, setBookmarkedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.FEATURED);
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    level: "",
    language: "",
    price: "",
    duration: "",
    rating: "",
  });

  const coursesPerPage = getCoursesPerPage(isMobile, isTablet);

  // Filter options using constants
  const categories = useMemo(() => [
    { label: t("studentCourses.categories.bookmarked", "⭐ Bookmarked"), value: FILTER_CATEGORIES.BOOKMARKED },
    { label: t("studentCourses.categories.foundation", "Foundation"), value: FILTER_CATEGORIES.FOUNDATION },
    { label: t("studentCourses.categories.business", "Business"), value: FILTER_CATEGORIES.BUSINESS },
    { label: t("studentCourses.categories.conversation", "Conversation"), value: FILTER_CATEGORIES.CONVERSATION },
    { label: t("studentCourses.categories.exam", "Exam Prep"), value: FILTER_CATEGORIES.EXAM },
    { label: t("studentCourses.categories.grammar", "Grammar"), value: FILTER_CATEGORIES.GRAMMAR },
    { label: t("studentCourses.categories.vocabulary", "Vocabulary"), value: FILTER_CATEGORIES.VOCABULARY },
  ], [t]);

  const levels = useMemo(() => [
    { label: t("studentCourses.levels.beginner", "Beginner"), value: COURSE_LEVELS.BEGINNER },
    { label: t("studentCourses.levels.intermediate", "Intermediate"), value: COURSE_LEVELS.INTERMEDIATE },
    { label: t("studentCourses.levels.advanced", "Advanced"), value: COURSE_LEVELS.ADVANCED },
  ], [t]);

  const languages = useMemo(() => [
    { label: "English", value: COURSE_LANGUAGES.ENGLISH },
    { label: "Arabic", value: COURSE_LANGUAGES.ARABIC },
    { label: "Spanish", value: COURSE_LANGUAGES.SPANISH },
  ], []);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [coursesData, enrollmentsData] = await Promise.all([
          getAllCourses(),
          user ? enrollmentService.getEnrollmentsByStudent(user.uid) : []
        ]);
        
        setCourses(coursesData?.filter(course => course.status === "published") || []);
        setEnrollments(enrollmentsData || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError(ERROR_MESSAGES.LOAD_COURSES);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAllCourses, user]);

  // Initialize bookmarks on mount
  useEffect(() => {
    if (user) {
      const savedBookmarks = getBookmarks();
      setBookmarkedCourses(savedBookmarks);
    }
  }, [user, getBookmarks]);

  // Use the custom filtering hook
  const { filteredCourses, getPaginatedCourses, getTotalPages, getFilterStats } = useCourseFiltering(
    courses, 
    filters, 
    sortBy, 
    bookmarkedCourses
  );

  // Get paginated courses
  const paginatedCourses = useMemo(() => {
    return getPaginatedCourses(page, coursesPerPage);
  }, [getPaginatedCourses, page, coursesPerPage]);

  const totalPages = getTotalPages(coursesPerPage);
  const filterStats = getFilterStats();

  // Handlers
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: "",
      category: "",
      level: "",
      language: "",
      price: "",
      duration: "",
      rating: "",
    });
    setPage(1);
  }, []);

  const handleBookmarkToggle = useCallback((course) => {
    const newBookmarks = toggleBookmark(
      course.id,
      bookmarkedCourses,
      (updatedBookmarks, wasAdded) => {
        setBookmarkedCourses(updatedBookmarks);
        setSnackbar({
          open: true,
          message: wasAdded ? SUCCESS_MESSAGES.BOOKMARK_ADDED : SUCCESS_MESSAGES.BOOKMARK_REMOVED,
          severity: wasAdded ? "success" : "info"
        });
      },
      (error) => {
        setSnackbar({
          open: true,
          message: ERROR_MESSAGES.BOOKMARK_ACTION,
          severity: "error"
        });
      }
    );
  }, [bookmarkedCourses, toggleBookmark]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const coursesData = await getAllCourses();
      setCourses(coursesData?.filter(course => course.status === "published") || []);
      setSnackbar({
        open: true,
        message: SUCCESS_MESSAGES.COURSES_REFRESHED,
        severity: "success"
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: ERROR_MESSAGES.REFRESH_COURSES,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  }, [getAllCourses]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: mode === "dark" ? "grey.900" : "grey.50" }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <CustomSpinner 
            message={t("studentCourses.loading", "Loading courses...")} 
            overlay={false}
          />
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: mode === "dark" ? "grey.900" : "grey.50" }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert 
            severity="error" 
            action={
              <Button onClick={handleRefresh}>
                {t("common.retry", "Retry")}
              </Button>
            }
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: mode === "dark" ? "grey.900" : "grey.50" }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                ...getTypographyStyles("pageTitle", mode),
                mb: 2,
              }}
            >
              {t("studentCourses.title", "Discover Courses")}
            </Typography>
            
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 600 }}
            >
              {t("studentCourses.subtitle", "Find the perfect course to advance your English learning journey")}
            </Typography>

            {/* Enhanced Stats */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Chip
                label={`${filterStats.filtered} ${t("studentCourses.coursesFound", "courses found")}`}
                color="primary"
                variant="outlined"
              />
              {user && enrollments.length > 0 && (
                <Chip
                  label={`${enrollments.length} ${t("studentCourses.enrolled", "enrolled")}`}
                  color="success"
                  variant="outlined"
                />
              )}
              {filterStats.bookmarked > 0 && (
                <Chip
                  label={`${filterStats.bookmarked} ${t("studentCourses.bookmarked", "bookmarked")}`}
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        </Fade>

        <Grid container spacing={3}>
          {/* Filters Sidebar */}
          <Grid item xs={12} lg={3}>
            {isMobile ? (
              <Drawer
                anchor="bottom"
                open={showFilters}
                onClose={() => setShowFilters(false)}
                PaperProps={{
                  sx: { 
                    borderRadius: "16px 16px 0 0",
                    maxHeight: "80vh",
                    p: 2,
                  }
                }}
              >
                <CourseFiltersContainer
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  categories={categories}
                  levels={levels}
                  languages={languages}
                  isLoading={loading}
                />
              </Drawer>
            ) : (
              <Fade in timeout={800}>
                <Box>
                  <CourseFiltersContainer
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    categories={categories}
                    levels={levels}
                    languages={languages}
                    isLoading={loading}
                  />
                </Box>
              </Fade>
            )}
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} lg={9}>
            {/* Toolbar */}
            <Fade in timeout={1000}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                  {/* Mobile Filter Button */}
                  {isMobile && (
                    <Button
                      variant="outlined"
                      startIcon={<FilterIcon />}
                      onClick={() => setShowFilters(true)}
                    >
                      {t("studentCourses.filters", "Filters")}
                    </Button>
                  )}

                  {/* Sort */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>{t("studentCourses.sortBy", "Sort by")}</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label={t("studentCourses.sortBy", "Sort by")}
                    >
                      <MenuItem value="featured">
                        {t("studentCourses.featured", "Featured")}
                      </MenuItem>
                      <MenuItem value="rating">
                        {t("studentCourses.rating", "Rating")}
                      </MenuItem>
                      <MenuItem value="price">
                        {t("studentCourses.price", "Price")}
                      </MenuItem>
                      <MenuItem value="newest">
                        {t("studentCourses.newest", "Newest")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {/* View Mode Toggle */}
                  <Tooltip title={t("studentCourses.gridView", "Grid View")}>
                    <IconButton
                      onClick={() => setViewMode("grid")}
                      color={viewMode === "grid" ? "primary" : "default"}
                    >
                      <GridViewIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={t("studentCourses.listView", "List View")}>
                    <IconButton
                      onClick={() => setViewMode("list")}
                      color={viewMode === "list" ? "primary" : "default"}
                    >
                      <ListViewIcon />
                    </IconButton>
                  </Tooltip>

                  {/* Refresh */}
                  <Tooltip title={t("studentCourses.refresh", "Refresh")}>
                    <IconButton onClick={handleRefresh}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Fade>

            {/* Courses Grid */}
            {paginatedCourses.length === 0 ? (
              <Fade in timeout={1200}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 6,
                    textAlign: "center",
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    {t("studentCourses.noCourses", "No courses found")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {t("studentCourses.noCoursesDescription", "Try adjusting your filters or search terms")}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    startIcon={<ClearIcon />}
                  >
                    {t("studentCourses.clearFilters", "Clear Filters")}
                  </Button>
                </Paper>
              </Fade>
            ) : (
              <Fade in timeout={1200}>
                <Grid container spacing={3}>
                  {paginatedCourses.map((course, index) => {
                    const gridCols = getGridColumns(viewMode, isMobile, isTablet);
                    return (
                      <Grid 
                        item 
                        {...gridCols}
                        key={course.id}
                      >
                        <StudentCourseCard
                          course={course}
                          enrollment={enrollments.find(e => e.courseId === course.id)}
                          showBookmark={true}
                          isBookmarked={bookmarkedCourses.includes(course.id)}
                          onBookmarkToggle={handleBookmarkToggle}
                          variant={viewMode === VIEW_MODES.LIST ? COURSE_CARD_VARIANTS.DETAILED : COURSE_CARD_VARIANTS.DEFAULT}
                          priority={index < 6}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Fade>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Fade in timeout={1400}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 6,
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                    size={isMobile ? "medium" : "large"}
                    siblingCount={isMobile ? 0 : 1}
                    boundaryCount={1}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
              </Fade>
            )}
          </Grid>
        </Grid>

        {/* Floating Action Button for Bookmarks */}
        {bookmarkedCourses.length > 0 && (
          <Tooltip title={t("studentCourses.viewBookmarks", "View Bookmarks")}>
            <Fab
              color="primary"
              sx={{
                position: "fixed",
                bottom: { xs: 16, md: 24 },
                right: { xs: 16, md: 24 },
                zIndex: 1000,
                transition: TRANSITIONS.CARD_HOVER,
                '&:hover': {
                  transform: 'scale(1.1)'
                }
              }}
              onClick={() => {
                setFilters(prev => ({ ...prev, search: "", category: FILTER_CATEGORIES.BOOKMARKED }));
                setPage(1);
                setSnackbar({
                  open: true,
                  message: t("studentCourses.showingBookmarked", "Showing bookmarked courses"),
                  severity: "info"
                });
              }}
              aria-label={t("studentCourses.viewBookmarks", "View Bookmarks")}
            >
              <Box sx={{ position: "relative" }}>
                <BookmarkIcon />
                <Chip
                  label={bookmarkedCourses.length}
                  size="small"
                  color="secondary"
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    minWidth: 20,
                    height: 20,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                />
              </Box>
            </Fab>
          </Tooltip>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default StudentCoursesPage;