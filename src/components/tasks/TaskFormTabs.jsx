import React, { useState } from "react";
import { Tabs, Tab, Box, Snackbar, Alert } from "@mui/material";
import MultipleChoiceForm from "./forms/MultipleChoiceForm";
import FillInBlanksForm from "./forms/fillInBlanksForm";
import TrueFalseForm from "./forms/TrueFalseForm";
// import ShortAnswerTaskForm from "./forms/ShortAnswerForm";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const TaskFormTabs = ({ courseId, lessonId }) => {
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={tab} onChange={handleTabChange} aria-label="Task Type Tabs">
        <Tab label="Multiple Choice" />
        <Tab label="Fill in the Blanks" />
        <Tab label="True/False" />
      </Tabs>
      <TabPanel value={tab} index={0}>
        <MultipleChoiceForm courseId={courseId} lessonId={lessonId} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <FillInBlanksForm courseId={courseId} lessonId={lessonId} />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <TrueFalseForm courseId={courseId} lessonId={lessonId} />
      </TabPanel>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskFormTabs;
