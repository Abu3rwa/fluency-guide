import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Language as LanguageIcon,
  Translate as TranslateIcon,
} from "@mui/icons-material";

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    // Update document direction for RTL languages
    document.dir = language === "ar" ? "rtl" : "ltr";
    // Update document language
    document.documentElement.lang = language;
    handleMenuClose();
  };

  const languages = [
    { code: "en", name: t("language.en"), flag: "🇺🇸" },
    { code: "ar", name: t("language.ar"), flag: "🇸🇦" },
    { code: "fr", name: t("language.fr"), flag: "🇫🇷" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <>
      <Tooltip title={t("language.changeLanguage")}>
        <IconButton
          onClick={handleMenuOpen}
          sx={{
            color: "inherit",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            width: 40,
            height: 40,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: "1.2rem" }}>
              {currentLanguage?.flag}
            </Typography>
          </Box>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 180,
            boxShadow: theme.shadows[3],
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t("language.changeLanguage")}
          </Typography>
        </Box>
        <Divider />
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={i18n.language === language.code}
            sx={{
              py: 1.5,
              px: 2,
              direction: language.code === "ar" ? "rtl" : "ltr",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
              "&.Mui-selected": {
                backgroundColor: "rgba(0, 0, 0, 0.08)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.12)",
                },
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="body1" sx={{ fontSize: "1.2rem" }}>
                {language.flag}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily:
                    language.code === "ar" ? "Arial, sans-serif" : "inherit",
                  fontWeight: i18n.language === language.code ? 600 : 400,
                }}
              >
                {language.name}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
