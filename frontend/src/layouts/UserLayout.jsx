import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function UserLayout() {
  const user = useSelector((state) => state.auth.user);

  if (!user) return <Navigate to="/register" />;

  return <Outlet />;
}
