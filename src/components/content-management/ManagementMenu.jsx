import React from "react";
import {
  Menu,
  MenuItem as MenuItemComponent,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
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
      <Divider />
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
        sx={{ py: 1.5 }}
      >
        <DeleteIcon color="error" sx={{ mr: 2 }} />{" "}
        {t("management.actions.delete")}
      </MenuItemComponent>
    </Menu>
  );
};

export default ManagementMenu;
