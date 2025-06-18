import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { enrollmentService } from "../services/enrollmentService";

const PendingEnrollments = () => {
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingEnrollments();
  }, []);

  const fetchPendingEnrollments = async () => {
    try {
      setLoading(true);
      const enrollments = await enrollmentService.getAllEnrollments();
      const pending = enrollments.filter(
        (enrollment) => enrollment.status === "pending"
      );
      setPendingEnrollments(pending);
      setError(null);
    } catch (err) {
      console.error("Error fetching pending enrollments:", err);
      setError("Failed to load pending enrollments");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId) => {
    try {
      await enrollmentService.updateEnrollmentStatus(enrollmentId, "active");
      await fetchPendingEnrollments();
    } catch (err) {
      console.error("Error approving enrollment:", err);
      setError("Failed to approve enrollment");
    }
  };

  const handleReject = async (enrollmentId) => {
    try {
      await enrollmentService.updateEnrollmentStatus(enrollmentId, "rejected");
      await fetchPendingEnrollments();
    } catch (err) {
      console.error("Error rejecting enrollment:", err);
      setError("Failed to reject enrollment");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pending Enrollments
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Requested At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingEnrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No pending enrollments
                </TableCell>
              </TableRow>
            ) : (
              pendingEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>{enrollment.student?.name || "Unknown"}</TableCell>
                  <TableCell>{enrollment.course?.title || "Unknown"}</TableCell>
                  <TableCell>
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={enrollment.status}
                      color="warning"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleApprove(enrollment.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleReject(enrollment.id)}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PendingEnrollments;
