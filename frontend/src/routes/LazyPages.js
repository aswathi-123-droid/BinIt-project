import { lazy } from "react";



export const AdminLoginPage = lazy(() => 
  import("../features/admin/auth/adminLoginPage")
)

export const UserDashboardPage = lazy(() =>
  import("../features/user/userDashboardPage")
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

export const MyAddresses = lazy(()=> 
  import("../features/user/profile/myAddresses/MyAddresses")
)

export const UserManagement = lazy(()=> 
  import("../features/admin/customerManagement/UserManagement")
)

export const CategoryManagement = lazy(()=>
  import("../features/admin/categoryManagement/CategoryManagement")
)




