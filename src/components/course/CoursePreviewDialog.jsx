import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const CoursePreviewDialog = ({ open, onClose, course }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!course) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("courses.preview.title")}</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label={t("courses.preview.overview")} />
            <Tab label={t("courses.preview.modules")} />
            <Tab label={t("courses.preview.requirements")} />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">{course.title}</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {course.description}
            </Typography>
          </Box>
        )}

        {activeTab === 1 && (
          <List>
            {course.modules?.map((module) => (
              <React.Fragment key={module.id}>
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={module.title}
                    secondary={module.description}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}

        {activeTab === 2 && (
          <List>
            {course.requirements?.map((req, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {req.type === "quiz" ? <QuizIcon /> : <AssignmentIcon />}
                </ListItemIcon>
                <ListItemText primary={req.title} secondary={req.description} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CoursePreviewDialog;
