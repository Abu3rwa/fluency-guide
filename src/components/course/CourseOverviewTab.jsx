import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import ModuleCard from "../ModuleCard";

/**
 * CourseOverviewTab - Overview tab content for CourseDetailsScreen
 * Displays course modules with create/manage functionality
 */
const CourseOverviewTab = ({
  modules,
  theme,
  onCreateModule,
  onDeleteModule,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
        borderRadius: theme.shape.borderRadius * 2,
      }}
    >
      <CardContent
        sx={{ p: { xs: theme.spacing(2), md: theme.spacing(3) } }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5">
            {t("courseDetails.modules")}
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateModule}
              sx={{
                mr: 1,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
              aria-label={t("courseDetails.createNewModule")}
            >
              {t("courseDetails.createNewModule")}
            </Button>
          </Box>
        </Box>
        {modules.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: theme.spacing(4),
              color: theme.palette.text.secondary,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t("courseDetails.noModulesYet")}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onCreateModule}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                "&:hover": {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.dark,
                },
              }}
            >
              {t("courseDetails.createFirstModule")}
            </Button>
          </Box>
        ) : (
          <Box>
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onDelete={onDeleteModule}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseOverviewTab;