import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const StudentTrueFalseQuestionCard = ({ question }) => {
  const theme = useTheme();
  return (
    <Card
      elevation={3}
      sx={{
        mb: 4,
        borderRadius: 2,
        overflow: "visible",
        background: theme.palette.background.paper,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 500, textAlign: "center", mb: 2 }}
          dir="auto"
        >
          {question.text}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", fontStyle: "italic" }}
          dir="auto"
        >
          Is this statement true or false?
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StudentTrueFalseQuestionCard;
