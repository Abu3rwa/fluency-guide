import React, { useState, useCallback, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
  Chip,
  Collapse,
} from "@mui/material";
import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import useDebouncedSearch from "../hooks/useDebouncedSearch";

const StudentVocabularyAppBar = ({
  onSearch,
  onToggleFavorites,
  showFavoritesOnly,
  isSearchExpanded,
  setIsSearchExpanded,
  searchTerm,
  setSearchTerm,
}) => {
  const { t } = useTranslation();

  // Use debounced search
  const {
    searchTerm: localSearchTerm,
    debouncedSearchTerm,
    updateSearchTerm,
    clearSearch,
  } = useDebouncedSearch(searchTerm, 300);

  // Update parent search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch, searchTerm]);

  // Sync local search term with parent
  useEffect(() => {
    if (searchTerm !== localSearchTerm) {
      updateSearchTerm(searchTerm);
    }
  }, [searchTerm, localSearchTerm, updateSearchTerm]);

  const handleSearchChange = useCallback(
    (event) => {
      const value = event.target.value;
      updateSearchTerm(value);
      setSearchTerm(value);
    },
    [updateSearchTerm, setSearchTerm]
  );

  const handleClearSearch = useCallback(() => {
    clearSearch();
    setSearchTerm("");
    onSearch("");
  }, [clearSearch, setSearchTerm, onSearch]);

  const handleToggleSearch = useCallback(() => {
    setIsSearchExpanded(!isSearchExpanded);
    if (isSearchExpanded) {
      handleClearSearch();
    }
  }, [isSearchExpanded, setIsSearchExpanded, handleClearSearch]);

  const handleToggleFavorites = useCallback(() => {
    onToggleFavorites();
  }, [onToggleFavorites]);

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
          {t("vocabulary.title")}
        </Typography>

        {/* Search and Filter Controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Favorites Filter */}
          <IconButton
            onClick={handleToggleFavorites}
            color={showFavoritesOnly ? "secondary" : "inherit"}
            size="small"
            title={t("vocabulary.showFavorites")}
          >
            {showFavoritesOnly ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>

          {/* Search Toggle */}
          <IconButton
            onClick={handleToggleSearch}
            color="inherit"
            size="small"
            title={t("common.search")}
          >
            {isSearchExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Toolbar>

      {/* Expandable Search Bar */}
      <Collapse in={isSearchExpanded}>
        <Box sx={{ p: 2, bgcolor: "background.paper" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "background.default",
              borderRadius: 1,
              px: 2,
              py: 1,
            }}
          >
            <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
            <InputBase
              placeholder={t("vocabulary.searchPlaceholder")}
              value={localSearchTerm}
              onChange={handleSearchChange}
              sx={{ flexGrow: 1 }}
              autoFocus
            />
            {localSearchTerm && (
              <IconButton
                onClick={handleClearSearch}
                size="small"
                sx={{ ml: 1 }}
              >
                <ClearIcon />
              </IconButton>
            )}
          </Box>

          {/* Active Filters Display */}
          {(showFavoritesOnly || localSearchTerm) && (
            <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
              {showFavoritesOnly && (
                <Chip
                  label={t("vocabulary.favoritesOnly")}
                  size="small"
                  color="secondary"
                  onDelete={handleToggleFavorites}
                />
              )}
              {localSearchTerm && (
                <Chip
                  label={`"${localSearchTerm}"`}
                  size="small"
                  color="primary"
                  onDelete={handleClearSearch}
                />
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </AppBar>
  );
};

export default React.memo(StudentVocabularyAppBar);
