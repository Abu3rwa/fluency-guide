import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n";
import App from "./App";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import CombinedProvider from "./contexts/CombinedProvider";
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";
import performanceMonitor from "./utils/performanceMonitor";
import "./index.css";

// Core Web Vitals monitoring
function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log("Web Vital:", metric);

  // You can send to Google Analytics, your own analytics service, etc.
  // Example: gtag('event', metric.name, metric);
}

// Initialize Core Web Vitals monitoring
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// Start performance monitoring
performanceMonitor.start();

// Register service worker for caching
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <CombinedProvider>
        <App />
      </CombinedProvider>
    </I18nextProvider>
  </React.StrictMode>
);
