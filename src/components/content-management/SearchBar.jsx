import React from 'react';
import {
  Card,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  t,
}) => (
  <Card sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: (theme) => theme.shadows[2] }}>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          placeholder={t('management.search.placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            ),
            sx: { borderRadius: 2 },
          }}
          aria-label={t('management.search.label')}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={6} md={2}>
        <FormControl fullWidth>
          <InputLabel>{t('management.filters.status')}</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label={t('management.filters.status')}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="all">{t('management.filters.all')}</MenuItem>
            <MenuItem value="active">
              {t('management.filters.active')}
            </MenuItem>
            <MenuItem value="draft">{t('management.filters.draft')}</MenuItem>
            <MenuItem value="archived">
              {t('management.filters.archived')}
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6} md={2}>
        <FormControl fullWidth>
          <InputLabel>{t('management.sort.by')}</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label={t('management.sort.by')}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="createdAt">
              {t('management.sort.createdDate')}
            </MenuItem>
            <MenuItem value="title">{t('management.sort.title')}</MenuItem>
            <MenuItem value="status">{t('management.sort.status')}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={1}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() =>
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
          }
          aria-label={t('management.sort.toggle')}
          sx={{ borderRadius: 2, py: 1.5 }}
        >
          {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
        </Button>
      </Grid>
    </Grid>
  </Card>
);

export default SearchBar;
