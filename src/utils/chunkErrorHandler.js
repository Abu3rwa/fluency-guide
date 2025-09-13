import React from "react";

/**
 * Chunk Loading Error Handler
 * Handles webpack chunk loading errors by refreshing the page
 */

let isRefreshing = false;

export const handleChunkError = (error) => {
  console.error("Chunk loading error:", error);

  // Check if it's a chunk loading error
  const isChunkError =
    error?.name === "ChunkLoadError" ||
    error?.message?.includes("Loading chunk") ||
    error?.message?.includes("failed");

  if (isChunkError && !isRefreshing) {
    isRefreshing = true;
    console.warn("Chunk loading failed, refreshing page...");

    // Clear any cached chunks
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (name.includes("static") || name.includes("chunk")) {
            caches.delete(name);
          }
        });
      });
    }

    // Refresh the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  return isChunkError;
};

/**
 * Enhanced lazy loading with error handling
 */
export const lazyWithRetry = (importFunc, retries = 3) => {
  return React.lazy(async () => {
    let attempt = 0;

    while (attempt < retries) {
      try {
        return await importFunc();
      } catch (error) {
        attempt++;
        console.warn(`Lazy loading attempt ${attempt} failed:`, error);

        if (attempt >= retries) {
          // If all retries failed and it's a chunk error, handle it
          if (handleChunkError(error)) {
            // Return a fallback component to prevent crash
            return {
              default: () =>
                React.createElement(
                  "div",
                  {
                    style: {
                      padding: "20px",
                      textAlign: "center",
                      color: "#666",
                    },
                  },
                  "Loading failed. Refreshing page..."
                ),
            };
          }
          throw error;
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  });
};

// Global error handler for unhandled chunk errors
window.addEventListener("error", (event) => {
  if (event.error) {
    handleChunkError(event.error);
  }
});

window.addEventListener("unhandledrejection", (event) => {
  if (event.reason) {
    handleChunkError(event.reason);
  }
});
