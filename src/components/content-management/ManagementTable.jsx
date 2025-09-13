import React from "react";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button,
  Box,
  Typography,
  useMediaQuery,
  Chip
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCustomTheme } from "../../contexts/ThemeContext";
import ResourceTable from "../ResourceTable";
import { 
  Add as AddIcon,
  TableChart as TableIcon
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

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
  const { mode } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box>
      {/* Table Section Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TableIcon sx={{ color: theme.palette.primary.main }} />
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.text.primary
          }}
        >
          {resourceDefs[activeResource].plural} Management
        </Typography>
        <Chip
          label={`${filteredData?.length || 0} items`}
          size="small"
          color="primary"
          sx={{ ml: 1, borderRadius: 2 }}
        />
      </Box>

      <Card
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          background: mode === "dark"
            ? `linear-gradient(135deg, ${theme.palette.grey[700]} 0%, ${theme.palette.grey[600]} 100%)`
            : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[25] || '#fafafa'} 100%)`,
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: 8,
            transform: 'translateY(-2px)'
          }
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ 
                  fontWeight: 'bold',
                  background: mode === "dark"
                    ? `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`
                    : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {resourceDefs[activeResource].plural}
              </Typography>
            </Box>
          }
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openDialog(activeResource)}
              aria-label={`Add ${resourceDefs[activeResource].singular}`}
              size={isMobile ? "medium" : "large"}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 'bold',
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 1.5 },
                background: mode === "dark"
                  ? `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`
                  : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 6,
                  background: mode === "dark"
                    ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    : `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                }
              }}
            >
              {isMobile 
                ? `Add ${resourceDefs[activeResource].singular.split(' ')[0]}` 
                : `Add ${resourceDefs[activeResource].singular}`
              }
            </Button>
          }
          sx={{
            borderBottom: `2px solid ${theme.palette.divider}`,
            background: mode === "dark"
              ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[700]} 100%)`
              : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
            p: { xs: 2, md: 3 }
          }}
        />
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              background: mode === "dark" ? theme.palette.grey[800] : theme.palette.background.paper,
              minHeight: '200px'
            }}
          >
            <ResourceTable
              data={filteredData}
              columns={resourceDefs[activeResource].columns}
              onAction={handleMenuOpen}
              getStatusColor={getStatusColor}
              additionalData={{ courses }}
              loading={loading}
              emptyMessage={t("management.table.empty") || "No items found"}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ManagementTable;
