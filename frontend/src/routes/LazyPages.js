import { lazy } from "react";



export const AdminLoginPage = lazy(() => 
  import("../features/admin/auth/adminLoginPage")
)

export const UserDashboardPage = lazy(() =>
  import("../features/user/UserDashboardPage")
)

export const ServiceListing = lazy(()=>
  import("../features/user/services/ServiceListing")
)

export const UserProfile = lazy(()=> 
  import("../features/user/profile/UserProfile")
)

export const MyProfile = lazy(()=> 
  import("../features/user/profile/myProfile/MyProfile")
)

export const MyCoupon = lazy(()=> 
  import("../features/user/profile/MyCoupon")
)

export const MyAddresses = lazy(()=> 
  import("../features/user/profile/myAddresses/MyAddresses")
)

export const UserManagement = lazy(()=> 
  import("../features/admin/customerManagement/UserManagement")
)

export const CategoryManagement = lazy(()=>
  import("../features/admin/categoryManagement/CategoryManagement")
)

export const ProductManagement = lazy(()=>
  import("../features/admin/productManagement/productManagement")
)

export const OrderManagement = lazy(()=>
  import("../features/admin/orderManagement/OrderManagement")
)

export const ServiceDetailPage = lazy(() => 
  import("../features/user/services/ServiceDetailPage")
);

export const CartPage = lazy(() => 
  import("../features/user/cart/CartPage")
);

export const MyOrders = lazy(() => 
  import("../features/user/profile/myOrders/MyOrders")
)

export const OrderDetails = lazy(() => 
  import("../features/user/profile/myOrders/OrderDetails")
)

export const AdminOrderDetail = lazy(() => 
  import("../features/admin/orderManagement/OrderDetails")
)

export const CouponManagement = lazy(()=>
  import("../features/admin/couponManagement/CouponManagement")
)

export const LandingPage = lazy(() => 
  import("../features/user/main/LandingPage")
)

export const PricingSection = lazy(() => 
  import("../features/user/main/AboutSection")
)

export const RecyclingInfoSection = lazy(() => 
  import("../features/user/main/RecyclingInfoSection")
)

export const WishlistPage = lazy(() => 
  import("../features/user/wishlist/WishlistPage")
)

export const MyWallet = lazy(() => 
  import("../features/user/profile/myWallet/MyWallet")
)






