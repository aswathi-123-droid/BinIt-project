import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router-dom";


const AdminProtectedRoute = ()=>{
   const { user, loading} = useSelector(state => state.auth);

   if (loading) {
    return <div>Loading Admin Session...</div>;
   }


   if (user && user.role === "admin") {
    return <Outlet />
   }else{
    <Navigate to="/auth/login" replace></Navigate>
   }

}

export default AdminProtectedRoute;