import { createBrowserRouter } from "react-router-dom";
import RegisterForm from "../features/user/account/components/RegisterForm";
import VerifyEmail from "../features/user/account/components/VerifyEmail";
import EmailVerifiedSuccess from "../features/user/account/components/EmailVerifiedSucces";
import LoginPage from "../features/user/account/components/LoginPage";
import ForgotPasswordPage from "../features/user/account/components/ForgotPasswordPage";
import SetNewPasswordPage from "../features/user/account/components/SetNewPasswordPage";
import PasswordResetSent from "../features/user/account/components/passwordLinkSuccess";
import ServiceListing from "../features/user/services/ServiceListing";
import UserDashboardPage from "../features/user/userDashboardPage";
import { ProtectedRoutes } from "./ProtectedRoutes";
import UserProfile from "../features/user/profile/UserProfile";
import MyProfile from "../features/user/profile/myProfile/MyProfile";
// import Dashboard from "../pages/Dashboard";
import UserLayout from "../layouts/userLayout";

export const router = createBrowserRouter([
  {
    path: "/auth/register",
    element: <RegisterForm />,
  },
  {
    path: "/auth/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/auth/verifysuccess",
    element: <EmailVerifiedSuccess />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/auth/link-success",
    element: <PasswordResetSent />,
  },
  {
    path: "/auth/reset-password/:token",
    element: <SetNewPasswordPage />,
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        path: "/",
        element: <UserDashboardPage />,
        children: [
          {
            path: "/services",
            element: <ServiceListing/>
          },
          {
            path: "/profile",
            element: <UserProfile/>,
            children :[
              {
                path:"my-profile",
                element: <MyProfile/>
              }
            ]
          }
        ],
      },
    ],
  },
  //   {
  //     element: <UserLayout />,
  //     children: [
  //       { path: "/dashboard", element: <Dashboard /> },
  //     ],
  //   },
]);
