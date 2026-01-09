import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        console.error('Error caught by boundary:', error, errorInfo);

        // Store error details
        this.setState({
            error,
            errorInfo
        });

        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        // Example: Sentry.captureException(error);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        // Reload the page
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const isArabic = document.documentElement.dir === 'rtl';

            return (
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'background.default',
                        padding: 2,
                    }}
                >
                    <Container maxWidth="sm">
                        <Paper
                            elevation={3}
                            sx={{
                                padding: { xs: 3, md: 5 },
                                textAlign: 'center',
                                borderRadius: 2,
                            }}
                        >
                            <ErrorOutlineIcon
                                sx={{
                                    fontSize: 80,
                                    color: 'error.main',
                                    mb: 2,
                                }}
                            />

                            <Typography
                                variant="h4"
                                component="h1"
                                gutterBottom
                                sx={{
                                    fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                                    fontWeight: 700,
                                    color: 'text.primary',
                                }}
                            >
                                {isArabic ? 'عذراً، حدث خطأ ما' : 'Oops! Something went wrong'}
                            </Typography>

                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{
                                    mb: 4,
                                    fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                                }}
                            >
                                {isArabic
                                    ? 'نعتذر عن الإزعاج. حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
                                    : "We apologize for the inconvenience. An unexpected error occurred. Please try again."}
                            </Typography>

                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<RefreshIcon />}
                                onClick={this.handleReset}
                                sx={{
                                    minWidth: 200,
                                    fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                                }}
                            >
                                {isArabic ? 'إعادة المحاولة' : 'Try Again'}
                            </Button>

                            {/* Show error details in development */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <Box
                                    sx={{
                                        mt: 4,
                                        p: 2,
                                        backgroundColor: 'grey.100',
                                        borderRadius: 1,
                                        textAlign: 'left',
                                        maxHeight: 300,
                                        overflow: 'auto',
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: 600, mb: 1, color: 'error.main' }}
                                    >
                                        Error Details (Development Only):
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        component="pre"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {this.state.error.toString()}
                                        {'\n\n'}
                                        {this.state.errorInfo?.componentStack}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Container>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
