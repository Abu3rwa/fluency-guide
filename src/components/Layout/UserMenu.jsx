import React from "react";
import {
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "../../routes/constants";

const UserMenu = ({
  userMenuAnchor,
  handleUserMenuClick,
  handleUserMenuClose,
  handleLogout,
  isAdmin,
  currentUser,
  languageIconColor,
  t,
  navigate,
}) => {
  if (!currentUser) {
    return (
      <div style={{ color: "red", fontWeight: 600 }}>
        UserMenu: No user data
      </div>
    );
  }
  const avatarLetter = currentUser?.email?.[0]?.toUpperCase() || "";
  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: { xs: 0.5, sm: 1 },
          alignItems: "center",
        }}
      >
        <IconButton
          size="small"
          onClick={handleUserMenuClick}
          sx={{
            color: languageIconColor,
            p: { xs: 0.5, sm: 1 },
            "&:hover": {
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main" }}>
            {avatarLetter}
          </Avatar>
        </IconButton>
      </Box>
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      >
        {isAdmin && (
          <MenuItem
            component={RouterLink}
            to={ROUTES.DASHBOARD}
            onClick={handleUserMenuClose}
          >
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t("navigation.dashboard")}</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("auth.logout")}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/student/dashboard/${currentUser.uid}`);
            handleUserMenuClose();
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("navigation.profile")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
