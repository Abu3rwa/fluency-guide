import React from "react";
import { Box, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { colors } from "../../theme";

function CategoryFilter({ categories, selected, onSelect }) {
    const { i18n, t } = useTranslation();
    const isArabic = i18n.language === "ar";

    return (
        <Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mb: 3
            }}
        >
            <Chip
                label={isArabic ? "الكل" : "All"}
                onClick={() => onSelect(null)}
                sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    bgcolor: !selected ? colors.primary.main : "transparent",
                    color: !selected ? "#fff" : colors.text.primary,
                    border: "1px solid",
                    borderColor: !selected ? colors.primary.main : "divider",
                    "&:hover": {
                        bgcolor: !selected ? colors.primary.dark : "rgba(0, 137, 123, 0.08)"
                    }
                }}
            />
            {categories.map((cat) => {
                const label = isArabic ? cat.ar : cat.en;
                const isSelected = selected === cat.en;

                return (
                    <Chip
                        key={cat.en}
                        label={label}
                        onClick={() => onSelect(cat.en)}
                        sx={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 500,
                            bgcolor: isSelected ? colors.primary.main : "transparent",
                            color: isSelected ? "#fff" : colors.text.primary,
                            border: "1px solid",
                            borderColor: isSelected ? colors.primary.main : "divider",
                            "&:hover": {
                                bgcolor: isSelected ? colors.primary.dark : "rgba(0, 137, 123, 0.08)"
                            }
                        }}
                    />
                );
            })}
        </Box>
    );
}

export default CategoryFilter;
