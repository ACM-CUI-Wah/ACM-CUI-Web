import React from 'react';
import Login from '../../components/Auth/Login.jsx';

import NavbarComponent from '../../components/LandingPage/Navbar/NavbarComponent.jsx';



const LoginPage = () => {
    return (
        <div className="p-0 m-0">
            <NavbarComponent />

           
            <Login />

           
        </div>

    );
};

export default LoginPage;
