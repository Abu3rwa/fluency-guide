import React from "react";
import { Routes, Route } from "react-router-dom";
import { publicRoutes, protectedRoutes, fallbackRoute } from "../../routes";

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {/* Protected Routes */}
      {protectedRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {/* Fallback Route */}
      <Route path={fallbackRoute.path} element={fallbackRoute.element} />
    </Routes>
  );
};

export default AppRouter;
