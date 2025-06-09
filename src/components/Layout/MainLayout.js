import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Avatar,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
      marginLeft: 0,
    },
  })
);

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    boxSizing: "border-box",
    backgroundColor: theme.palette.background.default,
    borderRight: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      maxWidth: drawerWidth,
    },
  },
}));

const StyledAppBar = styled(AppBar)(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    marginLeft: 0,
  },
}));

const ToolbarSpacer = styled("div")(({ theme }) => ({
  ...theme.mixins.toolbar,
  [theme.breakpoints.down("sm")]: {
    minHeight: 64,
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontWeight: 500,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.75, 1.5),
  },
}));

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Courses", icon: <SchoolIcon />, path: "/courses/all" },
  { text: "Tasks", icon: <AssignmentIcon />, path: "/tasks" },
  { text: "Students", icon: <PeopleIcon />, path: "/students" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const MainLayout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        user.getIdTokenResult().then((idTokenResult) => {
          setIsAdmin(idTokenResult.claims.admin === true);
        });
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchor(null);
  };

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    return paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join("/")}`;
      return {
        label: path.charAt(0).toUpperCase() + path.slice(1),
        url,
      };
    });
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
    handleMenuClose();
  };

  const isLandingPage = location.pathname === "/landing";
  const showSidebar = !isLandingPage || (isLandingPage && isAdmin);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StyledAppBar
        position="fixed"
        open={showSidebar && open}
        sx={{
          backgroundColor: "background.paper",
          color: "text.primary",
          boxShadow: 1,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          {showSidebar && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                display: { sm: "flex" },
                [theme.breakpoints.down("sm")]: {
                  mr: 1,
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              fontWeight: 600,
            }}
          >
            ReapEnglish {isLandingPage ? "" : "Dashboard"}
          </Typography>

          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="large"
                aria-label="show notifications"
                color="inherit"
                onClick={handleNotificationMenuOpen}
                sx={{
                  p: { xs: 0.75, sm: 1 },
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <NotificationsIcon />
              </IconButton>

              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{
                  p: { xs: 0.75, sm: 1 },
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
                    bgcolor: "primary.main",
                  }}
                >
                  <AccountCircleIcon />
                </Avatar>
              </IconButton>
            </Box>
          ) : (
            <NavButton
              color="primary"
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => navigate("/login")}
              sx={{
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              Login
            </NavButton>
          )}
        </Toolbar>

        {!isLandingPage && (
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 1,
              backgroundColor: "background.default",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Breadcrumbs
              aria-label="breadcrumb"
              sx={{
                "& .MuiBreadcrumbs-separator": {
                  mx: { xs: 0.5, sm: 1 },
                },
              }}
            >
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  fontSize: "0.875rem",
                }}
              >
                Home
              </Link>
              {generateBreadcrumbs().map((crumb, index) => (
                <Link
                  key={crumb.url}
                  to={crumb.url}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    opacity:
                      index === generateBreadcrumbs().length - 1 ? 0.7 : 1,
                    fontSize: "0.875rem",
                  }}
                >
                  {crumb.label}
                </Link>
              ))}
            </Breadcrumbs>
          </Box>
        )}
      </StyledAppBar>

      {showSidebar && (
        <StyledDrawer
          variant={isMobile ? "temporary" : "persistent"}
          open={open}
          onClose={isMobile ? handleDrawerToggle : undefined}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
        >
          <ToolbarSpacer />
          <Box
            sx={{
              overflow: "auto",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <List sx={{ px: 1 }}>
              {menuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    "&.Mui-selected": {
                      backgroundColor: "primary.light",
                      color: "primary.contrastText",
                      "&:hover": {
                        backgroundColor: "primary.main",
                      },
                      "& .MuiListItemIcon-root": {
                        color: "inherit",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </StyledDrawer>
      )}

      <Main
        open={showSidebar && open}
        sx={{
          pt: { xs: 7, sm: 8 },
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 },
          width: "100%",
          maxWidth: "100%",
          overflow: "auto",
        }}
      >
        <ToolbarSpacer />
        {children}
      </Main>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 180,
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1.5,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem component={Link} to="/profile">
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Profile"
            primaryTypographyProps={{ variant: "body2" }}
          />
        </MenuItem>
        <MenuItem component={Link} to="/settings">
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            primaryTypographyProps={{ variant: "body2" }}
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LoginIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ variant: "body2" }}
          />
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 280,
            maxWidth: "100%",
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1.5,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem>
          <Typography variant="body2" color="text.secondary">
            No new notifications
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MainLayout;
