import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const { user } = useSelector((state) => state.auth);

  // if (loading) {
  //   return null; 
  // }

  if (user) {
    return <Navigate to="/services" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;

// const PublicRoute = () => {
//   const { user, loading } = useSelector((state) => state.auth);
//   if (user) {
//     return <Navigate to="/services" replace />;
//   }
//   return (
//     <>
//       {loading && (
//          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
//            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
//          </div>
//       )}
//       <Outlet />
//     </>
//   );
// };

// export default PublicRoute;