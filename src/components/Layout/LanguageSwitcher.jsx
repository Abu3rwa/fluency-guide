import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useTheme,
  Tooltip,
  Fade,
  alpha,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  Check as CheckIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { useRTL, getDirectionalTextAlign } from "../../utils/rtlUtils";

const LanguageSwitcher = ({ 
  ariaLabel, 
  disabled = false,
  variant = "flag", // "flag", "icon", "text"
  showLabel = false,
}) => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isChanging, setIsChanging] = useState(false);
  const theme = useTheme();
  const isRTL = useRTL();


  const handleMenuOpen = useCallback((event) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
  }, [disabled]);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLanguageChange = useCallback(async (language) => {
    if (language === i18n.language || isChanging) {
      handleMenuClose();
      return;
    }
    
    setIsChanging(true);
    
    try {
      // Change language
      await i18n.changeLanguage(language);
      localStorage.setItem("i18nextLng", language);
      
      // Enhanced document updates with smooth transitions
      const newDir = language === "ar" ? "rtl" : "ltr";
      document.dir = newDir;
      document.documentElement.dir = newDir;
      document.documentElement.lang = language;
      
      // Add custom event for other components to listen to language changes
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { 
          language, 
          previousLanguage: i18n.language,
          direction: newDir
        }
      }));
      
      // Brief delay for better UX feedback
      setTimeout(() => {
        setIsChanging(false);
        handleMenuClose();
      }, 300);
      
    } catch (error) {
      console.error('Language change error:', error);
      setIsChanging(false);
      handleMenuClose();
    }
  }, [i18n, handleMenuClose, isChanging]);

  // Simple keyboard navigation
  const handleKeyDown = useCallback((event) => {
    if (disabled) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMenuOpen(event);
    }
  }, [disabled, handleMenuOpen]);

  // Language configuration with enhanced metadata
  const languages = useMemo(() => [
    { 
      code: "en", 
      flag: "🇺🇸", 
      name: "English",
      nativeName: "English",
      dir: "ltr"
    },
    { 
      code: "ar", 
      flag: "🇸🇦", 
      name: "Arabic",
      nativeName: "العربية",
      dir: "rtl"
    },
  ], []);

  const currentLanguage = useMemo(() => 
    languages.find((lang) => lang.code === i18n.language) || languages[0],
    [languages, i18n.language]
  );

  // Get the opposite language to show what user will switch TO
  const targetLanguage = useMemo(() => {
    const currentCode = i18n.language;
    return languages.find((lang) => lang.code !== currentCode) || languages[0];
  }, [languages, i18n.language]);



  // Render method based on variant
  const renderLanguageButton = () => {
    const tooltipTitle = t("language.changeLanguage");
    
    if (variant === "icon") {
      return (
        <Tooltip title={tooltipTitle} arrow placement="bottom">
          {(disabled || isChanging) ? (
            <span>
              <IconButton
                onClick={handleMenuOpen}
                onKeyDown={handleKeyDown}
                disabled={disabled || isChanging}
                aria-label={ariaLabel || tooltipTitle}
                aria-expanded={Boolean(anchorEl)}
                aria-haspopup="menu"
                sx={{
                  transition: "all 0.2s ease",
                  opacity: isChanging ? 0.7 : 1,
                  "&:hover": {
                    transform: "scale(1.1)",
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                  "&:disabled": {
                    opacity: 0.5,
                  },
                }}
              >
                {isChanging ? (
                  <CircularProgress size={20} />
                ) : (
                  <LanguageIcon />
                )}
              </IconButton>
            </span>
          ) : (
            <IconButton
              onClick={handleMenuOpen}
              onKeyDown={handleKeyDown}
              disabled={disabled || isChanging}
              aria-label={ariaLabel || tooltipTitle}
              aria-expanded={Boolean(anchorEl)}
              aria-haspopup="menu"
              sx={{
                transition: "all 0.2s ease",
                opacity: isChanging ? 0.7 : 1,
                "&:hover": {
                  transform: "scale(1.1)",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
                "&:disabled": {
                  opacity: 0.5,
                },
              }}
            >
              {isChanging ? (
                <CircularProgress size={20} />
              ) : (
                <LanguageIcon />
              )}
            </IconButton>
          )}
        </Tooltip>
      );
    }
    
    if (variant === "text") {
      return (
        <Tooltip title={tooltipTitle} arrow placement="bottom">
          {(disabled || isChanging) ? (
            <span>
              <IconButton
                onClick={handleMenuOpen}
                onKeyDown={handleKeyDown}
                disabled={disabled || isChanging}
                aria-label={ariaLabel || tooltipTitle}
                aria-expanded={Boolean(anchorEl)}
                aria-haspopup="menu"
                sx={{
                  transition: "all 0.2s ease",
                  opacity: isChanging ? 0.7 : 1,
                  px: 1,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {isChanging ? (
                    <CircularProgress size={16} />
                  ) : (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {currentLanguage?.nativeName}
                      </Typography>
                      {showLabel && (
                        <Typography variant="caption" color="text.secondary">
                          {targetLanguage?.nativeName}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </IconButton>
            </span>
          ) : (
            <IconButton
              onClick={handleMenuOpen}
              onKeyDown={handleKeyDown}
              disabled={disabled || isChanging}
              aria-label={ariaLabel || tooltipTitle}
              aria-expanded={Boolean(anchorEl)}
              aria-haspopup="menu"
              sx={{
                transition: "all 0.2s ease",
                opacity: isChanging ? 0.7 : 1,
                px: 1,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {isChanging ? (
                  <CircularProgress size={16} />
                ) : (
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {currentLanguage?.nativeName}
                    </Typography>
                    {showLabel && (
                      <Typography variant="caption" color="text.secondary">
                        {targetLanguage?.nativeName}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </IconButton>
          )}
        </Tooltip>
      );
    }
    
    // Default flag variant
    return (
      <Tooltip title={tooltipTitle} arrow placement="bottom">
        {(disabled || isChanging) ? (
          <span>
            <IconButton
              onClick={handleMenuOpen}
              onKeyDown={handleKeyDown}
              disabled={disabled || isChanging}
              aria-label={ariaLabel || tooltipTitle}
              aria-expanded={Boolean(anchorEl)}
              aria-haspopup="menu"
              sx={{
                fontSize: "1.5rem",
                transition: "all 0.2s ease",
                opacity: isChanging ? 0.7 : 1,
                "&:hover": {
                  transform: "scale(1.1)",
                },
                "&:disabled": {
                  opacity: 0.5,
                  transform: "none",
                },
              }}
            >
              {isChanging ? (
                <CircularProgress size={20} />
              ) : (
                targetLanguage?.flag
              )}
            </IconButton>
          </span>
        ) : (
          <IconButton
            onClick={handleMenuOpen}
            onKeyDown={handleKeyDown}
            disabled={disabled || isChanging}
            aria-label={ariaLabel || tooltipTitle}
            aria-expanded={Boolean(anchorEl)}
            aria-haspopup="menu"
            sx={{
              fontSize: "1.5rem",
              transition: "all 0.2s ease",
              opacity: isChanging ? 0.7 : 1,
              "&:hover": {
                transform: "scale(1.1)",
              },
              "&:disabled": {
                opacity: 0.5,
                transform: "none",
              },
            }}
          >
            {isChanging ? (
              <CircularProgress size={20} />
            ) : (
              targetLanguage?.flag
            )}
          </IconButton>
        )}
      </Tooltip>
    );
  };

  return (
    <>
      {renderLanguageButton()}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 200 }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isRTL ? "left" : "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: isRTL ? "left" : "right",
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 140,
            borderRadius: 2,
            boxShadow: theme.shadows[8],
            direction: isRTL ? "rtl" : "ltr",
          },
        }}
      >
        {/* Enhanced language options */}
        {languages.map((language) => {
          const isSelected = i18n.language === language.code;
          const isDisabled = isChanging;
          
          return (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              selected={isSelected}
              disabled={isDisabled}
              sx={{
                fontSize: "1.2rem",
                justifyContent: "space-between",
                py: 1.5,
                px: 2,
                minHeight: 48,
                textAlign: getDirectionalTextAlign(isRTL),
                "&.Mui-selected": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
                "&.Mui-disabled": {
                  opacity: 0.5,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <span style={{ fontSize: "1.5rem" }}>{language.flag}</span>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {language.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {language.nativeName}
                  </Typography>
                </Box>
              </Box>
              {isSelected && (
                <CheckIcon 
                  sx={{ 
                    fontSize: "1rem",
                    color: theme.palette.primary.main,
                  }} 
                />
              )}
              {isDisabled && (
                <CircularProgress size={16} />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

// Enhanced Language Switcher with multiple variants and RTL support
// UX: Shows the flag of the language you'll switch TO (not current language)
// Variants: "flag" (default), "icon", "text"
// Example: When current is Arabic, shows English flag 🇺🇸 to switch to English
export default LanguageSwitcher;
