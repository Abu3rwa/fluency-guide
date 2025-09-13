import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  Box,
  Typography,
  useMediaQuery,
  IconButton,
  Chip
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCustomTheme } from "../../contexts/ThemeContext";
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  SwapVert as SwapVertIcon
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const ManagementSearchBar = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      {/* Search Section Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SearchIcon sx={{ color: theme.palette.primary.main }} />
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.text.primary
          }}
        >
          Search & Filter
        </Typography>
      </Box>

      <Card 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 3,
          background: mode === "dark"
            ? `linear-gradient(135deg, ${theme.palette.grey[700]} 0%, ${theme.palette.grey[600]} 100%)`
            : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[25] || '#fafafa'} 100%)`,
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
          {/* Search Field */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder={t("management.search.placeholder") || "Search courses, lessons..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon 
                    sx={{ 
                      mr: 1, 
                      color: theme.palette.primary.main,
                      fontSize: '1.2rem'
                    }} 
                  />
                ),
                sx: { 
                  borderRadius: 3,
                  backgroundColor: mode === "dark" 
                    ? theme.palette.grey[800] 
                    : theme.palette.grey[100],
                  '&:hover': {
                    backgroundColor: mode === "dark" 
                      ? theme.palette.grey[700] 
                      : theme.palette.grey[50],
                  },
                  '&.Mui-focused': {
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`
                  }
                },
              }}
              aria-label={t("management.search.label") || "Search"}
              variant="outlined"
            />
          </Grid>

          {/* Filter Status */}
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth>
              <InputLabel 
                sx={{ 
                  color: theme.palette.text.secondary,
                  '&.Mui-focused': { color: theme.palette.primary.main }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FilterIcon sx={{ fontSize: '1rem' }} />
                  {isSmall ? 'Status' : t("management.filters.status") || 'Status'}
                </Box>
              </InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label={isSmall ? 'Status' : t("management.filters.status") || 'Status'}
                sx={{ 
                  borderRadius: 3,
                  backgroundColor: mode === "dark" 
                    ? theme.palette.grey[800] 
                    : theme.palette.grey[100],
                  '&:hover': {
                    backgroundColor: mode === "dark" 
                      ? theme.palette.grey[700] 
                      : theme.palette.grey[50],
                  }
                }}
              >
                <MenuItem value="all">
                  <Chip 
                    label={t("management.filters.all") || "All"} 
                    size="small" 
                    color="default"
                    sx={{ borderRadius: 2 }}
                  />
                </MenuItem>
                <MenuItem value="active">
                  <Chip 
                    label={t("management.filters.active") || "Active"} 
                    size="small" 
                    color="success"
                    sx={{ borderRadius: 2 }}
                  />
                </MenuItem>
                <MenuItem value="draft">
                  <Chip 
                    label={t("management.filters.draft") || "Draft"} 
                    size="small" 
                    color="warning"
                    sx={{ borderRadius: 2 }}
                  />
                </MenuItem>
                <MenuItem value="archived">
                  <Chip 
                    label={t("management.filters.archived") || "Archived"} 
                    size="small" 
                    color="error"
                    sx={{ borderRadius: 2 }}
                  />
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort By */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel
                sx={{ 
                  color: theme.palette.text.secondary,
                  '&.Mui-focused': { color: theme.palette.primary.main }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SortIcon sx={{ fontSize: '1rem' }} />
                  {isSmall ? 'Sort' : t("management.sort.by") || 'Sort By'}
                </Box>
              </InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label={isSmall ? 'Sort' : t("management.sort.by") || 'Sort By'}
                sx={{ 
                  borderRadius: 3,
                  backgroundColor: mode === "dark" 
                    ? theme.palette.grey[800] 
                    : theme.palette.grey[100],
                  '&:hover': {
                    backgroundColor: mode === "dark" 
                      ? theme.palette.grey[700] 
                      : theme.palette.grey[50],
                  }
                }}
              >
                <MenuItem value="createdAt">
                  {t("management.sort.createdDate") || "Created Date"}
                </MenuItem>
                <MenuItem value="title">
                  {t("management.sort.title") || "Title"}
                </MenuItem>
                <MenuItem value="status">
                  {t("management.sort.status") || "Status"}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort Order */}
          <Grid item xs={12} md={1.5}>
            <Button
              fullWidth
              variant={sortOrder === "asc" ? "contained" : "outlined"}
              onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
              aria-label={t("management.sort.toggle") || "Toggle sort order"}
              startIcon={<SwapVertIcon />}
              sx={{ 
                borderRadius: 3, 
                py: { xs: 1.5, md: 1.8 },
                px: { xs: 2, md: 1 },
                fontWeight: 'bold',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 4
                }
              }}
            >
              {isSmall 
                ? (sortOrder === "asc" ? "↑" : "↓")
                : (sortOrder === "asc" ? "↑ Asc" : "↓ Desc")
              }
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default ManagementSearchBar;
