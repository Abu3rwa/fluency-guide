import React, { useState, useEffect, useRef } from "react";
import { Mail, Lock, Eye, EyeOff, User, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useCustomTheme } from "../contexts/ThemeContext";
import "./auth.css";
import BrandLogo from "./auth/BrandLogo";
import FloatingParticles from "./auth/FloatingParticles";
import { validateEmail } from "./auth/utils";

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
        navigate(`/student/profile/${userData.id}`, { replace: true });
      } else {
        const timeout = setTimeout(() => {
          if (userData.id) {
            navigate(`/student/profile/${userData.id}`, { replace: true });
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
      errors.email = t("validation.emailRequired", "Email is required");
    else if (!validateEmail(email))
      errors.email = t("validation.invalidEmail", "Invalid email format");
    if (!password)
      errors.password = t(
        "validation.passwordRequired",
        "Password is required"
      );
    else if (password.length < 6)
      errors.password = t(
        "validation.shortPassword",
        "Password must be at least 6 characters"
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
        setSuccess(
          t("auth.signupSuccess", "Account created! You can now sign in.")
        );
        navigate("/student/profile");
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

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccess(
        t("auth.googleSuccess", "Google sign-in successful! Redirecting...")
      );
    } catch (err) {
      setError(t("auth.googleFailed", "Google sign-in failed"));
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
    <div className="auth-container">
      <FloatingParticles />
      <div className="auth-paper">
        <BrandLogo />
        <div className="auth-header">
          <h2 className="auth-title">{isLogin ? "Welcome Back" : "Join Us"}</h2>
          <p className="auth-subtitle">
            {isLogin ? "Sign in to continue" : "Create your account"}
          </p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="name">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={20} className="auth-icon" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className={
                    fieldErrors.name ? "auth-input error" : "auth-input"
                  }
                  onFocus={() => setFocusedField("Full Name")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              {fieldErrors.name && (
                <div className="auth-helper error">{fieldErrors.name}</div>
              )}
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="email">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={20} className="auth-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={
                  fieldErrors.email ? "auth-input error" : "auth-input"
                }
                ref={emailInputRef}
                onFocus={() => setFocusedField("Email Address")}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            {fieldErrors.email && (
              <div className="auth-helper error">{fieldErrors.email}</div>
            )}
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={20} className="auth-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className={
                  fieldErrors.password ? "auth-input error" : "auth-input"
                }
                onFocus={() => setFocusedField("Password")}
                onBlur={() => setFocusedField(null)}
              />
              <button
                type="button"
                className="auth-toggle-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {fieldErrors.password && (
              <div className="auth-helper error">{fieldErrors.password}</div>
            )}
          </div>
          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock size={20} className="auth-icon" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className={
                    fieldErrors.confirmPassword
                      ? "auth-input error"
                      : "auth-input"
                  }
                  onFocus={() => setFocusedField("Confirm Password")}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  className="auth-toggle-btn"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <div className="auth-helper error">
                  {fieldErrors.confirmPassword}
                </div>
              )}
            </div>
          )}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
          {isLogin && (
            <div className="auth-forgot">
              <button
                type="button"
                className="auth-forgot-btn"
                onClick={() =>
                  setError("Forgot password functionality coming soon!")
                }
              >
                Forgot Password?
              </button>
            </div>
          )}
        </form>
        <div className="auth-divider">or</div>
        <button
          onClick={handleGoogleSignIn}
          className="auth-google-btn"
          disabled={loading}
        >
          <span className="auth-google-icon">
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
          </span>
          Continue with Google
        </button>
        <div className="auth-toggle">
          <span>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="auth-switch-btn"
              onClick={toggleMode}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
