import React from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const LessonFilter = ({
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
}) => {
  const { t } = useTranslation();

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        flexWrap: 'wrap',
      }}
    >
      <TextField
        placeholder={t('lessonManagement.searchLessons')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ flexGrow: 1, minWidth: 200 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="outlined"
        startIcon={<FilterListIcon />}
        onClick={handleFilterClick}
      >
        {t('lessonManagement.filter')}
      </Button>
      <Button
        variant="outlined"
        startIcon={<SortIcon />}
        onClick={handleSortClick}
      >
        {t('lessonManagement.sort')}
      </Button>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem
          selected={selectedStatus === 'all'}
          onClick={() => setSelectedStatus('all')}
        >
          {t('lessonManagement.status.all')}
        </MenuItem>
        <MenuItem
          selected={selectedStatus === 'published'}
          onClick={() => setSelectedStatus('published')}
        >
          {t('lessonManagement.status.published')}
        </MenuItem>
        <MenuItem
          selected={selectedStatus === 'draft'}
          onClick={() => setSelectedStatus('draft')}
        >
          {t('lessonManagement.status.draft')}
        </MenuItem>
        <MenuItem
          selected={selectedStatus === 'archived'}
          onClick={() => setSelectedStatus('archived')}
        >
          {t('lessonManagement.status.archived')}
        </MenuItem>
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
      >
        <MenuItem
          selected={selectedSort === 'newest'}
          onClick={() => setSelectedSort('newest')}
        >
          {t('lessonManagement.sortBy.newest')}
        </MenuItem>
        <MenuItem
          selected={selectedSort === 'oldest'}
          onClick={() => setSelectedSort('oldest')}
        >
          {t('lessonManagement.sortBy.oldest')}
        </MenuItem>
        <MenuItem
          selected={selectedSort === 'title'}
          onClick={() => setSelectedSort('title')}
        >
          {t('lessonManagement.sortBy.title')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LessonFilter;
