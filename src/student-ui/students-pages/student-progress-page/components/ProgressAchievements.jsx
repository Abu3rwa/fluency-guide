import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  Chip,
} from "@mui/material";

/**
 * Displays student achievements progress in a grid of cards.
 * @param {Object[]} achievements - List of achievement objects.
 * @param {boolean} loading - Loading state.
 * @param {string|false} error - Error message or false.
 */

const ProgressAchievements = ({ achievements, loading, error }) => {
  // Loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={120}
      >
        <CircularProgress aria-label="Loading achievements" />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }} role="alert">
        {error}
      </Alert>
    );
  }

  // Empty state
  if (!achievements || achievements.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={80}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          No achievements yet.
        </Typography>
      </Box>
    );
  }

  // Main content
  return (
    <Box>
      <Typography variant="h6" gutterBottom component="h2">
        Achievements
      </Typography>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {achievements.map((ach, idx) => (
          <Grid item xs={12} sm={6} md={4} key={ach.id || idx}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  {ach.icon && (
                    <Box
                      component="span"
                      sx={{ fontSize: 32 }}
                      aria-label={ach.title + " icon"}
                    >
                      {ach.icon}
                    </Box>
                  )}
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    component="h3"
                  >
                    {ach.title}
                  </Typography>
                </Box>
                {ach.description && (
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {ach.description}
                  </Typography>
                )}
                {ach.date && (
                  <Chip
                    label={new Date(ach.date).toLocaleDateString()}
                    size="small"
                    color="primary"
                    sx={{ mt: 1 }}
                    aria-label="Achievement date"
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

ProgressAchievements.propTypes = {
  achievements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.node,
      date: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};

ProgressAchievements.defaultProps = {
  achievements: [],
  loading: false,
  error: false,
};

export default ProgressAchievements;
