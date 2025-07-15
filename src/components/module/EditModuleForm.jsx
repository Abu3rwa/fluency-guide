
import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const EditModuleForm = ({ initialData, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialData);
  const [newObjective, setNewObjective] = useState("");

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setFormData((prev) => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()],
      }));
      setNewObjective("");
    }
  };

  const handleRemoveObjective = (index) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        name="title"
        label={t("courses.modules.title")}
        value={formData.title}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />
      <TextField
        name="description"
        label={t("courses.modules.description")}
        value={formData.description}
        onChange={handleChange}
        fullWidth
        required
        multiline
        rows={3}
        margin="normal"
      />
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="subtitle1" color="primary">
          {t("courses.modules.objectives")}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            placeholder={t("courses.modules.addObjective")}
            fullWidth
            size="small"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddObjective();
              }
            }}
          />
          <IconButton
            onClick={handleAddObjective}
            color="primary"
            disabled={!newObjective.trim()}
          >
            <AddIcon />
          </IconButton>
        </Box>
        <Paper variant="outlined" sx={{ maxHeight: 200, overflow: "auto" }}>
          <List dense>
            {formData.objectives.map((objective, index) => (
              <ListItem key={index}>
                <ListItemText primary={objective} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveObjective(index)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
      <TextField
        name="duration"
        label={t("courses.modules.duration")}
        value={formData.duration}
        onChange={handleChange}
        fullWidth
        required
        type="number"
        margin="normal"
        helperText={t("courses.modules.durationHelp")}
      />
      <TextField
        name="estimatedTime"
        label={t("courses.modules.estimatedTime")}
        value={formData.estimatedTime}
        onChange={handleChange}
        fullWidth
        required
        type="number"
        margin="normal"
        helperText={t("courses.modules.estimatedTimeHelp")}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>{t("courses.modules.difficulty")}</InputLabel>
        <Select
          name="difficulty"
          value={formData.difficulty}
          onChange={handleChange}
          label={t("courses.modules.difficulty")}
        >
          <MenuItem value="beginner">
            {t("courses.modules.difficultybeginner")}
          </MenuItem>
          <MenuItem value="intermediate">
            {t("courses.modules.difficultyintermediate")}
          </MenuItem>
          <MenuItem value="advanced">
            {t("courses.modules.difficultyadvanced")}
          </MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>{t("courses.modules.status")}</InputLabel>
        <Select
          name="status"
          value={formData.status}
          onChange={handleChange}
          label={t("courses.modules.status")}
        >
          <MenuItem value="draft">
            {t("courses.modules.statusdraft")}
          </MenuItem>
          <MenuItem value="published">
            {t("courses.modules.statuspublished")}
          </MenuItem>
          <MenuItem value="archived">
            {t("courses.modules.statusarchived")}
          </MenuItem>
        </Select>
      </FormControl>
      <TextField
        name="order"
        label={t("courses.modules.order")}
        value={formData.order}
        onChange={handleChange}
        fullWidth
        required
        type="number"
        margin="normal"
      />
      <DialogActions>
        <Button onClick={onCancel}>{t("common.cancel")}</Button>
        <Button type="submit" variant="contained" color="primary">
          {t("common.save")}
        </Button>
      </DialogActions>
    </form>
  );
};

export default EditModuleForm;
