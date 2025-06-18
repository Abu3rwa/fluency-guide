import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Stack,
  Paper,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const LessonCard = ({ lesson, onEdit, onDelete, onCreateTask }) => {
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        mb: 2,
        boxShadow: 2,
        "&:hover": {
          boxShadow: 4,
        },
        transition: "box-shadow 0.3s ease-in-out",
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* Header Section */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
              pb: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <AssignmentIcon color="primary" />
              <Box>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ fontWeight: "bold" }}
                >
                  {lesson.title}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              <Chip
                label={`${lesson.duration} ${t("courses.lessons.minutes")}`}
                color="primary"
                size="small"
                sx={{ fontWeight: "medium" }}
              />
              <Chip
                label={t(`courses.lessons.status${lesson.status}`)}
                color="warning"
                size="small"
                sx={{ fontWeight: "medium" }}
              />
            </Box>

            {/* Action Buttons */}
            <Box
              display="flex"
              justifyContent="flex-end"
              gap={1}
              sx={{
                borderTop: "1px solid",
                borderColor: "divider",
                pt: 2,
              }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<AssignmentIcon />}
                onClick={onCreateTask}
              >
                {t("tasks.createTask")}
              </Button>
              <IconButton
                onClick={() => onEdit(lesson.id)}
                size="small"
                title={t("courses.lessons.editLesson")}
                sx={{
                  color: "primary.main",
                  "&:hover": { backgroundColor: "primary.lighter" },
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => onDelete(lesson.id)}
                size="small"
                color="error"
                title={t("courses.lessons.deleteLesson")}
                sx={{
                  "&:hover": { backgroundColor: "error.lighter" },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LessonCard;
