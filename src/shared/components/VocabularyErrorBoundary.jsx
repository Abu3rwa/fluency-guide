import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
} from "@mui/material";
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

class VocabularyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Vocabulary Error Boundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to analytics or error reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In production, you would send this to your error reporting service
    // For now, we'll just log to console
    console.error("Vocabulary Error Report:", {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleReportBug = () => {
    const errorReport = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In production, you would send this to your bug reporting system
    console.log("Bug Report:", errorReport);
    
    // You could also open a new window/tab with the error details
    const errorDetails = encodeURIComponent(JSON.stringify(errorReport, null, 2));
    window.open(`mailto:support@yourapp.com?subject=Vocabulary Error Report&body=${errorDetails}`);
  };

  render() {
    if (this.state.hasError) {
      return (
        <VocabularyErrorFallback
          onRetry={this.handleRetry}
          onReportBug={this.handleReportBug}
          error={this.state.error}
          retryCount={this.state.retryCount}
        />
      );
    }

    return this.props.children;
  }
}

const VocabularyErrorFallback = ({ onRetry, onReportBug, error, retryCount }) => {
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      p={3}
    >
      <Card sx={{ maxWidth: 600, width: "100%" }}>
        <CardContent sx={{ textAlign: "center", p: 4 }}>
          <ErrorIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />

          <Typography variant="h5" component="h2" gutterBottom>
            {t("vocabulary.error.title", "Vocabulary Error")}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t("vocabulary.error.message", "Something went wrong while loading vocabulary content. Please try again.")}
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

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              size="large"
            >
              {t("common.retry", "Retry")}
            </Button>

            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              size="large"
            >
              {t("common.reload", "Reload Page")}
            </Button>
          </Box>

          {retryCount > 0 && (
            <Box sx={{ mb: 2 }}>
              <Chip
                label={`Retry attempt ${retryCount}`}
                color="warning"
                size="small"
              />
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="text"
              startIcon={<BugReportIcon />}
              onClick={onReportBug}
              size="small"
            >
              {t("common.reportBug", "Report Bug")}
            </Button>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: "block" }}
          >
            {t("vocabulary.error.help", "If the problem persists, please contact support.")}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VocabularyErrorBoundary; 