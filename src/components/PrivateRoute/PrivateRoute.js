import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const auth = useAuth();

  if (!auth) {
    return <Navigate to="/login" />;
  }

  const { currentUser, loading } = auth;

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
