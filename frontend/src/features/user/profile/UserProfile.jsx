import { Outlet } from "react-router-dom";
import ProfileSidebar from "./components/ProfileSideBar";

import React from 'react'

function UserProfile() {



  return (
   
    <div className="flex w-full">
      <ProfileSidebar />
      <main className="grow p-6">
        <Outlet />
      </main>
    </div>
  
  )
}

export default UserProfile



