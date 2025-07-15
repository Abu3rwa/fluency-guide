import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppRoutes from "./routes";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const router = createBrowserRouter(
  [
    {
      path: "/*",
      element: <AppRoutes />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
