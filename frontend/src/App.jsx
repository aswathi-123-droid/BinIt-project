import { RouterProvider } from "react-router-dom"
import {Toaster} from 'react-hot-toast'
import { router } from "./routes/UserRoutes"
import { getProfile } from "./features/user/account/authSlice"
import { useDispatch } from "react-redux"
import { useEffect } from "react";
import { getAdminProfile } from "./features/admin/auth/adminSlice";
import './App.css'

function App() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getProfile())
    dispatch(getAdminProfile());
  }, [dispatch])


  return (
    <>
     <Toaster 
        position="top-center" 
        reverseOrder={false} 
     />
     <RouterProvider router={router} />
    </>
  )
}

export default App