import React from 'react';
import Navbar from './components/Navbar';
import { Outlet } from 'react-router-dom';
import Footer from './components/Footer';

function UserDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">   
        <Navbar></Navbar>
        <div className="grow">
          <Outlet></Outlet>
        </div>
        <Footer></Footer>
    </div>
  )
}

export default UserDashboardPage
