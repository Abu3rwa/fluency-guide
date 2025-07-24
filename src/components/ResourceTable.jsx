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

  return (
    <Paper sx={{ bgcolor: theme.palette.background.paper }}>
      <TableContainer>
        <Table aria-label="Resource table">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  aria-label={`Column ${col.label}`}
                  sx={{ bgcolor: theme.palette.background.paper }}
                >
                  {col.label}
                </TableCell>
              ))}
              <TableCell
                aria-label="Actions"
                sx={{ bgcolor: theme.palette.background.paper }}
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
                  <TableCell key={col.id}>
                    {col.id === "status" ? (
                      <Chip
                        label={item.status}
                        color={getStatusColor(item.status)}
                        size="small"
                        aria-label={`Status: ${item.status}`}
                        sx={{ fontWeight: 500 }}
                      />
                    ) : col.render ? (
                      col.render(item, additionalData)
                    ) : (
                      <Typography variant="body2">
                        {item[col.id] || "-"}
                      </Typography>
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <Tooltip title="More actions" arrow>
                    <IconButton
                      onClick={(e) => onAction(e, item)}
                      aria-label={`Actions for ${
                        item.title || item.name || "item"
                      }`}
                      size="small"
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
      />
    </Paper>
  );
};

export default React.memo(ResourceTable);
