import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { motion, AnimatePresence } from "framer-motion";

const FAQSection = ({ t, faqs = [] }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Try to get array, else fallback to legacy object keys
  let fallbackFaqItems = t("landing.faq.items", { returnObjects: true });

  if (!Array.isArray(fallbackFaqItems)) {
    // Fallback: build array from question/answer keys
    fallbackFaqItems = [];
    for (let i = 1; i <= 10; i++) {
      const question = t(`faq.question${i}`);
      const answer = t(`landing.faq.answer${i}`);
      if (question && question !== `landing.faq.question${i}`) {
        fallbackFaqItems.push({ question, answer });
      }
    }
  }

  // Use dynamic FAQs if available, otherwise use fallback
  const faqItems = faqs.length > 0 ? faqs : fallbackFaqItems;

  // Filter FAQ items based on search query
  const filteredFAQs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 12 },
        bgcolor: theme.palette.background.default,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.divider}, ${theme.palette.primary.main}, ${theme.palette.divider})`,
        },
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 4, md: 6 },
          }}
        >
          <Typography
            component={motion.h2}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            variant="h4"
            color="primary"
            sx={{
              mb: 2,
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
            }}
          >
            {t("landing.faq.title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: "600px",
              mx: "auto",
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
            {t("landing.faq.subtitle")}
          </Typography>

          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{
              maxWidth: "500px",
              mx: "auto",
              mb: 6,
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t("landing.faq.searchPlaceholder")}
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear search"
                      onClick={clearSearch}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "12px",
                  bgcolor: "background.paper",
                  "& fieldset": {
                    borderColor: "divider",
                  },
                },
              }}
            />
          </Box>
        </Box>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <AnimatePresence mode="wait">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item, idx) => (
                <motion.div key={idx} variants={itemVariants} layout>
                  <Accordion
                    expanded={expanded === `panel${idx}`}
                    onChange={handleChange(`panel${idx}`)}
                    aria-label={`FAQ: ${item.question}`}
                    sx={{
                      bgcolor: "background.paper",
                      color: "text.secondary",
                      boxShadow: 1,
                      mb: 2,
                      borderRadius: "12px !important",
                      "&::before": {
                        display: "none",
                      },
                      "&.Mui-expanded": {
                        boxShadow: 4,
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreIcon
                          sx={{
                            transition: "transform 0.3s",
                            transform:
                              expanded === `panel${idx}`
                                ? "rotate(180deg)"
                                : "rotate(0)",
                          }}
                        />
                      }
                      aria-controls={`faq-content-${idx}`}
                      id={`faq-header-${idx}`}
                      sx={{
                        "& .MuiAccordionSummary-content": {
                          my: 2,
                        },
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "text.primary",
                          fontWeight: 600,
                          fontSize: { xs: "1rem", sm: "1.1rem" },
                        }}
                      >
                        {item.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        px: 3,
                        pb: 3,
                        pt: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          color: "text.secondary",
                          lineHeight: 1.7,
                        }}
                      >
                        {item.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                sx={{
                  textAlign: "center",
                  py: 4,
                }}
              >
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  {t("landing.faq.noResults")}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={clearSearch}
                >
                  {t("landing.faq.clearSearch")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Container>
    </Box>
  );
};

export default FAQSection;
