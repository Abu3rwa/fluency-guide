import React from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { Translate as TranslateIcon } from "@mui/icons-material";

const LanguageMenu = ({
  languageAnchor,
  handleLanguageClick,
  handleLanguageClose,
  handleLanguageChange,
  languageIconColor,
  t,
}) => (
  <>
    <IconButton
      size="small"
      onClick={handleLanguageClick}
      sx={{
        color: languageIconColor,
        p: { xs: 0.25, sm: 1 },
        "&:hover": {
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.04)",
        },
      }}
    >
      <TranslateIcon sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" } }} />
    </IconButton>
    <Menu
      anchorEl={languageAnchor}
      open={Boolean(languageAnchor)}
      onClose={handleLanguageClose}
    >
      <MenuItem onClick={() => handleLanguageChange("en")}>
        {t("language.en")}
      </MenuItem>
      <MenuItem onClick={() => handleLanguageChange("ar")}>
        {t("language.ar")}
      </MenuItem>
    </Menu>
  </>
);

export default LanguageMenu;
