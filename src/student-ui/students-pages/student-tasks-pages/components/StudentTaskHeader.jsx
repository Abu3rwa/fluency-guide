import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import InfoIcon from "@mui/icons-material/Info";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useTranslation } from "react-i18next";

const StudentTaskHeader = ({
  title,
  difficulty,
  onPause,
  isPaused,
  showPauseButton,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [infoOpen, setInfoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        // Mobile-specific improvements
        "@media (max-width: 600px)": {
          position: "sticky",
          top: 0,
          zIndex: 1100,
        },
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontSize: { xs: "1rem", sm: "1.25rem" },
            // Prevent text overflow on mobile
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: { xs: "60%", sm: "70%" },
          }}
          dir="auto"
        >
          {title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          {difficulty && (
            <Chip
              label={t(`tasks.difficulty.${difficulty}`)}
              sx={{
                mr: { xs: 1, sm: 2 },
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                height: { xs: 24, sm: 32 },
              }}
            />
          )}
          {showPauseButton && (
            <IconButton
              color="inherit"
              onClick={onPause}
              sx={{
                // Ensure proper touch target on mobile
                minWidth: { xs: 44, sm: 40 },
                minHeight: { xs: 44, sm: 40 },
              }}
            >
              {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            </IconButton>
          )}
          <IconButton
            color="inherit"
            onClick={() => setInfoOpen(true)}
            sx={{
              // Ensure proper touch target on mobile
              minWidth: { xs: 44, sm: 40 },
              minHeight: { xs: 44, sm: 40 },
            }}
          >
            <InfoIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => setSettingsOpen(true)}
            sx={{
              // Ensure proper touch target on mobile
              minWidth: { xs: 44, sm: 40 },
              minHeight: { xs: 44, sm: 40 },
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
      <Dialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        fullScreen={isSmallScreen}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
            pb: { xs: 1, sm: 2 },
          }}
        >
          {t("tasks.infoTitle")}
        </DialogTitle>
        <DialogContent
          sx={{
            p: { xs: 2, sm: 3 },
            "& .MuiDialogContent-root": {
              p: { xs: 2, sm: 3 },
            },
          }}
        >
          <Typography
            dir="auto"
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            {t("tasks.infoContent")}
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 2, sm: 3 },
            gap: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={() => setInfoOpen(false)}
            startIcon={<CloseIcon />}
            sx={{
              minHeight: { xs: 44, sm: 36 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            {t("common.close")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fullScreen={isSmallScreen}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
            pb: { xs: 1, sm: 2 },
          }}
        >
          {t("tasks.settingsTitle")}
        </DialogTitle>
        <DialogContent
          sx={{
            p: { xs: 2, sm: 3 },
            "& .MuiDialogContent-root": {
              p: { xs: 2, sm: 3 },
            },
          }}
        >
          <Typography
            dir="auto"
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            {t("tasks.settingsContent")}
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 2, sm: 3 },
            gap: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={() => setSettingsOpen(false)}
            startIcon={<CloseIcon />}
            sx={{
              minHeight: { xs: 44, sm: 36 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            {t("common.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default StudentTaskHeader;
