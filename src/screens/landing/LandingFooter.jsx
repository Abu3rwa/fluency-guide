import React from "react";
import { Box, Container, Typography } from "@mui/material";

const LandingFooter = ({ t }) => (
  <Box
    component="footer"
    sx={{
      py: { xs: 3, md: 6 },
      px: { xs: 1, md: 2 },
      mt: "auto",
      bgcolor: "background.paper",
      color: "text.secondary",
    }}
    aria-label="Footer"
  >
    <Container maxWidth="lg">
      <Typography
        variant="body2"
        align="center"
        color="textSecondary"
        sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
      >
        {t
          ? t("landing.footer.copyright", {
              year: new Date().getFullYear(),
            })
          : `© ${new Date().getFullYear()} Your Company. All rights reserved.`}
      </Typography>
    </Container>
  </Box>
);

export default LandingFooter;
