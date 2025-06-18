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
  Assignment as AssignmentIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Link } from "react-router-dom";
import CustomSpinner from "../CustomSpinner";

const headCells = [
  { id: "title", label: "Task Title", sortable: true },
  { id: "type", label: "Type", sortable: true },
  { id: "lesson", label: "Lesson", sortable: true },
  { id: "status", label: "Status", sortable: true },
  { id: "actions", label: "Actions", sortable: false },
];

export default function TasksTable() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("title");
  const [order, setOrder] = useState("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const tasksCollection = collection(db, "tasks");
      const taskSnapshot = await getDocs(tasksCollection);
      const taskList = await Promise.all(
        taskSnapshot.docs.map(async (doc) => {
          const taskData = doc.data();
          // Fetch lesson title if lessonId exists
          let lessonTitle = "N/A";
          if (taskData.lessonId) {
            const lessonDoc = await getDocs(
              query(
                collection(db, "english_lessons"),
                where("id", "==", taskData.lessonId)
              )
            );
            if (!lessonDoc.empty) {
              lessonTitle = lessonDoc.docs[0].data().title;
            }
          }
          return {
            id: doc.id,
            ...taskData,
            lessonTitle,
          };
        })
      );
      setTasks(taskList);
    } catch (err) {
      setError("Failed to fetch tasks");
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

  const handleDeleteClick = (task) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTask) return;

    try {
      const docRef = doc(db, "tasks", selectedTask.id);
      await deleteDoc(docRef);
      setTasks((prev) => prev.filter((task) => task.id !== selectedTask.id));
      setDeleteDialogOpen(false);
      setSelectedTask(null);
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  const handleMenuOpen = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const isAsc = order === "asc";
      if (orderBy === "title" || orderBy === "type" || orderBy === "lesson") {
        return isAsc
          ? a[orderBy === "lesson" ? "lessonTitle" : orderBy].localeCompare(
              b[orderBy === "lesson" ? "lessonTitle" : orderBy]
            )
          : b[orderBy === "lesson" ? "lessonTitle" : orderBy].localeCompare(
              a[orderBy === "lesson" ? "lessonTitle" : orderBy]
            );
      }
      if (orderBy === "status") {
        return isAsc
          ? (a.completed ? 1 : 0) - (b.completed ? 1 : 0)
          : (b.completed ? 1 : 0) - (a.completed ? 1 : 0);
      }
      return 0;
    });

  const paginatedTasks = filteredTasks.slice(
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
          placeholder="Search tasks..."
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
          to="/tasks/create"
          startIcon={<AddIcon />}
        >
          Create Task
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 750 }} aria-labelledby="tasks table">
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
            {paginatedTasks.map((task) => (
              <TableRow
                key={task.id}
                hover
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                    {task.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.type.replace(/_/g, " ").toUpperCase()}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {task.lessonTitle}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.completed ? "Completed" : "Pending"}
                    color={task.completed ? "success" : "warning"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        component={Link}
                        to={`/tasks/${task.id}`}
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More Actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, task)}
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
        count={filteredTasks.length}
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
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &ldquo;{selectedTask?.title}&rdquo;?
            This action cannot be undone.
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

      {/* Task Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          component={Link}
          to={`/tasks/${selectedTask?.id}`}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          to={`/tasks/edit/${selectedTask?.id}`}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Task</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteClick(selectedTask);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Task</ListItemText>
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
