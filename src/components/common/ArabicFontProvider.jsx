import React, { createContext, useContext, useState } from "react";
import { styled } from "@mui/material/styles";

// Font Context
const FontContext = createContext();

export const useFont = () => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
};

// Styled Components for each font
export const TajawalText = styled("div")({
  fontFamily: "var(--font-tajawal)",
});

export const CairoText = styled("div")({
  fontFamily: "var(--font-cairo)",
});

export const AlexandriaText = styled("div")({
  fontFamily: "var(--font-alexandria)",
});

export const AmiriText = styled("div")({
  fontFamily: "var(--font-amiri)",
});

export const NotoSerifText = styled("div")({
  fontFamily: "var(--font-noto-serif)",
});

export const DMSerifText = styled("div")({
  fontFamily: "var(--font-dm-serif)",
});

// Font Provider Component
export const FontProvider = ({ children }) => {
  const [currentFont, setCurrentFont] = useState("tajawal");

  const fonts = {
    tajawal: {
      name: "Tajawal",
      family: "var(--font-tajawal)",
      description: "Modern geometric sans-serif Arabic typeface",
    },
    cairo: {
      name: "Cairo",
      family: "var(--font-cairo)",
      description: "Contemporary Arabic font with clean aesthetic",
    },
    alexandria: {
      name: "Alexandria",
      family: "var(--font-alexandria)",
      description: "Modern Arabic font with excellent readability",
    },
    amiri: {
      name: "Amiri",
      family: "var(--font-amiri)",
      description:
        "Classic elegant font based on traditional Naskh calligraphy",
    },
    notoSerif: {
      name: "Noto Serif",
      family: "var(--font-noto-serif)",
      description: "Serif font with excellent Arabic support",
    },
    dmSerif: {
      name: "DM Serif Text",
      family: "var(--font-dm-serif)",
      description: "Elegant serif font for formal content",
    },
  };

  const value = {
    currentFont,
    setCurrentFont,
    fonts,
    getCurrentFontFamily: () => fonts[currentFont].family,
    getCurrentFontName: () => fonts[currentFont].name,
  };

  return <FontContext.Provider value={value}>{children}</FontContext.Provider>;
};

// Font Selector Component
export const FontSelector = () => {
  const { currentFont, setCurrentFont, fonts } = useFont();

  return (
    <div style={{ margin: "1rem 0" }}>
      <label htmlFor="font-selector" style={{ marginRight: "1rem" }}>
        Select Arabic Font:
      </label>
      <select
        id="font-selector"
        value={currentFont}
        onChange={(e) => setCurrentFont(e.target.value)}
        style={{
          padding: "0.5rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
          fontFamily: "var(--font-tajawal)",
        }}
      >
        {Object.entries(fonts).map(([key, font]) => (
          <option key={key} value={key}>
            {font.name} - {font.description}
          </option>
        ))}
      </select>
    </div>
  );
};

// Font Preview Component
export const FontPreview = ({ text = "مرحبا بالعالم - Hello World" }) => {
  const { currentFont, fonts } = useFont();

  return (
    <div
      style={{
        margin: "1rem 0",
        padding: "1rem",
        border: "1px solid #eee",
        borderRadius: "8px",
      }}
    >
      <h3>Font Preview: {fonts[currentFont].name}</h3>
      <p
        style={{
          fontFamily: fonts[currentFont].family,
          fontSize: "1.2rem",
          lineHeight: "1.6",
          direction: "rtl",
        }}
      >
        {text}
      </p>
      <p
        style={{
          fontFamily: fonts[currentFont].family,
          fontSize: "1rem",
          lineHeight: "1.4",
          direction: "rtl",
          fontWeight: "bold",
        }}
      >
        النص العربي مع الخط المحدد
      </p>
    </div>
  );
};

export default FontProvider;
