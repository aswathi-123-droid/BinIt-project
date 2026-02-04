import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate,Outlet } from "react-router-dom";



export const ProtectedRoutes=()=>{
        const {user,loading} = useSelector((state)=>state.auth);
        console.log(user)
        console.log("hiii")

    if(loading){
       return <h1>Loading....</h1>
    }
    
    if(user && user.role ==="user"){
        console.log("Login")
         return <Outlet></Outlet>
    }else{
        console.log("Inside")
          return <Navigate to = "/auth/login" replace></Navigate>
    
    }
}
