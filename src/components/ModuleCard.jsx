import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const ModuleCard = ({ module, onEdit, onDelete }) => {
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
              <SchoolIcon color="primary" />
              <Typography
                variant="h6"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                {module.title}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Chip
                label={t(`courses.modules.difficulty${module.difficulty}`)}
                color="primary"
                size="small"
                sx={{ fontWeight: "medium" }}
              />
              <Chip
                label={t(`courses.modules.status${module.status}`)}
                color="warning"
                size="small"
                sx={{ fontWeight: "medium" }}
              />
            </Box>
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
              <IconButton
                onClick={() => onEdit(module.id)}
                size="small"
                title={t("courses.modules.editModule")}
                sx={{
                  color: "primary.main",
                  "&:hover": { backgroundColor: "primary.lighter" },
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => onDelete(module.id)}
                size="small"
                color="error"
                title={t("courses.modules.deleteModule")}
                sx={{
                  "&:hover": { backgroundColor: "error.lighter" },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Action Buttons */}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;
