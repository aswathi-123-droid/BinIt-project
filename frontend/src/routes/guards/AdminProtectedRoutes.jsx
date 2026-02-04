import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router-dom";


const AdminProtectedRoute = ()=>{
   const { admin, loading} = useSelector(state => state.adminAuth);
   console.log(admin)

   console.log(loading)
   if (loading) {
    return <div>Loading Admin Session...</div>;
   }


   if (admin && admin.role === "admin") {
      console.log("inside  dsh")
    return <Outlet />
   }else{
      console.log("inside login")
    return <Navigate to="/admin/login" replace></Navigate>
   }

}

export default AdminProtectedRoute;