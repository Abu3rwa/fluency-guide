import React, { memo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Collapse,
  Paper,
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useCustomTheme } from '../../../contexts/ThemeContext';
import { getInputStyles, getPaperStyles } from '../theme/styleUtils';
import { DESIGN_TOKENS } from '../constants';

/**
 * Search input component with clear functionality
 */
export const CourseSearchInput = memo(({ 
  value, 
  onChange, 
  placeholder,
  disabled = false 
}) => {
  const { t } = useTranslation();
  const { mode, theme } = useCustomTheme();

  return (
    <TextField
      fullWidth
      placeholder={placeholder || t('studentCourses.searchPlaceholder', 'Search courses...')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton 
              size="small" 
              onClick={() => onChange('')}
              edge="end"
              aria-label={t('common.clear', 'Clear')}
            >
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={getInputStyles(theme, mode)}
      role="searchbox"
      aria-label={t('studentCourses.searchAriaLabel', 'Search courses by title, instructor, or description')}
    />
  );
});

CourseSearchInput.displayName = 'CourseSearchInput';

/**
 * Category chips filter component
 */
export const CategoryFilter = memo(({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  disabled = false 
}) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          mb: 1.5, 
          fontWeight: 600,
          color: 'text.primary'
        }}
      >
        {t('studentCourses.categories', 'Categories')}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {categories.map((category) => (
          <Chip
            key={category.value}
            label={category.label}
            onClick={() => !disabled && onCategoryChange(category.value)}
            color={selectedCategory === category.value ? 'primary' : 'default'}
            variant={selectedCategory === category.value ? 'filled' : 'outlined'}
            clickable={!disabled}
            disabled={disabled}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': !disabled ? { 
                transform: 'translateY(-1px)',
                boxShadow: 2
              } : {},
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
            role="button"
            aria-pressed={selectedCategory === category.value}
            tabIndex={disabled ? -1 : 0}
          />
        ))}
      </Box>
    </Box>
  );
});

CategoryFilter.displayName = 'CategoryFilter';

/**
 * Advanced filter controls component
 */
