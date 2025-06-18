import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { styled } from "@mui/material/styles";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
};

// Styled components
const AuthContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(135deg, #1a237e 0%, #008080 100%)",

  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
    animation: "pulse 8s ease-in-out infinite",
  },
  "@keyframes pulse": {
    "0%": { transform: "scale(1)", opacity: 0.5 },
    "50%": { transform: "scale(1.2)", opacity: 0.8 },
    "100%": { transform: "scale(1)", opacity: 0.5 },
  },
}));

const AuthPaper = styled(motion(Paper))(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 24,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
  background: "rgb(248, 255, 254)",
  width: "100%",
  maxWidth: 450,
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #1a237e, #008080)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(45deg, rgba(26, 35, 126, 0.05) 0%, rgba(0, 128, 128, 0.05) 100%)",
    zIndex: -1,
  },
}));

const FloatingShape = styled(motion.div)(({ theme }) => ({
  position: "absolute",
  borderRadius: "50%",
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(5px)",
  zIndex: 0,
}));

const SocialButton = styled(motion(Button))(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  textTransform: "none",
  fontSize: "1rem",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover::before": {
    opacity: 1,
  },
}));

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const controls = useAnimation();

  // Floating shapes animation
  useEffect(() => {
    const shapes = [
      { size: 100, x: "10%", y: "20%" },
      { size: 150, x: "80%", y: "30%" },
      { size: 80, x: "20%", y: "70%" },
      { size: 120, x: "70%", y: "80%" },
    ];

    shapes.forEach((shape, index) => {
      controls.start({
        x: [0, 20, 0],
        y: [0, 30, 0],
        transition: {
          duration: 5 + index,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        },
      });
    });
  }, [controls]);

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Create user profile in Firestore
        await createUserInFirestore(email, name, false);
      }
      navigate("/");
    } catch (error) {
      console.error("Auth error:", error);
      setError(
        error.code === "auth/user-not-found"
          ? "No account found with this email"
          : error.code === "auth/wrong-password"
          ? "Incorrect password"
          : error.code === "auth/email-already-in-use"
          ? "Email already in use"
          : "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError("");
    setLoading(true);

    try {
      const authProvider = new GoogleAuthProvider();
      // Add custom parameters for Google sign-in
      authProvider.setCustomParameters({
        prompt: "select_account",
        authType: "signInWithPopup",
      });

      const result = await signInWithPopup(auth, authProvider);
      const user = result.user;

      // Create or update user profile in Firestore
      await createUserInFirestore(
        user.email,
        user.displayName || user.email.split("@")[0],
        false
      );

      navigate("/");
    } catch (error) {
      console.error("Social login error:", error);
      if (error.code === "auth/popup-blocked") {
        setError("Please allow popups for this website to sign in with Google");
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled. Please try again.");
      } else if (error.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized. Please contact support.");
      } else {
        setError(`Failed to sign in with Google: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const createUserInFirestore = async (email, name, isAdmin) => {
    try {
      await setDoc(doc(db, "users", email), {
        email,
        name,
        isAdmin,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error creating user in Firestore:", error);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setError(null);
      // Show success message
      setError("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to send password reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer maxWidth={false}>
      {/* Floating shapes */}
      {[0, 1, 2, 3].map((index) => (
        <FloatingShape
          key={index}
          animate={controls}
          style={{
            width: [100, 150, 80, 120][index],
            height: [100, 150, 80, 120][index],
            left: ["10%", "80%", "20%", "70%"][index],
            top: ["20%", "30%", "70%", "80%"][index],
          }}
        />
      ))}

      <AnimatePresence mode="wait">
        <AuthPaper
          key={isLogin ? "login" : "signup"}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -20 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 4,
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            >
              <SchoolIcon
                sx={{
                  fontSize: 64,
                  color: "primary.main",
                  mb: 2,
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                }}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: "linear-gradient(45deg, #1a237e, #008080)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textAlign: "center",
                }}
              >
                {isLogin ? "Welcome Back!" : "Create Account"}
              </Typography>
            </motion.div>
          </Box>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <motion.div variants={itemVariants}>
              {!isLogin && (
                <TextField
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background:
                    "linear-gradient(45deg, #1a237e 30%, #008080 90%)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #008080 30%, #1a237e 90%)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                    transform: "translateY(-2px)",
                  },
                  "&:active": { transform: "translateY(0)" },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Sign Up"
                )}
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
            </motion.div>

            <motion.div variants={itemVariants}>
              <SocialButton
                variant="contained"
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
                startIcon={<GoogleIcon />}
                sx={{
                  background: "#fff",
                  color: "#757575",
                  border: "1px solid #ddd",
                  "&:hover": { background: "#f5f5f5" },
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue with Google
              </SocialButton>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Button
                  onClick={() => setIsLogin(!isLogin)}
                  sx={{
                    color: "primary.main",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Sign In"}
                </Button>
              </Box>
            </motion.div>

            {isLogin && (
              <motion.div variants={itemVariants}>
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Button
                    onClick={handleForgotPassword}
                    sx={{
                      color: "text.secondary",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Forgot Password?
                  </Button>
                </Box>
              </motion.div>
            )}
          </form>
        </AuthPaper>
      </AnimatePresence>
    </AuthContainer>
  );
};

export default LoginScreen;
