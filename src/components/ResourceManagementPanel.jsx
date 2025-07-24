import React, { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Menu,
  MenuItem as MenuItemComponent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import ResourceTable from "./ResourceTable";
import ResourceDialog from "./ResourceDialog";

const ResourceManagementPanel = ({
  resourceDefs = {},
  initialResource = "course",
  fetchData,
  loading,
  stats = {},
  dialogFields = {},
  validationSchemas = {},
  resourceApi = {},
  t = (x) => x,
  navigate,
  additionalData = {},
}) => {
  const [activeResource, setActiveResource] = useState(initialResource);
  const [dialogConfig, setDialogConfig] = useState({
    open: false,
    mode: "create",
    type: initialResource,
    formData: {},
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: "",
    item: null,
  });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const handleMenuOpen = useCallback((event, item) => {
    setMenuAnchor(event.currentTarget);
    setMenuItem(item);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
    setMenuItem(null);
  }, []);

  const openDialog = useCallback(
    (type, mode = "create", item = null) => {
      setDialogConfig({
        open: true,
        type,
        mode,
        formData: item || {},
      });
      handleMenuClose();
    },
    [handleMenuClose]
  );

  const closeDialog = useCallback(() => {
    setDialogConfig((prev) => ({ ...prev, open: false }));
  }, []);

  const handleDialogSubmit = useCallback(async () => {
    const { type, mode, formData } = dialogConfig;
    setSubmitting(true);
    try {
      if (mode === "create") {
        await resourceApi[type].create(formData);
        // showNotification(t(`Created successfully!`));
      } else {
        await resourceApi[type].update(formData.id, formData);
        // showNotification(t(`Updated successfully!`));
      }
      closeDialog();
      fetchData && fetchData();
    } catch (error) {
      // showNotification(error.message || t("Save failed!"), "error");
    } finally {
      setSubmitting(false);
    }
  }, [dialogConfig, fetchData, closeDialog, t, resourceApi]);

  const handleDeleteConfirm = useCallback(async () => {
    const { type, item } = deleteDialog;
    setSubmitting(true);
    try {
      await resourceApi[type].delete(item.id);
      // showNotification(t(`Deleted successfully!`));
      setDeleteDialog({ open: false, type: "", item: null });
      fetchData && fetchData();
    } catch (error) {
      // showNotification(error.message || t("Delete failed!"), "error");
    } finally {
      setSubmitting(false);
    }
  }, [deleteDialog, fetchData, t, resourceApi]);

  const filteredData = useMemo(() => {
    const data = resourceDefs[activeResource]?.data || [];
    return data
      .filter(
        (item) =>
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          (filterStatus === "all" || item.status === filterStatus)
      )
      .sort((a, b) => {
        const aVal = a[sortBy] || "";
        const bVal = b[sortBy] || "";
        return sortOrder === "asc"
          ? String(aVal).localeCompare(bVal)
          : String(bVal).localeCompare(aVal);
      });
  }, [
    resourceDefs,
    activeResource,
    searchQuery,
    filterStatus,
    sortBy,
    sortOrder,
  ]);

  const getStatusColor = (status) => {
    return (
      {
        active: "success",
        published: "success",
        draft: "warning",
        archived: "error",
      }[status] || "default"
    );
  };

  return (
    <>
      {/* Tabs for resources */}
      <Card sx={{ mb: 3, borderRadius: 2, overflow: "hidden", boxShadow: 2 }}>
        <CardHeader
          title={resourceDefs[activeResource]?.plural || "Resources"}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openDialog(activeResource)}
              aria-label={`Add ${resourceDefs[activeResource]?.singular}`}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                px: 3,
                py: 1.5,
              }}
            >
              Add {resourceDefs[activeResource]?.singular}
            </Button>
          }
          sx={{
            borderBottom: "1px solid #eee",
            backgroundColor: "background.paper",
          }}
        />
        <CardContent sx={{ p: 0 }}>
          <ResourceTable
            data={filteredData}
            columns={resourceDefs[activeResource]?.columns || []}
            onAction={handleMenuOpen}
            additionalData={additionalData}
            loading={loading}
            emptyMessage={t("No data available.")}
            getStatusColor={getStatusColor}
          />
        </CardContent>
      </Card>

      {/* Menu for actions */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItemComponent
          onClick={() => openDialog(activeResource, "edit", menuItem)}
        >
          <EditIcon sx={{ mr: 2, color: "primary.main" }} /> Edit
        </MenuItemComponent>
        <MenuItemComponent
          onClick={() =>
            navigate && navigate(`/${activeResource}s/${menuItem?.id}`)
          }
        >
          <ViewIcon sx={{ mr: 2, color: "info.main" }} /> View
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
        >
          <DeleteIcon color="error" sx={{ mr: 2 }} /> Delete
        </MenuItemComponent>
      </Menu>

      {/* Dialog for add/edit */}
      <ResourceDialog
        open={dialogConfig.open}
        onClose={closeDialog}
        mode={dialogConfig.mode}
        title={resourceDefs[dialogConfig.type]?.singular || ""}
        fields={dialogFields[dialogConfig.type] || []}
        formData={dialogConfig.formData}
        onFormChange={(data) =>
          setDialogConfig((prev) => ({ ...prev, formData: data }))
        }
        onSubmit={handleDialogSubmit}
        loading={submitting}
        validationSchema={validationSchemas[dialogConfig.type]}
      />

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: "", item: null })}
      >
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          {deleteDialog.item?.title || deleteDialog.item?.name}?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDeleteDialog({ open: false, type: "", item: null })
            }
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ResourceManagementPanel;
