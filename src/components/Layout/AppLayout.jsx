import React, { useState } from "react";
import {
  Box,
  useMediaQuery,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import Header from "./Header";
import { useTheme } from "@mui/material/styles";
import MobileDrawer from "../MobileDrawer/MobileDrawer";
import { getMenuItems } from "./menuItems";
import { useTranslation } from "react-i18next";

const AppLayout = ({ children }) => {
  const { user, userData } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = getMenuItems(user, userData, t);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column" }}
      pt={6}
      className="app-layout"
    >
      <Header
        onDrawerToggle={handleDrawerToggle}
        showDrawerButton={isMobile}
        menuItems={menuItems}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        open={mobileOpen}
        onClose={handleDrawerToggle}
        menuItems={menuItems}
        theme={theme}
      />

      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: "calc(100vh - 64px)",
            backgroundColor: theme.palette.background.default,
            width: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
