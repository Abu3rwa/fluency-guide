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
  Avatar,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../frebase";
import CustomSpinner from "./CustomSpinner";

const headCells = [
  { id: "name", label: "Student Name", sortable: true },
  { id: "email", label: "Email", sortable: true },
  { id: "courses", label: "Enrolled Courses", sortable: true },
  { id: "status", label: "Status", sortable: true },
  { id: "actions", label: "Actions", sortable: false },
];

export default function StudentsTable() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // Simulated API call - replace with actual Firestore query
      const studentsCollection = collection(db, "students");
      const studentSnapshot = await getDocs(studentsCollection);
      const studentList = studentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        courses: Math.floor(Math.random() * 5), // Placeholder for enrolled courses
      }));
      setStudents(studentList);
    } catch (err) {
      setError("Failed to fetch students");
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

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;

    try {
      const docRef = doc(db, "students", selectedStudent.id);
      await deleteDoc(docRef);
      setStudents((prev) =>
        prev.filter((student) => student.id !== selectedStudent.id)
      );
      setDeleteDialogOpen(false);
      setSelectedStudent(null);
    } catch (err) {
      setError("Failed to delete student");
    }
  };

  const handleToggleSuspend = async (student) => {
    try {
      const docRef = doc(db, "students", student.id);
      await updateDoc(docRef, {
        suspended: !student.suspended,
      });
      setStudents(
        students.map((s) =>
          s.id === student.id ? { ...s, suspended: !s.suspended } : s
        )
      );
    } catch (error) {
      setError("Failed to update student status");
    }
  };

  const handleMenuOpen = (event, student) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStudent(null);
  };

  // Filter and sort students
  const filteredStudents = students
    .filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const isAsc = order === "asc";
      if (orderBy === "name" || orderBy === "email") {
        return isAsc
          ? a[orderBy].localeCompare(b[orderBy])
          : b[orderBy].localeCompare(a[orderBy]);
      }
      if (orderBy === "courses") {
        return isAsc ? a.courses - b.courses : b.courses - a.courses;
      }
      if (orderBy === "status") {
        return isAsc
          ? (a.suspended ? 1 : 0) - (b.suspended ? 1 : 0)
          : (b.suspended ? 1 : 0) - (a.suspended ? 1 : 0);
      }
      return 0;
    });

  const paginatedStudents = filteredStudents.slice(
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
          placeholder="Search students..."
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
        <Button variant="contained" color="primary" startIcon={<PersonIcon />}>
          Add Student
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 750 }} aria-labelledby="students table">
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
            {paginatedStudents.map((student) => (
              <TableRow
                key={student.id}
                hover
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  opacity: student.suspended ? 0.7 : 1,
                }}
              >
                <TableCell component="th" scope="row">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "medium" }}
                    >
                      {student.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EmailIcon color="action" fontSize="small" />
                    <Typography variant="body2">{student.email}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SchoolIcon color="action" fontSize="small" />
                    <Typography variant="body2">
                      {student.courses} courses
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={student.suspended ? "Suspended" : "Active"}
                    color={student.suspended ? "error" : "success"}
                    size="small"
                    icon={
                      student.suspended ? <BlockIcon /> : <CheckCircleIcon />
                    }
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More Actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, student)}
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
        count={filteredStudents.length}
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
        <DialogTitle>Delete Student</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &ldquo;{selectedStudent?.name}
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

      {/* Student Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Details</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleToggleSuspend(selectedStudent);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            {selectedStudent?.suspended ? (
              <CheckCircleIcon fontSize="small" color="success" />
            ) : (
              <BlockIcon fontSize="small" color="error" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedStudent?.suspended
              ? "Unsuspend Student"
              : "Suspend Student"}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteClick(selectedStudent);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Student</ListItemText>
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
