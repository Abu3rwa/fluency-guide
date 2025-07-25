import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const ContactSection = ({ t }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{ py: { xs: 4, md: 8 }, bgcolor: theme.palette.background.default }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              mb: { xs: 2, md: 4 },
              color: theme.palette.text.primary,
              fontFamily: theme.typography.h4.fontFamily,
              fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2.125rem" },
            }}
          >
            {t ? t("landing.contact.title") : "Contact Us"}
          </Typography>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            aria-label="Contact form"
          >
            <TextField
              fullWidth
              label={t ? t("landing.contact.name") : "Name"}
              margin="normal"
              variant="outlined"
              color="primary"
              aria-label={t ? t("landing.contact.name") : "Name"}
              sx={{
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontFamily: theme.typography.body1.fontFamily,
              }}
            />
            <TextField
              fullWidth
              label={t ? t("landing.contact.email") : "Email"}
              margin="normal"
              variant="outlined"
              color="primary"
              aria-label={t ? t("landing.contact.email") : "Email"}
              sx={{
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontFamily: theme.typography.body1.fontFamily,
              }}
            />
            <Tooltip
              title={
                t
                  ? t("landing.contact.messageTooltip")
                  : "Let us know how we can help!"
              }
              arrow
            >
              <TextField
                fullWidth
                label={t ? t("landing.contact.message") : "Message"}
                margin="normal"
                variant="outlined"
                color="primary"
                multiline
                rows={4}
                aria-label={t ? t("landing.contact.message") : "Message"}
                sx={{
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  fontFamily: theme.typography.body1.fontFamily,
                }}
              />
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{
                mt: 2,
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontFamily: theme.typography.button.fontFamily,
              }}
              aria-label={t ? t("landing.contact.send") : "Send Message"}
            >
              {t ? t("landing.contact.send") : "Send Message"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ContactSection;
