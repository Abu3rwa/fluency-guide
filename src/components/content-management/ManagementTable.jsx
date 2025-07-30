import React from "react";
import { Card, CardHeader, CardContent, Button } from "@mui/material";
import ResourceTable from "../ResourceTable";
import { Add as AddIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

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

const ManagementTable = ({
  resourceDefs,
  activeResource,
  openDialog,
  filteredData,
  handleMenuOpen,
  getStatusColor,
  courses,
  loading,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: theme.shape.borderRadius,
        overflow: "hidden",
      }}
    >
      <CardHeader
        title={`${resourceDefs[activeResource].plural} Management`}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openDialog(activeResource)}
            aria-label={`Add ${resourceDefs[activeResource].singular}`}
            sx={{
              borderRadius: theme.shape.borderRadius,
              textTransform: "none",
              fontWeight: 500,
              px: 3,
              py: 1.5,
            }}
          >
            Add {resourceDefs[activeResource].singular}
          </Button>
        }
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      />
      <CardContent sx={{ p: 0 }}>
        <ResourceTable
          data={filteredData}
          columns={resourceDefs[activeResource].columns}
          onAction={handleMenuOpen}
          getStatusColor={getStatusColor}
          additionalData={{ courses }}
          loading={loading}
          emptyMessage={t("management.table.empty")}
        />
      </CardContent>
    </Card>
  );
};

export default ManagementTable;
