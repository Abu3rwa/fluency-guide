import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon,
  Book as BookIcon,
} from "@mui/icons-material";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Link } from "react-router-dom";
import courseService from "../../services/courseService";
import CourseDialog from "./CourseDialog";
import { useTranslation } from "react-i18next";

const headCells = [
  { id: "title", label: "Course Title", sortable: true },
  { id: "level", label: "Level", sortable: true },
  { id: "students", label: "Students", sortable: true },
  { id: "price", label: "Price", sortable: true },
  { id: "status", label: "Status", sortable: true },
  { id: "actions", label: "Actions", sortable: false },
];

export default function CoursesTable() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("title");
  const [order, setOrder] = useState("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const theme = useTheme();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      console.log("Fetched courses:", data);
      setCourses(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await courseService.deleteCourse(courseId);
        setCourses(courses.filter((course) => course.id !== courseId));
      } catch (err) {
        console.error("Error deleting course:", err);
      } finally {
        setDeleteDialogOpen(false);
        setSelectedCourse(null);
      }
    }
  };

  const handlePublish = async (course) => {
    try {
      const courseRef = doc(db, "courses", course.id);
      await updateDoc(courseRef, {
        published: !course.published,
      });
      setCourses(
        courses.map((c) =>
          c.id === course.id ? { ...c, published: !c.published } : c
        )
      );
    } catch (error) {
      setError("Failed to update course status");
    }
  };

  const handleMenuOpen = (event, course) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const descendingComparator = (a, b, orderBy) => {
    const aValue = a[orderBy] || ""; // Provide default empty string
    const bValue = b[orderBy] || ""; // Provide default empty string

    if (typeof aValue === "number" && typeof bValue === "number") {
      return bValue - aValue;
    }

    return String(bValue).localeCompare(String(aValue));
  };

  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const filteredAndSortedCourses = React.useMemo(() => {
    const filtered = courses.filter(
      (course) =>
        course &&
        (course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.level?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return filtered.sort(getComparator(order, orderBy));
  }, [courses, searchQuery, order, orderBy]);

  const paginatedCourses = filteredAndSortedCourses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleCreateCourse = async (courseData) => {
    try {
      const newCourse = await courseService.createCourse(courseData);
      setCourses([...courses, newCourse]);
      setOpenCourseDialog(false);
    } catch (err) {
      console.error("Error creating course:", err);
      setError("Failed to create course");
    }
  };

  const handleEdit = () => {
    handleMenuClose();
    setEditDialogOpen(true);
  };

  const handleEditSave = async (updatedData) => {
    try {
      setLoading(true);
      const updatedCourse = await courseService.updateCourse(
        selectedCourse.id,
        updatedData
      );

      // Update the courses list with the new data
      setCourses(
        courses.map((course) =>
          course.id === selectedCourse.id
            ? { ...course, ...updatedCourse }
            : course
        )
      );
    } catch (error) {
      console.error("Error updating course:", error);
      setError("Failed to update course");
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
      setSelectedCourse(null);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await courseService.deleteCourse(selectedCourse.id);
      fetchCourses();
    } catch (error) {
      setError("Failed to delete course");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => setOpenCourseDialog(true)}
        >
          Create Course
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 750 }} aria-labelledby="courses table">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    fontWeight: "bold",
                  }}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">
                    No courses found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCourses.map((course) => (
                <TableRow
                  key={course.id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "medium" }}
                    >
                      {course.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={course.level}
                      color={
                        course.level === "Beginner"
                          ? "success"
                          : course.level === "Intermediate"
                          ? "warning"
                          : "error"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {course.students} students
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">${course.price}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={course.published ? "Published" : "Draft"}
                      color={course.published ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          component={Link}
                          to={`/courses/${course.id}`}
                          size="small"
                          onClick={() =>
                            console.log(
                              "Course ID:",
                              course.id,
                              "Course:",
                              course
                            )
                          }
                          disabled={!course.id}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="More Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, course)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredAndSortedCourses.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &ldquo;{selectedCourse?.title}
            &rdquo;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Course Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          component={Link}
          to={`/courses/${selectedCourse?.id}`}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          to={`/courses/${selectedCourse?.id}`}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <BookIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Course Details</ListItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          to={`/courses/edit/${selectedCourse?.id}`}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Course</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handlePublish(selectedCourse);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            {selectedCourse?.published ? (
              <UnpublishedIcon fontSize="small" />
            ) : (
              <PublishIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedCourse?.published ? "Unpublish" : "Publish"}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDelete(selectedCourse.id);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Course</ListItemText>
        </MenuItem>
      </Menu>

      <CourseDialog
        open={openCourseDialog}
        onClose={() => setOpenCourseDialog(false)}
        onSave={handleCreateCourse}
      />

      {/* Edit Course Dialog */}
      <CourseDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedCourse(null);
        }}
        onSave={handleEditSave}
        initialData={selectedCourse}
        mode="edit"
      />
    </Box>
  );
}
