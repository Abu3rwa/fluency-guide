import React, { useState, useEffect, useRef } from "react";
import { Mail, Lock, Eye, EyeOff, User, Sparkles } from "lucide-react";
import appLogo from "../assets/appLogo.png";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useCustomTheme } from "../contexts/ThemeContext";
import "./auth.css";
import FloatingParticles from "./auth/FloatingParticles";
import { validateEmail } from "./auth/utils";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";

const Auth = () => {
  // State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const emailInputRef = useRef(null);

  // Hooks
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const { userData, loading: userLoading } = useUser();
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Focus email input on mount
  useEffect(() => {
    setMounted(true);
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Redirect after successful login/signup
  useEffect(() => {
    if (success && userData && !userLoading) {
      if (userData.id) {
        navigate(`/student/dashboard/${userData.id}`, { replace: true });
      } else {
        const timeout = setTimeout(() => {
          if (userData.id) {
            navigate(`/student/dashboard/${userData.id}`, { replace: true });
          }
        }, 300);
        return () => clearTimeout(timeout);
      }
    }
  }, [success, userData, userLoading, navigate]);

  // Validation helpers
  const validateFields = () => {
    const errors = {};
    if (!email)
      errors.email = t("auth.register.email", "Email Address");
    else if (!validateEmail(email))
      errors.email = t("auth.register.invalidEmail", "Please enter a valid email address");
    if (!password)
      errors.password = t("auth.password", "Password");
    else if (password.length < 6)
      errors.password = t("auth.register.weakPassword", "Password should be at least 6 characters");
    if (!isLogin) {
      if (!name) errors.name = t("auth.fullName", "Full Name");
      if (!confirmPassword)
        errors.confirmPassword = t("auth.confirmPassword", "Confirm Password");
      else if (password !== confirmPassword)
        errors.confirmPassword = t("auth.register.passwordMismatch", "Passwords do not match");
    }
    return errors;
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        setSuccess(t("auth.loginSuccess", "Login successful! Redirecting..."));
      } else {
        await signup(email, password, name);
        setSuccess(t("auth.signupSuccess", "Account created! You can now log in."));
        // Navigation will be handled by the useEffect above
      }
    } catch (err) {
      let msg = err.message;
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        msg = t("auth.register.invalidEmail", "Please enter a valid email address");
      } else if (err.code === "auth/email-already-in-use") {
        msg = t("auth.register.emailExists", "This email is already registered");
      } else if (err.code === "auth/weak-password") {
        msg = t("auth.register.weakPassword", "Password should be at least 6 characters");
      } else if (err.code === "auth/invalid-email") {
        msg = t("auth.register.invalidEmail", "Please enter a valid email address");
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      console.log("Starting Google authentication...");
      await loginWithGoogle();
      setSuccess(t("auth.googleSuccess", "Google sign-in successful! Redirecting..."));
    } catch (err) {
      console.error("Google sign-in error:", err);
      
      let errorMessage = t("auth.googleFailed", "Google sign-in failed");
      
      if (err.message.includes('popup')) {
        if (err.message.includes('closed')) {
          errorMessage = t("auth.errors.popupClosed", "Login popup was closed. Please try again.");
        } else if (err.message.includes('blocked')) {
          errorMessage = t("auth.errors.popupBlocked", "Popup was blocked by your browser. Please allow popups and try again.");
        } else {
          errorMessage = t("auth.errors.popupCancelled", "Another login window is already open.");
        }
      } else if (err.message.includes('network')) {
        errorMessage = t("auth.errors.networkError", "Network error. Please check your internet connection.");
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = t("auth.errors.unauthorizedDomain", "This domain is not authorized for Google sign-in.");
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = t("auth.errors.operationNotAllowed", "Google sign-in is not enabled. Please contact support.");
      } else if (err.code === 'auth/invalid-api-key') {
        errorMessage = t("auth.errors.invalidApiKey", "Authentication configuration error. Please contact support.");
      } else {
        errorMessage = t("auth.errors.internalError", "Internal authentication error. Please try again later.");
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and signup
  const toggleMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin((prev) => !prev);
      setError("");
      setSuccess("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setFieldErrors({});
      setIsAnimating(false);
    }, 200);
  };

  if (!mounted) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`
          : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[100]} 100%)`,
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "center",
        pt: 4,
        position: "relative",
        overflow: "hidden",
      }}
      pt={{ md: 5, lg: 5, xl: 5 }}
    >
      <FloatingParticles />
      <Container maxWidth="sm">
        <Paper
          elevation={theme.palette.mode === 'dark' ? 16 : 8}
          sx={{
            p: 4,
            borderRadius: 4,
            background: theme.palette.background.paper,
            backdropFilter: "blur(20px)",
            border: `1px solid ${theme.palette.divider}`,
            position: "relative",
            zIndex: 1,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: "220px",
                height: "70px",
                margin: "0 auto",
                mb: 2,
                borderRadius: "8px",
                overflow: "hidden",
                // boxShadow: theme.shadows[4],
              }}
            >
              <img
                src={appLogo}
                alt="Sudanglish Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 1,
                // mt: 2,
              }}
            >
              {isLogin ? t("auth.welcomeBack") : t("auth.register.title", "Create Account")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.8rem",
              }}
            >
              {isLogin
                ? t("auth.signInSubtitle")
                : t("auth.register.subtitle", "Join our learning community today.")}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            {!isLogin && (
              <TextField
                fullWidth
                label={t("auth.fullName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                error={!!fieldErrors.name}
                helperText={fieldErrors.name}
                variant="outlined"
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? theme.palette.grey[900] 
                      : theme.palette.grey[50],
                    borderRadius: 3,
                    transition: 'all 0.2s ease-in-out',
                    '& fieldset': {
                      borderColor: theme.palette.divider,
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px',
                    },
                    '&.Mui-focused': {
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.text.secondary,
                    '&.Mui-focused': {
                      color: theme.palette.primary.main,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <User
                      size={20}
                      style={{
                        marginRight: 8,
                        color: theme.palette.text.secondary,
                      }}
                    />
                  ),
                }}
              />
            )}
            <TextField
              fullWidth
              label={t("auth.emailAddress")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              inputRef={emailInputRef}
              variant="outlined"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? theme.palette.grey[900] 
                    : theme.palette.grey[50],
                  borderRadius: 3,
                  transition: 'all 0.2s ease-in-out',
                  '& fieldset': {
                    borderColor: theme.palette.divider,
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary,
                  '&.Mui-focused': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <Mail
                    size={20}
                    style={{
                      marginRight: 8,
                      color: theme.palette.text.secondary,
                    }}
                  />
                ),
              }}
            />
            <TextField
              fullWidth
              label={t("auth.password")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              variant="outlined"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? theme.palette.grey[900] 
                    : theme.palette.grey[50],
                  borderRadius: 3,
                  transition: 'all 0.2s ease-in-out',
                  '& fieldset': {
                    borderColor: theme.palette.divider,
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary,
                  '&.Mui-focused': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <Lock
                    size={20}
                    style={{
                      marginRight: 8,
                      color: theme.palette.text.secondary,
                    }}
                  />
                ),
                endAdornment: (
                  <Button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    sx={{ 
                      minWidth: "auto", 
                      p: 0.5,
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                ),
              }}
            />
            {!isLogin && (
              <TextField
                fullWidth
                label={t("auth.confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                error={!!fieldErrors.confirmPassword}
                helperText={fieldErrors.confirmPassword}
                variant="outlined"
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? theme.palette.grey[900] 
                      : theme.palette.grey[50],
                    borderRadius: 3,
                    transition: 'all 0.2s ease-in-out',
                    '& fieldset': {
                      borderColor: theme.palette.divider,
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px',
                    },
                    '&.Mui-focused': {
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.text.secondary,
                    '&.Mui-focused': {
                      color: theme.palette.primary.main,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <Lock
                      size={20}
                      style={{
                        marginRight: 8,
                        color: theme.palette.text.secondary,
                      }}
                    />
                  ),
                  endAdornment: (
                    <Button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      sx={{ 
                        minWidth: "auto", 
                        p: 0.5,
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </Button>
                  ),
                }}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                mb: 2,
                borderRadius: 3,
                textTransform: 'none',
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                boxShadow: `0 4px 14px 0 ${theme.palette.primary.main}40`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: `0 6px 20px 0 ${theme.palette.primary.main}60`,
                  background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                },
                '&:disabled': {
                  background: theme.palette.action.disabledBackground,
                  transform: 'none',
                  boxShadow: 'none',
                },
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>{isLogin ? t("auth.loading.signingIn", "Signing you in...") : t("auth.loading.creatingAccount", "Creating your account...")}</span>
                </Box>
              ) : isLogin ? (
                t("auth.signIn")
              ) : (
                t("auth.register.signUpButton", "Create Account")
              )}
            </Button>

            {isLogin && (
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Button
                  type="button"
                  variant="text"
                  onClick={() => setError(t("auth.forgotPasswordComingSoon", "Password recovery feature is coming soon!"))}
                  sx={{ 
                    color: theme.palette.primary.main,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}10`,
                      color: theme.palette.primary.dark,
                    },
                  }}
                >
                  {t("auth.forgotPassword")}
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              {t("auth.or")}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{
              py: 1.5,
              mb: 3,
              borderRadius: 3,
              textTransform: 'none',
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[900] 
                : theme.palette.grey[50],
              transition: 'all 0.2s ease-in-out',
              "&:hover": {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? theme.palette.grey[800] 
                  : theme.palette.background.paper,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px 0 ${theme.palette.primary.main}20`,
              },
            }}
            startIcon={
              <svg width={20} height={20} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            }
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>{t("auth.loading.authenticating", "Authenticating with Google...")}</span>
              </Box>
            ) : (
              <>
                {isLogin 
                  ? t("auth.continueWithGoogle") 
                  : t("auth.register.signUpWithGoogle", "Sign up with Google")
                }
              </>
            )}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, mb: 1 }}
            >
              {isLogin ? t("auth.noAccount") : t("auth.register.haveAccount")}{" "}
              <Button
                type="button"
                variant="text"
                onClick={toggleMode}
                sx={{
                  color: theme.palette.primary.main,
                  textTransform: "none",
                  p: 0,
                  minWidth: "auto",
                  fontSize: "inherit",
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: theme.palette.primary.dark,
                    textDecoration: 'underline',
                  },
                }}
              >
                {isLogin ? t("auth.signUp") : t("auth.register.signInLink", "Sign in here")}
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Auth;
