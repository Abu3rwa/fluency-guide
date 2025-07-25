import React from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

const StudentLessonSkillsSection = ({ skills }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  if (!skills || skills.length === 0) {
    return null;
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
        {t("lessonDetails.skills")}
      </Typography>
      <List>
        {skills.map((item, idx) => (
          <ListItem key={idx} sx={{ pl: 0 }}>
            <ListItemText
              primary={item}
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
export default StudentLessonSkillsSection;
