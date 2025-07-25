import React from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FAQSection = ({ t }) => {
  const theme = useTheme();
  // Try to get array, else fallback to legacy object keys
  let faqItems = t("landing.faq.items", { returnObjects: true });

  if (!Array.isArray(faqItems)) {
    // Fallback: build array from question/answer keys (for legacy translation structure)
    faqItems = [];
    for (let i = 1; i <= 10; i++) {
      const question = t(`faq.question${i}`);
      const answer = t(`landing.faq.answer${i}`);
      // Only add if question exists and is not the key itself
      if (question && question !== `landing.faq.question${i}`) {
        faqItems.push({ question, answer });
      }
    }
  }

  return (
    <Box
      sx={{ py: { xs: 4, md: 8 }, bgcolor: theme.palette.background.default }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h4"
          align="center"
          // color="primary"
          sx={{
            mb: { xs: 2, md: 4 },
            color: theme.palette.text.primary,
            fontFamily: theme.typography.h4.fontFamily,
            fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2.125rem" },
          }}
        >
          {t("landing.faq.title")}
        </Typography>
        {faqItems.map((item, idx) => (
          <Accordion
            key={idx}
            aria-label={`FAQ: ${item.question}`}
            sx={{
              bgcolor: theme.palette.background.paper,
              color: theme.palette.text.secondary,
              boxShadow: 1,
              mb: { xs: 1, md: 2 },
              borderRadius: 2,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`faq-content-${idx}`}
              id={`faq-header-${idx}`}
            >
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary,
                  fontFamily: theme.typography.h6.fontFamily,
                }}
              >
                {item.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                sx={{
                  color: theme.palette.text.primary,
                  fontFamily: theme.typography.body1.fontFamily,
                }}
              >
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
};

export default FAQSection;
