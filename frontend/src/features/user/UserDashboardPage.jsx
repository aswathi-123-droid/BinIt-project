import React from 'react';
import Navbar from './components/Navbar';
import { Outlet } from 'react-router-dom';
import Footer from './components/Footer';

function UserDashboardPage() {
  return (
    <div>   
        <Navbar></Navbar>
        <div>
          <Outlet></Outlet>
        </div>
        <Footer></Footer>
    </div>
  )
}

export default UserDashboardPage
