import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Box,
  Typography,
  Chip,
  TableSortLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { enrollmentService } from "../services/enrollmentService";
import courseService from "../services/courseService";

const EnrollmentsTable = ({ enrollments, onApprove, onReject }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("enrolledAt");
  const [order, setOrder] = useState("desc");
  const [openEnrollDialog, setOpenEnrollDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [enrollingStudent, setEnrollingStudent] = useState("");

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await courseService.getAllCourses();
        setCourses(coursesData);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };

    fetchCourses();
  }, []);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleEnrollStudent = async () => {
    try {
      if (!selectedCourse || !enrollingStudent) {
        throw new Error("Please select both course and student");
      }

      const enrollmentData = {
        courseId: selectedCourse,
        studentId: enrollingStudent,
      };

      await enrollmentService.enrollStudent(enrollmentData);
      setOpenEnrollDialog(false);
      setSelectedCourse("");
      setEnrollingStudent("");
    } catch (err) {
      console.error("Error enrolling student:", err);
      alert(err.message || "Failed to enroll student");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredAndSortedEnrollments = React.useMemo(() => {
    const filtered = enrollments.filter(
      (enrollment) =>
        enrollment &&
        (enrollment.student?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          enrollment.course?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          enrollment.status?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.sort((a, b) => {
      const aValue = a[orderBy] || "";
      const bValue = b[orderBy] || "";

      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }

      return order === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [enrollments, searchTerm, order, orderBy]);

  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search enrollments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
            ),
          }}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenEnrollDialog(true)}
        >
          Enroll Student
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ boxShadow: "none", border: "1px solid", borderColor: "divider" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "student"}
                  direction={orderBy === "student" ? order : "asc"}
                  onClick={() => handleRequestSort("student")}
                >
                  Student
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "course"}
                  direction={orderBy === "course" ? order : "asc"}
                  onClick={() => handleRequestSort("course")}
                >
                  Course
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={orderBy === "status" ? order : "asc"}
                  onClick={() => handleRequestSort("status")}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "enrolledAt"}
                  direction={orderBy === "enrolledAt" ? order : "asc"}
                  onClick={() => handleRequestSort("enrolledAt")}
                >
                  Enrolled Date
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedEnrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">
                    No enrollments found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>{enrollment.student?.name}</TableCell>
                  <TableCell>{enrollment.course?.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={enrollment.status}
                      color={getStatusColor(enrollment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(enrollment.enrolledAt)}</TableCell>
                  <TableCell>
                    {enrollment.status === "pending" && (
                      <Box>
                        <IconButton
                          color="success"
                          onClick={() => onApprove(enrollment.id)}
                          size="small"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => onReject(enrollment.id)}
                          size="small"
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openEnrollDialog}
        onClose={() => setOpenEnrollDialog(false)}
      >
        <DialogTitle>Enroll Student in Course</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Course</InputLabel>
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                label="Course"
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Student ID"
              value={enrollingStudent}
              onChange={(e) => setEnrollingStudent(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEnrollDialog(false)}>Cancel</Button>
          <Button onClick={handleEnrollStudent} variant="contained">
            Enroll
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnrollmentsTable;
