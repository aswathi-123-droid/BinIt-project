import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return null; 
  }

  if (user) {
    return <Navigate to="/services" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;