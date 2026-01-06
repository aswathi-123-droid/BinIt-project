import { createBrowserRouter } from "react-router-dom";
import RegisterForm from "../components/user/RegisterForm";
import VerifyEmail from "../components/user/VerifyEmail";
import EmailVerifiedSuccess from "../components/user/EmailVerifiedSucces";
import LoginPage from "../components/user/LoginPage";
import ForgotPasswordPage from "../components/user/ForgotPasswordPage";
// import Dashboard from "../pages/Dashboard";
import UserLayout from "../layouts/userLayout";


export const router = createBrowserRouter([
  {
    path: "/auth/register",
    element: <RegisterForm />,
  },
  {
    path : "/auth/verify-email",
    element: <VerifyEmail />
  },
  {
    path : "/auth/verifysuccess",
    element:<EmailVerifiedSuccess />
  },
  {
    path : "/auth/login",
    element:<LoginPage />
  },
  {
    path : "/auth/forgot-password",
    element:<ForgotPasswordPage />
  }
//   {
//     element: <UserLayout />,
//     children: [
//       { path: "/dashboard", element: <Dashboard /> },
//     ],
//   },
]);
