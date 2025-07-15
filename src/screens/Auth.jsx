import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Container,
  Paper,
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Divider,
  useTheme,
  Stack,
  Alert,
  Fade,
  Slide,
  Zoom,
  Chip,
  LinearProgress,
} from "@mui/material";
import userService from "../services/userService";
import { useTranslation } from "react-i18next";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

const BRAND_LOGO = (
  <Box
    sx={{
      width: 80,
      height: 80,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      background: (theme) =>
        `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      mb: 2,
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "scale(1.05)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
      },
    }}
  >
    <Sparkles size={40} color="#fff" />
  </Box>
);

const FloatingParticles = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {[...Array(12)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}40, ${theme.palette.secondary.main}40)`,
            borderRadius: "50%",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${
              Math.random() * 3 + 2
            }s ease-in-out infinite alternate`,
            animationDelay: `${Math.random() * 2}s`,
            "@keyframes float": {
              "0%": { transform: "translateY(0px)" },
              "100%": { transform: "translateY(-20px)" },
            },
          }}
        />
      ))}
    </Box>
  );
};

const Auth = () => {
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
  const [typingAnimation, setTypingAnimation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const emailInputRef = useRef(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const theme = useTheme();
  const { t } = useTranslation();
  const { user, userData, loading: userLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }

    // Typing animation effect
    const messages = [
      "Welcome to our platform",
      "Secure authentication",
      "Your journey begins here",
    ];

    let messageIndex = 0;
    let charIndex = 0;

    const typeEffect = () => {
      const currentMessage = messages[messageIndex];

      if (isDeleting) {
        setTypingAnimation(currentMessage.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setTypingAnimation(currentMessage.substring(0, charIndex + 1));
        charIndex++;
      }

      if (!isDeleting && charIndex === currentMessage.length) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        messageIndex = (messageIndex + 1) % messages.length;
      }
    };

    const timer = setInterval(typeEffect, isDeleting ? 50 : 100);

    return () => clearInterval(timer);
  }, [isDeleting]);

  useEffect(() => {
    if (success && userData && !userLoading) {
      if (userData.isAdmin) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/landing", { replace: true });
      }
    }
  }, [success, userData, userLoading, navigate]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const PasswordStrengthMeter = ({ password }) => {
    const strength = getPasswordStrength(password);
    const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
    const colors = [
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.success.main,
    ];

    const requirements = [
      { label: "8+ characters", met: password.length >= 8 },
      { label: "Uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Number", met: /[0-9]/.test(password) },
      { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
    ];

    return (
      <Box mt={1}>
        <LinearProgress
          variant="determinate"
          value={(strength / 4) * 100}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: theme.palette.action.hover,
            "& .MuiLinearProgress-bar": {
              bgcolor: colors[strength - 1] || theme.palette.grey[400],
              borderRadius: 4,
              transition: "all 0.3s ease",
            },
          }}
        />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={1}
        >
          {password && (
            <Typography
              variant="caption"
              sx={{
                color: colors[strength - 1] || theme.palette.text.secondary,
                fontWeight: 600,
              }}
            >
              {strengthLabels[strength - 1] || ""}
            </Typography>
          )}
          <Box display="flex" gap={0.5}>
            {requirements.map((req, index) => (
              <Chip
                key={index}
                label={req.label}
                size="small"
                variant={req.met ? "filled" : "outlined"}
                color={req.met ? "success" : "default"}
                sx={{
                  fontSize: "0.65rem",
                  height: 20,
                  transition: "all 0.2s ease",
                  transform: req.met ? "scale(1.05)" : "scale(1)",
                }}
                icon={
                  req.met ? (
                    <CheckCircle size={12} />
                  ) : (
                    <AlertCircle size={12} />
                  )
                }
              />
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  const validateFields = () => {
    const errors = {};
    if (!email)
      errors.email = t("validation.emailRequired", "Email is required");
    else if (!validateEmail(email))
      errors.email = t("validation.invalidEmail", "Invalid email format");
    if (!password)
      errors.password = t(
        "validation.passwordRequired",
        "Password is required"
      );
    else if (password.length < 8)
      errors.password = t(
        "validation.weakPassword",
        "Password must be at least 8 characters"
      );
    if (!isLogin) {
      if (!name) errors.name = t("validation.nameRequired", "Name is required");
      if (!confirmPassword)
        errors.confirmPassword = t(
          "validation.confirmPasswordRequired",
          "Please confirm your password"
        );
      else if (password !== confirmPassword)
        errors.confirmPassword = t(
          "validation.passwordMismatch",
          "Passwords don't match"
        );
    }
    return errors;
  };

  const handleSubmit = async () => {
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
        await userService.signInWithEmail(email, password);
        setSuccess(t("auth.loginSuccess", "Login successful! Redirecting..."));
      } else {
        await userService.signUpWithEmail(email, password);
        setSuccess(
          t("auth.signupSuccess", "Account created! You can now sign in.")
        );
        navigate("/landing");
      }
    } catch (err) {
      let msg = err.message;
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        msg = t("validation.invalidCredentials", "Invalid email or password");
      } else if (err.code === "auth/email-already-in-use") {
        msg = t("validation.emailInUse", "Email already in use");
      } else if (err.code === "auth/weak-password") {
        msg = t("validation.weakPassword", "Password is too weak");
      } else if (err.code === "auth/invalid-email") {
        msg = t("validation.invalidEmail", "Invalid email address");
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await userService.signInWithGoogle();
      setSuccess(t("auth.googleSuccess", "Google sign-in successful!"));
    } catch (err) {
      setError(t("auth.googleFailed", "Google sign-in failed"));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
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

  const EnhancedTextField = ({
    label,
    value,
    onChange,
    type = "text",
    error,
    helperText,
    icon,
    showToggle = false,
    showValue = false,
    onToggle,
    autoComplete,
    ...props
  }) => {
    return (
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={onChange}
        type={type}
        error={!!error}
        helperText={helperText}
        onFocus={() => setFocusedField(label)}
        onBlur={() => setFocusedField(null)}
        autoComplete={autoComplete}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {React.cloneElement(icon, {
                size: 20,
                color:
                  focusedField === label
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
              })}
            </InputAdornment>
          ),
          endAdornment: showToggle && (
            <InputAdornment position="end">
              <IconButton
                onClick={onToggle}
                edge="end"
                sx={{
                  color:
                    focusedField === label
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                }}
              >
                {showValue ? <EyeOff size={20} /> : <Eye size={20} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            transition: "all 0.2s ease",
            "&.Mui-focused": {
              transform: "scale(1.02)",
              boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
            },
          },
        }}
        {...props}
      />
    );
  };

  if (!mounted) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: `radial-gradient(ellipse at top, ${theme.palette.primary.light}20, transparent 50%), 
                    radial-gradient(ellipse at bottom, ${theme.palette.secondary.light}20, transparent 50%),
                    linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
        overflow: "auto",
      }}
    >
      <FloatingParticles />

      <Fade in={mounted} timeout={800}>
        <Paper
          elevation={12}
          sx={{
            p: { xs: 3, sm: 6 },
            borderRadius: 4,
            width: "100%",
            maxWidth: 450,
            zIndex: 1,
            position: "relative",
            backdropFilter: "blur(10px)",
            background: `${theme.palette.background.paper}f0`,
            border: `1px solid ${theme.palette.divider}40`,
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: isAnimating ? "scale(0.98)" : "scale(1)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Zoom in={mounted} timeout={600}>
            {BRAND_LOGO}
          </Zoom>

          <Slide direction="up" in={!isAnimating} timeout={400}>
            <Box textAlign="center" mb={3}>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                  letterSpacing: "-0.5px",
                }}
              >
                {isLogin ? "Welcome Back" : "Join Us"}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: "1.1rem",
                  mb: 1,
                  fontWeight: 400,
                }}
              >
                {isLogin ? "Sign in to continue" : "Create your account"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  minHeight: 20,
                  fontStyle: "italic",
                }}
              >
                {typingAnimation}
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    width: 2,
                    height: 16,
                    bgcolor: theme.palette.primary.main,
                    ml: 0.5,
                    animation: "blink 1s infinite",
                    "@keyframes blink": {
                      "0%, 50%": { opacity: 1 },
                      "51%, 100%": { opacity: 0 },
                    },
                  }}
                />
              </Typography>
            </Box>
          </Slide>

          <Stack spacing={2.5} sx={{ width: "100%" }}>
            {error && (
              <Slide direction="down" in={!!error} timeout={300}>
                <Alert
                  severity="error"
                  variant="filled"
                  sx={{
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                >
                  {error}
                </Alert>
              </Slide>
            )}

            {success && (
              <Slide direction="down" in={!!success} timeout={300}>
                <Alert
                  severity="success"
                  variant="filled"
                  sx={{
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                >
                  {success}
                </Alert>
              </Slide>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              style={{ width: "100%" }}
            >
              <Stack spacing={2.5}>
                {!isLogin && (
                  <Slide direction="right" in={!isLogin} timeout={300}>
                    <Box>
                      <EnhancedTextField
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={fieldErrors.name}
                        helperText={fieldErrors.name}
                        icon={<User />}
                        autoComplete="name"
                      />
                    </Box>
                  </Slide>
                )}

                <EnhancedTextField
                  ref={emailInputRef}
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={fieldErrors.email}
                  helperText={fieldErrors.email}
                  icon={<Mail />}
                  autoComplete="email"
                />

                <EnhancedTextField
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  error={fieldErrors.password}
                  helperText={fieldErrors.password}
                  icon={<Lock />}
                  showToggle={true}
                  showValue={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />

                {!isLogin && (
                  <Slide direction="left" in={!isLogin} timeout={400}>
                    <Box>
                      <EnhancedTextField
                        label="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type={showConfirmPassword ? "text" : "password"}
                        error={fieldErrors.confirmPassword}
                        helperText={fieldErrors.confirmPassword}
                        icon={<Lock />}
                        showToggle={true}
                        showValue={showConfirmPassword}
                        onToggle={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        autoComplete="new-password"
                      />
                    </Box>
                  </Slide>
                )}

                {!isLogin && password && (
                  <Fade in={!isLogin && !!password} timeout={300}>
                    <Box>
                      <PasswordStrengthMeter password={password} />
                    </Box>
                  </Fade>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 3,
                    py: 2,
                    fontSize: "1.1rem",
                    textTransform: "none",
                    letterSpacing: "0.5px",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 30px ${theme.palette.primary.main}60`,
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  {loading ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={20} color="inherit" />
                      Processing...
                    </Box>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>

                {isLogin && (
                  <Box textAlign="right">
                    <Button
                      variant="text"
                      size="small"
                      sx={{
                        color: theme.palette.primary.main,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                          background: `${theme.palette.primary.main}10`,
                        },
                      }}
                      onClick={() =>
                        setError("Forgot password functionality coming soon!")
                      }
                    >
                      Forgot Password?
                    </Button>
                  </Box>
                )}
              </Stack>
            </form>

            <Divider sx={{ my: 2, fontWeight: 500 }}>or</Divider>

            <Button
              onClick={handleGoogleSignIn}
              fullWidth
              variant="outlined"
              size="large"
              disabled={loading}
              sx={{
                borderRadius: 3,
                fontWeight: 600,
                py: 2,
                fontSize: "1.1rem",
                textTransform: "none",
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                background: theme.palette.background.paper,
                backdropFilter: "blur(5px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  background: `${theme.palette.primary.main}05`,
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
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
              Continue with Google
            </Button>

            <Box textAlign="center" mt={2}>
              <Typography color="text.secondary" variant="body2">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <Button
                  onClick={toggleMode}
                  sx={{
                    ml: 1,
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": {
                      background: `${theme.palette.primary.main}10`,
                    },
                  }}
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </Button>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Auth;
