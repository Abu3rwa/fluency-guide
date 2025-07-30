import React from "react";
import { Box, Button } from "@mui/material";
import LessonFilter from "../lesson/management/LessonFilter";
import LessonList from "../lesson/management/LessonList";
import LessonActionsMenu from "../lesson/management/LessonActionsMenu";
import CreateLessonForm from "../CreateLessonForm";
import { useState } from "react";

const LessonSection = ({
  lessons,
  searchQuery,
  setSearchQuery,
  filterAnchorEl,
  setFilterAnchorEl,
  sortAnchorEl,
  setSortAnchorEl,
  selectedStatus,
  setSelectedStatus,
  selectedSort,
  setSelectedSort,
  menuAnchorEl,
  setMenuAnchorEl,
  selectedLesson: parentSelectedLesson,
  onMenuClick,
  onMenuClose,
  onDeleteLesson,
  onUpdateLesson,
  onStatusChange,
  onCreate,
  courseId,
  moduleId,
  t,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedLessonForMenu, setSelectedLessonForMenu] = useState(null);

  const handleMenuClick = (event, lesson) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedLessonForMenu(lesson);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedLessonForMenu(null);
  };

  const handleEditClick = (lesson) => {
    setSelectedLesson(lesson);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedLesson(null);
  };

  const handleEditLessonSubmit = async (updatedLesson) => {
    await onUpdateLesson(updatedLesson);
    setEditDialogOpen(false);
    setSelectedLesson(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" onClick={onCreate}>
          Create Lesson
        </Button>
      </Box>
      <LessonFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterAnchorEl={filterAnchorEl}
        setFilterAnchorEl={setFilterAnchorEl}
        sortAnchorEl={sortAnchorEl}
        setSortAnchorEl={setSortAnchorEl}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
      />
      <LessonList lessons={lessons} onMenuClick={handleMenuClick} />
      <LessonActionsMenu
        anchorEl={menuAnchorEl}
        onClose={handleMenuClose}
        lesson={selectedLessonForMenu}
        onEditClick={handleEditClick}
        onDeleteClick={() => {
          onDeleteLesson(selectedLessonForMenu.id);
          handleMenuClose();
        }}
        onStatusChange={onStatusChange}
      />
      {editDialogOpen && (
        <CreateLessonForm
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          onSubmit={handleEditLessonSubmit}
          initialData={selectedLesson}
          submitLabel={t ? t("common.save") : "Save"}
          dialogTitle={t ? t("courses.lessons.editLesson") : "Edit Lesson"}
          courseId={courseId}
          moduleId={moduleId}
        />
      )}
    </Box>
  );
};

export default LessonSection;
