import { createBrowserRouter } from "react-router-dom";
import RegisterForm from "../features/user/account/components/RegisterForm";
import VerifyEmail from "../features/user/account/components/VerifyEmail";
import EmailVerifiedSuccess from "../features/user/account/components/EmailVerifiedSucces";
import LoginPage from "../features/user/account/components/LoginPage";
import ForgotPasswordPage from "../features/user/account/components/ForgotPasswordPage";
import SetNewPasswordPage from "../features/user/account/components/SetNewPasswordPage";
import PasswordResetSent from "../features/user/account/components/passwordLinkSuccess";
// import ServiceListing from "../features/user/services/ServiceListing";
// import UserDashboardPage from "../features/user/userDashboardPage";
import { ProtectedRoutes } from "./ProtectedRoutes";
import UserProfile from "../features/user/profile/UserProfile";
// import MyProfile from "../features/user/profile/myProfile/MyProfile";
import ChangePassword from "../features/user/profile/ChangePassword/ChangePassword";
// import MyAddresses from "../features/user/profile/myAddresses/MyAddresses";
import * as Pages from "./LazyPages"
import { Suspense } from "react";

const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

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
    path: "admin/login",
    element:withSuspense(Pages.AdminLoginPage)
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
        element: withSuspense(Pages.UserDashboardPage),
        children: [
          {
            path: "/services",
            element: withSuspense(Pages.ServiceListing )
          },
          {
            path: "/profile",
            element: <UserProfile/>,
            children :[
              {
                path:"my-profile",
                element: withSuspense(Pages.MyProfile)
              },
              {
                path:"change-password",
                element:<ChangePassword/>
              },
              {
                path:"my-address",
                element:withSuspense(Pages.MyAddresses)
              }
            ]
          }
        ],
      },
    ],
  },
]);
