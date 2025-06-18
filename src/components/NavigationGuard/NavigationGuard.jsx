import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTES } from "../../routes/constants";

const NavigationGuard = ({ children, requiredRole }) => {
  const location = useLocation();
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return null; // or a loading spinner
  }

  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requiredRole && !userData?.[requiredRole]) {
    return <Navigate to={ROUTES.LANDING} replace />;
  }

  return children;
};

export default NavigationGuard;
