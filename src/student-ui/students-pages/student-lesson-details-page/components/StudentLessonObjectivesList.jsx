import React from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const StudentLessonObjectivesList = ({ objectives }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!objectives || objectives.length === 0) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
        <Typography color="text.secondary" variant="body2">
          {t("lessonDetails.noObjectives")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
      <Typography
        variant="h6"
        sx={{
          mb: 1,
          fontFamily: theme.typography.h6.fontFamily,
          fontSize: { xs: "1rem", md: "1.2rem" },
        }}
      >
        {t("lessonDetails.objectives")}
      </Typography>
      <List>
        {objectives.map((obj, idx) => (
          <ListItem key={idx} sx={{ pl: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={obj}
              primaryTypographyProps={{
                fontFamily: theme.typography.body1.fontFamily,
                color: theme.palette.text.primary,
                fontSize: { xs: "0.95rem", md: "1.05rem" },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default StudentLessonObjectivesList;
