import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import paymentService from "../services/paymentService";
import { enrollmentService } from "../services/enrollmentService";

const PaymentsTable = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log("Fetching payments...");

      // First try to get all payments to see if collection exists
      const allPayments = await paymentService.getAllPayments();
      console.log("All payments:", allPayments);

      // Then get pending payments
      const pendingPayments = await paymentService.getPendingPayments();
      console.log("Pending payments:", pendingPayments);

      setPayments(pendingPayments || []);
      setError("");
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(`Failed to load payments: ${err.message || "Unknown error"}`);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setViewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedPayment) return;

    setProcessing(true);
    try {
      await paymentService.updatePaymentStatus(
        selectedPayment.id,
        "approved",
        adminNotes
      );
      await enrollmentService.approveEnrollment(selectedPayment.enrollmentId);
      setApproveDialogOpen(false);
      setAdminNotes("");
      setSelectedPayment(null);
      await fetchPayments(); // Refresh the list
    } catch (err) {
      setError("Failed to approve payment");
      console.error("Error approving payment:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment) return;

    setProcessing(true);
    try {
      await paymentService.updatePaymentStatus(
        selectedPayment.id,
        "rejected",
        adminNotes
      );
      await enrollmentService.rejectEnrollment(selectedPayment.enrollmentId);
      setRejectDialogOpen(false);
      setAdminNotes("");
      setSelectedPayment(null);
      await fetchPayments(); // Refresh the list
    } catch (err) {
      setError("Failed to reject payment");
      console.error("Error rejecting payment:", err);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
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
      <Typography variant="h5" gutterBottom>
        Pending Payments
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
              <TableCell>Amount</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No pending payments found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {payment.studentName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {payment.studentId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {payment.courseTitle}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      ${payment.amount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {payment.referenceNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(payment.submittedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      color={getStatusColor(payment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewPayment(payment)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setApproveDialogOpen(true);
                        }}
                        color="success"
                      >
                        <ApproveIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setRejectDialogOpen(true);
                        }}
                        color="error"
                      >
                        <RejectIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Payment Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Payment Information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Student:</strong> {selectedPayment.studentName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Course:</strong> {selectedPayment.courseTitle}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Amount:</strong> ${selectedPayment.amount}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Reference:</strong>{" "}
                      {selectedPayment.referenceNumber}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Submitted:</strong>{" "}
                      {formatDate(selectedPayment.submittedAt)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Bank Information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Bank:</strong>{" "}
                      {selectedPayment.bankInfo?.bankName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Account:</strong>{" "}
                      {selectedPayment.bankInfo?.accountNumber}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Swift:</strong>{" "}
                      {selectedPayment.bankInfo?.swiftCode}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {selectedPayment.receiptUrl && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Receipt
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        href={selectedPayment.receiptUrl}
                        target="_blank"
                      >
                        View Receipt
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Payment Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Payment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to approve this payment? This will activate
            the student's enrollment.
          </Typography>
          <TextField
            fullWidth
            label="Admin Notes (Optional)"
            multiline
            rows={3}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add any notes about this approval..."
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setApproveDialogOpen(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {processing ? "Approving..." : "Approve Payment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Payment Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Payment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to reject this payment? Please provide a
            reason.
          </Typography>
          <TextField
            fullWidth
            label="Rejection Reason *"
            multiline
            rows={3}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRejectDialogOpen(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={processing || !adminNotes.trim()}
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {processing ? "Rejecting..." : "Reject Payment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentsTable;