export const AdvancedFilters = memo(({ 
  filters,
  onFilterChange,
  levels,
  languages,
  isExpanded,
  onToggleExpanded,
  disabled = false 
}) => {
  const { t } = useTranslation();

  const filterConfigs = [
    {
      key: 'level',
      label: t('studentCourses.level', 'Level'),
      options: levels,
      value: filters.level
    },
    {
      key: 'language',
      label: t('studentCourses.language', 'Language'),
      options: languages,
      value: filters.language
    },
    {
      key: 'price',
      label: t('studentCourses.price', 'Price'),
      options: [
        { label: t('studentCourses.free', 'Free'), value: 'free' },
        { label: t('studentCourses.paid', 'Paid'), value: 'paid' },
        { label: t('studentCourses.under50', 'Under $50'), value: 'under_50' },
        { label: t('studentCourses.under100', 'Under $100'), value: 'under_100' }
      ],
      value: filters.price
    },
    {
      key: 'duration',
      label: t('studentCourses.duration', 'Duration'),
      options: [
        { label: t('studentCourses.short', '< 5 hours'), value: 'short' },
        { label: t('studentCourses.medium', '5-20 hours'), value: 'medium' },
        { label: t('studentCourses.long', '20-50 hours'), value: 'long' },
        { label: t('studentCourses.extended', '> 50 hours'), value: 'extended' }
      ],
      value: filters.duration
    },
    {
      key: 'rating',
      label: t('studentCourses.rating', 'Rating'),
      options: [
        { label: '4.5+ ⭐', value: '4.5' },
        { label: '4.0+ ⭐', value: '4.0' },
        { label: '3.5+ ⭐', value: '3.5' },
        { label: '3.0+ ⭐', value: '3.0' }
      ],
      value: filters.rating
    }
  ];

  return (
    <Box>
      <Button
        startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        onClick={onToggleExpanded}
        variant="text"
        disabled={disabled}
        sx={{ 
          mb: 2,
          textTransform: 'none',
          fontWeight: 600
        }}
        aria-expanded={isExpanded}
        aria-controls="advanced-filters-content"
      >
        {t('studentCourses.advancedFilters', 'Advanced Filters')}
      </Button>
      
      <Collapse in={isExpanded}>
        <Box id="advanced-filters-content">
          <Grid container spacing={2}>
            {filterConfigs.map((config) => (
              <Grid item xs={12} sm={6} md={4} key={config.key}>
                <FormControl fullWidth size="small" disabled={disabled}>
                  <InputLabel>{config.label}</InputLabel>
                  <Select
                    value={config.value}
                    onChange={(e) => onFilterChange({ [config.key]: e.target.value })}
                    label={config.label}
                    aria-label={`Filter by ${config.label.toLowerCase()}`}
                  >
                    <MenuItem value="">
                      <em>{t('common.all', 'All')}</em>
                    </MenuItem>
                    {config.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
});

AdvancedFilters.displayName = 'AdvancedFilters';

/**
 * Filter actions component (clear filters, etc.)
 */
export const FilterActions = memo(({ 
  onClearFilters,
  hasActiveFilters = false,
  disabled = false 
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ mt: DESIGN_TOKENS.SPACING.MD }}>
      <Button
        fullWidth
        variant="outlined"
        onClick={onClearFilters}
        startIcon={<ClearIcon />}
        disabled={disabled || !hasActiveFilters}
        sx={{ 
          height: 40,
          textTransform: 'none',
          fontWeight: 600
        }}
        aria-label={t('studentCourses.clearAllFilters', 'Clear all active filters')}
      >
        {t('studentCourses.clearFilters', 'Clear Filters')}
      </Button>
    </Box>
  );
});

FilterActions.displayName = 'FilterActions';

/**
 * Main filter container component
 */
export const CourseFiltersContainer = memo(({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  categories, 
  levels,
  languages,
  isLoading = false,
  className,
  showAdvancedFilters = true 
}) => {
  const { mode, theme } = useCustomTheme();
  const [showMoreFilters, setShowMoreFilters] = React.useState(false);

  const hasActiveFilters = React.useMemo(() => {
    return Object.values(filters).some(value => value && value !== '');
  }, [filters]);

  const handleSearchChange = React.useCallback((value) => {
    onFilterChange({ search: value });
  }, [onFilterChange]);

  const handleCategoryChange = React.useCallback((category) => {
    onFilterChange({ category: category === filters.category ? '' : category });
  }, [onFilterChange, filters.category]);

  return (
    <Fade in timeout={600}>
      <Paper
        elevation={2}
        className={className}
        sx={{
          ...getPaperStyles(theme, mode, 2),
          p: DESIGN_TOKENS.SPACING.LG,
        }}
        role="region"
        aria-label="Course filters"
      >
        {/* Search Section */}
        <Box sx={{ mb: DESIGN_TOKENS.SPACING.LG }}>
          <CourseSearchInput
            value={filters.search}
            onChange={handleSearchChange}
            disabled={isLoading}
          />
        </Box>

        {/* Category Filter */}
        <Box sx={{ mb: DESIGN_TOKENS.SPACING.LG }}>
          <CategoryFilter
            categories={categories}
            selectedCategory={filters.category}
            onCategoryChange={handleCategoryChange}
            disabled={isLoading}
          />
        </Box>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <AdvancedFilters
            filters={filters}
            onFilterChange={onFilterChange}
            levels={levels}
            languages={languages}
            isExpanded={showMoreFilters}
            onToggleExpanded={() => setShowMoreFilters(!showMoreFilters)}
            disabled={isLoading}
          />
        )}

        {/* Filter Actions */}
        <FilterActions
          onClearFilters={onClearFilters}
          hasActiveFilters={hasActiveFilters}
          disabled={isLoading}
        />
      </Paper>
    </Fade>
  );
});

CourseFiltersContainer.displayName = 'CourseFiltersContainer';