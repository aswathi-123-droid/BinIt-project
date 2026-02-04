import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AdminPublicRoute = () => {
  const { admin, loading } = useSelector((state) => state.adminAuth);

  if (loading) {
    return <div>Loading...</div>;
  }


  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }


  return <Outlet />;
};

export default AdminPublicRoute;