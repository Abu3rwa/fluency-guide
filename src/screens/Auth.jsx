import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Fade,
  Slide,
  alpha,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/constants";
import { useTheme } from "../theme/ThemeContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate(ROUTES.LANDING);
      } else {
        if (password !== confirmPassword) {
          throw new Error(t("auth.signup.errors.passwordMismatch"));
        }
        await signup(email, password);
        navigate(ROUTES.LANDING);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Slide
          direction={isLogin ? "left" : "right"}
          in={true}
          mountOnEnter
          unmountOnExit
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: "100%",
              background: `linear-gradient(45deg, ${alpha(
                theme.palette.background.paper,
                0.9
              )} 30%, ${alpha(theme.palette.background.paper, 0.95)} 90%)`,
              backdropFilter: "blur(10px)",
              borderRadius: theme.shape.borderRadius,
            }}
          >
            <Fade in={true}>
              <Box component="form" onSubmit={handleSubmit}>
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  sx={{
                    textAlign: "center",
                    fontWeight: 700,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {isLogin ? t("auth.login") : t("auth.signup.title")}
                </Typography>

                {error && (
                  <Typography
                    color="error"
                    sx={{
                      mb: 2,
                      textAlign: "center",
                      color: theme.palette.error.main,
                    }}
                  >
                    {error}
                  </Typography>
                )}

                <TextField
                  fullWidth
                  label={t("auth.email")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: theme.palette.divider,
                      },
                      "&:hover fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label={t("auth.password")}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: theme.palette.divider,
                      },
                      "&:hover fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />

                {!isLogin && (
                  <TextField
                    fullWidth
                    label={t("auth.confirmPassword")}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: theme.palette.divider,
                        },
                        "&:hover fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
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
                    mb: 2,
                    background: `linear-gradient(45deg, ${theme.palette.secondary.light} 30%, ${theme.palette.primary.light} 90%)`,
                    "&:hover": {
                      background: `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.secondary.light} 90%)`,
                    },
                  }}
                >
                  {isLogin ? t("auth.login") : t("auth.signup.title")}
                </Button>

                <Box sx={{ textAlign: "center" }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={toggleMode}
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {isLogin ? t("auth.signup.prompt") : t("auth.loginPrompt")}
                  </Link>
                </Box>
              </Box>
            </Fade>
          </Paper>
        </Slide>
      </Box>
    </Container>
  );
};

export default Auth;
