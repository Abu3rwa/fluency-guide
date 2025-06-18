import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { CircularProgress, Box } from "@mui/material";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const auth = useAuth();

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const { currentUser, loading } = auth;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
