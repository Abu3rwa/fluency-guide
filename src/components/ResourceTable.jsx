import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TablePagination,
  Skeleton,
  Typography,
  Box,
  Tooltip,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const ResourceTable = ({
  data,
  columns,
  onAction,
  getStatusColor,
  additionalData = {},
  loading = false,
  emptyMessage = "No data available",
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <TableContainer
        component={Paper}
        sx={{ bgcolor: theme.palette.background.paper }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id}>
                  <Skeleton variant="text" width="60%" />
                </TableCell>
              ))}
              <TableCell>
                <Skeleton variant="text" width="40%" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((col) => (
                  <TableCell key={col.id}>
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                ))}
                <TableCell>
                  <Skeleton variant="circular" width={24} height={24} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (data.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          textAlign: "center",
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <Box>
        {paginatedData.map((item) => (
          <Card
            key={item.id}
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
                  {item.title || item.name || "Untitled"}
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
                      onAction(e, item);
                    }}
                    aria-label={`Actions for ${
                      item.title || item.name || "item"
                    }`}
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
                {columns.map((col) => {
                  if (col.id === "status") return null; // Status will be shown separately

                  const value = col.render
                    ? col.render(item, additionalData)
                    : item[col.id] || "-";

                  return (
                    <Box
                      key={col.id}
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {col.label}:
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {value}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>

            <Divider />

            <CardActions sx={{ px: 2, py: 1, justifyContent: "space-between" }}>
              {columns.find((col) => col.id === "status") && (
                <Chip
                  label={item.status}
                  color={getStatusColor(item.status)}
                  size="small"
                  aria-label={`Status: ${item.status}`}
                  sx={{ fontWeight: 500 }}
                />
              )}
            </CardActions>
          </Card>
        ))}

        <Box sx={{ mt: 2 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            aria-label="Table pagination"
          />
        </Box>
      </Box>
    );
  }

  return (
    <Paper
      sx={{ bgcolor: theme.palette.background.paper, position: "relative" }}
    >
      <TableContainer
        sx={{
          maxHeight: { xs: "auto", md: 600 },
          overflowX: { xs: "auto", md: "visible" },
        }}
      >
        <Table
          aria-label="Resource table"
          sx={{ minWidth: { xs: 650, md: 800 } }}
        >
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  aria-label={`Column ${col.label}`}
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    whiteSpace: "nowrap",
                    minWidth: { xs: 120, md: 150 },
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
              <TableCell
                aria-label="Actions"
                sx={{
                  bgcolor: theme.palette.background.paper,
                  width: { xs: 60, md: 80 },
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow
                key={item.id}
                hover
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{
                      whiteSpace: "nowrap",
                      maxWidth: { xs: 120, md: 200 },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {col.id === "status" ? (
                      <Chip
                        label={item.status}
                        color={getStatusColor(item.status)}
                        size="small"
                        aria-label={`Status: ${item.status}`}
                        sx={{ fontWeight: 500 }}
                      />
                    ) : col.render ? (
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col.render(item, additionalData)}
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item[col.id] || "-"}
                      </Typography>
                    )}
                  </TableCell>
                ))}
                <TableCell sx={{ width: { xs: 60, md: 80 } }}>
                  <Tooltip title="More actions" arrow>
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Desktop-specific: prevent any layout shifts
                        if (window.innerWidth >= 960) {
                          e.stopPropagation();
                        }
                        onAction(e, item);
                      }}
                      aria-label={`Actions for ${
                        item.title || item.name || "item"
                      }`}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        aria-label="Table pagination"
        sx={{
          ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
            {
              fontSize: { xs: "0.875rem", md: "1rem" },
            },
        }}
      />
    </Paper>
  );
};

export default React.memo(ResourceTable);
