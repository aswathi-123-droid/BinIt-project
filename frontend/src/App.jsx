import { RouterProvider } from "react-router-dom"
import { router } from "./routes/userRoutes"
import { getProfile } from "./features/user/account/authSlice"
import { useDispatch } from "react-redux"
import { useEffect } from "react";


function App() {
  const dispatch = useDispatch();
  
  useEffect(()=>{
    dispatch(getProfile())
  },[dispatch])

  return(<>
   <RouterProvider router={router}></RouterProvider>
  </>)
}

export default App
