import { RouterProvider } from "react-router-dom"
import { router } from "./routes/UserRoutes"
import { getProfile } from "./features/user/account/authSlice"
import { useDispatch } from "react-redux"
import { useEffect } from "react";
import './App.css'

function App() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getProfile())
  }, [dispatch])

  return (
    <RouterProvider router={router} />
  )
}

export default App