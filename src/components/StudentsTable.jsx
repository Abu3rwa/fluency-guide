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
  Typography,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  TablePagination,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Divider,
} from "@mui/material";
import userService from "../services/userService";

export default function StudentsTable() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [editStudent, setEditStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const users = await userService.getUsersByRole("isStudent");
      setStudents(users);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateStudent = async () => {
    if (!newStudent.displayName || !newStudent.email || !newStudent.password) {
      return;
    }
    setActionLoading(true);
    try {
      await userService.signUpWithEmail(newStudent.email, newStudent.password);
      await userService.createOrUpdateUser({
        uid: undefined,
        email: newStudent.email,
        displayName: newStudent.displayName,
        isStudent: true,
      });
      setCreateDialogOpen(false);
      setNewStudent({ displayName: "", email: "", password: "" });
      fetchStudents();
    } catch (err) {
      console.error("Failed to create student:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    setEditStudent({ ...student });
    setEditDialogOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!editStudent.displayName || !editStudent.email) {
      return;
    }
    setActionLoading(true);
    try {
      await userService.updateUserProfile(editStudent.id, {
        displayName: editStudent.displayName,
        email: editStudent.email,
      });
      setEditDialogOpen(false);
      setEditStudent(null);
      fetchStudents();
    } catch (err) {
      console.error("Failed to update student:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    setActionLoading(true);
    try {
      await userService.updateUserProfile(selectedStudent.id, {
        isStudent: false,
      });
      setDeleteDialogOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      console.error("Failed to delete student:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSuspend = async (student) => {
    try {
      await userService.updateUserProfile(student.id, {
        suspended: !student.suspended,
      });
      fetchStudents();
    } catch (error) {
      console.error("Failed to update student status:", error);
    }
  };

  // Filter students
  const filteredStudents = students.filter(
    (student) =>
      (student.displayName?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (student.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  // Paginate students
  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading students...</Typography>
      </Box>
    );
  }

  // Mobile card view
  const renderMobileView = () => (
    <Box sx={{ width: "100%" }}>
      {paginatedStudents.map((student) => (
        <Card key={student.id} sx={{ mb: 2, mx: 1 }}>
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" component="div">
                  {student.displayName || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.email || "N/A"}
                </Typography>
              </Box>

              <Box>
                <Chip
                  label={student.suspended ? "Suspended" : "Active"}
                  color={student.suspended ? "error" : "success"}
                  size="small"
                />
              </Box>

              <Divider />

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth={isMobile}
                  onClick={() => handleEditStudent(student)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  fullWidth={isMobile}
                  onClick={() => handleDeleteClick(student)}
                >
                  Delete
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth={isMobile}
                  onClick={() => handleToggleSuspend(student)}
                >
                  {student.suspended ? "Unsuspend" : "Suspend"}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  // Desktop table view
  const renderDesktopView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ minWidth: 150 }}>Name</TableCell>
            <TableCell sx={{ minWidth: 200 }}>Email</TableCell>
            <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
            <TableCell sx={{ minWidth: 200 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedStudents.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.displayName || "N/A"}</TableCell>
              <TableCell>{student.email || "N/A"}</TableCell>
              <TableCell>
                <Chip
                  label={student.suspended ? "Suspended" : "Active"}
                  color={student.suspended ? "error" : "success"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleEditStudent(student)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteClick(student)}
                  >
                    Delete
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleToggleSuspend(student)}
                  >
                    {student.suspended ? "Unsuspend" : "Suspend"}
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          mb: 3,
          gap: isMobile ? 2 : 0,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontSize: isMobile ? "1.1rem" : "1.25rem",
              fontWeight: 600,
              mb: isMobile ? 0.5 : 0,
            }}
          >
            Students ({filteredStudents.length})
          </Typography>
          {isMobile && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.875rem" }}
            >
              Manage your student accounts
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          onClick={() => setCreateDialogOpen(true)}
          fullWidth={isMobile}
          sx={{
            minHeight: isMobile ? "44px" : "40px",
            fontSize: isMobile ? "0.875rem" : "0.875rem",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: isMobile ? 3 : 4,
            py: isMobile ? 1.5 : 2,
            boxShadow: 2,
            "&:hover": {
              boxShadow: 4,
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          Add Student
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search students by name or email..."
          value={searchQuery}
          onChange={handleSearch}
          fullWidth={isMobile}
          sx={{
            width: isMobile ? "100%" : 350,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "background.paper",
              "&:hover": {
                backgroundColor: "action.hover",
              },
              "&.Mui-focused": {
                backgroundColor: "background.paper",
              },
            },
            "& .MuiOutlinedInput-input": {
              fontSize: isMobile ? "0.875rem" : "0.875rem",
              padding: isMobile ? "12px 14px" : "14px 16px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "divider",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
            },
          }}
        />
      </Box>

      {/* Content */}
      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* Pagination */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
          labelDisplayedRows={
            isMobile
              ? ({ from, to, count }) => `${from}-${to} of ${count}`
              : ({ from, to, count }) =>
                  `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      </Box>

      {/* Create Student Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        fullWidth
        maxWidth={isMobile ? "sm" : "md"}
      >
        <DialogTitle>Add Student</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            type="text"
            fullWidth
            value={newStudent.displayName}
            onChange={(e) =>
              setNewStudent({ ...newStudent, displayName: e.target.value })
            }
            disabled={actionLoading}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newStudent.email}
            onChange={(e) =>
              setNewStudent({ ...newStudent, email: e.target.value })
            }
            disabled={actionLoading}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newStudent.password}
            onChange={(e) =>
              setNewStudent({ ...newStudent, password: e.target.value })
            }
            disabled={actionLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateStudent}
            color="primary"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth={isMobile ? "sm" : "md"}
      >
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            type="text"
            fullWidth
            value={editStudent?.displayName || ""}
            onChange={(e) =>
              setEditStudent({ ...editStudent, displayName: e.target.value })
            }
            disabled={actionLoading}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={editStudent?.email || ""}
            onChange={(e) =>
              setEditStudent({ ...editStudent, email: e.target.value })
            }
            disabled={actionLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialogOpen(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStudent}
            color="primary"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth
        maxWidth={isMobile ? "sm" : "md"}
      >
        <DialogTitle>Delete Student</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &ldquo;
            {selectedStudent?.displayName}&rdquo;? This action cannot be undone.
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
    </Box>
  );
}
