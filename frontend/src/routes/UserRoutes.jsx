import { createBrowserRouter } from "react-router-dom";
import RegisterForm from "../features/user/account/components/RegisterForm";
import VerifyEmail from "../features/user/account/components/VerifyEmail";
import EmailVerifiedSuccess from "../features/user/account/components/EmailVerifiedSucces";
import LoginPage from "../features/user/account/components/LoginPage";
import ForgotPasswordPage from "../features/user/account/components/ForgotPasswordPage";
import SetNewPasswordPage from "../features/user/account/components/SetNewPasswordPage";
import PasswordResetSent from "../features/user/account/components/passwordLinkSuccess";
import { ProtectedRoutes } from "./guards/ProtectedRoutes";
import ChangePassword from "../features/user/profile/ChangePassword/ChangePassword";
import * as Pages from "./LazyPages";
import { Suspense } from "react";
import AdminProtectedRoute from "./guards/AdminProtectedRoutes";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../features/admin/dashboard/AdminDashboard";
import PublicRoute from "./guards/PublicRoutes";
import AdminPublicRoute from "./guards/AdminPublicRoute";
import CheckoutPage from "../features/user/checkout/CheckoutPage";
import UploadTrash from "../features/user/checkout/component/UploadTrash";
import AdminOrderDetails from "../features/admin/orderManagement/OrderDetails";


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

const MyPickupsPage = () => <Pages.MyOrders mode="pickup" />;
// const MyOrdersPage = () => <Pages.MyOrders mode="order" />;
const AdminOrderManagement = () => <Pages.OrderManagement mode="order" />
const AdminPickupManagement = () => <Pages.OrderManagement mode="pickup" />
const AdminOrderDetail = () => <Pages.AdminOrderDetail mode="order" />
const AdminPickupDetail = () => <Pages.AdminOrderDetail mode="pickup" />

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
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
    ],
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        path: "/",
        element: withSuspense(Pages.UserDashboardPage),
        children: [
          {
            path: "/home",
            element: withSuspense(Pages.LandingPage)
          },
          {
            path: "/services",
            element: withSuspense(Pages.ServiceListing),
          },
          {
            path: "/about",
            element: withSuspense(Pages.PricingSection),
          },
          {
            path: "/recycling",
            element: withSuspense(Pages.RecyclingInfoSection),
          },
          {
            path: "/services/product/:id",
            element: withSuspense(Pages.ServiceDetailPage),
          },
          {
            path: "/wishlist",
            element: withSuspense(Pages.WishlistPage)
          },
          {
            path: "/cart",
            element: withSuspense(Pages.CartPage)
          },
          {
            path: "/checkout",
            element: <CheckoutPage/>
          },
          {
            path: "/profile",
            element: withSuspense(Pages.UserProfile),
            children: [
              {
                path: "my-profile",
                element: withSuspense(Pages.MyProfile),
              },
              {
                path: "change-password",
                element: <ChangePassword />,
              },
              {
                path: "my-coupon",
                element: withSuspense(Pages.MyCoupon),
              },
              {
                path: "my-address",
                element: withSuspense(Pages.MyAddresses),
              },
              {
                path: "my-orders",
                element: withSuspense(Pages.MyOrders)
              },
              {
                path: "order/:orderId",
                element: withSuspense(Pages.OrderDetails)
              },
              {
                path: "my-pickups",
                element: withSuspense(MyPickupsPage)
              },
              {
                 path: "pickup/:orderId",
                 element: withSuspense(Pages.OrderDetails)
              },
              {
                 path: "my-wallet",
                 element: withSuspense(Pages.MyWallet)
              },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <AdminProtectedRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "users",
            element: withSuspense(Pages.UserManagement),
          },
          {
            path: "categories",
            element: withSuspense(Pages.CategoryManagement),
          },
          {
            path: "services",
            element: withSuspense(Pages.ProductManagement)
          },
          {
            path: "orders",
            element: withSuspense(AdminOrderManagement)
          },
          {
            path: "orders/:id",
            element: withSuspense(AdminOrderDetail)
          },
          {
            path: "pickups",
            element: withSuspense(AdminPickupManagement)
          },
          {
            path: "pickups/:id",
            element: withSuspense(AdminPickupDetail) 
          },
          {
            path: "coupons",
            element: withSuspense(Pages.CouponManagement)
          },
        ],
      },
    ],
  },
  {
    element: <AdminPublicRoute />, 
    children: [
      {
        path: "admin/login",
        element: withSuspense(Pages.AdminLoginPage),
      },
    ]
  },
]);
