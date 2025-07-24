import React, { useState } from "react";
import { Box, Typography, Button, Modal, Fade } from "@mui/material";
import GradientText from "./GradientText";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import heroImage from "../../assests/heroImage.png";

const HeroSection = ({ isRTL, t, navigate, theme }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: 400, md: "80vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, md: 8 },
        pt: { xs: "80px", md: "100px" },
        pb: { xs: 8, md: 8 },
        flexDirection: "column",
        overflow: "hidden",
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "rgba(0,0,0,0.4)",
          zIndex: 1,
        }}
      />
      {/* Content with fade-in animation */}
      <Fade in timeout={1000}>
        <Box
          sx={{
            color: "#fff",
            textAlign: { xs: "center", md: isRTL ? "right" : "left" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: { xs: "center", md: isRTL ? "flex-end" : "flex-start" },
            zIndex: 2,
            py: { xs: 8, md: 0 },
            mx: { xs: 2, md: 8 },
            position: "relative",
          }}
        >
          <GradientText
            variant="h1"
            sx={{
              mb: 2,
              textAlign: { xs: "center", md: "left" },
              fontSize: { xs: "2.5rem", md: "4rem" },
            }}
          >
            {t("landing.hero.title")}{" "}
            <Box component="span" color="secondary.main">
              {t("landing.hero.titleHighlight")}
            </Box>
          </GradientText>
          <Typography
            variant="h5"
            // color="textSecondary"
            className="hero-subtitle"
            sx={{
              mb: 4,
              textAlign: { xs: "center", md: "left" },
              fontWeight: 500,
            }}
          >
            {t("landing.hero.subtitle")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: { xs: 2, sm: 2 },
              justifyContent: { xs: "center", md: "flex-start" },
              flexDirection: { xs: "column", sm: "row" },
              width: { xs: "100%", sm: "auto" },
              alignItems: { xs: "stretch", sm: "center" },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate("/signup")}
              sx={{
                px: { xs: 2, md: 4 },
                py: { xs: 1.25, md: 1.5 },
                fontSize: { xs: "1rem", md: "1.1rem" },
                borderRadius: "30px",
                fontWeight: 700,
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {t("landing.hero.startLearning")}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={isRTL ? null : <PlayCircleOutlineIcon />}
              endIcon={isRTL ? <PlayCircleOutlineIcon /> : null}
              onClick={() => setOpen(true)}
              sx={{
                px: { xs: 2, md: 4 },
                py: { xs: 1.25, md: 1.5 },
                fontSize: { xs: "1rem", md: "1.1rem" },
                borderRadius: "30px",
                fontWeight: 700,
                transition: "all 0.3s ease",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {t("landing.hero.watchDemo")}
            </Button>
          </Box>
        </Box>
      </Fade>
      {/* Modal for video */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
            borderRadius: 2,
            outline: "none",
            width: { xs: "90vw", sm: 560 },
            maxWidth: "100vw",
          }}
        >
          <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Demo Video"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: 8,
              }}
            />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default HeroSection;
