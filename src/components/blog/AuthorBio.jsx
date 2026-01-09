import React from "react";
import { Box, Avatar, Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import { colors } from "../../theme";

function AuthorBio({ author }) {
    const { i18n, t } = useTranslation();
    const isArabic = i18n.language === "ar";

    if (!author) return null;

    const bio = author.bio?.[isArabic ? "ar" : "en"] || author.bio?.en || "";

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                mt: 4,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "rgba(0, 137, 123, 0.02)"
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" }
                }}
            >
                <Avatar
                    src={author.avatar}
                    alt={author.name}
                    sx={{
                        width: 64,
                        height: 64,
                        bgcolor: colors.primary.main
                    }}
                >
                    {author.name?.charAt(0)}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: colors.text.secondary,
                            fontFamily: "'Montserrat', sans-serif",
                            textTransform: "uppercase",
                            letterSpacing: 1
                        }}
                    >
                        {isArabic ? "بقلم" : "Written by"}
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: colors.text.primary,
                            fontFamily: "'Montserrat', sans-serif",
                            mt: 0.5,
                            mb: 1
                        }}
                    >
                        {author.name}
                    </Typography>

                    {bio && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: colors.text.secondary,
                                lineHeight: 1.7,
                                fontFamily: "'Montserrat', sans-serif",
                                direction: isArabic ? "rtl" : "ltr"
                            }}
                        >
                            {bio}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Paper>
    );
}

export default AuthorBio;
