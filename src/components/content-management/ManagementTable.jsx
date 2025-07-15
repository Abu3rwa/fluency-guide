import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
} from "@mui/material";
import ResourceTable from "../ResourceTable";
import { Add as AddIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const ManagementTable = ({
  resourceDefs,
  activeResource,
  openDialog,
  filteredData,
  handleMenuOpen,
  getStatusColor,
  courses,
  modules,
  lessons,
  loading,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <CardHeader
        title={`${resourceDefs[activeResource].plural} ${t(
          "management.header.management"
        )}`}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openDialog(activeResource)}
            aria-label={`${t("management.actions.add")} ${
              resourceDefs[activeResource].singular
            }`}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              px: 3,
              py: 1.5,
            }}
          >
            {t("management.actions.add")}{" "}
            {resourceDefs[activeResource].singular}
          </Button>
        }
        sx={{
          borderBottom: `1px solid divider`,
          backgroundColor: "background.paper",
        }}
      />
      <CardContent sx={{ p: 0 }}>
        <ResourceTable
          data={filteredData}
          columns={resourceDefs[activeResource].columns}
          onAction={handleMenuOpen}
          getStatusColor={getStatusColor}
          additionalData={{ courses, modules, lessons }}
          loading={loading}
          emptyMessage={t("management.table.empty")}
        />
      </CardContent>
    </Card>
  );
};

export default ManagementTable;
