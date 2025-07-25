import React from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Link from "@mui/material/Link";
import DownloadIcon from "@mui/icons-material/Download";

const StudentLessonResourcesPanel = ({ resources }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!resources || resources.length === 0) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
        <Typography color="text.secondary" variant="body2">
          {t("lessonDetails.noResources")}
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
        {t("lessonDetails.resources")}
      </Typography>
      <List>
        {resources.map((res, idx) => (
          <ListItem key={idx} sx={{ pl: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <DownloadIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Link
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  sx={{
                    fontFamily: theme.typography.body1.fontFamily,
                    fontSize: { xs: "0.95rem", md: "1.05rem" },
                  }}
                >
                  {res.name || res.label || t("lessonDetails.resource")}
                </Link>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
export default StudentLessonResourcesPanel;
