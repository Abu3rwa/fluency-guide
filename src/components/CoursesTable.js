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
import { db } from "../frebase";
import { Link } from "react-router-dom";
import CustomSpinner from "./CustomSpinner";

const headCells = [
  { id: "title", label: "Course Title", sortable: true },
  { id: "description", label: "Description", sortable: true },
  { id: "status", label: "Status", sortable: true },
  { id: "students", label: "Students", sortable: true },
  { id: "actions", label: "Actions", sortable: false },
];

export default function CoursesTable() {
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
  const theme = useTheme();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const coursesCollection = collection(db, "courses");
      const courseSnapshot = await getDocs(coursesCollection);
      const courseList = courseSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        students: Math.floor(Math.random() * 100), // Placeholder for student count
      }));
      setCourses(courseList);
    } catch (err) {
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteClick = (course) => {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourse) return;

    try {
      const docRef = doc(db, "courses", selectedCourse.id);
      await deleteDoc(docRef);
      setCourses((prev) =>
        prev.filter((course) => course.id !== selectedCourse.id)
      );
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
    } catch (err) {
      setError("Failed to delete course");
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

  // Filter and sort courses
  const filteredCourses = courses
    .filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const isAsc = order === "asc";
      if (orderBy === "title" || orderBy === "description") {
        return isAsc
          ? a[orderBy].localeCompare(b[orderBy])
          : b[orderBy].localeCompare(a[orderBy]);
      }
      if (orderBy === "students") {
        return isAsc ? a.students - b.students : b.students - a.students;
      }
      if (orderBy === "status") {
        return isAsc
          ? (a.published ? 1 : 0) - (b.published ? 1 : 0)
          : (b.published ? 1 : 0) - (a.published ? 1 : 0);
      }
      return 0;
    });

  const paginatedCourses = filteredCourses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CustomSpinner />
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
          component={Link}
          to="/courses/create"
          startIcon={<EditIcon />}
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
            {paginatedCourses.map((course) => (
              <TableRow
                key={course.id}
                hover
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                    {course.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {course.description.substring(0, 100)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={course.published ? "Published" : "Draft"}
                    color={course.published ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {course.students} students
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        component={Link}
                        to={`/courses/${course.id}`}
                        size="small"
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredCourses.length}
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
            handleDeleteClick(selectedCourse);
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

      {error && (
        <Typography variant="body2" color="error">
          Error: &ldquo;{error.message}&rdquo;
        </Typography>
      )}
    </Box>
  );
}
