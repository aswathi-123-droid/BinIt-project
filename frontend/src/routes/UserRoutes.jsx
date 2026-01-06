import { createBrowserRouter } from "react-router-dom";
import RegisterForm from "../components/user/RegisterForm";
// import Dashboard from "../pages/Dashboard";
import UserLayout from "../layouts/userLayout";


export const router = createBrowserRouter([
  {
    path: "/register",
    element: <RegisterForm />,
  },
  
//   {
//     element: <UserLayout />,
//     children: [
//       { path: "/dashboard", element: <Dashboard /> },
//     ],
//   },
]);
