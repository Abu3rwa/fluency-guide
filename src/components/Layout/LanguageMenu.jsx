import React from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
} from "@mui/material";
import { Translate as TranslateIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// Helper to trigger Google Translate widget
function setGoogleTranslateLanguage(langCode) {
  const select = document.querySelector(".goog-te-combo");
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event("change"));
  }
}

const LanguageMenu = ({
  languageAnchor,
  handleLanguageClick,
  handleLanguageClose,
  handleLanguageChange,
  languageIconColor,
  t,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleBoth = (lang) => {
    handleLanguageChange(lang); // local i18n
    setGoogleTranslateLanguage(lang); // Google Translate widget
    handleLanguageClose();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleLanguageClick}
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: languageIconColor || theme.palette.text.primary,
          p: { xs: 0.25, sm: 1 },
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <TranslateIcon sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" } }} />
      </IconButton>
      {isMobile ? (
        <Drawer
          anchor="left"
          open={Boolean(languageAnchor)}
          onClose={handleLanguageClose}
          PaperProps={{
            sx: {
              width: 220,
              bgcolor: theme.palette.background.paper,
            },
          }}
        >
          <Box sx={{ mt: 2 }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleBoth("en")}>
                  <ListItemText primary={t("language.en")} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleBoth("ar")}>
                  <ListItemText primary={t("language.ar")} />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>
      ) : (
        <Menu
          anchorEl={languageAnchor}
          open={Boolean(languageAnchor)}
          onClose={handleLanguageClose}
        >
          <MenuItem onClick={() => handleBoth("en")}>
            {t("language.en")}
          </MenuItem>
          <MenuItem onClick={() => handleBoth("ar")}>
            {t("language.ar")}
          </MenuItem>
        </Menu>
      )}
    </>
  );
};

export default LanguageMenu;
