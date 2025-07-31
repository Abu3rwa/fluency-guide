import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppRoutes from "./routes";
import ErrorBoundary from "./components/ErrorBoundary";
import CombinedProvider from "./contexts/CombinedProvider";
import "./index.css";

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
      <CombinedProvider>
        <RouterProvider router={router} />
      </CombinedProvider>
    </ErrorBoundary>
  );
}

export default App;
