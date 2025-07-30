import React, { useState, useEffect } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import EnrollmentsTable from "../components/EnrollmentsTable";
import PendingEnrollments from "../components/PendingEnrollments";
import { enrollmentService } from "../services/enrollmentService";
import ConfirmationDialog from "../components/ConfirmationDialog";

const Enrollments = () => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [dialogAction, setDialogAction] = useState(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const enrollmentsData = await enrollmentService.getAllEnrollments();
        setEnrollments(enrollmentsData);
      } catch (err) {
        console.error("Error fetching enrollments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const handleApprove = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setDialogAction("approve");
    setDialogOpen(true);
  };

  const handleReject = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setDialogAction("reject");
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (dialogAction === "approve") {
      await enrollmentService.approveEnrollment(selectedEnrollment.id);
    } else if (dialogAction === "reject") {
      await enrollmentService.rejectEnrollment(selectedEnrollment.id);
    }
    const enrollmentsData = await enrollmentService.getAllEnrollments();
    setEnrollments(enrollmentsData);
    setDialogOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Course Enrollments
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage student enrollments in courses, track progress, and handle status
        updates.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="All Enrollments" />
          <Tab label="Pending Requests" />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <EnrollmentsTable
          enrollments={enrollments}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ) : (
        <PendingEnrollments />
      )}
      <ConfirmationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirm}
        title={dialogAction === "approve" ? "Approve Enrollment" : "Reject Enrollment"}
        message={`Are you sure you want to ${dialogAction} this enrollment?`}
      />
    </Box>
  );
};

export default Enrollments;
