import React from "react";
import { Menu, MenuItem as MenuItemComponent, Divider } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Publish as PublishIcon,
  FileDownloadOff as UnpublishedIcon,
  Add as AddIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const ManagementMenu = ({
  menuAnchor,
  menuItem,
  handleMenuClose,
  openDialog,
  activeResource,
  setDeleteDialog,
  handlePublish,
  openCreateLesson,
  openUpdateLesson,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={handleMenuClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: 200,
        },
      }}
      sx={{
        "& .MuiPaper-root": {
          position: "fixed",
          zIndex: 1300,
        },
        // Desktop-specific fixes
        "@media (min-width: 960px)": {
          "& .MuiPaper-root": {
            position: "fixed",
            zIndex: 1300,
            transformOrigin: "top left",
          },
        },
      }}
    >
      <MenuItemComponent
        onClick={() => openDialog(activeResource, "edit", menuItem)}
        aria-label={t("management.actions.edit")}
        sx={{ py: 1.5 }}
      >
        <EditIcon sx={{ mr: 2, color: "primary.main" }} />{" "}
        {t("management.actions.edit")}
      </MenuItemComponent>
      <MenuItemComponent
        onClick={() => navigate(`/${activeResource}s/${menuItem?.id}`)}
        aria-label={t("management.actions.view")}
        sx={{ py: 1.5 }}
      >
        <ViewIcon sx={{ mr: 2, color: "info.main" }} />{" "}
        {t("management.actions.view")}
      </MenuItemComponent>
      
      {/* Lesson Management Options - Only show for courses */}
      {activeResource === "course" && (
        <>
          <Divider />
          <MenuItemComponent
            onClick={() => {
              openCreateLesson(menuItem?.id, "default-module");
              handleMenuClose();
            }}
            aria-label={t("management.actions.createLesson")}
            sx={{ py: 1.5 }}
          >
            <AddIcon sx={{ mr: 2, color: "success.main" }} />
            {t("management.actions.createLesson")}
          </MenuItemComponent>
          <MenuItemComponent
            onClick={() => {
              // This would need to be implemented when we have lesson data
              // For now, it's a placeholder
              console.log("Edit lesson functionality to be implemented");
              handleMenuClose();
            }}
            aria-label={t("management.actions.editLesson")}
            sx={{ py: 1.5 }}
          >
            <SchoolIcon sx={{ mr: 2, color: "warning.main" }} />
            {t("management.actions.editLesson")}
          </MenuItemComponent>
        </>
      )}
      
      <Divider />
      <MenuItemComponent
        onClick={() => {
          handlePublish(menuItem);
          handleMenuClose();
        }}
        sx={{ py: 1.5 }}
      >
        {menuItem?.published ? (
          <UnpublishedIcon sx={{ mr: 2 }} />
        ) : (
          <PublishIcon sx={{ mr: 2 }} />
        )}
        {menuItem?.published
          ? t("management.actions.unpublish")
          : t("management.actions.publish")}
      </MenuItemComponent>
      <MenuItemComponent
        onClick={() => {
          setDeleteDialog({
            open: true,
            type: activeResource,
            item: menuItem,
          });
          handleMenuClose();
        }}
        aria-label={t("management.actions.delete")}
        sx={{ py: 1.5, color: "error.main" }}
      >
        <DeleteIcon sx={{ mr: 2 }} /> {t("management.actions.delete")}
      </MenuItemComponent>
    </Menu>
  );
};

export default ManagementMenu;
