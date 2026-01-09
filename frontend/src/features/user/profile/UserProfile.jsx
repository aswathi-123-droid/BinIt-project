import { Outlet } from "react-router-dom";
import ProfileSidebar from "./components/ProfileSideBar";

import React from 'react'

function UserProfile() {
  return (
   
    <div className=" w-full"> 
       <div className="flex justify-center ">
      <ProfileSidebar></ProfileSidebar>
      <Outlet></Outlet>
        </div>
    </div>
  
  )
}

export default UserProfile
