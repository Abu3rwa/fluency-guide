import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Stack,
  Button,
  useTheme,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
// import { format } from 'date-fns';

const LessonCard = ({ lesson, onMenuClick }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            {lesson.title}
          </Typography>
          <IconButton size="small" onClick={(e) => onMenuClick(e, lesson)}>
            <MoreVertIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {lesson.description}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2 }}
          flexWrap="wrap"
          useFlexGap
        >
          <Chip
            label={t(`lessonManagement.status.${lesson.status}`)}
            color={getStatusColor(lesson.status)}
            size="small"
          />
          <Chip
            label={`${lesson.duration} min`}
            variant="outlined"
            size="small"
          />
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 2, display: "block" }}
        >
          {t("lessonManagement.lastUpdated")}:{" "}
          {lesson.updatedAt.toDate().toLocaleDateString()}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => navigate(`/lessons/${lesson.id}`)}
          fullWidth
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default LessonCard;
