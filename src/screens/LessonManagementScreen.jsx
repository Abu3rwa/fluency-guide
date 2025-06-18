import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Archive as ArchiveIcon,
  BarChart as BarChartIcon,
  Assignment as AssignmentIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getLessonsByCourse, deleteLesson } from "../services/lessonService";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

const LessonManagementScreen = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const fetchedLessons = await getLessonsByCourse();
      setLessons(fetchedLessons);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleMenuClick = (event, lesson) => {
    setSelectedLesson(lesson);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedLesson(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteLesson(selectedLesson.id);
      await fetchLessons();
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "error";
      default:
        return "default";
    }
  };

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || lesson.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedLessons = [...filteredLessons].sort((a, b) => {
    switch (selectedSort) {
      case "newest":
        return b.createdAt - a.createdAt;
      case "oldest":
        return a.createdAt - b.createdAt;
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {t("lessonManagement.title")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/lessons/create")}
        >
          {t("lessonManagement.createLesson")}
        </Button>
      </Box>

      {/* Filters and Search Section */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <TextField
          placeholder={t("lessonManagement.searchLessons")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={handleFilterClick}
        >
          {t("lessonManagement.filter")}
        </Button>
        <Button
          variant="outlined"
          startIcon={<SortIcon />}
          onClick={handleSortClick}
        >
          {t("lessonManagement.sort")}
        </Button>
      </Box>

      {/* Lessons Grid */}
      <Grid container spacing={3}>
        {sortedLessons.map((lesson) => (
          <Grid item xs={12} sm={6} md={4} key={lesson.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h2" gutterBottom>
                    {lesson.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, lesson)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {lesson.description}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mb: 2 }}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    label={t(`lessonManagement.status.${lesson.status}`)}
                    color={getStatusColor(lesson.status)}
                    size="small"
                  />
                  <Chip
                    label={`${lesson.duration} min`}
                    variant="outlined"
                    size="small"
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {t("lessonManagement.lastUpdated")}:{" "}
                  {format(lesson.updatedAt.toDate(), "MMM d, yyyy")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem
          selected={selectedStatus === "all"}
          onClick={() => setSelectedStatus("all")}
        >
          {t("lessonManagement.status.all")}
        </MenuItem>
        <MenuItem
          selected={selectedStatus === "published"}
          onClick={() => setSelectedStatus("published")}
        >
          {t("lessonManagement.status.published")}
        </MenuItem>
        <MenuItem
          selected={selectedStatus === "draft"}
          onClick={() => setSelectedStatus("draft")}
        >
          {t("lessonManagement.status.draft")}
        </MenuItem>
        <MenuItem
          selected={selectedStatus === "archived"}
          onClick={() => setSelectedStatus("archived")}
        >
          {t("lessonManagement.status.archived")}
        </MenuItem>
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
      >
        <MenuItem
          selected={selectedSort === "newest"}
          onClick={() => setSelectedSort("newest")}
        >
          {t("lessonManagement.sortBy.newest")}
        </MenuItem>
        <MenuItem
          selected={selectedSort === "oldest"}
          onClick={() => setSelectedSort("oldest")}
        >
          {t("lessonManagement.sortBy.oldest")}
        </MenuItem>
        <MenuItem
          selected={selectedSort === "title"}
          onClick={() => setSelectedSort("title")}
        >
          {t("lessonManagement.sortBy.title")}
        </MenuItem>
      </Menu>

      {/* Lesson Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => navigate(`/lessons/${selectedLesson?.id}`)}>
          <VisibilityIcon sx={{ mr: 1 }} />
          {t("lessonManagement.actions.view")}
        </MenuItem>
        <MenuItem
          onClick={() => navigate(`/lessons/${selectedLesson?.id}/edit`)}
        >
          <EditIcon sx={{ mr: 1 }} />
          {t("lessonManagement.actions.edit")}
        </MenuItem>
        <MenuItem
          onClick={() => navigate(`/lessons/${selectedLesson?.id}/assign`)}
        >
          <AssignmentIcon sx={{ mr: 1 }} />
          {t("lessonManagement.actions.assign")}
        </MenuItem>
        <MenuItem
          onClick={() => navigate(`/lessons/${selectedLesson?.id}/analytics`)}
        >
          <BarChartIcon sx={{ mr: 1 }} />
          {t("lessonManagement.actions.analytics")}
        </MenuItem>
        <MenuItem
          onClick={() => navigate(`/lessons/${selectedLesson?.id}/resources`)}
        >
          <CloudUploadIcon sx={{ mr: 1 }} />
          {t("lessonManagement.actions.resources")}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t("lessonManagement.actions.delete")}
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t("lessonManagement.deleteConfirm.title")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("lessonManagement.deleteConfirm.message", {
              title: selectedLesson?.title,
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LessonManagementScreen;
