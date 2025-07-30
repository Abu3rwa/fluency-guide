import React, { useState } from "react";
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
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Stack,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Publish as PublishIcon,
  Archive as ArchiveIcon,
  Create as DraftIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import CustomSpinner from "../CustomSpinner";

const headCells = [
  { id: "title", label: "Task Title", sortable: true },
  { id: "type", label: "Type", sortable: true },
  { id: "lesson", label: "Lesson", sortable: true },
  { id: "status", label: "Status", sortable: true },
  { id: "actions", label: "Actions", sortable: false },
];

export default function TasksTable({
  tasks = [],
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) {
  const [loading, setLoading] = useState(false);
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Remove the useEffect and fetchTasks function since we're now using props

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
      if (onDeleteTask) {
        await onDeleteTask(selectedTask.id);
      }
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
        const statusA = a.status || "draft";
        const statusB = b.status || "draft";
        return isAsc
          ? statusA.localeCompare(statusB)
          : statusB.localeCompare(statusA);
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
    <Box sx={{ width: "100%", position: "relative" }}>
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
          sx={{ width: { xs: "100%", sm: 300 } }}
        />
      </Box>

      {/* Mobile Card View */}
      {isMobile ? (
        <Box>
          {paginatedTasks.map((task) => (
            <Card
              key={task.id}
              sx={{
                mb: 2,
                bgcolor: theme.palette.background.paper,
                "&:hover": {
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ pb: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                  >
                    {task.title}
                  </Typography>
                  <Tooltip title="More actions" arrow>
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Desktop-specific: prevent any layout shifts
                        if (window.innerWidth >= 960) {
                          e.stopPropagation();
                        }
                        handleMenuOpen(e, task);
                      }}
                      aria-label={`Actions for ${task.title || "task"}`}
                      size="small"
                      sx={{
                        // Desktop-specific: ensure stable positioning
                        "@media (min-width: 960px)": {
                          position: "relative",
                          zIndex: 1,
                        },
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Stack spacing={1}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Type:
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {task.type}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Lesson:
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {task.lessonTitle || "N/A"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Status:
                    </Typography>
                    {!task.id || task.id.trim() === "" ? (
                      <Chip
                        label="Invalid ID"
                        color="error"
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    ) : (
                      <Chip
                        label={task.status || "draft"}
                        color={
                          task.status === "published"
                            ? "success"
                            : task.status === "archived"
                            ? "error"
                            : "warning"
                        }
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ mt: 2 }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredTasks.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              aria-label="Table pagination"
            />
          </Box>
        </Box>
      ) : (
        /* Desktop Table View */
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: { xs: "auto", md: 600 },
            overflowX: { xs: "auto", md: "visible" },
            position: "relative",
          }}
        >
          <Table
            sx={{ minWidth: { xs: 650, md: 800 } }}
            aria-labelledby="tasks table"
          >
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sortDirection={orderBy === headCell.id ? order : false}
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      minWidth: { xs: 120, md: 150 },
                      maxWidth: { xs: 200, md: 300 },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
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
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      whiteSpace: "nowrap",
                      minWidth: { xs: 120, md: 150 },
                      maxWidth: { xs: 200, md: 300 },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {task.title}
                  </TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: "nowrap",
                      minWidth: { xs: 80, md: 100 },
                      maxWidth: { xs: 120, md: 150 },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {task.type}
                  </TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: "nowrap",
                      minWidth: { xs: 120, md: 150 },
                      maxWidth: { xs: 200, md: 300 },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {task.lessonTitle || "N/A"}
                  </TableCell>
                  <TableCell>
                    {!task.id || task.id.trim() === "" ? (
                      <Chip
                        label="Invalid ID"
                        color="error"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        label={task.status || "draft"}
                        color={
                          task.status === "published"
                            ? "success"
                            : task.status === "archived"
                            ? "error"
                            : "warning"
                        }
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ width: { xs: 60, md: 80 } }}>
                    <Tooltip title="More Actions">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Desktop-specific: prevent any layout shifts
                          if (window.innerWidth >= 960) {
                            e.stopPropagation();
                          }
                          handleMenuOpen(e, task);
                        }}
                        sx={{
                          // Desktop-specific: ensure stable positioning
                          "@media (min-width: 960px)": {
                            position: "relative",
                            zIndex: 1,
                          },
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Desktop Pagination */}
      {!isMobile && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

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
        sx={{
          "& .MuiPaper-root": {
            position: "fixed",
            zIndex: 1300,
          },
          // Desktop-specific fixes
          "@media (min-width: 960px)": {
            "& .MuiPaper-root": {
              position: "fixed",
              zIndex: 1300,
              transformOrigin: "top left",
            },
          },
        }}
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
          onClick={() => {
            if (onEditTask) {
              onEditTask(selectedTask);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Task</ListItemText>
        </MenuItem>

        {onStatusChange &&
          selectedTask?.id &&
          selectedTask.id.trim() !== "" && (
            <>
              <Divider />
              <MenuItem
                onClick={() => {
                  onStatusChange(selectedTask.id, "published");
                  handleMenuClose();
                }}
                disabled={selectedTask?.status === "published"}
              >
                <ListItemIcon>
                  <PublishIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Publish Task</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onStatusChange(selectedTask.id, "draft");
                  handleMenuClose();
                }}
                disabled={selectedTask?.status === "draft"}
              >
                <ListItemIcon>
                  <DraftIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Mark as Draft</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onStatusChange(selectedTask.id, "archived");
                  handleMenuClose();
                }}
                disabled={selectedTask?.status === "archived"}
              >
                <ListItemIcon>
                  <ArchiveIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Archive Task</ListItemText>
              </MenuItem>
            </>
          )}

        <Divider />
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
