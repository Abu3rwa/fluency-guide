import React from "react";
import { Box, Button, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ModuleCard from "./ModuleCard";

const ModuleList = ({
  modules,
  onEdit,
  onDelete,
  onCreate,
  showFab = false,
}) => (
  <Box>
    {modules.map((module) => (
      <ModuleCard
        key={module.id}
        module={module}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}
    {showFab && (
      <Fab
        color="primary"
        onClick={onCreate}
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        aria-label="Add Module"
      >
        <AddIcon />
      </Fab>
    )}
  </Box>
);

export default ModuleList;
