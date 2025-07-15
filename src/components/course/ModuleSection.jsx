import React, { useState } from "react";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ModuleCard from "../ModuleCard";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import CreateModuleForm from "../CreateModuleForm";

const ModuleSection = ({
  modules,
  onDelete,
  onCreate,
  onUpdateModule,
  selectedLesson,
  onEditLesson,
  selectedTask,
  onEditTask,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const handleEditModule = (module) => {
    setSelectedModule(module);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedModule(null);
  };

  const handleEditModuleSubmit = (updatedModule) => {
    if (onUpdateModule) {
      onUpdateModule(updatedModule);
    }
    handleCloseEditDialog();
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5">Modules</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreate}
            sx={{ mr: 1 }}
            aria-label="Create New Module"
          >
            Create New Module
          </Button>
        </Box>
        {modules.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No modules yet
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onCreate}
            >
              Create First Module
            </Button>
          </Box>
        ) : (
          <Box>
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onEdit={() => handleEditModule(module)}
                onDelete={onDelete}
              />
            ))}
          </Box>
        )}
        {/* Edit Module Dialog using CreateModuleForm */}
        {editDialogOpen && (
          <CreateModuleForm
            open={editDialogOpen}
            onClose={handleCloseEditDialog}
            onSubmit={handleEditModuleSubmit}
            initialData={selectedModule}
            submitLabel="Save"
            dialogTitle="Edit Module"
          />
        )}
        {/* Placeholder dialogs for lesson and task edits */}
        <Dialog open={false} /* Replace with lesson edit state */>
          <DialogTitle>Edit Lesson (Placeholder)</DialogTitle>
        </Dialog>
        <Dialog open={false} /* Replace with task edit state */>
          <DialogTitle>Edit Task (Placeholder)</DialogTitle>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ModuleSection;
