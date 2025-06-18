import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  EmojiEvents as EmojiEventsIcon,
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material";
import { useTheme } from "../theme/ThemeContext";

const KpiCard = ({ title, value, change, icon }) => {
  const { theme } = useTheme();
  const isPositive = change >= 0;

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography
              color="textSecondary"
              gutterBottom
              sx={{ color: theme.palette.text.secondary }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{ color: theme.palette.text.primary }}
            >
              {value}
            </Typography>
            <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
              {isPositive ? (
                <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
              ) : (
                <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
              )}
              <Typography
                variant="body2"
                color={isPositive ? "success.main" : "error.main"}
              >
                {isPositive ? "+" : ""}
                {change}% from last month
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: "50%",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const ProgressCard = ({ title, data }) => {
  const { theme } = useTheme();

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: theme.palette.text.primary }}
        >
          {title}
        </Typography>
        <List>
          {data.map((item, index) => (
            <React.Fragment key={item.name}>
              <ListItem>
                <ListItemIcon>
                  <SchoolIcon sx={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ color: theme.palette.text.primary }}>
                      {item.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Box sx={{ width: "100%", mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={item.value}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: theme.palette.action.hover,
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 4,
                              backgroundColor: theme.palette.primary.main,
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {item.value}%
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < data.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

const Analytics = () => {
  const { theme } = useTheme();

  const enrollmentData = [
    { name: "Beginner Level", value: 75 },
    { name: "Intermediate Level", value: 60 },
    { name: "Advanced Level", value: 45 },
  ];

  const completionData = [
    { name: "Course Completion", value: 78 },
    { name: "Assignment Submission", value: 85 },
    { name: "Quiz Completion", value: 92 },
  ];

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: theme.palette.text.primary }}
      >
        Analytics Dashboard
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          mb: 4,
        }}
      >
        Monitor your platform's performance and student engagement
      </Typography>

      <Grid container spacing={3}>
        {/* KPI Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Students"
            value="2,543"
            change={12}
            icon={<PeopleIcon sx={{ color: "white" }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Active Courses"
            value="24"
            change={8}
            icon={<SchoolIcon sx={{ color: "white" }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Completion Rate"
            value="78%"
            change={5}
            icon={<EmojiEventsIcon sx={{ color: "white" }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Revenue"
            value="$12,450"
            change={-3}
            icon={<AttachMoneyIcon sx={{ color: "white" }} />}
          />
        </Grid>

        {/* Progress Cards */}
        <Grid item xs={12} md={6}>
          <ProgressCard title="Enrollment Progress" data={enrollmentData} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ProgressCard title="Completion Metrics" data={completionData} />
        </Grid>

        {/* Additional Stats */}
        <Grid item xs={12}>
          <Card
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.shape.borderRadius,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: theme.palette.text.primary }}
              >
                Key Performance Indicators
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Typography
                      variant="h4"
                      sx={{ color: theme.palette.primary.main }}
                    >
                      92%
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      Student Satisfaction
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Typography
                      variant="h4"
                      sx={{ color: theme.palette.primary.main }}
                    >
                      85%
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      Course Completion
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Typography
                      variant="h4"
                      sx={{ color: theme.palette.primary.main }}
                    >
                      78%
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      Active Engagement
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Typography
                      variant="h4"
                      sx={{ color: theme.palette.primary.main }}
                    >
                      65%
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      Retention Rate
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
