import React, { useState } from "react";
import { Box, IconButton, Tooltip, Snackbar } from "@mui/material";
import { useTranslation } from "react-i18next";
import { colors } from "../../theme";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkIcon from "@mui/icons-material/Link";

function ShareButtons({ title, url, imageUrl }) {
    const { i18n, t } = useTranslation();
    const isArabic = i18n.language === "ar";
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const shareUrl = url || window.location.href;
    const shareTitle = encodeURIComponent(title || "");

    const handleWhatsApp = () => {
        window.open(`https://wa.me/?text=${shareTitle}%20${encodeURIComponent(shareUrl)}`, "_blank");
    };

    const handleFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setSnackbarOpen(true);
    };

    const buttonStyle = {
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        p: 1,
        "&:hover": {
            bgcolor: "rgba(0, 137, 123, 0.08)"
        }
    };

    return (
        <>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Tooltip title="WhatsApp">
                    <IconButton onClick={handleWhatsApp} sx={{ ...buttonStyle, color: "#25D366" }}>
                        <WhatsAppIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Facebook">
                    <IconButton onClick={handleFacebook} sx={{ ...buttonStyle, color: "#4267B2" }}>
                        <FacebookIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title={t('blog.copyLink')}>
                    <IconButton onClick={handleCopyLink} sx={{ ...buttonStyle, color: colors.text.secondary }}>
                        <LinkIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                message={t('blog.linkCopied')}
            />
        </>
    );
}

export default ShareButtons;
