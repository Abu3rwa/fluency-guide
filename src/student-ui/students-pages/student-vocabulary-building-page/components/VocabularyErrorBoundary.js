import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

class VocabularyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console and any error reporting service
    console.error(
      "Vocabulary Error Boundary caught an error:",
      error,
      errorInfo
    );

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <VocabularyErrorFallback
          onRetry={this.handleRetry}
          error={this.state.error}
        />
      );
    }

    return this.props.children;
  }
}

const VocabularyErrorFallback = ({ onRetry, error }) => {
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      p={3}
    >
      <Card sx={{ maxWidth: 500, width: "100%" }}>
        <CardContent sx={{ textAlign: "center", p: 4 }}>
          <ErrorIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />

          <Typography variant="h5" component="h2" gutterBottom>
            {t("vocabulary.error.title")}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t("vocabulary.error.message")}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
              <Typography variant="body2" component="div">
                <strong>Error:</strong> {error.message}
              </Typography>
              {process.env.NODE_ENV === "development" && error.stack && (
                <details style={{ marginTop: "8px" }}>
                  <summary>Stack trace</summary>
                  <pre style={{ fontSize: "12px", overflow: "auto" }}>
                    {error.stack}
                  </pre>
                </details>
              )}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              size="large"
            >
              {t("common.retry")}
            </Button>

            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              size="large"
            >
              {t("common.reload")}
            </Button>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: "block" }}
          >
            {t("vocabulary.error.help")}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VocabularyErrorBoundary;
