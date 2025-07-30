import React, { useState, useEffect } from "react";
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

const LanguageSwitcher = ({ ariaLabel }) => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Custom scroll lock for extra safety
  useEffect(() => {
    if (anchorEl) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [anchorEl]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("i18nextLng", language);
    // Update document direction for RTL languages
    document.dir = language === "ar" ? "rtl" : "ltr";
    // Update document language
    document.documentElement.lang = language;
    handleMenuClose();
  };

  const languages = [
    { code: "en", name: t("language.en"), flag: "EN" },
    { code: "ar", name: t("language.ar"), flag: "AR" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <>
      <Tooltip title={t("language.changeLanguage")}>
        <IconButton
          onClick={handleMenuOpen}
          aria-label={ariaLabel || t("language.changeLanguage")}
          sx={{
            color: theme.palette.text.primary,
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
            borderRadius: "50%",
            width: 40,
            height: 40,
            flexShrink: 0,
            outline: "none",
            boxShadow: "none",
            transition: "all 0.2s",
            "&:focus-visible": {
              boxShadow: "0 0 0 2px #1976d2",
            },
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(0, 0, 0, 0.08)",
              transform: "scale(1.05)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: "1rem", sm: "1.2rem" },
                lineHeight: 1,
              }}
            >
              {currentLanguage?.flag}
            </Typography>
          </Box>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        disableScrollLock={false}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          position: "absolute",
          zIndex: 1300,
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 120,
            maxWidth: 200,
            boxShadow: theme.shadows[8],
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
        ModalProps={{
          BackdropProps: {
            invisible: false,
            style: {
              background: "rgba(202, 28, 28, 0.99)",

              // width: "200px",
              // height: "150px",
              borderRadius: "8px",
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            fontWeight={600}
          >
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
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 1.5,
              px: 2,
              direction: language.code === "ar" ? "rtl" : "ltr",
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
              "&.Mui-selected": {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  backgroundColor: theme.palette.primary.main,
                },
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily:
                    language.code === "ar" ? "Arial, sans-serif" : "inherit",
                  fontWeight: i18n.language === language.code ? 600 : 400,
                  textAlign: "center",
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
