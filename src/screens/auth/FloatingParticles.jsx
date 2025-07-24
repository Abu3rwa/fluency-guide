import React from "react";
import { useCustomTheme } from "../../contexts/ThemeContext";

const FloatingParticles = () => {
  const { theme } = useCustomTheme();
  return (
    <div className="auth-particles">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="auth-particle"
          style={{
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}40, ${theme.palette.secondary.main}40)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${
              Math.random() * 3 + 2
            }s ease-in-out infinite alternate`,
            animationDelay: `${Math.random() * 2}s`,
            position: "absolute",
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
